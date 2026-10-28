import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load local environment variables if .env file exists
load_dotenv()

raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./cyber_shield.db")
# Normalize postgres:// to postgresql:// for SQLAlchemy 2.0+ compatibility
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

class Settings(BaseModel):
    PROJECT_NAME: str = "CyberShield"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("CYBERSHIELD_SECRET_KEY", "super-secret-cybershield-security-token-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = raw_db_url
    
    # Lab Defaults
    LAB_NAME: str = "AI Research Laboratory"
    TIMEZONE: str = "(UTC+0) London"
    SESSION_TIMEOUT_MINUTES: int = 30
    MFA_ENABLED: bool = True
    
    # Risk Thresholds
    RISK_LOW_THRESHOLD: int = 29
    RISK_HIGH_THRESHOLD: int = 70
    
    # Pseudonymization secret key
    PSEUDONYM_SALT: str = os.getenv("PSEUDONYM_SALT", "cybershield-hmac-salt-key-v1")

settings = Settings()
