# Magnetiq v2 - Backend API Specification

## Overview

The Magnetiq v2 backend is a high-performance, scalable API built with Python and FastAPI. It provides secure, RESTful endpoints for all system functionality including authentication, content management, business operations, and third-party integrations.

## Technical Foundation

### Technology Stack
- **Framework**: FastAPI 0.104+ with async/await
- **Python Version**: 3.11+
- **ASGI Server**: Uvicorn with Gunicorn workers
- **ORM**: SQLAlchemy 2.0 with async support
- **Database**: PostgreSQL 14+ (primary), Redis (cache/sessions)
- **Task Queue**: Celery with Redis broker
- **Validation**: Pydantic v2 with JSON Schema
- **Authentication**: JWT with RS256 algorithm
- **Documentation**: Auto-generated OpenAPI 3.0

### Port Configuration
- **Development**: Port 3000 (unified development port)
- **Production**: Port 8000 (behind Nginx reverse proxy)
- **Health Checks**: Dedicated endpoints with comprehensive dependency monitoring
- **Metrics**: Prometheus metrics endpoint on same port

### Project Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Configuration management  
│   ├── database.py          # Database setup and connection
│   ├── dependencies.py      # Dependency injection
│   ├── exceptions.py        # Custom exception handlers
│   ├── middleware.py        # Custom middleware
│   ├── api/                 # API routes (all under /api/)
│   │   ├── v1/
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── content/     # Content management
│   │   │   ├── business/    # Business features
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
│   ├── tasks/               # Celery tasks
│   └── utils/               # Utility functions
├── migrations/              # Alembic migrations
├── tests/                   # Test suite
├── scripts/                 # Management scripts
├── requirements.txt         # Python dependencies
└── docker/                  # Docker configurations
```

## API Design Standards

### Base URL Structure
- **Development**: `http://localhost:3000`
- **Production**: `https://api.voltaic.systems` (primary) / `https://voltaic.systems/api` (unified)
- **Route Prefix**: All API routes under `/api/` namespace
- **Versioning**: `/api/v1/` for current stable API
- **Documentation**: `/docs` for interactive Swagger UI, `/redoc` for alternative docs

### Response Format
All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "request_id": "uuid-request-id",
    "version": "1.0.0",
    "execution_time_ms": 45
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "INVALID_FORMAT"
      }
    ]
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "request_id": "uuid-request-id"
  }
}
```

### HTTP Status Codes
- **2xx Success**:
  - **200 OK**: Successful GET, PUT, PATCH operations
  - **201 Created**: Successful POST operations with resource creation
  - **202 Accepted**: Async operation accepted (background tasks)
  - **204 No Content**: Successful DELETE operations
- **4xx Client Errors**:
  - **400 Bad Request**: Invalid request syntax or malformed data
  - **401 Unauthorized**: Authentication required or invalid credentials
  - **403 Forbidden**: Valid credentials but insufficient permissions
  - **404 Not Found**: Resource not found or soft-deleted
  - **409 Conflict**: Resource conflict (duplicate email, concurrent edit)
  - **422 Unprocessable Entity**: Validation errors with detailed field messages
  - **429 Too Many Requests**: Rate limit exceeded with retry-after header
- **5xx Server Errors**:
  - **500 Internal Server Error**: Unexpected server error
  - **502 Bad Gateway**: External service unavailable
  - **503 Service Unavailable**: Temporary server overload

## Authentication & Authorization

### JWT Implementation
```python
class JWTSettings:
    ALGORITHM = "RS256"  # Asymmetric signing for security
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    ISSUER = "voltaic-systems"
    AUDIENCE = "magnetiq-api"
    # Key rotation support
    PRIVATE_KEY_PATH = "/etc/ssl/private/jwt-private.key"
    PUBLIC_KEY_PATH = "/etc/ssl/certs/jwt-public.key"
    KEY_ID = "key-2024-v1"  # For key rotation
