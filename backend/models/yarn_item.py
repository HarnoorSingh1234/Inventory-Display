from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class YarnItem(Base):
    __tablename__ = "yarn_items"
    
    id = Column(Integer, primary_key=True, index=True)
    table_group_id = Column(Integer, ForeignKey("table_groups.id", ondelete="CASCADE"), nullable=False)
    count = Column(String(50), nullable=False)
    quality = Column(String(100), nullable=False)
    rate = Column(Numeric(10, 2), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    show_on_homepage = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    table_group = relationship("TableGroup", back_populates="items")
