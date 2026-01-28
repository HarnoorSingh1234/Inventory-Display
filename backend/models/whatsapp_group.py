from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class WhatsAppGroup(Base):
    __tablename__ = "whatsapp_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String(100), nullable=False)
    group_invite_id = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    broadcasts = relationship("BroadcastHistory", back_populates="group", cascade="all, delete-orphan")