```

### Token Structure
```json
{
  "sub": "user-uuid",
  "email": "user@voltaic.systems",
  "role": "admin",
  "permissions": ["content:read", "content:write", "users:manage"],
  "session_id": "session-uuid",
  "device_id": "device-fingerprint-hash",
  "iat": 1640995200,
  "exp": 1640996100,
  "iss": "voltaic-systems",
  "aud": "magnetiq-api",
  "kid": "key-2024-v1"
}
```

### Authentication Endpoints

#### POST `/api/v1/auth/login`
Email-based login (not username as per requirements).

**Request:**
```json
{
  "email": "admin@voltaic.systems",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-access-token",
    "refresh_token": "jwt-refresh-token",
    "token_type": "bearer",
    "expires_in": 900,
    "user": {
      "id": "user-uuid",
      "email": "admin@voltaic.systems",
      "role": "admin",
      "profile": {
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  }
}
```

#### POST `/api/v1/auth/refresh`
Refresh access token using refresh token.

#### POST `/api/v1/auth/logout`
Invalidate current session and tokens.

#### POST `/api/v1/auth/request-password-reset`
Initiate password reset process.

#### POST `/api/v1/auth/reset-password`
Complete password reset with token.

### Role-Based Access Control (RBAC)

```python
class Permission(str, Enum):
    # Content Management
    CONTENT_READ = "content:read"
    CONTENT_WRITE = "content:write"
    CONTENT_DELETE = "content:delete"
    CONTENT_PUBLISH = "content:publish"
    
    # Media Management
    MEDIA_UPLOAD = "media:upload"
    MEDIA_DELETE = "media:delete"
    MEDIA_MANAGE = "media:manage"
    
    # Business Operations
    WEBINARS_MANAGE = "webinars:manage"
    WEBINARS_CREATE = "webinars:create"
    CONSULTANTS_MANAGE = "consultants:manage"
    BOOKINGS_MANAGE = "bookings:manage"
    BOOKINGS_VIEW = "bookings:view"
    
    # User Management
    USERS_MANAGE = "users:manage"
    USERS_CREATE = "users:create"
    USERS_DELETE = "users:delete"
    
    # System Administration
    SYSTEM_ADMIN = "system:admin"
    SYSTEM_CONFIG = "system:config"
    SYSTEM_LOGS = "system:logs"
    
    # Analytics & Reporting
    ANALYTICS_VIEW = "analytics:view"
    REPORTS_GENERATE = "reports:generate"

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"  # Full system access
    ADMIN = "admin"              # User and content management
    EDITOR = "editor"            # Content creation and editing
    VIEWER = "viewer"            # Read-only access
    
    def get_permissions(self) -> List[Permission]:
        """Get default permissions for role"""
        role_permissions = {
            UserRole.SUPER_ADMIN: list(Permission),  # All permissions
            UserRole.ADMIN: [
                Permission.CONTENT_READ, Permission.CONTENT_WRITE, Permission.CONTENT_PUBLISH,
                Permission.MEDIA_UPLOAD, Permission.MEDIA_MANAGE,
                Permission.WEBINARS_MANAGE, Permission.BOOKINGS_MANAGE,
                Permission.USERS_CREATE, Permission.ANALYTICS_VIEW
            ],
            UserRole.EDITOR: [
                Permission.CONTENT_READ, Permission.CONTENT_WRITE,
                Permission.MEDIA_UPLOAD, Permission.WEBINARS_CREATE,
                Permission.BOOKINGS_VIEW
            ],
            UserRole.VIEWER: [
                Permission.CONTENT_READ, Permission.BOOKINGS_VIEW
            ]
        }
        return role_permissions.get(self, [])
```

## Public API Endpoints

### Content API

#### GET `/api/v1/public/pages/{slug}`
Get public page content by slug.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "page-uuid",
    "title": {
      "en": "About Us",
      "de": "Über uns"
    },
    "content": {
      "en": "...",
      "de": "..."
    },
    "blocks": [
      {
        "type": "hero",
        "props": {
          "title": "Welcome to voltAIc Systems",
          "subtitle": "AI-driven solutions"
        }
      }
    ],
    "seo": {
      "title": "About voltAIc Systems",
      "description": "Learn about our company",
      "keywords": ["AI", "consulting", "automation"]
    }
  }
}
```

### Webinars API

#### GET `/api/v1/public/webinars`
List public webinars with filtering.

**Query Parameters:**
- `filter`: `upcoming`, `this-week`, `this-month`, `all`
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 100)
- `search`: Search term for title/description
- `topic`: Filter by topic
- `language`: Filter by language (`en`, `de`)

