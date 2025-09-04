from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.business import Webinar, WebinarRegistration
from app.schemas.business import WebinarResponse
from .whitepapers import router as whitepapers_router

router = APIRouter()

# Include whitepaper routes
router.include_router(whitepapers_router, tags=["whitepapers"])


class CalendarIntegrationTrackingRequest(BaseModel):
    webinar_id: str
    calendar_type: str  # 'google' | 'outlook' | 'office365' | 'yahoo' | 'ics'
    registration_id: Optional[str] = None
    timestamp: datetime
    user_agent: str
    timezone: str


class SocialSharingTrackingRequest(BaseModel):
    webinar_id: str
    platform: str  # 'linkedin' | 'twitter' | 'facebook' | 'whatsapp' | 'email' | 'copy_link'
    registration_id: Optional[str] = None
    timestamp: datetime
    user_agent: str
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


@router.get("/webinars", response_model=List[WebinarResponse])
async def list_public_webinars(
    db: AsyncSession = Depends(get_db),
    upcoming_only: bool = True,
    limit: int = 10
):
    """List public webinars (no authentication required)"""
    query = select(Webinar).where(
        Webinar.registration_enabled == True,
        Webinar.status.in_(["scheduled", "live"]),
        Webinar.deleted_at.is_(None)
    )
    
    if upcoming_only:
        query = query.where(Webinar.scheduled_at > func.now())
        
    query = query.order_by(Webinar.scheduled_at.asc()).limit(limit)
    
    result = await db.execute(query)
    webinars = result.scalars().all()
    
    return [WebinarResponse.from_orm(webinar) for webinar in webinars]


@router.get("/webinars/{webinar_id}", response_model=WebinarResponse)
async def get_public_webinar(
    webinar_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get public webinar by ID (no authentication required)"""
    result = await db.execute(
        select(Webinar).where(
            Webinar.id == webinar_id,
            Webinar.deleted_at.is_(None)
        )
    )
    webinar = result.scalar_one_or_none()
    
    if not webinar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webinar not found"
        )
    
    return WebinarResponse.from_orm(webinar)


@router.get("/webinars/slug/{slug}", response_model=WebinarResponse)
async def get_public_webinar_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get public webinar by slug (no authentication required)"""
    result = await db.execute(
        select(Webinar).where(
            Webinar.slug == slug,
            Webinar.deleted_at.is_(None)
        )
    )
    webinar = result.scalar_one_or_none()
    
    if not webinar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webinar not found"
        )
    
    return WebinarResponse.from_orm(webinar)


@router.post("/analytics/calendar-integration")
async def track_calendar_integration(
    tracking_data: CalendarIntegrationTrackingRequest,
    db: AsyncSession = Depends(get_db)
):
    """Track calendar integration usage for analytics"""
    # TODO: Store analytics data in database if needed
    # For now, just return success (analytics could be handled by frontend)
    
    return {
        "status": "success", 
        "message": "Calendar integration tracked",
        "webinar_id": tracking_data.webinar_id,
        "calendar_type": tracking_data.calendar_type
    }


@router.post("/analytics/social-sharing")
async def track_social_sharing(
    tracking_data: SocialSharingTrackingRequest,
    db: AsyncSession = Depends(get_db)
):
    """Track social sharing usage for analytics"""
    # TODO: Store analytics data in database if needed
    # For now, just return success (analytics could be handled by frontend)
    
    return {
        "status": "success",
        "message": "Social sharing tracked", 
        "webinar_id": tracking_data.webinar_id,
        "platform": tracking_data.platform
    }