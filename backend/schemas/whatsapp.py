from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional
import re

class WhatsAppGroupBase(BaseModel):
    group_name: str
    is_active: bool = True

class WhatsAppGroupCreate(WhatsAppGroupBase):
    group_invite_link: str
    
    @validator('group_invite_link')
    def extract_invite_id(cls, v):
        match = re.search(r'chat\.whatsapp\.com/([A-Za-z0-9]+)', v)
        if not match:
            raise ValueError('Invalid WhatsApp group invite link format')
        return match.group(1)

class WhatsAppGroupUpdate(BaseModel):
    group_name: Optional[str] = None
    is_active: Optional[bool] = None

class WhatsAppGroupResponse(WhatsAppGroupBase):
    id: int
    group_invite_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
