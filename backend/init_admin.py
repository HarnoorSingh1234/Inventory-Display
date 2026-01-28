from sqlalchemy.orm import Session
from core.database import SessionLocal, engine, Base
from models.admin_user import AdminUser
from core.security import get_password_hash
from core.config import settings

def init_db():
    """Initialize database with admin user."""
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        existing_admin = db.query(AdminUser).filter(AdminUser.email == settings.ADMIN_EMAIL).first()
        
        if not existing_admin:
            admin = AdminUser(
                email=settings.ADMIN_EMAIL,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD)
            )
            db.add(admin)
            db.commit()
            print(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
        else:
            print(f"ℹ️  Admin user already exists: {settings.ADMIN_EMAIL}")
    
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
