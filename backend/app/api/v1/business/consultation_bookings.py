from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime, date
import logging

from ....database import get_db
from ....services.consultation_booking_service import ConsultationBookingService
from ....models.business import ConsultationBookingStatus, PaymentStatus
from ....middleware.language_detection import get_current_language

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models for request/response
class ContactInfoModel(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    company: Optional[str] = None
    website: Optional[str] = None
    phone: str


class BillingInfoModel(BaseModel):
    billing_first_name: str
    billing_last_name: str
    billing_company: Optional[str] = None
    billing_street: str
    billing_postal_code: str
    billing_city: str
    billing_country: str = 'DE'
    vat_number: Optional[str] = None


class BookingCreateRequest(BaseModel):
    consultant_id: str
    consultation_date: datetime
    time_slot: str  # "10:00" or "14:00"
    contact_info: ContactInfoModel
    terms_accepted: bool
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


class BillingUpdateRequest(BaseModel):
    billing_info: BillingInfoModel


class PaymentRequest(BaseModel):
    payment_method: str = 'stripe'
    payment_provider: str = 'stripe'


# Public endpoints for booking flow
@router.get("/public/consultants/active")
async def get_active_consultants(
    language: str = Depends(get_current_language),
    db: AsyncSession = Depends(get_db)
):
    """Get all active consultants available for booking"""
    service = ConsultationBookingService(db)
    
    try:
        consultants = await service.get_active_consultants()
        
        return {
            'success': True,
            'data': {
                'consultants': consultants,
                'total': len(consultants),
                'language': language
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching active consultants: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch consultants")


@router.get("/public/consultants/{consultant_id}/availability")
async def get_consultant_availability(
    consultant_id: str,
    target_date: date = Query(..., description="Target date for availability check"),
    timezone: str = Query('UTC', description="Timezone for availability"),
    db: AsyncSession = Depends(get_db)
):
    """Get available time slots for a consultant on a specific date"""
    service = ConsultationBookingService(db)
    
    try:
        available_slots = await service.get_available_time_slots(
            consultant_id=consultant_id,
            target_date=target_date,
            timezone=timezone
        )
        
        return {
            'success': True,
            'data': {
                'consultant_id': consultant_id,
                'date': target_date.isoformat(),
                'available_slots': available_slots,
                'default_slots': ["10:00", "14:00"],
                'timezone': timezone
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching availability: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch availability")


@router.post("/public/bookings")
async def create_booking(
    request: BookingCreateRequest,
    http_request: Request,
    language: str = Depends(get_current_language),
    db: AsyncSession = Depends(get_db)
):
    """Create a new consultation booking"""
    service = ConsultationBookingService(db)
    
    try:
        # Extract client info
        user_agent = http_request.headers.get('user-agent')
        ip_address = http_request.client.host
        
        utm_data = {
            'utm_source': request.utm_source,
            'utm_medium': request.utm_medium,
            'utm_campaign': request.utm_campaign
        }
        
        result = await service.create_booking(
            consultant_id=request.consultant_id,
            consultation_date=request.consultation_date,
            time_slot=request.time_slot,
            contact_info=request.contact_info.dict(),
            terms_accepted=request.terms_accepted,
            user_agent=user_agent,
            ip_address=ip_address,
            utm_data=utm_data
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            'success': True,
            'data': result,
            'language': language
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}")
        logger.error(f"Request data: {request}")
        raise HTTPException(status_code=500, detail="Failed to create booking")


@router.get("/public/bookings/{booking_id}")
async def get_booking(
    booking_id: str,
    language: str = Depends(get_current_language),
    db: AsyncSession = Depends(get_db)
):
    """Get booking details by ID"""
    service = ConsultationBookingService(db)
    
    try:
        booking = await service.get_booking_by_id(booking_id)
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return {
            'success': True,
            'data': {
                'booking': booking,
                'language': language
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching booking: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch booking")


@router.put("/public/bookings/{booking_id}/billing")
async def update_booking_billing(
    booking_id: str,
    request: BillingUpdateRequest,
    language: str = Depends(get_current_language),
    db: AsyncSession = Depends(get_db)
):
    """Update billing information for a booking"""
    service = ConsultationBookingService(db)
    
    try:
        result = await service.update_billing_info(
            booking_id=booking_id,
            billing_info=request.billing_info.dict()
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            'success': True,
            'data': result,
            'language': language
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating billing info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update billing information")


@router.post("/public/bookings/{booking_id}/payment")
async def process_booking_payment(
    booking_id: str,
    request: PaymentRequest,
    language: str = Depends(get_current_language),
    db: AsyncSession = Depends(get_db)
):
    """Process payment for a booking"""
    service = ConsultationBookingService(db)
    
    try:
        result = await service.process_payment(
            booking_id=booking_id,
            payment_data=request.dict()
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            'success': True,
            'data': result,
            'language': language,
            'message': {
                'en': 'Payment processed successfully. You will receive a confirmation email shortly.',
                'de': 'Zahlung erfolgreich verarbeitet. Sie erhalten in Kürze eine Bestätigungs-E-Mail.'
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error processing payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process payment")


# Admin endpoints for booking management
@router.get("/admin/bookings")
async def get_admin_bookings(
    consultant_id: Optional[str] = Query(None),
    booking_status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    query: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    sort_by: str = Query('created_at'),
    sort_order: str = Query('desc'),
    db: AsyncSession = Depends(get_db)
):
    """Get bookings for admin management with filtering and pagination"""
    service = ConsultationBookingService(db)
    
    try:
        result = await service.search_bookings(
            consultant_id=consultant_id,
            booking_status=booking_status,
            payment_status=payment_status,
            date_from=date_from,
            date_to=date_to,
            query=query,
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
        logger.error(f"Error fetching admin bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch bookings")


@router.get("/admin/bookings/{booking_id}")
async def get_admin_booking_details(
    booking_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed booking information for admin"""
    service = ConsultationBookingService(db)
    
    try:
        booking = await service.get_booking_by_id(booking_id)
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return {
            'success': True,
            'data': {
                'booking': booking
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching booking details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch booking details")


@router.get("/admin/bookings/statistics")
async def get_booking_statistics(
    db: AsyncSession = Depends(get_db)
):
    """Get booking statistics for admin dashboard"""
    service = ConsultationBookingService(db)
    
    try:
        stats = await service.get_booking_statistics()
        
        return {
            'success': True,
            'data': stats
        }
        
    except Exception as e:
        logger.error(f"Error fetching booking statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")


# Utility endpoints
@router.get("/public/booking-config")
async def get_booking_config(
    language: str = Depends(get_current_language)
):
    """Get booking configuration and constants"""
    
    config = {
        'pricing': {
            'amount': 30.00,
            'currency': 'EUR',
            'duration_minutes': 30
        },
        'time_slots': ['10:00', '14:00'],
        'booking_flow_steps': [
            'consultant_selection',
            'time_slot_selection', 
            'contact_information',
            'billing_information',
            'payment',
            'confirmation'
        ],
        'supported_countries': ['DE', 'AT', 'CH'],
        'default_timezone': 'Europe/Berlin',
        'messages': {
            'en': {
                'booking_title': '30/30 AI Consultation',
                'booking_description': 'Book a 30-minute consultation for €30 with our AI experts',
                'payment_button': 'Order with Payment Obligation',
                'gdpr_notice': 'All data is handled according to GDPR in our private cloud systems.'
            },
            'de': {
                'booking_title': '30/30 KI-Beratung',
                'booking_description': '30-minütige Beratung für €30 mit unseren KI-Experten buchen',
                'payment_button': 'Kostenpflichtig bestellen',
                'gdpr_notice': 'Alle Daten werden DSGVO-konform in unseren privaten Cloud-Systemen verarbeitet.'
            }
        }
    }
    
    return {
        'success': True,
        'data': {
            'config': config,
            'language': language
        }
    }