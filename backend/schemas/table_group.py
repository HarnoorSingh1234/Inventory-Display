from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TableGroupBase(BaseModel):
    table_name: str
    display_order: int = 0
    show_on_homepage: bool = True

class TableGroupCreate(TableGroupBase):
    pass

class TableGroupUpdate(BaseModel):
    table_name: Optional[str] = None
    display_order: Optional[int] = None
    show_on_homepage: Optional[bool] = None

class TableGroupResponse(TableGroupBase):
    id: int
    item_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
