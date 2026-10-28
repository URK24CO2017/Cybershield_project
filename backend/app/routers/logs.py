import io
import csv
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import AuditLog, User

router = APIRouter(prefix="/logs", tags=["Logs & Reports"])

@router.get("")
def get_logs(
    log_type: Optional[str] = None, # Access, Security, System, Report
    event_type: Optional[str] = None,
    user_pseudonym: Optional[str] = None,
    device: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AuditLog)
    if log_type and log_type != "All":
        query = query.filter(AuditLog.log_type == log_type)
    if event_type and event_type != "All":
        query = query.filter(AuditLog.event_type.ilike(f"%{event_type}%"))
    if user_pseudonym and user_pseudonym != "All":
        query = query.filter(AuditLog.user_pseudonym.ilike(f"%{user_pseudonym}%"))
    if device and device != "All":
        query = query.filter(AuditLog.device_name.ilike(f"%{device}%"))

    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/export-csv")
def export_logs_csv(
    log_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AuditLog)
    if log_type and log_type != "All":
        query = query.filter(AuditLog.log_type == log_type)

    logs = query.order_by(AuditLog.timestamp.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Log Type", "Event Type", "User Pseudonym", "Device", "Risk Score", "Outcome", "Details"])

    for log in logs:
        writer.writerow([
            log.id,
            log.timestamp.strftime("%Y-%m-%d %H:%M:%S") if log.timestamp else "",
            log.log_type,
            log.event_type,
            log.user_pseudonym,
            log.device_name,
            log.risk_score,
            log.outcome,
            log.details
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=cybershield_audit_logs.csv"}
    )
