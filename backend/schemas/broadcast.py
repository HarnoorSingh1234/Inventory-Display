from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List

class BroadcastRequest(BaseModel):
    group_ids: List[int]
    message_type: str  # 'auto_generate' or 'custom'
    table_group_ids: Optional[List[int]] = None
    custom_message: Optional[str] = None
    send_immediately: bool = True
    scheduled_hour: Optional[int] = None
    scheduled_minute: Optional[int] = None
    
    @validator('message_type')
    def validate_message_type(cls, v):
        if v not in ['auto_generate', 'custom']:
            raise ValueError('message_type must be auto_generate or custom')
        return v
    
    @validator('table_group_ids')
    def validate_auto_generate(cls, v, values):
        if values.get('message_type') == 'auto_generate' and not v:
            raise ValueError('table_group_ids required for auto_generate')
        return v
    
    @validator('custom_message')
    def validate_custom(cls, v, values):
        if values.get('message_type') == 'custom' and not v:
            raise ValueError('custom_message required for custom type')
        return v

class BroadcastResult(BaseModel):
    history_id: Optional[int] = None
    group_id: int
    group_name: str
    status: str
    scheduled_time: Optional[datetime] = None
    error: Optional[str] = None

class BroadcastResponse(BaseModel):
    status: str
    message: str
    results: List[BroadcastResult]

class BroadcastHistoryResponse(BaseModel):
    id: int
    group_id: int
    group_name: str
    message_preview: str
    message_type: str
    table_groups: Optional[List[str]] = None
    scheduled_for: datetime
    sent_at: Optional[datetime] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
