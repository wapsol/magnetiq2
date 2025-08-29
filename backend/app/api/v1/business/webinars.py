from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.business import Webinar, WebinarRegistration
from app.models.user import AdminUser
from app.schemas.business import (
    WebinarCreate, WebinarUpdate, WebinarResponse,
    WebinarRegistrationCreate, WebinarRegistrationResponse
)
from app.dependencies import (
    get_current_user, require_editor, require_viewer,
    CommonQueryParams
)

router = APIRouter()


@router.get("/", response_model=List[WebinarResponse])
async def list_webinars(
    db: AsyncSession = Depends(get_db),
    params: CommonQueryParams = Depends(),
    current_user: AdminUser = Depends(require_viewer)
):
    """List webinars with pagination and search"""
    query = select(Webinar).where(Webinar.deleted_at.is_(None))
    
    # Add search functionality
    if params.search:
        search_term = f"%{params.search}%"
        query = query.where(
            or_(
                func.json_extract(Webinar.title, '$.en').like(search_term),
                func.json_extract(Webinar.description, '$.en').like(search_term),
                Webinar.slug.like(search_term),
                Webinar.presenter_name.like(search_term)
            )
        )
    
    # Add sorting
    if params.sort_by == "title":
        order_col = func.json_extract(Webinar.title, '$.en')
    elif params.sort_by == "scheduled_at":
        order_col = Webinar.scheduled_at
    elif params.sort_by == "status":
        order_col = Webinar.status
    else:
        order_col = Webinar.scheduled_at
    
    if params.order == "asc":
        query = query.order_by(order_col.asc())
    else:
        query = query.order_by(order_col.desc())
    
    # Add pagination
    query = query.offset(params.offset).limit(params.per_page)
    
    result = await db.execute(query)
    webinars = result.scalars().all()
    
    return [WebinarResponse.from_orm(webinar) for webinar in webinars]


@router.post("/", response_model=WebinarResponse)
async def create_webinar(
    webinar_data: WebinarCreate,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_editor)
):
    """Create new webinar"""
    # Check if slug already exists
    result = await db.execute(
        select(Webinar).where(
            Webinar.slug == webinar_data.slug,
            Webinar.deleted_at.is_(None)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webinar with this slug already exists"
        )
    
    # Create webinar
    webinar = Webinar(
        title=webinar_data.title,
        description=webinar_data.description,
        slug=webinar_data.slug,
        scheduled_at=webinar_data.scheduled_at,
        duration_minutes=webinar_data.duration_minutes,
        timezone=webinar_data.timezone,
        max_participants=webinar_data.max_participants,
        meeting_url=webinar_data.meeting_url,
        presenter_name=webinar_data.presenter_name,
        presenter_bio=webinar_data.presenter_bio,
        registration_enabled=webinar_data.registration_enabled,
        registration_deadline=webinar_data.registration_deadline
    )
    
    db.add(webinar)
    await db.commit()
    await db.refresh(webinar)
    
    return WebinarResponse.from_orm(webinar)


@router.get("/{webinar_id}", response_model=WebinarResponse)
async def get_webinar(
    webinar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_viewer)
):
    """Get webinar by ID"""
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


@router.put("/{webinar_id}", response_model=WebinarResponse)
async def update_webinar(
    webinar_id: int,
    webinar_data: WebinarUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_editor)
):
    """Update webinar"""
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
    
    # Check slug uniqueness if being updated
    if webinar_data.slug and webinar_data.slug != webinar.slug:
        slug_check = await db.execute(
            select(Webinar).where(
                Webinar.slug == webinar_data.slug,
                Webinar.id != webinar_id,
                Webinar.deleted_at.is_(None)
            )
        )
        if slug_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Webinar with this slug already exists"
            )
    
    # Update fields
    update_data = webinar_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(webinar, field, value)
    
    await db.commit()
    await db.refresh(webinar)
    
    return WebinarResponse.from_orm(webinar)


@router.delete("/{webinar_id}")
async def delete_webinar(
    webinar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_editor)
):
    """Soft delete webinar"""
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
    
    # Soft delete
    webinar.deleted_at = func.now()
    await db.commit()
    
    return {"message": "Webinar deleted successfully"}


@router.post("/{webinar_id}/register", response_model=WebinarRegistrationResponse)
async def register_for_webinar(
    webinar_id: int,
    registration_data: WebinarRegistrationCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register for webinar (public endpoint)"""
    # Check if webinar exists and registration is enabled
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
    
    if not webinar.registration_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is not enabled for this webinar"
        )
    
    # Check registration deadline
    if webinar.registration_deadline and datetime.utcnow() > webinar.registration_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration deadline has passed"
        )
    
    # Check if already registered
    existing_registration = await db.execute(
        select(WebinarRegistration).where(
            WebinarRegistration.webinar_id == webinar_id,
            WebinarRegistration.email == registration_data.email
        )
    )
    if existing_registration.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this webinar"
        )
    
    # Check max participants
    if webinar.max_participants:
        registration_count = await db.execute(
            select(func.count(WebinarRegistration.id)).where(
                WebinarRegistration.webinar_id == webinar_id
            )
        )
        count = registration_count.scalar()
        if count >= webinar.max_participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Webinar is full"
            )
    
    # Create registration
    registration = WebinarRegistration(
        webinar_id=webinar_id,
        first_name=registration_data.first_name,
        last_name=registration_data.last_name,
        email=registration_data.email,
        company=registration_data.company,
        job_title=registration_data.job_title,
        phone=registration_data.phone,
        utm_source=registration_data.utm_source,
        utm_medium=registration_data.utm_medium,
        utm_campaign=registration_data.utm_campaign,
        registration_source="website"
    )
    
    db.add(registration)
    await db.commit()
    await db.refresh(registration)
    
    return WebinarRegistrationResponse.from_orm(registration)


@router.get("/{webinar_id}/registrations", response_model=List[WebinarRegistrationResponse])
async def list_webinar_registrations(
    webinar_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_viewer)
):
    """List registrations for a webinar"""
    # Check if webinar exists
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
    
    # Get registrations
    registrations = await db.execute(
        select(WebinarRegistration).where(
            WebinarRegistration.webinar_id == webinar_id
        ).order_by(WebinarRegistration.registered_at.desc())
    )
    
    return [WebinarRegistrationResponse.from_orm(reg) for reg in registrations.scalars()]


@router.get("/public/upcoming", response_model=List[WebinarResponse])
async def list_upcoming_webinars(
    db: AsyncSession = Depends(get_db)
):
    """List upcoming public webinars (public endpoint)"""
    result = await db.execute(
        select(Webinar).where(
            Webinar.scheduled_at > func.now(),
            Webinar.registration_enabled == True,
            Webinar.status.in_(["scheduled", "live"]),
            Webinar.deleted_at.is_(None)
        ).order_by(Webinar.scheduled_at.asc())
    )
    webinars = result.scalars().all()
    
    return [WebinarResponse.from_orm(webinar) for webinar in webinars]


@router.get("/slug/{slug}", response_model=WebinarResponse)
async def get_webinar_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get webinar by slug (public endpoint)"""
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