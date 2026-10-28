import io
import csv
import json
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_optional_current_user
from app.models.models import User, PrivacyExperiment
from app.schemas.schemas import PrivacySimRequest, PrivacySimResult
from app.services.privacy_engine import privacy_engine

router = APIRouter(prefix="/privacy-simulation", tags=["Privacy-Preserving Simulation"])

@router.post("/run", response_model=PrivacySimResult)
def run_privacy_simulation(
    req: PrivacySimRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    result = privacy_engine.run_simulation(req)

    # Persist experiment to database
    exp = PrivacyExperiment(
        experiment_id=result.experiment_id,
        dataset_name=result.dataset_name,
        privacy_method=result.privacy_method,
        epsilon=result.epsilon,
        policy_name=result.policy_name,
        sample_size=result.sample_size,
        id_risk_before=result.id_risk_before,
        id_risk_after=result.id_risk_after,
        model_acc_before=result.model_acc_before,
        model_acc_after=result.model_acc_after,
        decision_quality_before=result.decision_quality_before,
        decision_quality_after=result.decision_quality_after,
        far_rate=result.far_rate,
        fdr_rate=result.fdr_rate,
        sample_decisions=[s.dict() for s in result.sample_decisions],
        curve_data=[c.dict() for c in result.tradeoff_curve]
    )
    try:
        db.add(exp)
        db.commit()
    except Exception:
        db.rollback()

    return result

@router.get("/export-csv")
def export_simulation_csv(epsilon: float = 1.0, method: str = "Differential Privacy"):
    req = PrivacySimRequest(epsilon=epsilon, privacy_method=method)
    result = privacy_engine.run_simulation(req)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["CyberShield Privacy-Preserving Simulation Report"])
    writer.writerow(["Experiment ID", result.experiment_id])
    writer.writerow(["Privacy Method", result.privacy_method])
    writer.writerow(["Epsilon (ε)", result.epsilon])
    writer.writerow(["Sample Size", result.sample_size])
    writer.writerow([])
    writer.writerow(["Metric", "Before Privacy", "After Privacy"])
    writer.writerow(["Identification Risk", f"{result.id_risk_before}%", f"{result.id_risk_after}%"])
    writer.writerow(["Model Accuracy", f"{result.model_acc_before}%", f"{result.model_acc_after}%"])
    writer.writerow(["Access Decision Quality", f"{result.decision_quality_before}%", f"{result.decision_quality_after}%"])
    writer.writerow(["False Acceptance Rate (FAR)", f"{result.far_rate}%", f"{result.far_rate}%"])
    writer.writerow(["False Denial Rate (FDR)", f"{result.fdr_rate}%", f"{result.fdr_rate}%"])
    writer.writerow([])
    writer.writerow(["Timestamp", "Pseudonymous User ID", "Requested Resource", "Risk Score", "Decision", "Privacy Applied"])
    for s in result.sample_decisions:
        writer.writerow([s.timestamp, s.pseudonymous_user_id, s.requested_resource, s.risk_score, s.decision, s.privacy_applied])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=cybershield_privacy_exp_{result.experiment_id}.csv"}
    )

@router.get("/export-json")
def export_simulation_json(epsilon: float = 1.0, method: str = "Differential Privacy"):
    req = PrivacySimRequest(epsilon=epsilon, privacy_method=method)
    result = privacy_engine.run_simulation(req)
    data = result.dict()
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=cybershield_privacy_exp_{result.experiment_id}.json"}
    )
