from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime


class EmailRequest(BaseModel):
    """Base email request schema"""
    to: List[EmailStr]
    subject: str
    html_content: str
    text_content: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None


class EmailResponse(BaseModel):
    """Email response schema"""
    success: bool
    message: str
    email_id: Optional[str] = None


class BookingConfirmationEmailRequest(BaseModel):
    """Booking confirmation email request"""
    customer_email: EmailStr
    customer_name: str
    customer_title: Optional[str] = None
    consultant_name: str
    consultant_email: EmailStr
    consultant_role: str
    booking_date: datetime
    start_time: str
    end_time: str
    booking_reference: str
    language: str = "en"
    
    @validator('language')
    def validate_language(cls, v):
        if v not in ['en', 'de']:
            raise ValueError('Language must be either "en" or "de"')
        return v


class InternalNotificationEmailRequest(BaseModel):
    """Internal booking notification email request"""
    internal_emails: List[EmailStr]
    customer_name: str
    customer_title: Optional[str] = None
    customer_email: EmailStr
    customer_phone: str
    customer_company: str
    consultant_name: str
    consultant_email: EmailStr
    booking_date: datetime
    start_time: str
    end_time: str
    booking_reference: str
    calendar_status: str = 'unknown'


class AdminWelcomeEmailRequest(BaseModel):
    """Admin user welcome email request"""
    user_email: EmailStr
    full_name: str
    password: str
    admin_panel_url: str = "http://localhost:8036/admin"
    created_by_name: str = "System Administrator"


class WebinarRegistrationEmailRequest(BaseModel):
    """Webinar registration confirmation email request"""
    participant_email: EmailStr
    first_name: str
    last_name: str
    webinar_title: str
    webinar_date: datetime
    webinar_duration: int
    meeting_url: Optional[str] = None
    presenter_name: Optional[str] = None
    language: str = "en"
    
    @validator('language')
    def validate_language(cls, v):
        if v not in ['en', 'de']:
            raise ValueError('Language must be either "en" or "de"')
        return v


class WhitepaperDownloadEmailRequest(BaseModel):
    """Whitepaper download confirmation email request"""
    user_email: EmailStr
    first_name: str
    last_name: str
    whitepaper_title: str
    download_url: str
    related_whitepapers: Optional[List[Dict[str, str]]] = None
    language: str = "en"
    
    @validator('language')
    def validate_language(cls, v):
        if v not in ['en', 'de']:
            raise ValueError('Language must be either "en" or "de"')
        return v


class NewsletterSubscriptionEmailRequest(BaseModel):
    """Newsletter subscription confirmation email request"""
    subscriber_email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    subscription_type: str = "general"  # general, announcements, updates
    language: str = "en"
    
    @validator('language')
    def validate_language(cls, v):
        if v not in ['en', 'de']:
            raise ValueError('Language must be either "en" or "de"')
        return v


class ContactFormEmailRequest(BaseModel):
    """Contact form submission email request"""
    sender_email: EmailStr
    sender_name: str
    subject: str
    message: str
    company: Optional[str] = None
    phone: Optional[str] = None
    internal_recipients: List[EmailStr]


class BulkEmailRequest(BaseModel):
    """Bulk email sending request"""
    recipients: List[EmailStr]
    subject: str
    html_template: str
    personalization_data: Optional[Dict[str, Any]] = None
    send_at: Optional[datetime] = None
    track_opens: bool = False
    track_clicks: bool = False


class EmailTemplateRequest(BaseModel):
    """Email template generation request"""
    template_type: str
    template_data: Dict[str, Any]
    language: str = "en"
    
    @validator('template_type')
    def validate_template_type(cls, v):
        allowed_types = [
            'booking_confirmation',
            'internal_notification', 
            'admin_welcome',
            'webinar_registration',
            'whitepaper_download',
            'newsletter_subscription',
            'contact_form'
        ]
        if v not in allowed_types:
            raise ValueError(f'Template type must be one of: {", ".join(allowed_types)}')
        return v
    
    @validator('language')
    def validate_language(cls, v):
        if v not in ['en', 'de']:
            raise ValueError('Language must be either "en" or "de"')
        return v


class EmailTemplateResponse(BaseModel):
    """Email template response"""
    subject: str
    html_content: str
    text_content: str


class EmailStatusRequest(BaseModel):
    """Email status check request"""
    email_id: str


class EmailStatusResponse(BaseModel):
    """Email status response"""
    email_id: str
    status: str  # sent, delivered, opened, clicked, bounced, failed
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None
    bounce_reason: Optional[str] = None
    error_message: Optional[str] = None


class EmailStatsResponse(BaseModel):
    """Email statistics response"""
    total_sent: int
    total_delivered: int
    total_opened: int
    total_clicked: int
    total_bounced: int
    total_failed: int
    delivery_rate: float
    open_rate: float
    click_rate: float
    bounce_rate: float


class SMTPConfigResponse(BaseModel):
    """SMTP configuration status response"""
    configured: bool
    smtp_host: str
    smtp_port: int
    smtp_username: Optional[str] = None
    from_email: str
    from_name: str
    use_tls: bool
    use_starttls: bool
    connection_test: Optional[bool] = None
    error_message: Optional[str] = None