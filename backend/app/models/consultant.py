from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Numeric, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid
from enum import Enum


class ConsultantStatus(str, Enum):
    PENDING = "pending"
    KYC_REVIEW = "kyc_review"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"


class KYCStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class ProjectStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Consultant(Base):
    __tablename__ = "consultants"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # LinkedIn Integration
    linkedin_url = Column(String(500), unique=True, nullable=False, index=True)
    linkedin_id = Column(String(100), unique=True, index=True)
    linkedin_data = Column(JSON)  # Raw LinkedIn profile data
    
    # Personal Information
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    profile_picture_url = Column(String(500))
    headline = Column(String(200))
    location = Column(String(100))
    timezone = Column(String(50))
    phone = Column(String(20))
    
    # Professional Information
    industry = Column(String(100), index=True)
    specializations = Column(JSON)  # List of expertise areas
    years_experience = Column(Integer)
    hourly_rate = Column(Numeric(10, 2))
    currency = Column(String(3), default='EUR')
    availability_status = Column(String(20), default='available')
    languages_spoken = Column(JSON)  # List of languages with proficiency
    
    # AI-Generated Profile Content
    ai_summary = Column(Text)
    ai_skills_assessment = Column(JSON)
    ai_market_positioning = Column(Text)
    ai_generated_keywords = Column(JSON)
    
    # Status & Verification
    status = Column(String(20), nullable=False, default=ConsultantStatus.PENDING)
    kyc_status = Column(String(20), nullable=False, default=KYCStatus.NOT_STARTED)
    is_featured = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # Performance Metrics
    total_projects = Column(Integer, default=0)
    completed_projects = Column(Integer, default=0)
    average_rating = Column(Numeric(3, 2))
    total_earnings = Column(Numeric(12, 2), default=0)
    response_rate = Column(Numeric(5, 2))  # Percentage
    response_time_hours = Column(Numeric(6, 2))  # Average response time
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_active_at = Column(DateTime(timezone=True))
    archived_at = Column(DateTime(timezone=True))
    
    # Relationships
    kyc_documents = relationship("ConsultantKYC", back_populates="consultant")
    projects = relationship("ConsultantProject", back_populates="consultant")
    reviews = relationship("ConsultantReview", back_populates="consultant")
    earnings = relationship("ConsultantEarning", back_populates="consultant")
    availability_slots = relationship("ConsultantAvailability", backref="consultant")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def success_rate(self) -> float:
        if self.total_projects == 0:
            return 0.0
        return (self.completed_projects / self.total_projects) * 100


class ConsultantKYC(Base):
    __tablename__ = "consultant_kyc"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consultant_id = Column(String, ForeignKey("consultants.id"), nullable=False, index=True)
    
    # Document Types
    identity_document_url = Column(String(500))
    identity_document_type = Column(String(50))  # passport, id_card, drivers_license
    identity_verified = Column(Boolean, default=False)
    
    tax_document_url = Column(String(500))
    tax_id_number = Column(String(100))
    tax_country = Column(String(2))
    tax_verified = Column(Boolean, default=False)
    
    address_document_url = Column(String(500))
    address_line1 = Column(String(200))
    address_line2 = Column(String(200))
    city = Column(String(100))
    state_province = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(2))
    address_verified = Column(Boolean, default=False)
    
    # Banking Information
    bank_account_holder = Column(String(200))
    iban = Column(String(34))
    bic_swift = Column(String(11))
    bank_name = Column(String(200))
    bank_country = Column(String(2))
    banking_verified = Column(Boolean, default=False)
    
    # Contract & Legal
    contract_signed_at = Column(DateTime(timezone=True))
    contract_document_url = Column(String(500))
    terms_accepted = Column(Boolean, default=False)
    gdpr_consent = Column(Boolean, default=False)
    
    # Review Process
    status = Column(String(20), nullable=False, default=KYCStatus.NOT_STARTED)
    reviewed_by = Column(String)  # Admin user ID
    reviewed_at = Column(DateTime(timezone=True))
    review_notes = Column(Text)
    rejection_reason = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    consultant = relationship("Consultant", back_populates="kyc_documents")


