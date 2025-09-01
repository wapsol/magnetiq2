from fastapi import APIRouter

from .consultants import router as consultants_router
from .kyc import router as kyc_router
from .analytics import router as analytics_router
from .enrichment import router as enrichment_router

# Create the main consultants router
consultants_main_router = APIRouter(prefix="/consultants", tags=["consultants"])

# Include all consultant-related sub-routers
consultants_main_router.include_router(consultants_router)
consultants_main_router.include_router(kyc_router, prefix="/kyc")
consultants_main_router.include_router(analytics_router, prefix="/analytics")
consultants_main_router.include_router(enrichment_router, prefix="/enrichment")