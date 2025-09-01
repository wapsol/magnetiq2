from fastapi import APIRouter
from .webinars import router as webinars_router
from .consultation_bookings import router as consultation_bookings_router

router = APIRouter()
router.include_router(webinars_router, prefix="/webinars", tags=["webinars"])
router.include_router(consultation_bookings_router, prefix="/consultations", tags=["consultations"])