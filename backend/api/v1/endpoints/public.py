from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from api.deps import get_db
from models.table_group import TableGroup
from models.yarn_item import YarnItem
from schemas.yarn_item import YarnItemPublic

router = APIRouter()

@router.get("/homepage/tables")
def get_homepage_tables(db: Session = Depends(get_db)):
    """
    Public endpoint: Get all visible table groups with items for homepage.
    """
    # Query with proper relationship loading
    table_groups = db.query(TableGroup).filter(
        TableGroup.show_on_homepage == True
    ).order_by(TableGroup.display_order).all()
    
    result = []
    for tg in table_groups:
        items = db.query(YarnItem).filter(
            YarnItem.table_group_id == tg.id,
            YarnItem.show_on_homepage == True
        ).order_by(YarnItem.display_order).all()
        
        items_data = [
            {
                "id": item.id,
                "serial_number": idx + 1,
                "count": item.count,
                "quality": item.quality,
                "rate": float(item.rate)
            }
            for idx, item in enumerate(items)
        ]
        
        result.append({
            "id": tg.id,
            "table_name": tg.table_name,
            "display_order": tg.display_order,
            "items": items_data
        })
    
    return {
        "tables": result,
        "last_updated": max([tg.updated_at or tg.created_at for tg in table_groups], default=None)
    }
