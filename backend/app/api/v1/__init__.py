from fastapi import APIRouter
from .auth import router as auth_router
from .business import router as business_router  
from .content import router as content_router
from .communication import communication_router
from .admin import admin_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(business_router) 
api_router.include_router(content_router)
api_router.include_router(communication_router, prefix="/communication")
api_router.include_router(admin_router)