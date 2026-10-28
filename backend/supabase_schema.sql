-- ============================================================
-- CyberShield: Adaptive Secure Smart Laboratory
-- Supabase PostgreSQL Schema & Priming Script
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'Student',
    department VARCHAR(64) NOT NULL DEFAULT 'Computer Science',
    hashed_password VARCHAR(256) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DEVICES TABLE
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    device_type VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    room VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Online',
    risk_score INTEGER NOT NULL DEFAULT 10,
    is_isolated BOOLEAN NOT NULL DEFAULT FALSE,
    operating_system VARCHAR(64) DEFAULT 'Ubuntu 22.04 LTS',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ACCESS POLICIES
CREATE TABLE IF NOT EXISTS access_policies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    allowed_roles JSONB DEFAULT '[]'::jsonb,
    resource_type VARCHAR(64) NOT NULL,
    requires_approval_above_risk INTEGER NOT NULL DEFAULT 30,
    auto_deny_above_risk INTEGER NOT NULL DEFAULT 70,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. ACCESS REQUESTS
CREATE TABLE IF NOT EXISTS access_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(64) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    resource_name VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    context_ip VARCHAR(45),
    computed_risk_score INTEGER NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    decision VARCHAR(32) NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ACTIVE SESSIONS
CREATE TABLE IF NOT EXISTS active_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    user_email VARCHAR(128) NOT NULL,
    resource_name VARCHAR(128) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    risk_level VARCHAR(32) NOT NULL DEFAULT 'Low',
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SECURITY EVENTS
CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(128) NOT NULL,
    description TEXT,
    affected_device VARCHAR(128),
    severity VARCHAR(32) NOT NULL DEFAULT 'Medium',
    risk_score INTEGER NOT NULL DEFAULT 50,
    status VARCHAR(32) NOT NULL DEFAULT 'Investigating',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PRIVACY EXPERIMENTS
CREATE TABLE IF NOT EXISTS privacy_experiments (
    id SERIAL PRIMARY KEY,
    experiment_id VARCHAR(64) UNIQUE NOT NULL,
    dataset_name VARCHAR(128) NOT NULL,
    privacy_method VARCHAR(128) NOT NULL,
    epsilon FLOAT NOT NULL,
    policy_name VARCHAR(128) NOT NULL,
    sample_size INTEGER NOT NULL DEFAULT 500,
    id_risk_before FLOAT NOT NULL,
    id_risk_after FLOAT NOT NULL,
    model_acc_before FLOAT NOT NULL,
    model_acc_after FLOAT NOT NULL,
    decision_quality_before FLOAT NOT NULL,
    decision_quality_after FLOAT NOT NULL,
    far_rate FLOAT NOT NULL,
    fdr_rate FLOAT NOT NULL,
    sample_decisions JSONB DEFAULT '[]'::jsonb,
    curve_data JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(64) UNIQUE NOT NULL,
    value VARCHAR(256) NOT NULL
);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    log_type VARCHAR(64) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    user_pseudonym VARCHAR(64),
    device_name VARCHAR(128),
    risk_score INTEGER,
    outcome VARCHAR(32) NOT NULL DEFAULT 'Success',
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    severity VARCHAR(32) NOT NULL DEFAULT 'Medium',
    affected_resource VARCHAR(128),
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================

-- Seed Users (Bcrypt hashed password: 'LabAdmin2026!' or 'StudentPass2026!')
INSERT INTO users (user_id, email, full_name, role, department, hashed_password)
VALUES 
('USR-ADMIN', 'dinesh@lab.edu', 'Dinesh (Lab Administrator)', 'Administrator', 'Cybersecurity Engineering', '$2b$12$NqLq1Bf4Z45F0FhB9sRkQe3i0m5pT0gW4u5r6t7y8u9i0o1p2q3r4'),
('USR-RSCH', 'researcher@lab.edu', 'Dr. Sarah Connor', 'Researcher', 'Applied Artificial Intelligence', '$2b$12$NqLq1Bf4Z45F0FhB9sRkQe3i0m5pT0gW4u5r6t7y8u9i0o1p2q3r4'),
('USR-STUD', 'student@lab.edu', 'Alex Kumar', 'Student', 'Computer Science', '$2b$12$NqLq1Bf4Z45F0FhB9sRkQe3i0m5pT0gW4u5r6t7y8u9i0o1p2q3r4'),
('USR-TECH', 'technician@lab.edu', 'Marcus Brody', 'Lab Technician', 'Hardware Operations', '$2b$12$NqLq1Bf4Z45F0FhB9sRkQe3i0m5pT0gW4u5r6t7y8u9i0o1p2q3r4')
ON CONFLICT (email) DO NOTHING;

-- Seed Devices
INSERT INTO devices (device_id, name, device_type, ip_address, room, status, risk_score, is_isolated, operating_system)
VALUES
('DEV-001', 'Lab PC-01', 'Workstation', '192.168.1.101', 'Room 301 - Main AI Lab', 'Online', 12, FALSE, 'Ubuntu 22.04 LTS'),
('DEV-002', 'Lab PC-02', 'Workstation', '192.168.1.102', 'Room 301 - Main AI Lab', 'Warning', 48, FALSE, 'Windows 11 Enterprise'),
('DEV-003', 'Lab PC-03', 'Workstation', '192.168.1.103', 'Room 302 - Research Lab', 'High Risk', 85, FALSE, 'Ubuntu 20.04 LTS'),
('DEV-004', 'Research Server', 'Server', '192.168.1.200', 'Server Enclave A', 'Online', 15, FALSE, 'Debian 12 Bookworm'),
('DEV-005', 'Central Database', 'Database', '192.168.1.201', 'Server Enclave A', 'Online', 18, FALSE, 'PostgreSQL Cluster on RHEL 9'),
('DEV-006', '3D Printer', 'IoT / Fab', '192.168.1.50', 'Fabrication Lab', 'Online', 8, FALSE, 'Embedded OctoPrint OS'),
('DEV-007', 'IoT Environmental Sensor', 'IoT Sensor', '192.168.1.75', 'Room 301 - Main AI Lab', 'Online', 5, FALSE, 'FreeRTOS ESP32'),
('DEV-008', 'Smart Access Door Gate', 'Physical Access', '192.168.1.10', 'Perimeter Gate 1', 'Online', 10, FALSE, 'Custom MicroPython Controller')
ON CONFLICT (device_id) DO NOTHING;

-- Seed Default Policies
INSERT INTO access_policies (name, description, allowed_roles, resource_type, requires_approval_above_risk, auto_deny_above_risk, is_active)
VALUES
('Research Server Access Policy', 'Governs access to high-performance AI GPU cluster models and telemetry.', '["Administrator", "Researcher"]'::jsonb, 'Server', 30, 70, TRUE),
('Database Access Policy', 'Governs access to internal laboratory PostgreSQL database records.', '["Administrator", "Researcher"]'::jsonb, 'Database', 25, 60, TRUE),
('Lab Workstation Policy', 'Allows students and researchers general access to interactive workstations.', '["Administrator", "Researcher", "Student", "Lab Technician"]'::jsonb, 'Workstation', 35, 75, TRUE),
('IoT & Fabrication Policy', 'Restricts 3D printer and peripheral hardware control to certified staff.', '["Administrator", "Researcher", "Lab Technician"]'::jsonb, 'IoT', 30, 70, TRUE)
ON CONFLICT DO NOTHING;
