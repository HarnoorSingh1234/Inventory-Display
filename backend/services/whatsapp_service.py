import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


def send_to_group_scheduled(group_invite_id: str, message: str, hour: int, minute: int, wait_time: int = 15):
    """
    Placeholder for WhatsApp message sending.
    TODO: Implement with WhatsApp Business API or other server-compatible solution.
    """
    logger.info(f"[PLACEHOLDER] WhatsApp message scheduled for {hour:02d}:{minute:02d}")
    logger.info(f"[PLACEHOLDER] Group: {group_invite_id}")
    logger.info(f"[PLACEHOLDER] Message: {message[:100]}...")
    return {
        "status": "success",
        "mode": "placeholder",
        "note": "WhatsApp sending not implemented - integrate with WhatsApp Business API"
    }


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
    
    return results
