from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
import logging

from ....database import get_db
from ....services.consultant_service import ConsultantService
from ....services.linkedin_oauth_service import LinkedInOAuthService
from ....models.consultant import ConsultantStatus, KYCStatus

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models
class LinkedInAuthRequest(BaseModel):
    linkedin_url: str


class LinkedInCallbackRequest(BaseModel):
    code: str
    state: str
    linkedin_url: str


class ConsultantUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    specializations: Optional[List[str]] = None
    years_experience: Optional[int] = None
    hourly_rate: Optional[float] = None
    currency: Optional[str] = None
    availability_status: Optional[str] = None
    languages_spoken: Optional[List[str]] = None


class ConsultantStatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None


# Public endpoints for consultant signup
@router.post("/auth/linkedin/init")
async def init_linkedin_auth(
    request: LinkedInAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """Initialize LinkedIn OAuth flow for consultant signup"""
    
    try:
        oauth_service = LinkedInOAuthService(db)
        auth_data = oauth_service.generate_auth_url()
        
        return {
            'success': True,
            'data': {
                'auth_url': auth_data['auth_url'],
                'state': auth_data['state'],
                'linkedin_url': request.linkedin_url
            }
        }
        
    except Exception as e:
        logger.error(f"LinkedIn auth init error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auth/linkedin/callback")
async def linkedin_auth_callback(
    request: LinkedInCallbackRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Handle LinkedIn OAuth callback and create consultant profile"""
    
    try:
        oauth_service = LinkedInOAuthService(db)
        consultant_service = ConsultantService(db)
        
        # Complete LinkedIn signup process
        signup_result = await oauth_service.complete_linkedin_signup(
            code=request.code,
            state=request.state,
            linkedin_url=request.linkedin_url
        )
        
        if not signup_result['success']:
            raise HTTPException(status_code=400, detail=signup_result['error'])
        
        consultant_id = signup_result['consultant_id']
        
        # Generate AI profile in background
        background_tasks.add_task(
            generate_ai_profile_background,
            consultant_id,
            db
        )
        
        return {
            'success': True,
            'data': {
                'consultant_id': consultant_id,
                'is_new_consultant': signup_result['is_new'],
                'profile_data': signup_result.get('profile_data', {}),
                'message': signup_result['message'],
                'next_steps': {
                    'kyc_required': True,
                    'profile_completion': True
                }
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"LinkedIn callback error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")


# Public consultant discovery endpoints
@router.get("/search")
async def search_consultants(
    q: Optional[str] = Query(None, description="Search query"),
    industry: Optional[str] = Query(None),
    specializations: Optional[str] = Query(None, description="Comma-separated specializations"),
    min_rating: Optional[float] = Query(None, ge=1, le=5),
    max_rate: Optional[float] = Query(None, gt=0),
    availability: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    offset: int = Query(0, ge=0),
    sort_by: str = Query('average_rating', pattern='^(average_rating|hourly_rate|created_at|total_projects)$'),
    sort_order: str = Query('desc', pattern='^(asc|desc)$'),
    db: AsyncSession = Depends(get_db)
):
    """Search and filter consultants (public endpoint)"""
    
    try:
        service = ConsultantService(db)
        
        # Parse specializations
        specializations_list = None
        if specializations:
            specializations_list = [s.strip() for s in specializations.split(',')]
        
        result = await service.search_consultants(
            query=q,
            industry=industry,
            specializations=specializations_list,
            min_rating=min_rating,
            max_rate=max_rate,
            availability=availability,
            status=ConsultantStatus.ACTIVE,  # Only show active consultants publicly
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return {
            'success': True,
            'data': result
        }
        
    except Exception as e:
        logger.error(f"Consultant search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")


@router.get("/{consultant_id}")
async def get_consultant_profile(
    consultant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get public consultant profile"""
    
    try:
        service = ConsultantService(db)
        consultant = await service.get_consultant_by_id(consultant_id)
        
        if not consultant:
            raise HTTPException(status_code=404, detail="Consultant not found")
        
        # Only show active consultants publicly
        if consultant['status'] != ConsultantStatus.ACTIVE:
            raise HTTPException(status_code=404, detail="Consultant not available")
        
        # Filter sensitive information for public view
        public_data = {
            'id': consultant['id'],
            'first_name': consultant['first_name'],
            'last_name': consultant['last_name'],
            'full_name': consultant['full_name'],
            'profile_picture_url': consultant['profile_picture_url'],
            'headline': consultant['headline'],
            'location': consultant['location'],
            'industry': consultant['industry'],
            'specializations': consultant['specializations'],
            'years_experience': consultant['years_experience'],
            'hourly_rate': consultant['hourly_rate'],
            'currency': consultant['currency'],
            'availability_status': consultant['availability_status'],
            'languages_spoken': consultant['languages_spoken'],
            'is_verified': consultant['is_verified'],
            'average_rating': consultant['average_rating'],
            'total_projects': consultant['total_projects'],
            'success_rate': consultant['success_rate'],
            'ai_summary': consultant['ai_summary'],
            'ai_market_positioning': consultant['ai_market_positioning']
        }
        
        return {
            'success': True,
            'data': public_data
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Get consultant error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve consultant")


# Admin endpoints for consultant management
@router.get("/admin/consultants")
async def get_all_consultants_admin(
    q: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    kyc_status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    sort_by: str = Query('created_at'),
    sort_order: str = Query('desc'),
    db: AsyncSession = Depends(get_db)
):
    """Get all consultants for admin (includes all statuses and full data)"""
    
    try:
        service = ConsultantService(db)
        
        result = await service.search_consultants(
            query=q,
            industry=industry,
            status=status,
            limit=limit,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return {
            'success': True,
            'data': result
        }
        
    except Exception as e:
        logger.error(f"Admin consultant list error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve consultants")


@router.get("/admin/consultants/{consultant_id}")
async def get_consultant_admin(
    consultant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get full consultant details for admin"""
    
    try:
        service = ConsultantService(db)
        consultant = await service.get_consultant_by_id(consultant_id)
        
        if not consultant:
            raise HTTPException(status_code=404, detail="Consultant not found")
        
        return {
            'success': True,
            'data': consultant
        }
        
    except Exception as e:
        logger.error(f"Admin get consultant error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve consultant")


@router.put("/admin/consultants/{consultant_id}")
async def update_consultant_admin(
    consultant_id: str,
    request: ConsultantUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update consultant information (admin only)"""
    
    try:
        service = ConsultantService(db)
        
        # Convert request to dict, excluding None values
        updates = request.dict(exclude_unset=True)
        
        result = await service.update_consultant(
            consultant_id=consultant_id,
            updates=updates,
            updated_by=None  # Will add admin user tracking later
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Update consultant error: {e}")
        raise HTTPException(status_code=500, detail="Update failed")


@router.patch("/admin/consultants/{consultant_id}/status")
async def update_consultant_status(
    consultant_id: str,
    request: ConsultantStatusUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update consultant status (admin only)"""
    
    try:
        service = ConsultantService(db)
        
        # Validate status
        try:
            status = ConsultantStatus(request.status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        result = await service.update_consultant_status(
            consultant_id=consultant_id,
            status=status,
            admin_user_id=None,  # Will add admin user tracking later
            notes=request.notes
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Status update error: {e}")
        raise HTTPException(status_code=500, detail="Status update failed")


@router.post("/admin/consultants/{consultant_id}/generate-ai-profile")
async def generate_consultant_ai_profile(
    consultant_id: str,
    force_regenerate: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    """Generate AI profile content for consultant"""
    
    try:
        service = ConsultantService(db)
        
        result = await service.generate_ai_profile(
            consultant_id=consultant_id,
            force_regenerate=force_regenerate
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"AI profile generation error: {e}")
        raise HTTPException(status_code=500, detail="AI profile generation failed")


@router.get("/admin/statistics")
async def get_consultant_statistics(
    db: AsyncSession = Depends(get_db)
):
    """Get consultant platform statistics"""
    
    try:
        service = ConsultantService(db)
        stats = await service.get_consultant_statistics()
        
        return {
            'success': True,
            'data': stats
        }
        
    except Exception as e:
        logger.error(f"Statistics error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get statistics")


# Background task functions
async def generate_ai_profile_background(consultant_id: str, db: AsyncSession):
    """Background task to generate AI profile"""
    try:
        service = ConsultantService(db)
        await service.generate_ai_profile(consultant_id)
        logger.info(f"AI profile generated for consultant {consultant_id}")
    except Exception as e:
        logger.error(f"Background AI profile generation failed: {e}")