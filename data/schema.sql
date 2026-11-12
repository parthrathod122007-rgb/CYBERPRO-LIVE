-- CYBERPRO Clean Database Schema & Public Catalog Seed
-- Excludes all user accounts, password hashes, sessions, tokens, and personal inquiries.
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_user_id INTEGER NOT NULL REFERENCES users(id),
            action TEXT NOT NULL,
            target_entity TEXT NOT NULL,
            target_id TEXT NOT NULL,
            details TEXT DEFAULT '',
            ip_address TEXT DEFAULT '',
            created_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS assignment_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assignment_id INTEGER NOT NULL REFERENCES assignments(id),
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            submission_text TEXT,
            file_url TEXT,
            grade TEXT DEFAULT 'Pending',
            feedback TEXT DEFAULT '',
            submitted_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id TEXT NOT NULL REFERENCES courses(id),
            title TEXT NOT NULL,
            description TEXT,
            due_date INTEGER,
            created_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS attendance_security_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            attendance_id INTEGER,
            schedule_id INTEGER,
            user_id INTEGER,
            student_email TEXT,
            student_phone TEXT,
            event_type TEXT,
            ip_address TEXT,
            user_agent TEXT,
            details TEXT,
            created_at INTEGER NOT NULL
        );
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
CREATE TABLE IF NOT EXISTS certificate_verification_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            certificate_code TEXT NOT NULL,
            student_name TEXT,
            course_name TEXT,
            verification_hash TEXT NOT NULL,
            verified_at INTEGER NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            status TEXT NOT NULL
        );
CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id TEXT NOT NULL REFERENCES courses(id),
            certificate_code TEXT NOT NULL UNIQUE,
            issued_at INTEGER NOT NULL,
            verification_hash TEXT NOT NULL
        , student_name TEXT, student_email TEXT, student_id TEXT, course_name TEXT, grade TEXT, status TEXT DEFAULT 'valid', issued_by_admin_id INTEGER DEFAULT 1, verification_count INTEGER DEFAULT 0, last_verified_at INTEGER, notes TEXT, created_at INTEGER);
CREATE TABLE IF NOT EXISTS class_attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            live_class_id INTEGER REFERENCES live_classes(id) ON DELETE SET NULL,
            schedule_id INTEGER REFERENCES class_schedules(id) ON DELETE SET NULL,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id TEXT NOT NULL DEFAULT 'ccce',
            student_name TEXT DEFAULT '',
            student_email TEXT DEFAULT '',
            student_phone TEXT DEFAULT '',
            joined_at INTEGER DEFAULT NULL,
            left_at INTEGER DEFAULT NULL,
            duration_seconds INTEGER NOT NULL DEFAULT 0,
            reconnect_count INTEGER NOT NULL DEFAULT 0,
            attendance_status TEXT NOT NULL DEFAULT 'absent', -- 'live', 'attended', 'left_early', 'absent'
            is_active_now INTEGER NOT NULL DEFAULT 0,
            last_heartbeat_at INTEGER DEFAULT NULL,
            active_token TEXT DEFAULT NULL,
            ip_address TEXT DEFAULT '',
            user_agent TEXT DEFAULT '',
            device_fingerprint TEXT DEFAULT '',
            duplicate_attempt_count INTEGER NOT NULL DEFAULT 0,
            whatsapp_reminded_at INTEGER DEFAULT NULL,
            whatsapp_reminder_count INTEGER NOT NULL DEFAULT 0,
            whatsapp_status TEXT DEFAULT 'pending', -- 'pending', 'sent'
            notes TEXT DEFAULT '',
            created_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS class_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,          -- 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    class_date TEXT,                       -- Optional specific date YYYY-MM-DD
    start_time TEXT NOT NULL,              -- e.g. '10:00 AM'
    end_time TEXT NOT NULL,                -- e.g. '11:30 AM'
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    meeting_link TEXT NOT NULL,
    meeting_type TEXT DEFAULT 'Google Meet',
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'upcoming',        -- 'upcoming', 'live', 'completed', 'cancelled'
    is_active INTEGER DEFAULT 1,
    created_by_admin_id INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT DEFAULT '',
            subject TEXT DEFAULT '',
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'new',
            created_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS course_enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            enrollment_date INTEGER NOT NULL,
            access_status TEXT NOT NULL DEFAULT 'locked',
            unlocked_at INTEGER,
            expires_at INTEGER,
            granted_by_user_id INTEGER,
            notes TEXT DEFAULT '',
            UNIQUE(user_id, course_id)
        );
CREATE TABLE IF NOT EXISTS courses (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            description TEXT,
            total_fee REAL NOT NULL DEFAULT 4000.0,
            duration_weeks INTEGER NOT NULL DEFAULT 24,
            total_modules INTEGER NOT NULL DEFAULT 27,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS customer_enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    full_name TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    location TEXT DEFAULT '',
    interested_course TEXT DEFAULT '',
    knowledge_level TEXT DEFAULT '',
    background TEXT DEFAULT '',
    learning_goal TEXT DEFAULT '',
    preferred_schedule TEXT DEFAULT '',
    requirements TEXT DEFAULT '',
    conversation_summary TEXT DEFAULT '',
    conversation_history TEXT DEFAULT '[]',
    status TEXT DEFAULT 'new',
    lead_score INTEGER DEFAULT 50,
    follow_up_pref TEXT DEFAULT 'WhatsApp',
    admin_notes TEXT DEFAULT '',
    consent_status INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER
, interest_tier TEXT DEFAULT 'interested', source TEXT DEFAULT 'ai_chatbot');
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
CREATE TABLE IF NOT EXISTS database_backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL,
    filepath TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    file_size_human TEXT NOT NULL,
    tables_count INTEGER NOT NULL,
    total_records INTEGER NOT NULL,
    backup_type TEXT DEFAULT 'manual',
    created_by INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    status TEXT DEFAULT 'verified'
);
CREATE TABLE IF NOT EXISTS downloaded_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'financial', 'leads', 'academics', 'certificates', 'security'
    report_type TEXT NOT NULL, -- 'emi_pending', 'full_payments', 'most_interested', 'interested', 'least_interested', 'attendance', 'schedule', 'performance', 'certificates', 'curriculum_deck'
    format TEXT NOT NULL, -- 'PDF', 'CSV', 'PPT'
    file_size TEXT,
    records_count INTEGER,
    download_url TEXT,
    downloaded_by TEXT DEFAULT 'Parth Rathod (Super Administrator)',
    created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS emi_installments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id TEXT NOT NULL REFERENCES courses(id),
            installment_number INTEGER NOT NULL,
            amount_due REAL NOT NULL,
            due_date INTEGER NOT NULL,
            amount_paid REAL NOT NULL DEFAULT 0.0,
            status TEXT NOT NULL DEFAULT 'pending',
            paid_at INTEGER,
            payment_id INTEGER REFERENCES payments(id)
        );
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
CREATE TABLE IF NOT EXISTS leads (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        phone TEXT,
                        email TEXT,
                        goal TEXT,
                        created_at INTEGER
                    , role TEXT, program TEXT);
CREATE TABLE IF NOT EXISTS live_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id TEXT NOT NULL REFERENCES courses(id),
            title TEXT NOT NULL,
            instructor_name TEXT NOT NULL,
            scheduled_at INTEGER NOT NULL,
            duration_minutes INTEGER NOT NULL DEFAULT 60,
            room_code TEXT NOT NULL UNIQUE,
            meeting_status TEXT NOT NULL DEFAULT 'scheduled',
            recording_url TEXT DEFAULT '',
            created_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS lms_activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            activity_type TEXT NOT NULL,
            item_name TEXT NOT NULL,
            meta_json TEXT DEFAULT '{}',
            created_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS login_failures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL, email TEXT NOT NULL, at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS login_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            session_id TEXT NOT NULL,
            ip_address TEXT DEFAULT '',
            device_type TEXT DEFAULT 'desktop',
            browser TEXT DEFAULT '',
            os TEXT DEFAULT '',
            login_time INTEGER NOT NULL,
            logout_time INTEGER,
            last_activity INTEGER NOT NULL,
            session_status TEXT NOT NULL DEFAULT 'active',
            security_photo_url TEXT DEFAULT '',
            location_estimate TEXT DEFAULT 'Local / LAN'
        );
CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL COLLATE NOCASE,
            token TEXT NOT NULL UNIQUE,
            created_at INTEGER NOT NULL,
            expires_at INTEGER NOT NULL,
            used INTEGER NOT NULL DEFAULT 0
        );
CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id TEXT NOT NULL REFERENCES courses(id),
            amount REAL NOT NULL,
            payment_type TEXT NOT NULL DEFAULT 'full',
            payment_method TEXT NOT NULL DEFAULT 'upi',
            transaction_id TEXT DEFAULT '',
            receipt_filename TEXT DEFAULT '',
            screenshot_url TEXT DEFAULT '',
            verification_status TEXT NOT NULL DEFAULT 'pending_verification',
            verified_by_user_id INTEGER,
            verification_notes TEXT DEFAULT '',
            verified_at INTEGER,
            created_at INTEGER NOT NULL
        );
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
CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id TEXT NOT NULL DEFAULT 'ccce',
            score INTEGER NOT NULL DEFAULT 0,
            passed INTEGER NOT NULL DEFAULT 0,
            total_questions INTEGER NOT NULL DEFAULT 0,
            correct_answers INTEGER NOT NULL DEFAULT 0,
            time_taken_seconds INTEGER NOT NULL DEFAULT 0,
            answers_json TEXT DEFAULT '{}',
            attempt_date INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            module_name TEXT DEFAULT '',
            schedule_id INTEGER DEFAULT NULL REFERENCES class_schedules(id) ON DELETE SET NULL,
            lecture_id INTEGER DEFAULT NULL REFERENCES recorded_lectures(id) ON DELETE SET NULL,
            total_questions INTEGER NOT NULL DEFAULT 5,
            passing_score INTEGER NOT NULL DEFAULT 75,
            time_limit_minutes INTEGER NOT NULL DEFAULT 15,
            unlock_trigger TEXT NOT NULL DEFAULT 'after_live_class', -- 'after_live_class', 'immediate'
            status TEXT NOT NULL DEFAULT 'published', -- 'published', 'draft', 'archived'
            questions_json TEXT NOT NULL DEFAULT '[]',
            created_by_admin_id INTEGER DEFAULT 1,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS rbac_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_slug TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    category TEXT NOT NULL,
    can_view INTEGER DEFAULT 0,
    can_create INTEGER DEFAULT 0,
    can_edit INTEGER DEFAULT 0,
    can_delete INTEGER DEFAULT 0,
    UNIQUE(role_slug, feature_key)
);
CREATE TABLE IF NOT EXISTS recorded_lectures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id TEXT NOT NULL REFERENCES courses(id),
            module_id INTEGER NOT NULL,
            module_name TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            video_url TEXT DEFAULT '',
            duration_seconds INTEGER NOT NULL DEFAULT 3600,
            order_index INTEGER NOT NULL DEFAULT 1,
            is_preview INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL
        , instructor_name TEXT DEFAULT 'Parth Rathod', thumbnail_url TEXT DEFAULT '', notes_url TEXT DEFAULT '', status TEXT DEFAULT 'published', file_path TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS referral_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
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
CREATE TABLE IF NOT EXISTS referral_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE IF NOT EXISTS rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            points_change INTEGER NOT NULL,
            reason TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at INTEGER NOT NULL,
            expires_at INTEGER NOT NULL
        );
