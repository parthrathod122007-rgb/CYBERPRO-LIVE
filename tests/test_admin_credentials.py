import http.client
import json
import os
import shutil
import socket
import sqlite3
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


class TestAdminDirectoryAndCredentials(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cls.tmp_dir = tempfile.mkdtemp(prefix="cyberpro_admin_cred_test_")
        cls.db_path = os.path.join(cls.tmp_dir, "test_admin_cred.db")
        cls.port = _free_port()
        cls.host = "127.0.0.1"

        schema_file = os.path.join(cls.root, "data", "schema.sql")
        live_db = os.path.join(cls.root, "data", "cyberpro.db")
        con = sqlite3.connect(cls.db_path)
        has_full_schema = False
        if os.path.isfile(schema_file):
            with open(schema_file, "r", encoding="utf-8", errors="ignore") as f:
                sql_text = f.read()
            if "staff_profiles" in sql_text and "student_profiles" in sql_text:
                con.executescript(sql_text)
                has_full_schema = True
        if not has_full_schema and os.path.isfile(live_db):
            src = sqlite3.connect(live_db)
            for row in src.execute(
                "SELECT sql FROM sqlite_master WHERE type IN ('table','index') AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'"
            ):
                con.execute(row[0])
            con.execute(
                "INSERT OR IGNORE INTO courses (id, name, code, description, total_fee, duration_weeks, total_modules, is_active, created_at) VALUES ('ccce', 'CCCE Master', 'CCCE', 'Course', 4000, 24, 27, 1, 1794000000)"
            )
            src.close()
        con.commit()
        con.close()

        sys.path.insert(0, cls.root)
        os.environ["CYBERPRO_DB"] = cls.db_path
        import server as S
        S.DB_PATH = S.Path(cls.db_path) if hasattr(S, "Path") else cls.db_path
        S.init_db()
        cls.admin_email = "root.tester@cyberpro.test"
        cls.admin_pass = "RootAdminPass@999!"
        cls.legacy_admin_email = "legacy.admin@cyberpro.test"
        cls.legacy_admin_pass = "LegacyHashOnly@88"

        now_ts = int(time.time()) - 86400
        with sqlite3.connect(cls.db_path) as c:
            c.execute(
                "INSERT INTO users (email, name, password_hash, portal_password, is_active, role, created_at) VALUES (?, ?, ?, ?, 1, 'admin', ?)",
                (cls.admin_email, "Root Test Admin", S.hash_password(cls.admin_pass), cls.admin_pass, now_ts)
            )
            c.execute(
                "INSERT INTO users (email, name, password_hash, portal_password, is_active, role, created_at) VALUES (?, ?, ?, '', 1, 'admin', ?)",
                (cls.legacy_admin_email, "Legacy Admin No Profile", S.hash_password(cls.legacy_admin_pass), now_ts)
            )
            c.commit()

        env = dict(
            os.environ,
            CYBERPRO_DB=cls.db_path,
            CYBERPRO_HOST=cls.host,
            CYBERPRO_PORT=str(cls.port),
            CYBERPRO_COOKIE_SECURE="0",
            CLOUDFLARE_TURNSTILE_ENABLED="1",
            CLOUDFLARE_TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA",
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
        else:
            raise RuntimeError("Isolated test server failed to start in time")

    @classmethod
    def tearDownClass(cls):
        if getattr(cls, "srv", None):
            cls.srv.terminate()
            try:
                cls.srv.wait(timeout=5)
            except Exception:
                cls.srv.kill()
        shutil.rmtree(cls.tmp_dir, ignore_errors=True)

    def req(self, method, path, body=None, cookie=None):
        c = http.client.HTTPConnection(self.host, self.port, timeout=10)
        headers = {"Content-Type": "application/json"}
        if cookie:
            headers["Cookie"] = cookie
        payload = json.dumps(body) if body is not None else None
        c.request(method, path, payload, headers)
        r = c.getresponse()
        raw = r.read().decode("utf-8", errors="ignore")
        try:
            data = json.loads(raw)
        except Exception:
            data = {"raw": raw}
        hdrs = {k.lower(): v for k, v in r.getheaders()}
        return r.status, hdrs, data

    def login_user(self, email, password, role=""):
        st, hdrs, data = self.req("POST", "/api/login", {
            "email": email,
            "password": password,
            "role": role,
            "cf-turnstile-response": "test-turnstile-pass-token",
        })
        ck = hdrs.get("set-cookie", "").split(";")[0]
        return st, data, ck

    def test_01_admin_endpoints_enforce_acl(self):
        st, _, _ = self.req("GET", "/api/admin/admins")
        self.assertEqual(st, 403)
        st2, _, _ = self.req("POST", "/api/admin/users/set-password", {"identifier": 1, "password": "NewPassword@123"})
        self.assertEqual(st2, 403)

    def test_02_student_register_stores_password_and_admin_personal_dossier_exposes_it(self):
        stu_email = "student.cred@cyberpro.test"
        stu_pass = "StudentPass@2026!"
        st, _, data = self.req("POST", "/api/register", {
            "name": "Asha Learner",
            "email": stu_email,
            "password": stu_pass,
            "cf-turnstile-response": "test-turnstile-pass-token",
        })
        self.assertEqual(st, 201, data)
        stu_ck = self.login_user(stu_email, stu_pass)[2]

        st_me, _, me_data = self.req("GET", "/api/me", cookie=stu_ck)
        self.assertEqual(st_me, 200)
        self.assertNotIn("portal_password", me_data)
        self.assertNotIn("password_hash", me_data)
        st_stu_adm, _, _ = self.req("GET", "/api/admin/admins", cookie=stu_ck)
        self.assertEqual(st_stu_adm, 403)

        st_adm, _, adm_ck = self.login_user(self.admin_email, self.admin_pass, role="admin")
        self.assertEqual(st_adm, 200)
        st_dos, _, dos = self.req("GET", f"/api/admin/students/{stu_email}", cookie=adm_ck)
        self.assertEqual(st_dos, 200, dos)
        self.assertEqual(dos["profile"]["portal_password"], stu_pass)

        new_stu_pw = "UpdatedStu@9988"
        st_pw, _, pw_res = self.req("POST", "/api/admin/users/set-password", {
            "identifier": dos["profile"]["student_id"],
            "password": new_stu_pw,
        }, cookie=adm_ck)
        self.assertEqual(st_pw, 200, pw_res)
        self.assertEqual(pw_res["portal_password"], new_stu_pw)

        st_dos2, _, dos2 = self.req("GET", f"/api/admin/students/{dos['profile']['student_id']}", cookie=adm_ck)
        self.assertEqual(dos2["profile"]["portal_password"], new_stu_pw)

        st_login, login_res, _ = self.login_user(stu_email, new_stu_pw)
        self.assertEqual(st_login, 200, login_res)
        self.assertEqual(login_res["redirect"], "/lms")

    def test_03_admin_add_student_custom_password_and_qualification(self):
        _, _, adm_ck = self.login_user(self.admin_email, self.admin_pass, role="admin")
        custom_pw = "CustomEnroll@7766"
        st, _, res = self.req("POST", "/api/admin/students", {
            "name": "Vikram Student",
            "email": "vikram.stu@cyberpro.test",
            "mobile": "+91 9822011223",
            "course_id": "ccce",
            "qualification": "MCA Final Year",
            "password": custom_pw,
            "total_fee": 4000,
            "amount_paid": 4000,
        }, cookie=adm_ck)
        self.assertEqual(st, 201, res)
        sid = res["student"]["student_id"]

        st_dos, _, dos = self.req("GET", f"/api/admin/students/{sid}", cookie=adm_ck)
        self.assertEqual(st_dos, 200)
        self.assertEqual(dos["profile"]["portal_password"], custom_pw)
        self.assertEqual(dos["profile"]["qualification"], "MCA Final Year")

        st_login, login_res, _ = self.login_user("vikram.stu@cyberpro.test", custom_pw)
        self.assertEqual(st_login, 200, login_res)

    def test_04_admin_directory_detail_create_update_and_login(self):
        _, _, adm_ck = self.login_user(self.admin_email, self.admin_pass, role="admin")

        st_dir, _, dir_data = self.req("GET", "/api/admin/admins", cookie=adm_ck)
        self.assertEqual(st_dir, 200)
        emails = {a["email"]: a for a in dir_data["admins"]}
        self.assertIn(self.admin_email, emails)
        self.assertIn(self.legacy_admin_email, emails)
        self.assertEqual(emails[self.admin_email]["portal_password"], self.admin_pass)
        self.assertEqual(emails[self.legacy_admin_email]["portal_password"], "")

        new_email = "sec.director@cyberpro.test"
        new_pw = "DirectorPass@5544"
        st_cr, _, cr = self.req("POST", "/api/admin/admins", {
            "name": "Meera Nair",
            "email": new_email,
            "password": new_pw,
            "phone": "+91 9899001122",
            "qualification": "M.Tech Cyber Security / OSCP",
            "department": "Executive Security",
            "role": "admin",
        }, cookie=adm_ck)
        self.assertEqual(st_cr, 201, cr)

        st_q, _, q_res = self.req("GET", "/api/admin/admins?q=OSCP", cookie=adm_ck)
        self.assertEqual(st_q, 200)
        self.assertEqual(len(q_res["admins"]), 1)
        row = q_res["admins"][0]
        self.assertEqual(row["email"], new_email)
        self.assertEqual(row["portal_password"], new_pw)
        self.assertEqual(row["phone"], "+91 9899001122")
        self.assertEqual(row["qualification"], "M.Tech Cyber Security / OSCP")
        self.assertTrue(row["reg_date_str"] and row["reg_date_str"] != "N/A")

        st_dos, _, dos = self.req("GET", f"/api/admin/admins/{row['user_id']}", cookie=adm_ck)
        self.assertEqual(st_dos, 200)
        self.assertEqual(dos["profile"]["portal_password"], new_pw)
        self.assertEqual(dos["profile"]["qualification"], "M.Tech Cyber Security / OSCP")

        updated_pw = "UpdatedDirector@1122"
        st_upd, _, upd = self.req("POST", f"/api/admin/admins/{row['user_id']}/update", {
            "name": "Meera Nair PhD",
            "phone": "+91 9000011111",
            "qualification": "Ph.D Information Security / CISSP",
            "password": updated_pw,
        }, cookie=adm_ck)
        self.assertEqual(st_upd, 200, upd)

        st_log, log_data, _ = self.login_user(new_email, updated_pw, role="admin")
        self.assertEqual(st_log, 200, log_data)
        self.assertEqual(log_data["redirect"], "/admin")
        self.assertEqual(log_data["role"], "admin")

        st_csv, _, csv_res = self.req("GET", "/api/admin/admins/export", cookie=adm_ck)
        self.assertEqual(st_csv, 200)
        self.assertIn("Ph.D Information Security / CISSP", csv_res.get("raw", ""))
        self.assertNotIn(updated_pw, csv_res.get("raw", ""))

        st_self, _, self_res = self.req("POST", f"/api/admin/admins/{emails[self.admin_email]['user_id']}/toggle", {}, cookie=adm_ck)
        self.assertEqual(st_self, 400)


if __name__ == "__main__":
    unittest.main(verbosity=2)
