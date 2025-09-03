from pydantic import BaseModel, HttpUrl, validator, Field
from typing import Dict, Optional, List, Any
from datetime import datetime
from enum import Enum
import re


class ApplicationStatusEnum(str, Enum):
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


class JobApplicationCreate(BaseModel):
    """Schema for creating a new job application"""
    position_title: str = Field(..., min_length=2, max_length=255)
    position_department: str = Field(..., min_length=2, max_length=100)
    position_location: Optional[str] = Field(None, max_length=100)
    position_type: Optional[str] = Field(None, max_length=50)
    
    # Profile links
    linkedin_profile: HttpUrl = Field(..., description="LinkedIn profile URL (required)")
    github_profile: Optional[HttpUrl] = Field(None, description="GitHub profile URL (optional)")
    
    # Consent (required for GDPR compliance)
    consent_cv_sharing: bool = Field(..., description="Consent to share CV with recruitment partners")
    consent_ai_processing: bool = Field(..., description="Consent to AI processing of application")
    consent_communications: bool = Field(..., description="Consent to receive job communications")
    
    # Application metadata
    application_language: Optional[str] = Field('en', min_length=2, max_length=2)
    user_agent: Optional[str] = Field(None, max_length=2000)
    referrer_url: Optional[str] = Field(None, max_length=1000)
    
    @validator('linkedin_profile')
    def validate_linkedin_profile(cls, v):
        """Validate LinkedIn profile URL format"""
        linkedin_pattern = r'^https?://(www\.)?linkedin\.com/in/[\w\-\.]+/?$'
        if not re.match(linkedin_pattern, str(v)):
            raise ValueError('LinkedIn profile must be a valid LinkedIn profile URL')
        return v
    
    @validator('github_profile')
    def validate_github_profile(cls, v):
        """Validate GitHub profile URL format"""
        if v is None:
            return v
        github_pattern = r'^https?://(www\.)?github\.com/[\w\-\.]+/?$'
        if not re.match(github_pattern, str(v)):
            raise ValueError('GitHub profile must be a valid GitHub profile URL')
        return v
    
    @validator('application_language')
    def validate_language_code(cls, v):
        """Validate ISO language code"""
        if v not in ['en', 'de']:
            raise ValueError('Language code must be either "en" or "de"')
        return v


class CVUploadInfo(BaseModel):
    """Schema for CV file upload information"""
    filename: str = Field(..., min_length=1, max_length=255)
    original_filename: str = Field(..., min_length=1, max_length=255)
    file_size: int = Field(..., gt=0, le=10*1024*1024)  # Max 10MB
    mime_type: str = Field(..., min_length=1, max_length=100)
    file_hash: Optional[str] = Field(None, min_length=64, max_length=64)
    
    @validator('mime_type')
    def validate_mime_type(cls, v):
        """Validate allowed file types"""
        allowed_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        if v not in allowed_types:
            raise ValueError(f'File type {v} not allowed. Allowed types: PDF, DOC, DOCX')
        return v


class JobApplicationWithUpload(JobApplicationCreate):
    """Schema for job application with CV upload info"""
    cv_upload: CVUploadInfo


class JobApplicationUpdate(BaseModel):
    """Schema for updating job application (admin use)"""
    status: Optional[ApplicationStatusEnum] = None
    internal_notes: Optional[Dict[str, Any]] = None
    recruiter_rating: Optional[int] = Field(None, ge=1, le=10)
    interview_date: Optional[datetime] = None
    offer_details: Optional[Dict[str, Any]] = None
    
    @validator('recruiter_rating')
    def validate_rating(cls, v):
        """Validate rating is within acceptable range"""
        if v is not None and (v < 1 or v > 10):
            raise ValueError('Rating must be between 1 and 10')
        return v


class JobApplicationResponse(BaseModel):
    """Schema for job application response"""
    id: str
    position_title: str
    position_department: str
    position_location: Optional[str] = None
    position_type: Optional[str] = None
    
    linkedin_profile: str
    github_profile: Optional[str] = None
    
    status: ApplicationStatusEnum
    application_language: str
    
    consent_cv_sharing: bool
    consent_ai_processing: bool
    consent_communications: bool
    consent_timestamp: datetime
    
    created_at: datetime
    updated_at: Optional[datetime] = None
    submitted_at: datetime
    
    class Config:
        from_attributes = True


class JobApplicationDetailedResponse(JobApplicationResponse):
    """Detailed job application response for admin use"""
    cv_filename: str
    cv_original_filename: str
    cv_file_size: int
    cv_mime_type: str
    
    internal_notes: Optional[Dict[str, Any]] = None
    recruiter_rating: Optional[int] = None
    interview_date: Optional[datetime] = None
    offer_details: Optional[Dict[str, Any]] = None
    
    ai_analysis_results: Optional[Dict[str, Any]] = None
    ai_processing_date: Optional[datetime] = None
    
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    referrer_url: Optional[str] = None
    
    email_notifications_sent: Optional[List[Dict[str, Any]]] = []
    last_contact_date: Optional[datetime] = None
    
    data_retention_until: Optional[datetime] = None


