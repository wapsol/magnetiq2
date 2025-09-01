from fastapi import APIRouter
from .users import router as users_router

admin_router = APIRouter(prefix="/admin", tags=["Admin Panel"])

admin_router.include_router(users_router)