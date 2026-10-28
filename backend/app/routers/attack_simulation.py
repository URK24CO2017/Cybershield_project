from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_optional_current_user
from app.models.models import User, Device
from app.schemas.schemas import AttackSimRequest, AttackSimResult
from app.services.attack_engine import attack_engine

router = APIRouter(prefix="/attack-simulation", tags=["Attack Simulation"])

@router.get("/scenarios")
def get_scenarios():
    return [
        {
            "id": "comp_pc",
            "name": "Compromised Lab PC",
            "description": "Simulate an attacker gaining control of Lab PC-03 and attempting to access other devices and servers.",
            "compromised_node": "Lab PC-03"
        },
        {
            "id": "susp_login",
            "name": "Suspicious Login (Credential Stuffing)",
            "description": "Simulate an attacker brute-forcing technician credentials to command the 3D Printer controller.",
            "compromised_node": "3D Printer"
        },
        {
            "id": "unauth_server",
            "name": "Unauthorized Server Access",
            "description": "Simulate an unauthorized insider attempting direct access to Research Server datasets.",
            "compromised_node": "Research Server"
        }
    ]

@router.post("/run", response_model=AttackSimResult)
def run_attack_simulation(
    req: AttackSimRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    result = attack_engine.run_scenario(db, req.scenario_id)
    return result

@router.post("/contain/{device_name}")
def contain_threat(
    device_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    result = attack_engine.execute_containment(db, device_name)
    return result

@router.post("/reset")
def reset_simulation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    devices = db.query(Device).all()
    for d in devices:
        d.is_isolated = False
        d.status = "Online"
        d.risk_score = 15
    # Keep Lab PC-02 Warning and Lab PC-03 High Risk as realistic default if desired
    pc2 = db.query(Device).filter(Device.name == "Lab PC-02").first()
    if pc2:
        pc2.status = "Warning"
        pc2.risk_score = 48
    pc3 = db.query(Device).filter(Device.name == "Lab PC-03").first()
    if pc3:
        pc3.status = "High Risk"
        pc3.risk_score = 85
    db.commit()
    return {"message": "Laboratory digital twin state reset to initial baseline."}
