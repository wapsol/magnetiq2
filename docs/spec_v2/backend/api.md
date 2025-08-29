# Magnetiq v2 - Backend API Specification

## Overview

The Magnetiq v2 backend is a streamlined, production-ready API built with Python and FastAPI. It provides secure, RESTful endpoints for all system functionality including authentication, content management, communications and business operations using a simple SQLite database.

## Technical Foundation

### Technology Stack
- **Framework**: FastAPI 0.104+ with async/await
- **Python Version**: 3.11+
- **ASGI Server**: Uvicorn with Gunicorn workers
- **ORM**: SQLAlchemy 2.0 with async support
- **Database**: SQLite (all environments)
- **Content Format**: PortableText for structured content
- **Validation**: Pydantic v2 with JSON Schema + PortableText validation
- **Authentication**: JWT with HS256 algorithm
- **Documentation**: Auto-generated OpenAPI 3.0

### Port Configuration
- **Development**: Port 3036 (unified backend port)
- **Production**: Port 3036 (behind Nginx reverse proxy)
- **Health Checks**: Dedicated endpoints with basic dependency monitoring
- **API Documentation**: Swagger UI available at `/docs`

### Project Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Configuration management  
│   ├── database.py          # SQLite database setup and connection
│   ├── dependencies.py      # Dependency injection
│   ├── exceptions.py        # Custom exception handlers
│   ├── middleware.py        # Custom middleware
│   ├── api/                 # API routes (all under /api/)
│   │   ├── v1/
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── content/     # Content management
│   │   │   ├── business/    # Business features
│   │   │   ├── communication/ # Communication services
│   │   │   │   ├── email/   # Email marketing
│   │   │   │   ├── linkedin/# LinkedIn integration
│   │   │   │   └── twitter/ # Twitter/X integration
│   │   │   ├── admin/       # Admin panel APIs
│   │   │   └── public/      # Public-facing APIs
│   ├── core/                # Core functionality
│   │   ├── auth.py          # Authentication logic
│   │   ├── permissions.py   # RBAC implementation
│   │   ├── security.py      # Security utilities
│   │   └── logging.py       # Logging configuration
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic request/response models
│   ├── services/            # Business logic services
│   └── utils/               # Shared utilities
├── migrations/              # Alembic database migrations
├── tests/                   # Test suites
├── requirements.txt         # Python dependencies
└── alembic.ini             # Database migration configuration
```

## Database Configuration

### SQLite Setup
```python
# database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite with WAL mode for better concurrency
DATABASE_URL = "sqlite+aiosqlite:///./magnetiq.db"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL logging in development
    connect_args={
        "check_same_thread": False,
        "timeout": 30,
    }
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession
)

Base = declarative_base()

# Enable WAL mode for better concurrent performance
async def enable_wal_mode():
    async with engine.begin() as conn:
        await conn.execute(text("PRAGMA journal_mode=WAL;"))
        await conn.execute(text("PRAGMA foreign_keys=ON;"))
        await conn.execute(text("PRAGMA synchronous=NORMAL;"))
```

### Database Management
- **Migrations**: Alembic for schema version control
- **Connections**: Connection pooling via SQLAlchemy
- **Transactions**: Async transaction support
- **Backup**: Simple file-based backup strategy
- **Maintenance**: Regular VACUUM operations for optimization

## API Architecture

### Service Dependency Map
![Service Layer Dependencies](../../diagrams/assets/shorts/service_layer_dependencies.png)

The service layer implements a clean dependency injection pattern using FastAPI's `Depends()` system, with clear separation between API endpoints, service logic, repository patterns, and cross-cutting concerns.

### Request Lifecycle
![Request Lifecycle Dependencies](../../diagrams/assets/shorts/request_lifecycle_dependencies.png)

Each request flows through middleware, dependency injection, business logic, and response processing with proper error handling at each stage.

### Base URL Structure
- **Development**: `http://localhost:3036/api/v1/`
- **Production**: `https://api.voltAIc.systems/api/v1/`

### Admin Authentication Endpoints
```
POST   /api/v1/admin/auth/login     # Admin login
POST   /api/v1/admin/auth/refresh   # Admin token refresh
POST   /api/v1/admin/auth/logout    # Admin logout
GET    /api/v1/admin/auth/me        # Get current admin profile
POST   /api/v1/admin/auth/change-password # Admin password change
```

