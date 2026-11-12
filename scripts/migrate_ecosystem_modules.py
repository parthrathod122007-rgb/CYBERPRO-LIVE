"""
CYBERPRO ADVANCED CYBERSECURITY ECOSYSTEM MIGRATION
Creates tables and seeds initial realistic data for:
1. Cloud Cyber Range
2. CyberPro Skill Passport
3. Bug Bounty Training Arena
4. SOC Analyst Simulator
5. Employer Hiring Portal
6. Project Evaluation System
"""

import sqlite3
import json
import secrets
from datetime import datetime, timedelta

DB_PATH = 'data/cyberpro.db'

def run_migration():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("PRAGMA foreign_keys = ON;")

    print("Creating tables for all 6 Advanced Cybersecurity Ecosystem Modules...")

    # 1. CYBER RANGE TABLES
    cur.execute("""
    CREATE TABLE IF NOT EXISTS cyber_range_labs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        xp_reward INTEGER DEFAULT 150,
        description TEXT,
        objectives_json TEXT,
        hints_json TEXT,
        flag TEXT,
        environment_type TEXT DEFAULT 'terminal',
        initial_fs_json TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS cyber_range_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_token TEXT UNIQUE NOT NULL,
        student_id INTEGER NOT NULL REFERENCES users(id),
        lab_id INTEGER NOT NULL REFERENCES cyber_range_labs(id),
        status TEXT NOT NULL DEFAULT 'running',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        current_directory TEXT DEFAULT '/home/student',
        command_history_json TEXT DEFAULT '[]',
        flag_submitted TEXT,
        score_awarded INTEGER DEFAULT 0,
        fs_state_json TEXT
    );
    """)

    # 2. SKILL PASSPORT TABLES
    cur.execute("""
    CREATE TABLE IF NOT EXISTS skill_passport_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES users(id),
        skill_name TEXT NOT NULL,
        category TEXT NOT NULL,
        level TEXT NOT NULL DEFAULT 'learning',
        source_module TEXT NOT NULL,
        source_reference_id TEXT,
        verified_by_user_id INTEGER REFERENCES users(id),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, skill_name)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS student_portfolio_settings (
        student_id INTEGER PRIMARY KEY REFERENCES users(id),
        passport_token TEXT UNIQUE NOT NULL,
        is_public INTEGER DEFAULT 1,
        show_grades INTEGER DEFAULT 1,
        show_certificates INTEGER DEFAULT 1,
        show_projects INTEGER DEFAULT 1,
        allow_employer_discovery INTEGER DEFAULT 1,
        bio TEXT,
        github_url TEXT,
        linkedin_url TEXT,
        headline TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. BUG BOUNTY TRAINING ARENA TABLES
    cur.execute("""
    CREATE TABLE IF NOT EXISTS bug_bounty_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        points INTEGER DEFAULT 200,
        bounty_reward_inr INTEGER DEFAULT 500,
        target_endpoint TEXT NOT NULL,
        scope_description TEXT,
        vulnerability_summary TEXT,
        hint TEXT,
        flag TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bug_bounty_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES users(id),
        challenge_id INTEGER NOT NULL REFERENCES bug_bounty_challenges(id),
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        cvss_score REAL,
        description TEXT NOT NULL,
        reproduction_steps TEXT NOT NULL,
        evidence_text TEXT,
        evidence_attachment_url TEXT,
        impact_analysis TEXT NOT NULL,
        recommended_remediation TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'submitted',
        points_awarded INTEGER DEFAULT 0,
        instructor_feedback TEXT,
        reviewed_by_user_id INTEGER REFERENCES users(id),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP
    );
    """)

    # 4. SOC ANALYST SIMULATOR TABLES
    cur.execute("""
    CREATE TABLE IF NOT EXISTS soc_scenarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        attack_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT,
        initial_alerts_json TEXT,
        logs_json TEXT,
        correct_classification TEXT,
        correct_containment_actions_json TEXT,
        correct_remediation TEXT,
        post_incident_debrief TEXT,
        xp_reward INTEGER DEFAULT 250,
        is_active INTEGER DEFAULT 1
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS soc_investigations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES users(id),
        scenario_id INTEGER NOT NULL REFERENCES soc_scenarios(id),
        status TEXT NOT NULL DEFAULT 'in_progress',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        pinned_evidence_json TEXT DEFAULT '[]',
        selected_containment_actions_json TEXT DEFAULT '[]',
        student_classification TEXT,
        student_severity TEXT,
        root_cause_analysis TEXT,
        remediation_recommendation TEXT,
        accuracy_score INTEGER DEFAULT 0,
        feedback_json TEXT,
        time_taken_seconds INTEGER DEFAULT 0
    );
    """)

    # 5. EMPLOYER HIRING PORTAL TABLES
    cur.execute("""
    CREATE TABLE IF NOT EXISTS employer_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        company_name TEXT NOT NULL,
        industry TEXT DEFAULT 'Cybersecurity & Defense',
        website TEXT,
        contact_email TEXT NOT NULL,
        contact_person TEXT,
        is_verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS employer_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employer_id INTEGER NOT NULL REFERENCES employer_profiles(id),
        title TEXT NOT NULL,
        job_type TEXT NOT NULL DEFAULT 'Full-time',
        location TEXT DEFAULT 'Remote / Hybrid (India)',
        stipend_or_salary TEXT,
        required_skills_json TEXT,
        description TEXT,
        responsibilities TEXT,
        requirements TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS job_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL REFERENCES employer_jobs(id),
        student_id INTEGER NOT NULL REFERENCES users(id),
        cover_letter TEXT,
        resume_url TEXT,
        passport_token TEXT,
        status TEXT NOT NULL DEFAULT 'applied',
        interview_details_json TEXT,
        employer_feedback TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, student_id)
    );
    """)

    # 6. PROJECT EVALUATION TABLES
    cur.execute("""
    CREATE TABLE IF NOT EXISTS student_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES users(id),
        course_id TEXT REFERENCES courses(id),
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        repository_url TEXT,
        source_archive_url TEXT,
        documentation_url TEXT,
        screenshots_json TEXT DEFAULT '[]',
        demo_video_url TEXT,
        submission_comments TEXT,
        status TEXT NOT NULL DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS project_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES student_projects(id),
        reviewer_user_id INTEGER NOT NULL REFERENCES users(id),
        technical_score INTEGER DEFAULT 0,
        creativity_score INTEGER DEFAULT 0,
        security_score INTEGER DEFAULT 0,
        functionality_score INTEGER DEFAULT 0,
        documentation_score INTEGER DEFAULT 0,
        presentation_score INTEGER DEFAULT 0,
        total_marks INTEGER DEFAULT 0,
        grade_letter TEXT DEFAULT 'B',
        written_feedback TEXT NOT NULL,
        decision TEXT NOT NULL,
        reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    con.commit()
    print("Tables created successfully.")

    # =========================================================================
    # SEED INITIAL DATA
    # =========================================================================

    # 1. Seed Cyber Range Labs (7 core categories)
    cur.execute("SELECT COUNT(*) FROM cyber_range_labs")
    if cur.fetchone()[0] == 0:
        print("Seeding Cyber Range Labs...")
        labs = [
            (
                "Linux Privilege Escalation via SUID",
                "Linux Fundamentals",
                "Intermediate",
                45,
                200,
                "Audit a simulated Debian server to identify misconfigured SUID binaries and escalate from unprivileged user 'cadet' to root.",
                json.dumps([
                    "Inspect system binaries with SUID bit set using find command",
                    "Analyze unusual binary /usr/local/bin/backup_agent",
                    "Exploit environment variable path hijacking to obtain root shell",
                    "Read the flag from /root/flag.txt"
                ]),
                json.dumps([
                    "Try running: find / -perm -u=s -type f 2>/dev/null",
                    "Examine strings in /usr/local/bin/backup_agent",
                    "Check if the binary calls system commands without absolute paths"
                ]),
                "CYBERPRO{suid_privesc_root_pwned_8492}",
                "terminal",
                json.dumps({
                    "/home/student": {
                        "notes.txt": "Target system audit: Check for SUID binaries in /usr/local/bin\nRemember to submit flag format: CYBERPRO{...}",
                        "target_info.json": '{"hostname": "corp-srv-01", "ip": "10.10.14.55", "os": "Debian GNU/Linux 12"}'
                    },
                    "/usr/local/bin": {
                        "backup_agent": "[ELF-BINARY: calls tar without full path]"
                    },
                    "/root": {
                        "flag.txt": "CYBERPRO{suid_privesc_root_pwned_8492}"
                    }
                })
            ),
            (
                "Network Reconnaissance & Port Scanning",
                "Networking",
                "Beginner",
                30,
                150,
                "Perform active network scanning against target perimeter host 10.10.20.10. Enumerate open ports, identify running daemon versions, and locate hidden maintenance services.",
                json.dumps([
                    "Perform TCP SYN stealth scan against target IP 10.10.20.10",
                    "Enumerate service banners on open ports (80, 22, 8080, 9999)",
                    "Connect to custom administrative listener on port 9999 using nc or curl",
                    "Extract the operational flag token"
                ]),
                json.dumps([
                    "Use nmap -sV -p- 10.10.20.10",
                    "Netcat command: nc 10.10.20.10 9999"
                ]),
                "CYBERPRO{nmap_stealth_recon_reconnaissance_019}",
                "terminal",
                json.dumps({
                    "/home/student": {
                        "rules_of_engagement.txt": "Target Range: 10.10.20.0/24\nPrimary Target: 10.10.20.10\nPermitted Tools: nmap, nc, ping, traceroute, curl"
                    }
                })
            ),
            (
                "SQL Injection: Authentication Bypass",
                "Web Application Security",
                "Beginner",
                30,
                175,
                "Analyze a vulnerable internal corporate portal. Exploit SQL injection flaws in the username login field to bypass credential validation and extract confidential credentials.",
                json.dumps([
                    "Inspect the login request parameters sent to /api/auth/login",
                    "Formulate SQL injection payload: admin' -- or ' OR 1=1 --",
                    "Bypass authentication and access the administrator dashboard",
                    "Locate and verify flag in the executive secrets vault"
                ]),
                json.dumps([
                    "Look at how quotes are handled in the input parameter",
                    "Try: admin' OR '1'='1"
                ]),
                "CYBERPRO{sqli_auth_bypass_executive_vault_482}",
                "terminal",
                json.dumps({
                    "/home/student": {
                        "target_url.txt": "http://10.10.30.50/portal/login\nParam: username\nMethod: POST"
                    }
                })
            ),
            (
                "Wireless Handshake Cracking & WPA2 Analysis",
                "Ethical Hacking",
                "Intermediate",
                60,
                250,
                "Analyze captured 4-way WPA2 802.11 handshake PCAP file. Use aircrack-ng with custom cybersecurity wordlists to recover the network passphrase and decrypt internal traffic.",
                json.dumps([
                    "Verify EAPOL packets in capture file wifi_corp.pcap",
                    "Execute aircrack-ng with wordlist cyberpro_wordlist.txt",
                    "Extract the plaintext pre-shared key (PSK)",
                    "Decrypt traffic and locate flag in internal HTTP GET request"
                ]),
                json.dumps([
                    "aircrack-ng -w wordlist.txt -b 00:14:6C:7E:40:80 wifi_corp.pcap"
                ]),
                "CYBERPRO{wpa2_handshake_cracked_aircrack_9921}",
                "terminal",
                json.dumps({
                    "/home/student": {
                        "wifi_corp.pcap": "[802.11 4-Way Handshake PCAP Data]",
                        "wordlist.txt": "password\nadmin123\ncybersec2026\nCyberProDefense@2026\nhacking101\nsecretpass"
                    }
                })
            ),
            (
                "Automated Vulnerability Assessment with Nikto & OpenVAS",
                "Vulnerability Assessment",
                "Intermediate",
                45,
                180,
                "Deploy security auditing tools against an outdated Apache web server. Identify unpatched CVEs, outdated modules, directory indexing leaks, and dangerous HTTP methods.",
                json.dumps([
                    "Launch automated scanner against target http://10.10.40.25",
                    "Identify critical CVE in Apache mod_proxy",
                    "Exploit path traversal to read /etc/shadow or configuration file",
                    "Retrieve assessment flag from the vulnerable server"
                ]),
                json.dumps([
                    "nikto -h 10.10.40.25",
                    "Check /server-status and /icons/ directory indexing"
                ]),
                "CYBERPRO{vuln_assessment_nikto_cve_remediated_339}",
                "terminal",
                json.dumps({
                    "/home/student": {
                        "scope.txt": "Target: 10.10.40.25\nService: Apache 2.4.49 (Vulnerable to Path Traversal CVE-2021-41773)"
                    }
                })
            ),
            (
                "Memory Dump Forensics with Volatility",
                "Digital Forensics",
                "Advanced",
                60,
                300,
                "Examine raw Windows memory capture (memdump.raw) from a compromised workstation. Recover injected DLLs, identify active C2 connections, and extract malicious process trees.",
                json.dumps([
                    "Determine Volatility OS profile for memory capture",
                    "List running processes using pslist and pstree",
                    "Identify hidden process spawned by svchost.exe",
                    "Dump memory segments and recover attacker C2 IP and flag string"
                ]),
                json.dumps([
                    "volatility -f memdump.raw imageinfo",
                    "volatility -f memdump.raw --profile=Win10x64_19041 psxview",
                    "volatility -f memdump.raw --profile=Win10x64_19041 malfind"
                ]),
                "CYBERPRO{volatility_memory_forensics_c2_extracted_774}",
                "terminal",
                json.dumps({
                    "/home/student": {
                        "case_brief.txt": "Incident #INC-8921: Suspected Cobalt Strike Beacon\nFile: /evidence/memdump.raw (256MB memory sample)"
                    }
                })
            ),
            (
                "Incident Response: Active Ransomware Containment",
                "Incident Response",
                "Advanced",
                60,
                300,
                "A corporate domain controller is undergoing active encryption. Identify patient zero, terminate malicious scheduled tasks, block exfiltration IPs on iptables, and restore encrypted files.",
                json.dumps([
                    "Analyze auth.log to find initial malicious credential access",
                    "Kill active rogue process encryptor.py running under PID 4120",
                    "Block outgoing C2 IP 198.51.100.44 via iptables",
                    "Decrypt emergency master key and rescue corporate database flag"
                ]),
                json.dumps([
                    "Check ps aux | grep -i encrypt",
                    "Review crontab -l and /etc/cron.*",
                    "iptables -A OUTPUT -d 198.51.100.44 -j DROP"
                ]),
                "CYBERPRO{ir_containment_ransomware_neutralized_5510}",
                "terminal",
                json.dumps({
                    "/home/student": {
                        "incident_log.txt": "ALARM: Multiple workstations reporting file extension .locked\nImmediate action required to stop lateral movement."
                    }
                })
            )
        ]

        for lab in labs:
            cur.execute("""
            INSERT INTO cyber_range_labs 
            (title, category, difficulty, duration_minutes, xp_reward, description, objectives_json, hints_json, flag, environment_type, initial_fs_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, lab)

    # 2. Seed Bug Bounty Challenges (8 core categories)
    cur.execute("SELECT COUNT(*) FROM bug_bounty_challenges")
    if cur.fetchone()[0] == 0:
        print("Seeding Bug Bounty Challenges...")
        challenges = [
            (
                "Legacy Order API SQL Injection",
                "SQL Injection",
                "Medium",
                250,
                750,
                "/api/training/targets/vulnerable-orders?order_id=1",
                "In-scope: Search and filter endpoint on order management service. Out-of-scope: Denial of service or automated bruteforce.",
                "The endpoint concatenates user input directly into SQLite SELECT query without parameterization.",
                "Inject a UNION SELECT statement to pull data from sqlite_master or users table.",
                "CYBERPRO{bounty_union_sqli_orders_dump_839}"
            ),
            (
                "Reflected XSS in Global Search Bar",
                "Cross-Site Scripting (XSS)",
                "Easy",
                150,
                500,
                "/api/training/targets/vulnerable-search?q=test",
                "In-scope: /api/training/targets/vulnerable-search query parameter reflection.",
                "Search term parameter is reflected directly inside HTML output without sanitization or HTML entity encoding.",
                "Test standard script tag payload: <script>alert(document.domain)</script> or img onerror event.",
                "CYBERPRO{bounty_reflected_xss_sanitization_missing_119}"
            ),
            (
                "JWT Signature Stripping / None Algorithm",
                "Authentication Vulnerabilities",
                "Hard",
                350,
                1000,
                "/api/training/targets/vulnerable-auth/verify",
                "In-scope: Authentication verification endpoint accepting Authorization Bearer token.",
                "Server accepts JWTs with 'alg': 'none', allowing arbitrary claim modification including role='superadmin'.",
                "Modify header to alg: none, change payload role to superadmin, and strip cryptographic signature.",
                "CYBERPRO{bounty_jwt_alg_none_auth_bypass_662}"
            ),
            (
                "Insecure Direct Object Reference (IDOR) on Student Profiles",
                "Access Control Issues",
                "Medium",
                250,
                750,
                "/api/training/targets/vulnerable-profile?student_id=102",
                "In-scope: /api/training/targets/vulnerable-profile with parameter student_id.",
                "Endpoint does not verify whether the requesting session owns the requested student_id.",
                "Iterate student_id to 1 or 2 to view root administrative personal details and private tokens.",
                "CYBERPRO{bounty_idor_broken_object_level_auth_441}"
            ),
            (
                "Public Git Repository & Environment Secret Exposure",
                "Security Misconfiguration",
                "Easy",
                150,
                500,
                "/api/training/targets/vulnerable-misconfig/.git/config",
                "In-scope: Web server root file disclosures.",
                "The deployment pipeline inadvertently published the .git directory containing commit logs and .env database secrets.",
                "Inspect .git/HEAD and .git/logs/HEAD to trace commit history exposing API keys.",
                "CYBERPRO{bounty_git_leak_exposed_env_secrets_903}"
            ),
            (
                "Unrestricted File Upload Leading to Remote Code Execution",
                "File Upload Vulnerabilities",
                "Critical",
                450,
                1500,
                "/api/training/targets/vulnerable-upload",
                "In-scope: Document upload handler for student avatar or project submission.",
                "File extension is validated only on client-side JS; backend saves executable .php/.phtml/.py files in web accessible directory.",
                "Bypass client checks by submitting POST directly with .phtml or .py file payload containing system command execution.",
                "CYBERPRO{bounty_unrestricted_upload_rce_shell_299}"
            ),
            (
                "Mass Assignment in Student Registration API",
                "API Security",
                "Medium",
                250,
                750,
                "/api/training/targets/vulnerable-register",
                "In-scope: JSON POST endpoint for user account update.",
                "Endpoint blindly maps all JSON keys to the database user record, permitting parameters like 'is_admin': true or 'credits': 99999.",
                "Include 'is_admin': true in your profile update payload.",
                "CYBERPRO{bounty_mass_assignment_privilege_escalation_712}"
            ),
            (
                "Debug Stack Trace & Sensitive PII Leak in Error Response",
                "Information Disclosure",
                "Easy",
                150,
                500,
                "/api/training/targets/vulnerable-debug?err=trigger",
                "In-scope: HTTP 500 error handler responses.",
                "Application runs in production with DEBUG=True enabled, dumping full stack trace, environment variables, and database credentials on unhandled exceptions.",
                "Send malformed data to trigger unhandled exception and examine stack trace environment variables.",
                "CYBERPRO{bounty_info_disclosure_debug_stacktrace_885}"
            )
        ]

        for c in challenges:
            cur.execute("""
            INSERT INTO bug_bounty_challenges
            (title, category, difficulty, points, bounty_reward_inr, target_endpoint, scope_description, vulnerability_summary, hint, flag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, c)

    # 3. Seed SOC Analyst Simulator Scenarios (8 realistic incident types)
    cur.execute("SELECT COUNT(*) FROM soc_scenarios")
    if cur.fetchone()[0] == 0:
        print("Seeding SOC Analyst Scenarios...")
        scenarios = [
            (
                "SSH Distributed Brute-force & Lateral Movement Detection",
                "Brute-force SSH",
                "HIGH",
                "SIEM alerts indicate 1,420 failed SSH authentication attempts across 3 external IP addresses targeting internal bastion server 10.0.1.5 followed by a single successful root login.",
                json.dumps([
                    {"id": "ALT-101", "time": "2026-11-09 21:04:12", "severity": "HIGH", "rule": "SSH Authentication Spike: >500 attempts in 5m", "source": "194.26.29.112"},
                    {"id": "ALT-102", "time": "2026-11-09 21:08:44", "severity": "CRITICAL", "rule": "Successful SSH Login after multiple failures", "source": "194.26.29.112", "user": "root"}
                ]),
                json.dumps([
                    {"timestamp": "21:04:02", "src_ip": "194.26.29.112", "dest_ip": "10.0.1.5", "proto": "SSH", "event": "Failed password for cadet from 194.26.29.112 port 48212"},
                    {"timestamp": "21:04:05", "src_ip": "185.220.101.5", "dest_ip": "10.0.1.5", "proto": "SSH", "event": "Failed password for admin from 185.220.101.5 port 55104"},
                    {"timestamp": "21:08:44", "src_ip": "194.26.29.112", "dest_ip": "10.0.1.5", "proto": "SSH", "event": "Accepted password for root from 194.26.29.112 port 48390 ssh2"},
                    {"timestamp": "21:09:15", "src_ip": "10.0.1.5", "dest_ip": "10.0.2.20", "proto": "SMB", "event": "SMB2 Session Setup to Domain Controller from 10.0.1.5"}
                ]),
                "SSH Brute-Force & Compromised Root Account",
                json.dumps(["Block External IPs (194.26.29.112, 185.220.101.5) on Edge Firewall", "Isolate Compromised Bastion Host 10.0.1.5 from Network", "Rotate Root Credentials & Force Immediate Session Terminations", "Audit Domain Controller SMB Session"]),
                "Implement Fail2ban or CrowdSec, disable root SSH password login, enforce SSH public-key authentication with hardware 2FA tokens.",
                "The attacker used dictionary brute-force against port 22. Because root login was allowed with weak passwords, the adversary successfully established a foothold and immediately attempted lateral movement over SMB to the internal Domain Controller."
            ),
            (
                "Executive Spear-Phishing with Macro Dropper Attachment",
                "Spear Phishing",
                "CRITICAL",
                "An email claiming to be an urgent CFO wire transfer request arrived at accounts@cyberpro.in containing macro-enabled spreadsheet 'Q4_Executive_Bonus_Wire.xlsm'. EDR logged abnormal PowerShell spawning from Excel.",
                json.dumps([
                    {"id": "ALT-201", "time": "2026-11-09 21:15:30", "severity": "CRITICAL", "rule": "Suspicious Child Process: EXCEL.EXE spawned POWERSHELL.EXE", "host": "WKS-ACC-04"}
                ]),
                json.dumps([
                    {"timestamp": "21:14:02", "src_ip": "smtp.external-spoof.net", "dest_ip": "mail.cyberpro.in", "proto": "SMTP", "event": "Delivered message 'Q4_Executive_Bonus_Wire.xlsm' from cfo-spoofed@cyberpro.co"},
                    {"timestamp": "21:15:28", "src_ip": "10.0.4.12", "dest_ip": "-", "proto": "EDR", "event": "Process Creation: excel.exe (PID 6104) opened by user priya.sharma"},
                    {"timestamp": "21:15:30", "src_ip": "10.0.4.12", "dest_ip": "-", "proto": "EDR", "event": "Process Creation: powershell.exe -enc SQBFAFgA... (PID 8820)"},
                    {"timestamp": "21:15:33", "src_ip": "10.0.4.12", "dest_ip": "198.51.100.77", "proto": "HTTPS", "event": "Outbound connection to known C2 staging server 198.51.100.77:443"}
                ]),
                "Spear-Phishing Macro Dropper & Cobalt Strike Beacon",
                json.dumps(["Isolate Workstation WKS-ACC-04 Immediately", "Block C2 IP 198.51.100.77 on Perimeter Gateway", "Purge Phishing Email from All Mailboxes via Exchange/O365 Admin", "Reset Credentials for user priya.sharma"]),
                "Enforce Attack Surface Reduction (ASR) rules blocking Office apps from spawning child processes; quarantine all incoming macro attachments; configure strict SPF, DKIM, and DMARC enforcement.",
                "User executed a malicious macro that executed an obfuscated PowerShell base64 command downloading a stage-2 Cobalt Strike beacon connecting to 198.51.100.77."
            ),
            (
                "Unusual Account Privilege Escalation & Shadow Admin Creation",
                "Privilege Escalation",
                "HIGH",
                "A junior helpdesk account with standard privileges suddenly invoked net group 'Domain Admins' /add, creating a hidden administrative user 'backup_svc_admin' at 02:45 AM.",
                json.dumps([
                    {"id": "ALT-301", "time": "2026-11-09 02:45:11", "severity": "HIGH", "rule": "Privileged Security Group Modification: Domain Admins member added", "user": "helpdesk_ananya"}
                ]),
                json.dumps([
                    {"timestamp": "02:44:00", "src_ip": "10.0.3.45", "dest_ip": "10.0.0.1", "proto": "Kerberos", "event": "AS-REP Roasting activity detected against account svc_sql_backup"},
                    {"timestamp": "02:45:05", "src_ip": "10.0.3.45", "dest_ip": "10.0.0.1", "proto": "ActiveDirectory", "event": "User account created: backup_svc_admin"},
                    {"timestamp": "02:45:11", "src_ip": "10.0.3.45", "dest_ip": "10.0.0.1", "proto": "ActiveDirectory", "event": "User backup_svc_admin added to 'Domain Admins'"}
                ]),
                "Kerberoasting Attack & Persistence via Shadow Domain Admin",
                json.dumps(["Disable Rogue Account 'backup_svc_admin'", "Disable Compromised Account 'helpdesk_ananya'", "Isolate Workstation 10.0.3.45", "Rotate krbtgt and Service Account Passwords"]),
                "Apply Group Managed Service Accounts (gMSA), disable DES/RC4 encryption in Kerberos, implement Active Directory Tiering architecture.",
                "The adversary abused the helpdesk account to perform Kerberoasting on vulnerable SPNs, cracked the service ticket, and escalated to Domain Admin to establish persistence."
            ),
            (
                "DNS Tunneling & High-Volume Data Exfiltration",
                "Data Exfiltration",
                "CRITICAL",
                "Internal DNS resolver recorded an unprecedented spike of 45,000 TXT query requests to subdomains of 'cdn-sync-telemetry.xyz' over a 20-minute window, transferring encoded corporate records.",
                json.dumps([
                    {"id": "ALT-401", "time": "2026-11-09 22:10:00", "severity": "CRITICAL", "rule": "High-Volume DNS Query Anomaly / Tunneling Detected", "domain": "cdn-sync-telemetry.xyz"}
                ]),
                json.dumps([
                    {"timestamp": "22:00:15", "src_ip": "10.0.5.88", "dest_ip": "10.0.0.2", "proto": "DNS", "event": "Query TXT aXNfY29ycF9zZWNyZXRz.cdn-sync-telemetry.xyz"},
                    {"timestamp": "22:05:40", "src_ip": "10.0.5.88", "dest_ip": "10.0.0.2", "proto": "DNS", "event": "Query TXT bXlfc3FsX2R1bXBfY3Vi.cdn-sync-telemetry.xyz (Length: 245 bytes)"},
                    {"timestamp": "22:15:20", "src_ip": "10.0.5.88", "dest_ip": "10.0.0.2", "proto": "DNS", "event": "45,210 requests sent in 15 minutes, 14.8MB encoded payload"}
                ]),
                "DNS Tunneling Exfiltration via Rogue Internal Machine",
                json.dumps(["Isolate Source Workstation 10.0.5.88", "Null-route / Sinkhole Domain cdn-sync-telemetry.xyz on DNS Resolvers", "Capture Memory and Disk Triage on 10.0.5.88", "Notify Privacy Officer for Data Breach Assessment"]),
                "Implement DNS inspection with Response Policy Zones (RPZ), restrict outbound UDP/TCP 53 to authoritative internal forwarders only, inspect query payload entropy.",
                "Malware bypassed standard web gateway firewalls by using DNS TXT record tunneling (iodine / dnscat2) to exfiltrate database records encoded in base64 subdomains."
            )
        ]

        for s in scenarios:
            cur.execute("""
            INSERT INTO soc_scenarios
            (title, attack_type, severity, description, initial_alerts_json, logs_json, correct_classification, correct_containment_actions_json, correct_remediation, post_incident_debrief)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, s)

    # 4. Seed Employer Profiles & Jobs
    cur.execute("SELECT COUNT(*) FROM employer_profiles")
    if cur.fetchone()[0] == 0:
        print("Seeding Employer Profiles & Job Postings...")
        employers = [
            ("CyberPro Defense Labs", "Managed Detection & Response (MDR)", "https://defense.cyberpro.in", "careers@defense.cyberpro.in", "Vikramaditya Sen (Head of Talent)"),
            ("SecOps Horizon Systems", "Cloud Security & DevSecOps", "https://horizonsec.io", "hr@horizonsec.io", "Rhea Kapoor (Technical Recruiter)"),
            ("Sentinel Threat Intelligence", "Threat Hunting & Forensics", "https://sentinelthreat.com", "hiring@sentinelthreat.com", "Arjun Nambiar (SOC Director)")
        ]
        for emp in employers:
            cur.execute("""
            INSERT INTO employer_profiles (company_name, industry, website, contact_email, contact_person)
            VALUES (?, ?, ?, ?, ?)
            """, emp)

        jobs = [
            (
                1,
                "Junior SOC Tier-1 Analyst",
                "Full-time",
                "Bengaluru / Hybrid",
                "₹6,50,000 - ₹8,50,000 / year",
                json.dumps(["SIEM (Splunk/ELK)", "Incident Response", "Network Analysis (Wireshark)", "Linux", "Threat Triaging"]),
                "We are seeking enthusiastic junior cybersecurity analysts to join our 24/7 Security Operations Center. You will monitor, triage, and investigate live security telemetry, analyze alert logs, and coordinate immediate containment.",
                "Monitor SIEM alerts, execute containment playbooks, document incident tickets, and participate in threat hunting drills.",
                "Completion of CyberPro Ethical Hacking or SOC track, verified practical lab scores, understanding of MITRE ATT&CK framework."
            ),
            (
                1,
                "Cybersecurity Incident Response Intern",
                "Internship",
                "Remote (India)",
                "₹30,000 / month Stipend",
                json.dumps(["Digital Forensics", "Memory Analysis", "Python Scripting", "Malware Triage"]),
                "Exciting 6-month hands-on internship in our digital forensics and incident response (DFIR) unit. Work alongside senior responders analyzing breach artifacts.",
                "Assist in memory dump forensics, reverse engineer malicious scripts, compile post-incident summaries.",
                "Enrolled in or graduate of CyberPro Academy, active Skill Passport with verified digital forensics badge."
            ),
            (
                2,
                "Junior Web Application Penetration Tester",
                "Full-time",
                "Pune / Remote",
                "₹7,00,000 - ₹9,50,000 / year",
                json.dumps(["OWASP Top 10", "Burp Suite", "API Security", "SQL Injection", "XSS"]),
                "Perform black-box and grey-box security assessments on client enterprise web applications, mobile APIs, and cloud services.",
                "Identify high-impact vulnerabilities, prepare detailed technical assessment reports with CVSS scoring, demonstrate POCs.",
                "Demonstrated Bug Bounty Arena points or approved penetration testing projects on CyberPro platform."
            ),
            (
                3,
                "Threat Intelligence & OSINT Researcher",
                "Full-time",
                "Gurugram / Hybrid",
                "₹6,00,000 - ₹8,00,000 / year",
                json.dumps(["OSINT", "Threat Intelligence", "Malware Analysis", "Dark Web Monitoring"]),
                "Collect, correlate, and analyze adversary indicators of compromise (IOCs) across public and private intelligence feeds.",
                "Track threat actor campaigns, author threat intelligence briefs, build defensive detection rules (YARA/Sigma).",
                "Strong analytical mindset, active CyberPro portfolio showcase, passion for cyber threat defense."
            )
        ]

        for job in jobs:
            cur.execute("""
            INSERT INTO employer_jobs
            (employer_id, title, job_type, location, stipend_or_salary, required_skills_json, description, responsibilities, requirements)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, job)

    # 5. Seed Initial Skill Passport & Portfolio Settings for Students
    print("Seeding initial Skill Passport & Portfolio records for students...")
    students = cur.execute("SELECT u.id, u.name, u.email, sp.student_id FROM users u JOIN student_profiles sp ON u.id = sp.user_id WHERE u.role='student'").fetchall()
    for s_id, s_name, s_email, s_code in students:
        # Check portfolio settings
        cur.execute("SELECT student_id FROM student_portfolio_settings WHERE student_id=?", (s_id,))
        if not cur.fetchone():
            token = f"CP-PASS-{s_code}-{secrets.token_hex(4).upper()}"
            cur.execute("""
            INSERT INTO student_portfolio_settings (student_id, passport_token, is_public, allow_employer_discovery, bio, headline)
            VALUES (?, ?, 1, 1, ?, ?)
            """, (
                s_id,
                token,
                f"Aspiring cybersecurity professional and ethical hacker training at CYBERPRO Academy. Hands-on experience in defensive operations, penetration testing, and incident investigation.",
                "Junior Cybersecurity & Threat Defense Specialist"
            ))

        # Check initial verified skills from their enrolled courses
        initial_skills = [
            ("Linux System Hardening", "Offensive Security", "practiced", "course"),
            ("Network Packet Inspection", "Network Security", "learning", "course"),
            ("OWASP Vulnerability Assessment", "Application Security", "learning", "course"),
            ("SIEM Log Triaging", "Defensive Security & SOC", "learning", "course")
        ]
        for sk_name, sk_cat, sk_lvl, sk_mod in initial_skills:
            cur.execute("""
            INSERT OR IGNORE INTO skill_passport_skills (student_id, skill_name, category, level, source_module)
            VALUES (?, ?, ?, ?, ?)
            """, (s_id, sk_name, sk_cat, sk_lvl, sk_mod))

    # 6. Seed Sample Project Submissions & Reviews
    cur.execute("SELECT COUNT(*) FROM student_projects")
    if cur.fetchone()[0] == 0:
        print("Seeding Sample Student Projects & Reviews...")
        cur.execute("SELECT id FROM users WHERE role='student' LIMIT 2")
        sample_students = cur.fetchall()
        if sample_students:
            st1 = sample_students[0][0]
            cur.execute("""
            INSERT INTO student_projects 
            (student_id, course_id, title, category, description, repository_url, documentation_url, demo_video_url, status)
            VALUES (?, 'ccce', 'Automated Port Scanner & Vulnerability Detector in Python', 'Defensive Tooling', 
            'A multi-threaded Python 3 security scanner utilizing raw sockets and banner grabbing to detect outdated Apache and SSH services with automated CVSS severity classification.',
            'https://github.com/cyberpro-student/net-vuln-scanner',
            'https://cyberpro.in/docs/project_net_scanner.pdf',
            'https://youtube.com/watch?v=sample_scanner_demo',
            'approved')
            """, (st1,))
            proj_id = cur.lastrowid

            # Review by admin (user 1)
            cur.execute("""
            INSERT INTO project_reviews
            (project_id, reviewer_user_id, technical_score, creativity_score, security_score, functionality_score, documentation_score, presentation_score, total_marks, grade_letter, written_feedback, decision)
            VALUES (?, 1, 19, 14, 18, 19, 14, 9, 93, 'A+', 
            'Outstanding architecture and robust multi-threading implementation. Excellent exception handling for network timeouts. Approved for student Skill Passport portfolio showcase!',
            'approved')
            """, (proj_id,))

            # Add verified skill to passport
            cur.execute("""
            INSERT OR REPLACE INTO skill_passport_skills 
            (student_id, skill_name, category, level, source_module, source_reference_id, verified_by_user_id, verified_at)
            VALUES (?, 'Python Security Tooling', 'Defensive Security & SOC', 'verified', 'project', ?, 1, CURRENT_TIMESTAMP)
            """, (st1, str(proj_id)))

    con.commit()
    con.close()
    print("MIGRATION COMPLETED SUCCESSFULLY!")

if __name__ == '__main__':
    run_migration()
