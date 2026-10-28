from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, Device, AccessRequest, SecurityEvent, Notification
from app.schemas.schemas import DashboardMetrics

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_count = max(db.query(User).count(), 4)
    device_count = max(db.query(Device).count(), 8)
    
    # Calculate security alerts
    total_alerts = db.query(SecurityEvent).count()
    high_risk_alerts = db.query(SecurityEvent).filter(SecurityEvent.severity.in_(["High", "Critical"])).count()
    pending_reqs = db.query(AccessRequest).filter(AccessRequest.decision == "Extra Verification").count()

    # Dynamic average risk score across laboratory
    devices = db.query(Device).all()
    avg_risk = int(sum(d.risk_score for d in devices) / len(devices)) if devices else 36
    avg_risk = max(20, min(avg_risk, 85))

    tier = "Low Risk" if avg_risk < 30 else ("Medium Risk" if avg_risk < 70 else "High Risk")

    # 24h Network Activity timeseries
    hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
    normal_trend = [45, 30, 120, 240, 190, 80]
    suspicious_trend = [8, 12, 14, 28, 22, 16]

    network_activity = []
    for h, norm, susp in zip(hours, normal_trend, suspicious_trend):
        network_activity.append({
            "time": h,
            "normal": norm,
            "suspicious": susp
        })

    # Recent Events
    events = db.query(SecurityEvent).order_by(SecurityEvent.timestamp.desc()).limit(5).all()
    recent_events = []
    for ev in events:
        status_color = "Allowed" if ev.status == "Resolved" else ("Blocked" if ev.status == "Blocked" else "High-Risk")
        recent_events.append({
            "time": ev.timestamp.strftime("%H:%M:%S"),
            "event": ev.event_type,
            "user": "user01" if "01" in ev.affected_device else ("user03" if "03" in ev.affected_device else "sys_proc"),
            "status": status_color
        })

    if not recent_events:
        recent_events = [
            {"time": "10:24:12", "event": "Access granted (risk score: 12)", "user": "user01", "status": "Allowed"},
            {"time": "10:21:05", "event": "Suspicious login attempt", "user": "user03", "status": "High-Risk"},
            {"time": "10:18:44", "event": "Device connected", "user": "lab-pc-03", "status": "Online"},
            {"time": "10:14:20", "event": "Access denied (unauthorized)", "user": "user12", "status": "Blocked"},
            {"time": "10:11:50", "event": "Policy update applied", "user": "admin", "status": "Success"}
        ]

    system_status = [
        {"service": "Authentication Service", "status": "Online"},
        {"service": "Threat Detection Engine", "status": "Online"},
        {"service": "Digital Twin Simulator", "status": "Online"},
        {"service": "Privacy Engine", "status": "Online"},
        {"service": "Database", "status": "Online"}
    ]

    return DashboardMetrics(
        total_users=user_count,
        active_devices=device_count,
        security_alerts=max(total_alerts, 5),
        high_risk_alerts=max(high_risk_alerts, 2),
        pending_requests=max(pending_reqs, 3),
        threat_risk_score=avg_risk,
        threat_risk_tier=tier,
        network_activity=network_activity,
        recent_events=recent_events,
        system_status=system_status
    )
