from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.content import Page
from app.models.user import AdminUser
from app.schemas.content import PageResponse
from app.services.content_renderer import ContentRendererService
from app.dependencies import require_viewer

router = APIRouter()


@router.get("/{page_id}")
async def render_page_content(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_viewer)
):
    """Get processed page content for rendering (admin endpoint)"""
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
    
    # Process content using renderer service
    content_renderer = ContentRendererService()
    
    try:
        processed_content = content_renderer.process_page_content(
            content_blocks=page.content_blocks,
            content_format=page.content_format,
            legacy_content=page.content
        )
        
        # Generate SEO metadata from blocks if available
        seo_metadata = None
        if page.content_format == 'blocks' and page.content_blocks:
            seo_metadata = content_renderer.generate_seo_metadata(page.content_blocks)
        
        return {
            "page": PageResponse.from_orm(page),
            "processed_content": processed_content,
            "seo_metadata": seo_metadata,
            "layout_config": page.layout_config
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content processing failed: {str(e)}"
        )


@router.get("/slug/{slug}")
async def render_page_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get processed page content by slug (public endpoint)"""
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
    
    # Process content using renderer service
    content_renderer = ContentRendererService()
    
    try:
        processed_content = content_renderer.process_page_content(
            content_blocks=page.content_blocks,
            content_format=page.content_format,
            legacy_content=page.content
        )
        
        # Generate SEO metadata from blocks if available
        seo_metadata = None
        if page.content_format == 'blocks' and page.content_blocks:
            seo_metadata = content_renderer.generate_seo_metadata(page.content_blocks)
        
        return {
            "page": PageResponse.from_orm(page),
            "processed_content": processed_content,
            "seo_metadata": seo_metadata,
            "layout_config": page.layout_config
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content processing failed: {str(e)}"
        )


@router.post("/migrate/{page_id}")
async def migrate_page_to_blocks(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: AdminUser = Depends(require_viewer)
):
    """Migrate a legacy page to block format"""
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
    
    if page.content_format != 'legacy':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page is not in legacy format"
        )
    
    if not page.content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page has no legacy content to migrate"
        )
    
    # Migrate using content renderer service
    content_renderer = ContentRendererService()
    
    try:
        migrated_blocks = content_renderer.migrate_legacy_to_blocks(page.content)
        
        # Update page to use blocks
        page.content_blocks = migrated_blocks
        page.content_format = 'blocks'
        
        await db.commit()
        await db.refresh(page)
        
        return {
            "message": "Page migrated to blocks successfully",
            "page": PageResponse.from_orm(page),
            "migrated_blocks": migrated_blocks
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Migration failed: {str(e)}"
        )