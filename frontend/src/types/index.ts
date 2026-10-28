export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'Administrator' | 'Researcher' | 'Technician' | 'Student';
  department: string;
  is_active: boolean;
  pseudonym: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Device {
  id: number;
  device_id: string;
  name: string;
  device_type: string;
  location: string;
  ip_address: string;
  mac_address: string;
  status: 'Online' | 'Warning' | 'High Risk' | 'Offline';
  risk_score: number;
  is_isolated: boolean;
  last_seen: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  specs?: string;
}

export interface AccessRequest {
  id: number;
  request_id: string;
  user_pseudonym: string;
  resource: string;
  resource_type: string;
  risk_score: number;
  decision: 'Allowed' | 'Extra Verification' | 'Denied';
  action_taken: string;
  reason?: string;
  client_ip: string;
  timestamp: string;
}

export interface AccessPolicy {
  id: number;
  name: string;
  description?: string;
  required_role: string;
  resource_type: string;
  min_risk: number;
  max_risk: number;
  requires_approval_above_risk: number;
  auto_deny_above_risk: number;
  is_active: boolean;
}

export interface ActiveSession {
  id: number;
  session_id: string;
  user_pseudonym: string;
  device_name: string;
  ip_address: string;
  started_at: string;
  status: string;
}

export interface AttackStep {
  step_num: number;
  title: string;
  description: string;
  source_node: string;
  target_node: string;
  technique_id: string;
  status: 'Compromised' | 'At Risk' | 'Safe' | 'Blocked';
}

export interface AttackSimResult {
  scenario_name: string;
  description: string;
  compromised_node: string;
  at_risk_nodes: string[];
  safe_nodes: string[];
  blocked_nodes: string[];
  steps: AttackStep[];
  risk_delta: number;
  potential_impact: string;
  recommended_containment: string;
  containment_available: boolean;
}

export interface ThreatEvaluation {
  metrics: {
    active_alerts: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  };
  categories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  confusion_matrix: {
    matrix: number[][];
    labels: string[];
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  recent_anomalies: {
    time: string;
    type: string;
    description: string;
    device: string;
    risk: string;
    status: string;
  }[];
  activity_timeline: {
    time: string;
    normal: number;
    suspicious: number;
  }[];
}

export interface TradeOffPoint {
  epsilon: number;
  model_accuracy: number;
  identification_risk: number;
  decision_consistency: number;
}

export interface PrivacyDecisionSample {
  timestamp: string;
  pseudonymous_user_id: string;
  requested_resource: string;
  risk_score: number;
  decision: string;
  privacy_applied: string;
}

export interface PrivacySimResult {
  experiment_id: string;
  dataset_name: string;
  privacy_method: string;
  epsilon: number;
  policy_name: string;
  sample_size: number;
  id_risk_before: number;
  id_risk_after: number;
  model_acc_before: number;
  model_acc_after: number;
  decision_quality_before: number;
  decision_quality_after: number;
  far_rate: number;
  fdr_rate: number;
  tradeoff_curve: TradeOffPoint[];
  sample_decisions: PrivacyDecisionSample[];
  theoretical_explanation: {
    privacy_mechanism: string;
    sensitivity: string;
    noise_distribution: string;
    pseudonymisation: string;
    limitations: string;
  };
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affected_resource?: string;
  is_read: boolean;
  is_resolved: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: number;
  log_type: string;
  event_type: string;
  user_pseudonym: string;
  device_name: string;
  risk_score: number;
  outcome: string;
  details?: string;
  timestamp: string;
}

export interface DashboardMetrics {
  total_users: number;
  active_devices: number;
  security_alerts: number;
  high_risk_alerts: number;
  pending_requests: number;
  threat_risk_score: number;
  threat_risk_tier: string;
  network_activity: { time: string; normal: number; suspicious: number }[];
  recent_events: { time: string; event: string; user: string; status: string }[];
  system_status: { service: string; status: string }[];
}
