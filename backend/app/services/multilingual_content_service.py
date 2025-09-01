from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, func, select
from fastapi import HTTPException
import json

from ..models.translation import (
    Translation, MultilingualContent, TranslationMemory, 
    get_localized_text, create_multilingual_field
)
# from ..models.user import AdminUser  # Will be added when needed


class MultilingualContentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.supported_languages = ['en', 'de']
        self.default_language = 'en'
    
    async def get_translation(
        self, 
        namespace: str, 
        key: str, 
        language: str = 'en',
        fallback: bool = True
    ) -> str:
        """Get translation for a specific key with fallback support"""
        
        # Try to get translation for requested language
        result = await self.db.execute(
            select(Translation).filter(
                and_(
                    Translation.namespace == namespace,
                    Translation.key == key,
                    Translation.target_language == language,
                    Translation.status.in_(['approved', 'translated'])
                )
            )
        )
        translation = result.scalar_one_or_none()
        
        if translation and translation.translated_text:
            return translation.translated_text
        
        # Fallback to English if requested and available
        if fallback and language != 'en':
            result = await self.db.execute(
                select(Translation).filter(
                    and_(
                        Translation.namespace == namespace,
                        Translation.key == key,
                        Translation.target_language == 'en',
                        Translation.status.in_(['approved', 'translated'])
                    )
                )
            )
            en_translation = result.scalar_one_or_none()
            
            if en_translation and en_translation.translated_text:
                return en_translation.translated_text
        
        # Fallback to source text if available
        result = await self.db.execute(
            select(Translation).filter(
                and_(
                    Translation.namespace == namespace,
                    Translation.key == key
                )
            )
        )
        source_translation = result.scalar_one_or_none()
        
        if source_translation and source_translation.source_text:
            return source_translation.source_text
        
        # Return key as last resort
        return key
    
    async def get_translations_batch(
        self,
        namespace: str,
        language: str = 'en',
        fallback: bool = True
    ) -> Dict[str, str]:
        """Get all translations for a namespace in specified language"""
        
        translations = {}
        
        # Get all translations for the namespace and language
        result = await self.db.execute(
            select(Translation).filter(
                and_(
                    Translation.namespace == namespace,
                    Translation.target_language == language,
                    Translation.status.in_(['approved', 'translated'])
                )
            )
        )
        results = result.scalars().all()
        
        # Build translations dictionary
        for translation in results:
            if translation.translated_text:
                translations[translation.key] = translation.translated_text
        
        # If fallback enabled and language is not English, get English fallbacks
        if fallback and language != 'en':
            missing_keys = set()
            
            # Find keys that don't have translations in target language
            result = await self.db.execute(
                select(Translation.key).filter(
                    Translation.namespace == namespace
                ).distinct()
            )
            all_keys = result.scalars().all()
            
            for key in all_keys:
                if key not in translations:
                    missing_keys.add(key)
            
            # Get English fallbacks for missing keys
            if missing_keys:
                result = await self.db.execute(
                    select(Translation).filter(
                        and_(
                            Translation.namespace == namespace,
                            Translation.key.in_(missing_keys),
                            Translation.target_language == 'en',
                            Translation.status.in_(['approved', 'translated'])
                        )
                    )
                )
                en_translations = result.scalars().all()
                
                for translation in en_translations:
                    if translation.key not in translations and translation.translated_text:
                        translations[translation.key] = translation.translated_text
        
        return translations
    
    async def create_translation(
        self,
        namespace: str,
        key: str,
        source_text: str,
        target_language: str = 'de',
        translated_text: Optional[str] = None,
        context: Optional[str] = None,
        created_by: Optional[str] = None
    ) -> str:
        """Create a new translation entry"""
        
        # Check if translation already exists
        existing = self.db.query(Translation).filter(
            and_(
                Translation.namespace == namespace,
                Translation.key == key,
                Translation.target_language == target_language
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"Translation already exists for {namespace}.{key} in {target_language}"
            )
        
        # Create new translation
        translation = Translation(
            namespace=namespace,
            key=key,
            source_text=source_text,
            target_language=target_language,
            translated_text=translated_text,
            context=context,
            status='translated' if translated_text else 'pending',
            translator_id=created_by
        )
        
        if translated_text:
            translation.translated_at = func.now()
        
        self.db.add(translation)
        self.db.commit()
        self.db.refresh(translation)
        
        return translation.id
    
    async def update_translation(
        self,
        translation_id: str,
        translated_text: str,
        status: str = 'translated',
        updated_by: Optional[str] = None
    ) -> bool:
        """Update an existing translation"""
        
        translation = self.db.query(Translation).filter(
            Translation.id == translation_id
        ).first()
        
        if not translation:
            return False
        
        translation.translated_text = translated_text
        translation.status = status
        translation.translator_id = updated_by
        
        if status == 'translated':
            translation.translated_at = func.now()
        elif status == 'approved':
            translation.reviewed_at = func.now()
            translation.reviewer_id = updated_by
        
        self.db.commit()
        return True
    
    async def get_multilingual_content(
        self,
        content_type: str,
        content_id: str,
        language: str = 'en'
    ) -> Dict[str, Any]:
        """Get multilingual content for a specific item"""
        
        results = self.db.query(MultilingualContent).filter(
            and_(
                MultilingualContent.content_type == content_type,
                MultilingualContent.content_id == content_id,
                MultilingualContent.is_active == True
            )
        ).all()
        
        content = {}
        available_languages = set()
        
        for item in results:
            available_languages.add(item.language)
            
            if item.field_name not in content:
                content[item.field_name] = {}
            
            # Determine content value based on type
            if item.json_content:
                content[item.field_name][item.language] = item.json_content
            elif item.html_content:
                content[item.field_name][item.language] = item.html_content
            else:
                content[item.field_name][item.language] = item.text_content or ''
        
        # Localize content for requested language
        localized_content = {}
        for field_name, multilingual_field in content.items():
            localized_content[field_name] = get_localized_text(multilingual_field, language)
        
        return {
            'content': localized_content,
            'raw_multilingual': content,
            'available_languages': list(available_languages),
            'current_language': language
        }
    
    async def create_multilingual_content(
        self,
        content_type: str,
        content_id: str,
        field_name: str,
        language: str,
        content: str,
        content_format: str = 'text',  # 'text', 'html', 'json'
        created_by: Optional[str] = None
    ) -> str:
        """Create multilingual content entry"""
        
        # Check if content already exists
        existing = self.db.query(MultilingualContent).filter(
            and_(
                MultilingualContent.content_type == content_type,
                MultilingualContent.content_id == content_id,
                MultilingualContent.field_name == field_name,
                MultilingualContent.language == language,
                MultilingualContent.is_active == True
            )
        ).first()
        
        if existing:
            # Update existing content
            if content_format == 'json':
                existing.json_content = json.loads(content) if isinstance(content, str) else content
            elif content_format == 'html':
                existing.html_content = content
            else:
                existing.text_content = content
            
            existing.updated_at = func.now()
            self.db.commit()
            return existing.id
        
        # Create new content
        multilingual_content = MultilingualContent(
            content_type=content_type,
            content_id=content_id,
            field_name=field_name,
            language=language,
            created_by=created_by
        )
        
        if content_format == 'json':
            multilingual_content.json_content = json.loads(content) if isinstance(content, str) else content
        elif content_format == 'html':
            multilingual_content.html_content = content
        else:
            multilingual_content.text_content = content
        
        self.db.add(multilingual_content)
        self.db.commit()
        self.db.refresh(multilingual_content)
        
        return multilingual_content.id
    
    async def get_translation_statistics(self) -> Dict[str, Any]:
        """Get translation statistics for admin dashboard"""
        
        stats = {
            'total_translations': 0,
            'by_language': {},
            'by_status': {},
            'by_namespace': {},
            'completion_rate': {}
        }
        
        # Total translations
        stats['total_translations'] = self.db.query(Translation).count()
        
        # By language
        lang_counts = self.db.query(
            Translation.target_language,
            func.count(Translation.id).label('count')
        ).group_by(Translation.target_language).all()
        
        for lang, count in lang_counts:
            stats['by_language'][lang] = count
        
        # By status
        status_counts = self.db.query(
            Translation.status,
            func.count(Translation.id).label('count')
        ).group_by(Translation.status).all()
        
        for status, count in status_counts:
            stats['by_status'][status] = count
        
        # By namespace
        namespace_counts = self.db.query(
            Translation.namespace,
            func.count(Translation.id).label('count')
        ).group_by(Translation.namespace).all()
        
        for namespace, count in namespace_counts:
            stats['by_namespace'][namespace] = count
        
        # Completion rate per language
        for lang in self.supported_languages:
            total = self.db.query(Translation).filter(
                Translation.target_language == lang
            ).count()
            
            completed = self.db.query(Translation).filter(
                and_(
                    Translation.target_language == lang,
                    Translation.status.in_(['translated', 'approved'])
                )
            ).count()
            
            stats['completion_rate'][lang] = {
                'total': total,
                'completed': completed,
                'percentage': (completed / total * 100) if total > 0 else 0
            }
        
        return stats
    
    async def search_translations(
        self,
        query: str,
        language: Optional[str] = None,
        namespace: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Search translations with filters"""
        
        # Build query
        db_query = self.db.query(Translation)
        
        # Text search in source_text, translated_text, or key
        if query:
            db_query = db_query.filter(
                or_(
                    Translation.source_text.ilike(f'%{query}%'),
                    Translation.translated_text.ilike(f'%{query}%'),
                    Translation.key.ilike(f'%{query}%')
                )
            )
        
        # Filter by language
        if language:
            db_query = db_query.filter(Translation.target_language == language)
        
        # Filter by namespace
        if namespace:
            db_query = db_query.filter(Translation.namespace == namespace)
        
        # Filter by status
        if status:
            db_query = db_query.filter(Translation.status == status)
        
        # Get total count
        total = db_query.count()
        
        # Apply pagination and get results
        translations = db_query.offset(offset).limit(limit).all()
        
        return {
            'translations': translations,
            'total': total,
            'limit': limit,
            'offset': offset,
            'has_more': total > (offset + limit)
        }