**Response:**
```json
{
  "success": true,
  "data": {
    "webinars": [
      {
        "id": "webinar-uuid",
        "title": {
          "en": "AI in Manufacturing",
          "de": "KI in der Fertigung"
        },
        "description": {
          "en": "Learn about AI applications...",
          "de": "Erfahren Sie mehr über KI-Anwendungen..."
        },
        "slug": "ai-in-manufacturing",
        "speaker": {
          "id": "speaker-uuid",
          "name": "Dr. Pascal Köth",
          "title": "AI Consultant",
          "photo": "/media/speakers/pascal.jpg",
          "biography": "..."
        },
        "datetime": "2024-01-15T14:00:00Z",
        "duration": 60,
        "timezone": "Europe/Berlin",
        "price": 0,
        "capacity": 100,
        "registered_count": 45,
        "status": "published",
        "tags": ["AI", "Manufacturing", "Automation"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### GET `/api/v1/public/webinars/{slug}`
Get detailed webinar information.

#### POST `/api/v1/public/webinars/{id}/register`
Register for a webinar.

**Request:**
```json
{
  "attendee": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "company": "ACME Corp",
    "phone": "+49 123 456 789",
    "website": "https://acme.com"
  },
  "terms_accepted": true,
  "marketing_consent": false
}
```

### Whitepapers API

#### GET `/api/v1/public/whitepapers`
List available whitepapers.

#### POST `/api/v1/public/whitepapers/{id}/download`
Download whitepaper with lead capture.

**Request:**
```json
{
  "lead": {
    "name": "John Doe",
    "email": "john@example.com",
    "company": "ACME Corp",
    "website": "https://acme.com",
    "phone": "+49 123 456 789"
  },
  "session_token": "session-uuid" // Optional for subsequent downloads
}
```

### Booking API

#### GET `/api/v1/public/consultants`
List available consultants.

#### GET `/api/v1/public/availability`
Check consultant availability.

**Query Parameters:**
- `consultant_id`: Consultant UUID (required)
- `date`: Date in YYYY-MM-DD format (required)
- `timezone`: Client timezone (default: UTC)

#### POST `/api/v1/public/bookings`
Create consultation booking.

**Request:**
```json
{
  "consultant_id": "consultant-uuid",
  "datetime": "2024-01-15T14:00:00Z",
  "duration": 60,
  "timezone": "Europe/Berlin",
  "client": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+49 123 456 789",
    "company": "ACME Corp"
  },
  "meeting_type": "video",
  "message": "I'd like to discuss AI automation for our manufacturing process."
}
```

## Admin API Endpoints

### Content Management

#### GET `/api/v1/admin/pages`
List all pages with admin metadata.

#### POST `/api/v1/admin/pages`
Create new page.

#### PUT `/api/v1/admin/pages/{id}`
Update existing page.

#### DELETE `/api/v1/admin/pages/{id}`
Soft delete page.

### User Management

#### GET `/api/v1/admin/users`
List admin users with pagination and filtering.

#### POST `/api/v1/admin/users`
Create new admin user.

**Request:**
```json
{
  "email": "new-admin@voltaic.systems",
  "profile": {
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "role": "editor",
  "send_invitation": true
}
```

#### POST `/api/v1/admin/users/{id}/reset-password`
Trigger password reset for admin user.

### Business Management

#### GET `/api/v1/admin/consultants`
List consultants with full details.

#### POST `/api/v1/admin/consultants`
Create new consultant profile.

#### PUT `/api/v1/admin/consultants/{id}/status`
Update consultant online/offline status.

#### GET `/api/v1/admin/webinars/sessions`
List webinar sessions with management data.

#### POST `/api/v1/admin/webinars/sessions`
Create new webinar session.

#### GET `/api/v1/admin/bookings`
List bookings with detailed information.

## Service Layer Architecture

### Base Service Class with Enhanced Features
```python
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime

T = TypeVar('T')  # Database model type
S = TypeVar('S')  # Schema type

class BaseService(Generic[T, S], ABC):
    """Enhanced base service with common CRUD operations and utilities"""
    
    def __init__(self, db: AsyncSession, model: type[T]):
        self.db = db
        self.model = model

    @abstractmethod
    async def create(self, data: S, user_id: UUID = None) -> T:
        """Create new entity with audit trail"""
        pass

    async def get_by_id(self, id: UUID) -> Optional[T]:
        """Get entity by UUID with soft delete awareness"""
        query = select(self.model).where(
            self.model.id == id,
            self.model.deleted_at.is_(None)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list(self, 
                  skip: int = 0, 
                  limit: int = 100, 
                  filters: Dict[str, Any] = None,
                  order_by: str = "created_at",
                  order_desc: bool = True) -> List[T]:
        """List entities with pagination and filtering"""
        query = select(self.model).where(self.model.deleted_at.is_(None))
        
        # Apply filters
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.where(getattr(self.model, field) == value)
        
        # Apply ordering
        if hasattr(self.model, order_by):
            order_column = getattr(self.model, order_by)
            query = query.order_by(order_column.desc() if order_desc else order_column)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update(self, id: UUID, data: S, user_id: UUID = None) -> Optional[T]:
        """Update entity with optimistic locking and audit trail"""
        entity = await self.get_by_id(id)
        if not entity:
            return None
        
        # Update fields from schema
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(entity, field):
                setattr(entity, field, value)
        
        # Update audit fields
        entity.updated_at = datetime.utcnow()
        if user_id and hasattr(entity, 'updated_by'):
            entity.updated_by = user_id
        
        # Increment version for optimistic locking
        if hasattr(entity, 'version'):
            entity.version += 1
        
        await self.db.commit()
        await self.db.refresh(entity)
        return entity

    async def soft_delete(self, id: UUID, user_id: UUID = None) -> bool:
        """Soft delete entity"""
        entity = await self.get_by_id(id)
        if not entity:
            return False
        
        entity.deleted_at = datetime.utcnow()
        if user_id and hasattr(entity, 'deleted_by'):
            entity.deleted_by = user_id
        
        await self.db.commit()
        return True

    async def count(self, filters: Dict[str, Any] = None) -> int:
        """Count entities with optional filters"""
        query = select(func.count(self.model.id)).where(self.model.deleted_at.is_(None))
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.where(getattr(self.model, field) == value)
        
        result = await self.db.execute(query)
        return result.scalar()

    async def exists(self, filters: Dict[str, Any]) -> bool:
        """Check if entity exists with given filters"""
        count = await self.count(filters)
        return count > 0
```

### Authentication Service
```python
class AuthService:
    def __init__(self, db: AsyncSession, redis: Redis):
        self.db = db
        self.redis = redis

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password."""
        user = await self.get_user_by_email(email)
        if not user or not self.verify_password(password, user.hashed_password):
            return None
        return user

    async def create_access_token(self, user: User) -> str:
        """Create JWT access token."""
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "permissions": user.get_permissions(),
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=15)
        }
        return jwt.encode(payload, PRIVATE_KEY, algorithm="RS256")

    async def blacklist_token(self, token: str) -> None:
        """Add token to blacklist."""
        # Store in Redis with expiration
        await self.redis.setex(f"blacklist:{token}", 900, "1")
```

### Email Service
```python
class EmailService:
    def __init__(self, smtp_config: SMTPConfig):
        self.smtp_config = smtp_config

    async def send_booking_confirmation(
        self, 
        booking: Booking, 
        language: str = "en"
    ) -> bool:
        """Send booking confirmation email."""
        template = self.get_template("booking_confirmation", language)
        html_content = template.render(booking=booking)
        
        return await self.send_email(
            to=booking.client_email,
            subject=self.get_subject("booking_confirmation", language),
            html_content=html_content
        )

    async def send_webinar_reminder(
        self, 
        registration: WebinarRegistration,
        days_before: int
    ) -> bool:
        """Send webinar reminder email."""
        # Implementation details
        pass
```

### Calendar Service
```python
class CalendarService:
    def __init__(self, google_credentials: dict):
        self.credentials = google_credentials

    async def check_availability(
        self, 
        consultant: Consultant,
        start_time: datetime,
        end_time: datetime
    ) -> bool:
        """Check if consultant is available for booking."""
        # Google Calendar integration
        calendar_service = await self.get_calendar_service(consultant.calendar_id)
        
        events = await calendar_service.events().list(
            calendarId=consultant.calendar_id,
            timeMin=start_time.isoformat(),
            timeMax=end_time.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        return len(events.get('items', [])) == 0

    async def create_event(self, booking: Booking) -> str:
        """Create calendar event for booking."""
        event = {
            'summary': f'Consultation - {booking.client_name}',
            'description': booking.message,
            'start': {
                'dateTime': booking.datetime.isoformat(),
                'timeZone': booking.timezone
            },
            'end': {
                'dateTime': (booking.datetime + timedelta(minutes=booking.duration)).isoformat(),
                'timeZone': booking.timezone
            },
            'attendees': [
                {'email': booking.consultant.email},
                {'email': booking.client_email}
            ]
        }
        
        created_event = await self.calendar_service.events().insert(
            calendarId=booking.consultant.calendar_id,
            body=event
        ).execute()
        
        return created_event['id']
```

## Background Tasks (Celery)

### Task Configuration
```python
from celery import Celery

celery_app = Celery(
    "magnetiq",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "send-webinar-reminders": {
            "task": "app.tasks.webinar_reminders",
            "schedule": crontab(hour=9, minute=0),  # Daily at 9 AM
        },
        "sync-odoo-leads": {
            "task": "app.tasks.sync_odoo_leads",
            "schedule": crontab(hour=23, minute=0),  # Daily at 11 PM
        }
    }
)
```

### Email Tasks
```python
@celery_app.task(bind=True, max_retries=3)
async def send_email_task(self, email_data: dict):
    """Background task for sending emails."""
    try:
        email_service = EmailService()
        await email_service.send_email(**email_data)
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@celery_app.task
async def send_webinar_reminders():
    """Send reminders for upcoming webinars."""
    # Find webinars starting in 7 days
    upcoming_webinars = await WebinarService.get_upcoming(days=7)
    
    for webinar in upcoming_webinars:
        for registration in webinar.registrations:
            await send_email_task.delay({
                "to": registration.email,
                "template": "webinar_reminder_7_days",
                "data": {"webinar": webinar, "registration": registration}
            })
```

### Integration Tasks
```python
@celery_app.task(bind=True, max_retries=5)
async def sync_odoo_leads(self):
    """Sync leads to Odoo CRM."""
    try:
        odoo_service = OdooService()
        lead_service = LeadService()
        
        # Get unsent leads
        unsent_leads = await lead_service.get_unsent_leads()
        
        for lead in unsent_leads:
            success = await odoo_service.create_lead(lead)
            if success:
                await lead_service.mark_as_sent(lead.id)
                
    except Exception as exc:
        raise self.retry(exc=exc, countdown=300)  # Retry in 5 minutes
```

## Error Handling & Logging

### Custom Exception Classes
```python
class MagnetiqException(Exception):
    """Base exception for Magnetiq application."""
    def __init__(self, message: str, code: str = None):
        self.message = message
        self.code = code or self.__class__.__name__.upper()
        super().__init__(self.message)

class ValidationError(MagnetiqException):
    """Raised when validation fails."""
    pass

class AuthenticationError(MagnetiqException):
    """Raised when authentication fails."""
    pass

class PermissionError(MagnetiqException):
    """Raised when user lacks required permissions."""
    pass

class IntegrationError(MagnetiqException):
    """Raised when external integration fails."""
    pass
```

### Global Exception Handler
```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(MagnetiqException)
async def magnetiq_exception_handler(request: Request, exc: MagnetiqException):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            },
            "metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": str(uuid.uuid4())
            }
        }
    )
```

### Logging Configuration
```python
import logging
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()
```

### Request Logging Middleware
```python
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Add request ID to context
    request.state.request_id = request_id
    
    # Log request
    logger.info(
        "Request started",
        method=request.method,
        url=str(request.url),
        request_id=request_id,
        user_agent=request.headers.get("user-agent")
    )
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(
        "Request completed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time,
        request_id=request_id
    )
    
    response.headers["X-Request-ID"] = request_id
    return response
```

## Health Monitoring

### Health Check Endpoints
```python
from fastapi import status
from sqlalchemy import text

@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
async def health_check():
    """Basic health check endpoint for load balancers"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.VERSION,
        "service": "magnetiq-api"
    }

@app.get("/health/detailed", status_code=status.HTTP_200_OK, tags=["Health"])
async def detailed_health_check(
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """Comprehensive health check with all dependencies and performance metrics"""
    start_time = time.time()
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "services": {},
        "metrics": {}
    }
    
    # Database health check with timing
    db_start = time.time()
    try:
        await db.execute(text("SELECT 1"))
        db_time = round((time.time() - db_start) * 1000, 2)
        health_status["services"]["database"] = {
            "status": "healthy",
            "response_time_ms": db_time,
            "connection_pool": {
                "size": db.bind.pool.size(),
                "checked_out": db.bind.pool.checked_out()
            }
        }
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "error": str(e),
            "response_time_ms": round((time.time() - db_start) * 1000, 2)
        }
        health_status["status"] = "degraded"
    
    # Redis health check with metrics
    redis_start = time.time()
    try:
        await redis.ping()
        redis_info = await redis.info()
        redis_time = round((time.time() - redis_start) * 1000, 2)
        
        health_status["services"]["redis"] = {
            "status": "healthy",
            "response_time_ms": redis_time,
            "memory_usage_mb": round(redis_info.get('used_memory', 0) / 1024 / 1024, 2),
            "connected_clients": redis_info.get('connected_clients', 0),
            "hit_rate": round(redis_info.get('keyspace_hits', 0) / 
                           max(redis_info.get('keyspace_hits', 0) + redis_info.get('keyspace_misses', 1), 1) * 100, 2)
        }
    except Exception as e:
        health_status["services"]["redis"] = {
            "status": "unhealthy",
            "error": str(e),
            "response_time_ms": round((time.time() - redis_start) * 1000, 2)
        }
        health_status["status"] = "degraded"
    
    # External services health check
    external_services = await check_external_services()
    health_status["services"].update(external_services)
    
    # System metrics
    health_status["metrics"] = {
        "total_check_time_ms": round((time.time() - start_time) * 1000, 2),
        "active_connections": len(db.bind.pool._pool.queue) if hasattr(db.bind.pool, '_pool') else 0,
        "memory_usage_mb": psutil.virtual_memory().used / 1024 / 1024 if 'psutil' in globals() else None,
        "cpu_percent": psutil.cpu_percent() if 'psutil' in globals() else None
    }
    
    return health_status


