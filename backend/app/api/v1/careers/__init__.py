from fastapi import APIRouter
from .job_applications import router as job_applications_router

careers_router = APIRouter()
careers_router.include_router(job_applications_router)