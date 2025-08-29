from pydantic import BaseModel, validator
from typing import Dict, Optional, Any, List
from datetime import datetime
from .content_blocks import ContentBlockType, MultilingualPageContent, LayoutConfig, validate_content_blocks


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
    content: Optional[Dict[str, str]] = None  # Legacy content format
    content_blocks: Optional[Dict[str, List[Dict[str, Any]]]] = None  # New block format
    excerpt: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    template: str = "default"
    content_format: str = "legacy"  # 'legacy', 'blocks', 'portable_text'
    layout_config: Optional[Dict[str, Any]] = None
    status: str = "draft"
    is_featured: bool = False
    seo_title: Optional[Dict[str, str]] = None
    seo_keywords: Optional[Dict[str, str]] = None
    canonical_url: Optional[str] = None
    
    @validator('title')
    def validate_title_required(cls, v):
        if not isinstance(v, dict) or 'en' not in v or not v['en'].strip():
            raise ValueError('English title is required')
        return v
    
    @validator('content_blocks')
    def validate_content_blocks_format(cls, v, values):
        if v is None:
            return v
        
        # Validate structure
        if not isinstance(v, dict) or 'en' not in v:
            raise ValueError('Content blocks must include English version')
        
        # Validate English blocks
        try:
            validate_content_blocks(v['en'])
        except Exception as e:
            raise ValueError(f'Invalid English content blocks: {str(e)}')
        
        # Validate German blocks if provided
        if 'de' in v and v['de']:
            try:
                validate_content_blocks(v['de'])
            except Exception as e:
                raise ValueError(f'Invalid German content blocks: {str(e)}')
        
        return v
    
    @validator('layout_config')
    def validate_layout_config(cls, v):
        if v is None:
            return v
        try:
            LayoutConfig(**v)
        except Exception as e:
            raise ValueError(f'Invalid layout config: {str(e)}')
        return v


class PageUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[Dict[str, str]] = None
    content: Optional[Dict[str, str]] = None
    content_blocks: Optional[Dict[str, List[Dict[str, Any]]]] = None
    excerpt: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    template: Optional[str] = None
    content_format: Optional[str] = None
    layout_config: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    seo_title: Optional[Dict[str, str]] = None
    seo_keywords: Optional[Dict[str, str]] = None
    canonical_url: Optional[str] = None
    
    @validator('content_blocks')
    def validate_content_blocks_format(cls, v):
        if v is None:
            return v
        
        if not isinstance(v, dict) or 'en' not in v:
            raise ValueError('Content blocks must include English version')
        
        try:
            validate_content_blocks(v['en'])
            if 'de' in v and v['de']:
                validate_content_blocks(v['de'])
        except Exception as e:
            raise ValueError(f'Invalid content blocks: {str(e)}')
        
        return v


class PageResponse(BaseModel):
    id: int
    slug: str
    title: Dict[str, str]
    content: Optional[Dict[str, str]] = None  # Legacy content
    content_blocks: Optional[Dict[str, List[Dict[str, Any]]]] = None  # Block content
    excerpt: Optional[Dict[str, str]] = None
    meta_description: Optional[Dict[str, str]] = None
    template: str
    content_format: str
    layout_config: Optional[Dict[str, Any]] = None
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