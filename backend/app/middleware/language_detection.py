from fastapi import Request, Response
from typing import List, Tuple, Optional
import re
from starlette.middleware.base import BaseHTTPMiddleware


class LanguageDetectionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, default_language: str = 'en', supported_languages: List[str] = None):
        super().__init__(app)
        self.default_language = default_language
        self.supported_languages = supported_languages or ['en', 'de']
    
    async def dispatch(self, request: Request, call_next):
        # Detect language using priority order:
        # 1. URL path parameter (/de/page)
        # 2. Accept-Language header
        # 3. User preference from cookie
        # 4. Default language
        
        detected_language = self.detect_language(request)
        
        # Add language to request state
        if not hasattr(request, 'state'):
            request.state = type('State', (), {})()
        request.state.language = detected_language
        
        # Process request
        response = await call_next(request)
        
        # Set language preference cookie if not already set
        if request.cookies.get('language') != detected_language:
            response.set_cookie(
                key='language',
                value=detected_language,
                max_age=30 * 24 * 60 * 60,  # 30 days
                httponly=True,
                secure=True,
                samesite='lax'
            )
        
        return response
    
    def detect_language(self, request: Request) -> str:
        """Detect user's preferred language using multiple methods"""
        
        # Method 1: Check URL path first (/de/page, /en/page)
        path_language = self.extract_language_from_path(request.url.path)
        if path_language and path_language in self.supported_languages:
            return path_language
        
        # Method 2: Check Accept-Language header
        accept_language = request.headers.get('Accept-Language', '')
        header_language = self.parse_accept_language(accept_language)
        if header_language and header_language in self.supported_languages:
            return header_language
        
        # Method 3: Check user preference cookie
        cookie_language = request.cookies.get('language')
        if cookie_language and cookie_language in self.supported_languages:
            return cookie_language
        
        # Method 4: Fallback to default
        return self.default_language
    
    def extract_language_from_path(self, path: str) -> Optional[str]:
        """Extract language code from URL path like /de/page or /en/page"""
        match = re.match(r'^/([a-z]{2})(?:/|$)', path)
        if match:
            lang = match.group(1)
            return lang if lang in self.supported_languages else None
        return None
    
    def parse_accept_language(self, accept_language: str) -> Optional[str]:
        """Parse Accept-Language header and return best supported match"""
        if not accept_language:
            return None
        
        languages = []
        
        # Parse language preferences with quality values
        for lang_tag in accept_language.split(','):
            parts = lang_tag.strip().split(';')
            lang = parts[0].strip().lower()
            quality = 1.0
            
            # Parse quality value (q=0.8)
            if len(parts) > 1:
                for part in parts[1:]:
                    if part.strip().startswith('q='):
                        try:
                            quality = float(part.strip()[2:])
                        except ValueError:
                            pass
                        break
            
            # Extract primary language code (en-US -> en)
            primary_lang = lang.split('-')[0]
            if primary_lang in self.supported_languages:
                languages.append((primary_lang, quality))
        
        # Return language with highest quality score
        if languages:
            languages.sort(key=lambda x: x[1], reverse=True)
            return languages[0][0]
        
        return None


def get_current_language(request: Request) -> str:
    """Helper function to get current language from request"""
    return getattr(request.state, 'language', 'en')


def get_supported_languages() -> List[str]:
    """Get list of supported languages"""
    return ['en', 'de']


def is_language_supported(language: str) -> bool:
    """Check if language is supported"""
    return language in get_supported_languages()