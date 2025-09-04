from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class WhitepaperStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class WhitepaperCategory(str, Enum):
    CASE_STUDY = "case-study"
    GUIDE = "guide" 
    REPORT = "report"
    RESEARCH = "research"
    BEST_PRACTICES = "best-practices"


class WhitepaperBase(BaseModel):
    title: Dict[str, str] = Field(..., description="Multilingual title")
    description: Dict[str, str] = Field(..., description="Multilingual description")
    slug: str = Field(..., description="URL slug")
    category: Optional[WhitepaperCategory] = None
    tags: Optional[List[str]] = []
    industry: Optional[List[str]] = []
    preview_content: Optional[Dict[str, str]] = None
    meta_title: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    featured: bool = False
    requires_registration: bool = True
    lead_magnet_active: bool = True


class WhitepaperCreate(WhitepaperBase):
    file_id: int = Field(..., description="Media file ID for the PDF")
    thumbnail_id: Optional[int] = None
    author_id: int = Field(..., description="Admin user ID")


class WhitepaperUpdate(BaseModel):
    title: Optional[Dict[str, str]] = None
    description: Optional[Dict[str, str]] = None
    slug: Optional[str] = None
    category: Optional[WhitepaperCategory] = None
    tags: Optional[List[str]] = None
    industry: Optional[List[str]] = None
    preview_content: Optional[Dict[str, str]] = None
    meta_title: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    featured: Optional[bool] = None
    requires_registration: Optional[bool] = None
    lead_magnet_active: Optional[bool] = None
    status: Optional[WhitepaperStatus] = None
    file_id: Optional[int] = None
    thumbnail_id: Optional[int] = None
    sort_order: Optional[int] = None


class WhitepaperResponse(BaseModel):
    id: int
    title: Dict[str, str]
    description: Dict[str, str]
    slug: str
    category: Optional[str]
    tags: Optional[List[str]]
    industry: Optional[List[str]]
    preview_content: Optional[Dict[str, str]]
    meta_title: Optional[Dict[str, str]]
    meta_description: Optional[Dict[str, str]]
    status: str
    featured: bool
    requires_registration: bool
    lead_magnet_active: bool
    sort_order: int
    published_at: Optional[datetime]
    download_count: int
    view_count: int
    created_at: datetime
    updated_at: Optional[datetime]
    file_id: int
    thumbnail_id: Optional[int]
    author_id: int

    class Config:
        from_attributes = True


class WhitepaperPublicResponse(BaseModel):
    """Public response for whitepaper listings - no sensitive data"""
    id: int
    title: Dict[str, str]
    description: Dict[str, str]
    slug: str
    category: Optional[str]
    tags: Optional[List[str]]
    industry: Optional[List[str]]
    preview_content: Optional[Dict[str, str]]
    meta_title: Optional[Dict[str, str]]
    meta_description: Optional[Dict[str, str]]
    featured: bool
    requires_registration: bool
    published_at: Optional[datetime]
    download_count: int
    view_count: int
    thumbnail_id: Optional[int]

    class Config:
        from_attributes = True


class WhitepaperDownloadRequest(BaseModel):
    """Request to download a whitepaper"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    company: Optional[str] = Field(None, max_length=255)
    job_title: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    utm_source: Optional[str] = Field(None, max_length=100)
    utm_medium: Optional[str] = Field(None, max_length=100)
    utm_campaign: Optional[str] = Field(None, max_length=100)

    @validator('phone')
    def validate_phone(cls, v):
        if v and len(v.strip()) == 0:
            return None
        return v


class WhitepaperDownloadResponse(BaseModel):
    """Response after requesting a whitepaper download"""
    message: str
    validation_required: bool
    download_id: int


class EmailValidationRequest(BaseModel):
    """Request to validate email for whitepaper download"""
    token: str = Field(..., min_length=1)


class EmailValidationResponse(BaseModel):
    """Response after email validation"""
    success: bool
    message: str
    download_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class WhitepaperDownloadLinkResponse(BaseModel):
    """Response containing secure download link"""
    download_url: str
    expires_at: datetime
    downloads_remaining: int


class WhitepaperStats(BaseModel):
    """Statistics for a whitepaper"""
    whitepaper_id: int
    title: Dict[str, str]
    total_downloads: int
    unique_downloads: int
    download_requests: int
    validation_rate: float
    top_companies: List[Dict[str, Any]]
    top_industries: List[Dict[str, Any]]
    monthly_downloads: List[Dict[str, Any]]


class WhitepaperDownloadRecord(BaseModel):
    """Individual download record for analytics"""
    id: int
    whitepaper_id: int
    first_name: str
    last_name: str
    email: str
    company: Optional[str]
    job_title: Optional[str]
    phone: Optional[str]
    email_validated: bool
    download_count: int
    download_limit: int
    requested_at: datetime
    email_validated_at: Optional[datetime]
    downloaded_at: Optional[datetime]
    download_source: Optional[str]
    utm_source: Optional[str]
    utm_medium: Optional[str]
    utm_campaign: Optional[str]

    class Config:
        from_attributes = True