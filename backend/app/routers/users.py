from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.models import User, AuditLog
from app.schemas.schemas import UserResponse

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).all()

@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    valid_roles = ["Administrator", "Researcher", "Technician", "Student"]
    if new_role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = target_user.role
    target_user.role = new_role
    db.commit()
    db.refresh(target_user)

    audit = AuditLog(
        log_type="Security",
        event_type="User Role Modified",
        user_pseudonym=current_user.pseudonym,
        device_name="User Directory",
        risk_score=15,
        outcome="Success",
        details=f"Admin {current_user.pseudonym} modified role of {target_user.pseudonym} from {old_role} to {new_role}."
    )
    db.add(audit)
    db.commit()

    return target_user

@router.put("/{user_id}/status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account.")

    target_user.is_active = is_active
    db.commit()
    db.refresh(target_user)

    audit = AuditLog(
        log_type="Security",
        event_type="User Status Toggled",
        user_pseudonym=current_user.pseudonym,
        device_name="User Directory",
        risk_score=20,
        outcome="Success",
        details=f"Admin {current_user.pseudonym} set is_active={is_active} for {target_user.pseudonym}."
    )
    db.add(audit)
    db.commit()

    return target_user
