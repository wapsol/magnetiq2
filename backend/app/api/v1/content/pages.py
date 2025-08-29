from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List
from app.database import get_db
from app.models.content import Page
from app.models.user import AdminUser
from app.schemas.content import PageCreate, PageUpdate, PageResponse, PageListResponse
from app.services.content_renderer import ContentRendererService
from app.dependencies import (
    get_current_user, require_editor, require_viewer, 
    CommonQueryParams
)

router = APIRouter()


@router.get("/", response_model=List[PageListResponse])
async def list_pages(
    db: AsyncSession = Depends(get_db),
    params: CommonQueryParams = Depends(),
    current_user: AdminUser = Depends(require_viewer)
):
    """List pages with pagination and search"""
    query = select(Page).where(Page.deleted_at.is_(None))
    
    # Add search functionality
    if params.search:
        search_term = f"%{params.search}%"
        # Search in English content (could be extended for other languages)
        query = query.where(
            or_(
                func.json_extract(Page.title, '$.en').like(search_term),
                func.json_extract(Page.content, '$.en').like(search_term),
                Page.slug.like(search_term)
            )
        )
    
    # Add sorting
    if params.sort_by == "title":
        order_col = func.json_extract(Page.title, '$.en')
    elif params.sort_by == "published_at":
        order_col = Page.published_at
    elif params.sort_by == "created_at":
        order_col = Page.created_at
    else:
        order_col = Page.created_at
    
    if params.order == "asc":
        query = query.order_by(order_col.asc())
    else:
        query = query.order_by(order_col.desc())
    
    # Add pagination
    query = query.offset(params.offset).limit(params.per_page)
    
    result = await db.execute(query)
    pages = result.scalars().all()
    
    return [PageListResponse.from_orm(page) for page in pages]


@router.post("/", response_model=PageResponse)
async def create_page(
    page_data: PageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_editor)
):
    """Create new page"""
    # Check if slug already exists
    result = await db.execute(
        select(Page).where(
            Page.slug == page_data.slug,
            Page.deleted_at.is_(None)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page with this slug already exists"
        )
    
    # Initialize content renderer service
    content_renderer = ContentRendererService()
    
    # Validate content structure
    validation_result = content_renderer.validate_content_structure(page_data.dict())
    if not validation_result['is_valid']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Content validation failed: {'; '.join(validation_result['errors'])}"
        )
    
    # Create page
    page = Page(
        slug=page_data.slug,
        title=page_data.title,
        content=page_data.content,
        content_blocks=page_data.content_blocks,
        content_format=page_data.content_format,
        layout_config=page_data.layout_config,
        excerpt=page_data.excerpt,
        meta_description=page_data.meta_description,
        template=page_data.template,
        status=page_data.status,
        is_featured=page_data.is_featured,
        seo_title=page_data.seo_title,
        seo_keywords=page_data.seo_keywords,
        canonical_url=page_data.canonical_url,
        author_id=current_user.id
    )
    
    # Set published_at if status is published
    if page_data.status == "published":
        page.published_at = func.now()
    
    db.add(page)
    await db.commit()
    await db.refresh(page)
    
    return PageResponse.from_orm(page)


@router.get("/{page_id}", response_model=PageResponse)
async def get_page(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_viewer)
):
    """Get page by ID"""
    result = await db.execute(
        select(Page).where(
            Page.id == page_id,
            Page.deleted_at.is_(None)
        )
    )
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    
    return PageResponse.from_orm(page)


@router.put("/{page_id}", response_model=PageResponse)
async def update_page(
    page_id: int,
    page_data: PageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_editor)
):
    """Update page"""
    result = await db.execute(
        select(Page).where(
            Page.id == page_id,
            Page.deleted_at.is_(None)
        )
    )
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    
    # Check slug uniqueness if being updated
    if page_data.slug and page_data.slug != page.slug:
        slug_check = await db.execute(
            select(Page).where(
                Page.slug == page_data.slug,
                Page.id != page_id,
                Page.deleted_at.is_(None)
            )
        )
        if slug_check.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Page with this slug already exists"
            )
    
    # Validate content structure if content is being updated
    content_renderer = ContentRendererService()
    if page_data.content_blocks or page_data.content_format:
        # Build validation data from current page + updates
        validation_data = {
            'content_format': page_data.content_format or page.content_format,
            'content_blocks': page_data.content_blocks or page.content_blocks,
            'content': page_data.content or page.content
        }
        
        validation_result = content_renderer.validate_content_structure(validation_data)
        if not validation_result['is_valid']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Content validation failed: {'; '.join(validation_result['errors'])}"
            )
    
    # Update fields
    update_data = page_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(page, field, value)
    
    # Handle publication
    if page_data.status == "published" and page.status != "published":
        page.published_at = func.now()
    elif page_data.status == "draft" and page.status == "published":
        page.published_at = None
    
    await db.commit()
    await db.refresh(page)
    
    return PageResponse.from_orm(page)


@router.delete("/{page_id}")
async def delete_page(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_editor)
):
    """Soft delete page"""
    result = await db.execute(
        select(Page).where(
            Page.id == page_id,
            Page.deleted_at.is_(None)
        )
    )
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    
    # Soft delete
    page.deleted_at = func.now()
    await db.commit()
    
    return {"message": "Page deleted successfully"}


@router.get("/slug/{slug}", response_model=PageResponse)
async def get_page_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get published page by slug (public endpoint)"""
    result = await db.execute(
        select(Page).where(
            Page.slug == slug,
            Page.status == "published",
            Page.deleted_at.is_(None)
        )
    )
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    
    return PageResponse.from_orm(page)