**Note**: The public frontend operates without authentication. All authentication endpoints are for admin panel access only. For detailed admin authentication specifications, see: `/frontend/adminpanel/authentication.md`

### Content Management Endpoints
```
GET    /api/v1/content/pages        # List pages
POST   /api/v1/content/pages        # Create page (with PortableText)
GET    /api/v1/content/pages/{id}   # Get page details
PUT    /api/v1/content/pages/{id}   # Update page (with PortableText)
DELETE /api/v1/content/pages/{id}   # Delete page (soft delete)

# PortableText Serialization
GET    /api/v1/content/pages/{id}/html        # Get page as HTML
GET    /api/v1/content/pages/{id}/markdown    # Get page as Markdown
GET    /api/v1/content/pages/{id}/plain-text  # Get page as plain text

GET    /api/v1/content/media        # List media files
POST   /api/v1/content/media        # Upload media
DELETE /api/v1/content/media/{id}   # Delete media file

# PortableText Assets
GET    /api/v1/content/portable-assets       # List PortableText-referenced assets
POST   /api/v1/content/portable-assets       # Upload assets for PortableText blocks
```

### Business Operations Endpoints
```
# Webinars
GET    /api/v1/business/webinars              # List webinars
POST   /api/v1/business/webinars              # Create webinar (with PortableText)
GET    /api/v1/business/webinars/{id}         # Get webinar details
POST   /api/v1/business/webinars/{id}/register # Register for webinar
GET    /api/v1/business/webinars/{id}/description-html # Get description as HTML

# Whitepapers
GET    /api/v1/business/whitepapers           # List whitepapers
POST   /api/v1/business/whitepapers           # Create whitepaper (with PortableText)
GET    /api/v1/business/whitepapers/{id}      # Get whitepaper
POST   /api/v1/business/whitepapers/{id}/download # Download with lead capture
GET    /api/v1/business/whitepapers/{id}/preview  # Get PortableText preview content

# Bookings
GET    /api/v1/business/bookings              # List bookings
POST   /api/v1/business/bookings              # Create booking (with PortableText messages)
GET    /api/v1/business/bookings/{id}         # Get booking details
PUT    /api/v1/business/bookings/{id}         # Update booking status
GET    /api/v1/business/bookings/{id}/message-html # Get message as HTML
```

### Communication Services Endpoints

#### Email Marketing
```
GET    /api/v1/communication/email/campaigns           # List email campaigns
POST   /api/v1/communication/email/campaigns           # Create email campaign  
GET    /api/v1/communication/email/campaigns/{id}      # Get campaign details
PUT    /api/v1/communication/email/campaigns/{id}      # Update campaign
DELETE /api/v1/communication/email/campaigns/{id}      # Delete campaign
POST   /api/v1/communication/email/campaigns/{id}/send # Send campaign

GET    /api/v1/communication/email/templates           # List email templates
POST   /api/v1/communication/email/templates           # Create email template (with PortableText)
GET    /api/v1/communication/email/templates/{id}      # Get template
PUT    /api/v1/communication/email/templates/{id}      # Update template (with PortableText)
DELETE /api/v1/communication/email/templates/{id}      # Delete template
GET    /api/v1/communication/email/templates/{id}/html # Render template as HTML
POST   /api/v1/communication/email/templates/{id}/preview # Preview template with data
```

#### LinkedIn Integration
```
GET    /api/v1/communication/linkedin/accounts         # List connected LinkedIn accounts
POST   /api/v1/communication/linkedin/accounts         # Connect LinkedIn account
DELETE /api/v1/communication/linkedin/accounts/{id}    # Disconnect account

GET    /api/v1/communication/linkedin/content          # List LinkedIn posts
POST   /api/v1/communication/linkedin/content          # Create LinkedIn post (with PortableText)
GET    /api/v1/communication/linkedin/content/{id}     # Get post details
PUT    /api/v1/communication/linkedin/content/{id}     # Update scheduled post (with PortableText)
DELETE /api/v1/communication/linkedin/content/{id}     # Delete/cancel post
POST   /api/v1/communication/linkedin/content/{id}/publish # Publish post immediately
GET    /api/v1/communication/linkedin/content/{id}/formatted # Get formatted content for LinkedIn

POST   /api/v1/communication/linkedin/media            # Upload LinkedIn media
GET    /api/v1/communication/linkedin/engagement       # Get engagement analytics
GET    /api/v1/communication/linkedin/engagement/{post_id} # Get post-specific analytics
```