CREATE TABLE IF NOT EXISTS settings_audit_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL,
    category TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    admin_user_id INTEGER NOT NULL,
    ip_address TEXT DEFAULT '127.0.0.1',
    created_at INTEGER NOT NULL
);
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
CREATE TABLE IF NOT EXISTS staff_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    role_slug TEXT NOT NULL,
    role_title TEXT NOT NULL,
    department TEXT NOT NULL,
    phone TEXT DEFAULT '',
    qualification TEXT DEFAULT '',
    assigned_courses TEXT DEFAULT 'all',
    avatar_initials TEXT DEFAULT 'ST',
    bio TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
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
CREATE TABLE IF NOT EXISTS student_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            student_id TEXT NOT NULL UNIQUE,
            mobile_number TEXT DEFAULT '',
            photo_url TEXT DEFAULT '',
            city TEXT DEFAULT '',
            qualification TEXT DEFAULT '',
            enrolled_course_id TEXT REFERENCES courses(id),
            account_status TEXT NOT NULL DEFAULT 'active',
            payment_status TEXT NOT NULL DEFAULT 'unpaid',
            total_paid REAL NOT NULL DEFAULT 0.0,
            remaining_balance REAL NOT NULL DEFAULT 0.0,
            course_access_status TEXT NOT NULL DEFAULT 'locked',
            unlocked_at INTEGER,
            admin_notes TEXT DEFAULT '',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
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
CREATE TABLE IF NOT EXISTS student_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_code TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    program TEXT DEFAULT 'CCCE 3-Months Live Program',
    budget_preference TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    source TEXT DEFAULT 'website_admissions_form',
    status TEXT DEFAULT 'new',
    converted_user_id INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (converted_user_id) REFERENCES users (id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    category TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'text',
    label TEXT NOT NULL,
    description TEXT DEFAULT '',
    is_secret INTEGER DEFAULT 0,
    updated_at INTEGER NOT NULL,
    updated_by INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            name TEXT NOT NULL DEFAULT '',
            password_hash TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER NOT NULL,
            last_login INTEGER
        , role TEXT NOT NULL DEFAULT 'student', portal_password TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS video_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            lecture_id INTEGER NOT NULL REFERENCES recorded_lectures(id) ON DELETE CASCADE,
            course_id TEXT NOT NULL REFERENCES courses(id),
            first_watched_at INTEGER NOT NULL,
            last_watched_at INTEGER NOT NULL,
            watched_seconds INTEGER NOT NULL DEFAULT 0,
            last_position_seconds INTEGER NOT NULL DEFAULT 0,
            percentage_watched REAL NOT NULL DEFAULT 0.0,
            view_count INTEGER NOT NULL DEFAULT 1,
            completion_status TEXT NOT NULL DEFAULT 'in_progress',
            UNIQUE(user_id, lecture_id)
        );
