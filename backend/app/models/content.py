from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    
    # Multilingual content stored as JSON (English required)
    title = Column(JSON, nullable=False)  # {"en": "Title", "de": "Titel"}
    content = Column(JSON, nullable=False)  # {"en": "Content", "de": "Inhalt"}
    excerpt = Column(JSON)  # {"en": "Excerpt", "de": "Auszug"}
    meta_description = Column(JSON)  # JSON for SEO descriptions
    
    # Block-based content structure for flexible layouts
    content_blocks = Column(JSON)  # {"en": [{"_type": "hero", "props": {...}}, ...], "de": [...]}
    layout_config = Column(JSON)  # Layout metadata: {"template": "default", "responsive": true, "theme": "light"}
    
    # Page Configuration
    template = Column(String(50), default='default')
    content_format = Column(String(20), nullable=False, default='legacy', index=True)  # 'legacy', 'blocks', 'portable_text'
    status = Column(String(20), nullable=False, default='draft', index=True)
    is_featured = Column(Boolean, default=False, index=True)
    sort_order = Column(Integer, default=0)
    
    # SEO & Marketing
    seo_title = Column(JSON)  # JSON for SEO titles
    seo_keywords = Column(JSON)  # JSON for SEO keywords
    canonical_url = Column(String(500))
    
    # Publishing
    published_at = Column(DateTime(timezone=True), index=True)
    author_id = Column(Integer, ForeignKey("admin_users.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))

    # Relationships
    author = relationship("AdminUser", backref="authored_pages")


class MediaFile(Base):
    __tablename__ = "media_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False, index=True)
    file_hash = Column(String(64), nullable=False, index=True)  # SHA-256 hash
    
    # Metadata
    title = Column(JSON)  # JSON for multilingual titles
    alt_text = Column(JSON)  # JSON for multilingual alt text
    description = Column(JSON)  # JSON for multilingual descriptions
    
    # Image-specific metadata (JSON)
    image_metadata = Column(JSON)  # {"width": 1920, "height": 1080, "format": "JPEG"}
    
    # Organization
    folder = Column(String(255), default='/')
    tags = Column(JSON)  # JSON array of tags
    
    # Upload Information
    uploaded_by = Column(Integer, ForeignKey("admin_users.id"))
    upload_ip = Column(String(45))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))

    # Relationships
    uploader = relationship("AdminUser", backref="uploaded_files")