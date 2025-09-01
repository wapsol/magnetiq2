from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc, asc
from datetime import datetime, timedelta, date
import uuid
import logging

from ..models.business import ConsultationBooking, ConsultationBookingStatus, PaymentStatus
from ..models.consultant import Consultant, ConsultantAvailability, ConsultantStatus
from ..models.user import AdminUser

logger = logging.getLogger(__name__)


class ConsultationBookingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_consultants(self) -> List[Dict[str, Any]]:
        """Get all active consultants available for booking"""
        
        query = select(Consultant).where(
            and_(
                Consultant.status == ConsultantStatus.ACTIVE,
                Consultant.is_verified == True
            )
        ).order_by(
            desc(Consultant.is_featured),
            desc(Consultant.average_rating),
            asc(Consultant.created_at)
        )
        
        result = await self.db.execute(query)
        consultants = result.scalars().all()
        
        consultant_data = []
        for consultant in consultants:
            consultant_data.append({
                'id': consultant.id,
                'first_name': consultant.first_name,
                'last_name': consultant.last_name,
                'full_name': consultant.full_name,
                'profile_picture_url': consultant.profile_picture_url,
                'headline': consultant.headline,
                'location': consultant.location,
                'industry': consultant.industry,
                'specializations': consultant.specializations,
                'years_experience': consultant.years_experience,
                'average_rating': float(consultant.average_rating) if consultant.average_rating else None,
                'total_projects': consultant.total_projects,
                'is_featured': consultant.is_featured,
                'ai_summary': consultant.ai_summary[:200] + '...' if consultant.ai_summary and len(consultant.ai_summary) > 200 else consultant.ai_summary
            })
        
        return consultant_data

    async def get_available_time_slots(
        self, 
        consultant_id: str, 
        target_date: date,
        timezone: str = 'UTC'
    ) -> List[str]:
        """Get available time slots for a consultant on a specific date"""
        
        # For 30/30 system, we use fixed time slots: 10:00 and 14:00
        default_slots = ["10:00", "14:00"]
        
        # Check if consultant exists and is active
        consultant_query = select(Consultant).where(
            and_(
                Consultant.id == consultant_id,
                Consultant.status == ConsultantStatus.ACTIVE
            )
        )
        result = await self.db.execute(consultant_query)
        consultant = result.scalar_one_or_none()
        
        if not consultant:
            return []
        
        # Check for existing bookings on the target date
        target_datetime_start = datetime.combine(target_date, datetime.min.time())
        target_datetime_end = target_datetime_start + timedelta(days=1)
        
        bookings_query = select(ConsultationBooking).where(
            and_(
                ConsultationBooking.consultant_id == consultant_id,
                ConsultationBooking.consultation_date >= target_datetime_start,
                ConsultationBooking.consultation_date < target_datetime_end,
                ConsultationBooking.booking_status.in_([
                    ConsultationBookingStatus.CONFIRMED,
                    ConsultationBookingStatus.PENDING_PAYMENT
                ])
            )
        )
        
        result = await self.db.execute(bookings_query)
        existing_bookings = result.scalars().all()
        
        # Remove booked time slots
        booked_slots = {booking.time_slot for booking in existing_bookings}
        available_slots = [slot for slot in default_slots if slot not in booked_slots]
        
        return available_slots

    async def create_booking(
        self,
        consultant_id: str,
        consultation_date: datetime,
        time_slot: str,
        contact_info: Dict[str, Any],
        terms_accepted: bool,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
        utm_data: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Create a new consultation booking"""
        
        try:
            # Validate consultant exists and is active
            consultant_query = select(Consultant).where(
                and_(
                    Consultant.id == consultant_id,
                    Consultant.status == ConsultantStatus.ACTIVE
                )
            )
            result = await self.db.execute(consultant_query)
            consultant = result.scalar_one_or_none()
            
            if not consultant:
                return {
                    'success': False,
                    'error': 'Consultant not found or not available'
                }
            
            # Validate time slot availability
            consultation_date_obj = consultation_date.date()
            available_slots = await self.get_available_time_slots(consultant_id, consultation_date_obj)
            
            if time_slot not in available_slots:
                return {
                    'success': False,
                    'error': 'Time slot not available'
                }
            
            # Create booking
            booking_id = str(uuid.uuid4())
            booking = ConsultationBooking(
                id=booking_id,
                consultant_id=consultant_id,
                first_name=contact_info.get('first_name'),
                last_name=contact_info.get('last_name'),
                email=contact_info.get('email'),
                company=contact_info.get('company'),
                website=contact_info.get('website'),
                phone=contact_info.get('phone'),
                consultation_date=consultation_date,
                time_slot=time_slot,
                terms_accepted=terms_accepted,
                terms_accepted_at=datetime.utcnow() if terms_accepted else None,
                user_agent=user_agent,
                ip_address=ip_address,
                utm_source=utm_data.get('utm_source') if utm_data else None,
                utm_medium=utm_data.get('utm_medium') if utm_data else None,
                utm_campaign=utm_data.get('utm_campaign') if utm_data else None,
            )
            
            self.db.add(booking)
            await self.db.commit()
            await self.db.refresh(booking)
            
            return {
                'success': True,
                'booking_id': booking_id,
                'message': 'Booking created successfully',
                'booking': await self._format_booking_data(booking)
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating booking: {str(e)}")
            return {
                'success': False,
                'error': f'Failed to create booking: {str(e)}'
            }

    async def update_billing_info(
        self,
        booking_id: str,
        billing_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update billing information for a booking"""
        
        try:
            # Get booking
            booking_query = select(ConsultationBooking).where(
                ConsultationBooking.id == booking_id
            )
            result = await self.db.execute(booking_query)
            booking = result.scalar_one_or_none()
            
            if not booking:
                return {
                    'success': False,
                    'error': 'Booking not found'
                }
            
            # Update billing information
            booking.billing_first_name = billing_info.get('billing_first_name')
            booking.billing_last_name = billing_info.get('billing_last_name')
            booking.billing_company = billing_info.get('billing_company')
            booking.billing_street = billing_info.get('billing_street')
            booking.billing_postal_code = billing_info.get('billing_postal_code')
            booking.billing_city = billing_info.get('billing_city')
            booking.billing_country = billing_info.get('billing_country', 'DE')
            booking.vat_number = billing_info.get('vat_number')
            
            await self.db.commit()
            
            return {
                'success': True,
                'message': 'Billing information updated successfully',
                'booking': await self._format_booking_data(booking)
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating billing info: {str(e)}")
            return {
                'success': False,
                'error': f'Failed to update billing information: {str(e)}'
            }

    async def process_payment(
        self,
        booking_id: str,
        payment_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process payment for a booking (placeholder for payment integration)"""
        
        try:
            # Get booking
            booking_query = select(ConsultationBooking).where(
                ConsultationBooking.id == booking_id
            )
            result = await self.db.execute(booking_query)
            booking = result.scalar_one_or_none()
            
            if not booking:
                return {
                    'success': False,
                    'error': 'Booking not found'
                }
            
            # Update payment status (placeholder - real payment processing would happen here)
            booking.payment_status = PaymentStatus.PROCESSING
            booking.payment_method = payment_data.get('payment_method', 'stripe')
            booking.payment_reference = f"ref_{booking_id[:8]}"
            booking.payment_provider = payment_data.get('payment_provider', 'stripe')
            
            # For demo purposes, mark as completed immediately
            # In production, this would be updated by payment webhook
            booking.payment_status = PaymentStatus.COMPLETED
            booking.booking_status = ConsultationBookingStatus.CONFIRMED
            booking.paid_at = datetime.utcnow()
            
            await self.db.commit()
            
            return {
                'success': True,
                'message': 'Payment processed successfully',
                'booking': await self._format_booking_data(booking)
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error processing payment: {str(e)}")
            return {
                'success': False,
                'error': f'Failed to process payment: {str(e)}'
            }

    async def get_booking_by_id(self, booking_id: str) -> Optional[Dict[str, Any]]:
        """Get booking by ID with consultant data"""
        
        query = select(ConsultationBooking).options(
            selectinload(ConsultationBooking.consultant)
        ).where(ConsultationBooking.id == booking_id)
        
        result = await self.db.execute(query)
        booking = result.scalar_one_or_none()
        
        if not booking:
            return None
        
        return await self._format_booking_data(booking, include_consultant=True)

    async def search_bookings(
        self,
        consultant_id: Optional[str] = None,
        booking_status: Optional[str] = None,
        payment_status: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        query: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        sort_by: str = 'created_at',
        sort_order: str = 'desc'
    ) -> Dict[str, Any]:
        """Search bookings with filtering and pagination"""
        
        query_obj = select(ConsultationBooking).options(
            selectinload(ConsultationBooking.consultant)
        )
        
        # Apply filters
        filters = []
        
        if consultant_id:
            filters.append(ConsultationBooking.consultant_id == consultant_id)
        
        if booking_status:
            filters.append(ConsultationBooking.booking_status == booking_status)
        
        if payment_status:
            filters.append(ConsultationBooking.payment_status == payment_status)
        
        if date_from:
            date_from_dt = datetime.combine(date_from, datetime.min.time())
            filters.append(ConsultationBooking.consultation_date >= date_from_dt)
        
        if date_to:
            date_to_dt = datetime.combine(date_to, datetime.max.time())
            filters.append(ConsultationBooking.consultation_date <= date_to_dt)
        
        if query:
            filters.append(
                or_(
                    ConsultationBooking.first_name.ilike(f'%{query}%'),
                    ConsultationBooking.last_name.ilike(f'%{query}%'),
                    ConsultationBooking.email.ilike(f'%{query}%'),
                    ConsultationBooking.company.ilike(f'%{query}%')
                )
            )
        
        if filters:
            query_obj = query_obj.where(and_(*filters))
        
        # Apply sorting
        sort_column = getattr(ConsultationBooking, sort_by, ConsultationBooking.created_at)
        if sort_order == 'asc':
            query_obj = query_obj.order_by(asc(sort_column))
        else:
            query_obj = query_obj.order_by(desc(sort_column))
        
        # Get total count
        count_query = select(func.count()).select_from(
            query_obj.subquery()
        )
        count_result = await self.db.execute(count_query)
        total_count = count_result.scalar()
        
        # Apply pagination
        query_obj = query_obj.offset(offset).limit(limit)
        result = await self.db.execute(query_obj)
        bookings = result.scalars().all()
        
        # Format results
        booking_data = []
        for booking in bookings:
            formatted_data = await self._format_booking_data(booking, include_consultant=True, include_detailed=False)
            booking_data.append(formatted_data)
        
        return {
            'bookings': booking_data,
            'total': total_count,
            'limit': limit,
            'offset': offset,
            'has_more': (offset + limit) < total_count
        }

    async def get_booking_statistics(self) -> Dict[str, Any]:
        """Get booking statistics for admin dashboard"""
        
        stats = {}
        
        # Basic counts
        total_bookings_query = select(func.count(ConsultationBooking.id))
        result = await self.db.execute(total_bookings_query)
        stats['total_bookings'] = result.scalar()
        
        confirmed_bookings_query = select(func.count(ConsultationBooking.id)).where(
            ConsultationBooking.booking_status == ConsultationBookingStatus.CONFIRMED
        )
        result = await self.db.execute(confirmed_bookings_query)
        stats['confirmed_bookings'] = result.scalar()
        
        pending_bookings_query = select(func.count(ConsultationBooking.id)).where(
            ConsultationBooking.booking_status == ConsultationBookingStatus.PENDING_PAYMENT
        )
        result = await self.db.execute(pending_bookings_query)
        stats['pending_bookings'] = result.scalar()
        
        # Revenue statistics
        total_revenue_query = select(func.sum(ConsultationBooking.amount)).where(
            ConsultationBooking.payment_status == PaymentStatus.COMPLETED
        )
        result = await self.db.execute(total_revenue_query)
        stats['total_revenue'] = float(result.scalar() or 0)
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_bookings_query = select(func.count(ConsultationBooking.id)).where(
            ConsultationBooking.created_at >= thirty_days_ago
        )
        result = await self.db.execute(recent_bookings_query)
        stats['new_bookings_30d'] = result.scalar()
        
        recent_revenue_query = select(func.sum(ConsultationBooking.amount)).where(
            and_(
                ConsultationBooking.created_at >= thirty_days_ago,
                ConsultationBooking.payment_status == PaymentStatus.COMPLETED
            )
        )
        result = await self.db.execute(recent_revenue_query)
        stats['revenue_30d'] = float(result.scalar() or 0)
        
        return stats

    async def _format_booking_data(
        self,
        booking: ConsultationBooking,
        include_consultant: bool = False,
        include_detailed: bool = True
    ) -> Dict[str, Any]:
        """Format booking data for API response"""
        
        data = {
            'id': booking.id,
            'consultant_id': booking.consultant_id,
            'first_name': booking.first_name,
            'last_name': booking.last_name,
            'full_name': f"{booking.first_name} {booking.last_name}",
            'email': booking.email,
            'company': booking.company,
            'phone': booking.phone,
            'consultation_date': booking.consultation_date.isoformat(),
            'time_slot': booking.time_slot,
            'amount': float(booking.amount),
            'currency': booking.currency,
            'booking_status': booking.booking_status,
            'payment_status': booking.payment_status,
            'terms_accepted': booking.terms_accepted,
            'created_at': booking.created_at.isoformat()
        }
        
        if include_detailed:
            data.update({
                'website': booking.website,
                'duration_minutes': booking.duration_minutes,
                'timezone': booking.timezone,
                'billing_first_name': booking.billing_first_name,
                'billing_last_name': booking.billing_last_name,
                'billing_company': booking.billing_company,
                'billing_street': booking.billing_street,
                'billing_postal_code': booking.billing_postal_code,
                'billing_city': booking.billing_city,
                'billing_country': booking.billing_country,
                'vat_number': booking.vat_number,
                'payment_method': booking.payment_method,
                'payment_reference': booking.payment_reference,
                'meeting_url': booking.meeting_url,
                'admin_notes': booking.admin_notes,
                'updated_at': booking.updated_at.isoformat() if booking.updated_at else None,
                'paid_at': booking.paid_at.isoformat() if booking.paid_at else None,
                'completed_at': booking.completed_at.isoformat() if booking.completed_at else None
            })
        
        if include_consultant and booking.consultant:
            data['consultant'] = {
                'id': booking.consultant.id,
                'first_name': booking.consultant.first_name,
                'last_name': booking.consultant.last_name,
                'full_name': booking.consultant.full_name,
                'profile_picture_url': booking.consultant.profile_picture_url,
                'headline': booking.consultant.headline,
                'industry': booking.consultant.industry,
                'average_rating': float(booking.consultant.average_rating) if booking.consultant.average_rating else None
            }
        
        return data