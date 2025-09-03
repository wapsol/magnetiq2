from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base
from enum import Enum


class ApplicationStatus(str, Enum):
    """Job application status enumeration"""
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEW_COMPLETED = "interview_completed"
    OFFER_EXTENDED = "offer_extended"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    WITHDRAWN = "withdrawn"
    REJECTED = "rejected"


class JobApplication(Base):
    """Job application model with CV upload and consent tracking"""
    __tablename__ = "job_applications"

    id = Column(String(36), primary_key=True, index=True)  # UUID
    
    # Position Information
    position_title = Column(String(255), nullable=False, index=True)
    position_department = Column(String(100), nullable=False, index=True)
    position_location = Column(String(100))
    position_type = Column(String(50))  # Full-time, Part-time, Contract, etc.
    
    # Candidate Profile Information
    linkedin_profile = Column(String(500), nullable=False)
    github_profile = Column(String(500), nullable=True)
    
    # CV File Information
    cv_filename = Column(String(255), nullable=False)
    cv_original_filename = Column(String(255), nullable=False)
    cv_file_path = Column(String(1000), nullable=False)
    cv_file_size = Column(Integer, nullable=False)
    cv_mime_type = Column(String(100), nullable=False)
    cv_file_hash = Column(String(64))  # SHA-256 hash for integrity
    
    # Consent Tracking (GDPR Compliance)
    consent_cv_sharing = Column(Boolean, default=False, nullable=False)
    consent_ai_processing = Column(Boolean, default=False, nullable=False)
    consent_communications = Column(Boolean, default=False, nullable=False)
    consent_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Application Metadata
    application_language = Column(String(2), default='en', index=True)  # ISO language code
    user_agent = Column(Text)
    ip_address = Column(String(45))  # IPv6 compatible
    referrer_url = Column(String(1000))
    
    # Application Status and Processing
    status = Column(String(30), default=ApplicationStatus.SUBMITTED, index=True)
    internal_notes = Column(JSON)  # For recruiter notes, structured data
    recruiter_rating = Column(Integer)  # 1-10 rating scale
    interview_date = Column(DateTime(timezone=True))
    offer_details = Column(JSON)  # Salary, benefits, start date, etc.
    
    # Communication Tracking
    email_notifications_sent = Column(JSON, default=list)  # List of sent notifications
    last_contact_date = Column(DateTime(timezone=True))
    contact_history = Column(JSON, default=list)  # Communication log
    
    # AI Processing Results (Future Enhancement)
    ai_analysis_results = Column(JSON)  # CV analysis, skill extraction, matching scores
    ai_processing_date = Column(DateTime(timezone=True))
    ai_model_version = Column(String(50))
    
    # Data Retention and Privacy
    data_retention_until = Column(DateTime(timezone=True))  # GDPR data retention
    anonymization_date = Column(DateTime(timezone=True))  # When PII was removed
    deletion_requested_at = Column(DateTime(timezone=True))  # GDPR deletion request
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<JobApplication {self.id}: {self.position_title} - {self.status}>"


class JobApplicationAuditLog(Base):
    """Audit log for job application changes and access"""
    __tablename__ = "job_application_audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(36), nullable=False, index=True)
    
    # Audit Information
    action = Column(String(50), nullable=False)  # created, updated, accessed, deleted, etc.
    actor_type = Column(String(20), nullable=False)  # system, admin, recruiter, candidate
    actor_id = Column(String(100))  # User ID or system identifier
    actor_details = Column(JSON)  # Additional actor context
    
    # Change Details
    field_changed = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)
    change_reason = Column(String(500))
    
    # Request Context
    user_agent = Column(Text)
    ip_address = Column(String(45))
    session_id = Column(String(100))
    request_id = Column(String(100))
    
    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<JobApplicationAuditLog {self.id}: {self.action} on {self.application_id}>"


class ApplicationStatusHistory(Base):
    """Track status changes for job applications"""
    __tablename__ = "application_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(36), nullable=False, index=True)
    
    # Status Change Information
    previous_status = Column(String(30))
    new_status = Column(String(30), nullable=False)
    status_reason = Column(String(500))  # Reason for status change
    
    # Actor Information
    changed_by_type = Column(String(20), nullable=False)  # system, admin, recruiter
    changed_by_id = Column(String(100))
    changed_by_name = Column(String(255))
    
    # Additional Context
    notes = Column(Text)
    automated_change = Column(Boolean, default=False)
    notification_sent = Column(Boolean, default=False)
    
    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<StatusHistory {self.id}: {self.previous_status} → {self.new_status}>"


class ApplicationUploadMetadata(Base):
    """Metadata for uploaded files related to job applications"""
    __tablename__ = "application_upload_metadata"
    
    id = Column(String(36), primary_key=True, index=True)  # UUID
    application_id = Column(String(36), nullable=False, index=True)
    
    # File Information
    file_type = Column(String(20), nullable=False)  # cv, cover_letter, portfolio, etc.
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(1000), nullable=False)
    
    # File Properties
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_hash = Column(String(64), nullable=False)  # SHA-256
    
    # Processing Status
    virus_scan_status = Column(String(20), default='pending')  # pending, clean, infected, error
    virus_scan_date = Column(DateTime(timezone=True))
    processing_status = Column(String(20), default='uploaded')  # uploaded, processing, processed, error
    processing_results = Column(JSON)  # AI analysis results, text extraction, etc.
    
    # Access Control
    access_level = Column(String(20), default='internal')  # internal, shared, public
    download_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime(timezone=True))
    
    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<UploadMetadata {self.id}: {self.file_type} - {self.filename}>"