CREATE INDEX IF NOT EXISTS idx_class_att_active ON class_attendance(is_active_now);
CREATE INDEX IF NOT EXISTS idx_class_att_schedule ON class_attendance(schedule_id);
CREATE INDEX IF NOT EXISTS idx_class_att_status ON class_attendance(attendance_status);
CREATE INDEX IF NOT EXISTS idx_class_att_user ON class_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON customer_enquiries(email);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON customer_enquiries(phone);
CREATE INDEX IF NOT EXISTS idx_enquiries_session ON customer_enquiries(session_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON customer_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_fail ON login_failures(ip, email, at);
CREATE INDEX IF NOT EXISTS idx_quiz_att_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_att_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_sched ON quizzes(schedule_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_reg_email ON student_registrations(email);
CREATE INDEX IF NOT EXISTS idx_reg_status ON student_registrations(status);
CREATE INDEX IF NOT EXISTS idx_sched_course ON class_schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_sched_day ON class_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_sched_status ON class_schedules(status);

-- Public curriculum, academy settings & catalog seeds (Zero PII / Zero Secrets)
INSERT OR IGNORE INTO "courses" ("id", "name", "code", "description", "total_fee", "duration_weeks", "total_modules", "is_active", "created_at") VALUES ('ccce', 'CyberPro Certified Cybersecurity Expert', 'CCCE', 'Flagship 27-module practical cybersecurity & ethical hacking master course with 180+ tools.', 4000.0, 24, 27, 1, 1794079467);
INSERT OR IGNORE INTO "courses" ("id", "name", "code", "description", "total_fee", "duration_weeks", "total_modules", "is_active", "created_at") VALUES ('ethical-hacking', 'Certified Offensive Ethical Hacker', 'CEH-PRO', 'Practical penetration testing, exploit development, Web security & Red teaming.', 3500.0, 16, 18, 1, 1794079467);
INSERT OR IGNORE INTO "courses" ("id", "name", "code", "description", "total_fee", "duration_weeks", "total_modules", "is_active", "created_at") VALUES ('cyber-fundamentals', 'Cybersecurity & Defense Fundamentals', 'CDF', 'Core networking, Linux terminal, TCP/IP security, and SOC Level-1 analysis.', 2000.0, 8, 10, 1, 1794079467);
INSERT OR IGNORE INTO "courses" ("id", "name", "code", "description", "total_fee", "duration_weeks", "total_modules", "is_active", "created_at") VALUES ('advanced-cybersecurity', 'Advanced Threat Intelligence & IR', 'ATI-IR', 'Enterprise Active Directory attacks, malware reverse engineering, and threat hunting.', 5000.0, 20, 22, 1, 1794079467);
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (1, 'ccce', 1, 'Module 01: Foundations & Linux', 'Lecture 01: Architecture of Modern Cyber Threats', 'Deep dive into OSI layers and threat modeling.', '', 3600, 1, 1, 1794079467, 'Parth Rathod', '', '', 'published', '');
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (2, 'ccce', 1, 'Module 01: Foundations & Linux', 'Lecture 02: Linux Command Line Mastery & Bash Scripting', 'Essential offensive and defensive terminal skills.', '', 4200, 2, 0, 1794079467, 'Parth Rathod', '', '', 'published', '');
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (3, 'ccce', 2, 'Module 02: Network Defense & Recon', 'Lecture 03: Network Traffic Analysis with Wireshark', 'Packet dissection and protocol vulnerability detection.', '', 4500, 3, 0, 1794079467, 'Parth Rathod', '', '', 'published', '');
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (4, 'ccce', 2, 'Module 02: Network Defense & Recon', 'Lecture 04: Advanced Port Scanning & Nmap Scripts', 'Network mapping and reconnaissance methodology.', '', 3900, 4, 0, 1794079467, 'Parth Rathod', '', '', 'published', '');
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (5, 'ccce', 3, 'Module 03: Web Application Security', 'Lecture 05: OWASP Top 10 - Injection Attacks & SQLi', 'Defeating authentication and data extraction vectors.', '', 5400, 5, 0, 1794079467, 'Parth Rathod', '', '', 'published', '');
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (6, 'ccce', 3, 'Module 03: Web Application Security', 'Lecture 06: Cross-Site Scripting (XSS) & CSRF Defense', 'Client-side exploitation vectors and mitigations.', '', 4800, 6, 0, 1794079467, 'Parth Rathod', '', '', 'published', '');
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (8, 'ccce', 4, 'Module 04: Applied Cryptography & PKI', 'Lecture 07: RSA, Elliptic Curves & SSL/TLS Protocol Handshake', 'Comprehensive mathematical walkthrough of asymmetric cryptography and handshakes.', 'https://www.youtube.com/watch?v=sample_crypto_video', 3300, 7, 1, 1794085399, 'Parth Rathod', '', '', 'published', '');
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (10, 'ccce', 4, 'Module 04: Applied Cryptography & PKI', 'Lecture 08: Hands-on OpenSSL Lab & Certificate Authority Setup', 'Lab execution: Creating self-signed root CA and issuing enterprise certificates.', '/uploads/lectures/lecture_1794085579_demo_offensive_lab.mp4', 2400, 8, 1, 1794085579, 'Parth Rathod', '', '', 'published', 'C:\Users\Parth\.gemini\antigravity\scratch\cyberpro\uploads\lectures\lecture_1794085579_demo_offensive_lab.mp4');
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (12, 'ccce', 4, 'Module 04: Applied Cryptography & PKI', 'Lecture 08: Hands-on OpenSSL Lab & Certificate Authority Setup', 'Lab execution: Creating self-signed root CA and issuing enterprise certificates.', '/uploads/lectures/lecture_1794086919_demo_offensive_lab.mp4', 2400, 8, 1, 1794086919, 'Parth Rathod', '', '', 'published', 'C:\Users\Parth\.gemini\antigravity\scratch\cyberpro\uploads\lectures\lecture_1794086919_demo_offensive_lab.mp4');
INSERT OR IGNORE INTO "recorded_lectures" ("id", "course_id", "module_id", "module_name", "title", "description", "video_url", "duration_seconds", "order_index", "is_preview", "created_at", "instructor_name", "thumbnail_url", "notes_url", "status", "file_path") VALUES (14, 'ccce', 4, 'Module 04: Applied Cryptography & PKI', 'Lecture 08: Hands-on OpenSSL Lab & Certificate Authority Setup', 'Lab execution: Creating self-signed root CA and issuing enterprise certificates.', '/uploads/lectures/lecture_1794087469_demo_offensive_lab.mp4', 2400, 8, 1, 1794087469, 'Parth Rathod', '', '', 'published', 'C:\Users\Parth\.gemini\antigravity\scratch\cyberpro\uploads\lectures\lecture_1794087469_demo_offensive_lab.mp4');
INSERT OR IGNORE INTO "live_classes" ("id", "course_id", "title", "instructor_name", "scheduled_at", "duration_minutes", "room_code", "meeting_status", "recording_url", "created_at") VALUES (1, 'ccce', 'Live Threat Analysis & Incident Response Workshop', 'Parth Rathod', 1794165867, 90, 'CYBERPRO-LIVE-8080', 'scheduled', '', 1794079467);
INSERT OR IGNORE INTO "class_schedules" ("id", "course_id", "day_of_week", "class_date", "start_time", "end_time", "title", "topic", "instructor_name", "meeting_link", "meeting_type", "description", "status", "is_active", "created_by_admin_id", "created_at", "updated_at") VALUES (1, 'ccce', 1, '2026-11-09', '10:00 AM', '11:30 AM', 'CCCE Session 01: Network Security & PCAP Forensics', 'Wireshark deep packet inspection, TCP handshakes, TLS session decryption', 'Parth Rathod', 'https://meet.google.com/cyb-prol-mon', 'Google Meet', 'Please have Wireshark and sample PCAPs loaded before class.', 'upcoming', 1, 1, 1794080344, 1794080344);
INSERT OR IGNORE INTO "class_schedules" ("id", "course_id", "day_of_week", "class_date", "start_time", "end_time", "title", "topic", "instructor_name", "meeting_link", "meeting_type", "description", "status", "is_active", "created_by_admin_id", "created_at", "updated_at") VALUES (2, 'ccce', 3, '2026-11-11', '06:00 PM', '07:30 PM', 'CCCE Session 02: Web Application Penetration Testing', 'OWASP Top 10 vulnerabilities, SQL injection, Burp Suite Pro hands-on', 'Parth Rathod', 'https://meet.google.com/cyb-prol-wed', 'Google Meet', 'Burp Suite Pro and PortSwigger Web Security Academy accounts needed.', 'upcoming', 1, 1, 1794080344, 1794080344);
INSERT OR IGNORE INTO "class_schedules" ("id", "course_id", "day_of_week", "class_date", "start_time", "end_time", "title", "topic", "instructor_name", "meeting_link", "meeting_type", "description", "status", "is_active", "created_by_admin_id", "created_at", "updated_at") VALUES (3, 'ccce', 4, '2026-11-12', '07:00 PM', '08:30 PM', 'CCCE Session 03: Active Directory Exploitation', 'Kerberoasting, BloodHound graph analysis, Pass-the-Hash & privilege escalation', 'Parth Rathod', 'https://meet.google.com/cyb-prol-thu', 'Google Meet', 'Access your CYBERPRO AD Lab instance prior to session start.', 'upcoming', 1, 1, 1794080344, 1794080344);
INSERT OR IGNORE INTO "class_schedules" ("id", "course_id", "day_of_week", "class_date", "start_time", "end_time", "title", "topic", "instructor_name", "meeting_link", "meeting_type", "description", "status", "is_active", "created_by_admin_id", "created_at", "updated_at") VALUES (4, 'ccce', 6, '2026-11-08', '02:00 PM', '04:00 PM', 'CCCE Masterclass: Live Threat Analysis & Incident Response', 'Live war-room triage, Memory forensics using Volatility 3, SOC Level-2 playbooks', 'Parth Rathod', 'http://127.0.0.1:5000/join/CYBERPRO-LIVE-8080', 'CYBERPRO MEET', 'Live interactive incident response war-room. Active joining is currently open.', 'upcoming', 1, 1, 1794080344, 1794080344);
INSERT OR IGNORE INTO "class_schedules" ("id", "course_id", "day_of_week", "class_date", "start_time", "end_time", "title", "topic", "instructor_name", "meeting_link", "meeting_type", "description", "status", "is_active", "created_by_admin_id", "created_at", "updated_at") VALUES (5, 'ccce', 0, '2026-11-15', '11:00 AM', '12:30 PM', 'CCCE Doubt Clearing & Weekly Lab Review', 'Open Q&A, weekly lab milestone inspection, student code & report review', 'Parth Rathod', 'https://meet.google.com/cyb-prol-sun', 'Google Meet', 'Bring all questions from this week''s hands-on homework assignments.', 'upcoming', 1, 1, 1794080344, 1794080344);
INSERT OR IGNORE INTO "class_schedules" ("id", "course_id", "day_of_week", "class_date", "start_time", "end_time", "title", "topic", "instructor_name", "meeting_link", "meeting_type", "description", "status", "is_active", "created_by_admin_id", "created_at", "updated_at") VALUES (6, 'ethical-hacking', 2, '2026-11-10', '05:00 PM', '06:30 PM', 'CEH-PRO: Buffer Overflow & Binary Exploitation', 'x86 assembly architecture, stack smashing, Immunity Debugger & Mona.py', 'Parth Rathod', 'https://meet.google.com/cyb-ceh-tue', 'Google Meet', 'Windows 10 32-bit test VM and Kali Linux machine required.', 'upcoming', 1, 1, 1794080344, 1794080344);
INSERT OR IGNORE INTO "quizzes" ("id", "course_id", "title", "description", "module_name", "schedule_id", "lecture_id", "total_questions", "passing_score", "time_limit_minutes", "unlock_trigger", "status", "questions_json", "created_by_admin_id", "created_at", "updated_at") VALUES (1, 'ccce', 'CCCE Post-Class Assessment: PCAP Analysis & Incident Response', 'Mandatory post-live-class assessment for CCCE Masterclass. Evaluates network forensics and threat hunting comprehension.', 'Module 1: Offensive Security Fundamentals', 4, NULL, 5, 75, 15, 'after_live_class', 'published', '[{"id": 1, "question": "Which layer of the OSI model does Wireshark packet capture primarily analyze when examining TCP handshake SYN packets?", "options": ["Layer 2 - Data Link Layer", "Layer 3 - Network Layer (IP)", "Layer 4 - Transport Layer (TCP)", "Layer 7 - Application Layer"], "correct_index": 2, "explanation": "TCP handshakes (SYN, SYN-ACK, ACK) operate at Layer 4 (Transport Layer) of the OSI model."}, {"id": 2, "question": "During a live incident response PCAP investigation, which Wireshark display filter isolates unencrypted HTTP POST traffic containing credentials?", "options": ["http.request.method == \"POST\"", "tcp.port == 80 and ip.addr == 127.0.0.1", "frame.len > 1000", "ssl.handshake.type == 1"], "correct_index": 0, "explanation": "http.request.method == ''POST'' displays all HTTP requests submitting form data, including unencrypted login credentials."}, {"id": 3, "question": "In asymmetric cryptography, which key is used by an SSL/TLS client to encrypt the pre-master secret during the handshake?", "options": ["Server''s Private Key", "Server''s Public Key", "Client''s Private Key", "Diffie-Hellman Seed Key"], "correct_index": 1, "explanation": "The client encrypts the pre-master secret using the server''s public key extracted from the server''s X.509 certificate."}, {"id": 4, "question": "What is the primary indicator of an Active Directory Kerberoasting attack in Windows Security Event Logs?", "options": ["Event ID 4624 (Successful Logon)", "Event ID 4769 (A Kerberos service ticket was requested with RC4-HMAC encryption)", "Event ID 1102 (The audit log was cleared)", "Event ID 4720 (A user account was created)"], "correct_index": 1, "explanation": "Event ID 4769 with encryption type 0x17 (RC4-HMAC) indicates Kerberos service ticket requests for service accounts, characteristic of Kerberoasting."}, {"id": 5, "question": "When a CYBERPRO live class finishes, which Zero-Trust security policy prevents a student from sharing their recorded attendance token?", "options": ["Single-Device Token Binding and Client Fingerprinting", "Simple IP Whitelisting", "Shared Meeting Passcodes", "Public Room URLs"], "correct_index": 0, "explanation": "CYBERPRO Anti-Piracy Gatekeeper enforces single-device session locking bound cryptographically to registered email and phone."}]', 1, 1794001412, 1794087812);
INSERT OR IGNORE INTO "quizzes" ("id", "course_id", "title", "description", "module_name", "schedule_id", "lecture_id", "total_questions", "passing_score", "time_limit_minutes", "unlock_trigger", "status", "questions_json", "created_by_admin_id", "created_at", "updated_at") VALUES (2, 'ccce', 'CCCE Module 2 Exam: Web Exploitation & OWASP Top 10', 'Comprehensive exam covering SQLi, XSS, CSRF, and Server-Side Request Forgery vulnerabilities.', 'Module 2: Web Application Security', 2, NULL, 5, 80, 20, 'after_live_class', 'published', '[{"id": 1, "question": "Which layer of the OSI model does Wireshark packet capture primarily analyze when examining TCP handshake SYN packets?", "options": ["Layer 2 - Data Link Layer", "Layer 3 - Network Layer (IP)", "Layer 4 - Transport Layer (TCP)", "Layer 7 - Application Layer"], "correct_index": 2, "explanation": "TCP handshakes (SYN, SYN-ACK, ACK) operate at Layer 4 (Transport Layer) of the OSI model."}, {"id": 2, "question": "During a live incident response PCAP investigation, which Wireshark display filter isolates unencrypted HTTP POST traffic containing credentials?", "options": ["http.request.method == \"POST\"", "tcp.port == 80 and ip.addr == 127.0.0.1", "frame.len > 1000", "ssl.handshake.type == 1"], "correct_index": 0, "explanation": "http.request.method == ''POST'' displays all HTTP requests submitting form data, including unencrypted login credentials."}, {"id": 3, "question": "In asymmetric cryptography, which key is used by an SSL/TLS client to encrypt the pre-master secret during the handshake?", "options": ["Server''s Private Key", "Server''s Public Key", "Client''s Private Key", "Diffie-Hellman Seed Key"], "correct_index": 1, "explanation": "The client encrypts the pre-master secret using the server''s public key extracted from the server''s X.509 certificate."}, {"id": 4, "question": "What is the primary indicator of an Active Directory Kerberoasting attack in Windows Security Event Logs?", "options": ["Event ID 4624 (Successful Logon)", "Event ID 4769 (A Kerberos service ticket was requested with RC4-HMAC encryption)", "Event ID 1102 (The audit log was cleared)", "Event ID 4720 (A user account was created)"], "correct_index": 1, "explanation": "Event ID 4769 with encryption type 0x17 (RC4-HMAC) indicates Kerberos service ticket requests for service accounts, characteristic of Kerberoasting."}, {"id": 5, "question": "When a CYBERPRO live class finishes, which Zero-Trust security policy prevents a student from sharing their recorded attendance token?", "options": ["Single-Device Token Binding and Client Fingerprinting", "Simple IP Whitelisting", "Shared Meeting Passcodes", "Public Room URLs"], "correct_index": 0, "explanation": "CYBERPRO Anti-Piracy Gatekeeper enforces single-device session locking bound cryptographically to registered email and phone."}]', 1, 1794015812, 1794087812);
INSERT OR IGNORE INTO "quizzes" ("id", "course_id", "title", "description", "module_name", "schedule_id", "lecture_id", "total_questions", "passing_score", "time_limit_minutes", "unlock_trigger", "status", "questions_json", "created_by_admin_id", "created_at", "updated_at") VALUES (3, 'ethical-hacking', 'CEH-PRO Exam: Practical Penetration Testing & Exploits', 'Covers active reconnaissance, Nmap NSE, Buffer Overflow, and Metasploit post-exploitation techniques.', 'Module 3: Advanced Exploit Development', 6, NULL, 3, 75, 15, 'after_live_class', 'published', '[{"id": 1, "question": "Which Nmap scan flag performs a stealthy SYN stealth scan without completing the 3-way TCP handshake?", "options": ["nmap -sT", "nmap -sS", "nmap -sU", "nmap -sA"], "correct_index": 1, "explanation": "-sS initiates a TCP SYN scan, tearing down the connection with an RST packet before completing the 3-way handshake."}, {"id": 2, "question": "In SQL Injection vulnerabilities, what does the payload '' OR ''1''=''1 -- - accomplish?", "options": ["Causes a database syntax crash", "Forces the WHERE clause to evaluate to TRUE, bypassing authentication", "Drops the users table permanently", "Encrypts the database credentials"], "correct_index": 1, "explanation": "'' OR ''1''=''1'' forces the Boolean SQL condition to true, allowing bypass of login queries."}, {"id": 3, "question": "What memory register does an attacker overwrite during a stack-based Buffer Overflow to hijack CPU execution flow?", "options": ["EAX (Accumulator Register)", "EBP (Base Pointer)", "EIP (Instruction Pointer)", "ESP (Stack Pointer)"], "correct_index": 2, "explanation": "Overwriting EIP (Extended Instruction Pointer on x86) redirects code execution to attacker-controlled shellcode."}]', 1, 1794027812, 1794087812);
INSERT OR IGNORE INTO "quizzes" ("id", "course_id", "title", "description", "module_name", "schedule_id", "lecture_id", "total_questions", "passing_score", "time_limit_minutes", "unlock_trigger", "status", "questions_json", "created_by_admin_id", "created_at", "updated_at") VALUES (4, 'cyber-fundamentals', 'CDF Level-1 Assessment: Core Networking & CIA Defense', 'Foundational quiz covering the OSI model, TCP/IP headers, firewall rules, and Linux terminal hardening.', 'Module 1: Computer Networking & Linux Security', NULL, NULL, 2, 70, 10, 'immediate', 'published', '[{"id": 1, "question": "What are the three core principles of the CIA Triad in information security?", "options": ["Confidentiality, Integrity, Availability", "Control, Inspection, Authentication", "Cryptography, Identity, Authorization", "Compliance, Isolation, Auditing"], "correct_index": 0, "explanation": "The CIA Triad stands for Confidentiality, Integrity, and Availability."}, {"id": 2, "question": "Which port number is standard for SSH (Secure Shell) remote encrypted server administration?", "options": ["Port 21", "Port 22", "Port 23", "Port 25"], "correct_index": 1, "explanation": "TCP Port 22 is the standard port for SSH."}]', 1, 1794037812, 1794087812);
INSERT OR IGNORE INTO "quizzes" ("id", "course_id", "title", "description", "module_name", "schedule_id", "lecture_id", "total_questions", "passing_score", "time_limit_minutes", "unlock_trigger", "status", "questions_json", "created_by_admin_id", "created_at", "updated_at") VALUES (5, 'advanced-cybersecurity', 'ATI-IR Master Assessment: MITRE ATT&CK & Memory Forensics', 'Enterprise incident response quiz covering Volatility memory extraction, Prefetch analysis, and lateral movement.', 'Module 4: Enterprise Threat Hunting', NULL, NULL, 2, 80, 15, 'immediate', 'published', '[{"id": 1, "question": "In the MITRE ATT&CK Matrix, which tactic describes maintaining presence across system reboots?", "options": ["TA0001: Initial Access", "TA0003: Persistence", "TA0006: Credential Access", "TA0010: Exfiltration"], "correct_index": 1, "explanation": "TA0003 Persistence describes adversary techniques to keep access across restarts and credential changes."}, {"id": 2, "question": "Which artifact in Windows forensics records the execution of binary files along with volume path and run count?", "options": ["Prefetch files (.pf)", "DNS Cache", "Pagefile.sys", "HOSTS file"], "correct_index": 0, "explanation": "Windows Prefetch files (.pf) track application launch history, timestamp, and volume execution artifacts."}]', 1, 1794047812, 1794087812);
INSERT OR IGNORE INTO "cyber_range_labs" ("id", "title", "category", "difficulty", "duration_minutes", "xp_reward", "description", "objectives_json", "hints_json", "flag", "environment_type", "initial_fs_json", "is_active", "created_at") VALUES (1, 'Linux Privilege Escalation via SUID', 'Linux Fundamentals', 'Intermediate', 45, 200, 'Audit a simulated Debian server to identify misconfigured SUID binaries and escalate from unprivileged user ''cadet'' to root.', '["Inspect system binaries with SUID bit set using find command", "Analyze unusual binary /usr/local/bin/backup_agent", "Exploit environment variable path hijacking to obtain root shell", "Read the flag from /root/flag.txt"]', '["Try running: find / -perm -u=s -type f 2>/dev/null", "Examine strings in /usr/local/bin/backup_agent", "Check if the binary calls system commands without absolute paths"]', 'CYBERPRO{suid_privesc_root_pwned_8492}', 'terminal', '{"/home/student": {"notes.txt": "Target system audit: Check for SUID binaries in /usr/local/bin\nRemember to submit flag format: CYBERPRO{...}", "target_info.json": "{\"hostname\": \"corp-srv-01\", \"ip\": \"10.10.14.55\", \"os\": \"Debian GNU/Linux 12\"}"}, "/usr/local/bin": {"backup_agent": "[ELF-BINARY: calls tar without full path]"}, "/root": {"flag.txt": "CYBERPRO{suid_privesc_root_pwned_8492}"}}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "cyber_range_labs" ("id", "title", "category", "difficulty", "duration_minutes", "xp_reward", "description", "objectives_json", "hints_json", "flag", "environment_type", "initial_fs_json", "is_active", "created_at") VALUES (2, 'Network Reconnaissance & Port Scanning', 'Networking', 'Beginner', 30, 150, 'Perform active network scanning against target perimeter host 10.10.20.10. Enumerate open ports, identify running daemon versions, and locate hidden maintenance services.', '["Perform TCP SYN stealth scan against target IP 10.10.20.10", "Enumerate service banners on open ports (80, 22, 8080, 9999)", "Connect to custom administrative listener on port 9999 using nc or curl", "Extract the operational flag token"]', '["Use nmap -sV -p- 10.10.20.10", "Netcat command: nc 10.10.20.10 9999"]', 'CYBERPRO{nmap_stealth_recon_reconnaissance_019}', 'terminal', '{"/home/student": {"rules_of_engagement.txt": "Target Range: 10.10.20.0/24\nPrimary Target: 10.10.20.10\nPermitted Tools: nmap, nc, ping, traceroute, curl"}}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "cyber_range_labs" ("id", "title", "category", "difficulty", "duration_minutes", "xp_reward", "description", "objectives_json", "hints_json", "flag", "environment_type", "initial_fs_json", "is_active", "created_at") VALUES (3, 'SQL Injection: Authentication Bypass', 'Web Application Security', 'Beginner', 30, 175, 'Analyze a vulnerable internal corporate portal. Exploit SQL injection flaws in the username login field to bypass credential validation and extract confidential credentials.', '["Inspect the login request parameters sent to /api/auth/login", "Formulate SQL injection payload: admin'' -- or '' OR 1=1 --", "Bypass authentication and access the administrator dashboard", "Locate and verify flag in the executive secrets vault"]', '["Look at how quotes are handled in the input parameter", "Try: admin'' OR ''1''=''1"]', 'CYBERPRO{sqli_auth_bypass_executive_vault_482}', 'terminal', '{"/home/student": {"target_url.txt": "http://10.10.30.50/portal/login\nParam: username\nMethod: POST"}}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "cyber_range_labs" ("id", "title", "category", "difficulty", "duration_minutes", "xp_reward", "description", "objectives_json", "hints_json", "flag", "environment_type", "initial_fs_json", "is_active", "created_at") VALUES (4, 'Wireless Handshake Cracking & WPA2 Analysis', 'Ethical Hacking', 'Intermediate', 60, 250, 'Analyze captured 4-way WPA2 802.11 handshake PCAP file. Use aircrack-ng with custom cybersecurity wordlists to recover the network passphrase and decrypt internal traffic.', '["Verify EAPOL packets in capture file wifi_corp.pcap", "Execute aircrack-ng with wordlist cyberpro_wordlist.txt", "Extract the plaintext pre-shared key (PSK)", "Decrypt traffic and locate flag in internal HTTP GET request"]', '["aircrack-ng -w wordlist.txt -b 00:14:6C:7E:40:80 wifi_corp.pcap"]', 'CYBERPRO{wpa2_handshake_cracked_aircrack_9921}', 'terminal', '{"/home/student": {"wifi_corp.pcap": "[802.11 4-Way Handshake PCAP Data]", "wordlist.txt": "password\nadmin123\ncybersec2026\nCyberProDefense@2026\nhacking101\nsecretpass"}}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "cyber_range_labs" ("id", "title", "category", "difficulty", "duration_minutes", "xp_reward", "description", "objectives_json", "hints_json", "flag", "environment_type", "initial_fs_json", "is_active", "created_at") VALUES (5, 'Automated Vulnerability Assessment with Nikto & OpenVAS', 'Vulnerability Assessment', 'Intermediate', 45, 180, 'Deploy security auditing tools against an outdated Apache web server. Identify unpatched CVEs, outdated modules, directory indexing leaks, and dangerous HTTP methods.', '["Launch automated scanner against target http://10.10.40.25", "Identify critical CVE in Apache mod_proxy", "Exploit path traversal to read /etc/shadow or configuration file", "Retrieve assessment flag from the vulnerable server"]', '["nikto -h 10.10.40.25", "Check /server-status and /icons/ directory indexing"]', 'CYBERPRO{vuln_assessment_nikto_cve_remediated_339}', 'terminal', '{"/home/student": {"scope.txt": "Target: 10.10.40.25\nService: Apache 2.4.49 (Vulnerable to Path Traversal CVE-2021-41773)"}}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "cyber_range_labs" ("id", "title", "category", "difficulty", "duration_minutes", "xp_reward", "description", "objectives_json", "hints_json", "flag", "environment_type", "initial_fs_json", "is_active", "created_at") VALUES (6, 'Memory Dump Forensics with Volatility', 'Digital Forensics', 'Advanced', 60, 300, 'Examine raw Windows memory capture (memdump.raw) from a compromised workstation. Recover injected DLLs, identify active C2 connections, and extract malicious process trees.', '["Determine Volatility OS profile for memory capture", "List running processes using pslist and pstree", "Identify hidden process spawned by svchost.exe", "Dump memory segments and recover attacker C2 IP and flag string"]', '["volatility -f memdump.raw imageinfo", "volatility -f memdump.raw --profile=Win10x64_19041 psxview", "volatility -f memdump.raw --profile=Win10x64_19041 malfind"]', 'CYBERPRO{volatility_memory_forensics_c2_extracted_774}', 'terminal', '{"/home/student": {"case_brief.txt": "Incident #INC-8921: Suspected Cobalt Strike Beacon\nFile: /evidence/memdump.raw (256MB memory sample)"}}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "cyber_range_labs" ("id", "title", "category", "difficulty", "duration_minutes", "xp_reward", "description", "objectives_json", "hints_json", "flag", "environment_type", "initial_fs_json", "is_active", "created_at") VALUES (7, 'Incident Response: Active Ransomware Containment', 'Incident Response', 'Advanced', 60, 300, 'A corporate domain controller is undergoing active encryption. Identify patient zero, terminate malicious scheduled tasks, block exfiltration IPs on iptables, and restore encrypted files.', '["Analyze auth.log to find initial malicious credential access", "Kill active rogue process encryptor.py running under PID 4120", "Block outgoing C2 IP 198.51.100.44 via iptables", "Decrypt emergency master key and rescue corporate database flag"]', '["Check ps aux | grep -i encrypt", "Review crontab -l and /etc/cron.*", "iptables -A OUTPUT -d 198.51.100.44 -j DROP"]', 'CYBERPRO{ir_containment_ransomware_neutralized_5510}', 'terminal', '{"/home/student": {"incident_log.txt": "ALARM: Multiple workstations reporting file extension .locked\nImmediate action required to stop lateral movement."}}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "bug_bounty_challenges" ("id", "title", "category", "difficulty", "points", "bounty_reward_inr", "target_endpoint", "scope_description", "vulnerability_summary", "hint", "flag", "is_active", "created_at") VALUES (1, 'Legacy Order API SQL Injection', 'SQL Injection', 'Medium', 250, 750, '/api/training/targets/vulnerable-orders?order_id=1', 'In-scope: Search and filter endpoint on order management service. Out-of-scope: Denial of service or automated bruteforce.', 'The endpoint concatenates user input directly into SQLite SELECT query without parameterization.', 'Inject a UNION SELECT statement to pull data from sqlite_master or users table.', 'CYBERPRO{bounty_union_sqli_orders_dump_839}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "bug_bounty_challenges" ("id", "title", "category", "difficulty", "points", "bounty_reward_inr", "target_endpoint", "scope_description", "vulnerability_summary", "hint", "flag", "is_active", "created_at") VALUES (2, 'Reflected XSS in Global Search Bar', 'Cross-Site Scripting (XSS)', 'Easy', 150, 500, '/api/training/targets/vulnerable-search?q=test', 'In-scope: /api/training/targets/vulnerable-search query parameter reflection.', 'Search term parameter is reflected directly inside HTML output without sanitization or HTML entity encoding.', 'Test standard script tag payload: <script>alert(document.domain)</script> or img onerror event.', 'CYBERPRO{bounty_reflected_xss_sanitization_missing_119}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "bug_bounty_challenges" ("id", "title", "category", "difficulty", "points", "bounty_reward_inr", "target_endpoint", "scope_description", "vulnerability_summary", "hint", "flag", "is_active", "created_at") VALUES (3, 'JWT Signature Stripping / None Algorithm', 'Authentication Vulnerabilities', 'Hard', 350, 1000, '/api/training/targets/vulnerable-auth/verify', 'In-scope: Authentication verification endpoint accepting Authorization Bearer token.', 'Server accepts JWTs with ''alg'': ''none'', allowing arbitrary claim modification including role=''superadmin''.', 'Modify header to alg: none, change payload role to superadmin, and strip cryptographic signature.', 'CYBERPRO{bounty_jwt_alg_none_auth_bypass_662}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "bug_bounty_challenges" ("id", "title", "category", "difficulty", "points", "bounty_reward_inr", "target_endpoint", "scope_description", "vulnerability_summary", "hint", "flag", "is_active", "created_at") VALUES (4, 'Insecure Direct Object Reference (IDOR) on Student Profiles', 'Access Control Issues', 'Medium', 250, 750, '/api/training/targets/vulnerable-profile?student_id=102', 'In-scope: /api/training/targets/vulnerable-profile with parameter student_id.', 'Endpoint does not verify whether the requesting session owns the requested student_id.', 'Iterate student_id to 1 or 2 to view root administrative personal details and private tokens.', 'CYBERPRO{bounty_idor_broken_object_level_auth_441}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "bug_bounty_challenges" ("id", "title", "category", "difficulty", "points", "bounty_reward_inr", "target_endpoint", "scope_description", "vulnerability_summary", "hint", "flag", "is_active", "created_at") VALUES (5, 'Public Git Repository & Environment Secret Exposure', 'Security Misconfiguration', 'Easy', 150, 500, '/api/training/targets/vulnerable-misconfig/.git/config', 'In-scope: Web server root file disclosures.', 'The deployment pipeline inadvertently published the .git directory containing commit logs and .env database secrets.', 'Inspect .git/HEAD and .git/logs/HEAD to trace commit history exposing API keys.', 'CYBERPRO{bounty_git_leak_exposed_env_secrets_903}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "bug_bounty_challenges" ("id", "title", "category", "difficulty", "points", "bounty_reward_inr", "target_endpoint", "scope_description", "vulnerability_summary", "hint", "flag", "is_active", "created_at") VALUES (6, 'Unrestricted File Upload Leading to Remote Code Execution', 'File Upload Vulnerabilities', 'Critical', 450, 1500, '/api/training/targets/vulnerable-upload', 'In-scope: Document upload handler for student avatar or project submission.', 'File extension is validated only on client-side JS; backend saves executable .php/.phtml/.py files in web accessible directory.', 'Bypass client checks by submitting POST directly with .phtml or .py file payload containing system command execution.', 'CYBERPRO{bounty_unrestricted_upload_rce_shell_299}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "bug_bounty_challenges" ("id", "title", "category", "difficulty", "points", "bounty_reward_inr", "target_endpoint", "scope_description", "vulnerability_summary", "hint", "flag", "is_active", "created_at") VALUES (7, 'Mass Assignment in Student Registration API', 'API Security', 'Medium', 250, 750, '/api/training/targets/vulnerable-register', 'In-scope: JSON POST endpoint for user account update.', 'Endpoint blindly maps all JSON keys to the database user record, permitting parameters like ''is_admin'': true or ''credits'': 99999.', 'Include ''is_admin'': true in your profile update payload.', 'CYBERPRO{bounty_mass_assignment_privilege_escalation_712}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "bug_bounty_challenges" ("id", "title", "category", "difficulty", "points", "bounty_reward_inr", "target_endpoint", "scope_description", "vulnerability_summary", "hint", "flag", "is_active", "created_at") VALUES (8, 'Debug Stack Trace & Sensitive PII Leak in Error Response', 'Information Disclosure', 'Easy', 150, 500, '/api/training/targets/vulnerable-debug?err=trigger', 'In-scope: HTTP 500 error handler responses.', 'Application runs in production with DEBUG=True enabled, dumping full stack trace, environment variables, and database credentials on unhandled exceptions.', 'Send malformed data to trigger unhandled exception and examine stack trace environment variables.', 'CYBERPRO{bounty_info_disclosure_debug_stacktrace_885}', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "soc_scenarios" ("id", "title", "attack_type", "severity", "description", "initial_alerts_json", "logs_json", "correct_classification", "correct_containment_actions_json", "correct_remediation", "post_incident_debrief", "xp_reward", "is_active") VALUES (1, 'SSH Distributed Brute-force & Lateral Movement Detection', 'Brute-force SSH', 'HIGH', 'SIEM alerts indicate 1,420 failed SSH authentication attempts across 3 external IP addresses targeting internal bastion server 10.0.1.5 followed by a single successful root login.', '[{"id": "ALT-101", "time": "2026-11-09 21:04:12", "severity": "HIGH", "rule": "SSH Authentication Spike: >500 attempts in 5m", "source": "194.26.29.112"}, {"id": "ALT-102", "time": "2026-11-09 21:08:44", "severity": "CRITICAL", "rule": "Successful SSH Login after multiple failures", "source": "194.26.29.112", "user": "root"}]', '[{"timestamp": "21:04:02", "src_ip": "194.26.29.112", "dest_ip": "10.0.1.5", "proto": "SSH", "event": "Failed password for cadet from 194.26.29.112 port 48212"}, {"timestamp": "21:04:05", "src_ip": "185.220.101.5", "dest_ip": "10.0.1.5", "proto": "SSH", "event": "Failed password for admin from 185.220.101.5 port 55104"}, {"timestamp": "21:08:44", "src_ip": "194.26.29.112", "dest_ip": "10.0.1.5", "proto": "SSH", "event": "Accepted password for root from 194.26.29.112 port 48390 ssh2"}, {"timestamp": "21:09:15", "src_ip": "10.0.1.5", "dest_ip": "10.0.2.20", "proto": "SMB", "event": "SMB2 Session Setup to Domain Controller from 10.0.1.5"}]', 'SSH Brute-Force & Compromised Root Account', '["Block External IPs (194.26.29.112, 185.220.101.5) on Edge Firewall", "Isolate Compromised Bastion Host 10.0.1.5 from Network", "Rotate Root Credentials & Force Immediate Session Terminations", "Audit Domain Controller SMB Session"]', 'Implement Fail2ban or CrowdSec, disable root SSH password login, enforce SSH public-key authentication with hardware 2FA tokens.', 'The attacker used dictionary brute-force against port 22. Because root login was allowed with weak passwords, the adversary successfully established a foothold and immediately attempted lateral movement over SMB to the internal Domain Controller.', 250, 1);
INSERT OR IGNORE INTO "soc_scenarios" ("id", "title", "attack_type", "severity", "description", "initial_alerts_json", "logs_json", "correct_classification", "correct_containment_actions_json", "correct_remediation", "post_incident_debrief", "xp_reward", "is_active") VALUES (2, 'Executive Spear-Phishing with Macro Dropper Attachment', 'Spear Phishing', 'CRITICAL', 'An email claiming to be an urgent CFO wire transfer request arrived at accounts@cyberpro.in containing macro-enabled spreadsheet ''Q4_Executive_Bonus_Wire.xlsm''. EDR logged abnormal PowerShell spawning from Excel.', '[{"id": "ALT-201", "time": "2026-11-09 21:15:30", "severity": "CRITICAL", "rule": "Suspicious Child Process: EXCEL.EXE spawned POWERSHELL.EXE", "host": "WKS-ACC-04"}]', '[{"timestamp": "21:14:02", "src_ip": "smtp.external-spoof.net", "dest_ip": "mail.cyberpro.in", "proto": "SMTP", "event": "Delivered message ''Q4_Executive_Bonus_Wire.xlsm'' from cfo-spoofed@cyberpro.co"}, {"timestamp": "21:15:28", "src_ip": "10.0.4.12", "dest_ip": "-", "proto": "EDR", "event": "Process Creation: excel.exe (PID 6104) opened by user priya.sharma"}, {"timestamp": "21:15:30", "src_ip": "10.0.4.12", "dest_ip": "-", "proto": "EDR", "event": "Process Creation: powershell.exe -enc SQBFAFgA... (PID 8820)"}, {"timestamp": "21:15:33", "src_ip": "10.0.4.12", "dest_ip": "198.51.100.77", "proto": "HTTPS", "event": "Outbound connection to known C2 staging server 198.51.100.77:443"}]', 'Spear-Phishing Macro Dropper & Cobalt Strike Beacon', '["Isolate Workstation WKS-ACC-04 Immediately", "Block C2 IP 198.51.100.77 on Perimeter Gateway", "Purge Phishing Email from All Mailboxes via Exchange/O365 Admin", "Reset Credentials for user priya.sharma"]', 'Enforce Attack Surface Reduction (ASR) rules blocking Office apps from spawning child processes; quarantine all incoming macro attachments; configure strict SPF, DKIM, and DMARC enforcement.', 'User executed a malicious macro that executed an obfuscated PowerShell base64 command downloading a stage-2 Cobalt Strike beacon connecting to 198.51.100.77.', 250, 1);
INSERT OR IGNORE INTO "soc_scenarios" ("id", "title", "attack_type", "severity", "description", "initial_alerts_json", "logs_json", "correct_classification", "correct_containment_actions_json", "correct_remediation", "post_incident_debrief", "xp_reward", "is_active") VALUES (3, 'Unusual Account Privilege Escalation & Shadow Admin Creation', 'Privilege Escalation', 'HIGH', 'A junior helpdesk account with standard privileges suddenly invoked net group ''Domain Admins'' /add, creating a hidden administrative user ''backup_svc_admin'' at 02:45 AM.', '[{"id": "ALT-301", "time": "2026-11-09 02:45:11", "severity": "HIGH", "rule": "Privileged Security Group Modification: Domain Admins member added", "user": "helpdesk_ananya"}]', '[{"timestamp": "02:44:00", "src_ip": "10.0.3.45", "dest_ip": "10.0.0.1", "proto": "Kerberos", "event": "AS-REP Roasting activity detected against account svc_sql_backup"}, {"timestamp": "02:45:05", "src_ip": "10.0.3.45", "dest_ip": "10.0.0.1", "proto": "ActiveDirectory", "event": "User account created: backup_svc_admin"}, {"timestamp": "02:45:11", "src_ip": "10.0.3.45", "dest_ip": "10.0.0.1", "proto": "ActiveDirectory", "event": "User backup_svc_admin added to ''Domain Admins''"}]', 'Kerberoasting Attack & Persistence via Shadow Domain Admin', '["Disable Rogue Account ''backup_svc_admin''", "Disable Compromised Account ''helpdesk_ananya''", "Isolate Workstation 10.0.3.45", "Rotate krbtgt and Service Account Passwords"]', 'Apply Group Managed Service Accounts (gMSA), disable DES/RC4 encryption in Kerberos, implement Active Directory Tiering architecture.', 'The adversary abused the helpdesk account to perform Kerberoasting on vulnerable SPNs, cracked the service ticket, and escalated to Domain Admin to establish persistence.', 250, 1);
INSERT OR IGNORE INTO "soc_scenarios" ("id", "title", "attack_type", "severity", "description", "initial_alerts_json", "logs_json", "correct_classification", "correct_containment_actions_json", "correct_remediation", "post_incident_debrief", "xp_reward", "is_active") VALUES (4, 'DNS Tunneling & High-Volume Data Exfiltration', 'Data Exfiltration', 'CRITICAL', 'Internal DNS resolver recorded an unprecedented spike of 45,000 TXT query requests to subdomains of ''cdn-sync-telemetry.xyz'' over a 20-minute window, transferring encoded corporate records.', '[{"id": "ALT-401", "time": "2026-11-09 22:10:00", "severity": "CRITICAL", "rule": "High-Volume DNS Query Anomaly / Tunneling Detected", "domain": "cdn-sync-telemetry.xyz"}]', '[{"timestamp": "22:00:15", "src_ip": "10.0.5.88", "dest_ip": "10.0.0.2", "proto": "DNS", "event": "Query TXT aXNfY29ycF9zZWNyZXRz.cdn-sync-telemetry.xyz"}, {"timestamp": "22:05:40", "src_ip": "10.0.5.88", "dest_ip": "10.0.0.2", "proto": "DNS", "event": "Query TXT bXlfc3FsX2R1bXBfY3Vi.cdn-sync-telemetry.xyz (Length: 245 bytes)"}, {"timestamp": "22:15:20", "src_ip": "10.0.5.88", "dest_ip": "10.0.0.2", "proto": "DNS", "event": "45,210 requests sent in 15 minutes, 14.8MB encoded payload"}]', 'DNS Tunneling Exfiltration via Rogue Internal Machine', '["Isolate Source Workstation 10.0.5.88", "Null-route / Sinkhole Domain cdn-sync-telemetry.xyz on DNS Resolvers", "Capture Memory and Disk Triage on 10.0.5.88", "Notify Privacy Officer for Data Breach Assessment"]', 'Implement DNS inspection with Response Policy Zones (RPZ), restrict outbound UDP/TCP 53 to authoritative internal forwarders only, inspect query payload entropy.', 'Malware bypassed standard web gateway firewalls by using DNS TXT record tunneling (iodine / dnscat2) to exfiltrate database records encoded in base64 subdomains.', 250, 1);
INSERT OR IGNORE INTO "soc_scenarios" ("id", "title", "attack_type", "severity", "description", "initial_alerts_json", "logs_json", "correct_classification", "correct_containment_actions_json", "correct_remediation", "post_incident_debrief", "xp_reward", "is_active") VALUES (5, 'Automated Credential Stuffing Campaign on Student Portal', 'Credential Stuffing', 'MEDIUM', 'WAF alert: Over 3,200 POST requests to /api/login from a rotating residential botnet proxy pool within 12 minutes, testing compromised breach credentials against student accounts.', '[{"id": "ALT-501", "time": "2026-11-09 19:30:15", "severity": "MEDIUM", "rule": "High-Volume HTTP 401 Unauthorized Spike: >200 req/min", "target": "/api/login"}]', '[{"timestamp": "19:30:02", "src_ip": "103.251.167.22", "dest_ip": "portal.cyberpro.in", "proto": "HTTP", "event": "POST /api/login user=rohit.verma HTTP 401"}, {"timestamp": "19:30:05", "src_ip": "45.133.1.89", "dest_ip": "portal.cyberpro.in", "proto": "HTTP", "event": "POST /api/login user=neha.sharma HTTP 401"}, {"timestamp": "19:31:18", "src_ip": "185.191.171.12", "dest_ip": "portal.cyberpro.in", "proto": "HTTP", "event": "POST /api/login user=vikas.patel HTTP 200 (SUCCESS)"}, {"timestamp": "19:31:25", "src_ip": "185.191.171.12", "dest_ip": "portal.cyberpro.in", "proto": "HTTP", "event": "GET /api/student/profile user=vikas.patel"}]', 'Distributed Credential Stuffing & Account Takeover', '["Enforce Cloudflare Turnstile Rate-Limiting & Challenge on /api/login", "Invalidate Active Session for Account ''vikas.patel''", "Force Mandatory Password Reset with Email Verification", "Block Malicious Autonomous System / ASN on WAF"]', 'Deploy adaptive behavioral CAPTCHA, implement Breached Password Detection API, enforce multi-factor authentication (MFA).', 'The adversary leveraged combo lists from historic third-party data breaches to test credentials on CyberPro. Because one student reused passwords, their account was compromised before rate-limiting triggered.', 250, 1);
INSERT OR IGNORE INTO "soc_scenarios" ("id", "title", "attack_type", "severity", "description", "initial_alerts_json", "logs_json", "correct_classification", "correct_containment_actions_json", "correct_remediation", "post_incident_debrief", "xp_reward", "is_active") VALUES (6, 'Malware C2 Beaconing via Encrypted TLS Jitter', 'Malware C2 Beaconing', 'HIGH', 'Network flow analyzer detected periodic outbound HTTPS beaconing from endpoint WKS-DEV-19 to unclassified foreign IP 91.240.118.52 at randomized 45-60 second intervals.', '[{"id": "ALT-601", "time": "2026-11-09 23:00:10", "severity": "HIGH", "rule": "Periodic TLS Beaconing Detected: High regularity / Jitter < 15%", "host": "WKS-DEV-19"}]', '[{"timestamp": "23:00:10", "src_ip": "10.0.6.19", "dest_ip": "91.240.118.52", "proto": "HTTPS", "event": "TLS handshake SNI: update-services-cdn.com (Untrusted Self-Signed Cert)"}, {"timestamp": "23:00:58", "src_ip": "10.0.6.19", "dest_ip": "91.240.118.52", "proto": "HTTPS", "event": "POST /api/v1/sync payload_bytes=1024"}, {"timestamp": "23:01:46", "src_ip": "10.0.6.19", "dest_ip": "91.240.118.52", "proto": "HTTPS", "event": "POST /api/v1/sync payload_bytes=1024"}]', 'Cobalt Strike / Sliver C2 Beaconing', '["Isolate Endpoint WKS-DEV-19 from Local Subnet", "Block Destination IP 91.240.118.52 at Perimeter Firewall", "Collect EDR Memory Triage & Persistent Scheduled Tasks", "Scan Associated Internal Subnet for Lateral Movement"]', 'Deploy TLS inspection on outbound traffic, enforce application whitelisting (AppLocker), deploy host-based EDR monitoring.', 'A malicious npm package installed on developer workstation WKS-DEV-19 established an asynchronous Command & Control session communicating with adversary infrastructure.', 250, 1);
INSERT OR IGNORE INTO "soc_scenarios" ("id", "title", "attack_type", "severity", "description", "initial_alerts_json", "logs_json", "correct_classification", "correct_containment_actions_json", "correct_remediation", "post_incident_debrief", "xp_reward", "is_active") VALUES (7, 'Internal Network Reconnaissance & Port Sweeping', 'Suspicious Network Traffic', 'MEDIUM', 'Internal NIDS triggered alerts for sequential SYN scans across RFC1918 internal subnets originating from compromised contractor laptop 10.0.8.14.', '[{"id": "ALT-701", "time": "2026-11-09 18:12:00", "severity": "MEDIUM", "rule": "Internal Port Scan: >100 hosts probed in 2 minutes", "src": "10.0.8.14"}]', '[{"timestamp": "18:12:01", "src_ip": "10.0.8.14", "dest_ip": "10.0.8.1", "proto": "TCP/445", "event": "TCP SYN probe"}, {"timestamp": "18:12:02", "src_ip": "10.0.8.14", "dest_ip": "10.0.8.2", "proto": "TCP/445", "event": "TCP SYN probe"}, {"timestamp": "18:12:05", "src_ip": "10.0.8.14", "dest_ip": "10.0.8.50", "proto": "TCP/3389", "event": "RDP SYN probe open"}]', 'Adversary Internal Reconnaissance & Service Discovery', '["Quarantine Contractor VLAN / Disconnect 10.0.8.14", "Review Active DHCP & MAC Leases for Contractor Device", "Audit RDP Login Attempts on Target Servers", "Revoke Contractor VPN Access"]', 'Implement Zero Trust Network Access (ZTNA), segment contractor networks with strict micro-segmentation firewalls.', 'The contractor workstation was compromised via drive-by download and instructed to map all internal SMB (445) and RDP (3389) servers.', 250, 1);
INSERT OR IGNORE INTO "soc_scenarios" ("id", "title", "attack_type", "severity", "description", "initial_alerts_json", "logs_json", "correct_classification", "correct_containment_actions_json", "correct_remediation", "post_incident_debrief", "xp_reward", "is_active") VALUES (8, 'Ransomware Pre-Cursor: Shadow Copy Deletion Attempt', 'Advanced Ransomware Pre-cursor Incident', 'CRITICAL', 'Windows Event Log 4688: Process creation detected for ''vssadmin.exe delete shadows /all /quiet'' and ''bcdedit.exe /set {default} recoveryenabled No'' on Finance File Server FS-02.', '[{"id": "ALT-801", "time": "2026-11-09 23:45:00", "severity": "CRITICAL", "rule": "T1490 Inhibiting System Recovery: vssadmin delete shadows", "host": "FS-02"}]', '[{"timestamp": "23:44:50", "src_ip": "10.0.2.15", "dest_ip": "-", "proto": "Process", "event": "cmd.exe /c vssadmin.exe delete shadows /all /quiet"}, {"timestamp": "23:44:55", "src_ip": "10.0.2.15", "dest_ip": "-", "proto": "Process", "event": "bcdedit.exe /set {default} bootstatuspolicy ignoreallfailures"}, {"timestamp": "23:45:02", "src_ip": "10.0.2.15", "dest_ip": "-", "proto": "Process", "event": "wbadmin.exe DELETE SYSTEMSTATEBACKUP"}]', 'Imminent Ransomware Deployment & Backup Invalidation', '["Isolate Finance Server FS-02 Immediately via Network Port Shutdown", "Initiate Immutable Offline Backup Verification", "Kill Parent Process Trees for cmd.exe / vssadmin.exe", "Trigger Organization Emergency Incident Response Plan"]', 'Deploy immutable air-gapped backups, restrict vssadmin execution rights to local SYSTEM only, enable Controlled Folder Access in Defender.', 'The adversary gained administrative access to FS-02 and executed standard pre-ransomware destruction commands to ensure victims cannot restore from Volume Shadow Copies.', 250, 1);
INSERT OR IGNORE INTO "employer_profiles" ("id", "user_id", "company_name", "industry", "website", "contact_email", "contact_person", "is_verified", "created_at") VALUES (1, NULL, 'CyberPro Defense Labs', 'Managed Detection & Response (MDR)', 'https://defense.cyberpro.in', 'careers@defense.cyberpro.in', 'Vikramaditya Sen (Head of Talent)', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "employer_profiles" ("id", "user_id", "company_name", "industry", "website", "contact_email", "contact_person", "is_verified", "created_at") VALUES (2, NULL, 'SecOps Horizon Systems', 'Cloud Security & DevSecOps', 'https://horizonsec.io', 'hr@horizonsec.io', 'Rhea Kapoor (Technical Recruiter)', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "employer_profiles" ("id", "user_id", "company_name", "industry", "website", "contact_email", "contact_person", "is_verified", "created_at") VALUES (3, NULL, 'Sentinel Threat Intelligence', 'Threat Hunting & Forensics', 'https://sentinelthreat.com', 'hiring@sentinelthreat.com', 'Arjun Nambiar (SOC Director)', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "employer_jobs" ("id", "employer_id", "title", "job_type", "location", "stipend_or_salary", "required_skills_json", "description", "responsibilities", "requirements", "is_active", "created_at") VALUES (1, 1, 'Junior SOC Tier-1 Analyst', 'Full-time', 'Bengaluru / Hybrid', '₹6,50,000 - ₹8,50,000 / year', '["SIEM (Splunk/ELK)", "Incident Response", "Network Analysis (Wireshark)", "Linux", "Threat Triaging"]', 'We are seeking enthusiastic junior cybersecurity analysts to join our 24/7 Security Operations Center. You will monitor, triage, and investigate live security telemetry, analyze alert logs, and coordinate immediate containment.', 'Monitor SIEM alerts, execute containment playbooks, document incident tickets, and participate in threat hunting drills.', 'Completion of CyberPro Ethical Hacking or SOC track, verified practical lab scores, understanding of MITRE ATT&CK framework.', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "employer_jobs" ("id", "employer_id", "title", "job_type", "location", "stipend_or_salary", "required_skills_json", "description", "responsibilities", "requirements", "is_active", "created_at") VALUES (2, 1, 'Cybersecurity Incident Response Intern', 'Internship', 'Remote (India)', '₹30,000 / month Stipend', '["Digital Forensics", "Memory Analysis", "Python Scripting", "Malware Triage"]', 'Exciting 6-month hands-on internship in our digital forensics and incident response (DFIR) unit. Work alongside senior responders analyzing breach artifacts.', 'Assist in memory dump forensics, reverse engineer malicious scripts, compile post-incident summaries.', 'Enrolled in or graduate of CyberPro Academy, active Skill Passport with verified digital forensics badge.', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "employer_jobs" ("id", "employer_id", "title", "job_type", "location", "stipend_or_salary", "required_skills_json", "description", "responsibilities", "requirements", "is_active", "created_at") VALUES (3, 2, 'Junior Web Application Penetration Tester', 'Full-time', 'Pune / Remote', '₹7,00,000 - ₹9,50,000 / year', '["OWASP Top 10", "Burp Suite", "API Security", "SQL Injection", "XSS"]', 'Perform black-box and grey-box security assessments on client enterprise web applications, mobile APIs, and cloud services.', 'Identify high-impact vulnerabilities, prepare detailed technical assessment reports with CVSS scoring, demonstrate POCs.', 'Demonstrated Bug Bounty Arena points or approved penetration testing projects on CyberPro platform.', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "employer_jobs" ("id", "employer_id", "title", "job_type", "location", "stipend_or_salary", "required_skills_json", "description", "responsibilities", "requirements", "is_active", "created_at") VALUES (4, 3, 'Threat Intelligence & OSINT Researcher', 'Full-time', 'Gurugram / Hybrid', '₹6,00,000 - ₹8,00,000 / year', '["OSINT", "Threat Intelligence", "Malware Analysis", "Dark Web Monitoring"]', 'Collect, correlate, and analyze adversary indicators of compromise (IOCs) across public and private intelligence feeds.', 'Track threat actor campaigns, author threat intelligence briefs, build defensive detection rules (YARA/Sigma).', 'Strong analytical mindset, active CyberPro portfolio showcase, passion for cyber threat defense.', 1, '2026-11-09 18:07:26');
INSERT OR IGNORE INTO "referral_settings" ("key", "value", "updated_at") VALUES ('default_reward_amount', '500', '2026-11-09 17:01:52');
INSERT OR IGNORE INTO "referral_settings" ("key", "value", "updated_at") VALUES ('default_reward_type', 'cash', '2026-11-09 17:01:52');
INSERT OR IGNORE INTO "referral_settings" ("key", "value", "updated_at") VALUES ('min_code_length', '4', '2026-11-09 17:01:52');
INSERT OR IGNORE INTO "referral_settings" ("key", "value", "updated_at") VALUES ('max_code_length', '20', '2026-11-09 17:01:52');
INSERT OR IGNORE INTO "referral_settings" ("key", "value", "updated_at") VALUES ('allow_custom_changes', '1', '2026-11-09 17:01:52');
INSERT OR IGNORE INTO "referral_settings" ("key", "value", "updated_at") VALUES ('auto_approve_on_payment', '1', '2026-11-09 17:01:52');
INSERT OR IGNORE INTO "referral_settings" ("key", "value", "updated_at") VALUES ('referral_rules_json', '{"ccce": {"reward_amount": 500, "reward_type": "cash"}, "ethical-hacking": {"reward_amount": 750, "reward_type": "cash"}, "advanced-cybersecurity": {"reward_amount": 1000, "reward_type": "cash"}, "cyber-fundamentals": {"reward_amount": 300, "reward_type": "cash"}}', '2026-11-09 17:01:52');
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (1, 'admin', 'students', 'Manage Students & Dossiers', 'Core Operations', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (2, 'admin', 'courses', 'Manage Courses & Curriculum', 'Academics', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (3, 'admin', 'lectures', 'Upload & Manage Lectures', 'Academics', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (4, 'admin', 'schedules', 'Manage Class Schedules & Attendance', 'Academics', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (5, 'admin', 'quizzes', 'Quizzes & SOC Labs', 'Academics', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (6, 'admin', 'certificates', 'Issue & Verify Certificates', 'Certification', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (7, 'admin', 'admissions', 'Manage Admissions & Registrations', 'Growth & CRM', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (8, 'admin', 'inquiries', 'Student Inquiries & Chatbot CRM', 'Growth & CRM', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (9, 'admin', 'financials', 'Financials, Payments & EMI', 'Finance', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (10, 'admin', 'reports', 'Reports & Data Vault', 'Business Intelligence', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (11, 'admin', 'staff', 'Manage Staff & RBAC', 'Access Governance', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (12, 'admin', 'audit', 'System Settings & Audit Logs', 'System Security', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (13, 'instructor', 'students', 'Manage Students & Dossiers', 'Core Operations', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (14, 'instructor', 'courses', 'Manage Courses & Curriculum', 'Academics', 1, 1, 1, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (15, 'instructor', 'lectures', 'Upload & Manage Lectures', 'Academics', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (16, 'instructor', 'schedules', 'Manage Class Schedules & Attendance', 'Academics', 1, 1, 1, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (17, 'instructor', 'quizzes', 'Quizzes & SOC Labs', 'Academics', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (18, 'instructor', 'certificates', 'Issue & Verify Certificates', 'Certification', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (19, 'instructor', 'admissions', 'Manage Admissions & Registrations', 'Growth & CRM', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (20, 'instructor', 'inquiries', 'Student Inquiries & Chatbot CRM', 'Growth & CRM', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (21, 'instructor', 'financials', 'Financials, Payments & EMI', 'Finance', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (22, 'instructor', 'reports', 'Reports & Data Vault', 'Business Intelligence', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (23, 'instructor', 'staff', 'Manage Staff & RBAC', 'Access Governance', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (24, 'instructor', 'audit', 'System Settings & Audit Logs', 'System Security', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (25, 'counsellor', 'students', 'Manage Students & Dossiers', 'Core Operations', 1, 1, 1, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (26, 'counsellor', 'courses', 'Manage Courses & Curriculum', 'Academics', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (27, 'counsellor', 'lectures', 'Upload & Manage Lectures', 'Academics', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (28, 'counsellor', 'schedules', 'Manage Class Schedules & Attendance', 'Academics', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (29, 'counsellor', 'quizzes', 'Quizzes & SOC Labs', 'Academics', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (30, 'counsellor', 'certificates', 'Issue & Verify Certificates', 'Certification', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (31, 'counsellor', 'admissions', 'Manage Admissions & Registrations', 'Growth & CRM', 1, 1, 1, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (32, 'counsellor', 'inquiries', 'Student Inquiries & Chatbot CRM', 'Growth & CRM', 1, 1, 1, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (33, 'counsellor', 'financials', 'Financials, Payments & EMI', 'Finance', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (34, 'counsellor', 'reports', 'Reports & Data Vault', 'Business Intelligence', 1, 1, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (35, 'counsellor', 'staff', 'Manage Staff & RBAC', 'Access Governance', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (36, 'counsellor', 'audit', 'System Settings & Audit Logs', 'System Security', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (37, 'support', 'students', 'Manage Students & Dossiers', 'Core Operations', 1, 0, 1, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (38, 'support', 'courses', 'Manage Courses & Curriculum', 'Academics', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (39, 'support', 'lectures', 'Upload & Manage Lectures', 'Academics', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (40, 'support', 'schedules', 'Manage Class Schedules & Attendance', 'Academics', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (41, 'support', 'quizzes', 'Quizzes & SOC Labs', 'Academics', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (42, 'support', 'certificates', 'Issue & Verify Certificates', 'Certification', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (43, 'support', 'admissions', 'Manage Admissions & Registrations', 'Growth & CRM', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (44, 'support', 'inquiries', 'Student Inquiries & Chatbot CRM', 'Growth & CRM', 1, 1, 1, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (45, 'support', 'financials', 'Financials, Payments & EMI', 'Finance', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (46, 'support', 'reports', 'Reports & Data Vault', 'Business Intelligence', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (47, 'support', 'staff', 'Manage Staff & RBAC', 'Access Governance', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (48, 'support', 'audit', 'System Settings & Audit Logs', 'System Security', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (49, 'cert_manager', 'students', 'Manage Students & Dossiers', 'Core Operations', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (50, 'cert_manager', 'courses', 'Manage Courses & Curriculum', 'Academics', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (51, 'cert_manager', 'lectures', 'Upload & Manage Lectures', 'Academics', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (52, 'cert_manager', 'schedules', 'Manage Class Schedules & Attendance', 'Academics', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (53, 'cert_manager', 'quizzes', 'Quizzes & SOC Labs', 'Academics', 1, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (54, 'cert_manager', 'certificates', 'Issue & Verify Certificates', 'Certification', 1, 1, 1, 1);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (55, 'cert_manager', 'admissions', 'Manage Admissions & Registrations', 'Growth & CRM', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (56, 'cert_manager', 'inquiries', 'Student Inquiries & Chatbot CRM', 'Growth & CRM', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (57, 'cert_manager', 'financials', 'Financials, Payments & EMI', 'Finance', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (58, 'cert_manager', 'reports', 'Reports & Data Vault', 'Business Intelligence', 1, 1, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (59, 'cert_manager', 'staff', 'Manage Staff & RBAC', 'Access Governance', 0, 0, 0, 0);
INSERT OR IGNORE INTO "rbac_permissions" ("id", "role_slug", "feature_key", "feature_name", "category", "can_view", "can_create", "can_edit", "can_delete") VALUES (60, 'cert_manager', 'audit', 'System Settings & Audit Logs', 'System Security', 0, 0, 0, 0);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('academy_name', 'CYBERPRO DEFENSE ACADEMY', 'general', 'text', 'Academy Name', 'Official institution branding displayed across student LMS and certificates.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('academy_tagline', 'India''s Premier Zero-Trust Cyber Defense & AI Academy [Verified Live]', 'general', 'text', 'Academy Tagline', 'Primary brand subtitle and course acceleration motto.', 0, 1794227362, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('support_email', 'contact@cyberpro.com', 'general', 'text', 'Primary Support Email', 'Inbound student support and system notification sender.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('admissions_phone', '+91 98765 43210', 'general', 'text', 'Admissions Hotline', 'Primary phone for WhatsApp outreach and counsellor intake.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('academy_url', 'http://127.0.0.1:8000', 'general', 'text', 'Public Portal URL', 'Base URL used in password resets, verify links, and QR codes.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('primary_timezone', 'Asia/Kolkata (IST +05:30)', 'general', 'select', 'System Timezone', 'Timezone for scheduling live classes and attendance logging.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('default_currency', 'INR (₹)', 'general', 'text', 'Default Currency', 'Billing and financial audit reporting currency.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('auth_2fa_enabled', 'true', 'security', 'boolean', 'Enforce Two-Factor Authentication (2FA)', 'Require secondary OTP verification for privileged staff accounts.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('auth_require_special_chars', 'true', 'security', 'boolean', 'Require Special Characters & Numbers', 'Enforce uppercase, numeric, and symbolic complexity.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('auth_max_login_attempts', '5', 'security', 'number', 'Login Attempt Lockout Limit', 'Lock account for 30 minutes after consecutive failures.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('auth_session_timeout_minutes', '120', 'security', 'number', 'Session Inactivity Timeout (Minutes)', 'Automatically expire idle student and administrator sessions.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('auth_single_session_lock', 'true', 'security', 'boolean', 'Strict Single-Device Concurrent Session Lock', 'Anti-piracy: terminate previous active session when user logs in elsewhere.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('backup_auto_schedule', 'daily', 'backup', 'select', 'Automated Backup Schedule', 'Automated hot-snapshot frequency for SQLite database repository.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('backup_retention_days', '30', 'backup', 'number', 'Backup Retention Window (Days)', 'Automatically prune database archives older than retention threshold.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('backup_max_storage_mb', '2048', 'backup', 'number', 'Maximum Backup Storage Allocation (MB)', 'Storage quota allocated for database snapshots.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('backup_compression_enabled', 'true', 'backup', 'boolean', 'Enable Backup Compression', 'Compress database archive files to conserve server disk space.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('audit_log_retention_days', '180', 'backup', 'number', 'Security Telemetry Retention (Days)', 'Preserve student login and privileged admin audit logs.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('payment_gateway_mode', 'live', 'payments', 'select', 'Payment Gateway Mode', 'Toggle between live payment collection and test sandbox mode.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('upi_merchant_vpa', 'cyberpro@icici', 'payments', 'text', 'UPI Merchant VPA', 'Instant QR code billing VPA for direct bank fee payments.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('tax_gst_percentage', '18.0', 'payments', 'number', 'Standard GST / Tax Rate (%)', 'Tax percentage applied during course invoice generation.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('emi_grace_period_days', '7', 'payments', 'number', 'EMI Late Fee Grace Period (Days)', 'Days before overdue installment marks student account restricted.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('auto_unlock_on_full_payment', 'true', 'payments', 'boolean', 'Instant Access on Tuition Clearance', 'Automatically unlock all course modules upon 100% payment verification.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('cloud_storage_provider', 'local', 'integrations', 'select', 'Lecture Video Storage Driver', 'Storage destination (Local Disk, AWS S3, or Cloudflare R2).', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('default_enrollment_status', 'unlocked', 'academics', 'select', 'Default Course Access on Enrollment', 'Initial status granted to newly registered student accounts.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('auto_grant_certificate', 'true', 'academics', 'boolean', 'Automated Certificate Generation', 'Auto-issue cryptographic diploma upon 100% video and quiz completion.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('attendance_required_duration_pct', '75', 'academics', 'number', 'Live Class Attendance Requirement (%)', 'Percentage of live session student must attend for attendance credit.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('whatsapp_meeting_link_anti_piracy', 'true', 'academics', 'boolean', 'Anti-Piracy Gatekeeper Enforcement', 'Block shared links: students must authenticate with email & phone.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('email_welcome_subject', 'Welcome to CYBERPRO Academy // Your Student Access Credentials', 'email', 'text', 'Welcome Email Subject', 'Sent immediately upon student account onboarding.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('email_emi_reminder_subject', 'Important Notice: CYBERPRO Tuition Installment Due Reminder', 'email', 'text', 'EMI Reminder Subject', 'Sent 3 days prior to monthly installment deadline.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('email_class_join_subject', 'CYBERPRO Live Masterclass Alert // Your Personal Join Link', 'email', 'text', 'Live Class Alert Subject', 'Sent 15 minutes before scheduled live lecture begins.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('email_cert_awarded_subject', 'Congratulations! Your Official CYBERPRO Certificate Has Been Issued', 'email', 'text', 'Certificate Award Subject', 'Sent when diploma is approved with SHA-256 hash.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('portal_public_registration_allowed', 'true', 'portal', 'boolean', 'Allow Public Website Registrations', 'Toggle public admissions form on landing pages.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('portal_discussion_forum_enabled', 'true', 'portal', 'boolean', 'Student Discussion Forum', 'Enable collaborative peer Q&A forum inside student LMS.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('portal_leaderboard_visible', 'true', 'portal', 'boolean', 'Top 50 EXP Leaderboard', 'Display batch gamification ranking and podium in portal.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('portal_video_watermark_enabled', 'true', 'portal', 'boolean', 'Dynamic Student Watermarking', 'Burn student email and IP across video canvas to deter piracy.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('portal_allow_recorded_downloads', 'false', 'portal', 'boolean', 'Allow Offline Video Downloads', 'Enable or restrict downloading lecture MP4 files locally.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('chatbot_assistant_name', 'CYBERPRO Sentinel AI', 'chatbot', 'text', 'Chatbot Persona Name', 'Virtual assistant identifier displayed on public website widget.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('chatbot_system_tone', 'Professional Cybersecurity Consultant & Career Advisor', 'chatbot', 'text', 'System Instruction Tone', 'AI system prompt behavior and conversational profile.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('chatbot_auto_qualify_leads', 'true', 'chatbot', 'boolean', 'Automated Lead Intent Qualification', 'Classify inbound student inquiries into Hot, Warm, and Cold tiers.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('chatbot_official_whatsapp', '919876543210', 'chatbot', 'text', 'Official WhatsApp Business Number', 'Redirect number for instant admissions counselling.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('chatbot_kb_sync_interval_hours', '24', 'chatbot', 'number', 'Knowledge Base Sync Interval (Hours)', 'Auto-refresh frequency for academy curriculum knowledge.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('telemetry_logging_level', 'INFO', 'system', 'select', 'System Telemetry Log Level', 'Logging verbosity (DEBUG, INFO, WARN, ERROR).', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('log_failed_auth_attempts', 'true', 'system', 'boolean', 'Log Failed Authentication Attempts', 'Record IP and user-agent of invalid credential attempts.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('track_ip_geo_estimates', 'true', 'system', 'boolean', 'Geographic Location Estimates', 'Resolve client IP addresses to regional city/country tags.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('performance_profiling_enabled', 'true', 'system', 'boolean', 'Server Response Time Profiling', 'Monitor API response latency and database query times.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('maintenance_mode_enabled', 'false', 'maintenance', 'boolean', 'System Maintenance Mode', 'Take public portal and LMS offline with emergency announcement.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('maintenance_announcement_text', 'CYBERPRO is undergoing scheduled infrastructure upgrades. We will be back online shortly.', 'maintenance', 'textarea', 'Maintenance Announcement Message', 'Notice presented to students during system downtime.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('maintenance_estimated_hours', '1', 'maintenance', 'number', 'Estimated Downtime (Hours)', 'Estimated completion window displayed to visitors.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('global_announcement_banner_enabled', 'false', 'maintenance', 'boolean', 'Top Website Announcement Banner', 'Display sitewide alert ribbon across all pages.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('global_announcement_banner_text', 'CCCE Batch 04 Admissions Closing Soon. Reserve your seat today!', 'maintenance', 'text', 'Sitewide Announcement Text', 'Headline shown in top alert ribbon.', 0, 1794225442, 1);
INSERT OR IGNORE INTO "system_settings" ("key", "value", "category", "field_type", "label", "description", "is_secret", "updated_at", "updated_by") VALUES ('platform_version', 'CYBERPRO v2.4.0 Enterprise', 'maintenance', 'text', 'LMS Engine Version', 'Current deployed core release build.', 0, 1794225442, 1);
COMMIT;
