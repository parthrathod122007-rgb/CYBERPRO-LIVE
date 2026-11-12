import http.client
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import unittest


def _free_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


class TestVercelServerlessEntrypoint(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cls.tmp_dir = tempfile.mkdtemp(prefix="cyberpro_vercel_test_")
        cls.port = _free_port()
        cls.host = "127.0.0.1"

        # Simulate Vercel runtime environment where VERCEL=1 forces /tmp runtime DB
        # and secure/proxy defaults, while binding local test HTTP over loopback.
        script = (
            "import os, sys; "
            f"sys.path.insert(0, {cls.root!r}); "
            "from http.server import ThreadingHTTPServer; "
            "from api.index import handler; "
            f"srv = ThreadingHTTPServer(({cls.host!r}, {cls.port}), handler); "
            "srv.serve_forever()"
        )
        env = dict(
            os.environ,
            VERCEL="1",
            CYBERPRO_DB=os.path.join(cls.tmp_dir, "vercel_tmp.db"),
            CYBERPRO_COOKIE_SECURE="0",
            CYBERPRO_TRUST_PROXY="1",
            CLOUDFLARE_TURNSTILE_ENABLED="1",
            CYBERPRO_ADMIN_EMAIL="vercel_admin@example.com",
            CYBERPRO_ADMIN_PASSWORD="VercelAdminPass@2026",
        )
        cls.srv = subprocess.Popen(
            [sys.executable, "-c", script],
            env=env,
            cwd=cls.root,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        for _ in range(60):
            try:
                socket.create_connection((cls.host, cls.port), 0.2).close()
                break
            except OSError:
                time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        if getattr(cls, "srv", None):
            cls.srv.terminate()
            cls.srv.wait(timeout=5)
        if getattr(cls, "tmp_dir", None):
            shutil.rmtree(cls.tmp_dir, ignore_errors=True)

    def req(self, method, path, body=None, cookie=None):
        c = http.client.HTTPConnection(self.host, self.port, timeout=10)
        headers = {"Content-Type": "application/json", "X-Forwarded-For": "203.0.113.9"}
        if cookie:
            headers["Cookie"] = cookie
        payload = json.dumps(body) if body is not None else None
        c.request(method, path, payload, headers)
        res = c.getresponse()
        raw = res.read().decode("utf-8", errors="ignore")
        return res.status, dict(res.getheaders()), raw

    def test_01_vercel_handler_health_and_configs(self):
        st, _, raw = self.req("GET", "/healthz")
        self.assertEqual(st, 200)
        self.assertTrue(json.loads(raw).get("ok"))

        st2, _, raw2 = self.req("GET", "/api/chat/config")
        self.assertEqual(st2, 200)
        self.assertTrue(json.loads(raw2).get("enabled"))

    def test_02_vercel_handler_redirects_protected_portals(self):
        st_lms, hdrs_lms, _ = self.req("GET", "/lms")
        self.assertEqual(st_lms, 302)
        self.assertEqual(hdrs_lms.get("Location"), "/?login=1")

        st_admin, hdrs_admin, _ = self.req("GET", "/admin")
        self.assertEqual(st_admin, 302)
        self.assertEqual(hdrs_admin.get("Location"), "/staff-login")

    def test_03_vercel_env_admin_login_and_4_mode_chat(self):
        st_login, hdrs_login, raw_login = self.req("POST", "/api/login", {
            "email": "vercel_admin@example.com",
            "password": "VercelAdminPass@2026",
            "role": "admin",
            "cf-turnstile-response": "1x00000000_vercel_test"
        })
        self.assertEqual(st_login, 200)
        self.assertTrue(json.loads(raw_login).get("ok"))
        cookie = hdrs_login.get("Set-Cookie")
        self.assertTrue(bool(cookie))

        st_admin, _, raw_admin = self.req("GET", "/admin", cookie=cookie)
        self.assertEqual(st_admin, 200)
        self.assertIn("CYBERPRO", raw_admin)

        st_chat, _, raw_chat = self.req("POST", "/api/chat", {
            "message": "Where is the dashboard?",
            "mode": "cyberpro",
            "history": []
        })
        self.assertEqual(st_chat, 200)
        self.assertIn("Student LMS", json.loads(raw_chat).get("reply", ""))


if __name__ == "__main__":
    unittest.main()
