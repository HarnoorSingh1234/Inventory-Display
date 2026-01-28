from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from api.deps import get_db, get_current_admin
from models.whatsapp_group import WhatsAppGroup
from models.admin_user import AdminUser
from schemas.whatsapp import WhatsAppGroupCreate, WhatsAppGroupUpdate, WhatsAppGroupResponse

router = APIRouter()

@router.get("/groups", response_model=List[WhatsAppGroupResponse])
def get_whatsapp_groups(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get all WhatsApp groups.
    """
    groups = db.query(WhatsAppGroup).order_by(WhatsAppGroup.created_at.desc()).all()
    return groups

@router.post("/groups", response_model=WhatsAppGroupResponse, status_code=status.HTTP_201_CREATED)
def create_whatsapp_group(
    group: WhatsAppGroupCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Create new WhatsApp group.
    """
    # Extract invite ID from link (validator does this)
    group_invite_id = group.group_invite_link
    
    # Check duplicate
    existing = db.query(WhatsAppGroup).filter(WhatsAppGroup.group_invite_id == group_invite_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="WhatsApp group with this invite link already exists"
        )
    
    new_group = WhatsAppGroup(
        group_name=group.group_name,
        group_invite_id=group_invite_id,
        is_active=group.is_active
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    
    return new_group

@router.put("/groups/{group_id}", response_model=WhatsAppGroupResponse)
def update_whatsapp_group(
    group_id: int,
    group_update: WhatsAppGroupUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Update WhatsApp group.
    """
    group = db.query(WhatsAppGroup).filter(WhatsAppGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="WhatsApp group not found")
    
    update_data = group_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(group, field, value)
    
    db.commit()
    db.refresh(group)
    
    return group

@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_whatsapp_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Delete WhatsApp group.
    """
    group = db.query(WhatsAppGroup).filter(WhatsAppGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="WhatsApp group not found")
    
    db.delete(group)
    db.commit()
    
    return None
