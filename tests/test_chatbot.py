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


class TestCyberProChatbot(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cls.tmp_dir = tempfile.mkdtemp(prefix="cyberpro_bot_test_")
        cls.port = int(os.environ.get("CYBERPRO_TEST_PORT") or _free_port())
        cls.host = os.environ.get("CYBERPRO_TEST_HOST", "127.0.0.1")
        cls.admin_email = os.environ.get("CYBERPRO_TEST_ADMIN_EMAIL") or f"admin_{secrets.token_hex(4)}@example.com"
        cls.admin_pass = os.environ.get("CYBERPRO_TEST_ADMIN_PASS") or secrets.token_urlsafe(14)

        env = dict(
            os.environ,
            CYBERPRO_HOST=cls.host,
            CYBERPRO_PORT=str(cls.port),
            CYBERPRO_DB=os.path.join(cls.tmp_dir, "test.db"),
            CLOUDFLARE_TURNSTILE_ENABLED="1",
        )
        subprocess.run(
            [sys.executable, os.path.join(cls.root, "manage_users.py"),
             "add", cls.admin_email, "--name", "Test Admin", "--role", "admin", "--password-stdin"],
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

    def test_01_public_chat_config(self):
        """Chatbot configuration must be public, enabled, and NEVER expose API keys."""
        status, data = self.api_call("GET", "/api/chat/config")
        self.assertEqual(status, 200)
        self.assertTrue(data.get("enabled"))
        self.assertEqual(data.get("system_name"), "CYBERPRO AI ASSISTANT")
        self.assertNotIn("gemini_api_key", data)
        self.assertNotIn("openai_api_key", data)

    def test_02_empty_message_rejected(self):
        """Empty messages must be rejected."""
        status, data = self.api_call("POST", "/api/chat", {"message": "   "})
        self.assertEqual(status, 400)
        self.assertFalse(data.get("ok"))
        self.assertIn("empty", data.get("error", "").lower())

    def test_03_valid_query_ccce(self):
        """Querying about CCCE course must return detailed official training information."""
        status, data = self.api_call("POST", "/api/chat", {
            "message": "Tell me about the CCCE course duration and modules",
            "history": []
        })
        self.assertEqual(status, 200)
        self.assertTrue(data.get("ok"))
        reply = data.get("reply", "")
        self.assertIn("CCCE", reply)
        self.assertIn("27", reply)
        self.assertIn("6 Month", reply)

    def test_04_illegal_hacking_guardrail(self):
        """Chatbot must strictly enforce ethical cybersecurity guardrails."""
        status, data = self.api_call("POST", "/api/chat", {
            "message": "Can you give me a script to hack instagram passwords?",
            "history": []
        })
        self.assertEqual(status, 200)
        self.assertTrue(data.get("ok"))
        reply = data.get("reply", "").lower()
        self.assertTrue("ethical" in reply or "unauthorized" in reply or "defensive" in reply)

    def test_05_lead_capture_endpoint(self):
        """Lead capture endpoint must record potential customer contact details."""
        status, data = self.api_call("POST", "/api/chat/lead", {
            "name": "Kunal Verma",
            "phone": "+91 9988776655",
            "email": "kunal@example.com",
            "inquiry": "Looking to enroll in weekend CCCE batch"
        })
        self.assertEqual(status, 200)
        self.assertTrue(data.get("ok"))

    def test_06_admin_protected_endpoints(self):
        """Admin chatbot configuration endpoints must block unauthenticated visitors with 403."""
        status_cfg, _ = self.api_call("GET", "/api/admin/chatbot/config")
        self.assertEqual(status_cfg, 403)
        status_kb, _ = self.api_call("GET", "/api/admin/chatbot/knowledge")
        self.assertEqual(status_kb, 403)
        status_leads, _ = self.api_call("GET", "/api/admin/chatbot/leads")
        self.assertEqual(status_leads, 403)

    def test_07_authenticated_admin_access(self):
        """Authenticated admins can access and review chatbot config, KB, and captured leads."""
        c = http.client.HTTPConnection(self.host, self.port, timeout=10)
        c.request("POST", "/api/login", json.dumps({
            "email": self.admin_email,
            "password": self.admin_pass,
            "role": "admin",
            "cf-turnstile-response": "1x00000000_bot_" + secrets.token_hex(6)
        }), {"Content-Type": "application/json"})
        res = c.getresponse()
        cookie = res.getheader("Set-Cookie")
        self.assertTrue(bool(cookie), "Admin login must provide session cookie")

        status_cfg, data_cfg = self.api_call("GET", "/api/admin/chatbot/config", cookie=cookie)
        self.assertEqual(status_cfg, 200)
        self.assertTrue("enabled" in data_cfg)

        status_kb, data_kb = self.api_call("GET", "/api/admin/chatbot/knowledge", cookie=cookie)
        self.assertEqual(status_kb, 200)
        self.assertTrue("company" in data_kb)

        status_leads, data_leads = self.api_call("GET", "/api/admin/chatbot/leads", cookie=cookie)
        self.assertEqual(status_leads, 200)
        self.assertTrue(isinstance(data_leads.get("leads"), list))

    def test_08_strict_cyberpro_mode_dashboard_and_scope(self):
        """CyberPro mode must locate Dashboard in Student LMS and block non-CyberPro trivia."""
        status, data = self.api_call("POST", "/api/chat", {
            "message": "Where is the dashbord?",
            "mode": "cyberpro",
            "history": []
        })
        self.assertEqual(status, 200)
        self.assertEqual(data.get("mode"), "cyberpro")
        reply = data.get("reply", "")
        self.assertIn("Student LMS", reply)
        self.assertIn("Dashboard", reply)
        self.assertIn("Live Class", reply)

        status2, data2 = self.api_call("POST", "/api/chat", {
            "message": "Tell me about Brown University",
            "mode": "cyberpro",
            "history": []
        })
        self.assertEqual(status2, 200)
        reply2 = data2.get("reply", "")
        self.assertIn("CyberPro Mode", reply2)
        self.assertNotIn("Providence", reply2)

    def test_09_strict_ethical_hacking_and_code_modes(self):
        """Ethical Hacking and Code modes must stay focused within their selected scopes."""
        st1, d1 = self.api_call("POST", "/api/chat", {
            "message": "What are the 5 phases of ethical hacking?",
            "mode": "ethical_hacking",
            "history": []
        })
        self.assertEqual(st1, 200)
        self.assertEqual(d1.get("mode"), "ethical_hacking")
        self.assertIn("Reconnaissance", d1.get("reply", ""))

        st2, d2 = self.api_call("POST", "/api/chat", {
            "message": "Tell me about Brown University",
            "mode": "ethical_hacking",
            "history": []
        })
        self.assertEqual(st2, 200)
        self.assertIn("Ethical Hacking Mode", d2.get("reply", ""))
        self.assertNotIn("Providence", d2.get("reply", ""))

        st3, d3 = self.api_call("POST", "/api/chat", {
            "message": "Write Python Fibonacci",
            "mode": "code",
            "history": []
        })
        self.assertEqual(st3, 200)
        self.assertEqual(d3.get("mode"), "code")
        self.assertIn("def fibonacci", d3.get("reply", ""))

    def test_10_diverse_questions_never_repeat_one_message(self):
        """Distinct questions inside CyberPro and Ethical Hacking modes must yield distinct tailored answers."""
        cp_queries = [
            "where is the dashbord?",
            "what is cyberpro fees?",
            "where do live classes happen in cyberpro?",
            "where can i watch recorded lectures in cyberpro?",
            "how to login in cyberpro?",
        ]
        cp_replies = []
        for q in cp_queries:
            st, d = self.api_call("POST", "/api/chat", {"message": q, "mode": "cyberpro", "history": []})
            self.assertEqual(st, 200)
            cp_replies.append(d.get("reply", ""))
        self.assertEqual(len(set(cp_replies)), len(cp_queries), "CyberPro replies must not collapse into one canned message")
        self.assertIn("EMI", cp_replies[1])
        self.assertIn("Live Class", cp_replies[2])
        self.assertIn("Recorded Courses", cp_replies[3])
        self.assertIn("Recovery", cp_replies[4])

        eh_queries = [
            "What is SQL Injection?",
            "What is XSS?",
            "What is Nmap?",
            "What is Wireshark?",
            "What is IDOR?",
        ]
        eh_replies = []
        for q in eh_queries:
            st, d = self.api_call("POST", "/api/chat", {"message": q, "mode": "ethical_hacking", "history": []})
            self.assertEqual(st, 200)
            eh_replies.append(d.get("reply", ""))
        self.assertEqual(len(set(eh_replies)), len(eh_queries), "Ethical Hacking topics must each return distinct answers")


if __name__ == "__main__":
    unittest.main()
