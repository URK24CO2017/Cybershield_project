from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.models import Device, User, AuditLog
from app.schemas.schemas import DeviceCreate, DeviceUpdate, DeviceResponse

router = APIRouter(prefix="/devices", tags=["Device Management"])

@router.get("", response_model=List[DeviceResponse])
def get_devices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Device).all()

@router.post("", response_model=DeviceResponse)
def create_device(
    dev: DeviceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    count = db.query(Device).count() + 1
    new_id = f"D{count:03d}"
    
    db_dev = Device(
        device_id=new_id,
        name=dev.name,
        device_type=dev.device_type,
        location=dev.location,
        ip_address=dev.ip_address,
        mac_address=dev.mac_address,
        status=dev.status or "Online",
        risk_score=dev.risk_score or 15,
        specs=dev.specs,
        pos_x=dev.pos_x or 30.0,
        pos_y=dev.pos_y or 30.0
    )
    db.add(db_dev)
    db.commit()
    db.refresh(db_dev)

    audit = AuditLog(
        log_type="Security",
        event_type="Device Registered",
        user_pseudonym=current_user.pseudonym,
        device_name=db_dev.name,
        risk_score=db_dev.risk_score,
        outcome="Success",
        details=f"Admin {current_user.pseudonym} registered device {db_dev.name} ({db_dev.device_type})."
    )
    db.add(audit)
    db.commit()

    return db_dev

@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    dev = db.query(Device).filter((Device.device_id == device_id) | (Device.id == device_id)).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")
    return dev

@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: str,
    update_data: DeviceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    dev = db.query(Device).filter((Device.device_id == device_id) | (Device.id == device_id)).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")

    if update_data.name is not None:
        dev.name = update_data.name
    if update_data.location is not None:
        dev.location = update_data.location
    if update_data.status is not None:
        dev.status = update_data.status
    if update_data.risk_score is not None:
        dev.risk_score = update_data.risk_score
    if update_data.is_isolated is not None:
        dev.is_isolated = update_data.is_isolated
    if update_data.specs is not None:
        dev.specs = update_data.specs

    db.commit()
    db.refresh(dev)
    return dev

@router.delete("/{device_id}")
def delete_device(
    device_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    dev = db.query(Device).filter((Device.device_id == device_id) | (Device.id == device_id)).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")

    dev_name = dev.name
    db.delete(dev)
    db.commit()

    audit = AuditLog(
        log_type="Security",
        event_type="Device Deleted",
        user_pseudonym=current_user.pseudonym,
        device_name=dev_name,
        risk_score=0,
        outcome="Warning",
        details=f"Admin {current_user.pseudonym} removed device {dev_name} from inventory."
    )
    db.add(audit)
    db.commit()

    return {"message": f"Device {dev_name} removed successfully"}
