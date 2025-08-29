from pydantic import BaseModel, EmailStr, validator
from typing import Dict, Optional, List
from datetime import datetime


class WebinarCreate(BaseModel):
    title: Dict[str, str]  # {"en": "Title", "de": "Titel"}
    description: Optional[Dict[str, str]] = None
    slug: str
    scheduled_at: datetime
    duration_minutes: int = 60
    timezone: str = "UTC"
    max_participants: Optional[int] = None
    meeting_url: Optional[str] = None
    presenter_name: Optional[str] = None
    presenter_bio: Optional[Dict[str, str]] = None
    registration_enabled: bool = True
    registration_deadline: Optional[datetime] = None
    
    @validator('title')
    def validate_title(cls, v):
        if not isinstance(v, dict) or 'en' not in v or not v['en'].strip():
            raise ValueError('English title is required')
        return v


class WebinarUpdate(BaseModel):
    title: Optional[Dict[str, str]] = None
    description: Optional[Dict[str, str]] = None
    slug: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    timezone: Optional[str] = None
    max_participants: Optional[int] = None
    meeting_url: Optional[str] = None
    recording_url: Optional[str] = None
    presenter_name: Optional[str] = None
    presenter_bio: Optional[Dict[str, str]] = None
    status: Optional[str] = None
    registration_enabled: Optional[bool] = None
    registration_deadline: Optional[datetime] = None


class WebinarResponse(BaseModel):
    id: int
    title: Dict[str, str]
    description: Optional[Dict[str, str]] = None
    slug: str
    scheduled_at: datetime
    duration_minutes: int
    timezone: str
    max_participants: Optional[int] = None
    meeting_url: Optional[str] = None
    recording_url: Optional[str] = None
    presenter_name: Optional[str] = None
    presenter_bio: Optional[Dict[str, str]] = None
    status: str
    registration_enabled: bool
    registration_deadline: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WebinarRegistrationCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


class WebinarRegistrationResponse(BaseModel):
    id: int
    webinar_id: int
    first_name: str
    last_name: str
    email: str
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    attended: bool
    registered_at: datetime

    class Config:
        from_attributes = True


class WhitepaperCreate(BaseModel):
    title: Dict[str, str]
    description: Optional[Dict[str, str]] = None
    slug: str
    preview_content: Optional[Dict[str, str]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    industry: Optional[List[str]] = None
    requires_registration: bool = True
    meta_title: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    status: str = "draft"
    featured: bool = False
    
    @validator('title')
    def validate_title(cls, v):
        if not isinstance(v, dict) or 'en' not in v or not v['en'].strip():
            raise ValueError('English title is required')
        return v


class WhitepaperUpdate(BaseModel):
    title: Optional[Dict[str, str]] = None
    description: Optional[Dict[str, str]] = None
    slug: Optional[str] = None
    preview_content: Optional[Dict[str, str]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    industry: Optional[List[str]] = None
    requires_registration: Optional[bool] = None
    meta_title: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    status: Optional[str] = None
    featured: Optional[bool] = None


class WhitepaperResponse(BaseModel):
    id: int
    title: Dict[str, str]
    description: Optional[Dict[str, str]] = None
    slug: str
    preview_content: Optional[Dict[str, str]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    status: str
    featured: bool
    download_count: int
    view_count: int
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WhitepaperDownloadCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


class BookAMeetingCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    meeting_type: str
    preferred_date: datetime
    duration_minutes: int = 30
    timezone: str = "UTC"
    subject: Optional[Dict[str, str]] = None
    message: Optional[Dict[str, str]] = None
    budget_range: Optional[str] = None
    urgency: Optional[str] = "medium"
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


class BookAMeetingUpdate(BaseModel):
    status: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    meeting_url: Optional[str] = None
    meeting_notes: Optional[str] = None
    follow_up_required: Optional[bool] = None
    assigned_to: Optional[int] = None


class BookAMeetingResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    meeting_type: str
    preferred_date: datetime
    duration_minutes: int
    timezone: str
    subject: Optional[Dict[str, str]] = None
    message: Optional[Dict[str, str]] = None
    status: str
    lead_score: int
    created_at: datetime

    class Config:
        from_attributes = True