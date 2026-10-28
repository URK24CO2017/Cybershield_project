import numpy as np
import pandas as pd
from typing import Tuple

def generate_synthetic_lab_telemetry(n_samples: int = 1200, random_state: int = 42) -> pd.DataFrame:
    """
    Generates synthetic laboratory cybersecurity telemetry dataset with realistic statistical distributions.
    Features:
    - hour: hour of access request (0-23)
    - failed_attempts: consecutive failed authentication attempts (0-10)
    - packet_rate: packets/sec (normal: 40-300, attack: 1500-6000)
    - bytes_mb: data volume in MB (normal: 0.5-30, attack: 100-1500)
    - unusual_ports_ratio: fraction of connections to non-standard ports (0.0 - 1.0)
    - ip_reputation_risk: threat intelligence IP risk score (0.0 - 1.0)
    - is_threat: binary ground truth label (0: Normal, 1: Threat)
    - threat_category: category of activity
    """
    np.random.seed(random_state)
    n_threats = int(n_samples * 0.15)
    n_normal = n_samples - n_threats

    # 1. Normal Laboratory Activity (Normal business hours, low failed logins, steady packet flow)
    normal_hour = np.clip(np.random.normal(13.5, 3.5, n_normal).astype(int), 7, 21)
    normal_failed = np.random.choice([0, 1, 2], size=n_normal, p=[0.88, 0.10, 0.02])
    normal_packets = np.random.gamma(shape=5.0, scale=30.0, size=n_normal) + 30.0
    normal_bytes = np.random.exponential(scale=12.0, size=n_normal) + 0.5
    normal_ports_ratio = np.random.beta(a=0.5, b=10.0, size=n_normal) * 0.15
    normal_ip_risk = np.random.beta(a=1.0, b=12.0, size=n_normal) * 0.3

    # 2. Threat Activity (Unusual hours, high failed logins, port scans, high exfiltration)
    threat_types = np.random.choice(
        ["Unusual Login", "Port Scanning", "Malware Activity", "Data Access", "Lateral Movement"],
        size=n_threats,
        p=[0.40, 0.25, 0.15, 0.10, 0.10]
    )
    
    threat_hour = np.random.choice(np.concatenate([np.arange(0, 7), np.arange(21, 24)]), size=n_threats)
    threat_failed = np.random.choice([2, 3, 5, 7, 10], size=n_threats, p=[0.2, 0.3, 0.25, 0.15, 0.1])
    threat_packets = np.random.uniform(800.0, 5000.0, size=n_threats)
    threat_bytes = np.random.exponential(scale=250.0, size=n_threats) + 50.0
    threat_ports_ratio = np.random.uniform(0.4, 0.95, size=n_threats)
    threat_ip_risk = np.random.uniform(0.65, 0.98, size=n_threats)

    # Adjust features by threat type for realism
    for i, ttype in enumerate(threat_types):
        if ttype == "Port Scanning":
            threat_packets[i] = np.random.uniform(3000, 7500)
            threat_ports_ratio[i] = np.random.uniform(0.75, 0.99)
        elif ttype == "Unusual Login":
            threat_failed[i] = np.random.choice([4, 6, 8, 9])
            threat_bytes[i] = np.random.uniform(1, 10)
        elif ttype == "Data Access":
            threat_bytes[i] = np.random.uniform(400, 1800)

    # Combine into DataFrame
    df_normal = pd.DataFrame({
        "hour": normal_hour,
        "failed_attempts": normal_failed,
        "packet_rate": normal_packets,
        "bytes_mb": normal_bytes,
        "unusual_ports_ratio": normal_ports_ratio,
        "ip_reputation_risk": normal_ip_risk,
        "is_threat": 0,
        "threat_category": "Normal"
    })

    df_threat = pd.DataFrame({
        "hour": threat_hour,
        "failed_attempts": threat_failed,
        "packet_rate": threat_packets,
        "bytes_mb": threat_bytes,
        "unusual_ports_ratio": threat_ports_ratio,
        "ip_reputation_risk": threat_ip_risk,
        "is_threat": 1,
        "threat_category": threat_types
    })

    df = pd.concat([df_normal, df_threat], ignore_index=True).sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df
