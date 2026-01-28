from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from api.deps import get_db, get_current_admin
from core.security import verify_password, create_access_token, get_password_hash
from core.config import settings
from models.admin_user import AdminUser
from schemas.admin import AdminLogin, AdminCreate, Token, AdminVerify

security = HTTPBearer(auto_error=False)

router = APIRouter()

@router.post("/login", response_model=Token)
def admin_login(credentials: AdminLogin, db: Session = Depends(get_db)):
    """
    Admin login endpoint - returns JWT token.
    """
    admin = db.query(AdminUser).filter(AdminUser.email == credentials.email).first()
    
    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={"sub": admin.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600
    }

@router.post("/verify", response_model=AdminVerify)
def verify_token(current_admin: AdminUser = Depends(get_current_admin)):
    """
    Verify JWT token validity.
    """
    return {
        "email": current_admin.email,
        "valid": True
    }

@router.post("/create", response_model=AdminVerify, status_code=status.HTTP_201_CREATED)
def create_admin(
    admin_in: AdminCreate,
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Create a new admin user.

    - If no admins exist yet, creation is allowed without authentication (initial setup).
    - If admins exist, a valid admin token is required in Authorization header.
    """
    existing_count = db.query(AdminUser).count()
    if existing_count > 0:
        if credentials is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin creation requires authentication")
        # validate token and admin
        _ = get_current_admin(db=db, credentials=credentials)

    # Prevent duplicate admin emails
    if db.query(AdminUser).filter(AdminUser.email == admin_in.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin with this email already exists")

    password_hash = get_password_hash(admin_in.password)
    new_admin = AdminUser(email=admin_in.email, password_hash=password_hash)
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {"email": new_admin.email, "valid": True}
