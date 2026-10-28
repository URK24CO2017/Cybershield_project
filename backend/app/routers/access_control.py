from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.models import AccessRequest, AccessPolicy, ActiveSession, User, AuditLog
from app.schemas.schemas import AccessRequestCreate, AccessRequestResponse, AccessPolicyResponse
from app.services.access_engine import access_engine

router = APIRouter(prefix="/access-control", tags=["Risk-Adaptive Access Control"])

@router.get("/requests", response_model=List[AccessRequestResponse])
def get_access_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AccessRequest).order_by(AccessRequest.timestamp.desc()).all()

@router.post("/evaluate")
def evaluate_access_request(
    req: AccessRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = access_engine.evaluate_access(
        db=db,
        user=current_user,
        resource=req.resource,
        resource_type=req.resource_type,
        client_ip=req.context_ip or "192.168.1.100",
        simulated_role=req.simulated_role,
        base_risk_modifier=req.base_risk_modifier or 0
    )
    return result

@router.post("/action/{request_id}")
def take_access_action(
    request_id: str,
    action: str, # "Approve" or "Deny"
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    req = db.query(AccessRequest).filter(AccessRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found")

    if action == "Approve":
        req.decision = "Allowed"
        req.action_taken = "Approved"
        req.reason = f"Manually verified and approved by Administrator ({current_user.full_name})."
    else:
        req.decision = "Denied"
        req.action_taken = "Denied"
        req.reason = f"Manually rejected by Administrator ({current_user.full_name})."

    audit = AuditLog(
        log_type="Access",
        event_type=f"Access Request {action}d",
        user_pseudonym=current_user.pseudonym,
        device_name=req.resource,
        risk_score=req.risk_score,
        outcome="Allowed" if action == "Approve" else "Denied",
        details=f"Admin {current_user.pseudonym} performed {action} on request {req.request_id} for {req.user_pseudonym}."
    )
    db.add(audit)
    db.commit()
    db.refresh(req)

    return {"message": f"Request {request_id} updated to {req.decision}", "request": req}

@router.get("/policies", response_model=List[AccessPolicyResponse])
def get_access_policies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AccessPolicy).all()

@router.put("/policies/{policy_id}")
def update_access_policy(
    policy_id: int,
    requires_approval_above_risk: Optional[int] = None,
    auto_deny_above_risk: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    policy = db.query(AccessPolicy).filter(AccessPolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    if requires_approval_above_risk is not None:
        policy.requires_approval_above_risk = requires_approval_above_risk
    if auto_deny_above_risk is not None:
        policy.auto_deny_above_risk = auto_deny_above_risk
    if is_active is not None:
        policy.is_active = is_active

    db.commit()
    return {"message": "Policy updated successfully", "policy": policy}

@router.get("/sessions")
def get_active_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(ActiveSession).filter(ActiveSession.status == "Active").all()
    # Provide synthetic sessions if table empty
    if not sessions:
        return [
            {
                "id": 1,
                "session_id": "sess_88fa12b",
                "user_pseudonym": "U_A7F5E2",
                "device_name": "Lab PC-01",
                "ip_address": "192.168.1.101",
                "started_at": "10:15:00",
                "status": "Active"
            },
            {
                "id": 2,
                "session_id": "sess_39cc01a",
                "user_pseudonym": "U_B9C1D4",
                "device_name": "Research Server",
                "ip_address": "192.168.1.12",
                "started_at": "09:40:00",
                "status": "Active"
            }
        ]
    return sessions

@router.post("/sessions/{session_id}/revoke")
def revoke_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    sess = db.query(ActiveSession).filter(ActiveSession.session_id == session_id).first()
    if sess:
        sess.status = "Revoked"
        db.commit()
    return {"message": f"Session {session_id} has been revoked immediately."}
