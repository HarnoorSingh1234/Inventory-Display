from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from api.deps import get_db, get_current_admin
from models.table_group import TableGroup
from models.yarn_item import YarnItem
from models.admin_user import AdminUser
from schemas.table_group import TableGroupCreate, TableGroupUpdate, TableGroupResponse

router = APIRouter()

@router.get("/", response_model=List[TableGroupResponse])
def get_table_groups(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get all table groups with item counts.
    """
    table_groups = db.query(
        TableGroup,
        func.count(YarnItem.id).label("item_count")
    ).outerjoin(YarnItem).group_by(TableGroup.id).order_by(TableGroup.display_order).all()
    
    return [
        {
            **tg.__dict__,
            "item_count": count
        }
        for tg, count in table_groups
    ]

@router.post("/", response_model=TableGroupResponse, status_code=status.HTTP_201_CREATED)
def create_table_group(
    table_group: TableGroupCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Create new table group.
    """
    # Check duplicate
    existing = db.query(TableGroup).filter(TableGroup.table_name == table_group.table_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Table group with this name already exists"
        )
    
    new_table_group = TableGroup(**table_group.dict())
    db.add(new_table_group)
    db.commit()
    db.refresh(new_table_group)
    
    return {**new_table_group.__dict__, "item_count": 0}

@router.put("/{table_group_id}", response_model=TableGroupResponse)
def update_table_group(
    table_group_id: int,
    table_group_update: TableGroupUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Update table group.
    """
    tg = db.query(TableGroup).filter(TableGroup.id == table_group_id).first()
    if not tg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table group not found")
    
    update_data = table_group_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tg, field, value)
    
    db.commit()
    db.refresh(tg)
    
    item_count = db.query(func.count(YarnItem.id)).filter(YarnItem.table_group_id == tg.id).scalar()
    
    return {**tg.__dict__, "item_count": item_count}

@router.delete("/{table_group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_table_group(
    table_group_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Delete table group (cascades to items).
    """
    tg = db.query(TableGroup).filter(TableGroup.id == table_group_id).first()
    if not tg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table group not found")
    
    db.delete(tg)
    db.commit()
    
    return None

@router.put("/reorder")
def reorder_table_groups(
    data: dict,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Reorder table groups.
    """
    tables_order = data.get("tables", [])
    updated_count = 0
    
    for table_order in tables_order:
        tg = db.query(TableGroup).filter(TableGroup.id == table_order["id"]).first()
        if tg:
            tg.display_order = table_order["display_order"]
            updated_count += 1
    
    db.commit()
    
    return {"updated_count": updated_count}
