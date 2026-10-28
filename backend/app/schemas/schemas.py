from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# User & Auth Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    confirm_password: str
    role: Optional[str] = "Student"

class PasswordChange(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: str
    is_active: bool
    pseudonym: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Device Schemas
class DeviceCreate(BaseModel):
    name: str
    device_type: str
    location: str
    ip_address: str
    mac_address: str
    status: Optional[str] = "Online"
    risk_score: Optional[int] = 10
    specs: Optional[str] = None
    pos_x: Optional[float] = 0.0
    pos_y: Optional[float] = 0.0

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    risk_score: Optional[int] = None
    is_isolated: Optional[bool] = None
    specs: Optional[str] = None

class DeviceResponse(BaseModel):
    id: int
    device_id: str
    name: str
    device_type: str
    location: str
    ip_address: str
    mac_address: str
    status: str
    risk_score: int
    is_isolated: bool
    last_seen: datetime
    pos_x: float
    pos_y: float
    pos_z: float
    specs: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Access Control Schemas
class AccessRequestCreate(BaseModel):
    resource: str
    resource_type: str = "Computer"
    context_ip: Optional[str] = "192.168.1.105"
    simulated_role: Optional[str] = None  # for testing different role access
    base_risk_modifier: Optional[int] = 0

class AccessRequestResponse(BaseModel):
    id: int
    request_id: str
    user_pseudonym: str
    resource: str
    resource_type: str
    risk_score: int
    decision: str
    action_taken: str
    reason: Optional[str] = None
    client_ip: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class AccessPolicyResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    required_role: str
    resource_type: str
    min_risk: int
    max_risk: int
    requires_approval_above_risk: int
    auto_deny_above_risk: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

# Attack Simulation Schemas
class AttackSimRequest(BaseModel):
    scenario_id: str = "comp_pc" # comp_pc, susp_login, unauth_server, iot_spoof

class AttackStep(BaseModel):
    step_num: int
    title: str
    description: str
    source_node: str
    target_node: str
    technique_id: str
    status: str # "Compromised", "At Risk", "Safe", "Blocked"

class AttackSimResult(BaseModel):
    scenario_name: str
    description: str
    compromised_node: str
    at_risk_nodes: List[str]
    safe_nodes: List[str]
    blocked_nodes: List[str]
    steps: List[AttackStep]
    risk_delta: int
    potential_impact: str
    recommended_containment: str
    containment_available: bool

# Threat Detection Schemas
class ThreatMetricCard(BaseModel):
    active_alerts: int
    high_risk: int
    medium_risk: int
    low_risk: int

class ThreatCategoryCount(BaseModel):
    category: str
    count: int
    percentage: float

class ConfusionMatrixData(BaseModel):
    matrix: List[List[int]] # [[TN, FP], [FN, TP]]
    labels: List[str] = ["Normal", "Threat"]
    accuracy: float
    precision: float
    recall: float
    f1_score: float

class ThreatDetectionEvaluation(BaseModel):
    metrics: ThreatMetricCard
    categories: List[ThreatCategoryCount]
    confusion_matrix: ConfusionMatrixData
    recent_anomalies: List[Dict[str, Any]]
    activity_timeline: List[Dict[str, Any]]

# Privacy Preserving Simulation Schemas
class PrivacySimRequest(BaseModel):
    dataset_name: str = "Synthetic Laboratory Data"
    privacy_method: str = "Differential Privacy" # "Differential Privacy", "Pseudonymisation", "Baseline"
    epsilon: float = Field(default=1.0, ge=0.05, le=10.0)
    policy_name: str = "Risk-Adaptive Access Control"
    sample_size: int = 500

class TradeOffPoint(BaseModel):
    epsilon: float
    model_accuracy: float
    identification_risk: float
    decision_consistency: float

class PrivacyDecisionSample(BaseModel):
    timestamp: str
    pseudonymous_user_id: str
    requested_resource: str
    risk_score: int
    decision: str
    privacy_applied: str

class PrivacySimResult(BaseModel):
    experiment_id: str
    dataset_name: str
    privacy_method: str
    epsilon: float
    policy_name: str
    sample_size: int
    id_risk_before: float
    id_risk_after: float
    model_acc_before: float
    model_acc_after: float
    decision_quality_before: float
    decision_quality_after: float
    far_rate: float
    fdr_rate: float
    tradeoff_curve: List[TradeOffPoint]
    sample_decisions: List[PrivacyDecisionSample]
    theoretical_explanation: Dict[str, Any]

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    affected_resource: Optional[str]
    is_read: bool
    is_resolved: bool
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

# Dashboard Schemas
class DashboardMetrics(BaseModel):
    total_users: int
    active_devices: int
    security_alerts: int
    high_risk_alerts: int
    pending_requests: int
    threat_risk_score: int
    threat_risk_tier: str
    network_activity: List[Dict[str, Any]]
    recent_events: List[Dict[str, Any]]
    system_status: List[Dict[str, str]]
