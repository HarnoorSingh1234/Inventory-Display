from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional

class YarnItemBase(BaseModel):
    count: str
    quality: str
    rate: Decimal
    display_order: int = 0
    show_on_homepage: bool = True

class YarnItemCreate(YarnItemBase):
    pass

class YarnItemUpdate(BaseModel):
    count: Optional[str] = None
    quality: Optional[str] = None
    rate: Optional[Decimal] = None
    display_order: Optional[int] = None
    show_on_homepage: Optional[bool] = None

class YarnItemResponse(YarnItemBase):
    id: int
    table_group_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class YarnItemPublic(BaseModel):
    id: int
    serial_number: int
    count: str
    quality: str
    rate: Decimal
