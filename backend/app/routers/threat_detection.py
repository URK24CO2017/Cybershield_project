from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.core.deps import get_current_user
from app.models.models import User
from app.ml.anomaly_model import threat_model
from app.schemas.schemas import ThreatDetectionEvaluation

router = APIRouter(prefix="/threat-detection", tags=["AI Threat Detection"])

@router.get("/evaluation", response_model=ThreatDetectionEvaluation)
def get_threat_evaluation(current_user: User = Depends(get_current_user)):
    data = threat_model.get_full_evaluation()
    return data

@router.post("/score-event")
def score_custom_event(event_features: Dict[str, float], current_user: User = Depends(get_current_user)):
    risk_score = threat_model.score_event(event_features)
    tier = "Low" if risk_score < 30 else ("Medium" if risk_score < 70 else "High")
    return {
        "risk_score": risk_score,
        "threat_severity": tier,
        "is_anomalous": risk_score >= 50,
        "model_engine": "scikit-learn IsolationForest (Contamination=0.15)"
    }
