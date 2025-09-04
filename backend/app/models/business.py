from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean, ForeignKey, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
from enum import Enum


class Webinar(Base):
    __tablename__ = "webinars"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Information (with multilingual support)
    title = Column(JSON, nullable=False)  # {"en": "Title", "de": "Titel"}
    description = Column(JSON)  # {"en": "Description", "de": "Beschreibung"}
    slug = Column(String(255), unique=True, nullable=False, index=True)
    
    # Scheduling
    scheduled_at = Column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes = Column(Integer, default=60)
    timezone = Column(String(50), default='UTC')
    max_participants = Column(Integer)
    
    # URLs & Configuration
    meeting_url = Column(String(500))
    recording_url = Column(String(500))
    presentation_file_id = Column(Integer, ForeignKey("media_files.id"))
    
    # Status
    status = Column(String(20), nullable=False, default='scheduled', index=True)
    registration_enabled = Column(Boolean, default=True)
    registration_deadline = Column(DateTime(timezone=True))
    
    # Presenter Information
    presenter_name = Column(String(255))
    presenter_bio = Column(JSON)  # {"en": "Bio", "de": "Biografie"}
    presenter_avatar_id = Column(Integer, ForeignKey("media_files.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))

    # Relationships
    presentation_file = relationship("MediaFile", foreign_keys=[presentation_file_id])
    presenter_avatar = relationship("MediaFile", foreign_keys=[presenter_avatar_id])


class WebinarRegistration(Base):
    __tablename__ = "webinar_registrations"

    id = Column(Integer, primary_key=True, index=True)
    webinar_id = Column(Integer, ForeignKey("webinars.id"), nullable=False, index=True)
    
    # Contact Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(255))
    job_title = Column(String(255))
    phone = Column(String(50))
    
    # Registration Details
    registration_source = Column(String(50))  # website, api, import
    utm_source = Column(String(100))
    utm_medium = Column(String(100))
    utm_campaign = Column(String(100))
    
    # Attendance Tracking
    attended = Column(Boolean, default=False)
    attendance_duration = Column(Integer)  # minutes attended
    
    # Communication Preferences
    send_reminder = Column(Boolean, default=True)
    send_recording = Column(Boolean, default=True)
    
    # Timestamps
    registered_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    confirmed_at = Column(DateTime(timezone=True))

    # Relationships
    webinar = relationship("Webinar", backref="registrations")


class Whitepaper(Base):
    __tablename__ = "whitepapers"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Information
    title = Column(JSON, nullable=False)  # {"en": "Title", "de": "Titel"}
    description = Column(JSON)  # {"en": "Description", "de": "Beschreibung"}
    slug = Column(String(255), unique=True, nullable=False, index=True)
    
    # Content
    file_id = Column(Integer, ForeignKey("media_files.id"), nullable=False)
    thumbnail_id = Column(Integer, ForeignKey("media_files.id"))
    preview_content = Column(JSON)  # {"en": "Preview", "de": "Vorschau"}
    
    # Categorization
    category = Column(String(100), index=True)  # case-study, guide, report
    tags = Column(JSON)  # JSON array of tags
    industry = Column(JSON)  # JSON array of industries
    
    # Lead Generation
    requires_registration = Column(Boolean, default=True)
    lead_magnet_active = Column(Boolean, default=True)
    
    # SEO & Marketing
    meta_title = Column(JSON)  # {"en": "Meta Title", "de": "Meta Titel"}
    meta_description = Column(JSON)  # {"en": "Meta Description", "de": "Meta Beschreibung"}
    
    # Status
    status = Column(String(20), nullable=False, default='draft', index=True)
    featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    
    # Publishing
    published_at = Column(DateTime(timezone=True), index=True)
    author_id = Column(Integer, ForeignKey("admin_users.id"))
    
    # Analytics
    download_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))

    # Relationships
    file = relationship("MediaFile", foreign_keys=[file_id])
    thumbnail = relationship("MediaFile", foreign_keys=[thumbnail_id])
    author = relationship("AdminUser", backref="authored_whitepapers")


