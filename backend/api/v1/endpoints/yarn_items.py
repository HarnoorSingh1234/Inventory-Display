from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from api.deps import get_db, get_current_admin
from models.yarn_item import YarnItem
from models.table_group import TableGroup
from models.admin_user import AdminUser
from schemas.yarn_item import YarnItemCreate, YarnItemUpdate, YarnItemResponse

router = APIRouter()

@router.get("/table-groups/{table_group_id}/items")
def get_yarn_items(
    table_group_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get all items for a table group.
    """
    tg = db.query(TableGroup).filter(TableGroup.id == table_group_id).first()
    if not tg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table group not found")
    
    items = db.query(YarnItem).filter(YarnItem.table_group_id == table_group_id).order_by(YarnItem.display_order).all()
    
    return {
        "table_group_id": table_group_id,
        "table_name": tg.table_name,
        "items": items
    }

@router.post("/table-groups/{table_group_id}/items", response_model=YarnItemResponse, status_code=status.HTTP_201_CREATED)
def create_yarn_item(
    table_group_id: int,
    item: YarnItemCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Create new yarn item in table group.
    """
    tg = db.query(TableGroup).filter(TableGroup.id == table_group_id).first()
    if not tg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table group not found")
    
    new_item = YarnItem(**item.dict(), table_group_id=table_group_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item

@router.post("/table-groups/{table_group_id}/items/batch", response_model=List[YarnItemResponse], status_code=status.HTTP_201_CREATED)
def batch_create_yarn_items(
    table_group_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Batch create multiple yarn items in table group.
    """
    tg = db.query(TableGroup).filter(TableGroup.id == table_group_id).first()
    if not tg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table group not found")
    
    items_data = data.get("items", [])
    created_items = []
    
    for item_data in items_data:
        new_item = YarnItem(
            count=item_data.get("count", ""),
            quality=item_data.get("quality", ""),
            rate=item_data.get("rate", 0),
            display_order=item_data.get("display_order", 0),
            show_on_homepage=item_data.get("show_on_homepage", True),
            table_group_id=table_group_id
        )
        db.add(new_item)
        created_items.append(new_item)
    
    db.commit()
    
    for item in created_items:
        db.refresh(item)
    
    return created_items

@router.put("/table-groups/{table_group_id}/items/reorder")
def reorder_yarn_items(
    table_group_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Reorder yarn items within a table group.
    """
    tg = db.query(TableGroup).filter(TableGroup.id == table_group_id).first()
    if not tg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table group not found")
    
    items_order = data.get("items", [])
    updated_count = 0
    
    for item_order in items_order:
        item = db.query(YarnItem).filter(
            YarnItem.id == item_order["id"],
            YarnItem.table_group_id == table_group_id
        ).first()
        if item:
            item.display_order = item_order["display_order"]
            updated_count += 1
    
    db.commit()
    
    return {"updated_count": updated_count}

@router.put("/yarn-items/{item_id}", response_model=YarnItemResponse)
def update_yarn_item(
    item_id: int,
    item_update: YarnItemUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Update yarn item.
    """
    item = db.query(YarnItem).filter(YarnItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Yarn item not found")
    
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    
    return item

@router.delete("/yarn-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_yarn_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Delete yarn item.
    """
    item = db.query(YarnItem).filter(YarnItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Yarn item not found")
    
    db.delete(item)
    db.commit()
    
    return None

@router.post("/yarn-items/bulk-update")
def bulk_update_yarn_items(
    updates: dict,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Bulk update yarn items (for reordering).
    """
    update_list = updates.get("updates", [])
    updated_count = 0
    
    for update in update_list:
        item = db.query(YarnItem).filter(YarnItem.id == update["id"]).first()
        if item:
            item.display_order = update.get("display_order", item.display_order)
            updated_count += 1
    
    db.commit()
    
    return {"updated_count": updated_count}
