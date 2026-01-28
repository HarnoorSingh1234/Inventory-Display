import pywhatkit as kit
from datetime import datetime, timedelta
import time

def send_to_group_scheduled(group_invite_id: str, message: str, hour: int, minute: int, wait_time: int = 15):
    """
    Send WhatsApp message to group using pywhatkit.
    """
    try:
        kit.sendwhatmsg_to_group(
            group_id=group_invite_id,
            message=message,
            time_hour=hour,
            time_min=minute,
            wait_time=wait_time,
            tab_close=True,
            close_time=5
        )
        return {"status": "success"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def send_to_multiple_groups(groups: list, message: str, base_time: datetime):
    """
    Send to multiple groups with 2-minute stagger.
    """
    results = []
    
    for idx, group in enumerate(groups):
        send_time = base_time + timedelta(minutes=idx * 2)
        
        result = send_to_group_scheduled(
            group['group_invite_id'],
            message,
            send_time.hour,
            send_time.minute
        )
        
        result['group_id'] = group['id']
        result['scheduled_time'] = send_time
        results.append(result)
        
        time.sleep(2)
    
    return results
