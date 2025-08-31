from fastapi import APIRouter
from . import email

communication_router = APIRouter()
communication_router.include_router(email.router)