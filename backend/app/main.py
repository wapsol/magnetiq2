from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
import logging
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db, close_db
from app.api.v1.auth.auth import router as auth_router
from app.api.v1.content.pages import router as pages_router
from app.api.v1.business.webinars import router as webinars_router
from app.api.v1.business.consultation_bookings import router as consultation_bookings_router
from app.api.v1.communication.email import router as email_router
from app.api.v1.translations_simple import router as translations_router
from app.api.v1.consultants.consultants import router as consultants_router
from app.api.v1.consultants.kyc import router as kyc_router
from app.api.v1.consultants.analytics import router as analytics_router
from app.api.v1.consultants.enrichment import router as enrichment_router
from app.api.v1.admin import admin_router
from app.api.v1.careers import careers_router
from app.middleware.language_detection import LanguageDetectionMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Magnetiq v2 backend...")
    await init_db()
    logger.info("Database initialized")
    
    # Validate configuration
    settings.validate_configuration()
    
    yield
    
    # Shutdown
    logger.info("Shutting down Magnetiq v2 backend...")
    await close_db()
    logger.info("Database connection closed")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Magnetiq v2 - Content Management System with Business Automation",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Language detection middleware
app.add_middleware(LanguageDetectionMiddleware, default_language='en', supported_languages=['en', 'de'])

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=settings.allowed_methods,
    allow_headers=settings.allowed_headers,
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": exc.errors()
            }
        }
    )


@app.exception_handler(IntegrityError)
async def database_exception_handler(request: Request, exc: IntegrityError):
    """Handle database integrity errors"""
    logger.error(f"Database integrity error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "success": False,
            "error": {
                "code": "DATABASE_INTEGRITY_ERROR",
                "message": "Database integrity constraint violated"
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal server error occurred"
            }
        }
    )


# Health check endpoints
@app.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "version": settings.version,
        "environment": settings.environment
    }


@app.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with services"""
    from sqlalchemy import text
    from app.database import AsyncSessionLocal
    import os
    
    health_status = {
        "status": "healthy",
        "version": settings.version,
        "environment": settings.environment,
        "services": {}
    }
    
    # Database health check
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            health_status["services"]["database"] = {
                "status": "healthy",
                "type": "SQLite"
            }
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # File system health check
    try:
        db_path = "magnetiq.db"
        if os.path.exists(db_path):
            db_size = os.path.getsize(db_path)
            health_status["services"]["filesystem"] = {
                "status": "healthy",
                "database_size_mb": round(db_size / 1024 / 1024, 2)
            }
        else:
            health_status["services"]["filesystem"] = {
                "status": "warning",
                "message": "Database file not found"
            }
    except Exception as e:
        health_status["services"]["filesystem"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    return health_status


# API Routes
app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

app.include_router(
    pages_router,
    prefix="/api/v1/content/pages",
    tags=["Content - Pages"]
)

app.include_router(
    webinars_router,
    prefix="/api/v1/business/webinars",
    tags=["Business - Webinars"]
)

app.include_router(
    consultation_bookings_router,
    prefix="/api/v1/consultations",
    tags=["Business - Consultation Bookings"]
)

app.include_router(
    email_router,
    prefix="/api/v1/communication/email",
    tags=["Communication - Email"]
)

app.include_router(
    translations_router,
    prefix="/api/v1/translations",
    tags=["Translations"]
)

app.include_router(
    consultants_router,
    prefix="/api/v1/consultants",
    tags=["Consultants"]
)

app.include_router(
    kyc_router,
    prefix="/api/v1/consultants/kyc",
    tags=["Consultants - KYC"]
)

app.include_router(
    analytics_router,
    prefix="/api/v1/consultants/analytics",
    tags=["Consultants - Analytics"]
)

app.include_router(
    enrichment_router,
    prefix="/api/v1/consultants/enrichment",
    tags=["Consultants - Data Enrichment"]
)

app.include_router(
    admin_router,
    tags=["Admin Panel"]
)

app.include_router(
    careers_router,
    prefix="/api/v1/careers",
    tags=["Careers - Job Applications"]
)


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.app_name} v{settings.version}",
        "docs_url": "/docs" if settings.debug else "Documentation disabled in production",
        "health_check": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )