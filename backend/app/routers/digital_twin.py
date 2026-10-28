from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin
from app.models.models import Device, User, AuditLog
from app.schemas.schemas import DeviceResponse

router = APIRouter(prefix="/digital-twin", tags=["Cybersecurity Digital Twin"])

@router.get("/topology")
def get_digital_twin_topology(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    devices = db.query(Device).all()
    
    # Laboratory Floorplan Rooms
    rooms = [
        {"id": "room_a", "name": "Lab Room A", "x": 10, "y": 10, "width": 45, "height": 45, "type": "Workstation Area"},
        {"id": "room_b", "name": "Lab Room B (Additive Lab)", "x": 10, "y": 55, "width": 45, "height": 40, "type": "Rapid Prototyping"},
        {"id": "server_room", "name": "Server Room (HPC)", "x": 58, "y": 10, "width": 38, "height": 45, "type": "Restricted Data Center"},
        {"id": "prototyping", "name": "Fabrication Bay", "x": 58, "y": 55, "width": 38, "height": 40, "type": "Hardware Testing"}
    ]

    # Logical network connections between devices
    connections = [
        {"from": "Lab PC-01", "to": "Server", "status": "Normal"},
        {"from": "Lab PC-02", "to": "Server", "status": "Normal"},
        {"from": "Lab PC-03", "to": "Research Server", "status": "Suspicious"},
        {"from": "3D Printer", "to": "Lab PC-02", "status": "Normal"},
        {"from": "IoT Sensor", "to": "Server", "status": "Normal"},
        {"from": "Access Door", "to": "Server", "status": "Normal"},
        {"from": "Research Server", "to": "Server", "status": "Normal"}
    ]

    return {
        "devices": devices,
        "rooms": rooms,
        "connections": connections,
        "laboratory_name": "AI Research Laboratory",
        "last_sync": "Live Stream Active"
    }

@router.post("/quarantine/{device_id}")
def toggle_device_quarantine(
    device_id: str,
    isolate: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    dev = db.query(Device).filter((Device.device_id == device_id) | (Device.name == device_id)).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")

    dev.is_isolated = isolate
    if isolate:
        dev.status = "Offline"
        dev.risk_score = 10
    else:
        dev.status = "Online"
        dev.risk_score = 15

    audit = AuditLog(
        log_type="Security",
        event_type="Device Quarantine Changed",
        user_pseudonym=current_user.pseudonym,
        device_name=dev.name,
        risk_score=dev.risk_score,
        outcome="Success",
        details=f"Admin {current_user.pseudonym} set isolation={isolate} on {dev.name}."
    )
    db.add(audit)
    db.commit()
    db.refresh(dev)

    return {
        "message": f"Device {dev.name} isolation state updated to {isolate}",
        "device": dev
    }
