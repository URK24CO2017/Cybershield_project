from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Student", nullable=False)  # Administrator, Researcher, Technician, Student
    department = Column(String(100), default="Computer Science")
    is_active = Column(Boolean, default=True)
    pseudonym = Column(String(32), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    access_requests = relationship("AccessRequest", back_populates="user")
    active_sessions = relationship("ActiveSession", back_populates="user")

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. D001
    name = Column(String(100), nullable=False)                              # e.g. Lab PC-01
    device_type = Column(String(50), nullable=False)                       # Computer, Server, 3D Printer, IoT Sensor, Access Door
    location = Column(String(100), nullable=False)                          # Lab A, Lab B, Server Room
    ip_address = Column(String(50), nullable=False)
    mac_address = Column(String(50), nullable=False)
    status = Column(String(50), default="Online")                          # Online, Warning, High Risk, Offline
    risk_score = Column(Integer, default=15)                               # 0 - 100
    is_isolated = Column(Boolean, default=False)
    last_seen = Column(DateTime, default=utcnow)
    pos_x = Column(Float, default=0.0)                                     # 2D/3D digital twin coordinate X
    pos_y = Column(Float, default=0.0)                                     # 2D/3D coordinate Y
    pos_z = Column(Float, default=0.0)                                     # 3D coordinate Z
    specs = Column(Text, nullable=True)                                    # Hardware/OS info
    created_at = Column(DateTime, default=utcnow)

class AccessPolicy(Base):
    __tablename__ = "access_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    required_role = Column(String(50), nullable=False)                     # Administrator, Researcher, Technician, Student
    resource_type = Column(String(50), nullable=False)                     # Device, Server, 3D Printer, Lab Access Door
    min_risk = Column(Integer, default=0)
    max_risk = Column(Integer, default=100)
    requires_approval_above_risk = Column(Integer, default=30)
    auto_deny_above_risk = Column(Integer, default=70)
    is_active = Column(Boolean, default=True)

class AccessRequest(Base):
    __tablename__ = "access_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(32), unique=True, index=True, nullable=False) # e.g. #001
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_pseudonym = Column(String(50), nullable=False)                      # e.g. U_A7F5E2
    resource = Column(String(100), nullable=False)                           # Lab PC-01, Research Server, 3D Printer
    resource_type = Column(String(50), default="Computer")
    risk_score = Column(Integer, nullable=False)                             # 0 - 100
    decision = Column(String(50), nullable=False)                            # Allowed, Extra Verification, Denied
    action_taken = Column(String(50), default="None")                        # View, Approve, Review, Block
    reason = Column(String(255), nullable=True)
    client_ip = Column(String(50), default="192.168.1.100")
    timestamp = Column(DateTime, default=utcnow, index=True)

    user = relationship("User", back_populates="access_requests")

class ActiveSession(Base):
    __tablename__ = "active_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_pseudonym = Column(String(50), nullable=False)
    device_name = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=False)
    started_at = Column(DateTime, default=utcnow)
    last_active = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String(50), default="Active")                           # Active, Revoked, Expired

    user = relationship("User", back_populates="active_sessions")

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)                       # Unusual Login, Port Scanning, Malware Activity, Data Access
    description = Column(Text, nullable=False)
    affected_device = Column(String(100), nullable=False)                  # Lab PC-01, Server, Lab PC-03
    severity = Column(String(50), nullable=False)                          # Low, Medium, High, Critical
    risk_score = Column(Integer, default=50)
    status = Column(String(50), default="Investigating")                   # Investigating, Monitoring, Blocked, Resolved
    source_ip = Column(String(50), default="192.168.1.200")
    timestamp = Column(DateTime, default=utcnow, index=True)

class PrivacyExperiment(Base):
    __tablename__ = "privacy_experiments"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(String(50), unique=True, index=True, nullable=False)
    dataset_name = Column(String(100), nullable=False)
    privacy_method = Column(String(50), nullable=False)                    # Differential Privacy, Pseudonymisation, Baseline
    epsilon = Column(Float, default=1.0)
    policy_name = Column(String(100), default="Risk-Adaptive Access Control")
    sample_size = Column(Integer, default=500)
    id_risk_before = Column(Float, nullable=False)                         # e.g. 12%
    id_risk_after = Column(Float, nullable=False)                          # e.g. 2%
    model_acc_before = Column(Float, nullable=False)                       # e.g. 94.2%
    model_acc_after = Column(Float, nullable=False)                        # e.g. 92.8%
    decision_quality_before = Column(Float, nullable=False)                # e.g. 96.1%
    decision_quality_after = Column(Float, nullable=False)                 # e.g. 95.3%
    far_rate = Column(Float, default=1.2)                                  # False acceptance rate %
    fdr_rate = Column(Float, default=2.1)                                  # False denial rate %
    sample_decisions = Column(JSON, nullable=True)                         # JSON list of pseudonymized test decisions
    curve_data = Column(JSON, nullable=True)                               # JSON list of epsilon vs trade-off curve points
    timestamp = Column(DateTime, default=utcnow, index=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="Medium")                        # Low, Medium, High, Critical
    affected_resource = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=utcnow, index=True)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    category = Column(String(50), default="General")                       # General, Security, Access Policies, Notifications, Privacy Settings, Digital Twin, System
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    log_type = Column(String(50), default="Access")                        # Access, Security, System, Report
    event_type = Column(String(100), nullable=False)
    user_pseudonym = Column(String(50), default="System")
    device_name = Column(String(100), default="All")
    risk_score = Column(Integer, default=0)
    outcome = Column(String(50), default="Allowed")                        # Allowed, Denied, Investigating, Success, Warning
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utcnow, index=True)
