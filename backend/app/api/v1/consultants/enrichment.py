from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pydantic import BaseModel
import logging

from ....database import get_db
from ....services.scoopp_integration_service import ScooppIntegrationService

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models
class EnrichmentRequest(BaseModel):
    consultant_id: str


class BatchEnrichmentRequest(BaseModel):
    consultant_ids: List[str]


class LinkedInScrapeRequest(BaseModel):
    linkedin_url: str


# Profile enrichment endpoints
@router.post("/consultant/{consultant_id}/enrich")
async def enrich_consultant_profile(
    consultant_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Enrich consultant profile with LinkedIn data via Scoopp"""
    
    try:
        service = ScooppIntegrationService(db)
        
        # Run enrichment in background for better UX
        background_tasks.add_task(
            enrich_profile_background,
            consultant_id,
            db
        )
        
        return {
            'success': True,
            'message': 'Profile enrichment started - check back in a few minutes',
            'consultant_id': consultant_id
        }
        
    except Exception as e:
        logger.error(f"Enrichment initiation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to start enrichment")


@router.post("/consultant/{consultant_id}/enrich-sync")
async def enrich_consultant_profile_sync(
    consultant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Enrich consultant profile synchronously (for admin use)"""
    
    try:
        service = ScooppIntegrationService(db)
        
        result = await service.enrich_consultant_profile(consultant_id)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Sync enrichment error: {e}")
        raise HTTPException(status_code=500, detail="Profile enrichment failed")


@router.post("/batch-enrich")
async def batch_enrich_consultants(
    request: BatchEnrichmentRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Batch enrich multiple consultant profiles"""
    
    try:
        if len(request.consultant_ids) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 consultants per batch")
        
        # Run batch enrichment in background
        background_tasks.add_task(
            batch_enrich_background,
            request.consultant_ids,
            db
        )
        
        return {
            'success': True,
            'message': f'Batch enrichment started for {len(request.consultant_ids)} consultants',
            'consultant_count': len(request.consultant_ids)
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Batch enrichment error: {e}")
        raise HTTPException(status_code=500, detail="Batch enrichment failed")


@router.post("/linkedin/scrape")
async def scrape_linkedin_profile(
    request: LinkedInScrapeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Scrape LinkedIn profile data (for testing/preview)"""
    
    try:
        service = ScooppIntegrationService(db)
        
        result = await service.scrape_linkedin_profile(request.linkedin_url)
        
        # Don't expose raw API responses in production
        if not result['success']:
            return {
                'success': False,
                'error': result['error'],
                'has_fallback': 'fallback_data' in result
            }
        
        # Return processed data without sensitive info
        return {
            'success': True,
            'data': {
                'source': result['source'],
                'profile_summary': {
                    'full_name': result['profile_data'].get('full_name'),
                    'headline': result['profile_data'].get('headline'),
                    'location': result['profile_data'].get('location'),
                    'experience_count': len(result['profile_data'].get('experience', [])),
                    'skills_count': len(result['profile_data'].get('skills', [])),
                    'connections_count': result['profile_data'].get('connections_count', 0)
                },
                'metrics': result.get('derived_metrics', {}),
                'scraped_at': result.get('scraped_at')
            }
        }
        
    except Exception as e:
        logger.error(f"LinkedIn scraping error: {e}")
        raise HTTPException(status_code=500, detail="LinkedIn scraping failed")


@router.get("/statistics")
async def get_enrichment_statistics(
    db: AsyncSession = Depends(get_db)
):
    """Get profile enrichment statistics"""
    
    try:
        service = ScooppIntegrationService(db)
        
        stats = await service.get_enrichment_statistics()
        
        if 'error' in stats:
            raise HTTPException(status_code=500, detail=stats['error'])
        
        return {
            'success': True,
            'data': stats
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Enrichment statistics error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get statistics")


@router.get("/consultant/{consultant_id}/enrichment-status")
async def get_consultant_enrichment_status(
    consultant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get enrichment status for specific consultant"""
    
    try:
        from ....models.consultant import Consultant
        from sqlalchemy import select
        
        result = await db.execute(
            select(Consultant).where(Consultant.id == consultant_id)
        )
        consultant = result.scalar_one_or_none()
        
        if not consultant:
            raise HTTPException(status_code=404, detail="Consultant not found")
        
        linkedin_data = consultant.linkedin_data or {}
        
        status = {
            'consultant_id': consultant_id,
            'has_linkedin_url': bool(consultant.linkedin_url),
            'is_enriched': bool(linkedin_data),
            'enrichment_source': linkedin_data.get('source'),
            'last_enriched': linkedin_data.get('scraped_at'),
            'profile_completeness': linkedin_data.get('derived_metrics', {}).get('profile_completeness', 0),
            'ai_skill_count': linkedin_data.get('derived_metrics', {}).get('ai_skill_count', 0),
            'fields_available': list(linkedin_data.get('profile_data', {}).keys()) if linkedin_data else []
        }
        
        return {
            'success': True,
            'data': status
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Enrichment status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get enrichment status")


# Background task functions
async def enrich_profile_background(consultant_id: str, db: AsyncSession):
    """Background task for profile enrichment"""
    try:
        service = ScooppIntegrationService(db)
        result = await service.enrich_consultant_profile(consultant_id)
        
        if result['success']:
            logger.info(f"Profile enrichment completed for consultant {consultant_id}")
        else:
            logger.warning(f"Profile enrichment failed for consultant {consultant_id}: {result['error']}")
            
    except Exception as e:
        logger.error(f"Background enrichment error for {consultant_id}: {e}")


async def batch_enrich_background(consultant_ids: List[str], db: AsyncSession):
    """Background task for batch profile enrichment"""
    try:
        service = ScooppIntegrationService(db)
        result = await service.batch_enrich_consultants(consultant_ids)
        
        logger.info(f"Batch enrichment completed: {len(result['enriched'])} successful, {len(result['failed'])} failed")
        
        if result['failed']:
            failed_ids = [item['consultant_id'] for item in result['failed']]
            logger.warning(f"Failed enrichments: {failed_ids}")
            
    except Exception as e:
        logger.error(f"Background batch enrichment error: {e}")


# Admin utilities
@router.post("/admin/enrich-all-pending")
async def enrich_all_pending_consultants(
    background_tasks: BackgroundTasks,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Enrich all consultants without LinkedIn data (admin only)"""
    
    try:
        from ....models.consultant import Consultant
        from sqlalchemy import select
        
        # Get consultants without enrichment data
        result = await db.execute(
            select(Consultant).where(
                Consultant.linkedin_url.isnot(None),
                Consultant.linkedin_data.is_(None)
            ).limit(limit)
        )
        consultants_to_enrich = result.scalars().all()
        
        consultant_ids = [c.id for c in consultants_to_enrich]
        
        if not consultant_ids:
            return {
                'success': True,
                'message': 'No consultants pending enrichment',
                'count': 0
            }
        
        # Start batch enrichment
        background_tasks.add_task(
            batch_enrich_background,
            consultant_ids,
            db
        )
        
        return {
            'success': True,
            'message': f'Started enrichment for {len(consultant_ids)} consultants',
            'count': len(consultant_ids)
        }
        
    except Exception as e:
        logger.error(f"Enrich all pending error: {e}")
        raise HTTPException(status_code=500, detail="Failed to start bulk enrichment")