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
- **Development**: Port 3000 (as per requirements)
- **Production**: Port 8000 (standard)
- **Health Checks**: Same port with dedicated endpoints

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
- **Production**: `https://api.voltaic.systems`
- **All routes**: Prefixed with `/api/` (as per requirements)
- **Version**: `/api/v1/` for current version

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
- **200 OK**: Successful operation
- **201 Created**: Resource created successfully
- **204 No Content**: Successful operation with no content
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (duplicate, etc.)
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Authentication & Authorization

### JWT Implementation
```python
class JWTSettings:
    ALGORITHM = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    ISSUER = "voltaic-systems"
    AUDIENCE = "magnetiq-api"
```

### Token Structure
```json
{
  "sub": "user-uuid",
  "email": "user@voltaic.systems",
  "role": "admin",
  "permissions": ["content:read", "content:write"],
  "iat": 1640995200,
  "exp": 1640996100,
  "iss": "voltaic-systems",
  "aud": "magnetiq-api"
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
    # Content permissions
    CONTENT_READ = "content:read"
    CONTENT_WRITE = "content:write"
    CONTENT_DELETE = "content:delete"
    
    # Business permissions
    WEBINARS_MANAGE = "webinars:manage"
    CONSULTANTS_MANAGE = "consultants:manage"
    BOOKINGS_MANAGE = "bookings:manage"
    
    # Admin permissions
    USERS_MANAGE = "users:manage"
    SYSTEM_ADMIN = "system:admin"

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"
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

### Base Service Class
```python
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar('T')

class BaseService(Generic[T], ABC):
    def __init__(self, db: AsyncSession):
        self.db = db

    @abstractmethod
    async def create(self, data: dict) -> T:
        pass

    @abstractmethod
    async def get_by_id(self, id: UUID) -> Optional[T]:
        pass

    @abstractmethod
    async def list(self, skip: int = 0, limit: int = 100) -> List[T]:
        pass

    @abstractmethod
    async def update(self, id: UUID, data: dict) -> Optional[T]:
        pass

    @abstractmethod
    async def delete(self, id: UUID) -> bool:
        pass
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

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Basic health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": app.version
    }

@app.get("/health/detailed", status_code=status.HTTP_200_OK)
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """Detailed health check with dependencies."""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": app.version,
        "services": {}
    }
    
    # Check database
    try:
        await db.execute(text("SELECT 1"))
        health_status["services"]["database"] = {
            "status": "healthy",
            "response_time_ms": 10
        }
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # Check Redis
    try:
        await redis.ping()
        health_status["services"]["redis"] = {"status": "healthy"}
    except Exception as e:
        health_status["services"]["redis"] = {
            "status": "unhealthy",
            "error": str(e)
        }
    
    return health_status
```

## Rate Limiting

### Rate Limiter Implementation
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")  # 5 login attempts per minute
async def login(request: Request, credentials: LoginCredentials):
    # Login implementation
    pass

@app.post("/api/v1/public/webinars/{id}/register")
@limiter.limit("10/minute")  # 10 registrations per minute
async def register_webinar(request: Request, id: UUID, registration: WebinarRegistration):
    # Registration implementation
    pass
```

## API Documentation

### OpenAPI Configuration
```python
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Magnetiq v2 API",
        version="2.0.0",
        description="Comprehensive API for voltAIc Systems content management and business automation",
        routes=app.routes,
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="/static/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger-ui.css",
    )
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

### Test Configuration
```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def admin_headers(client: AsyncClient):
    # Login as admin and return headers
    login_data = {
        "email": "admin@voltaic.systems",
        "password": "test-password"
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_create_webinar(client: AsyncClient, admin_headers: dict):
    webinar_data = {
        "title": {"en": "Test Webinar", "de": "Test Webinar"},
        "speaker_id": "speaker-uuid",
        "datetime": "2024-01-15T14:00:00Z",
        "duration": 60
    }
    
    response = await client.post(
        "/api/v1/admin/webinars",
        json=webinar_data,
        headers=admin_headers
    )
    
    assert response.status_code == 201
    assert response.json()["success"] is True
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

This comprehensive backend API specification provides a solid foundation for implementing Magnetiq v2 with security, performance, and maintainability in mind.