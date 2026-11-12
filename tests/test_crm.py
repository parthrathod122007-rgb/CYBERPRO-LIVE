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


class TestCyberProCRM(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cls.tmp_dir = tempfile.mkdtemp(prefix="cyberpro_crm_test_")
        cls.port = int(os.environ.get("CYBERPRO_TEST_PORT") or _free_port())
        cls.host = os.environ.get("CYBERPRO_TEST_HOST", "127.0.0.1")
        cls.admin_email = os.environ.get("CYBERPRO_TEST_ADMIN_EMAIL") or f"crm_admin_{secrets.token_hex(4)}@example.com"
        cls.admin_pass = os.environ.get("CYBERPRO_TEST_ADMIN_PASS") or secrets.token_urlsafe(14)

        env = dict(
            os.environ,
            CYBERPRO_HOST=cls.host,
            CYBERPRO_PORT=str(cls.port),
            CYBERPRO_DB=os.path.join(cls.tmp_dir, "crm_test.db"),
            CLOUDFLARE_TURNSTILE_ENABLED="1",
        )
        subprocess.run(
            [sys.executable, os.path.join(cls.root, "manage_users.py"),
             "add", cls.admin_email, "--name", "CRM Admin", "--role", "admin", "--password-stdin"],
            input=cls.admin_pass + "\n",
            text=True,
            env=env,
            cwd=cls.root,
            check=True,
            capture_output=True,
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

    def api_call(self, method, path, body=None, cookie=None):
        c = http.client.HTTPConnection(self.host, self.port, timeout=10)
        headers = {"Content-Type": "application/json"}
        if cookie:
            headers["Cookie"] = cookie
        payload = json.dumps(body) if body is not None else None
        c.request(method, path, payload, headers)
        res = c.getresponse()
        raw = res.read().decode("utf-8")
        try:
            data = json.loads(raw)
        except Exception:
            data = {"raw": raw}
        return res.status, data

    def get_admin_cookie(self):
        c = http.client.HTTPConnection(self.host, self.port, timeout=10)
        c.request("POST", "/api/login", json.dumps({
            "email": self.admin_email,
            "password": self.admin_pass,
            "role": "admin",
            "cf-turnstile-response": "1x00000000_crm_" + secrets.token_hex(6)
        }), {"Content-Type": "application/json"})
        res = c.getresponse()
        return res.getheader("Set-Cookie")

    def test_01_unauthenticated_crm_redirects(self):
        """Unauthenticated visitors accessing /admin/crm should be redirected to login."""
        c = http.client.HTTPConnection(self.host, self.port, timeout=10)
        c.request("GET", "/admin/crm")
        res = c.getresponse()
        self.assertIn(res.status, (302, 303, 307))
        self.assertIn("/staff-login", res.getheader("Location", ""))

    def test_02_admin_crm_page_loads(self):
        """Admin with valid session can access /admin/crm HTML interface."""
        cookie = self.get_admin_cookie()
        self.assertTrue(bool(cookie), "Admin login must succeed")
        c = http.client.HTTPConnection(self.host, self.port, timeout=10)
        c.request("GET", "/admin/crm", headers={"Cookie": cookie})
        res = c.getresponse()
        self.assertEqual(res.status, 200)
        content = res.read().decode("utf-8")
        self.assertIn("CYBERPRO CRM", content)
        self.assertIn("Awaiting Call", content)

    def test_03_crm_enquiries_list_api(self):
        """Admin can fetch leads list and KPI statistics."""
        cookie = self.get_admin_cookie()
        status, data = self.api_call("GET", "/api/admin/crm/enquiries", cookie=cookie)
        self.assertEqual(status, 200)
        self.assertIn("enquiries", data)
        self.assertIn("stats", data)
        stats = data.get("stats", {})
        self.assertIn("total", stats)
        self.assertIn("new", stats)

    def test_04_multi_turn_discovery_and_deduplication(self):
        """Simulate multi-turn chatbot conversation progressively discovering customer identity."""
        sess_id = f"test_session_{secrets.token_hex(6)}"

        status1, data1 = self.api_call("POST", "/api/chat", {
            "message": "Hi, I want to learn ethical hacking from scratch",
            "session_id": sess_id,
            "history": []
        })
        self.assertEqual(status1, 200)
        self.assertTrue(data1.get("ok"))

        status2, data2 = self.api_call("POST", "/api/chat", {
            "message": "My name is Rohit Sharma and I am a college student from Pune",
            "session_id": sess_id,
            "history": [
                {"role": "user", "content": "Hi, I want to learn ethical hacking from scratch"},
                {"role": "assistant", "content": data1.get("reply", "")}
            ]
        })
        self.assertEqual(status2, 200)
        self.assertTrue(data2.get("ok"))

        status3, data3 = self.api_call("POST", "/api/chat", {
            "message": "My email is rohit.pune@example.com and WhatsApp is 9822012345. Can someone contact me about CCCE batch?",
            "session_id": sess_id,
            "history": []
        })
        self.assertEqual(status3, 200)
        self.assertTrue(data3.get("ok"))

        cookie = self.get_admin_cookie()
        status_list, data_list = self.api_call("GET", "/api/admin/crm/enquiries?q=Rohit", cookie=cookie)
        self.assertEqual(status_list, 200)
        enquiries = data_list.get("enquiries", [])
        self.assertTrue(len(enquiries) >= 1)
        found = any(e.get("full_name") == "Rohit Sharma" or "rohit.pune@example.com" in e.get("email", "") for e in enquiries)
        self.assertTrue(found, "Rohit Sharma must be recorded in CRM database")

    def test_05_dossier_and_status_update(self):
        """Admin can view lead dossier and update lead status and notes."""
        cookie = self.get_admin_cookie()
        # Ensure at least one lead exists cleanly inside this isolated test DB
        self.api_call("POST", "/api/chat/lead", {
            "name": "Dossier Seed",
            "phone": "+91 9811112222",
            "email": "dossier.seed@example.com",
            "inquiry": "CCCE inquiry for dossier verification"
        })
        status_list, data_list = self.api_call("GET", "/api/admin/crm/enquiries", cookie=cookie)
        self.assertEqual(status_list, 200)
        enquiries = data_list.get("enquiries", [])
        self.assertTrue(len(enquiries) > 0, "At least one lead should exist")

        lead_id = enquiries[0]["id"]
        status_dossier, data_dossier = self.api_call("GET", f"/api/admin/crm/enquiry/{lead_id}", cookie=cookie)
        self.assertEqual(status_dossier, 200)
        enquiry = data_dossier.get("enquiry", {})
        self.assertEqual(enquiry.get("id"), lead_id)

        status_update, data_update = self.api_call("POST", f"/api/admin/crm/enquiry/{lead_id}/update", {
            "status": "contacted",
            "admin_notes": "Counselor spoke on WhatsApp; scheduled demo lab for CCCE."
        }, cookie=cookie)
        self.assertEqual(status_update, 200)
        self.assertTrue(data_update.get("ok"))

    def test_06_csv_export(self):
        """Admin can export leads as a clean CSV download."""
        cookie = self.get_admin_cookie()
        c = http.client.HTTPConnection(self.host, self.port, timeout=10)
        c.request("GET", "/api/admin/crm/export-csv", headers={"Cookie": cookie})
        res = c.getresponse()
        self.assertEqual(res.status, 200)
        self.assertIn("text/csv", res.getheader("Content-Type", ""))
        self.assertIn("cyberpro_inquiries_leads.csv", res.getheader("Content-Disposition", ""))
        csv_body = res.read().decode("utf-8")
        self.assertIn("Full Name", csv_body)
        self.assertIn("Email", csv_body)
        self.assertIn("Phone", csv_body)


if __name__ == "__main__":
    unittest.main()
