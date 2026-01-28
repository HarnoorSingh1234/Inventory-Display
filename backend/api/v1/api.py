from fastapi import APIRouter
from api.v1.endpoints import public, auth, table_groups, yarn_items, whatsapp_groups, broadcast

api_router = APIRouter()

# Public routes
api_router.include_router(public.router, tags=["public"])

# Admin routes
api_router.include_router(auth.router, prefix="/admin", tags=["auth"])
api_router.include_router(table_groups.router, prefix="/admin/table-groups", tags=["table-groups"])
api_router.include_router(yarn_items.router, prefix="/admin", tags=["yarn-items"])
api_router.include_router(whatsapp_groups.router, prefix="/admin/whatsapp", tags=["whatsapp"])
api_router.include_router(broadcast.router, prefix="/admin", tags=["broadcast"])