#### Twitter/X Integration
```
GET    /api/v1/communication/twitter/accounts          # List connected Twitter accounts  
POST   /api/v1/communication/twitter/accounts          # Connect Twitter account
DELETE /api/v1/communication/twitter/accounts/{id}     # Disconnect account

GET    /api/v1/communication/twitter/content           # List tweets/threads
POST   /api/v1/communication/twitter/content           # Create tweet/thread (with PortableText)
GET    /api/v1/communication/twitter/content/{id}      # Get tweet details
PUT    /api/v1/communication/twitter/content/{id}      # Update scheduled tweet (with PortableText)
DELETE /api/v1/communication/twitter/content/{id}      # Delete/cancel tweet
POST   /api/v1/communication/twitter/content/{id}/publish # Publish tweet immediately
GET    /api/v1/communication/twitter/content/{id}/formatted # Get formatted content for Twitter

POST   /api/v1/communication/twitter/media             # Upload Twitter media
GET    /api/v1/communication/twitter/engagement        # Get engagement analytics
GET    /api/v1/communication/twitter/engagement/{tweet_id} # Get tweet-specific analytics
```

### Admin Panel Endpoints
```
GET    /api/v1/admin/users          # List admin users
POST   /api/v1/admin/users          # Create admin user
PUT    /api/v1/admin/users/{id}     # Update user
DELETE /api/v1/admin/users/{id}     # Deactivate user

GET    /api/v1/admin/analytics      # Basic analytics data
GET    /api/v1/admin/system-health  # System status
```

## Authentication & Security

### JWT Implementation
```python
# auth.py
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

# HS256 algorithm for simplicity
SECRET_KEY = "your-secret-key-here"  # From environment
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

### Role-Based Access Control
```python
# permissions.py
from enum import Enum
from functools import wraps