@app.get("/health/ready", status_code=status.HTTP_200_OK, tags=["Health"])
async def readiness_check(
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """Kubernetes readiness probe endpoint"""
    try:
        # Quick dependency checks
        await db.execute(text("SELECT 1"))
        await redis.ping()
        
        return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service not ready: {str(e)}")


@app.get("/health/live", status_code=status.HTTP_200_OK, tags=["Health"])
async def liveness_check():
    """Kubernetes liveness probe endpoint"""
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}
```

## Rate Limiting

### Advanced Rate Limiting Implementation
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from typing import Optional

def get_rate_limit_key(request: Request) -> str:
    """Enhanced key function for rate limiting"""
    # Use authenticated user ID if available, otherwise IP
    if hasattr(request.state, 'user') and request.state.user:
        return f"user:{request.state.user.id}"
    return f"ip:{get_remote_address(request)}"

def get_user_role_limit_key(request: Request) -> str:
    """Role-based rate limiting"""
    if hasattr(request.state, 'user') and request.state.user:
        role = request.state.user.role
        user_id = request.state.user.id
        return f"user:{user_id}:role:{role}"
    return f"ip:{get_remote_address(request)}:role:anonymous"

limiter = Limiter(key_func=get_rate_limit_key)
role_limiter = Limiter(key_func=get_user_role_limit_key)
app.state.limiter = limiter
app.state.role_limiter = role_limiter

# Custom rate limit exceeded handler
@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    response = JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": f"Rate limit exceeded: {exc.detail}",
                "retry_after": exc.retry_after
            },
            "metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": getattr(request.state, 'request_id', None)
            }
        }
    )
    response.headers["Retry-After"] = str(exc.retry_after)
    return response

# Enhanced rate limiting examples with role-based limits

@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")  # Strict limit for login attempts
async def login(request: Request, credentials: LoginCredentials):
    # Login implementation with additional security measures
    pass

@app.post("/api/v1/public/webinars/{id}/register")
@limiter.limit("10/minute")  # Public endpoint limit
async def register_webinar(request: Request, id: UUID, registration: WebinarRegistration):
    # Registration implementation
    pass

@app.post("/api/v1/admin/users")
@role_limiter.limit("50/hour", per_method=True)  # Role-based limit for admin operations
async def create_admin_user(request: Request, user_data: CreateUserRequest):
    # Admin user creation with higher limits for admin roles
    pass

@app.get("/api/v1/public/pages/{slug}")
@limiter.limit("1000/hour")  # High limit for public content
async def get_public_page(request: Request, slug: str):
    # Public page access with generous limits
    pass

# Custom decorators for dynamic rate limiting
def dynamic_rate_limit(base_limit: str, role_multipliers: Dict[str, float] = None):
    """Dynamic rate limiting based on user role"""
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            user_role = getattr(request.state, 'user', {}).get('role', 'anonymous')
            multipliers = role_multipliers or {'admin': 2.0, 'editor': 1.5, 'viewer': 1.0}
            multiplier = multipliers.get(user_role, 1.0)
            
            # Apply dynamic limit (implementation depends on rate limiting library)
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
```


