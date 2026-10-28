from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, generate_pseudonym
from app.core.deps import get_current_user
from app.models.models import User, AuditLog
from app.schemas.schemas import UserLogin, UserRegister, TokenResponse, UserResponse, PasswordChange

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact an administrator."
        )

    # Log successful login
    audit = AuditLog(
        log_type="Access",
        event_type="User Authentication",
        user_pseudonym=user.pseudonym,
        device_name="Web Dashboard",
        risk_score=10,
        outcome="Allowed",
        details=f"User {user.pseudonym} ({user.role}) successfully authenticated."
    )
    db.add(audit)
    db.commit()

    token = create_access_token(data={"sub": user.email, "role": user.role, "pseudonym": user.pseudonym})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=UserResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    # Public registration MUST NEVER grant Administrator privileges!
    # Enforce safe default role assignment
    assigned_role = "Student"
    if req.role in ["Researcher", "Technician"]:
        assigned_role = req.role

    pseudonym = generate_pseudonym(req.email, req.email)
    user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=get_password_hash(req.password),
        role=assigned_role,
        department="Computer Science",
        is_active=True,
        pseudonym=pseudonym
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    audit = AuditLog(
        log_type="Security",
        event_type="Account Created",
        user_pseudonym=pseudonym,
        device_name="Web Registration",
        risk_score=5,
        outcome="Success",
        details=f"New safe account registered for {pseudonym} with role {assigned_role}."
    )
    db.add(audit)
    db.commit()

    return user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    full_name: str,
    department: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.full_name = full_name
    current_user.department = department
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    req: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(req.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()

    audit = AuditLog(
        log_type="Security",
        event_type="Password Changed",
        user_pseudonym=current_user.pseudonym,
        device_name="Web Profile",
        risk_score=10,
        outcome="Success",
        details=f"User {current_user.pseudonym} updated password securely."
    )
    db.add(audit)
    db.commit()

    return {"message": "Password changed successfully"}
