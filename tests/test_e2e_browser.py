"""Headless-browser end-to-end test: website -> LMS LOGIN -> auth -> LMS -> every sidebar section -> reload -> logout -> guard.
Tailwind's CDN script is stubbed (no internet in CI): layout/visuals are NOT verified here, behaviour is.
Run: python3 tests/test_e2e_browser.py"""
import os, secrets, socket, subprocess, sys, tempfile, time


def main():
    from playwright.sync_api import sync_playwright
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    s = socket.socket(); s.bind(("127.0.0.1", 0)); PORT = s.getsockname()[1]; s.close()
    tmp = tempfile.mkdtemp(); PW = secrets.token_urlsafe(12); BASE = f"http://127.0.0.1:{PORT}"
    env = dict(os.environ, CYBERPRO_DB=os.path.join(tmp, "e2e.db"), CYBERPRO_PORT=str(PORT))
    subprocess.run([sys.executable, os.path.join(ROOT, "manage_users.py"), "add", "e2e@example.com", "--name", "E2E Student", "--password-stdin"], input=PW + "\n", text=True, env=env, cwd=ROOT, check=True, capture_output=True)
    srv = subprocess.Popen([sys.executable, os.path.join(ROOT, "server.py")], env=env, cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try: socket.create_connection(("127.0.0.1", PORT), 0.2).close(); break
        except OSError: time.sleep(0.1)

    STUB_CSS = ".hidden{display:none!important}.flex{display:flex}.block{display:block}"
    fails = []
    def check(name, cond, extra=""):
        print(("PASS " if cond else "FAIL ") + name + (f"  [{extra}]" if (extra and not cond) else ""))
        if not cond: fails.append(name)

    def run(pw, viewport, tag):
        b = pw.chromium.launch(); ctx = b.new_context(viewport=viewport); page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        page.on("console", lambda m: errors.append("console: " + m.text) if m.type == "error" and "ERR_" not in m.text and "401" not in m.text and "Failed to load resource" not in m.text else None)
        page.route("**/cdn.tailwindcss.com/**", lambda r: r.fulfill(content_type="application/javascript", body=f"window.tailwind={{}};var s=document.createElement('style');s.textContent='{STUB_CSS}';document.head.appendChild(s);"))
        page.route("**/fonts.googleapis.com/**", lambda r: r.fulfill(content_type="text/css", body=""))
        page.route("**/fonts.gstatic.com/**", lambda r: r.abort())

        page.goto(BASE + "/"); page.wait_for_selector("#btn-show-login", timeout=8000)
        check(f"[{tag}] landing page loads, official logo present", page.locator("img[src='/assets/logo-mark.png']").count() >= 1)
        check(f"[{tag}] landing page has no LMS DOM", page.locator("#lms-app").count() == 0)
        page.wait_for_timeout(2500)  # splash
        page.click("#btn-show-login"); page.wait_for_selector("#login-form input[type=email]", state="visible")
        check(f"[{tag}] login modal opens with empty, editable fields", page.input_value("#login-form input[type=email]") == "" and page.input_value("#login-form input[type=password]") == "")
        page.click("#login-form button[type=submit]")
        check(f"[{tag}] empty submit shows validation errors", "email" in page.inner_text("#login-form").lower() and page.url.endswith("/"))
        page.fill("#login-form input[type=email]", "e2e@example.com"); page.fill("#login-form input[type=password]", "totally-wrong")
        page.click("#login-form button[type=submit]"); page.wait_for_selector(".m-err-form.m-show", timeout=5000)
        check(f"[{tag}] wrong password -> server error shown, stays on site", "Incorrect email or password" in page.inner_text(".m-err-form") and "/lms" not in page.url)
        page.fill("#login-form input[type=password]", PW); page.click("#login-form button[type=submit]")
        page.wait_for_url("**/lms", timeout=8000)
        page.wait_for_function("document.getElementById('lms-app') && !document.getElementById('lms-app').classList.contains('hidden')", timeout=8000)
        check(f"[{tag}] valid login lands in LMS", page.url.endswith("/lms"))
        page.wait_for_function("!document.getElementById('view-dashboard').classList.contains('hidden')", timeout=5000)
        check(f"[{tag}] dashboard view is shown", True)
        page.wait_for_timeout(1500)
        page.wait_for_function("(document.querySelector('header .m-dd-user span')||{}).textContent==='e2e@example.com'", timeout=5000)
        check(f"[{tag}] account menu shows the signed-in user's name/email", page.eval_on_selector("header .m-dd-user b", "e=>e.textContent")=="E2E Student")

        # every sidebar section
        if viewport["width"] < 1024:
            page.click(".m-hamb")
        navs = page.eval_on_selector_all("#sidebar-nav .nav-item, #lms-app aside .nav-item", "els=>els.map(e=>e.id).filter(Boolean)")
        navs = [n for n in dict.fromkeys(navs)]
        check(f"[{tag}] sidebar sections discovered ({len(navs)})", len(navs) >= 10, str(navs))
        for nid in navs:
            if nid.startswith("nav-btn-logout"): continue
            if viewport["width"] < 1024 and page.locator(".m-drawer-open").count() == 0: page.click(".m-hamb")
            page.evaluate("id=>document.getElementById(id).click()", nid); page.wait_for_timeout(250)
            visible = page.eval_on_selector_all("#lms-app [id^='view-'], #refer-earn-view", "els=>els.filter(e=>e.parentElement && !e.classList.contains('hidden') && /^view-|^refer-earn-view/.test(e.id) && e.parentElement.closest('[id^=view-]')==null).map(e=>e.id)")
            check(f"[{tag}] {nid} shows exactly one section {visible}", len(visible) == 1, str(visible))

        # inner interactions: click every in-view button once, see no JS errors (we check behaviour class, not visuals)
        n_before = len(errors)
        for nid in ("nav-btn-recorded", "nav-btn-books", "nav-btn-tools", "nav-btn-labs", "nav-btn-quizzes", "nav-btn-leaderboard", "nav-btn-support", "nav-btn-payments", "nav-btn-profile", "nav-btn-live", "nav-btn-schedule", "nav-btn-cyber-ai"):
            if page.locator("#" + nid).count() == 0: continue
            page.evaluate("id=>document.getElementById(id).click()", nid); page.wait_for_timeout(150)
            for sel in ("#lms-app main > div.overflow-y-auto button:visible",):
                btns = page.locator(sel); cnt = min(btns.count(), 12)
                for i in range(cnt):
                    try: btns.nth(i).click(timeout=800, force=True, no_wait_after=True)
                    except Exception: pass
                    page.wait_for_timeout(40)
        check(f"[{tag}] clicking section buttons raised no JS errors", len(errors) == n_before, "; ".join(errors[n_before:][:3]))

        page.reload(); page.wait_for_function("document.getElementById('lms-app') && !document.getElementById('lms-app').classList.contains('hidden')", timeout=8000)
        check(f"[{tag}] reload of /lms still works (session persists)", page.url.endswith("/lms"))
        page.goto(BASE + "/lms/profile"); page.wait_for_function("document.getElementById('lms-app') && !document.getElementById('lms-app').classList.contains('hidden')", timeout=8000)
        check(f"[{tag}] deep link /lms/profile works", True)

        page.goto(BASE + "/"); page.wait_for_timeout(600)
        # logged-in visitor clicking LMS LOGIN goes straight in
        page.evaluate("document.getElementById('btn-show-login').click()"); page.wait_for_url("**/lms", timeout=6000)
        check(f"[{tag}] signed-in visitor: LMS LOGIN opens LMS directly", page.url.endswith("/lms"))
        page.wait_for_function("document.getElementById('lms-app') && !document.getElementById('lms-app').classList.contains('hidden')", timeout=8000); page.wait_for_timeout(800)
        if viewport["width"] < 1024: page.click(".m-hamb")
        page.evaluate("document.querySelector('#lms-app aside .nav-item.text-red-400').click()")
        page.wait_for_url(lambda u: u.rstrip("/").endswith(str(PORT)) or "signedout" in u or u.endswith("/"), timeout=8000); page.wait_for_selector("#btn-show-login", timeout=8000)
        check(f"[{tag}] logout returns to website", page.locator("#landing-page").count() == 1 and "/lms" not in page.url)
        page.goto(BASE + "/lms"); page.wait_for_selector("#btn-show-login", timeout=8000)
        check(f"[{tag}] /lms after logout is blocked (redirected to site)", "/lms" not in page.url.split("?")[0])
        page.go_back(); page.wait_for_timeout(500)
        check(f"[{tag}] no uncaught JS errors in whole session", not [e for e in errors if e.startswith("pageerror")], "; ".join(errors[:3]))
        b.close()

    try:
        with sync_playwright() as pw:
            run(pw, {"width": 1440, "height": 900}, "desktop")
            # fresh DB sessions persist between runs? each run logs in again from a clean context
            run(pw, {"width": 390, "height": 844}, "mobile")
    finally:
        srv.terminate()
    print("\n%d FAILED" % len(fails) if fails else "\nALL E2E CHECKS PASSED"); sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
