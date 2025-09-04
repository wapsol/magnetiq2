from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy import and_, or_, func, desc, asc, select
from datetime import datetime, timedelta
import uuid
import asyncio
import logging

from ..models.consultant import (
    Consultant, ConsultantKYC, ConsultantProject, ConsultantReview,
    ConsultantEarning, ConsultantAvailability, ConsultantPortfolio,
    ConsultantStatus, KYCStatus, ProjectStatus
)
from .ai_profile_generation_service import AIProfileGenerationService

logger = logging.getLogger(__name__)


class ConsultantService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_service = AIProfileGenerationService(db)

    async def get_consultant_by_id(self, consultant_id: str) -> Optional[Dict[str, Any]]:
        """Get consultant by ID with related data"""
        
        result = await self.db.execute(
            select(Consultant)
            .options(
                selectinload(Consultant.kyc_documents),
                selectinload(Consultant.projects),
                selectinload(Consultant.reviews)
            )
            .where(Consultant.id == consultant_id)
        )
        consultant = result.scalar_one_or_none()
        
        if not consultant:
            return None
        
        return await self._format_consultant_data(consultant)

    async def get_consultant_by_linkedin_url(self, linkedin_url: str) -> Optional[Dict[str, Any]]:
        """Get consultant by LinkedIn URL"""
        
        result = await self.db.execute(
            select(Consultant).where(Consultant.linkedin_url == linkedin_url)
        )
        consultant = result.scalar_one_or_none()
        
        if not consultant:
            return None
        
        return await self._format_consultant_data(consultant)

    async def get_consultant_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """Get consultant by slug (first-last name format or custom slug)"""
        
        # Try direct slug match first (if we add a slug field later)
        # For now, we'll match based on first-last name format
        slug_parts = slug.lower().replace('-', ' ').split()
        
        if len(slug_parts) >= 2:
            first_name = slug_parts[0]
            last_name = ' '.join(slug_parts[1:])
            
            result = await self.db.execute(
                select(Consultant)
                .options(
                    selectinload(Consultant.kyc_documents),
                    selectinload(Consultant.projects),
                    selectinload(Consultant.reviews)
                )
                .where(
                    and_(
                        func.lower(Consultant.first_name) == first_name,
                        func.lower(Consultant.last_name) == last_name,
                        Consultant.status == ConsultantStatus.ACTIVE  # Only get active consultants
                    )
                )
                .order_by(Consultant.created_at.desc())  # Get the most recent one if multiple
            )
            consultant = result.scalar_one_or_none()
            
            if consultant:
                return await self._format_consultant_data(consultant)
        
        return None

    async def get_consultant_full_profile(self, consultant_id: str) -> Optional[Dict[str, Any]]:
        """Get complete consultant profile including reviews and portfolio"""
        
        # Get consultant with all related data
        result = await self.db.execute(
            select(Consultant)
            .options(
                selectinload(Consultant.kyc_documents),
                selectinload(Consultant.projects),
                selectinload(Consultant.reviews),
                selectinload(Consultant.earnings)
            )
            .where(Consultant.id == consultant_id)
        )
        consultant = result.scalar_one_or_none()
        
        if not consultant:
            return None
            
        # Get portfolio items
        portfolio_result = await self.db.execute(
            select(ConsultantPortfolio)
            .where(
                and_(
                    ConsultantPortfolio.consultant_id == consultant_id,
                    ConsultantPortfolio.is_public == True
                )
            )
            .order_by(ConsultantPortfolio.display_order, ConsultantPortfolio.created_at.desc())
        )
        portfolio_items = portfolio_result.scalars().all()
        
        # Format consultant data
        consultant_data = await self._format_consultant_data(consultant, include_detailed=True)
        
        # Add reviews data
        reviews_data = []
        for review in consultant.reviews:
            if review.is_published:
                reviews_data.append({
                    'id': review.id,
                    'rating': review.rating,
                    'title': review.title,
                    'review_text': review.review_text,
                    'communication_rating': review.communication_rating,
                    'expertise_rating': review.expertise_rating,
                    'timeliness_rating': review.timeliness_rating,
                    'professionalism_rating': review.professionalism_rating,
                    'value_for_money_rating': review.value_for_money_rating,
                    'reviewer_name': review.reviewer_name,
                    'reviewer_company': review.reviewer_company,
                    'reviewer_title': review.reviewer_title,
                    'created_at': review.created_at.isoformat(),
                    'is_featured': review.is_featured
                })
        
        # Add portfolio data
        portfolio_data = []
        for item in portfolio_items:
            portfolio_data.append({
                'id': item.id,
                'title': item.title,
                'description': item.description,
                'industry': item.industry,
                'project_type': item.project_type,
                'technologies_used': item.technologies_used,
                'thumbnail_url': item.thumbnail_url,
                'images': item.images,
                'client_name': item.client_name,
                'project_duration': item.project_duration,
                'team_size': item.team_size,
                'my_role': item.my_role,
                'outcome_description': item.outcome_description,
                'metrics_achieved': item.metrics_achieved,
                'is_featured': item.is_featured,
                'display_order': item.display_order
            })
        
        # Add availability slots (simplified for now)
        availability_result = await self.db.execute(
            select(ConsultantAvailability)
            .where(
                and_(
                    ConsultantAvailability.consultant_id == consultant_id,
                    ConsultantAvailability.is_available == True
                )
            )
            .order_by(ConsultantAvailability.day_of_week, ConsultantAvailability.start_time)
        )
        availability_slots = availability_result.scalars().all()
        
        availability_data = []
        for slot in availability_slots:
            availability_data.append({
                'day_of_week': slot.day_of_week,
                'start_time': slot.start_time,
                'end_time': slot.end_time,
                'timezone': slot.timezone,
                'is_available': slot.is_available
            })
        
        # Combine all data
        full_profile = {
            **consultant_data,
            'reviews': reviews_data,
            'portfolio': portfolio_data,
            'availability': availability_data,
            'statistics': {
                'total_reviews': len(reviews_data),
                'average_rating': consultant_data['average_rating'],
                'total_projects': consultant_data['total_projects'],
                'completed_projects': consultant_data['completed_projects'],
                'success_rate': consultant_data['success_rate']
            }
        }
        
        return full_profile

    async def create_consultant(
        self,
        consultant_data: Dict[str, Any],
        created_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new consultant"""
        
        try:
            # Check if email already exists
            existing_result = await self.db.execute(
                select(Consultant).where(Consultant.email == consultant_data.get('email'))
            )
            existing_consultant = existing_result.scalar_one_or_none()
            
            if existing_consultant:
                return {
                    'success': False,
                    'error': 'A consultant with this email already exists'
                }
            
            # Create new consultant
            consultant_data_with_defaults = {
                'linkedin_url': consultant_data.get('linkedin_url', f'https://linkedin.com/in/temp-{uuid.uuid4()}'),
                **consultant_data
            }
            
            consultant = Consultant(
                id=str(uuid.uuid4()),
                status=ConsultantStatus.PENDING,
                kyc_status=KYCStatus.NOT_STARTED,
                created_at=datetime.utcnow(),
                **consultant_data_with_defaults
            )
            
            self.db.add(consultant)
            await self.db.commit()
            await self.db.refresh(consultant)
            
            logger.info(f"New consultant created with ID {consultant.id} by {created_by or 'system'}")
            
            return {
                'success': True,
                'message': 'Consultant created successfully',
                'consultant': await self._format_consultant_data(consultant)
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Consultant creation failed: {e}")
            return {
                'success': False,
                'error': f'Creation failed: {str(e)}'
            }

    async def delete_consultant(
        self,
        consultant_id: str,
        deleted_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """Delete a consultant (soft delete by archiving)"""
        
        result = await self.db.execute(
            select(Consultant).where(Consultant.id == consultant_id)
        )
        consultant = result.scalar_one_or_none()
        
        if not consultant:
            return {
                'success': False,
                'error': 'Consultant not found'
            }
        
        try:
            # Soft delete by archiving
            consultant.status = ConsultantStatus.ARCHIVED
            consultant.archived_at = datetime.utcnow()
            consultant.updated_at = datetime.utcnow()
            
            await self.db.commit()
            
            logger.info(f"Consultant {consultant_id} deleted/archived by {deleted_by or 'system'}")
            
            return {
                'success': True,
                'message': 'Consultant deleted successfully'
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Consultant deletion failed for {consultant_id}: {e}")
            return {
                'success': False,
                'error': f'Deletion failed: {str(e)}'
            }

    async def search_consultants(
        self,
        query: Optional[str] = None,
        industry: Optional[str] = None,
        status: Optional[str] = None,
        specializations: Optional[List[str]] = None,
        min_rating: Optional[float] = None,
        max_rate: Optional[float] = None,
        availability: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        sort_by: str = 'created_at',
        sort_order: str = 'desc'
    ) -> Dict[str, Any]:
        """Search consultants with filtering and pagination"""
        
        # Build base query
        stmt = select(Consultant)
        
        # Apply filters
        filters = []
        
        if query:
            filters.append(
                or_(
                    Consultant.first_name.ilike(f'%{query}%'),
                    Consultant.last_name.ilike(f'%{query}%'),
                    Consultant.headline.ilike(f'%{query}%'),
                    Consultant.ai_summary.ilike(f'%{query}%')
                )
            )
        
        if industry:
            filters.append(Consultant.industry == industry)
        
        if status:
            filters.append(Consultant.status == status)
        
        if specializations:
            for spec in specializations:
                filters.append(Consultant.specializations.contains([spec]))
        
        if min_rating:
            filters.append(Consultant.average_rating >= min_rating)
        
        if max_rate:
            filters.append(Consultant.hourly_rate <= max_rate)
        
        if availability:
            filters.append(Consultant.availability_status == availability)
        
        if filters:
            stmt = stmt.where(and_(*filters))
        
        # Apply sorting
        sort_column = getattr(Consultant, sort_by, Consultant.created_at)
        if sort_order == 'asc':
            stmt = stmt.order_by(asc(sort_column))
        else:
            stmt = stmt.order_by(desc(sort_column))
        
        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.db.execute(count_stmt)
        total_count = count_result.scalar()
        
        # Apply pagination
        stmt = stmt.offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        consultants = result.scalars().all()
        
        # Format results
        consultant_data = []
        for consultant in consultants:
            formatted_data = await self._format_consultant_data(consultant, include_detailed=False)
            consultant_data.append(formatted_data)
        
        return {
            'consultants': consultant_data,
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'has_more': (offset + limit) < total_count
        }

    async def update_consultant(
        self,
        consultant_id: str,
        updates: Dict[str, Any],
        updated_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update consultant information"""
        
        result = await self.db.execute(
            select(Consultant).where(Consultant.id == consultant_id)
        )
        consultant = result.scalar_one_or_none()
        
        if not consultant:
            return {
                'success': False,
                'error': 'Consultant not found'
            }
        
        try:
            # Update allowed fields
            allowed_fields = [
                'first_name', 'last_name', 'headline', 'location', 'timezone',
                'phone', 'industry', 'specializations', 'years_experience',
                'hourly_rate', 'currency', 'availability_status', 'languages_spoken',
                'ai_summary', 'ai_skills_assessment', 'ai_market_positioning',
                'ai_generated_keywords', 'status', 'is_featured', 'is_verified'
            ]
            
            for field, value in updates.items():
                if field in allowed_fields:
                    setattr(consultant, field, value)
            
            consultant.updated_at = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(consultant)
            
            logger.info(f"Consultant {consultant_id} updated by {updated_by or 'system'}")
            
            return {
                'success': True,
                'message': 'Consultant updated successfully',
                'consultant': await self._format_consultant_data(consultant)
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Consultant update failed for {consultant_id}: {e}")
            return {
                'success': False,
                'error': f'Update failed: {str(e)}'
            }

    async def update_consultant_status(
        self,
        consultant_id: str,
        status: ConsultantStatus,
        admin_user_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update consultant status with audit trail"""
        
        result = await self.db.execute(
            select(Consultant).where(Consultant.id == consultant_id)
        )
        consultant = result.scalar_one_or_none()
        
        if not consultant:
            return {
                'success': False,
                'error': 'Consultant not found'
            }
        
        try:
            old_status = consultant.status
            consultant.status = status
            consultant.updated_at = datetime.utcnow()
            
            if status == ConsultantStatus.ARCHIVED:
                consultant.archived_at = datetime.utcnow()
            
            # Log status change
            logger.info(f"Consultant {consultant_id} status changed from {old_status} to {status} by {admin_user_id or 'system'}")
            
            await self.db.commit()
            
            return {
                'success': True,
                'message': f'Status updated from {old_status} to {status}',
                'old_status': old_status,
                'new_status': status
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Status update failed for consultant {consultant_id}: {e}")
            return {
                'success': False,
                'error': f'Status update failed: {str(e)}'
            }

    async def generate_ai_profile(
        self,
        consultant_id: str,
        force_regenerate: bool = False
    ) -> Dict[str, Any]:
        """Generate AI-powered profile content for consultant"""
        
        consultant = self.db.query(Consultant).filter(
            Consultant.id == consultant_id
        ).first()
        
        if not consultant:
            return {
                'success': False,
                'error': 'Consultant not found'
            }
        
        # Check if AI content already exists
        if consultant.ai_summary and not force_regenerate:
            return {
                'success': True,
                'message': 'AI profile already exists',
                'ai_content': {
                    'summary': consultant.ai_summary,
                    'skills_assessment': consultant.ai_skills_assessment,
                    'market_positioning': consultant.ai_market_positioning,
                    'keywords': consultant.ai_generated_keywords
                }
            }
        
        # Generate AI content
        ai_result = await self.ai_service.generate_consultant_profile(consultant)
        
        if ai_result['success']:
            # Update consultant with AI-generated content
            consultant.ai_summary = ai_result['ai_content']['summary']
            consultant.ai_skills_assessment = ai_result['ai_content']['skills_assessment']
            consultant.ai_market_positioning = ai_result['ai_content']['market_positioning']
            consultant.ai_generated_keywords = ai_result['ai_content']['keywords']
            consultant.updated_at = datetime.utcnow()
            
            self.db.commit()
        
        return ai_result

    async def get_consultant_statistics(self) -> Dict[str, Any]:
        """Get consultant platform statistics"""
        
        stats = {}
        
        # Basic counts
        stats['total_consultants'] = self.db.query(Consultant).count()
        stats['active_consultants'] = self.db.query(Consultant).filter(
            Consultant.status == ConsultantStatus.ACTIVE
        ).count()
        stats['pending_consultants'] = self.db.query(Consultant).filter(
            Consultant.status == ConsultantStatus.PENDING
        ).count()
        
        # KYC status
        stats['kyc_pending'] = self.db.query(Consultant).filter(
            Consultant.kyc_status == KYCStatus.PENDING_REVIEW
        ).count()
        stats['kyc_approved'] = self.db.query(Consultant).filter(
            Consultant.kyc_status == KYCStatus.APPROVED
        ).count()
        
        # Performance metrics
        total_projects = self.db.query(ConsultantProject).count()
        completed_projects = self.db.query(ConsultantProject).filter(
            ConsultantProject.status == ProjectStatus.COMPLETED
        ).count()
        
        stats['total_projects'] = total_projects
        stats['completed_projects'] = completed_projects
        stats['completion_rate'] = (completed_projects / total_projects * 100) if total_projects > 0 else 0
        
        # Revenue statistics
        total_earnings = self.db.query(func.sum(ConsultantEarning.amount)).scalar() or 0
        platform_fees = self.db.query(func.sum(ConsultantEarning.platform_fee_amount)).scalar() or 0
        
        stats['total_earnings'] = float(total_earnings)
        stats['platform_revenue'] = float(platform_fees)
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        stats['new_consultants_30d'] = self.db.query(Consultant).filter(
            Consultant.created_at >= thirty_days_ago
        ).count()
        
        stats['new_projects_30d'] = self.db.query(ConsultantProject).filter(
            ConsultantProject.created_at >= thirty_days_ago
        ).count()
        
        # Industry breakdown
        industry_stats = self.db.query(
            Consultant.industry,
            func.count(Consultant.id).label('count')
        ).filter(
            Consultant.industry.isnot(None),
            Consultant.status == ConsultantStatus.ACTIVE
        ).group_by(Consultant.industry).all()
        
        stats['industry_breakdown'] = [
            {'industry': industry, 'count': count}
            for industry, count in industry_stats
        ]
        
        return stats

    async def _format_consultant_data(
        self,
        consultant: Consultant,
        include_detailed: bool = True
    ) -> Dict[str, Any]:
        """Format consultant data for API response"""
        
        data = {
            'id': consultant.id,
            'email': consultant.email,
            'first_name': consultant.first_name,
            'last_name': consultant.last_name,
            'full_name': consultant.full_name,
            'profile_picture_url': consultant.profile_picture_url,
            'headline': consultant.headline,
            'location': consultant.location,
            'industry': consultant.industry,
            'specializations': consultant.specializations,
            'years_experience': consultant.years_experience,
            'hourly_rate': float(consultant.hourly_rate) if consultant.hourly_rate else None,
            'currency': consultant.currency,
            'availability_status': consultant.availability_status,
            'languages_spoken': consultant.languages_spoken,
            'status': consultant.status,
            'kyc_status': consultant.kyc_status,
            'is_featured': consultant.is_featured,
            'is_verified': consultant.is_verified,
            'average_rating': float(consultant.average_rating) if consultant.average_rating else None,
            'total_projects': consultant.total_projects,
            'completed_projects': consultant.completed_projects,
            'success_rate': consultant.success_rate,
            'created_at': consultant.created_at.isoformat(),
            'updated_at': consultant.updated_at.isoformat() if consultant.updated_at else None,
            'last_active_at': consultant.last_active_at.isoformat() if consultant.last_active_at else None
        }
        
        if include_detailed:
            data.update({
                'linkedin_url': consultant.linkedin_url,
                'linkedin_id': consultant.linkedin_id,
                'timezone': consultant.timezone,
                'phone': consultant.phone,
                'ai_summary': consultant.ai_summary,
                'ai_skills_assessment': consultant.ai_skills_assessment,
                'ai_market_positioning': consultant.ai_market_positioning,
                'ai_generated_keywords': consultant.ai_generated_keywords,
                'total_earnings': float(consultant.total_earnings) if consultant.total_earnings else 0,
                'response_rate': float(consultant.response_rate) if consultant.response_rate else None,
                'response_time_hours': float(consultant.response_time_hours) if consultant.response_time_hours else None
            })
        
        return data