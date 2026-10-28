from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.seed import seed_database
from app.routers import (
    auth, dashboard, access_control, digital_twin,
    attack_simulation, threat_detection, privacy_simulation,
    devices, users, logs, settings as settings_router, notifications
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Prime database and seed on startup if empty
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Adaptive Secure Smart Laboratory with Cybersecurity Digital Twin, Risk-Adaptive Access Control, Privacy-Preserving Simulation, and Intelligent Threat Detection.",
    lifespan=lifespan
)

# CORS setup for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)
app.include_router(access_control.router, prefix=settings.API_V1_PREFIX)
app.include_router(digital_twin.router, prefix=settings.API_V1_PREFIX)
app.include_router(attack_simulation.router, prefix=settings.API_V1_PREFIX)
app.include_router(threat_detection.router, prefix=settings.API_V1_PREFIX)
app.include_router(privacy_simulation.router, prefix=settings.API_V1_PREFIX)
app.include_router(devices.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(logs.router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "project": "CyberShield API",
        "status": "Online",
        "documentation": "/docs",
        "endpoints_prefix": settings.API_V1_PREFIX
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "authentication": "online",
        "digital_twin": "online",
        "r_aac_engine": "online",
        "ml_anomaly_detector": "online",
        "privacy_simulation": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