## Deployment Configuration

### Environment Variables
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Magnetiq v2"
    VERSION: str = "2.0.0"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 3000  # Development port as required
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/magnetiq"
    DB_ECHO: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "RS256"
    
    # Email
    SMTP_HOST: str = "smtp-relay.brevo.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    
    # External APIs
    GOOGLE_CALENDAR_CLIENT_ID: str
    GOOGLE_CALENDAR_CLIENT_SECRET: str
    ODOO_URL: str
    ODOO_DATABASE: str
    ODOO_USERNAME: str
    ODOO_API_KEY: str
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### Docker Configuration
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash magnetiq
USER magnetiq

# Expose port
EXPOSE 3000

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
```

## Performance Optimization

### Database Query Optimization
```python
# Use async queries with proper indexing
async def get_webinars_with_speakers(
    db: AsyncSession,
    limit: int = 10,
    offset: int = 0
) -> List[Webinar]:
    query = (
        select(Webinar)
        .options(joinedload(Webinar.speaker))
        .where(Webinar.status == "published")
        .order_by(Webinar.datetime.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(query)
    return result.unique().scalars().all()
```

### Caching Strategy
```python
from functools import wraps
import json
import pickle

def cache_result(expire: int = 300):
    """Cache function result in Redis."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached = await redis.get(cache_key)
            if cached:
                return pickle.loads(cached)
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            await redis.setex(cache_key, expire, pickle.dumps(result))
            
            return result
        return wrapper
    return decorator

@cache_result(expire=600)  # Cache for 10 minutes
async def get_popular_webinars():
    # Expensive query
    return await WebinarService.get_popular()
```

## Testing Strategy

### Comprehensive Test Configuration
```python
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
import fakeredis.aioredis
from typing import AsyncGenerator

# Test database configuration
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create test database engine"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
        echo=False
    )
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Cleanup
    await engine.dispose()

@pytest_asyncio.fixture
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session"""
    async with AsyncSessionLocal(bind=test_engine) as session:
        async with session.begin():
            yield session
            await session.rollback()

@pytest_asyncio.fixture
async def test_redis():
    """Create fake Redis instance for testing"""
    return fakeredis.aioredis.FakeRedis()

@pytest_asyncio.fixture
async def client(test_db, test_redis) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with dependency overrides"""
    app.dependency_overrides[get_db] = lambda: test_db
    app.dependency_overrides[get_redis] = lambda: test_redis
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    # Clear overrides
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def test_admin_user(test_db: AsyncSession):
    """Create test admin user"""
    from app.models.users import AdminUser
    from app.core.security import get_password_hash
    
    user = AdminUser(
        email="admin@voltaic.systems",
        hashed_password=get_password_hash("test-password"),
        first_name="Test",
        last_name="Admin",
        role="admin",
        is_active=True
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    return user

@pytest_asyncio.fixture
async def admin_headers(client: AsyncClient, test_admin_user):
    """Create authenticated admin headers"""
    login_data = {
        "email": "admin@voltaic.systems",
        "password": "test-password"
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest_asyncio.fixture
async def editor_headers(client: AsyncClient, test_db: AsyncSession):
    """Create authenticated editor headers"""
    from app.models.users import AdminUser
    from app.core.security import get_password_hash
    
    user = AdminUser(
        email="editor@voltaic.systems",
        hashed_password=get_password_hash("test-password"),
        first_name="Test",
        last_name="Editor",
        role="editor",
        is_active=True
    )
    test_db.add(user)
    await test_db.commit()
    
    login_data = {
        "email": "editor@voltaic.systems",
        "password": "test-password"
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

# Comprehensive test examples

@pytest.mark.asyncio
async def test_create_webinar_success(client: AsyncClient, admin_headers: dict, test_db: AsyncSession):
    """Test successful webinar creation"""
    # Create test speaker first
    speaker_data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "biography": {"en": "Expert in AI", "de": "Experte in KI"}
    }
    speaker_response = await client.post(
        "/api/v1/admin/speakers",
        json=speaker_data,
        headers=admin_headers
    )
    speaker_id = speaker_response.json()["data"]["id"]
    
    # Create webinar
    webinar_data = {
        "title": {"en": "AI in Manufacturing", "de": "KI in der Fertigung"},
        "description": {"en": "Learn about AI applications", "de": "Erfahren Sie mehr über KI-Anwendungen"},
        "speaker_id": speaker_id,
        "datetime": "2024-12-15T14:00:00Z",
        "duration": 60,
        "capacity": 100,
        "price": 0.00
    }
    
    response = await client.post(
        "/api/v1/admin/webinars",
        json=webinar_data,
        headers=admin_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["title"]["en"] == "AI in Manufacturing"
    assert data["data"]["speaker_id"] == speaker_id
    assert "slug" in data["data"]
    assert "id" in data["data"]

@pytest.mark.asyncio
async def test_create_webinar_validation_error(client: AsyncClient, admin_headers: dict):
    """Test webinar creation with validation errors"""
    webinar_data = {
        "title": {"en": ""},  # Empty title should fail validation
        "speaker_id": "invalid-uuid",  # Invalid UUID format
        "datetime": "invalid-date",  # Invalid date format
        "duration": -30  # Negative duration
    }
    
    response = await client.post(
        "/api/v1/admin/webinars",
        json=webinar_data,
        headers=admin_headers
    )
    
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert "details" in data["error"]
    assert len(data["error"]["details"]) > 0

@pytest.mark.asyncio
async def test_get_webinar_list_pagination(client: AsyncClient):
    """Test webinar list with pagination"""
    # Test public endpoint
    response = await client.get("/api/v1/public/webinars?page=1&limit=10")
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "webinars" in data["data"]
    assert "pagination" in data["data"]
    
    pagination = data["data"]["pagination"]
    assert "page" in pagination
    assert "limit" in pagination
    assert "total" in pagination
    assert "pages" in pagination

@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    """Test unauthorized access to admin endpoints"""
    response = await client.post("/api/v1/admin/webinars", json={})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_insufficient_permissions(client: AsyncClient, editor_headers: dict):
    """Test insufficient permissions for user management"""
    user_data = {
        "email": "newuser@example.com",
        "profile": {
            "first_name": "New",
            "last_name": "User"
        },
        "role": "admin"
    }
    
    response = await client.post(
        "/api/v1/admin/users",
        json=user_data,
        headers=editor_headers
    )
    
    assert response.status_code == 403
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INSUFFICIENT_PERMISSIONS"

@pytest.mark.asyncio
async def test_rate_limiting(client: AsyncClient):
    """Test rate limiting on login endpoint"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrong-password"
    }
    
    # Attempt multiple failed logins
    for _ in range(6):  # Exceed the 5/minute limit
        response = await client.post("/api/v1/auth/login", json=login_data)
    
    # Should be rate limited now
    assert response.status_code == 429
    assert "Retry-After" in response.headers

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoints"""
    # Basic health check
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    
    # Detailed health check
    response = await client.get("/health/detailed")
    assert response.status_code == 200
    data = response.json()
    assert "services" in data
    assert "database" in data["services"]
    assert "redis" in data["services"]

@pytest.mark.asyncio
async def test_cors_headers(client: AsyncClient):
    """Test CORS headers are properly set"""
    response = await client.options("/api/v1/public/pages/home")
    assert "Access-Control-Allow-Origin" in response.headers
    assert "Access-Control-Allow-Methods" in response.headers
```

## Security Considerations

### Input Validation
```python
from pydantic import validator, EmailStr

class WebinarRegistration(BaseModel):
    attendee_email: EmailStr
    attendee_name: str = Field(..., min_length=2, max_length=100)
    company: str = Field(..., min_length=2, max_length=200)
    terms_accepted: bool
    
    @validator('terms_accepted')
    def terms_must_be_accepted(cls, v):
        if not v:
            raise ValueError('Terms and conditions must be accepted')
        return v
```

### SQL Injection Prevention
All database queries use SQLAlchemy ORM with parameterized queries, preventing SQL injection attacks.

### XSS Protection
- All user input is validated and sanitized
- HTML content is escaped before rendering
- CSP headers are set for additional protection

### CSRF Protection
- CSRF tokens for state-changing operations
- SameSite cookie attributes
- Origin header validation

## API Performance Monitoring

### Metrics Collection
```python
from prometheus_client import Counter, Histogram, Gauge
import time

# API Metrics
api_requests_total = Counter(
    'api_requests_total',
    'Total number of API requests',
    ['method', 'endpoint', 'status_code']
)

api_request_duration = Histogram(
    'api_request_duration_seconds',
    'API request duration in seconds',
    ['method', 'endpoint']
)

active_sessions = Gauge(
    'active_user_sessions',
    'Number of active user sessions'
)

# Custom middleware for metrics collection
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    # Record metrics
    duration = time.time() - start_time
    method = request.method
    endpoint = request.url.path
    status_code = response.status_code
    
    api_requests_total.labels(
        method=method, 
        endpoint=endpoint, 
        status_code=status_code
    ).inc()
    
    api_request_duration.labels(
        method=method, 
        endpoint=endpoint
    ).observe(duration)
    
    return response
```

### API Documentation Standards

```python
# Enhanced OpenAPI configuration
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Magnetiq v2 API",
        version="2.0.0",
        description="""
        Comprehensive API for voltAIc Systems content management and business automation.
        
        ## Authentication
        This API uses JWT Bearer tokens for authentication. Include the token in the Authorization header:
        ```
        Authorization: Bearer <your-token>
        ```
        
        ## Rate Limiting
        API requests are rate-limited based on user role and endpoint sensitivity.
        
        ## Error Handling
        All errors follow a consistent format with detailed field-level validation messages.
        """,
        routes=app.routes,
        contact={
            "name": "voltAIc Systems API Support",
            "email": "api-support@voltaic.systems",
            "url": "https://voltaic.systems/support"
        },
        license_info={
            "name": "Proprietary",
            "url": "https://voltaic.systems/license"
        },
        servers=[
            {"url": "https://api.voltaic.systems", "description": "Production server"},
            {"url": "https://staging-api.voltaic.systems", "description": "Staging server"},
            {"url": "http://localhost:3000", "description": "Development server"}
        ]
    )
    
    # Enhanced security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token obtained from /api/v1/auth/login"
        },
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "API key for external integrations"
        }
    }
    
    # Global security requirement
    openapi_schema["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

This comprehensive and modernized backend API specification provides a robust foundation for Magnetiq v2, incorporating advanced security, performance optimization, comprehensive testing, monitoring capabilities, and production-ready features that align with the updated system architecture.