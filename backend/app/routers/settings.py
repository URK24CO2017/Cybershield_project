from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.models import SystemSetting, User, AuditLog

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("")
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings_list = db.query(SystemSetting).all()
    res: Dict[str, str] = {}
    for s in settings_list:
        res[s.key] = s.value
    return res

@router.post("")
def update_settings(
    settings_map: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    for key, val in settings_map.items():
        existing = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if existing:
            existing.value = str(val)
        else:
            db.add(SystemSetting(key=key, value=str(val), category="Custom"))
    
    audit = AuditLog(
        log_type="System",
        event_type="Settings Saved",
        user_pseudonym=current_user.pseudonym,
        device_name="System Config",
        risk_score=0,
        outcome="Success",
        details=f"Admin {current_user.pseudonym} updated system parameters: {list(settings_map.keys())}."
    )
    db.add(audit)
    db.commit()

    return {"message": "Settings updated successfully"}