class WhitepaperDownload(Base):
    __tablename__ = "whitepaper_downloads"

    id = Column(Integer, primary_key=True, index=True)
    whitepaper_id = Column(Integer, ForeignKey("whitepapers.id"), nullable=False, index=True)
    
    # Contact Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(255))
    job_title = Column(String(255))
    phone = Column(String(50))
    
    # Email Validation
    email_validated = Column(Boolean, default=False)
    validation_token = Column(String(64), unique=True, index=True)
    validation_sent_at = Column(DateTime(timezone=True))
    email_validated_at = Column(DateTime(timezone=True))
    
    # Download Details
    download_ip = Column(String(45))
    user_agent = Column(Text)
    download_source = Column(String(50))  # website, api, email
    utm_source = Column(String(100))
    utm_medium = Column(String(100))
    utm_campaign = Column(String(100))
    
    # Secure Download Links
    download_token = Column(String(64), unique=True, index=True)
    download_link_expires_at = Column(DateTime(timezone=True))
    download_count = Column(Integer, default=0)
    download_limit = Column(Integer, default=3)  # Allow 3 downloads per validated email
    
    # Timestamps
    requested_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    downloaded_at = Column(DateTime(timezone=True))

    # Relationships
    whitepaper = relationship("Whitepaper", backref="downloads")


class BookAMeeting(Base):
    __tablename__ = "book_a_meetings"

    id = Column(Integer, primary_key=True, index=True)
    
    # Contact Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(255))
    job_title = Column(String(255))
    phone = Column(String(50))
    
    # Book-a-Meeting Details
    meeting_type = Column(String(50), nullable=False)  # consultation, demo, support
    preferred_date = Column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes = Column(Integer, default=30)
    timezone = Column(String(50), default='UTC')
    
    # Requirements
    subject = Column(JSON)  # {"en": "Subject", "de": "Betreff"}
    message = Column(JSON)  # {"en": "Message", "de": "Nachricht"}
    budget_range = Column(String(50))
    urgency = Column(String(20))  # low, medium, high, urgent
    
    # Status Management
    status = Column(String(20), nullable=False, default='pending', index=True)
    confirmed_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Meeting Information
    meeting_url = Column(String(500))
    meeting_notes = Column(Text)
    follow_up_required = Column(Boolean, default=False)
    
    # Lead Scoring
    lead_score = Column(Integer, default=0)
    lead_source = Column(String(100))  # website, referral, campaign
    utm_source = Column(String(100))
    utm_medium = Column(String(100))
    utm_campaign = Column(String(100))
    
    # Assigned Staff
    assigned_to = Column(Integer, ForeignKey("admin_users.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))

    # Relationships
    assigned_user = relationship("AdminUser", backref="assigned_book_a_meetings")


class ConsultationBookingStatus(str, Enum):
    PENDING_PAYMENT = "pending_payment"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class ConsultationBooking(Base):
    __tablename__ = "consultation_bookings"

    id = Column(String, primary_key=True, index=True)
    consultant_id = Column(String, ForeignKey("consultants.id"), nullable=False, index=True)
    
    # Contact Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(255))
    website = Column(String(500))
    phone = Column(String(50), nullable=False)
    
    # Meeting Details
    consultation_date = Column(DateTime(timezone=True), nullable=False, index=True)
    time_slot = Column(String(10), nullable=False)  # "10:00" or "14:00"
    duration_minutes = Column(Integer, default=30, nullable=False)
    timezone = Column(String(50), default='UTC')
    
    # Fixed Pricing (30/30 system)
    amount = Column(Numeric(10, 2), default=30.00, nullable=False)
    currency = Column(String(3), default='EUR', nullable=False)
    
    # Billing Information
    billing_first_name = Column(String(100))
    billing_last_name = Column(String(100))
    billing_company = Column(String(255))
    billing_street = Column(String(255))
    billing_postal_code = Column(String(20))
    billing_city = Column(String(100))
    billing_country = Column(String(2), default='DE')
    vat_number = Column(String(50))
    
    # Status Management
    booking_status = Column(String(20), nullable=False, default=ConsultationBookingStatus.PENDING_PAYMENT)
    payment_status = Column(String(20), nullable=False, default=PaymentStatus.PENDING)
    
    # Legal & Compliance
    terms_accepted = Column(Boolean, default=False, nullable=False)
    terms_accepted_at = Column(DateTime(timezone=True))
    gdpr_consent = Column(Boolean, default=True, nullable=False)
    
    # Meeting Information
    meeting_url = Column(String(500))
    meeting_notes = Column(Text)
    consultation_summary = Column(Text)
    
    # Payment Details
    payment_method = Column(String(50))
    payment_reference = Column(String(255))
    payment_provider = Column(String(50))
    paid_at = Column(DateTime(timezone=True))
    
    # Source Tracking
    booking_source = Column(String(50), default='website')
    utm_source = Column(String(100))
    utm_medium = Column(String(100))
    utm_campaign = Column(String(100))
    user_agent = Column(Text)
    ip_address = Column(String(45))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    cancelled_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Admin Management
    admin_notes = Column(Text)
    assigned_admin_id = Column(Integer, ForeignKey("admin_users.id"))
    
    # Relationships
    consultant = relationship("Consultant", backref="consultation_bookings")
    assigned_admin = relationship("AdminUser", backref="managed_consultations")