class UserRole(Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class Permission(Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"

ROLE_PERMISSIONS = {
    UserRole.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN],
    UserRole.EDITOR: [Permission.READ, Permission.WRITE],
    UserRole.VIEWER: [Permission.READ],
}

def require_permission(permission: Permission):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            user_permissions = ROLE_PERMISSIONS.get(current_user.role, [])
            if permission not in user_permissions:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

## Data Models

### Model Relationships and Dependencies
![Model Dependencies with Cascades](../../diagrams/assets/shorts/model_dependencies_cascades.png)

The data models implement proper cascade behaviors (CASCADE, SET NULL, RESTRICT) to maintain referential integrity and prevent orphaned records.

### User Model
```python
# models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from app.database import Base
from app.core.permissions import UserRole

class User(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
```

### Content Model
```python
# models/content.py
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base

class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True)
    
    # Multilingual PortableText content stored as JSON
    title = Column(JSON, nullable=False)  # {"en": "Title", "de": "Titel"}
    content = Column(JSON, nullable=False)  # PortableText JSON: {"en": [...blocks], "de": [...blocks]}
    excerpt = Column(JSON, nullable=True)  # PortableText JSON: {"en": [...blocks], "de": [...blocks]}
    meta_description = Column(JSON, nullable=True)
    
    # Status
    status = Column(String(20), default="draft")  # draft, published
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # SEO
    seo_title = Column(JSON, nullable=True)
    seo_keywords = Column(JSON, nullable=True)
    structured_data = Column(JSON, nullable=True)  # Auto-generated from PortableText
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
```

## Request/Response Schemas

### Authentication Schemas
```python
# schemas/auth.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
```

### Content Schemas
```python
# schemas/content.py
from pydantic import BaseModel, validator
from typing import Dict, List, Any, Optional, Union
from datetime import datetime

# PortableText block type definitions
class PortableTextSpan(BaseModel):
    _type: str = "span"
    text: str
    marks: Optional[List[str]] = None

class PortableTextBlock(BaseModel):
    _type: str
    _key: str
    children: Optional[List[PortableTextSpan]] = None
    style: Optional[str] = None
    level: Optional[int] = None
    listItem: Optional[str] = None

class PortableTextContent(BaseModel):
    """Multilingual PortableText content structure"""
    en: List[Union[PortableTextBlock, Dict[str, Any]]]  # English content (required)
    de: Optional[List[Union[PortableTextBlock, Dict[str, Any]]]] = None  # German content (optional)
    
    @validator('en')
    def validate_english_required(cls, v):
        if not v:
            raise ValueError('English content is required')
        return v

class PageCreate(BaseModel):
    slug: str
    title: Dict[str, str]  # {"en": "Title", "de": "Titel"}
    content: PortableTextContent  # PortableText structure
    excerpt: Optional[PortableTextContent] = None  # PortableText structure
    meta_description: Optional[Dict[str, str]] = None
    status: str = "draft"

class PageResponse(BaseModel):
    id: int
    slug: str
    title: Dict[str, str]
    content: PortableTextContent  # PortableText structure
    excerpt: Optional[PortableTextContent] = None
    status: str
    is_published: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Serialization response schemas
class PageHTMLResponse(BaseModel):
    id: int
    slug: str
    title: str  # Rendered for specific language
    content_html: str  # Serialized PortableText to HTML
    excerpt_html: Optional[str] = None
    language: str

class PageMarkdownResponse(BaseModel):
    id: int
    slug: str
    title: str
    content_markdown: str  # Serialized PortableText to Markdown
    excerpt_markdown: Optional[str] = None
    language: str

class PagePlainTextResponse(BaseModel):
    id: int
    slug: str
    title: str
    content_text: str  # Serialized PortableText to plain text
    excerpt_text: Optional[str] = None
    language: str
```

### PortableText Validation Service
```python
# services/portable_text.py
from typing import List, Dict, Any, Optional
import json
from pydantic import ValidationError

class PortableTextValidator:
    """Validates PortableText structure and content"""
    
    ALLOWED_BLOCK_TYPES = {
        'block',      # Standard text block
        'heading',    # Heading block
        'image',      # Image block
        'video',      # Video block
        'cta',        # Call-to-action block
        'form',       # Form embed block
        'code',       # Code block
        'seo'         # SEO metadata block
    }
    
    ALLOWED_MARKS = {
        'strong',     # Bold text
        'em',         # Italic text
        'underline',  # Underlined text
        'strike',     # Strikethrough text
        'code',       # Inline code
        'link'        # Links
    }
    
    def validate_structure(self, blocks: List[Dict[str, Any]]) -> bool:
        """Validate PortableText block structure"""
        try:
            for block in blocks:
                if not self._validate_block(block):
                    return False
            return True
        except Exception:
            return False
    
    def _validate_block(self, block: Dict[str, Any]) -> bool:
        """Validate individual PortableText block"""
        # Every block must have _type
        if '_type' not in block:
            return False
        
        block_type = block['_type']
        
        # Validate block type
        if block_type not in self.ALLOWED_BLOCK_TYPES:
            return False
        
        # Validate text blocks
        if block_type == 'block':
            return self._validate_text_block(block)
        
        # Validate custom blocks
        elif block_type in ['image', 'video', 'cta', 'form', 'code']:
            return self._validate_custom_block(block, block_type)
        
        return True
    
    def _validate_text_block(self, block: Dict[str, Any]) -> bool:
        """Validate text block structure"""
        if 'children' not in block:
            return False
        
        children = block['children']
        if not isinstance(children, list):
            return False
        
        for child in children:
            if not self._validate_span(child):
                return False
        
        return True
    
    def _validate_span(self, span: Dict[str, Any]) -> bool:
        """Validate text span structure"""
        if span.get('_type') != 'span':
            return False
        
        if 'text' not in span:
            return False
        
        # Validate marks if present
        if 'marks' in span:
            marks = span['marks']
            if not isinstance(marks, list):
                return False
            
            for mark in marks:
                if mark not in self.ALLOWED_MARKS:
                    return False
        
        return True
    
    def _validate_custom_block(self, block: Dict[str, Any], block_type: str) -> bool:
        """Validate custom block types"""
        if block_type == 'image':
            return 'asset' in block and 'alt' in block
        elif block_type == 'video':
            return 'url' in block
        elif block_type == 'cta':
            return 'text' in block and 'url' in block
        elif block_type == 'form':
            return 'formType' in block
        elif block_type == 'code':
            return 'code' in block and 'language' in block
        
        return True

class PortableTextSerializer:
    """Serializes PortableText to various formats"""
    
    def to_html(self, blocks: List[Dict[str, Any]]) -> str:
        """Convert PortableText to HTML"""
        html_parts = []
        
        for block in blocks:
            html_parts.append(self._block_to_html(block))
        
        return '\n'.join(html_parts)
    
    def to_plain_text(self, blocks: List[Dict[str, Any]]) -> str:
        """Convert PortableText to plain text"""
        text_parts = []
        
        for block in blocks:
            text_parts.append(self._block_to_text(block))
        
        return ' '.join(text_parts)
    
    def to_markdown(self, blocks: List[Dict[str, Any]]) -> str:
        """Convert PortableText to Markdown"""
        md_parts = []
        
        for block in blocks:
            md_parts.append(self._block_to_markdown(block))
        
        return '\n\n'.join(md_parts)
    
    def _block_to_html(self, block: Dict[str, Any]) -> str:
        """Convert single block to HTML"""
        block_type = block.get('_type')
        
        if block_type == 'block':
            return self._text_block_to_html(block)
        elif block_type == 'image':
            return self._image_block_to_html(block)
        elif block_type == 'video':
            return self._video_block_to_html(block)
        elif block_type == 'cta':
            return self._cta_block_to_html(block)
        elif block_type == 'code':
            return self._code_block_to_html(block)
        
        return ''
    
    def _text_block_to_html(self, block: Dict[str, Any]) -> str:
        """Convert text block to HTML"""
        style = block.get('style', 'normal')
        children = block.get('children', [])
        
        # Convert spans to HTML
        content = ''.join(self._span_to_html(span) for span in children)
        
        # Wrap in appropriate tag
        if style == 'normal':
            return f'<p>{content}</p>'
        elif style.startswith('h'):
            level = style[1]
            return f'<h{level}>{content}</h{level}>'
        elif style == 'blockquote':
            return f'<blockquote>{content}</blockquote>'
        
        return f'<p>{content}</p>'
    
    def _span_to_html(self, span: Dict[str, Any]) -> str:
        """Convert text span to HTML"""
        text = span.get('text', '')
        marks = span.get('marks', [])
        
        # Apply marks
        for mark in marks:
            if mark == 'strong':
                text = f'<strong>{text}</strong>'
            elif mark == 'em':
                text = f'<em>{text}</em>'
            elif mark == 'underline':
                text = f'<u>{text}</u>'
            elif mark == 'strike':
                text = f'<s>{text}</s>'
            elif mark == 'code':
                text = f'<code>{text}</code>'
        
        return text
    
    def _image_block_to_html(self, block: Dict[str, Any]) -> str:
        """Convert image block to HTML"""
        asset = block.get('asset', {})
        alt = block.get('alt', '')
        caption = block.get('caption', '')
        
        src = f"/api/v1/media/{asset.get('_ref', '')}"
        img_html = f'<img src="{src}" alt="{alt}" />'
        
        if caption:
            return f'<figure>{img_html}<figcaption>{caption}</figcaption></figure>'
        
        return img_html
    
    def _video_block_to_html(self, block: Dict[str, Any]) -> str:
        """Convert video block to HTML"""
        url = block.get('url', '')
        title = block.get('title', '')
        
        return f'<video controls><source src="{url}" />{title}</video>'
    
    def _cta_block_to_html(self, block: Dict[str, Any]) -> str:
        """Convert CTA block to HTML"""
        text = block.get('text', '')
        url = block.get('url', '')
        style = block.get('style', 'primary')
        
        return f'<a href="{url}" class="cta-{style}">{text}</a>'
    
    def _code_block_to_html(self, block: Dict[str, Any]) -> str:
        """Convert code block to HTML"""
        code = block.get('code', '')
        language = block.get('language', '')
        
        return f'<pre><code class="language-{language}">{code}</code></pre>'
    
    def _block_to_text(self, block: Dict[str, Any]) -> str:
        """Convert block to plain text"""
        if block.get('_type') == 'block':
            children = block.get('children', [])
            return ' '.join(span.get('text', '') for span in children)
        return ''
    
    def _block_to_markdown(self, block: Dict[str, Any]) -> str:
        """Convert block to Markdown"""
        block_type = block.get('_type')
        
        if block_type == 'block':
            style = block.get('style', 'normal')
            children = block.get('children', [])
            text = ' '.join(span.get('text', '') for span in children)
            
            if style == 'normal':
                return text
            elif style.startswith('h'):
                level = int(style[1])
                return f"{'#' * level} {text}"
            elif style == 'blockquote':
                return f"> {text}"
        
        return ''
```

## Error Handling

### Exception Classes
```python
# exceptions.py
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
import logging

logger = logging.getLogger(__name__)

class DatabaseError(Exception):
    pass

class ValidationError(Exception):
    def __init__(self, message: str, field: str = None):
        self.message = message
        self.field = field
        super().__init__(message)

class PortableTextError(Exception):
    def __init__(self, message: str, block_index: int = None):
        self.message = message
        self.block_index = block_index
        super().__init__(message)

async def database_error_handler(request: Request, exc: IntegrityError):
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "DATABASE_ERROR",
                "message": "A database error occurred"
            }
        }
    )

async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": exc.message,
                "field": exc.field
            }
        }
    )

async def portable_text_error_handler(request: Request, exc: PortableTextError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": "PORTABLE_TEXT_ERROR",
                "message": exc.message,
                "block_index": exc.block_index
            }
        }
    )
```

## Health Checks & Monitoring

### Comprehensive Health Check Dependencies
![Health Check Tree](../../diagrams/assets/shorts/comprehensive_health_check_tree.png)

The health monitoring system tracks core dependencies, external services, and feature availability to provide comprehensive system status.

### Health Check Endpoint
```python
# api/v1/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
import os

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@router.get("/health/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """Detailed health check with database"""
    health_status = {
        "status": "healthy",
        "version": "2.0.0",
        "services": {}
    }
    
    # Database health
    try:
        result = await db.execute(text("SELECT 1"))
        health_status["services"]["database"] = {
            "status": "healthy",
            "type": "SQLite"
        }
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # File system health
    try:
        db_path = "magnetiq.db"
        if os.path.exists(db_path):
            db_size = os.path.getsize(db_path)
            health_status["services"]["filesystem"] = {
                "status": "healthy",
                "database_size_mb": round(db_size / 1024 / 1024, 2)
            }
        else:
            health_status["services"]["filesystem"] = {
                "status": "warning",
                "message": "Database file not found"
            }
    except Exception as e:
        health_status["services"]["filesystem"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    return health_status
```

### PortableText API Implementation Example

```python
# api/v1/content.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_db
from app.schemas.content import (
    PageCreate, PageResponse, PageHTMLResponse, 
    PageMarkdownResponse, PagePlainTextResponse
)
from app.services.portable_text import PortableTextValidator, PortableTextSerializer
from app.models.content import Page
from app.core.auth import get_current_user

router = APIRouter(prefix="/content", tags=["content"])
validator = PortableTextValidator()
serializer = PortableTextSerializer()

@router.post("/pages", response_model=PageResponse)
async def create_page(
    page_data: PageCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new page with PortableText content"""
    
    # Validate PortableText structure
    if not validator.validate_structure(page_data.content.en):
        raise HTTPException(400, "Invalid PortableText structure in English content")
    
    if page_data.content.de and not validator.validate_structure(page_data.content.de):
        raise HTTPException(400, "Invalid PortableText structure in German content")
    
    # Create page record
    page = Page(
        slug=page_data.slug,
        title=page_data.title,
        content=page_data.content.dict(),
        excerpt=page_data.excerpt.dict() if page_data.excerpt else None,
        meta_description=page_data.meta_description,
        status=page_data.status,
        author_id=current_user.id
    )
    
    db.add(page)
    await db.commit()
    await db.refresh(page)
    
    return page

@router.get("/pages/{page_id}/html", response_model=PageHTMLResponse)
async def get_page_html(
    page_id: int,
    language: str = Query("en", enum=["en", "de"]),
    db: AsyncSession = Depends(get_db)
):
    """Get page content serialized as HTML"""
    
    page = await db.get(Page, page_id)
    if not page:
        raise HTTPException(404, "Page not found")
    
    # Get content for requested language with fallback
    content_blocks = page.content.get(language) or page.content.get("en")
    excerpt_blocks = None
    
    if page.excerpt:
        excerpt_blocks = page.excerpt.get(language) or page.excerpt.get("en")
    
    # Serialize to HTML
    content_html = serializer.to_html(content_blocks)
    excerpt_html = serializer.to_html(excerpt_blocks) if excerpt_blocks else None
    title = page.title.get(language) or page.title.get("en")
    
    return PageHTMLResponse(
        id=page.id,
        slug=page.slug,
        title=title,
        content_html=content_html,
        excerpt_html=excerpt_html,
        language=language
    )

@router.get("/pages/{page_id}/markdown", response_model=PageMarkdownResponse)
async def get_page_markdown(
    page_id: int,
    language: str = Query("en", enum=["en", "de"]),
    db: AsyncSession = Depends(get_db)
):
    """Get page content serialized as Markdown"""
    
    page = await db.get(Page, page_id)
    if not page:
        raise HTTPException(404, "Page not found")
    
    # Get content for requested language with fallback
    content_blocks = page.content.get(language) or page.content.get("en")
    excerpt_blocks = None
    
    if page.excerpt:
        excerpt_blocks = page.excerpt.get(language) or page.excerpt.get("en")
    
    # Serialize to Markdown
    content_markdown = serializer.to_markdown(content_blocks)
    excerpt_markdown = serializer.to_markdown(excerpt_blocks) if excerpt_blocks else None
    title = page.title.get(language) or page.title.get("en")
    
    return PageMarkdownResponse(
        id=page.id,
        slug=page.slug,
        title=title,
        content_markdown=content_markdown,
        excerpt_markdown=excerpt_markdown,
        language=language
    )

@router.get("/pages/{page_id}/plain-text", response_model=PagePlainTextResponse)
async def get_page_plain_text(
    page_id: int,
    language: str = Query("en", enum=["en", "de"]),
    db: AsyncSession = Depends(get_db)
):
    """Get page content serialized as plain text"""
    
    page = await db.get(Page, page_id)
    if not page:
        raise HTTPException(404, "Page not found")
    
    # Get content for requested language with fallback
    content_blocks = page.content.get(language) or page.content.get("en")
    excerpt_blocks = None
    
    if page.excerpt:
        excerpt_blocks = page.excerpt.get(language) or page.excerpt.get("en")
    
    # Serialize to plain text
    content_text = serializer.to_plain_text(content_blocks)
    excerpt_text = serializer.to_plain_text(excerpt_blocks) if excerpt_blocks else None
    title = page.title.get(language) or page.title.get("en")
    
    return PagePlainTextResponse(
        id=page.id,
        slug=page.slug,
        title=title,
        content_text=content_text,
        excerpt_text=excerpt_text,
        language=language
    )

@router.post("/portable-assets")
async def upload_portable_asset(
    file: UploadFile = File(...),
    alt_text: str = Form(...),
    caption: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Upload media asset for use in PortableText blocks"""
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
    if file.content_type not in allowed_types:
        raise HTTPException(400, f"File type {file.content_type} not allowed")
    
    # Save file (implementation depends on storage strategy)
    file_path = await save_uploaded_file(file)
    
    # Create media record with PortableText metadata
    media = MediaFile(
        filename=file.filename,
        file_path=file_path,
        mime_type=file.content_type,
        alt_text={"en": alt_text},  # Multilingual alt text
        description={"en": caption} if caption else None,
        uploaded_by=current_user.id
    )
    
    db.add(media)
    await db.commit()
    await db.refresh(media)
    
    # Return reference for PortableText blocks
    return {
        "success": True,
        "asset": {
            "_ref": str(media.id),
            "_type": "reference",
            "url": f"/api/v1/media/{media.id}",
            "alt": alt_text,
            "caption": caption,
            "mimeType": file.content_type
        }
    }
```

## Development Configuration

### Environment Variables
```bash
# .env (development)
ENVIRONMENT=development
SECRET_KEY=your-development-secret-key-here
DATABASE_URL=sqlite+aiosqlite:///./magnetiq_dev.db
DEBUG=true

# CORS settings
ALLOWED_ORIGINS=http://localhost:8036,http://localhost:3000
ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE
ALLOWED_HEADERS=*

# Email settings (development)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM_EMAIL=noreply@magnetiq.local

# File upload settings
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,docx
UPLOAD_DIR=./media
```

### Production Configuration
```bash
# .env (production)
ENVIRONMENT=production
SECRET_KEY=your-super-secure-production-secret-key
DATABASE_URL=sqlite+aiosqlite:///./data/magnetiq_prod.db
DEBUG=false

# CORS settings
ALLOWED_ORIGINS=https://voltAIc.systems,https://www.voltAIc.systems
ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE
ALLOWED_HEADERS=*

# Email settings (production)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-user
SMTP_PASSWORD=your-brevo-password
SMTP_FROM_EMAIL=noreply@voltAIc.systems

# File upload settings
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,docx,xlsx,pptx
UPLOAD_DIR=./data/media
```

## API Testing

### Development Server
```bash
# Start development server
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3036

# Run database migrations
alembic upgrade head

# Create admin user (via CLI script)
python scripts/create_admin.py --email admin@voltAIc.systems --password securepassword
```

### API Documentation
- **Swagger UI**: `http://localhost:3036/docs`
- **ReDoc**: `http://localhost:3036/redoc`
- **OpenAPI JSON**: `http://localhost:3036/openapi.json`

### Testing Endpoints
```bash
# Health check
curl http://localhost:3036/api/v1/health

# Login
curl -X POST http://localhost:3036/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@voltAIc.systems", "password": "securepassword"}'

# Get pages (with auth token)
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3036/api/v1/content/pages

# Create page with PortableText content
curl -X POST http://localhost:3036/api/v1/content/pages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "sample-page",
    "title": {"en": "Sample Page", "de": "Beispielseite"},
    "content": {
      "en": [
        {
          "_type": "block",
          "_key": "block1",
          "style": "h1",
          "children": [
            {"_type": "span", "text": "Welcome to Our Page", "marks": []}
          ]
        },
        {
          "_type": "block",
          "_key": "block2",
          "style": "normal",
          "children": [
            {"_type": "span", "text": "This is a ", "marks": []},
            {"_type": "span", "text": "sample page", "marks": ["strong"]},
            {"_type": "span", "text": " with PortableText content.", "marks": []}
          ]
        }
      ]
    },
    "status": "published"
  }'

# Get page as HTML
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "http://localhost:3036/api/v1/content/pages/1/html?language=en"

# Get page as Markdown
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "http://localhost:3036/api/v1/content/pages/1/markdown?language=en"

# Upload asset for PortableText
curl -X POST http://localhost:3036/api/v1/content/portable-assets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@image.jpg" \
  -F "alt_text=Sample Image" \
  -F "caption=This is a sample image"
```

## Migration from Complex v2 to Simple v2

For teams migrating from the previous complex v2 architecture:

### Key Changes
- **Database**: PostgreSQL → SQLite (single file)
- **Caching**: Redis removed → In-memory caching only
- **Background Tasks**: Celery removed → Synchronous operations
- **Authentication**: RS256 → HS256 (simpler secret management)
- **Complexity**: Microservices → Monolithic API

### Migration Benefits
- **Simplified Deployment**: Single database file, no external dependencies
- **Reduced Infrastructure**: No Redis, Celery, or complex orchestration
- **Faster Development**: Fewer moving parts, easier debugging
- **Cost Effective**: Reduced hosting requirements and maintenance

### Evolution Path
For advanced integration capabilities, consider upgrading to [Magnetiq v3](../spec_v3/integration.md) which provides lightweight ESB functionality while maintaining reasonable complexity.

## Conclusion

The Magnetiq v2 backend provides a robust, production-ready API while maintaining simplicity through SQLite and monolithic architecture. This approach enables rapid development and deployment while providing a clear path to more advanced capabilities in v3.
