import sqlite3
import re
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'cyberpro.db')

def get_initials(name):
    clean = re.sub(r'[^a-zA-Z\s]', '', name).strip().upper()
    parts = clean.split()
    if not parts:
        return "CP"
    if len(parts) == 1:
        return parts[0][:2]
    return "".join(p[0] for p in parts[:3])

def get_student_num(student_id, user_id):
    if student_id:
        nums = re.findall(r'\d+', student_id)
        if nums:
            return int(nums[-1])
    return int(user_id)

def run_migration():
    print(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    c = conn.cursor()

    # 1. student_referral_codes
    c.execute("""
    CREATE TABLE IF NOT EXISTS student_referral_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        student_id_code TEXT,
        automatic_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
        custom_code TEXT UNIQUE COLLATE NOCASE,
        active_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
        code_type TEXT DEFAULT 'automatic',
        is_active INTEGER DEFAULT 1,
        usage_count INTEGER DEFAULT 0,
        successful_count INTEGER DEFAULT 0,
        allow_custom_changes INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 2. referral_records
    c.execute("""
    CREATE TABLE IF NOT EXISTS referral_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referring_user_id INTEGER NOT NULL,
        referred_user_id INTEGER NOT NULL UNIQUE,
        referral_code_used TEXT NOT NULL COLLATE NOCASE,
        code_type TEXT NOT NULL DEFAULT 'automatic',
        referral_source TEXT DEFAULT 'direct_link',
        course_id TEXT,
        course_name TEXT,
        referral_status TEXT DEFAULT 'pending', -- 'pending', 'successful', 'rejected'
        rejection_reason TEXT,
        reward_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'rejected'
        reward_type TEXT DEFAULT 'cash', -- 'cash', 'discount', 'course_access'
        reward_amount REAL DEFAULT 500.0,
        reward_notes TEXT,
        approved_by INTEGER,
        approved_at TIMESTAMP,
        paid_at TIMESTAMP,
        payout_reference TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (referring_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 3. referral_rewards
    c.execute("""
    CREATE TABLE IF NOT EXISTS referral_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referral_record_id INTEGER,
        user_id INTEGER NOT NULL,
        reward_type TEXT DEFAULT 'cash',
        amount REAL DEFAULT 500.0,
        status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'rejected'
        approved_by INTEGER,
        approved_at TIMESTAMP,
        paid_at TIMESTAMP,
        payout_reference TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (referral_record_id) REFERENCES referral_records(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 4. referral_settings
    c.execute("""
    CREATE TABLE IF NOT EXISTS referral_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 5. referral_audit_logs
    c.execute("""
    CREATE TABLE IF NOT EXISTS referral_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed default settings if not exists
    default_settings = [
        ('default_reward_amount', '500'),
        ('default_reward_type', 'cash'),
        ('min_code_length', '4'),
        ('max_code_length', '20'),
        ('allow_custom_changes', '1'),
        ('auto_approve_on_payment', '1'),
        ('referral_rules_json', json.dumps({
            "ccce": {"reward_amount": 500, "reward_type": "cash"},
            "ethical-hacking": {"reward_amount": 750, "reward_type": "cash"},
            "advanced-cybersecurity": {"reward_amount": 1000, "reward_type": "cash"},
            "cyber-fundamentals": {"reward_amount": 300, "reward_type": "cash"}
        }))
    ]
    for k, v in default_settings:
        c.execute("INSERT OR IGNORE INTO referral_settings (key, value) VALUES (?, ?);", (k, v))

    # Seed automatic referral codes for all existing students
    c.execute("""
        SELECT u.id, u.name, sp.student_id 
        FROM users u 
        LEFT JOIN student_profiles sp ON u.id = sp.user_id 
        WHERE u.role = 'student'
    """)
    students = c.fetchall()
    print(f"Found {len(students)} existing students. Generating automatic referral codes...")

    used_codes = set()
    c.execute("SELECT automatic_code, custom_code FROM student_referral_codes")
    for r in c.fetchall():
        if r[0]: used_codes.add(r[0].upper())
        if r[1]: used_codes.add(r[1].upper())

    inserted_count = 0
    for uid, name, sid in students:
        # Check if student already has a code
        c.execute("SELECT id FROM student_referral_codes WHERE user_id = ?", (uid,))
        if c.fetchone():
            continue

        initials = get_initials(name or 'CP')
        num = get_student_num(sid, uid)
        
        # Candidate format 1: e.g. PSR001 or AS003
        candidate = f"{initials}{num:03d}"
        if candidate.upper() in used_codes:
            candidate = f"CP{num:04d}"
        if candidate.upper() in used_codes:
            candidate = f"REF{uid:05d}"

        used_codes.add(candidate.upper())
        
        c.execute("""
            INSERT INTO student_referral_codes (
                user_id, student_id_code, automatic_code, active_code, code_type, is_active
            ) VALUES (?, ?, ?, ?, 'automatic', 1)
        """, (uid, sid or f"CP-{uid:05d}", candidate, candidate))
        inserted_count += 1

    conn.commit()
    print(f"Migration successful! Seeded {inserted_count} new student referral codes.")

    # Also check if any existing test referral records exist or seed a few realistic ones for initial verification
    c.execute("SELECT COUNT(*) FROM referral_records")
    existing_referrals = c.fetchone()[0]
    print(f"Current total referral records: {existing_referrals}")

    if existing_referrals == 0 and len(students) >= 6:
        print("Seeding sample referral records for realistic dashboard verification...")
        # Let Student 3 (Aarav Sharma) refer Student 4 (Priya Patel - pending) and Student 5 (Rohit Verma - successful)
        # Let Student 6 (Ananya Iyer) refer Student 7 (Vikram Aditya - successful)
        sample_links = [
            (3, 4, 'pending', 'pending', 500.0, 'ccce', 'Certified Cyber Crime Expert'),
            (3, 5, 'successful', 'approved', 750.0, 'ethical-hacking', 'Certified Ethical Hacker Pro'),
            (6, 7, 'successful', 'paid', 1000.0, 'advanced-cybersecurity', 'Advanced Network Defense & Operations')
        ]
        for ref_uid, red_uid, ref_status, rew_status, amt, cid, cname in sample_links:
            # get referring student's code
            c.execute("SELECT active_code, code_type FROM student_referral_codes WHERE user_id = ?", (ref_uid,))
            code_row = c.fetchone()
            if code_row:
                ref_code, ctype = code_row
                c.execute("""
                    INSERT OR IGNORE INTO referral_records (
                        referring_user_id, referred_user_id, referral_code_used, code_type,
                        course_id, course_name, referral_status, reward_status, reward_amount,
                        approved_at, paid_at, payout_reference
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    ref_uid, red_uid, ref_code, ctype, cid, cname, ref_status, rew_status, amt,
                    datetime.now().isoformat() if rew_status in ('approved', 'paid') else None,
                    datetime.now().isoformat() if rew_status == 'paid' else None,
                    'PAY-REF-TXN-994201' if rew_status == 'paid' else None
                ))
                record_id = c.lastrowid
                if record_id:
                    c.execute("""
                        INSERT INTO referral_rewards (
                            referral_record_id, user_id, reward_type, amount, status,
                            approved_at, paid_at, payout_reference
                        ) VALUES (?, ?, 'cash', ?, ?, ?, ?, ?)
                    """, (
                        record_id, ref_uid, amt, rew_status,
                        datetime.now().isoformat() if rew_status in ('approved', 'paid') else None,
                        datetime.now().isoformat() if rew_status == 'paid' else None,
                        'PAY-REF-TXN-994201' if rew_status == 'paid' else None
                    ))
                # Update usage counts
                c.execute("""
                    UPDATE student_referral_codes 
                    SET usage_count = usage_count + 1,
                        successful_count = successful_count + CASE WHEN ? = 'successful' THEN 1 ELSE 0 END
                    WHERE user_id = ?
                """, (ref_status, ref_uid))
        conn.commit()
        print("Sample referral records seeded successfully.")

    conn.close()

if __name__ == '__main__':
    run_migration()
