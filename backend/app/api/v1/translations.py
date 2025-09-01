from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from ...database import get_db
from ...services.multilingual_content_service import MultilingualContentService
from ...services.ai_translation_service import AITranslationService
from ...middleware.language_detection import get_current_language
from ...models.admin_user import get_current_admin_user, AdminUser


router = APIRouter()


# Pydantic models for request/response
class TranslationCreateRequest(BaseModel):
    namespace: str
    key: str
    source_text: str
    target_language: str = 'de'
    translated_text: Optional[str] = None
    context: Optional[str] = None


class TranslationUpdateRequest(BaseModel):
    translated_text: str
    status: str = 'translated'


class AITranslationRequest(BaseModel):
    text: str
    source_language: str = 'en'
    target_language: str = 'de'
    context: Optional[str] = None
    domain: str = 'business'


class BatchTranslationRequest(BaseModel):
    texts: List[Dict[str, str]]
    source_language: str = 'en'
    target_language: str = 'de'
    context: Optional[str] = None


class TranslationResponse(BaseModel):
    id: str
    namespace: str
    key: str
    source_text: str
    translated_text: Optional[str]
    target_language: str
    status: str
    created_at: str
    updated_at: str


# Public endpoints (no auth required)
@router.get("/public/translations/{namespace}")
async def get_public_translations(
    namespace: str,
    language: str = Depends(get_current_language),
    db: Session = Depends(get_db)
):
    """Get public translations for a namespace (for frontend use)"""
    service = MultilingualContentService(db)
    
    translations = await service.get_translations_batch(
        namespace=namespace,
        language=language,
        fallback=True
    )
    
    return {
        'success': True,
        'data': {
            'translations': translations,
            'language': language,
            'namespace': namespace
        }
    }


@router.get("/public/translation/{namespace}/{key}")
async def get_public_translation(
    namespace: str,
    key: str,
    language: str = Depends(get_current_language),
    db: Session = Depends(get_db)
):
    """Get a specific translation"""
    service = MultilingualContentService(db)
    
    translation = await service.get_translation(
        namespace=namespace,
        key=key,
        language=language,
        fallback=True
    )
    
    return {
        'success': True,
        'data': {
            'translation': translation,
            'language': language,
            'namespace': namespace,
            'key': key
        }
    }


# Admin endpoints (require authentication)
@router.get("/admin/translations")
async def get_translations(
    namespace: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_user: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get translations with filtering and pagination"""
    service = MultilingualContentService(db)
    
    result = await service.search_translations(
        query=query,
        language=language,
        namespace=namespace,
        status=status,
        limit=limit,
        offset=offset
    )
    
    return {
        'success': True,
        'data': result
    }


@router.post("/admin/translations")
async def create_translation(
    request: TranslationCreateRequest,
    current_user: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new translation"""
    service = MultilingualContentService(db)
    
    try:
        translation_id = await service.create_translation(
            namespace=request.namespace,
            key=request.key,
            source_text=request.source_text,
            target_language=request.target_language,
            translated_text=request.translated_text,
            context=request.context,
            created_by=current_user.id
        )
        
        return {
            'success': True,
            'data': {
                'translation_id': translation_id,
                'message': 'Translation created successfully'
            }
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/admin/translations/{translation_id}")
async def update_translation(
    translation_id: str,
    request: TranslationUpdateRequest,
    current_user: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an existing translation"""
    service = MultilingualContentService(db)
    
    success = await service.update_translation(
        translation_id=translation_id,
        translated_text=request.translated_text,
        status=request.status,
        updated_by=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Translation not found")
    
    return {
        'success': True,
        'data': {
            'message': 'Translation updated successfully'
        }
    }


@router.post("/admin/translations/ai-translate")
async def ai_translate_text(
    request: AITranslationRequest,
    current_user: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Translate text using AI"""
    ai_service = AITranslationService(db)
    
    result = await ai_service.translate_text(
        text=request.text,
        source_language=request.source_language,
        target_language=request.target_language,
        context=request.context,
        domain=request.domain
    )
    
    if not result.get('success', False):
        raise HTTPException(
            status_code=500,
            detail=result.get('error', 'Translation failed')
        )
    
    return {
        'success': True,
        'data': result
    }


@router.post("/admin/translations/batch-translate")
async def batch_translate_texts(
    request: BatchTranslationRequest,
    current_user: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Translate multiple texts using AI"""
    ai_service = AITranslationService(db)
    
    results = await ai_service.batch_translate(
        texts=request.texts,
        source_language=request.source_language,
        target_language=request.target_language,
        context=request.context
    )
    
    return {
        'success': True,
        'data': {
            'results': results,
            'total': len(results),
            'successful': len([r for r in results if r.get('success', False)]),
            'failed': len([r for r in results if not r.get('success', False)])
        }
    }


@router.get("/admin/translations/statistics")
async def get_translation_statistics(
    current_user: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get translation statistics for admin dashboard"""
    service = MultilingualContentService(db)
    
    stats = await service.get_translation_statistics()
    
    return {
        'success': True,
        'data': stats
    }


@router.get("/admin/multilingual-content/{content_type}/{content_id}")
async def get_multilingual_content(
    content_type: str,
    content_id: str,
    language: str = Query('en'),
    current_user: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get multilingual content for a specific item"""
    service = MultilingualContentService(db)
    
    content = await service.get_multilingual_content(
        content_type=content_type,
        content_id=content_id,
        language=language
    )
    
    return {
        'success': True,
        'data': content
    }


@router.post("/admin/multilingual-content")
async def create_multilingual_content(
    content_type: str,
    content_id: str,
    field_name: str,
    language: str,
    content: str,
    content_format: str = 'text',
    current_user: AdminUser = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create multilingual content entry"""
    service = MultilingualContentService(db)
    
    content_id = await service.create_multilingual_content(
        content_type=content_type,
        content_id=content_id,
        field_name=field_name,
        language=language,
        content=content,
        content_format=content_format,
        created_by=current_user.id
    )
    
    return {
        'success': True,
        'data': {
            'content_id': content_id,
            'message': 'Multilingual content created successfully'
        }
    }