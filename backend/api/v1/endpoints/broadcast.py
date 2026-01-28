from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from api.deps import get_db, get_current_admin
from models.whatsapp_group import WhatsAppGroup
from models.broadcast_history import BroadcastHistory
from models.table_group import TableGroup
from models.admin_user import AdminUser
from schemas.broadcast import BroadcastRequest, BroadcastResponse, BroadcastResult, BroadcastHistoryResponse
from services.whatsapp_service import send_to_multiple_groups
from services.message_generator import generate_from_tables

router = APIRouter()

@router.post("/broadcast", response_model=BroadcastResponse)
def send_broadcast(
    request: BroadcastRequest,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Send WhatsApp broadcast to selected groups.
    """
    # Validate groups exist and are active
    groups = db.query(WhatsAppGroup).filter(
        WhatsAppGroup.id.in_(request.group_ids),
        WhatsAppGroup.is_active == True
    ).all()
    
    if len(groups) != len(request.group_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more groups not found or inactive"
        )
    
    # Generate message
    if request.message_type == "auto_generate":
        message = generate_from_tables(db, request.table_group_ids)
    else:
        message = request.custom_message
    
    # Calculate send times
    if request.send_immediately:
        base_time = datetime.now() + timedelta(minutes=2)
    else:
        now = datetime.now()
        base_time = now.replace(hour=request.scheduled_hour, minute=request.scheduled_minute, second=0, microsecond=0)
        if base_time < now:
            base_time += timedelta(days=1)
    
    # Create history entries
    history_entries = []
    for idx, group in enumerate(groups):
        scheduled_time = base_time + timedelta(minutes=idx * 2)
        
        history = BroadcastHistory(
            group_id=group.id,
            message_text=message,
            table_group_ids=request.table_group_ids if request.message_type == "auto_generate" else None,
            message_type=request.message_type,
            scheduled_for=scheduled_time,
            status="pending"
        )
        db.add(history)
        history_entries.append((history, group, scheduled_time))
    
    db.commit()
    
    # Send via pywhatkit
    results = send_to_multiple_groups(
        [{"id": g.id, "group_invite_id": g.group_invite_id, "group_name": g.group_name} for g in groups],
        message,
        base_time
    )
    
    # Update history status
    response_results = []
    for (history, group, scheduled_time), result in zip(history_entries, results):
        if result["status"] == "success":
            history.status = "scheduled"
        else:
            history.status = "failed"
            history.error_message = result.get("error")
        
        db.commit()
        db.refresh(history)
        
        response_results.append(BroadcastResult(
            history_id=history.id,
            group_id=group.id,
            group_name=group.group_name,
            status=history.status,
            scheduled_time=scheduled_time,
            error=history.error_message
        ))
    
    return BroadcastResponse(
        status="success",
        message=f"Messages scheduled for {len(groups)} groups",
        results=response_results
    )

@router.get("/broadcast/history", response_model=dict)
def get_broadcast_history(
    limit: int = 20,
    offset: int = 0,
    status: str = None,
    group_id: int = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get broadcast history with filtering and pagination.
    """
    query = db.query(BroadcastHistory).join(WhatsAppGroup)
    
    if status:
        query = query.filter(BroadcastHistory.status == status)
    if group_id:
        query = query.filter(BroadcastHistory.group_id == group_id)
    
    total = query.count()
    
    history = query.order_by(BroadcastHistory.scheduled_for.desc()).offset(offset).limit(limit).all()
    
    # Format response
    history_data = []
    for item in history:
        table_groups = None
        if item.table_group_ids:
            table_groups = [tg.table_name for tg in db.query(TableGroup).filter(TableGroup.id.in_(item.table_group_ids)).all()]
        
        history_data.append({
            "id": item.id,
            "group_id": item.group_id,
            "group_name": item.group.group_name,
            "message_preview": item.message_text[:100] + "..." if len(item.message_text) > 100 else item.message_text,
            "message_type": item.message_type,
            "table_groups": table_groups,
            "scheduled_for": item.scheduled_for,
            "sent_at": item.sent_at,
            "status": item.status,
            "error_message": item.error_message,
            "created_at": item.created_at
        })
    
    return {
        "history": history_data,
        "total": total,
        "limit": limit,
        "offset": offset
    }
