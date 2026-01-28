from datetime import datetime
from sqlalchemy.orm import Session
from models.table_group import TableGroup
from models.yarn_item import YarnItem

def generate_from_tables(db: Session, table_group_ids: list) -> str:
    """
    Generate formatted WhatsApp message from selected table groups.
    """
    message = "🧵 *Stock Update* 🧵\n\n"
    
    for table_group_id in table_group_ids:
        table_group = db.query(TableGroup).filter(TableGroup.id == table_group_id).first()
        if not table_group:
            continue
        
        items = db.query(YarnItem).filter(
            YarnItem.table_group_id == table_group_id,
            YarnItem.show_on_homepage == True
        ).order_by(YarnItem.display_order).all()
        
        if not items:
            continue
        
        message += f"📋 *{table_group.table_name}*\n"
        
        for idx, item in enumerate(items, start=1):
            message += f"{idx}. {item.count} - {item.quality} - ₹{item.rate}/kg\n"
        
        message += "\n"
    
    message += "📞 For orders: Reply or call\n"
    message += f"⏰ Updated: {datetime.now().strftime('%d %b %Y, %I:%M %p')}"
    
    return message
