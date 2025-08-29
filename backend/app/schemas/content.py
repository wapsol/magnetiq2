from pydantic import BaseModel, validator
from typing import Dict, Optional, Any
from datetime import datetime


class MultilingualText(BaseModel):
    """Base model for multilingual text fields"""
    en: str  # English is required
    de: Optional[str] = None  # German is optional
    
    @validator('en')
    def en_required(cls, v):
        if not v or not v.strip():
            raise ValueError('English text is required')
        return v.strip()


class PageCreate(BaseModel):
    slug: str
    title: Dict[str, str]  # {"en": "Title", "de": "Titel"}
    content: Dict[str, str]  # {"en": "Content", "de": "Inhalt"}
    excerpt: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    template: str = "default"
    status: str = "draft"
    is_featured: bool = False
    seo_title: Optional[Dict[str, str]] = None
    seo_keywords: Optional[Dict[str, str]] = None
    canonical_url: Optional[str] = None
    
    @validator('title', 'content')
    def validate_required_multilingual(cls, v):
        if not isinstance(v, dict) or 'en' not in v or not v['en'].strip():
            raise ValueError('English version is required')
        return v


class PageUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[Dict[str, str]] = None
    content: Optional[Dict[str, str]] = None
    excerpt: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    template: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    seo_title: Optional[Dict[str, str]] = None
    seo_keywords: Optional[Dict[str, str]] = None
    canonical_url: Optional[str] = None


class PageResponse(BaseModel):
    id: int
    slug: str
    title: Dict[str, str]
    content: Dict[str, str]
    excerpt: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    template: str
    status: str
    is_featured: bool
    sort_order: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PageListResponse(BaseModel):
    id: int
    slug: str
    title: Dict[str, str]
    excerpt: Optional[Dict[str, str]] = None
    status: str
    is_featured: bool
    published_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MediaFileCreate(BaseModel):
    title: Optional[Dict[str, str]] = None
    alt_text: Optional[Dict[str, str]] = None
    description: Optional[Dict[str, str]] = None
    folder: str = "/"
    tags: Optional[list] = None


class MediaFileResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    title: Optional[Dict[str, str]] = None
    alt_text: Optional[Dict[str, str]] = None
    description: Optional[Dict[str, str]] = None
    folder: str
    tags: Optional[list] = None
    image_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True