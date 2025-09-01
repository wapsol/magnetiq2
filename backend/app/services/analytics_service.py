from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, desc, asc, and_, extract, select
from datetime import datetime, timedelta
import logging

from ..models.consultant import (
    Consultant, ConsultantProject, ConsultantReview, ConsultantEarning,
    ConsultantStatus, KYCStatus, ProjectStatus
)

logger = logging.getLogger(__name__)


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_consultant_analytics(
        self,
        consultant_id: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get comprehensive consultant analytics"""
        
        # Default to last 30 days if no date range specified
        if not date_to:
            date_to = datetime.utcnow()
        if not date_from:
            date_from = date_to - timedelta(days=30)
        
        analytics = {}
        
        try:
            # Build base query
            if consultant_id:
                consultant_filter = Consultant.id == consultant_id
            else:
                consultant_filter = Consultant.status == ConsultantStatus.ACTIVE
            
            # Overview metrics
            analytics['overview'] = await self._get_overview_metrics(
                consultant_filter, date_from, date_to
            )
            
            # Performance metrics
            analytics['performance'] = await self._get_performance_metrics(
                consultant_filter, date_from, date_to
            )
            
            # Revenue analytics
            analytics['revenue'] = await self._get_revenue_analytics(
                consultant_filter, date_from, date_to
            )
            
            # Trend data
            analytics['trends'] = await self._get_trend_data(
                consultant_filter, date_from, date_to
            )
            
            # Industry breakdown
            if not consultant_id:  # Only for platform-wide analytics
                analytics['industry_breakdown'] = await self._get_industry_breakdown(
                    date_from, date_to
                )
            
            # Top performers
            if not consultant_id:  # Only for platform-wide analytics
                analytics['top_performers'] = await self._get_top_performers()
            
            return {
                'success': True,
                'data': analytics,
                'period': {
                    'from': date_from.isoformat(),
                    'to': date_to.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Analytics error: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def _get_overview_metrics(
        self, 
        consultant_filter, 
        date_from: datetime, 
        date_to: datetime
    ) -> Dict[str, Any]:
        """Get basic overview metrics"""
        
        # Total consultants
        result = await self.db.execute(
            select(func.count(Consultant.id)).where(consultant_filter)
        )
        total_consultants = result.scalar()
        
        # New consultants in period
        result = await self.db.execute(
            select(func.count(Consultant.id)).where(
                consultant_filter,
                Consultant.created_at >= date_from,
                Consultant.created_at <= date_to
            )
        )
        new_consultants = result.scalar()
        
        # Active projects in period
        result = await self.db.execute(
            select(func.count(ConsultantProject.id))
            .select_from(ConsultantProject.join(Consultant))
            .where(
                consultant_filter,
                ConsultantProject.status.in_([ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS]),
                ConsultantProject.created_at >= date_from
            )
        )
        active_projects = result.scalar()
        
        # Completed projects in period
        result = await self.db.execute(
            select(func.count(ConsultantProject.id))
            .select_from(ConsultantProject.join(Consultant))
            .where(
                consultant_filter,
                ConsultantProject.status == ProjectStatus.COMPLETED,
                ConsultantProject.completed_at >= date_from,
                ConsultantProject.completed_at <= date_to
            )
        )
        completed_projects = result.scalar()
        
        return {
            'total_consultants': total_consultants or 0,
            'new_consultants': new_consultants or 0,
            'active_projects': active_projects or 0,
            'completed_projects': completed_projects or 0,
            'new_consultants_change': await self._calculate_period_change(
                'consultants', date_from, date_to, consultant_filter
            )
        }

    async def _get_performance_metrics(
        self, 
        consultant_filter, 
        date_from: datetime, 
        date_to: datetime
    ) -> Dict[str, Any]:
        """Get performance-related metrics"""
        
        # Average ratings
        avg_rating = self.db.query(func.avg(ConsultantReview.rating)).join(
            ConsultantProject
        ).join(Consultant).filter(
            consultant_filter,
            ConsultantReview.created_at >= date_from,
            ConsultantReview.created_at <= date_to
        ).scalar()
        
        # Response rates and times
        consultants = self.db.query(Consultant).filter(consultant_filter).all()
        
        if consultants:
            response_rates = [c.response_rate for c in consultants if c.response_rate]
            response_times = [c.response_time_hours for c in consultants if c.response_time_hours]
            
            avg_response_rate = sum(response_rates) / len(response_rates) if response_rates else 0
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        else:
            avg_response_rate = 0
            avg_response_time = 0
        
        # Success rates
        total_projects = self.db.query(ConsultantProject).join(Consultant).filter(
            consultant_filter,
            ConsultantProject.created_at >= date_from
        ).count()
        
        successful_projects = self.db.query(ConsultantProject).join(Consultant).filter(
            consultant_filter,
            ConsultantProject.status == ProjectStatus.COMPLETED,
            ConsultantProject.created_at >= date_from
        ).count()
        
        success_rate = (successful_projects / total_projects * 100) if total_projects > 0 else 0
        
        return {
            'average_rating': float(avg_rating) if avg_rating else 0,
            'average_response_rate': round(avg_response_rate, 1),
            'average_response_time_hours': round(avg_response_time, 1),
            'project_success_rate': round(success_rate, 1),
            'total_reviews': self.db.query(ConsultantReview).join(
                ConsultantProject
            ).join(Consultant).filter(
                consultant_filter,
                ConsultantReview.created_at >= date_from,
                ConsultantReview.created_at <= date_to
            ).count()
        }

    async def _get_revenue_analytics(
        self, 
        consultant_filter, 
        date_from: datetime, 
        date_to: datetime
    ) -> Dict[str, Any]:
        """Get revenue and earnings analytics"""
        
        # Total earnings in period
        earnings_query = self.db.query(
            func.sum(ConsultantEarning.amount),
            func.sum(ConsultantEarning.platform_fee_amount),
            func.sum(ConsultantEarning.net_amount)
        ).join(Consultant).filter(
            consultant_filter,
            ConsultantEarning.created_at >= date_from,
            ConsultantEarning.created_at <= date_to
        ).first()
        
        total_earnings = float(earnings_query[0]) if earnings_query[0] else 0
        platform_fees = float(earnings_query[1]) if earnings_query[1] else 0
        net_earnings = float(earnings_query[2]) if earnings_query[2] else 0
        
        # Average project values
        avg_project_value = self.db.query(func.avg(ConsultantProject.total_amount)).join(
            Consultant
        ).filter(
            consultant_filter,
            ConsultantProject.total_amount.isnot(None),
            ConsultantProject.created_at >= date_from,
            ConsultantProject.created_at <= date_to
        ).scalar()
        
        # Hourly rates analysis
        rate_stats = self.db.query(
            func.min(Consultant.hourly_rate),
            func.max(Consultant.hourly_rate),
            func.avg(Consultant.hourly_rate)
        ).filter(
            consultant_filter,
            Consultant.hourly_rate.isnot(None)
        ).first()
        
        return {
            'total_earnings': total_earnings,
            'platform_revenue': platform_fees,
            'consultant_net_earnings': net_earnings,
            'average_project_value': float(avg_project_value) if avg_project_value else 0,
            'hourly_rates': {
                'min': float(rate_stats[0]) if rate_stats[0] else 0,
                'max': float(rate_stats[1]) if rate_stats[1] else 0,
                'average': float(rate_stats[2]) if rate_stats[2] else 0
            },
            'earnings_change': self._calculate_revenue_change(date_from, date_to, consultant_filter)
        }

    async def _get_trend_data(
        self, 
        consultant_filter, 
        date_from: datetime, 
        date_to: datetime
    ) -> Dict[str, Any]:
        """Get trend data for charts"""
        
        # Daily/weekly trends based on date range
        days_diff = (date_to - date_from).days
        
        if days_diff <= 30:
            # Daily trends for last 30 days
            trends = await self._get_daily_trends(consultant_filter, date_from, date_to)
        else:
            # Weekly trends for longer periods
            trends = await self._get_weekly_trends(consultant_filter, date_from, date_to)
        
        return trends

    async def _get_daily_trends(
        self, 
        consultant_filter, 
        date_from: datetime, 
        date_to: datetime
    ) -> Dict[str, List]:
        """Get daily trend data"""
        
        # New consultants by day
        consultant_trends = self.db.query(
            func.date(Consultant.created_at).label('date'),
            func.count(Consultant.id).label('count')
        ).filter(
            consultant_filter,
            Consultant.created_at >= date_from,
            Consultant.created_at <= date_to
        ).group_by(func.date(Consultant.created_at)).order_by('date').all()
        
        # Project trends by day
        project_trends = self.db.query(
            func.date(ConsultantProject.created_at).label('date'),
            func.count(ConsultantProject.id).label('count')
        ).join(Consultant).filter(
            consultant_filter,
            ConsultantProject.created_at >= date_from,
            ConsultantProject.created_at <= date_to
        ).group_by(func.date(ConsultantProject.created_at)).order_by('date').all()
        
        # Revenue trends by day
        revenue_trends = self.db.query(
            func.date(ConsultantEarning.created_at).label('date'),
            func.sum(ConsultantEarning.amount).label('amount')
        ).join(Consultant).filter(
            consultant_filter,
            ConsultantEarning.created_at >= date_from,
            ConsultantEarning.created_at <= date_to
        ).group_by(func.date(ConsultantEarning.created_at)).order_by('date').all()
        
        return {
            'consultants': [
                {'date': trend.date.isoformat(), 'count': trend.count}
                for trend in consultant_trends
            ],
            'projects': [
                {'date': trend.date.isoformat(), 'count': trend.count}
                for trend in project_trends
            ],
            'revenue': [
                {'date': trend.date.isoformat(), 'amount': float(trend.amount)}
                for trend in revenue_trends
            ]
        }

    async def _get_weekly_trends(
        self, 
        consultant_filter, 
        date_from: datetime, 
        date_to: datetime
    ) -> Dict[str, List]:
        """Get weekly trend data"""
        
        # Similar to daily trends but grouped by week
        # Implementation similar to daily but with week grouping
        return {
            'consultants': [],
            'projects': [],
            'revenue': []
        }

    async def _get_industry_breakdown(
        self, 
        date_from: datetime, 
        date_to: datetime
    ) -> List[Dict[str, Any]]:
        """Get breakdown by industry"""
        
        industry_stats = self.db.query(
            Consultant.industry,
            func.count(Consultant.id).label('consultant_count'),
            func.count(ConsultantProject.id).label('project_count'),
            func.sum(ConsultantEarning.amount).label('total_earnings')
        ).outerjoin(ConsultantProject).outerjoin(ConsultantEarning).filter(
            Consultant.status == ConsultantStatus.ACTIVE,
            Consultant.industry.isnot(None)
        ).group_by(Consultant.industry).order_by(
            desc('consultant_count')
        ).all()
        
        return [
            {
                'industry': stat.industry,
                'consultant_count': stat.consultant_count,
                'project_count': stat.project_count or 0,
                'total_earnings': float(stat.total_earnings) if stat.total_earnings else 0
            }
            for stat in industry_stats
        ]

    async def _get_top_performers(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top performing consultants"""
        
        top_consultants = self.db.query(Consultant).filter(
            Consultant.status == ConsultantStatus.ACTIVE
        ).order_by(
            desc(Consultant.average_rating),
            desc(Consultant.total_projects),
            desc(Consultant.total_earnings)
        ).limit(limit).all()
        
        return [
            {
                'id': consultant.id,
                'full_name': consultant.full_name,
                'industry': consultant.industry,
                'average_rating': float(consultant.average_rating) if consultant.average_rating else 0,
                'total_projects': consultant.total_projects,
                'success_rate': consultant.success_rate,
                'total_earnings': float(consultant.total_earnings)
            }
            for consultant in top_consultants
        ]

    async def _calculate_period_change(
        self, 
        metric_type: str, 
        date_from: datetime, 
        date_to: datetime, 
        consultant_filter
    ) -> float:
        """Calculate percentage change from previous period"""
        
        period_length = date_to - date_from
        previous_from = date_from - period_length
        previous_to = date_from
        
        if metric_type == 'consultants':
            result = await self.db.execute(
                select(func.count(Consultant.id)).where(
                    consultant_filter,
                    Consultant.created_at >= date_from,
                    Consultant.created_at <= date_to
                )
            )
            current = result.scalar() or 0
            
            result = await self.db.execute(
                select(func.count(Consultant.id)).where(
                    consultant_filter,
                    Consultant.created_at >= previous_from,
                    Consultant.created_at <= previous_to
                )
            )
            previous = result.scalar() or 0
        else:
            current = previous = 0
        
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        
        return ((current - previous) / previous) * 100

    def _calculate_revenue_change(
        self, 
        date_from: datetime, 
        date_to: datetime, 
        consultant_filter
    ) -> float:
        """Calculate revenue change from previous period"""
        
        period_length = date_to - date_from
        previous_from = date_from - period_length
        previous_to = date_from
        
        current_revenue = self.db.query(func.sum(ConsultantEarning.amount)).join(
            Consultant
        ).filter(
            consultant_filter,
            ConsultantEarning.created_at >= date_from,
            ConsultantEarning.created_at <= date_to
        ).scalar() or 0
        
        previous_revenue = self.db.query(func.sum(ConsultantEarning.amount)).join(
            Consultant
        ).filter(
            consultant_filter,
            ConsultantEarning.created_at >= previous_from,
            ConsultantEarning.created_at <= previous_to
        ).scalar() or 0
        
        if previous_revenue == 0:
            return 100.0 if current_revenue > 0 else 0.0
        
        return ((current_revenue - previous_revenue) / previous_revenue) * 100

    async def get_consultant_performance_report(self, consultant_id: str) -> Dict[str, Any]:
        """Generate detailed performance report for a specific consultant"""
        
        try:
            consultant = self.db.query(Consultant).filter(
                Consultant.id == consultant_id
            ).first()
            
            if not consultant:
                return {
                    'success': False,
                    'error': 'Consultant not found'
                }
            
            # Get analytics for this consultant
            analytics = await self.get_consultant_analytics(consultant_id)
            
            if not analytics['success']:
                return analytics
            
            # Additional consultant-specific metrics
            recent_reviews = self.db.query(ConsultantReview).join(
                ConsultantProject
            ).filter(
                ConsultantProject.consultant_id == consultant_id
            ).order_by(desc(ConsultantReview.created_at)).limit(10).all()
            
            active_projects = self.db.query(ConsultantProject).filter(
                ConsultantProject.consultant_id == consultant_id,
                ConsultantProject.status.in_([ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS])
            ).all()
            
            # Format the report
            report = {
                'consultant': {
                    'id': consultant.id,
                    'full_name': consultant.full_name,
                    'email': consultant.email,
                    'status': consultant.status,
                    'joined_date': consultant.created_at.isoformat()
                },
                'analytics': analytics['data'],
                'recent_reviews': [
                    {
                        'rating': review.rating,
                        'title': review.title,
                        'review_text': review.review_text,
                        'created_at': review.created_at.isoformat()
                    }
                    for review in recent_reviews
                ],
                'active_projects': [
                    {
                        'id': project.id,
                        'title': project.title,
                        'status': project.status,
                        'budget_max': float(project.budget_max) if project.budget_max else None,
                        'created_at': project.created_at.isoformat()
                    }
                    for project in active_projects
                ]
            }
            
            return {
                'success': True,
                'data': report
            }
            
        except Exception as e:
            logger.error(f"Performance report error: {e}")
            return {
                'success': False,
                'error': str(e)
            }