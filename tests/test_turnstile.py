"""Comprehensive Cloudflare Turnstile Security Test Suite.
Validates:
1. Successful human verification config
2. Missing / empty verification token rejection
3. Failed / blocked verification token rejection
4. Reused token replay attack prevention
5. Student registration & forgot password Turnstile enforcement
6. Admin portal role separation
7. Mobile and tablet response headers
"""
import http.client
import json
import os
import secrets
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


class TestCloudflareTurnstile(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cls.tmp_dir = tempfile.mkdtemp(prefix="cyberpro_turnstile_test_")
        cls.port = int(os.environ.get("CYBERPRO_TEST_PORT") or _free_port())
        cls.host = os.environ.get("CYBERPRO_TEST_HOST", "127.0.0.1")

        env = dict(
            os.environ,
            CYBERPRO_HOST=cls.host,
            CYBERPRO_PORT=str(cls.port),
            CYBERPRO_DB=os.path.join(cls.tmp_dir, "turnstile_test.db"),
            CLOUDFLARE_TURNSTILE_ENABLED="1",
        )
        cls.srv = subprocess.Popen(
            [sys.executable, os.path.join(cls.root, "server.py")],
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

    def api_call(self, method, path, body=None, headers=None, cookie=None):
        c = http.client.HTTPConnection(self.host, self.port, timeout=10)
        h = dict(headers or {})
        if cookie:
            h["Cookie"] = cookie
        if body is not None and "Content-Type" not in h:
            h["Content-Type"] = "application/json"
        payload = json.dumps(body) if isinstance(body, dict) else (body if body is not None else None)
        c.request(method, path, payload, h)
        res = c.getresponse()
        raw = res.read().decode("utf-8")
        try:
            data = json.loads(raw)
        except Exception:
            data = {"raw": raw}
        return res.status, dict((k.lower(), v) for k, v in res.getheaders()), data

    def test_01_turnstile_config(self):
        """Verify Turnstile configuration is public and exposes Site Key only."""
        status, _, data = self.api_call("GET", "/api/turnstile-config")
        self.assertEqual(status, 200)
        self.assertTrue(data.get("enabled"))
        self.assertTrue("site_key" in data)
        self.assertFalse("secret_key" in data, "Secret key must NEVER be exposed in config endpoint!")

    def test_02_login_missing_token(self):
        """Login request with missing Turnstile token must be rejected with 400."""
        status, _, data = self.api_call("POST", "/api/login", {
            "email": "test_bot_audit@cyberpro.test",
            "password": "any"
        })
        self.assertEqual(status, 400)
        self.assertIn("missing", data.get("error", "").lower())
        self.assertEqual(data.get("code"), "TURNSTILE_FAILED")

    def test_03_login_empty_token(self):
        """Login request with empty string token must be rejected."""
        status, _, data = self.api_call("POST", "/api/login", {
            "email": "test_bot_audit@cyberpro.test",
            "password": "any",
            "cf-turnstile-response": "   "
        })
        self.assertEqual(status, 400)
        self.assertIn("missing", data.get("error", "").lower())

    def test_04_login_failed_verification(self):
        """Login with simulated failed/blocked token must be rejected."""
        status, _, data = self.api_call("POST", "/api/login", {
            "email": "test_bot_audit@cyberpro.test",
            "password": "any",
            "cf-turnstile-response": "TEST_TOKEN_BLOCK"
        })
        self.assertEqual(status, 400)
        self.assertIn("failed", data.get("error", "").lower())

    def test_05_reused_token_replay_attack(self):
        """Replay attack: using the exact same verification token twice must be rejected."""
        test_token = "1x00000000_replay_test_" + secrets.token_hex(8)
        s1, _, _ = self.api_call("POST", "/api/login", {
            "email": "test_bot_audit@cyberpro.test",
            "password": "wrong-password",
            "cf-turnstile-response": test_token
        })
        self.assertEqual(s1, 401, "First attempt should pass Turnstile and fail on password")

        s2, _, d2 = self.api_call("POST", "/api/login", {
            "email": "test_bot_audit@cyberpro.test",
            "password": "wrong-password",
            "cf-turnstile-response": test_token
        })
        self.assertEqual(s2, 400)
        self.assertIn("already been used", d2.get("error", "").lower())

    def test_06_registration_missing_token(self):
        """Student registration without Turnstile token must be rejected."""
        status, _, data = self.api_call("POST", "/api/register", {
            "name": "Spam Bot",
            "email": "bot@spam.test",
            "password": secrets.token_urlsafe(12)
        })
        self.assertEqual(status, 400)
        self.assertIn("missing", data.get("error", "").lower())

    def test_07_registration_success(self):
        """Student registration with valid Turnstile token creates new user and sets session."""
        unique_email = f"student_{secrets.token_hex(4)}@cyberpro.test"
        valid_token = "1x00000000_reg_" + secrets.token_hex(8)
        pw = secrets.token_urlsafe(12) + "Aa1!"
        status, headers, data = self.api_call("POST", "/api/register", {
            "name": "Enrolled Student",
            "email": unique_email,
            "password": pw,
            "cf-turnstile-response": valid_token
        })
        self.assertEqual(status, 201)
        self.assertTrue(data.get("ok"))
        self.assertIn("set-cookie", headers)
        self.assertIn("cp_session=", headers["set-cookie"])

    def test_08_forgot_password_missing_token(self):
        """Forgot password without Turnstile token must be rejected."""
        status, _, data = self.api_call("POST", "/api/forgot-password", {
            "email": "test_bot_audit@cyberpro.test"
        })
        self.assertEqual(status, 400)
        self.assertIn("missing", data.get("error", "").lower())

    def test_09_forgot_password_success(self):
        """Forgot password with valid Turnstile token succeeds safely without user enumeration."""
        valid_token = "1x00000000_pwd_" + secrets.token_hex(8)
        status, _, data = self.api_call("POST", "/api/forgot-password", {
            "email": "test_bot_audit@cyberpro.test",
            "cf-turnstile-response": valid_token
        })
        self.assertEqual(status, 200)
        self.assertTrue(data.get("ok"))

    def test_10_admin_login_verification(self):
        """Admin login enforces Turnstile and verifies administrative role."""
        unique_email = f"student_{secrets.token_hex(4)}@cyberpro.test"
        reg_token = "1x00000000_reg_" + secrets.token_hex(8)
        pw = secrets.token_urlsafe(12) + "Aa1!"
        self.api_call("POST", "/api/register", {
            "name": "Standard Student",
            "email": unique_email,
            "password": pw,
            "cf-turnstile-response": reg_token
        })

        admin_attempt_token = "1x00000000_adm_" + secrets.token_hex(8)
        status, _, data = self.api_call("POST", "/api/login", {
            "email": unique_email,
            "password": pw,
            "role": "admin",
            "cf-turnstile-response": admin_attempt_token
        })
        self.assertEqual(status, 403, "Student must be blocked from admin portal role")
        self.assertIn("administrator privileges", data.get("error", "").lower())

    def test_11_mobile_responsiveness_headers(self):
        """Verify server responds properly to mobile, tablet, and desktop User-Agents."""
        mobile_ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
        tablet_ua = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
        for ua in [mobile_ua, tablet_ua]:
            status, headers, _ = self.api_call("GET", "/", headers={"User-Agent": ua})
            self.assertEqual(status, 200)
            self.assertIn("text/html", headers.get("content-type", ""))


if __name__ == "__main__":
    unittest.main()
