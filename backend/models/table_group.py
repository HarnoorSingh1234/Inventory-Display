from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class TableGroup(Base):
    __tablename__ = "table_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(100), unique=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    show_on_homepage = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    items = relationship("YarnItem", back_populates="table_group", cascade="all, delete-orphan")
