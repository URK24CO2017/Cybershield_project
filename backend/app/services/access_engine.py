from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.models import AccessPolicy, Device, AccessRequest, SecurityEvent, Notification, User

class AccessControlEngine:
    """
    Risk-Adaptive Access Control (R-AAC) Engine:
    Zero-Trust principle: Role and permission checks take strict precedence.
    Risk score (0-100) dynamically adapts the enforcement tier:
    - 0 - 29: Low Risk -> Allow if permitted.
    - 30 - 69: Medium Risk -> Step-up / Extra Verification.
    - 70 - 100: High Risk -> Deny/Restrict + Generate Alert.
    """

    ROLE_PERMISSIONS = {
        "Administrator": ["Computer", "Server", "3D Printer", "IoT Device", "Lab Access Door", "Database"],
        "Researcher": ["Computer", "Server", "3D Printer", "IoT Device"],
        "Technician": ["Computer", "3D Printer", "IoT Device", "Lab Access Door"],
        "Student": ["Computer", "3D Printer"]
    }

    RESOURCE_SENSITIVITY = {
        "Database": 90,
        "Research Server": 80,
        "Server": 75,
        "Lab Access Door": 65,
        "3D Printer": 40,
        "Lab PC-01": 20,
        "Lab PC-02": 25,
        "Lab PC-03": 35,
        "IoT Sensor": 15
    }

    def evaluate_access(
        self,
        db: Session,
        user: User,
        resource: str,
        resource_type: str = "Computer",
        client_ip: str = "192.168.1.100",
        simulated_role: str = None,
        base_risk_modifier: int = 0
    ) -> Dict[str, Any]:
        role = simulated_role if simulated_role else user.role
        allowed_resources = self.ROLE_PERMISSIONS.get(role, [])

        # Step 1: PERMISSION CHECK (Strict Precedence)
        is_permitted = (resource_type in allowed_resources) or (resource in allowed_resources)
        
        # If user role does NOT have permission for this resource type, immediate denial regardless of risk
        if not is_permitted:
            risk_score = 45 + base_risk_modifier
            decision = "Denied"
            action_taken = "Blocked"
            reason = f"Permission Denied: Role '{role}' lacks access authorization for '{resource}' ({resource_type})."
            
            # Record Access Request
            req = AccessRequest(
                request_id=f"#{db.query(AccessRequest).count() + 1:03d}",
                user_id=user.id,
                user_pseudonym=user.pseudonym,
                resource=resource,
                resource_type=resource_type,
                risk_score=min(risk_score, 100),
                decision=decision,
                action_taken=action_taken,
                reason=reason,
                client_ip=client_ip
            )
            db.add(req)
            db.commit()
            db.refresh(req)
            return {
                "request_id": req.request_id,
                "user_pseudonym": user.pseudonym,
                "resource": resource,
                "risk_score": req.risk_score,
                "decision": decision,
                "action_taken": action_taken,
                "reason": reason,
                "tier": "Unauthorized"
            }

        # Step 2: Check target device isolation status
        dev = db.query(Device).filter(Device.name == resource).first()
        if dev and dev.is_isolated:
            risk_score = 95
            decision = "Denied"
            action_taken = "Blocked"
            reason = f"Target resource '{resource}' is currently QUARANTINED due to security containment."
            
            req = AccessRequest(
                request_id=f"#{db.query(AccessRequest).count() + 1:03d}",
                user_id=user.id,
                user_pseudonym=user.pseudonym,
                resource=resource,
                resource_type=resource_type,
                risk_score=risk_score,
                decision=decision,
                action_taken=action_taken,
                reason=reason,
                client_ip=client_ip
            )
            db.add(req)
            db.commit()
            db.refresh(req)
            return {
                "request_id": req.request_id,
                "user_pseudonym": user.pseudonym,
                "resource": resource,
                "risk_score": risk_score,
                "decision": decision,
                "action_taken": action_taken,
                "reason": reason,
                "tier": "High Risk"
            }

        # Step 3: DYNAMIC RISK SCORE CALCULATION (0 - 100)
        # Factors:
        # a) Resource baseline sensitivity
        base_res_risk = self.RESOURCE_SENSITIVITY.get(resource, 25)
        
        # b) Target device current risk score
        dev_risk = dev.risk_score if dev else 15

        # c) Client IP anomaly (external or unknown subnet)
        ip_risk = 0 if client_ip.startswith("192.168.1.") else 25

        # d) Time of day check (after hours 20:00 - 06:00 UTC)
        cur_hour = datetime.now(timezone.utc).hour
        time_risk = 20 if (cur_hour < 6 or cur_hour >= 20) else 0

        # Aggregate weighted score
        calculated_risk = int(0.35 * base_res_risk + 0.35 * dev_risk + 0.15 * ip_risk + 0.15 * time_risk + base_risk_modifier)
        calculated_risk = max(5, min(calculated_risk, 98))

        # Step 4: RISK TIER EVALUATION
        if calculated_risk <= 29:
            decision = "Allowed"
            action_taken = "Allowed"
            reason = "Low risk authenticated session with valid role permissions."
            tier = "Low Risk (0-29)"
        elif calculated_risk <= 69:
            decision = "Extra Verification"
            action_taken = "Review"
            reason = "Medium contextual risk: multi-factor authentication or administrator authorization required."
            tier = "Medium Risk (30-69)"
        else:
            decision = "Denied"
            action_taken = "Blocked"
            reason = "High risk threshold breached: potential anomalous behavior or elevated target sensitivity."
            tier = "High Risk (70-100)"

            # Automatically log a security event and high-priority notification
            event = SecurityEvent(
                event_type="High-Risk Access Attempt",
                description=f"User {user.pseudonym} attempted access to sensitive resource {resource} with risk score {calculated_risk}.",
                affected_device=resource,
                severity="High",
                risk_score=calculated_risk,
                status="Investigating",
                source_ip=client_ip
            )
            db.add(event)

            notif = Notification(
                title=f"Access Denied: High Risk ({calculated_risk})",
                description=f"Automated risk threshold blocked access to {resource} for {user.pseudonym}.",
                severity="High",
                affected_resource=resource
            )
            db.add(notif)

        req = AccessRequest(
            request_id=f"#{db.query(AccessRequest).count() + 1:03d}",
            user_id=user.id,
            user_pseudonym=user.pseudonym,
            resource=resource,
            resource_type=resource_type,
            risk_score=calculated_risk,
            decision=decision,
            action_taken=action_taken,
            reason=reason,
            client_ip=client_ip
        )
        db.add(req)
        db.commit()
        db.refresh(req)

        return {
            "request_id": req.request_id,
            "user_pseudonym": user.pseudonym,
            "resource": resource,
            "risk_score": calculated_risk,
            "decision": decision,
            "action_taken": action_taken,
            "reason": reason,
            "tier": tier
        }

access_engine = AccessControlEngine()
