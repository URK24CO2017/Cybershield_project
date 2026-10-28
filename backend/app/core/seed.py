import os
from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash, generate_pseudonym
from app.models.models import (
    User, Device, AccessPolicy, AccessRequest, ActiveSession,
    SecurityEvent, Notification, SystemSetting, AuditLog, PrivacyExperiment
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded with CyberShield laboratory data.")
            return

        print("Seeding CyberShield database with realistic smart laboratory data...")

        # 1. Users
        users_data = [
            {
                "email": "admin@lab.edu",
                "full_name": "Dr. Smith",
                "password": "Admin@123456",
                "role": "Administrator",
                "department": "Computer Science"
            },
            {
                "email": "researcher@lab.edu",
                "full_name": "Dr. Elena Rostova",
                "password": "Research@123456",
                "role": "Researcher",
                "department": "Applied AI & Cybersecurity"
            },
            {
                "email": "technician@lab.edu",
                "full_name": "Marcus Vance",
                "password": "Tech@123456",
                "role": "Technician",
                "department": "Laboratory Infrastructure"
            },
            {
                "email": "student@lab.edu",
                "full_name": "Charlie Miller",
                "password": "Student@123456",
                "role": "Student",
                "department": "Computer Science MSc"
            }
        ]

        created_users = []
        for u in users_data:
            user = User(
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=get_password_hash(u["password"]),
                role=u["role"],
                department=u["department"],
                is_active=True,
                pseudonym=generate_pseudonym(u["email"], u["email"])
            )
            db.add(user)
            created_users.append(user)
        db.commit()

        # 2. Devices (Digital Twin Virtual Model)
        devices_data = [
            {
                "device_id": "D001",
                "name": "Lab PC-01",
                "device_type": "Computer",
                "location": "Lab Room A",
                "ip_address": "192.168.1.101",
                "mac_address": "00:1A:2B:3C:4D:01",
                "status": "Online",
                "risk_score": 12,
                "pos_x": 22.0,
                "pos_y": 25.0,
                "specs": "Ubuntu 22.04 LTS, Intel i7-12700, 32GB RAM, RTX 3080"
            },
            {
                "device_id": "D002",
                "name": "Lab PC-02",
                "device_type": "Computer",
                "location": "Lab Room A",
                "ip_address": "192.168.1.102",
                "mac_address": "00:1A:2B:3C:4D:02",
                "status": "Warning",
                "risk_score": 48,
                "pos_x": 48.0,
                "pos_y": 20.0,
                "specs": "Windows 11 Pro, Intel i9-13900, 64GB RAM, RTX 4090"
            },
            {
                "device_id": "D003",
                "name": "Lab PC-03",
                "device_type": "Computer",
                "location": "Lab Room B",
                "ip_address": "192.168.1.103",
                "mac_address": "00:1A:2B:3C:4D:03",
                "status": "High Risk",
                "risk_score": 85,
                "pos_x": 52.0,
                "pos_y": 68.0,
                "specs": "Ubuntu 22.04 LTS, AMD Ryzen 9, 32GB RAM"
            },
            {
                "device_id": "D004",
                "name": "Server",
                "device_type": "Server",
                "location": "Server Room",
                "ip_address": "192.168.1.10",
                "mac_address": "00:1A:2B:3C:4D:10",
                "status": "Online",
                "risk_score": 15,
                "pos_x": 82.0,
                "pos_y": 28.0,
                "specs": "Debian 12 Cluster Node, 128-core EPYC, 512GB ECC RAM"
            },
            {
                "device_id": "D005",
                "name": "3D Printer",
                "device_type": "3D Printer",
                "location": "Lab Room B",
                "ip_address": "192.168.1.120",
                "mac_address": "00:1A:2B:3C:4D:20",
                "status": "Online",
                "risk_score": 20,
                "pos_x": 76.0,
                "pos_y": 62.0,
                "specs": "Industrial SLA/FDM Dual Extruder, OctoPrint Firmware 1.9"
            },
            {
                "device_id": "D006",
                "name": "IoT Sensor",
                "device_type": "IoT Device",
                "location": "Lab Room A",
                "ip_address": "192.168.1.150",
                "mac_address": "00:1A:2B:3C:4D:30",
                "status": "Online",
                "risk_score": 8,
                "pos_x": 15.0,
                "pos_y": 70.0,
                "specs": "ESP32 Environmental & Thermal Telemetry Gateway"
            },
            {
                "device_id": "D007",
                "name": "Access Door",
                "device_type": "Access Door",
                "location": "Lab Entrance",
                "ip_address": "192.168.1.180",
                "mac_address": "00:1A:2B:3C:4D:40",
                "status": "Online",
                "risk_score": 10,
                "pos_x": 10.0,
                "pos_y": 90.0,
                "specs": "Smart RFID/NFC & Biometric Electromagnetic Lock Controller"
            },
            {
                "device_id": "D008",
                "name": "Research Server",
                "device_type": "Server",
                "location": "Server Room",
                "ip_address": "192.168.1.12",
                "mac_address": "00:1A:2B:3C:4D:12",
                "status": "Online",
                "risk_score": 22,
                "pos_x": 86.0,
                "pos_y": 42.0,
                "specs": "NVIDIA DGX A100 AI Compute Station, 8x A100 80GB"
            }
        ]

        for d in devices_data:
            dev = Device(**d)
            db.add(dev)
        db.commit()

        # 3. Access Policies
        policies_data = [
            {
                "name": "Workstation Standard Policy",
                "description": "Baseline policy for laboratory workstation computers",
                "required_role": "Student",
                "resource_type": "Computer",
                "min_risk": 0,
                "max_risk": 100,
                "requires_approval_above_risk": 30,
                "auto_deny_above_risk": 70
            },
            {
                "name": "Research High-Performance Computing",
                "description": "Policy governing access to AI training clusters and servers",
                "required_role": "Researcher",
                "resource_type": "Server",
                "min_risk": 0,
                "max_risk": 100,
                "requires_approval_above_risk": 25,
                "auto_deny_above_risk": 65
            },
            {
                "name": "Rapid Prototyping Bay Control",
                "description": "Authorization rules for additive manufacturing and 3D printers",
                "required_role": "Technician",
                "resource_type": "3D Printer",
                "min_risk": 0,
                "max_risk": 100,
                "requires_approval_above_risk": 35,
                "auto_deny_above_risk": 70
            },
            {
                "name": "Smart Laboratory Physical Security",
                "description": "Biometric door lock access rules",
                "required_role": "Technician",
                "resource_type": "Access Door",
                "min_risk": 0,
                "max_risk": 100,
                "requires_approval_above_risk": 20,
                "auto_deny_above_risk": 60
            }
        ]

        for p in policies_data:
            policy = AccessPolicy(**p)
            db.add(policy)
        db.commit()

        # 4. Access Requests (matching screenshot #001 to #005)
        now = datetime.now(timezone.utc)
        requests_data = [
            {
                "request_id": "#001",
                "user_pseudonym": "U_A7F5E2",
                "resource": "Lab PC-01",
                "resource_type": "Computer",
                "risk_score": 12,
                "decision": "Allowed",
                "action_taken": "Allowed",
                "reason": "Low risk authenticated session with valid role permissions.",
                "client_ip": "192.168.1.101",
                "timestamp": now - timedelta(minutes=15)
            },
            {
                "request_id": "#002",
                "user_pseudonym": "U_B9C1D4",
                "resource": "Research Server",
                "resource_type": "Server",
                "risk_score": 68,
                "decision": "Extra Verification",
                "action_taken": "Approve",
                "reason": "Medium contextual risk: multi-factor authentication or administrator authorization required.",
                "client_ip": "192.168.1.12",
                "timestamp": now - timedelta(minutes=28)
            },
            {
                "request_id": "#003",
                "user_pseudonym": "U_5E2A9C",
                "resource": "3D Printer",
                "resource_type": "3D Printer",
                "risk_score": 85,
                "decision": "Denied",
                "action_taken": "Review",
                "reason": "High risk threshold breached: potential anomalous behavior or elevated target sensitivity.",
                "client_ip": "192.168.1.120",
                "timestamp": now - timedelta(minutes=45)
            },
            {
                "request_id": "#004",
                "user_pseudonym": "U_C3F601",
                "resource": "IoT Device",
                "resource_type": "IoT Device",
                "risk_score": 22,
                "decision": "Allowed",
                "action_taken": "Allowed",
                "reason": "Normal telemetry channel polling within acceptable variance.",
                "client_ip": "192.168.1.150",
                "timestamp": now - timedelta(minutes=55)
            },
            {
                "request_id": "#005",
                "user_pseudonym": "U_10980E",
                "resource": "Server",
                "resource_type": "Server",
                "risk_score": 55,
                "decision": "Extra Verification",
                "action_taken": "Review",
                "reason": "Cross-subnet database access attempt pending secondary approval.",
                "client_ip": "192.168.1.10",
                "timestamp": now - timedelta(hours=1, minutes=10)
            }
        ]

        for r in requests_data:
            req = AccessRequest(**r)
            db.add(req)
        db.commit()

        # 5. Security Events (matching screenshot 7)
        events_data = [
            {
                "event_type": "Unusual Login",
                "description": "Login attempt detected from atypical external subnet CIDR with rapid password retry sequence.",
                "affected_device": "Lab PC-01",
                "severity": "High",
                "risk_score": 78,
                "status": "Investigating",
                "source_ip": "10.0.4.88",
                "timestamp": now - timedelta(minutes=18)
            },
            {
                "event_type": "Port Scanning",
                "description": "High volume SYN packet sequence scanning closed high-range ports (1024-65535).",
                "affected_device": "Server",
                "severity": "Medium",
                "risk_score": 58,
                "status": "Monitoring",
                "source_ip": "192.168.1.103",
                "timestamp": now - timedelta(minutes=32)
            },
            {
                "event_type": "Malware Activity",
                "description": "Unsigned binary execution attempt flagged by heuristic endpoint detection module.",
                "affected_device": "Lab PC-03",
                "severity": "High",
                "risk_score": 92,
                "status": "Blocked",
                "source_ip": "192.168.1.103",
                "timestamp": now - timedelta(minutes=50)
            },
            {
                "event_type": "Data Access",
                "description": "Unusual bulk read query against training dataset directory during non-laboratory hours.",
                "affected_device": "Research Server",
                "severity": "Medium",
                "risk_score": 62,
                "status": "Investigating",
                "source_ip": "192.168.1.12",
                "timestamp": now - timedelta(hours=1, minutes=20)
            }
        ]

        for ev in events_data:
            db.add(SecurityEvent(**ev))
        db.commit()

        # 6. Notifications
        notifications_data = [
            {
                "title": "High Risk Anomaly Detected",
                "description": "Heuristic endpoint alert triggered on Lab PC-03 (Risk Score 85). Immediate quarantine recommended.",
                "severity": "Critical",
                "affected_resource": "Lab PC-03",
                "is_read": False,
                "is_resolved": False,
                "timestamp": now - timedelta(minutes=12)
            },
            {
                "title": "Pending Access Verification",
                "description": "Researcher account requested administrative elevation to Research Server cluster.",
                "severity": "Medium",
                "affected_resource": "Research Server",
                "is_read": False,
                "is_resolved": False,
                "timestamp": now - timedelta(minutes=35)
            },
            {
                "title": "Device Connectivity Warning",
                "description": "Lab PC-02 network latency threshold exceeded 180ms. Anomaly engine monitoring traffic.",
                "severity": "Low",
                "affected_resource": "Lab PC-02",
                "is_read": True,
                "is_resolved": False,
                "timestamp": now - timedelta(hours=2)
            }
        ]

        for n in notifications_data:
            db.add(Notification(**n))
        db.commit()

        # 7. System Settings (matching screenshot 11)
        settings_data = [
            {"key": "lab_name", "value": "AI Research Laboratory", "category": "General"},
            {"key": "timezone", "value": "(UTC+0) London", "category": "General"},
            {"key": "session_timeout_minutes", "value": "30", "category": "General"},
            {"key": "mfa_enabled", "value": "true", "category": "General"},
            {"key": "risk_low_cutoff", "value": "29", "category": "Security"},
            {"key": "risk_high_cutoff", "value": "70", "category": "Security"},
            {"key": "auto_isolate_critical", "value": "true", "category": "Security"},
            {"key": "privacy_default_epsilon", "value": "1.0", "category": "Privacy Settings"},
            {"key": "privacy_salt_rotation_days", "value": "30", "category": "Privacy Settings"},
            {"key": "digital_twin_poll_interval_sec", "value": "5", "category": "Digital Twin"}
        ]

        for s in settings_data:
            db.add(SystemSetting(**s))
        db.commit()

        # 8. Audit Logs (matching screenshot 10)
        audit_logs_data = [
            {
                "log_type": "Access",
                "event_type": "Access granted",
                "user_pseudonym": "U_A7F5E2",
                "device_name": "Lab PC-01",
                "risk_score": 12,
                "outcome": "Allowed",
                "details": "Authenticated user passed permission and risk threshold."
            },
            {
                "log_type": "Access",
                "event_type": "Access denied",
                "user_pseudonym": "U_B9C1D4",
                "device_name": "Lab PC-03",
                "risk_score": 85,
                "outcome": "Denied",
                "details": "Risk score exceeded 70 threshold for high-security target."
            },
            {
                "log_type": "Security",
                "event_type": "Device connected",
                "user_pseudonym": "System",
                "device_name": "Server",
                "risk_score": 22,
                "outcome": "Allowed",
                "details": "High performance computing node synchronized telemetry."
            },
            {
                "log_type": "Security",
                "event_type": "Suspicious login",
                "user_pseudonym": "U_C3F601",
                "device_name": "Research Server",
                "risk_score": 68,
                "outcome": "Investigating",
                "details": "Multiple rapid login retries flagged by isolation forest model."
            },
            {
                "log_type": "System",
                "event_type": "Policy updated",
                "user_pseudonym": "SecOps_Admin",
                "device_name": "All",
                "risk_score": 0,
                "outcome": "Success",
                "details": "Access policy 'Research High-Performance Computing' updated."
            }
        ]

        for al in audit_logs_data:
            db.add(AuditLog(**al))
        db.commit()

        print("Database seeded successfully with all CyberShield core entities!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
