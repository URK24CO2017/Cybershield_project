import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import generate_pseudonym
from app.services.privacy_engine import privacy_engine
from app.schemas.schemas import PrivacySimRequest

client = TestClient(app)

def test_health_and_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["project"] == "CyberShield API"

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_admin_login_and_token():
    res = client.post("/api/auth/login", json={
        "email": "admin@lab.edu",
        "password": "Admin@123456"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Administrator"
    assert data["user"]["email"] == "admin@lab.edu"
    assert data["user"]["pseudonym"].startswith("U_")

def test_login_invalid_password():
    res = client.post("/api/auth/login", json={
        "email": "admin@lab.edu",
        "password": "WrongPassword!999"
    })
    assert res.status_code == 401

def test_safe_registration_no_admin_escalation():
    import time
    unique_email = f"student_{int(time.time()*1000)}@lab.edu"
    res = client.post("/api/auth/register", json={
        "email": unique_email,
        "full_name": "New Student",
        "password": "StudentPass@123",
        "confirm_password": "StudentPass@123",
        "role": "Administrator"  # Malicious attempt to self-assign Administrator
    })
    assert res.status_code == 200
    user = res.json()
    # Enforces safe default: public registration must NEVER grant Administrator
    assert user["role"] == "Student"
    assert user["pseudonym"].startswith("U_")

def test_pseudonym_generation_reproducibility():
    p1 = generate_pseudonym("user_test", "user_test@lab.edu")
    p2 = generate_pseudonym("user_test", "user_test@lab.edu")
    assert p1 == p2
    assert p1.startswith("U_")
    assert len(p1) == 8

def test_risk_adaptive_access_control():
    # Login as admin to get token
    login_res = client.post("/api/auth/login", json={
        "email": "admin@lab.edu",
        "password": "Admin@123456"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Low risk permitted request (Admin accessing Computer)
    res_low = client.post("/api/access-control/evaluate", json={
        "resource": "Lab PC-01",
        "resource_type": "Computer",
        "context_ip": "192.168.1.101",
        "base_risk_modifier": -10
    }, headers=headers)
    assert res_low.status_code == 200
    data_low = res_low.json()
    assert data_low["decision"] in ["Allowed", "Extra Verification"]

    # 2. Strict Zero-Trust Precedence: Unauthorized role requesting Database
    # Even if low risk, non-permitted role must be DENIED!
    res_unauth = client.post("/api/access-control/evaluate", json={
        "resource": "Database",
        "resource_type": "Database",
        "simulated_role": "Student",
        "base_risk_modifier": -20
    }, headers=headers)
    assert res_unauth.status_code == 200
    data_unauth = res_unauth.json()
    assert data_unauth["decision"] == "Denied"
    assert "Permission Denied" in data_unauth["reason"]

    # 3. High risk threshold breach (modifier +60)
    res_high = client.post("/api/access-control/evaluate", json={
        "resource": "Research Server",
        "resource_type": "Server",
        "context_ip": "10.0.99.12",  # external IP
        "base_risk_modifier": 50
    }, headers=headers)
    assert res_high.status_code == 200
    data_high = res_high.json()
    assert data_high["decision"] in ["Denied", "Extra Verification"]
    assert data_high["risk_score"] >= 40

def test_privacy_simulation_engine():
    # Test Laplace DP with epsilon = 1.0
    req = PrivacySimRequest(
        dataset_name="Synthetic Laboratory Data",
        privacy_method="Differential Privacy",
        epsilon=1.0,
        sample_size=300
    )
    result = privacy_engine.run_simulation(req)
    assert result.epsilon == 1.0
    assert result.id_risk_after < result.id_risk_before
    assert len(result.sample_decisions) > 0
    assert len(result.tradeoff_curve) > 0
    assert "Laplace" in result.theoretical_explanation["privacy_mechanism"]

def test_ai_threat_detection_model():
    login_res = client.post("/api/auth/login", json={
        "email": "admin@lab.edu",
        "password": "Admin@123456"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    eval_res = client.get("/api/threat-detection/evaluation", headers=headers)
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert "confusion_matrix" in data
    cm = data["confusion_matrix"]
    assert "matrix" in cm
    assert len(cm["matrix"]) == 2  # 2x2 confusion matrix
    assert cm["accuracy"] > 50.0
    assert "f1_score" in cm

def test_attack_simulation_and_containment():
    login_res = client.post("/api/auth/login", json={
        "email": "admin@lab.edu",
        "password": "Admin@123456"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Run scenario
    sim_res = client.post("/api/attack-simulation/run", json={"scenario_id": "comp_pc"}, headers=headers)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["compromised_node"] == "Lab PC-03"
    assert len(sim_data["steps"]) >= 3

    # Execute containment
    contain_res = client.post("/api/attack-simulation/contain/Lab PC-03", headers=headers)
    assert contain_res.status_code == 200
    contain_data = contain_res.json()
    assert contain_data["success"] is True
    assert contain_data["is_isolated"] is True

def test_csv_exports():
    # Privacy CSV
    res_csv = client.get("/api/privacy-simulation/export-csv?epsilon=1.0")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "CyberShield Privacy-Preserving Simulation Report" in res_csv.text

    # Audit Logs CSV
    login_res = client.post("/api/auth/login", json={
        "email": "admin@lab.edu",
        "password": "Admin@123456"
    })
    token = login_res.json()["access_token"]
    res_logs = client.get("/api/logs/export-csv", headers={"Authorization": f"Bearer {token}"})
    assert res_logs.status_code == 200
    assert "text/csv" in res_logs.headers["content-type"]
    assert "User Pseudonym" in res_logs.text
