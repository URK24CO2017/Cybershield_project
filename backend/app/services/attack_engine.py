from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Device, SecurityEvent, Notification, AuditLog
from app.schemas.schemas import AttackSimResult, AttackStep

class AttackSimulationEngine:
    SCENARIOS = {
        "comp_pc": {
            "name": "Compromised Lab PC (Lateral Movement)",
            "description": "Simulates an attacker gaining control of Lab PC-03 via malicious payload and attempting to pivot across the internal subnet to target the Research Server and Database.",
            "compromised_node": "Lab PC-03",
            "at_risk_nodes": ["Lab PC-01", "Research Server", "Database"],
            "safe_nodes": ["IoT Sensor", "3D Printer", "Smart Door"],
            "blocked_nodes": ["Smart Door"],
            "risk_delta": 45,
            "potential_impact": "Critical exfiltration of laboratory research datasets and intellectual property.",
            "recommended_containment": "Isolate Lab PC-03 network port via digital twin quarantine switch and revoke active session tokens.",
            "steps": [
                {
                    "step_num": 1,
                    "title": "Initial Access (Phishing Macro Execution)",
                    "description": "Adversary achieves initial shell on Lab PC-03 via student email attachment.",
                    "source_node": "External Attacker",
                    "target_node": "Lab PC-03",
                    "technique_id": "T1204.002",
                    "status": "Compromised"
                },
                {
                    "step_num": 2,
                    "title": "Subnet Reconnaissance & Port Scanning",
                    "description": "Attacker scans 192.168.1.0/24 discovering open SSH port 22 and SQL port 5432.",
                    "source_node": "Lab PC-03",
                    "target_node": "Research Server",
                    "technique_id": "T1046",
                    "status": "At Risk"
                },
                {
                    "step_num": 3,
                    "title": "Credential Dumping via LSASS",
                    "description": "Cached laboratory researcher credentials dumped to execute pass-the-hash.",
                    "source_node": "Lab PC-03",
                    "target_node": "Database",
                    "technique_id": "T1003.001",
                    "status": "At Risk"
                },
                {
                    "step_num": 4,
                    "title": "Network Access Control Defense Enforcement",
                    "description": "Adaptive access control detects abnormal port entropy and blocks egress traffic to Smart Door.",
                    "source_node": "CyberShield Engine",
                    "target_node": "Smart Door",
                    "technique_id": "D3-NDP",
                    "status": "Blocked"
                }
            ]
        },
        "susp_login": {
            "name": "Suspicious Login & Credential Stuffing",
            "description": "Simulates anomalous authentication attempts from an unapproved IP address outside operating hours targeting 3D Printer controller.",
            "compromised_node": "3D Printer",
            "at_risk_nodes": ["Lab PC-02", "IoT Sensor"],
            "safe_nodes": ["Lab PC-01", "Lab PC-03", "Research Server", "Database"],
            "blocked_nodes": ["Database"],
            "risk_delta": 30,
            "potential_impact": "Unauthorized manipulation of 3D printing parameters risking physical equipment damage.",
            "recommended_containment": "Enforce mandatory MFA step-up verification and temporarily lock 3D printer API key.",
            "steps": [
                {
                    "step_num": 1,
                    "title": "Credential Stuffing",
                    "description": "Rapid automated authentication requests from unknown CIDR block.",
                    "source_node": "External Threat",
                    "target_node": "3D Printer",
                    "technique_id": "T1110.004",
                    "status": "Compromised"
                },
                {
                    "step_num": 2,
                    "title": "Privilege Escalation Attempt",
                    "description": "Attacker attempts to inject firmware modification payload.",
                    "source_node": "3D Printer",
                    "target_node": "Lab PC-02",
                    "technique_id": "T1068",
                    "status": "At Risk"
                }
            ]
        },
        "unauth_server": {
            "name": "Unauthorized Server Direct Access",
            "description": "Simulates an unauthorized insider directly attempting to probe the Research Server repository.",
            "compromised_node": "Research Server",
            "at_risk_nodes": ["Database"],
            "safe_nodes": ["Lab PC-01", "Lab PC-02", "Lab PC-03", "3D Printer", "IoT Sensor"],
            "blocked_nodes": ["Smart Door"],
            "risk_delta": 40,
            "potential_impact": "Exposure of unreleased laboratory neural network model weights and experimental raw logs.",
            "recommended_containment": "Place Research Server into strict maintenance mode and restrict access to Administrator role only.",
            "steps": [
                {
                    "step_num": 1,
                    "title": "Direct Unauthorized Port Probe",
                    "description": "Direct connection attempt on private administrative port 8443 without valid bearer token.",
                    "source_node": "Lab PC-02",
                    "target_node": "Research Server",
                    "technique_id": "T1190",
                    "status": "Compromised"
                }
            ]
        }
    }

    def run_scenario(self, db: Session, scenario_id: str) -> AttackSimResult:
        data = self.SCENARIOS.get(scenario_id, self.SCENARIOS["comp_pc"])
        comp_node = data["compromised_node"]

        # Dynamically update device status in digital twin
        dev = db.query(Device).filter(Device.name == comp_node).first()
        if dev:
            dev.status = "High Risk"
            dev.risk_score = 85
            db.commit()

        # Update at-risk devices
        for node_name in data["at_risk_nodes"]:
            d = db.query(Device).filter(Device.name == node_name).first()
            if d and d.status != "High Risk":
                d.status = "Warning"
                d.risk_score = 65
        db.commit()

        # Log simulated security event
        ev = SecurityEvent(
            event_type="Attack Simulation: " + data["name"],
            description=f"Simulation triggered: {comp_node} flagged as compromised node.",
            affected_device=comp_node,
            severity="High",
            risk_score=85,
            status="Investigating"
        )
        db.add(ev)

        # Log notification
        notif = Notification(
            title=f"Attack Simulation Active: {comp_node}",
            description=f"Automated threat simulation active. Recommended containment: {data['recommended_containment']}",
            severity="Critical",
            affected_resource=comp_node
        )
        db.add(notif)
        db.commit()

        steps = [AttackStep(**s) for s in data["steps"]]
        return AttackSimResult(
            scenario_name=data["name"],
            description=data["description"],
            compromised_node=comp_node,
            at_risk_nodes=data["at_risk_nodes"],
            safe_nodes=data["safe_nodes"],
            blocked_nodes=data["blocked_nodes"],
            steps=steps,
            risk_delta=data["risk_delta"],
            potential_impact=data["potential_impact"],
            recommended_containment=data["recommended_containment"],
            containment_available=True
        )

    def execute_containment(self, db: Session, device_name: str) -> Dict[str, Any]:
        """Executes defensive containment on a compromised device."""
        dev = db.query(Device).filter(Device.name == device_name).first()
        if not dev:
            # fallback to search by ID or name
            dev = db.query(Device).first()

        if dev:
            dev.is_isolated = True
            dev.status = "Offline"
            dev.risk_score = 15
            
            # Reset at-risk devices back to normal
            other_devs = db.query(Device).filter(Device.name != dev.name).all()
            for od in other_devs:
                if od.status in ["Warning", "High Risk"]:
                    od.status = "Online"
                    od.risk_score = 12

            # Record audit log
            audit = AuditLog(
                log_type="Security",
                event_type="Device Quarantine Containment",
                user_pseudonym="SecOps_Admin",
                device_name=dev.name,
                risk_score=dev.risk_score,
                outcome="Success",
                details=f"Defensive containment applied: {dev.name} quarantined from laboratory subnet. Lateral propagation eliminated."
            )
            db.add(audit)

            notif = Notification(
                title=f"Containment Succeeded: {dev.name}",
                description=f"Quarantine isolation active. Attack path severed successfully.",
                severity="Low",
                affected_resource=dev.name,
                is_resolved=True
            )
            db.add(notif)
            db.commit()

            return {
                "success": True,
                "message": f"Device '{dev.name}' successfully isolated and quarantined. Threat propagation neutralized.",
                "device_id": dev.device_id,
                "status": dev.status,
                "is_isolated": dev.is_isolated
            }
        return {"success": False, "message": "Device not found."}

attack_engine = AttackSimulationEngine()