class ConsultantProject(Base):
    __tablename__ = "consultant_projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consultant_id = Column(String, ForeignKey("consultants.id"), nullable=False, index=True)
    
    # Project Details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    industry = Column(String(100))
    project_type = Column(String(50))  # consultation, implementation, audit
    
    # Client Information (simplified for MVP)
    client_name = Column(String(200))
    client_email = Column(String(255))
    client_company = Column(String(200))
    
    # Financial
    budget_min = Column(Numeric(10, 2))
    budget_max = Column(Numeric(10, 2))
    hourly_rate = Column(Numeric(10, 2))
    total_amount = Column(Numeric(12, 2))
    currency = Column(String(3), default='EUR')
    
    # Timeline
    estimated_hours = Column(Integer)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    deadline = Column(DateTime(timezone=True))
    
    # Status & Progress
    status = Column(String(20), nullable=False, default=ProjectStatus.OPEN)
    progress_percentage = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    consultant = relationship("Consultant", back_populates="projects")
    reviews = relationship("ConsultantReview", back_populates="project")


class ConsultantReview(Base):
    __tablename__ = "consultant_reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consultant_id = Column(String, ForeignKey("consultants.id"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("consultant_projects.id"), index=True)
    
    # Review Details
    rating = Column(Integer, nullable=False)  # 1-5 scale
    title = Column(String(200))
    review_text = Column(Text)
    
    # Review Categories (1-5 scale each)
    communication_rating = Column(Integer)
    expertise_rating = Column(Integer)
    timeliness_rating = Column(Integer)
    professionalism_rating = Column(Integer)
    value_for_money_rating = Column(Integer)
    
    # Client Information
    reviewer_name = Column(String(200))
    reviewer_email = Column(String(255))
    reviewer_company = Column(String(200))
    reviewer_title = Column(String(100))
    
    # Status
    is_published = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    consultant = relationship("Consultant", back_populates="reviews")
    project = relationship("ConsultantProject", back_populates="reviews")


class ConsultantEarning(Base):
    __tablename__ = "consultant_earnings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consultant_id = Column(String, ForeignKey("consultants.id"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("consultant_projects.id"), index=True)
    
    # Payment Details
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default='EUR')
    description = Column(String(500))
    
    # Platform Fees
    platform_fee_percentage = Column(Numeric(5, 2), default=15.0)  # 15% platform fee
    platform_fee_amount = Column(Numeric(12, 2))
    net_amount = Column(Numeric(12, 2))  # Amount after platform fee
    
    # Payment Processing
    payment_method = Column(String(50))  # bank_transfer, paypal, stripe
    transaction_id = Column(String(100))
    payment_status = Column(String(20), default='pending')  # pending, processed, failed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    consultant = relationship("Consultant", back_populates="earnings")


class ConsultantAvailability(Base):
    __tablename__ = "consultant_availability"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consultant_id = Column(String, ForeignKey("consultants.id"), nullable=False, index=True)
    
    # Availability Windows
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String(8))  # HH:MM:SS format
    end_time = Column(String(8))  # HH:MM:SS format
    timezone = Column(String(50))
    
    # Status
    is_available = Column(Boolean, default=True)
    
    # Special Dates
    date_override = Column(DateTime(timezone=True))  # For specific date overrides
    is_holiday = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ConsultantPortfolio(Base):
    __tablename__ = "consultant_portfolio"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    consultant_id = Column(String, ForeignKey("consultants.id"), nullable=False, index=True)
    
    # Portfolio Item
    title = Column(String(200), nullable=False)
    description = Column(Text)
    industry = Column(String(100))
    project_type = Column(String(50))
    technologies_used = Column(JSON)
    
    # Media
    thumbnail_url = Column(String(500))
    images = Column(JSON)  # Array of image URLs
    documents = Column(JSON)  # Array of document URLs
    
    # Details
    client_name = Column(String(200))  # Can be anonymized
    project_duration = Column(String(50))
    team_size = Column(Integer)
    my_role = Column(String(100))
    
    # Results
    outcome_description = Column(Text)
    metrics_achieved = Column(JSON)  # Key-value pairs of metrics
    
    # Visibility
    is_public = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())