"""API / security tests. Spawns the real server on a throwaway DB. Run: python3 tests/test_api.py"""
import http.client, json, os, secrets, subprocess, sys, tempfile, time, socket


def main():
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    def free_port():
        s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p

    tmp = tempfile.mkdtemp(); PORT = free_port()
    env = dict(os.environ, CYBERPRO_DB=os.path.join(tmp, "t.db"), CYBERPRO_PORT=str(PORT))
    PW = secrets.token_urlsafe(12)
    def manage(*a, stdin=None):
        return subprocess.run([sys.executable, os.path.join(ROOT, "manage_users.py"), *a], input=stdin, text=True, capture_output=True, env=env, cwd=ROOT)
    assert manage("add", "stu@example.com", "--name", "Stu Dent", "--password-stdin", stdin=PW + "\n").returncode == 0
    assert manage("add", "off@example.com", "--password-stdin", stdin=PW + "\n").returncode == 0
    assert manage("disable", "off@example.com").returncode == 0
    assert manage("add", "weak@example.com", "--password-stdin", stdin="short\n").returncode != 0, "weak password must be refused"
    srv = subprocess.Popen([sys.executable, os.path.join(ROOT, "server.py")], env=env, cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try: socket.create_connection(("127.0.0.1", PORT), 0.2).close(); break
        except OSError: time.sleep(0.1)

    def req(method, path, body=None, headers=None, cookie=None):
        c = http.client.HTTPConnection("127.0.0.1", PORT, timeout=10)
        h = dict(headers or {})
        if cookie: h["Cookie"] = cookie
        if body is not None and "Content-Type" not in h: h["Content-Type"] = "application/json"
        c.request(method, path, body if isinstance(body, (str, bytes)) or body is None else json.dumps(body), h)
        r = c.getresponse(); data = r.read(); return r.status, dict((k.lower(), v) for k, v in r.getheaders()), data

    fails = []
    def check(name, cond):
        print(("PASS " if cond else "FAIL ") + name); 
        if not cond: fails.append(name)

    try:
        s, h, b = req("GET", "/")
        check("public page served", s == 200 and b"landing-page" in b)
        check("public page contains NO LMS markup/data", b"view-dashboard" not in b and b"id=\"lms-app\"" not in b and b"view-courses" not in b and b"parthrathod" not in b and b"nav-btn-" not in b)
        for p in ("/lms", "/lms/", "/lms/anything"):
            s, h, b = req("GET", p); check(f"{p} without session redirects to login", s == 302 and h["location"] == "/?login=1" and b"view-dashboard" not in b)
        check("/api/me unauthenticated = 401", req("GET", "/api/me")[0] == 401)
        for bad in ("/private/lms.html", "/server.py", "/data/cyberpro.db", "/assets/../server.py", "/assets/%2e%2e/server.py", "/assets/..%2fprivate/lms.html", "/manage_users.py"):
            check(f"not exposed: {bad}", req("GET", bad)[0] == 404)

        s, h, b = req("POST", "/api/login", {"email": "stu@example.com", "password": "wrong-password"})
        s2, _, b2 = req("POST", "/api/login", {"email": "nobody@example.com", "password": "wrong-password"})
        check("wrong password -> 401", s == 401)
        check("unknown email -> identical 401 (no user enumeration)", s2 == 401 and b == b2)
        s, _, _ = req("POST", "/api/login", {"email": "off@example.com", "password": PW}); check("disabled account cannot sign in", s == 401)
        s, _, _ = req("POST", "/api/login", "email=stu@example.com&password=x", {"Content-Type": "application/x-www-form-urlencoded"}); check("form-encoded login rejected", s == 400)
        s, _, _ = req("POST", "/api/login", {"email": "stu@example.com", "password": PW}, {"Origin": "http://evil.example"}); check("cross-origin login blocked", s == 403)
        s, _, _ = req("POST", "/api/login", {"email": "", "password": ""}); check("empty credentials -> 400", s == 400)

        s, h, b = req("POST", "/api/login", {"email": "STU@example.com", "password": PW})
        ck = h.get("set-cookie", "")
        check("valid login -> 200 (email case-insensitive)", s == 200 and json.loads(b)["redirect"] == "/lms")
        check("session cookie is HttpOnly + SameSite=Lax", "HttpOnly" in ck and "SameSite=Lax" in ck and ck.startswith("cp_session="))
        cookie = ck.split(";")[0]
        s, h, b = req("GET", "/lms", cookie=cookie)
        check("authenticated /lms serves the real LMS", s == 200 and b"view-dashboard" in b and h["cache-control"] == "no-store")
        s, _, b = req("GET", "/lms/profile", cookie=cookie); check("deep link /lms/profile works (refresh-safe)", s == 200 and b"view-dashboard" in b)
        s, _, b = req("GET", "/api/me", cookie=cookie); check("/api/me returns user", s == 200 and json.loads(b) == {"email": "stu@example.com", "name": "Stu Dent"})
        s, _, _ = req("GET", "/lms", cookie="cp_session=forged-token"); check("forged cookie rejected", s == 302)

        s, h, _ = req("POST", "/api/logout", "{}", cookie=cookie)
        check("logout clears cookie", s == 200 and "Max-Age=0" in h.get("set-cookie", ""))
        s, _, _ = req("GET", "/lms", cookie=cookie); check("old session token is revoked server-side after logout", s == 302)

        manage("passwd", "stu@example.com") if False else None
        # rate limiting (fresh email so earlier failures don't interfere)
        codes = [req("POST", "/api/login", {"email": "rl@example.com", "password": "nope-nope"})[0] for _ in range(7)]
        check("brute force throttled (5 failures -> 429)", codes[:5] == [401] * 5 and 429 in codes[5:])
        s, _, _ = req("POST", "/api/login", {"email": "rl@example.com", "password": PW}); check("lockout also blocks further guesses", s == 429)
    finally:
        srv.terminate()
    print("\n%d failed" % len(fails) if fails else "\nALL API TESTS PASSED")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
