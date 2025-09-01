from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import logging

from ....database import get_db
from ....services.analytics_service import AnalyticsService

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models
class AnalyticsRequest(BaseModel):
    consultant_id: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


class DateRange(BaseModel):
    date_from: datetime
    date_to: datetime


# Platform Analytics Endpoints
@router.get("/platform/overview")
async def get_platform_overview(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get platform-wide overview analytics"""
    
    try:
        service = AnalyticsService(db)
        
        date_to = datetime.utcnow()
        date_from = date_to - timedelta(days=days)
        
        result = await service.get_consultant_analytics(
            consultant_id=None,
            date_from=date_from,
            date_to=date_to
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return {
            'success': True,
            'data': result['data'],
            'period': result['period']
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Platform overview error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get platform overview")


@router.get("/platform/performance")
async def get_platform_performance(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get platform performance metrics"""
    
    try:
        service = AnalyticsService(db)
        
        date_to = datetime.utcnow()
        date_from = date_to - timedelta(days=days)
        
        result = await service.get_consultant_analytics(
            date_from=date_from,
            date_to=date_to
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        # Extract performance-specific data
        performance_data = {
            'overview': result['data']['overview'],
            'performance': result['data']['performance'],
            'trends': result['data']['trends'],
            'industry_breakdown': result['data'].get('industry_breakdown', [])
        }
        
        return {
            'success': True,
            'data': performance_data,
            'period': result['period']
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Platform performance error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get platform performance")


@router.get("/platform/revenue")
async def get_platform_revenue(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get platform revenue analytics"""
    
    try:
        service = AnalyticsService(db)
        
        date_to = datetime.utcnow()
        date_from = date_to - timedelta(days=days)
        
        result = await service.get_consultant_analytics(
            date_from=date_from,
            date_to=date_to
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        # Extract revenue-specific data
        revenue_data = {
            'revenue': result['data']['revenue'],
            'trends': result['data']['trends'],
            'industry_breakdown': result['data'].get('industry_breakdown', [])
        }
        
        return {
            'success': True,
            'data': revenue_data,
            'period': result['period']
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Platform revenue error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get platform revenue")


@router.get("/platform/top-performers")
async def get_top_performers(
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db)
):
    """Get top performing consultants"""
    
    try:
        service = AnalyticsService(db)
        
        # Get analytics with top performers
        result = await service.get_consultant_analytics()
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        top_performers = result['data'].get('top_performers', [])[:limit]
        
        return {
            'success': True,
            'data': {
                'top_performers': top_performers,
                'total_found': len(top_performers)
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Top performers error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get top performers")


# Consultant-Specific Analytics
@router.get("/consultant/{consultant_id}/overview")
async def get_consultant_overview(
    consultant_id: str,
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get consultant-specific overview analytics"""
    
    try:
        service = AnalyticsService(db)
        
        date_to = datetime.utcnow()
        date_from = date_to - timedelta(days=days)
        
        result = await service.get_consultant_analytics(
            consultant_id=consultant_id,
            date_from=date_from,
            date_to=date_to
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return {
            'success': True,
            'data': result['data'],
            'period': result['period']
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Consultant overview error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get consultant overview")


@router.get("/consultant/{consultant_id}/performance-report")
async def get_consultant_performance_report(
    consultant_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed performance report for a consultant"""
    
    try:
        service = AnalyticsService(db)
        
        result = await service.get_consultant_performance_report(consultant_id)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Performance report error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate performance report")


# Custom Analytics Queries
@router.post("/custom-query")
async def custom_analytics_query(
    request: AnalyticsRequest,
    db: Session = Depends(get_db)
):
    """Run custom analytics query with flexible parameters"""
    
    try:
        service = AnalyticsService(db)
        
        # Set default date range if not provided
        date_to = request.date_to or datetime.utcnow()
        date_from = request.date_from or (date_to - timedelta(days=30))
        
        result = await service.get_consultant_analytics(
            consultant_id=request.consultant_id,
            date_from=date_from,
            date_to=date_to
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Custom query error: {e}")
        raise HTTPException(status_code=500, detail="Failed to execute custom query")


# Real-time Statistics
@router.get("/real-time/stats")
async def get_realtime_stats(
    db: Session = Depends(get_db)
):
    """Get real-time platform statistics"""
    
    try:
        service = AnalyticsService(db)
        
        # Get today's statistics
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        
        result = await service.get_consultant_analytics(
            date_from=today,
            date_to=tomorrow
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        # Extract real-time relevant data
        real_time_data = {
            'today': {
                'new_consultants': result['data']['overview']['new_consultants'],
                'active_projects': result['data']['overview']['active_projects'],
                'completed_projects': result['data']['overview']['completed_projects']
            },
            'current_active_consultants': result['data']['overview']['total_consultants'],
            'last_updated': datetime.utcnow().isoformat()
        }
        
        return {
            'success': True,
            'data': real_time_data
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Real-time stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get real-time stats")


# Export Analytics
@router.get("/export/platform-report")
async def export_platform_report(
    format: str = Query("json", pattern="^(json|csv)$"),
    days: int = Query(30, le=365),
    db: Session = Depends(get_db)
):
    """Export platform analytics report"""
    
    try:
        service = AnalyticsService(db)
        
        date_to = datetime.utcnow()
        date_from = date_to - timedelta(days=days)
        
        result = await service.get_consultant_analytics(
            date_from=date_from,
            date_to=date_to
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        if format == 'json':
            return {
                'success': True,
                'data': result['data'],
                'exported_at': datetime.utcnow().isoformat(),
                'period': result['period']
            }
        elif format == 'csv':
            # TODO: Implement CSV export
            raise HTTPException(status_code=501, detail="CSV export not yet implemented")
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail="Failed to export report")