class JobApplicationListResponse(BaseModel):
    """Schema for paginated list of job applications"""
    applications: List[JobApplicationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ApplicationStatusUpdate(BaseModel):
    """Schema for updating application status"""
    status: ApplicationStatusEnum
    status_reason: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=2000)
    notification_required: bool = False


class ApplicationConfigResponse(BaseModel):
    """Schema for application configuration"""
    file_upload: Dict[str, Any] = {
        "max_size_mb": 10,
        "allowed_extensions": [".pdf", ".doc", ".docx"],
        "allowed_mime_types": [
            "application/pdf",
            "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
    }
    
    profile_validation: Dict[str, str] = {
        "linkedin_pattern": r"^https?://(www\.)?linkedin\.com/in/[\w\-\.]+/?$",
        "github_pattern": r"^https?://(www\.)?github\.com/[\w\-\.]+/?$"
    }
    
    positions: List[Dict[str, str]] = []
    
    messages: Dict[str, Dict[str, str]] = {
        "en": {
            "upload_instructions": "Upload your CV in PDF, DOC, or DOCX format (max 10MB)",
            "linkedin_required": "LinkedIn profile is required for all applications",
            "github_optional": "GitHub profile is optional but recommended for technical roles",
            "consent_cv_sharing": "I allow voltAIc to share my CV with trusted recruitment partners to identify suitable career opportunities.",
            "consent_ai_processing": "I consent to the processing of my application materials by AI systems in the private cloud to optimize the recruitment process.",
            "consent_communications": "I would like to be informed about new job openings and the status of my application.",
            "success_message": "Your application has been submitted successfully. We'll be in touch soon!",
            "error_file_size": "File size must be less than 10MB",
            "error_file_type": "Please upload a PDF, DOC, or DOCX file",
            "error_linkedin_format": "Please enter a valid LinkedIn profile URL",
            "error_github_format": "Please enter a valid GitHub profile URL"
        },
        "de": {
            "upload_instructions": "Laden Sie Ihren Lebenslauf im PDF-, DOC- oder DOCX-Format hoch (max. 10MB)",
            "linkedin_required": "LinkedIn-Profil ist für alle Bewerbungen erforderlich",
            "github_optional": "GitHub-Profil ist optional, aber für technische Rollen empfohlen",
            "consent_cv_sharing": "Ich erlaube voltAIc, meinen Lebenslauf mit vertrauenswürdigen Recruiting-Partnern zu teilen, um passende Karrieremöglichkeiten zu finden.",
            "consent_ai_processing": "Ich stimme der Verarbeitung meiner Bewerbungsunterlagen durch KI-Systeme in der privaten Cloud zu, um den Bewerbungsprozess zu optimieren.",
            "consent_communications": "Ich möchte über neue Stellenausschreibungen und den Status meiner Bewerbung informiert werden.",
            "success_message": "Ihre Bewerbung wurde erfolgreich eingereicht. Wir melden uns bald bei Ihnen!",
            "error_file_size": "Dateigröße muss kleiner als 10MB sein",
            "error_file_type": "Bitte laden Sie eine PDF-, DOC- oder DOCX-Datei hoch",
            "error_linkedin_format": "Bitte geben Sie eine gültige LinkedIn-Profil-URL ein",
            "error_github_format": "Bitte geben Sie eine gültige GitHub-Profil-URL ein"
        }
    }


class JobApplicationSubmissionResponse(BaseModel):
    """Schema for successful application submission"""
    application_id: str
    confirmation_message: Dict[str, str] = {
        "en": "Your application has been submitted successfully. We'll review it and get back to you within 5-7 business days.",
        "de": "Ihre Bewerbung wurde erfolgreich eingereicht. Wir werden sie prüfen und uns innerhalb von 5-7 Werktagen bei Ihnen melden."
    }
    next_steps: Dict[str, str] = {
        "en": "You will receive a confirmation email shortly. Please check your spam folder if you don't see it in your inbox.",
        "de": "Sie erhalten in Kürze eine Bestätigungs-E-Mail. Bitte überprüfen Sie Ihren Spam-Ordner, falls Sie sie nicht in Ihrem Posteingang finden."
    }
    reference_number: str
    submitted_at: datetime


class ApplicationSearchFilters(BaseModel):
    """Schema for application search filters"""
    position_title: Optional[str] = None
    position_department: Optional[str] = None
    status: Optional[ApplicationStatusEnum] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    rating_min: Optional[int] = Field(None, ge=1, le=10)
    rating_max: Optional[int] = Field(None, ge=1, le=10)
    has_github_profile: Optional[bool] = None
    consent_ai_processing: Optional[bool] = None
    application_language: Optional[str] = None
    
    # Pagination
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    
    # Sorting
    sort_by: Optional[str] = Field('created_at', pattern=r'^(created_at|updated_at|status|position_title|recruiter_rating)$')
    sort_order: Optional[str] = Field('desc', pattern=r'^(asc|desc)$')


class ApplicationStatistics(BaseModel):
    """Schema for application statistics"""
    total_applications: int
    applications_by_status: Dict[str, int]
    applications_by_department: Dict[str, int]
    applications_by_month: Dict[str, int]
    average_rating: Optional[float] = None
    consent_statistics: Dict[str, int]
    top_referrer_sources: Dict[str, int]
    processing_metrics: Dict[str, Any]