from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Numeric, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.sqlite import JSON
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.sql import func

from app.database import Base


class Translation(Base):
    __tablename__ = "translations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    namespace = Column(String(100), nullable=False, index=True)
    key = Column(String(200), nullable=False, index=True)
    source_language = Column(String(2), nullable=False, default='en')
    target_language = Column(String(2), nullable=False, index=True)
    source_text = Column(Text, nullable=False)
    translated_text = Column(Text)
    context = Column(Text)
    status = Column(String(20), nullable=False, default='pending', index=True)
    translation_method = Column(String(20), default='manual')
    confidence_score = Column(Numeric(3, 2))
    translator_id = Column(String, ForeignKey('admin_users.id'))
    reviewer_id = Column(String, ForeignKey('admin_users.id'))
    translated_at = Column(DateTime)
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships (will be set up after AdminUser is imported)
    # translator = relationship("AdminUser", foreign_keys=[translator_id])
    # reviewer = relationship("AdminUser", foreign_keys=[reviewer_id])
    
    __table_args__ = (
        # Unique constraint for namespace, key, source_language, target_language
        {'extend_existing': True}
    )
    
    def __repr__(self):
        return f"<Translation(id='{self.id}', namespace='{self.namespace}', key='{self.key}', {self.source_language}->{self.target_language})>"


class MultilingualContent(Base):
    __tablename__ = "multilingual_content"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    content_type = Column(String(50), nullable=False)  # 'page', 'post', 'email_template', etc.
    content_id = Column(String, nullable=False)  # Reference to the actual content
    field_name = Column(String(100), nullable=False)  # 'title', 'content', 'description', etc.
    language = Column(String(2), nullable=False, index=True)
    text_content = Column(Text)
    html_content = Column(Text)
    json_content = Column(JSON)  # For structured content
    is_active = Column(Boolean, default=True)
    version = Column(Integer, default=1)
    created_by = Column(String, ForeignKey('admin_users.id'))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships (will be set up after AdminUser is imported)
    # creator = relationship("AdminUser")
    
    __table_args__ = (
        # Unique constraint for content_type, content_id, field_name, language
        {'extend_existing': True}
    )
    
    def __repr__(self):
        return f"<MultilingualContent(id='{self.id}', type='{self.content_type}', lang='{self.language}')>"


class TranslationMemory(Base):
    __tablename__ = "translation_memory"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_text = Column(Text, nullable=False, index=True)
    translated_text = Column(Text, nullable=False)
    source_language = Column(String(2), nullable=False)
    target_language = Column(String(2), nullable=False)
    domain = Column(String(50))  # 'business', 'technical', 'marketing', etc.
    context = Column(Text)
    quality_score = Column(Numeric(3, 2))  # 0.00 to 1.00
    usage_count = Column(Integer, default=0)
    last_used = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"<TranslationMemory(id='{self.id}', {self.source_language}->{self.target_language}, quality={self.quality_score})>"


class LanguagePreference(Base):
    __tablename__ = "language_preferences"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('admin_users.id'))  # For admin users
    session_id = Column(String, index=True)  # For anonymous users
    preferred_language = Column(String(2), nullable=False)
    fallback_language = Column(String(2), default='en')
    auto_detect = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships (will be set up after AdminUser is imported)
    # user = relationship("AdminUser")
    
    def __repr__(self):
        return f"<LanguagePreference(id='{self.id}', lang='{self.preferred_language}')>"


# Utility functions for multilingual content
def create_multilingual_field(content: Dict[str, str]) -> Dict[str, str]:
    """Create a multilingual field ensuring English is present"""
    if not isinstance(content, dict):
        return {'en': str(content)}
    
    if 'en' not in content or not content['en']:
        raise ValueError("English content is required for multilingual fields")
    
    return content


def get_localized_text(multilingual_field: Dict[str, str], language: str = 'en') -> str:
    """Get text in requested language with English fallback"""
    if not multilingual_field:
        return ''
    
    if not isinstance(multilingual_field, dict):
        return str(multilingual_field)
    
    # Try requested language first
    if language in multilingual_field and multilingual_field[language]:
        return multilingual_field[language]
    
    # Fallback to English
    return multilingual_field.get('en', '')


def get_available_languages(multilingual_field: Dict[str, str]) -> list:
    """Get list of available languages for content"""
    if not multilingual_field or not isinstance(multilingual_field, dict):
        return ['en']
    
    return [lang for lang, text in multilingual_field.items() if text and text.strip()]


class TranslatedText:
    """Type hint for multilingual text fields"""
    def __init__(self, content: Dict[str, str]):
        self.content = create_multilingual_field(content)
    
    def get(self, language: str = 'en') -> str:
        return get_localized_text(self.content, language)
    
    def set(self, language: str, text: str):
        self.content[language] = text
    
    def available_languages(self) -> list:
        return get_available_languages(self.content)
    
    def to_dict(self) -> Dict[str, str]:
        return self.content.copy()