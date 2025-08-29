# Magnetiq v2 - Testing Strategy Specification

## Overview

The testing strategy for Magnetiq v2 ensures comprehensive coverage across all system components, from unit tests to end-to-end user workflows. This specification defines testing approaches, tools, and quality gates for reliable software delivery.

## Testing Pyramid

### Test Dependencies and Flow
![Request Lifecycle Dependencies](../diagrams/assets/shorts/request_lifecycle_dependencies.png)

Tests must validate each stage of the request lifecycle including middleware, dependency injection, business logic, and error handling paths.

### Unit Tests (70% of tests)
- **Scope**: Individual functions, classes, and components
- **Tools**: Jest (Frontend), Pytest (Backend)
- **Coverage Target**: >90%
- **Execution**: Every commit via CI/CD

### Integration Tests (20% of tests)
- **Scope**: Component interactions and API endpoints
- **Tools**: React Testing Library, httpx (Python)
- **Coverage Target**: >80%
- **Execution**: Before deployment

### End-to-End Tests (10% of tests)
- **Scope**: Complete user workflows
- **Tools**: Playwright
- **Coverage Target**: Critical user journeys
- **Execution**: Before production release

## Frontend Testing

### Component Testing
```typescript
// Example: WebinarCard component test
import { render, screen, fireEvent } from '@testing-library/react';
import { WebinarCard } from '@/components/WebinarCard';

describe('WebinarCard', () => {
  const mockWebinar = {
    id: 'webinar-1',
    title: { en: 'AI in Manufacturing', de: 'KI in der Fertigung' },
    datetime: new Date('2024-02-15T14:00:00Z'),
    speaker: { name: 'Dr. Pascal Köth', photo: '/speaker.jpg' },
    registrationCount: 45,
    capacity: 100
  };

  it('renders webinar information correctly', () => {
    render(<WebinarCard webinar={mockWebinar} language="en" />);
    
    expect(screen.getByText('AI in Manufacturing')).toBeInTheDocument();
    expect(screen.getByText('Dr. Pascal Köth')).toBeInTheDocument();
    expect(screen.getByText('45 of 100 registered')).toBeInTheDocument();
  });

  it('handles registration click', async () => {
    const onRegister = jest.fn();
    render(<WebinarCard webinar={mockWebinar} onRegister={onRegister} />);
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    expect(onRegister).toHaveBeenCalledWith(mockWebinar.id);
  });

  it('displays German content when language is de', () => {
    render(<WebinarCard webinar={mockWebinar} language="de" />);
    expect(screen.getByText('KI in der Fertigung')).toBeInTheDocument();
  });
});
```

### API Integration Testing
```typescript
// Example: API service tests
import { bookAMeetingService } from '@/services/bookAMeeting';
import { server } from '@/test-utils/mock-server';

describe('BookingService', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('creates book-a-meeting successfully', async () => {
    const bookingData = {
      consultantId: 'consultant-1',
      datetime: new Date('2024-02-20T10:00:00Z'),
      duration: 60,
      clientInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }
    };

    const result = await bookAMeetingService.createBooking(bookingData);

    expect(result.success).toBe(true);
    expect(result.data.reference).toMatch(/^VLT-\d{8}-\w{4}$/);
  });

  it('handles book-a-meeting conflicts', async () => {
    server.use(
      rest.post('/api/v1/public/bookings', (req, res, ctx) => {
        return res(
          ctx.status(409),
          ctx.json({
            success: false,
            error: {
              code: 'TIME_SLOT_UNAVAILABLE',
              message: 'Selected time slot is no longer available'
            }
          })
        );
      })
    );

    const result = await bookAMeetingService.createBooking(bookingData);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe('TIME_SLOT_UNAVAILABLE');
  });
});
```

## Backend Testing

### Unit Testing
```python
# Example: Service layer tests
import pytest
from unittest.mock import Mock, patch
from services.webinar_service import WebinarService
from models.webinar import WebinarSession
from schemas.webinar import WebinarSessionCreate

@pytest.fixture
def webinar_service(mock_db_session):
    return WebinarService(mock_db_session)

@pytest.fixture
def sample_webinar_data():
    return WebinarSessionCreate(
        topic_id="topic-1",
        speaker_id="speaker-1",
        datetime=datetime(2024, 2, 15, 14, 0),
        duration=60,
        title={"en": "Test Webinar", "de": "Test Webinar"},
        capacity=100
    )

class TestWebinarService:
    @pytest.mark.asyncio
    async def test_create_webinar_session(self, webinar_service, sample_webinar_data):
        # Mock dependencies
        with patch('services.webinar_service.generate_slug') as mock_slug:
            mock_slug.return_value = "test-webinar"
            
            session = await webinar_service.create_session(
                sample_webinar_data, 
                created_by="admin-1"
            )
            
            assert session.topic_id == "topic-1"
            assert session.slug == "test-webinar"
            assert session.capacity == 100

    @pytest.mark.asyncio
    async def test_register_for_webinar(self, webinar_service):
        registration_data = {
            "session_id": "session-1",
            "attendee_email": "test@example.com",
            "attendee_name": "Test User"
        }
        
        with patch.object(webinar_service, 'check_capacity') as mock_capacity:
            mock_capacity.return_value = True
            
            registration = await webinar_service.register_attendee(registration_data)
            
            assert registration.attendee_email == "test@example.com"
            assert registration.status == "confirmed"

    @pytest.mark.asyncio
    async def test_registration_capacity_exceeded(self, webinar_service):
        with patch.object(webinar_service, 'check_capacity') as mock_capacity:
            mock_capacity.return_value = False
            
            with pytest.raises(CapacityExceededError):
                await webinar_service.register_attendee(registration_data)
```

### API Endpoint Testing
```python
# Example: FastAPI endpoint tests
import pytest
from httpx import AsyncClient
from main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def admin_headers(client):
    # Login as admin and get token
    login_data = {"email": "admin@voltAIc.systems", "password": "test-pass"}
    response = await client.post("/api/v1/auth/login", json=login_data)
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

class TestWebinarEndpoints:
    @pytest.mark.asyncio
    async def test_get_public_webinars(self, client):
        response = await client.get("/api/v1/public/webinars")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "webinars" in data["data"]
        assert "pagination" in data["data"]

    @pytest.mark.asyncio
    async def test_create_webinar_session(self, client, admin_headers):
        webinar_data = {
            "topic_id": "topic-1",
            "speaker_id": "speaker-1",
            "datetime": "2024-02-15T14:00:00Z",
            "duration": 60,
            "capacity": 100
        }
        
        response = await client.post(
            "/api/v1/admin/webinars/sessions",
            json=webinar_data,
            headers=admin_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["capacity"] == 100

    @pytest.mark.asyncio
    async def test_register_for_webinar(self, client):
        registration_data = {
            "attendee": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@example.com",
                "company": "ACME Corp"
            },
            "terms_accepted": True
        }
        
        response = await client.post(
            "/api/v1/public/webinars/session-1/register",
            json=registration_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "registration_id" in data["data"]
```

## Database Testing

### Database Model Dependencies
![Model Dependencies with Cascades](../diagrams/assets/shorts/model_dependencies_cascades.png)

Database tests must validate model relationships, cascade behaviors (CASCADE, SET NULL, RESTRICT), and maintain referential integrity across all operations.

### Model Testing
```python
# Example: SQLAlchemy model tests
import pytest
from models.book_a_meeting import BookAMeeting, BookingStatus
from datetime import datetime, timedelta

class TestBookingModel:
    def test_booking_creation(self, db_session):
        booking = BookAMeeting(
            consultant_id="consultant-1",
            datetime=datetime.now() + timedelta(days=1),
            duration=60,
            client_first_name="John",
            client_last_name="Doe",
            client_email="john@example.com"
        )
        
        db_session.add(booking)
        db_session.commit()
        
        assert booking.id is not None
        assert booking.reference.startswith("VLT-")
        assert booking.status == BookingStatus.CONFIRMED

    def test_booking_reference_generation(self, db_session):
        booking = BookAMeeting(
            consultant_id="consultant-1",
            datetime=datetime(2024, 2, 15, 10, 0),
            duration=60,
            client_email="test@example.com"
        )
        
        db_session.add(booking)
        db_session.commit()
        
        # Reference format: VLT-YYYYMMDD-XXXX
        assert booking.reference.startswith("VLT-20240215-")
        assert len(booking.reference.split("-")[2]) == 4

    def test_booking_validation(self):
        with pytest.raises(ValueError):
            Booking(
                consultant_id="consultant-1",
                datetime=datetime.now() - timedelta(days=1),  # Past date
                duration=60,
                client_email="invalid-email"  # Invalid email
            )
```

### Migration Testing
```python
# Example: Alembic migration tests
import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text

class TestDatabaseMigrations:
    def test_migrations_run_successfully(self, db_engine):
        alembic_cfg = Config("alembic.ini")
        
        # Run all migrations
        command.upgrade(alembic_cfg, "head")
        
        # Check that all expected tables exist
        inspector = inspect(db_engine)
        tables = inspector.get_table_names()
        
        expected_tables = [
            'admin_users', 'bookings', 'webinar_sessions',
            'webinar_registrations', 'whitepapers', 'whitepaper_downloads'
        ]
        
        for table in expected_tables:
            assert table in tables

    def test_rollback_migration(self, db_engine):
        alembic_cfg = Config("alembic.ini")
        
        # Get current revision
        with db_engine.connect() as conn:
            result = conn.execute(text("SELECT version_num FROM alembic_version"))
            current_revision = result.scalar()
        
        # Rollback one revision
        command.downgrade(alembic_cfg, "-1")
        
        # Upgrade back
        command.upgrade(alembic_cfg, "head")
        
        # Verify we're back to current revision
        with db_engine.connect() as conn:
            result = conn.execute(text("SELECT version_num FROM alembic_version"))
            final_revision = result.scalar()
        
        assert final_revision == current_revision
```

## Integration Testing

### Communication Services Testing

#### OAuth2 Flow Testing
```python
# Test OAuth2 authentication flows for social platforms
import pytest
from unittest.mock import patch, AsyncMock
from services.oauth2_service import SecureOAuth2Service

class TestOAuth2Integration:
    @pytest.fixture
    def oauth_service(self, redis_mock):
        return SecureOAuth2Service(redis_mock)
    
    @pytest.mark.asyncio
    async def test_linkedin_oauth_initiation(self, oauth_service):
        """Test LinkedIn OAuth2 flow initiation"""
        user_id = "user123"
        platform = "linkedin"
        redirect_uri = "https://voltAIc.systems/auth/callback"
        
        result = await oauth_service.initiate_oauth_flow(
            platform, user_id, redirect_uri
        )
        
        assert "auth_url" in result
        assert "state" in result
        assert "linkedin.com/oauth/v2/authorization" in result["auth_url"]
        assert "w_member_social" in result["auth_url"]  # Check scope
    
    @pytest.mark.asyncio
    async def test_twitter_oauth_with_pkce(self, oauth_service):
        """Test Twitter OAuth2 with PKCE implementation"""
        user_id = "user123"
        platform = "twitter"
        redirect_uri = "https://voltAIc.systems/auth/callback"
        
        result = await oauth_service.initiate_oauth_flow(
            platform, user_id, redirect_uri
        )
        
        assert "code_challenge" in result["auth_url"]
        assert "code_challenge_method=S256" in result["auth_url"]
    
    @pytest.mark.asyncio
    async def test_oauth_state_validation(self, oauth_service):
        """Test CSRF protection via state validation"""
        # Test invalid state
        invalid_result = await oauth_service.handle_oauth_callback(
            "linkedin", "test_code", "invalid_state", "redirect_uri"
        )
        
        assert invalid_result is None  # Should reject invalid state
```

#### Social Media Content Testing
```python
class TestSocialMediaContent:
    @pytest.fixture
    def content_validator(self):
        from services.social_content_security import SocialContentSecurityService
        return SocialContentSecurityService()
    
    @pytest.mark.asyncio
    async def test_content_sanitization(self, content_validator):
        """Test malicious content detection and sanitization"""
        malicious_content = {
            "text": "<script>alert('xss')</script>Check out our services!",
            "links": ["https://voltAIc.systems"]
        }
        
        result = await content_validator.validate_social_content(
            "linkedin", malicious_content
        )
        
        assert result["is_valid"] is False
        assert "malicious content" in result["errors"][0].lower()
        assert "<script>" not in result["sanitized_content"]["text"]
    
    @pytest.mark.asyncio
    async def test_platform_content_limits(self, content_validator):
        """Test platform-specific content validation"""
        # Test Twitter character limit
        long_content = {"text": "x" * 300}  # Exceeds 280 char limit
        
        result = await content_validator.validate_social_content(
            "twitter", long_content
        )
        
        assert result["is_valid"] is False
        assert any("length" in error.lower() for error in result["errors"])
    
    @pytest.mark.asyncio
    async def test_spam_detection(self, content_validator):
        """Test spam score calculation"""
        spam_content = {
            "text": "BUY NOW!!! AMAZING DEALS!!! #deal #sale #buy #now #cheap #discount #offer #limited",
            "links": ["http://spam1.com", "http://spam2.com", "http://spam3.com"]
        }
        
        result = await content_validator.validate_social_content(
            "linkedin", spam_content
        )
        
        # High spam score should trigger validation failure
        assert result["is_valid"] is False
        assert any("spam" in error.lower() for error in result["errors"])
```

#### Social Media Rate Limiting Tests
```python
class TestSocialMediaRateLimiting:
    @pytest.fixture
    def rate_limiter(self, redis_mock):
        from services.social_media_rate_limiter import SocialMediaRateLimiter
        return SocialMediaRateLimiter(redis_mock)
    
    @pytest.mark.asyncio
    async def test_linkedin_posting_limits(self, rate_limiter, redis_mock):
        """Test LinkedIn daily posting limits"""
        user_id = "user123"
        platform = "linkedin"
        
        # Simulate 25 posts (daily limit)
        redis_mock.get.return_value = "25"
        redis_mock.ttl.return_value = 3600
        
        result = await rate_limiter.check_posting_limit(
            user_id, platform, "posts"
        )
        
        assert result["allowed"] is False
        assert result["remaining"] == 0
        assert result["reset_in"] == 3600
    
    @pytest.mark.asyncio
    async def test_twitter_rate_limiting(self, rate_limiter, redis_mock):
        """Test Twitter 15-minute rate limits"""
        user_id = "user123"
        platform = "twitter"
        
        # Within limits
        redis_mock.get.return_value = "50"  # 50 out of 300
        
        result = await rate_limiter.check_posting_limit(
            user_id, platform, "tweets"
        )
        
        assert result["allowed"] is True
        assert result["remaining"] == 250
```

### Email Integration Tests
```python
# Example: Email service integration tests
import pytest
from unittest.mock import patch, MagicMock
from services.email_service import EmailService

class TestEmailIntegration:
    @pytest.fixture
    def email_service(self):
        config = {
            "smtp_host": "smtp.test.com",
            "smtp_port": 587,
            "username": "test@voltAIc.systems",
            "password": "test-password"
        }
        return EmailService(config)

    @pytest.mark.asyncio
    async def test_send_booking_confirmation(self, email_service):
        booking_data = {
            "reference": "VLT-20240215-ABC1",
            "client_email": "john@example.com",
            "client_name": "John Doe",
            "consultant_name": "Dr. Pascal Köth",
            "datetime": datetime(2024, 2, 15, 14, 0),
            "duration": 60
        }
        
        with patch('aiosmtplib.send') as mock_send:
            mock_send.return_value = True
            
            success = await email_service.send_booking_confirmation(
                booking_data, language="en"
            )
            
            assert success is True
            mock_send.assert_called_once()
            
            # Verify email content
            call_args = mock_send.call_args
            message = call_args[0][0]
            assert "Consultation Confirmed" in message['Subject']
            assert booking_data["reference"] in str(message)

    @pytest.mark.asyncio
    async def test_email_template_localization(self, email_service):
        with patch('aiosmtplib.send') as mock_send:
            mock_send.return_value = True
            
            # Test German email
            success = await email_service.send_booking_confirmation(
                booking_data, language="de"
            )
            
            call_args = mock_send.call_args
            message = call_args[0][0]
            assert "Beratungstermin bestätigt" in message['Subject']
```

### Calendar Integration Tests
```python
# Example: Google Calendar integration tests
import pytest
from unittest.mock import patch, MagicMock
from services.calendar_service import GoogleCalendarService

class TestCalendarIntegration:
    @pytest.fixture
    def calendar_service(self):
        config = {
            "client_id": "test-client-id",
            "client_secret": "test-client-secret"
        }
        return GoogleCalendarService(config)

    @pytest.mark.asyncio
    async def test_create_booking_event(self, calendar_service):
        booking_data = {
            "id": "booking-1",
            "datetime": datetime(2024, 2, 15, 14, 0),
            "duration": 60,
            "client_name": "John Doe",
            "client_email": "john@example.com",
            "consultant_calendar_id": "consultant@voltAIc.systems"
        }
        
        mock_event = {
            "id": "calendar-event-1",
            "htmlLink": "https://calendar.google.com/event/123"
        }
        
        with patch.object(calendar_service, 'service') as mock_service:
            mock_service.events().insert().execute.return_value = mock_event
            
            event_id = await calendar_service.create_booking_event(booking_data)
            
            assert event_id == "calendar-event-1"
            mock_service.events().insert.assert_called_once()

    @pytest.mark.asyncio
    async def test_check_availability(self, calendar_service):
        with patch.object(calendar_service, 'service') as mock_service:
            # Mock empty calendar response (available)
            mock_service.events().list().execute.return_value = {"items": []}
            
            is_available = await calendar_service.check_consultant_availability(
                "consultant@voltAIc.systems",
                datetime(2024, 2, 15, 14, 0),
                datetime(2024, 2, 15, 15, 0)
            )
            
            assert is_available["available"] is True
            assert len(is_available["conflicts"]) == 0
```

## End-to-End Testing

### User Workflow Tests
```typescript
// Example: Playwright E2E tests
import { test, expect } from '@playwright/test';

test.describe('Webinar Registration Flow', () => {
  test('complete webinar registration process', async ({ page }) => {
    // Navigate to webinars page
    await page.goto('/webinars');
    
    // Find and click on a webinar
    const webinarCard = page.locator('[data-testid="webinar-card"]').first();
    await webinarCard.click();
    
    // Click register button
    await page.click('[data-testid="register-button"]');
    
    // Fill registration form
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john.doe@example.com');
    await page.fill('[name="company"]', 'ACME Corp');
    
    // Accept terms
    await page.check('[name="termsAccepted"]');
    
    // Submit form
    await page.click('[data-testid="submit-registration"]');
    
    // Verify confirmation page
    await expect(page).toHaveURL(/\/webinars\/.*\/confirmation/);
    await expect(page.locator('h1')).toContainText('Registration Confirmed');
    
    // Verify calendar download buttons
    await expect(page.locator('[data-testid="google-calendar-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="outlook-calendar-button"]')).toBeVisible();
  });

  test('handles form validation errors', async ({ page }) => {
    await page.goto('/webinars/test-webinar');
    await page.click('[data-testid="register-button"]');
    
    // Submit empty form
    await page.click('[data-testid="submit-registration"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="error-firstName"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    
    // Fill valid email
    await page.fill('[name="email"]', 'invalid-email');
    await page.blur('[name="email"]');
    
    // Verify email format validation
    await expect(page.locator('[data-testid="error-email"]')).toContainText('Invalid email format');
  });
});

test.describe('Booking Flow', () => {
  test('complete consultation booking', async ({ page }) => {
    await page.goto('/book-consultation');
    
    // Select consultant
    await page.click('[data-testid="consultant-card"]');
    
    // Select date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`[data-date="${tomorrow.toISOString().split('T')[0]}"]`);
    await page.click('[data-testid="time-slot-10-00"]');
    
    // Fill client information
    await page.fill('[name="firstName"]', 'Jane');
    await page.fill('[name="lastName"]', 'Smith');
    await page.fill('[name="email"]', 'jane.smith@company.com');
    await page.fill('[name="company"]', 'Tech Corp');
    await page.fill('[name="message"]', 'Interested in AI automation solutions');
    
    // Accept terms
    await page.check('[name="termsAccepted"]');
    
    // Submit booking
    await page.click('[data-testid="confirm-booking"]');
    
    // Verify confirmation
    await expect(page.locator('[data-testid="booking-reference"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-confirmation"]')).toContainText('confirmed');
  });
});
```

### Performance Testing
```typescript
// Example: Performance testing with Playwright
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/webinars', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Under 3 seconds
    
    // Verify Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      });
    });
    
    expect(vitals.fcp).toBeLessThan(1500); // FCP under 1.5s
    expect(vitals.lcp).toBeLessThan(2500); // LCP under 2.5s
  });

  test('form submission performance', async ({ page }) => {
    await page.goto('/book-consultation');
    
    // Fill form
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', 'test@example.com');
    
    // Measure form submission time
    const startTime = Date.now();
    await page.click('[data-testid="submit-form"]');
    await page.waitForSelector('[data-testid="success-message"]');
    const submitTime = Date.now() - startTime;
    
    expect(submitTime).toBeLessThan(5000); // Under 5 seconds
  });
});
```

## Load Testing

### API Load Testing
```python
# Example: Locust load testing
from locust import HttpUser, task, between
import json
from datetime import datetime, timedelta

class WebinarLoadTest(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Setup for each user"""
        self.webinar_id = "test-webinar-1"
    
    @task(3)
    def view_webinars_list(self):
        """Most common action - viewing webinars"""
        response = self.client.get("/api/v1/public/webinars")
        assert response.status_code == 200
    
    @task(2)
    def view_webinar_detail(self):
        """View specific webinar"""
        response = self.client.get(f"/api/v1/public/webinars/{self.webinar_id}")
        assert response.status_code == 200
    
    @task(1)
    def register_for_webinar(self):
        """Register for webinar - less frequent but critical"""
        registration_data = {
            "attendee": {
                "first_name": "Load",
                "last_name": "Tester",
                "email": f"load.tester.{self.environment.runner.user_count}@example.com",
                "company": "Test Company"
            },
            "terms_accepted": True
        }
        
        response = self.client.post(
            f"/api/v1/public/webinars/{self.webinar_id}/register",
            json=registration_data
        )
        
        if response.status_code == 201:
            print(f"Registration successful: {response.json()}")
        elif response.status_code == 409:
            print("Webinar full - expected under load")
        else:
            print(f"Unexpected response: {response.status_code}")

class BookingLoadTest(HttpUser):
    wait_time = between(2, 5)
    
    @task(2)
    def check_availability(self):
        """Check consultant availability"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        response = self.client.get(
            f"/api/v1/public/availability?consultant_id=consultant-1&date={tomorrow}"
        )
        assert response.status_code == 200
    
    @task(1) 
    def create_booking(self):
        """Create booking - critical path"""
        booking_data = {
            "consultant_id": "consultant-1",
            "datetime": (datetime.now() + timedelta(days=1)).isoformat(),
            "duration": 60,
            "client": {
                "first_name": "Load",
                "last_name": "Test",
                "email": f"load.{self.environment.runner.user_count}@example.com",
                "company": "Load Test Corp"
            },
            "meeting_type": "video"
        }
        
        response = self.client.post(
            "/api/v1/public/bookings",
            json=booking_data
        )
        
        if response.status_code in [201, 409]:  # Success or conflict acceptable
            pass
        else:
            print(f"Booking failed: {response.status_code} - {response.text}")
```

## Test Data Management

### Test Fixtures
```python
# Example: Pytest fixtures for consistent test data
import pytest
from datetime import datetime, timedelta
from factories import (
    UserFactory, ConsultantFactory, WebinarSessionFactory, 
    BookingFactory, WhitepaperFactory
)

@pytest.fixture
def test_admin_user(db_session):
    """Create test admin user"""
    return UserFactory(
        email="admin@voltAIc.systems",
        role="admin",
        first_name="Test",
        last_name="Admin"
    )

@pytest.fixture
def test_consultant(db_session):
    """Create test consultant"""
    return ConsultantFactory(
        first_name="Dr. Pascal",
        last_name="Köth",
        email="pascal@voltAIc.systems",
        expertise=["AI", "Digital Transformation"],
        is_online=True
    )

@pytest.fixture
def test_webinar_session(db_session, test_consultant):
    """Create test webinar session"""
    return WebinarSessionFactory(
        title={"en": "Test Webinar", "de": "Test Webinar"},
        datetime=datetime.now() + timedelta(days=7),
        duration=60,
        speaker_id=test_consultant.id,
        capacity=100,
        status="published"
    )

@pytest.fixture
def test_booking(db_session, test_consultant):
    """Create test booking"""
    return BookingFactory(
        consultant_id=test_consultant.id,
        datetime=datetime.now() + timedelta(days=1),
        duration=60,
        client_first_name="John",
        client_last_name="Doe",
        client_email="john.doe@example.com",
        status="confirmed"
    )

@pytest.fixture
def test_whitepaper(db_session):
    """Create test whitepaper"""
    return WhitepaperFactory(
        title={"en": "AI Guide", "de": "KI Leitfaden"},
        description={"en": "Comprehensive AI guide", "de": "Umfassendes KI-Handbuch"},
        status="published",
        file_path="/test-files/ai-guide.pdf"
    )
```

### Database Seeding
```python
# Example: Database seeding for consistent test environments
from sqlalchemy.orm import Session
from models import *
import json

class TestDataSeeder:
    def __init__(self, db: Session):
        self.db = db
    
    def seed_all(self):
        """Seed complete test dataset"""
        self.seed_admin_users()
        self.seed_consultants()
        self.seed_webinar_data()
        self.seed_whitepapers()
        self.seed_bookings()
        
    def seed_admin_users(self):
        """Seed admin users for testing"""
        users = [
            {
                "email": "admin@voltAIc.systems",
                "role": "super_admin",
                "first_name": "Super",
                "last_name": "Admin"
            },
            {
                "email": "editor@voltAIc.systems", 
                "role": "editor",
                "first_name": "Content",
                "last_name": "Editor"
            }
        ]
        
        for user_data in users:
            user = AdminUser(**user_data)
            self.db.add(user)
        
        self.db.commit()
    
    def seed_consultants(self):
        """Seed consultant profiles"""
        consultants = [
            {
                "first_name": "Dr. Pascal",
                "last_name": "Köth",
                "email": "pascal@voltAIc.systems",
                "expertise": ["AI Strategy", "Digital Transformation"],
                "biography": {
                    "en": "Leading AI strategist with 15+ years experience",
                    "de": "Führender KI-Strategist mit über 15 Jahren Erfahrung"
                }
            }
        ]
        
        for consultant_data in consultants:
            consultant = Consultant(**consultant_data)
            self.db.add(consultant)
        
        self.db.commit()
```

## Consultant System Testing

Comprehensive testing strategy for the consultant ecosystem including profile management, payment processing, LinkedIn integration, and compliance workflows.

→ **Cross-references**: [Consultant System Features](features/consultant-system.md), [Payment Processing](backend/api.md#payment-endpoints), [LinkedIn Integration](integrations/linkedin.md)
← **Testing Dependencies**: [Database Schema](backend/database.md#consultant-tables), [Security Requirements](security.md#consultant-security), [Privacy Compliance](privacy-compliance.md#consultant-data)

### Consultant Profile Testing

#### Profile Creation and Management
```python
# Example: Consultant profile creation tests
import pytest
from unittest.mock import patch, MagicMock
from services.consultant_service import ConsultantService
from models.consultant import Consultant, ConsultantStatus
from schemas.consultant import ConsultantProfileCreate

class TestConsultantProfile:
    @pytest.fixture
    def consultant_service(self, db_session):
        return ConsultantService(db_session)
    
    @pytest.fixture
    def sample_consultant_data(self):
        return ConsultantProfileCreate(
            first_name="Dr. Pascal",
            last_name="Köth",
            email="pascal@voltAIc.systems",
            linkedin_url="https://linkedin.com/in/pascal-koth",
            expertise=["AI Strategy", "Digital Transformation"],
            hourly_rate=250.00,
            bio={"en": "AI Strategy Expert", "de": "KI-Strategieexperte"},
            available_hours=20
        )
    
    @pytest.mark.asyncio
    async def test_consultant_profile_creation(self, consultant_service, sample_consultant_data):
        """Test complete consultant profile creation workflow"""
        with patch('services.linkedin_service.LinkedInService.validate_profile') as mock_linkedin:
            mock_linkedin.return_value = {
                "valid": True,
                "profile_data": {
                    "name": "Dr. Pascal Köth",
                    "headline": "AI Strategy Consultant",
                    "experience": [{"title": "CEO", "company": "voltAIc"}]
                }
            }
            
            consultant = await consultant_service.create_profile(
                sample_consultant_data, 
                created_by="admin-1"
            )
            
            assert consultant.first_name == "Dr. Pascal"
            assert consultant.status == ConsultantStatus.PENDING_VERIFICATION
            assert consultant.linkedin_url == "https://linkedin.com/in/pascal-koth"
            assert consultant.hourly_rate == 250.00
    
    @pytest.mark.asyncio
    async def test_consultant_profile_validation(self, consultant_service):
        """Test profile validation and error handling"""
        invalid_data = ConsultantProfileCreate(
            first_name="",  # Empty required field
            email="invalid-email",  # Invalid email
            hourly_rate=-50.00  # Invalid rate
        )
        
        with pytest.raises(ValidationError) as exc_info:
            await consultant_service.create_profile(invalid_data)
        
        errors = exc_info.value.errors()
        assert any("first_name" in str(error) for error in errors)
        assert any("email" in str(error) for error in errors)
        assert any("hourly_rate" in str(error) for error in errors)
    
    @pytest.mark.asyncio
    async def test_consultant_status_transitions(self, consultant_service, sample_consultant_data):
        """Test consultant status workflow transitions"""
        consultant = await consultant_service.create_profile(sample_consultant_data)
        
        # Test approval workflow
        approved_consultant = await consultant_service.approve_consultant(
            consultant.id, approved_by="admin-1"
        )
        assert approved_consultant.status == ConsultantStatus.ACTIVE
        
        # Test suspension workflow
        suspended_consultant = await consultant_service.suspend_consultant(
            consultant.id, reason="Terms violation", suspended_by="admin-1"
        )
        assert suspended_consultant.status == ConsultantStatus.SUSPENDED
```

#### LinkedIn Integration Testing
```python
class TestLinkedInIntegration:
    @pytest.fixture
    def linkedin_service(self, redis_mock):
        from integrations.linkedin_service import LinkedInService
        return LinkedInService(redis_mock)
    
    @pytest.mark.asyncio
    async def test_linkedin_profile_scraping(self, linkedin_service):
        """Test LinkedIn profile data extraction and validation"""
        with patch('httpx.AsyncClient.get') as mock_get:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.text = '''
                <html>
                    <script type="application/ld+json">
                    {
                        "@type": "Person",
                        "name": "Dr. Pascal Köth",
                        "jobTitle": "AI Strategy Consultant",
                        "worksFor": {"name": "voltAIc"}
                    }
                    </script>
                </html>
            '''
            mock_get.return_value = mock_response
            
            profile_data = await linkedin_service.scrape_profile(
                "https://linkedin.com/in/pascal-koth"
            )
            
            assert profile_data["name"] == "Dr. Pascal Köth"
            assert profile_data["jobTitle"] == "AI Strategy Consultant"
            assert profile_data["worksFor"]["name"] == "voltAIc"
    
    @pytest.mark.asyncio
    async def test_linkedin_rate_limiting(self, linkedin_service, redis_mock):
        """Test LinkedIn scraping rate limits and queue management"""
        # Simulate rate limit exceeded
        redis_mock.get.return_value = "100"  # Max requests reached
        redis_mock.ttl.return_value = 3600
        
        result = await linkedin_service.check_rate_limit("consultant-1")
        
        assert result["allowed"] is False
        assert result["reset_in"] == 3600
        assert result["queue_position"] > 0
    
    @pytest.mark.asyncio
    async def test_linkedin_content_validation(self, linkedin_service):
        """Test LinkedIn profile content validation and sanitization"""
        profile_content = {
            "headline": "<script>alert('xss')</script>AI Expert",
            "summary": "Expert in AI with 15+ years experience...",
            "experience": [
                {
                    "title": "CEO & Founder",
                    "company": "voltAIc Systems",
                    "description": "Leading AI transformation projects"
                }
            ]
        }
        
        validated_content = await linkedin_service.validate_profile_content(
            profile_content
        )
        
        assert "<script>" not in validated_content["headline"]
        assert "AI Expert" in validated_content["headline"]
        assert len(validated_content["experience"]) == 1
```

### Payment Processing Testing

#### Stripe Integration Testing
```python
class TestPaymentProcessing:
    @pytest.fixture
    def payment_service(self, db_session):
        from services.payment_service import StripePaymentService
        return StripePaymentService(db_session)
    
    @pytest.mark.asyncio
    async def test_consultant_payment_setup(self, payment_service):
        """Test Stripe Connect account creation for consultants"""
        consultant_data = {
            "consultant_id": "consultant-1",
            "email": "pascal@voltAIc.systems",
            "country": "DE",
            "business_type": "individual"
        }
        
        with patch('stripe.Account.create') as mock_create:
            mock_create.return_value = {
                "id": "acct_1234567890",
                "charges_enabled": False,
                "payouts_enabled": False,
                "requirements": {
                    "currently_due": ["individual.verification.document"]
                }
            }
            
            account = await payment_service.create_consultant_account(
                consultant_data
            )
            
            assert account["id"] == "acct_1234567890"
            assert account["charges_enabled"] is False
            assert len(account["requirements"]["currently_due"]) > 0
    
    @pytest.mark.asyncio
    async def test_booking_payment_flow(self, payment_service):
        """Test complete booking payment processing"""
        booking_data = {
            "booking_id": "booking-1",
            "consultant_id": "consultant-1",
            "client_email": "client@company.com",
            "amount": 25000,  # $250.00 in cents
            "currency": "EUR",
            "consultant_stripe_account": "acct_1234567890"
        }
        
        with patch('stripe.PaymentIntent.create') as mock_payment:
            mock_payment.return_value = {
                "id": "pi_1234567890",
                "client_secret": "pi_1234567890_secret_abc",
                "status": "requires_payment_method"
            }
            
            payment_intent = await payment_service.create_booking_payment(
                booking_data
            )
            
            assert payment_intent["id"] == "pi_1234567890"
            assert payment_intent["status"] == "requires_payment_method"
    
    @pytest.mark.asyncio
    async def test_consultant_payout_processing(self, payment_service):
        """Test consultant payout calculation and processing"""
        booking_data = {
            "booking_id": "booking-1",
            "consultant_id": "consultant-1",
            "amount_paid": 25000,  # $250.00
            "platform_fee_rate": 0.15,  # 15%
            "stripe_fee": 750,  # $7.50
            "consultant_stripe_account": "acct_1234567890"
        }
        
        payout_calculation = await payment_service.calculate_consultant_payout(
            booking_data
        )
        
        expected_payout = 25000 - (25000 * 0.15) - 750  # $21.25
        assert payout_calculation["consultant_amount"] == expected_payout
        assert payout_calculation["platform_fee"] == 3750
        assert payout_calculation["stripe_fee"] == 750
    
    @pytest.mark.asyncio
    async def test_payment_webhook_handling(self, payment_service):
        """Test Stripe webhook processing for payment events"""
        webhook_data = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_1234567890",
                    "status": "succeeded",
                    "metadata": {
                        "booking_id": "booking-1",
                        "consultant_id": "consultant-1"
                    }
                }
            }
        }
        
        result = await payment_service.handle_webhook_event(webhook_data)
        
        assert result["processed"] is True
        assert result["booking_updated"] is True
```

### Scoopp Integration Testing

#### Job Queue and Error Handling
```python
class TestScooppIntegration:
    @pytest.fixture
    def scoopp_service(self, redis_mock):
        from integrations.scoopp_service import ScooppService
        return ScooppService(redis_mock)
    
    @pytest.mark.asyncio
    async def test_scoopp_job_creation(self, scoopp_service):
        """Test Scoopp job queue management"""
        job_data = {
            "consultant_id": "consultant-1",
            "job_type": "profile_sync",
            "priority": "high",
            "data": {
                "linkedin_url": "https://linkedin.com/in/pascal-koth",
                "sync_fields": ["experience", "education", "skills"]
            }
        }
        
        job_id = await scoopp_service.create_job(job_data)
        
        assert job_id is not None
        assert job_id.startswith("scoopp_job_")
        
        # Verify job is queued
        job_status = await scoopp_service.get_job_status(job_id)
        assert job_status["status"] == "queued"
        assert job_status["priority"] == "high"
    
    @pytest.mark.asyncio
    async def test_scoopp_error_handling(self, scoopp_service):
        """Test error handling and retry logic"""
        job_id = "scoopp_job_failed_123"
        
        # Simulate job failure
        error_data = {
            "job_id": job_id,
            "error_type": "rate_limit_exceeded",
            "error_message": "LinkedIn API rate limit exceeded",
            "retry_after": 3600,
            "attempt_count": 2
        }
        
        result = await scoopp_service.handle_job_error(error_data)
        
        assert result["retry_scheduled"] is True
        assert result["next_retry_at"] is not None
        assert result["attempt_count"] == 3  # Incremented
    
    @pytest.mark.asyncio
    async def test_scoopp_data_validation(self, scoopp_service):
        """Test scraped data validation and sanitization"""
        scraped_data = {
            "profile": {
                "name": "Dr. Pascal Köth",
                "headline": "AI Strategy Consultant & CEO",
                "location": "Berlin, Germany"
            },
            "experience": [
                {
                    "title": "CEO",
                    "company": "voltAIc Systems",
                    "duration": "2019 - Present",
                    "description": "<p>Leading AI transformation projects</p>"
                }
            ]
        }
        
        validated_data = await scoopp_service.validate_scraped_data(
            scraped_data
        )
        
        assert validated_data["profile"]["name"] == "Dr. Pascal Köth"
        assert "<p>" not in validated_data["experience"][0]["description"]
        assert "Leading AI transformation" in validated_data["experience"][0]["description"]
```

### 30-for-30 Booking Flow Testing

#### Complete Booking Workflow
```python
class TestBookingFlowIntegration:
    @pytest.fixture
    def booking_service(self, db_session, payment_service, calendar_service):
        from services.booking_flow_service import BookingFlowService
        return BookingFlowService(db_session, payment_service, calendar_service)
    
    @pytest.mark.asyncio
    async def test_complete_30_for_30_booking(self, booking_service):
        """Test complete 30-minute consultation booking workflow"""
        booking_request = {
            "consultant_id": "consultant-1",
            "datetime": "2024-03-15T14:00:00Z",
            "duration": 30,
            "client": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@company.com",
                "company": "Tech Corp",
                "phone": "+49123456789"
            },
            "meeting_type": "video",
            "topic": "AI strategy consultation",
            "payment_method": "card"
        }
        
        # Mock external service calls
        with patch.multiple(
            booking_service,
            check_availability=AsyncMock(return_value={"available": True}),
            create_payment_intent=AsyncMock(return_value={"id": "pi_123", "client_secret": "pi_123_secret"}),
            create_calendar_event=AsyncMock(return_value={"id": "cal_event_123"}),
            send_confirmation_email=AsyncMock(return_value=True)
        ):
            
            result = await booking_service.process_complete_booking(
                booking_request
            )
            
            assert result["success"] is True
            assert result["booking_id"] is not None
            assert result["reference"].startswith("VLT-")
            assert result["payment_intent_id"] == "pi_123"
            assert result["calendar_event_id"] == "cal_event_123"
    
    @pytest.mark.asyncio
    async def test_booking_conflict_handling(self, booking_service):
        """Test booking conflict detection and resolution"""
        # Simulate time slot conflict
        with patch.object(booking_service, 'check_availability') as mock_availability:
            mock_availability.return_value = {
                "available": False,
                "conflicts": [
                    {
                        "booking_id": "existing-booking-1",
                        "start_time": "2024-03-15T14:00:00Z",
                        "end_time": "2024-03-15T14:30:00Z"
                    }
                ],
                "alternative_slots": [
                    "2024-03-15T15:00:00Z",
                    "2024-03-15T16:00:00Z"
                ]
            }
            
            booking_request = {
                "consultant_id": "consultant-1",
                "datetime": "2024-03-15T14:00:00Z",
                "duration": 30
            }
            
            result = await booking_service.process_complete_booking(
                booking_request
            )
            
            assert result["success"] is False
            assert result["error"]["code"] == "TIME_SLOT_UNAVAILABLE"
            assert len(result["alternative_slots"]) == 2
    
    @pytest.mark.asyncio
    async def test_payment_failure_rollback(self, booking_service):
        """Test booking rollback on payment failure"""
        with patch.object(booking_service, 'create_payment_intent') as mock_payment:
            mock_payment.side_effect = Exception("Payment processing failed")
            
            booking_request = {
                "consultant_id": "consultant-1",
                "datetime": "2024-03-15T14:00:00Z",
                "client": {"email": "john@company.com"}
            }
            
            result = await booking_service.process_complete_booking(
                booking_request
            )
            
            assert result["success"] is False
            assert "payment" in result["error"]["message"].lower()
            
            # Verify no booking was created in database
            booking_count = await booking_service.count_bookings_for_slot(
                "consultant-1", "2024-03-15T14:00:00Z"
            )
            assert booking_count == 0
```

### KYC and Compliance Testing

#### Identity Verification Testing
```python
class TestKYCCompliance:
    @pytest.fixture
    def kyc_service(self, db_session):
        from services.kyc_service import KYCService
        return KYCService(db_session)
    
    @pytest.mark.asyncio
    async def test_consultant_identity_verification(self, kyc_service):
        """Test consultant identity verification workflow"""
        verification_data = {
            "consultant_id": "consultant-1",
            "document_type": "passport",
            "document_number": "ABC123456",
            "expiry_date": "2030-12-31",
            "country_of_issue": "DE",
            "document_image": "base64_encoded_image_data"
        }
        
        verification_result = await kyc_service.verify_consultant_identity(
            verification_data
        )
        
        assert verification_result["verification_id"] is not None
        assert verification_result["status"] == "pending_review"
        assert verification_result["required_actions"] is not None
    
    @pytest.mark.asyncio
    async def test_tax_information_validation(self, kyc_service):
        """Test tax information collection and validation"""
        tax_data = {
            "consultant_id": "consultant-1",
            "tax_country": "DE",
            "tax_id": "DE123456789",
            "business_type": "individual",
            "vat_number": "DE123456789",  # Optional for individuals
            "w9_form": None,  # Not required for non-US
            "w8_form": "base64_encoded_w8_form"  # Required for non-US
        }
        
        validation_result = await kyc_service.validate_tax_information(
            tax_data
        )
        
        assert validation_result["valid"] is True
        assert validation_result["compliance_status"] == "compliant"
        assert validation_result["required_documents_count"] == 0
    
    @pytest.mark.asyncio
    async def test_compliance_monitoring(self, kyc_service):
        """Test ongoing compliance monitoring"""
        consultant_id = "consultant-1"
        
        compliance_check = await kyc_service.run_compliance_check(
            consultant_id
        )
        
        assert compliance_check["consultant_id"] == consultant_id
        assert "document_status" in compliance_check
        assert "tax_compliance" in compliance_check
        assert "payment_compliance" in compliance_check
        assert compliance_check["overall_status"] in ["compliant", "non_compliant", "pending"]
```

## Security Testing

Comprehensive security testing focused on consultant system vulnerabilities, payment security, and data protection.

→ **Security Specifications**: [Security Architecture](security.md), [Payment Security](integrations/stripe.md#security)
← **Security Dependencies**: [Authentication System](backend/api.md#authentication), [Data Encryption](security.md#encryption)

### Payment Security Testing

#### PCI DSS Compliance Testing
```python
class TestPCIDSSCompliance:
    @pytest.fixture
    def security_validator(self):
        from security.pci_validator import PCIDSSValidator
        return PCIDSSValidator()
    
    @pytest.mark.asyncio
    async def test_payment_data_encryption(self, security_validator):
        """Test payment data encryption at rest and in transit"""
        # Test card data is never stored
        payment_data = {
            "card_number": "4242424242424242",
            "expiry_month": "12",
            "expiry_year": "2025",
            "cvc": "123"
        }
        
        # Verify payment data is not persisted
        with pytest.raises(SecurityError) as exc_info:
            await security_validator.validate_card_data_storage(payment_data)
        
        assert "Card data storage prohibited" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_secure_transmission(self, security_validator):
        """Test secure payment data transmission"""
        request_headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer token",
            "X-Forwarded-Proto": "https"
        }
        
        security_check = await security_validator.validate_transmission(
            request_headers
        )
        
        assert security_check["https_enforced"] is True
        assert security_check["secure_headers"] is True
        assert security_check["pci_compliant"] is True
```

#### Financial Data Protection Testing
```python
class TestFinancialDataSecurity:
    @pytest.fixture
    def data_protection_service(self, db_session):
        from security.data_protection_service import DataProtectionService
        return DataProtectionService(db_session)
    
    @pytest.mark.asyncio
    async def test_consultant_financial_data_encryption(self, data_protection_service):
        """Test consultant financial information encryption"""
        financial_data = {
            "consultant_id": "consultant-1",
            "bank_account_number": "DE89370400440532013000",
            "routing_number": "37040044",
            "tax_id": "DE123456789",
            "earnings_ytd": 15000.00
        }
        
        encrypted_data = await data_protection_service.encrypt_financial_data(
            financial_data
        )
        
        # Verify sensitive data is encrypted
        assert "DE89370400440532013000" not in str(encrypted_data)
        assert "37040044" not in str(encrypted_data)
        assert encrypted_data["encrypted"] is True
        assert encrypted_data["key_id"] is not None
    
    @pytest.mark.asyncio
    async def test_access_control_validation(self, data_protection_service):
        """Test financial data access controls"""
        access_request = {
            "user_id": "admin-1",
            "user_role": "content_editor",  # Should not have access
            "resource": "consultant_financial_data",
            "consultant_id": "consultant-1",
            "action": "read"
        }
        
        access_result = await data_protection_service.validate_access(
            access_request
        )
        
        assert access_result["allowed"] is False
        assert "insufficient_privileges" in access_result["reason"]
```

### Authentication and Authorization Testing

#### Consultant Authentication Testing
```python
class TestConsultantAuthentication:
    @pytest.fixture
    def auth_service(self, db_session, redis_mock):
        from services.auth_service import AuthService
        return AuthService(db_session, redis_mock)
    
    @pytest.mark.asyncio
    async def test_consultant_login_flow(self, auth_service):
        """Test consultant authentication workflow"""
        login_data = {
            "email": "pascal@voltAIc.systems",
            "password": "secure_password_123",
            "user_type": "consultant"
        }
        
        with patch('bcrypt.checkpw') as mock_password_check:
            mock_password_check.return_value = True
            
            auth_result = await auth_service.authenticate_consultant(
                login_data
            )
            
            assert auth_result["success"] is True
            assert auth_result["access_token"] is not None
            assert auth_result["user_type"] == "consultant"
            assert "permissions" in auth_result
    
    @pytest.mark.asyncio
    async def test_consultant_permission_validation(self, auth_service):
        """Test consultant-specific permission checks"""
        consultant_token = "valid_consultant_jwt_token"
        
        # Test consultant can access own profile
        own_profile_access = await auth_service.check_permission(
            consultant_token, "read", "consultant_profile", "consultant-1"
        )
        assert own_profile_access["allowed"] is True
        
        # Test consultant cannot access other consultant's financial data
        other_financial_access = await auth_service.check_permission(
            consultant_token, "read", "consultant_financial", "consultant-2"
        )
        assert other_financial_access["allowed"] is False
    
    @pytest.mark.asyncio
    async def test_session_management(self, auth_service, redis_mock):
        """Test consultant session management and timeout"""
        consultant_id = "consultant-1"
        session_token = "session_token_123"
        
        # Mock active session
        redis_mock.get.return_value = json.dumps({
            "consultant_id": consultant_id,
            "login_time": int(time.time() - 1800),  # 30 minutes ago
            "last_activity": int(time.time() - 300)  # 5 minutes ago
        })
        
        session_status = await auth_service.validate_session(session_token)
        
        assert session_status["valid"] is True
        assert session_status["consultant_id"] == consultant_id
        
        # Test session timeout
        redis_mock.get.return_value = json.dumps({
            "consultant_id": consultant_id,
            "last_activity": int(time.time() - 7200)  # 2 hours ago
        })
        
        expired_session = await auth_service.validate_session(session_token)
        assert expired_session["valid"] is False
        assert expired_session["reason"] == "session_expired"
```

### API Security Testing

#### Rate Limiting and DDoS Protection
```python
class TestAPISecurityConsultant:
    @pytest.fixture
    def security_middleware(self, redis_mock):
        from middleware.security_middleware import SecurityMiddleware
        return SecurityMiddleware(redis_mock)
    
    @pytest.mark.asyncio
    async def test_consultant_api_rate_limiting(self, security_middleware, redis_mock):
        """Test rate limiting for consultant API endpoints"""
        consultant_id = "consultant-1"
        endpoint = "/api/v1/consultant/profile"
        
        # Simulate high request rate
        redis_mock.get.return_value = "95"  # 95 out of 100 requests
        redis_mock.ttl.return_value = 300    # 5 minutes remaining
        
        rate_limit_result = await security_middleware.check_rate_limit(
            consultant_id, endpoint, "GET"
        )
        
        assert rate_limit_result["allowed"] is True
        assert rate_limit_result["remaining"] == 5
        
        # Test rate limit exceeded
        redis_mock.get.return_value = "100"  # Limit reached
        
        rate_limit_exceeded = await security_middleware.check_rate_limit(
            consultant_id, endpoint, "GET"
        )
        
        assert rate_limit_exceeded["allowed"] is False
        assert rate_limit_exceeded["retry_after"] == 300
    
    @pytest.mark.asyncio
    async def test_input_validation_security(self, security_middleware):
        """Test input validation and sanitization"""
        malicious_input = {
            "consultant_bio": "<script>alert('xss')</script>Experienced consultant",
            "linkedin_url": "javascript:alert('xss')",
            "expertise": ["AI", "<img src=x onerror=alert('xss')>"]
        }
        
        sanitized_input = await security_middleware.sanitize_consultant_input(
            malicious_input
        )
        
        assert "<script>" not in sanitized_input["consultant_bio"]
        assert "javascript:" not in sanitized_input["linkedin_url"]
        assert "<img" not in str(sanitized_input["expertise"])
        assert "Experienced consultant" in sanitized_input["consultant_bio"]
```

## Performance Testing

Performance testing focused on consultant system scalability, payment processing efficiency, and data scraping performance.

→ **Performance Requirements**: [Architecture Performance](architecture.md#performance), [Database Optimization](backend/database.md#performance)
← **Performance Dependencies**: [Caching Strategy](architecture.md#caching), [CDN Configuration](deployment.md#cdn)

### Consultant System Performance Testing

#### Profile Loading and Search Performance
```python
from locust import HttpUser, task, between
import json
from datetime import datetime, timedelta

class ConsultantPerformanceTest(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Setup for performance testing"""
        self.consultant_ids = [f"consultant-{i}" for i in range(1, 101)]
        self.search_terms = ["AI", "Digital Transformation", "Strategy", "Innovation"]
    
    @task(5)
    def search_consultants(self):
        """Test consultant search performance under load"""
        search_params = {
            "q": random.choice(self.search_terms),
            "expertise": "AI",
            "availability": "this_week",
            "price_range": "200-500"
        }
        
        start_time = time.time()
        response = self.client.get(
            "/api/v1/public/consultants/search",
            params=search_params
        )
        end_time = time.time()
        
        # Performance assertions
        assert response.status_code == 200
        assert end_time - start_time < 2.0  # Under 2 seconds
        
        data = response.json()
        assert "consultants" in data["data"]
        assert "total_count" in data["data"]
    
    @task(3)
    def view_consultant_profile(self):
        """Test consultant profile loading performance"""
        consultant_id = random.choice(self.consultant_ids)
        
        start_time = time.time()
        response = self.client.get(f"/api/v1/public/consultants/{consultant_id}")
        end_time = time.time()
        
        assert response.status_code == 200
        assert end_time - start_time < 1.5  # Under 1.5 seconds
        
        data = response.json()
        assert "consultant" in data["data"]
        assert "availability" in data["data"]
    
    @task(2)
    def check_availability(self):
        """Test availability checking performance"""
        consultant_id = random.choice(self.consultant_ids)
        date_range = {
            "start_date": datetime.now().strftime("%Y-%m-%d"),
            "end_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        }
        
        start_time = time.time()
        response = self.client.get(
            f"/api/v1/public/consultants/{consultant_id}/availability",
            params=date_range
        )
        end_time = time.time()
        
        assert response.status_code == 200
        assert end_time - start_time < 1.0  # Under 1 second
        
        data = response.json()
        assert "available_slots" in data["data"]
    
    @task(1)
    def create_booking(self):
        """Test booking creation performance"""
        booking_data = {
            "consultant_id": random.choice(self.consultant_ids),
            "datetime": (datetime.now() + timedelta(days=1)).isoformat(),
            "duration": 30,
            "client": {
                "first_name": "Performance",
                "last_name": "Test",
                "email": f"perf.test.{time.time()}@example.com",
                "company": "Load Test Corp"
            }
        }
        
        start_time = time.time()
        response = self.client.post(
            "/api/v1/public/bookings",
            json=booking_data
        )
        end_time = time.time()
        
        # Accept both success and conflict responses under load
        assert response.status_code in [201, 409]
        assert end_time - start_time < 3.0  # Under 3 seconds
```

#### Payment Processing Performance
```python
class PaymentPerformanceTest(HttpUser):
    wait_time = between(2, 4)
    
    @task(1)
    def process_payment_intent(self):
        """Test payment processing throughput"""
        payment_data = {
            "amount": random.randint(5000, 50000),  # $50 - $500
            "currency": "EUR",
            "consultant_id": f"consultant-{random.randint(1, 50)}",
            "booking_id": f"booking-{int(time.time())}"
        }
        
        start_time = time.time()
        response = self.client.post(
            "/api/v1/payments/create-intent",
            json=payment_data,
            headers={"Authorization": "Bearer test_token"}
        )
        end_time = time.time()
        
        assert response.status_code == 200
        assert end_time - start_time < 2.0  # Under 2 seconds
        
        data = response.json()
        assert "client_secret" in data["data"]
    
    @task(2)
    def webhook_processing(self):
        """Test webhook processing performance"""
        webhook_data = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": f"pi_{int(time.time())}",
                    "status": "succeeded",
                    "metadata": {
                        "booking_id": f"booking-{int(time.time())}"
                    }
                }
            }
        }
        
        start_time = time.time()
        response = self.client.post(
            "/api/v1/payments/webhook",
            json=webhook_data,
            headers={"Stripe-Signature": "test_signature"}
        )
        end_time = time.time()
        
        assert response.status_code == 200
        assert end_time - start_time < 1.0  # Under 1 second
```

#### Data Scraping Performance
```python
class ScrapingPerformanceTest:
    def __init__(self):
        self.redis_client = redis.Redis(decode_responses=True)
    
    @pytest.mark.asyncio
    async def test_linkedin_scraping_throughput(self):
        """Test LinkedIn scraping job processing rate"""
        from services.linkedin_scraper import LinkedInScraper
        scraper = LinkedInScraper()
        
        # Create test URLs
        linkedin_urls = [
            f"https://linkedin.com/in/test-profile-{i}" 
            for i in range(100)
        ]
        
        start_time = time.time()
        
        # Process URLs concurrently
        tasks = []
        for url in linkedin_urls[:10]:  # Test with 10 concurrent requests
            task = scraper.scrape_profile(url)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        # Performance assertions
        assert processing_time < 30.0  # Under 30 seconds for 10 profiles
        success_rate = len([r for r in results if not isinstance(r, Exception)]) / len(results)
        assert success_rate >= 0.8  # At least 80% success rate
    
    @pytest.mark.asyncio
    async def test_job_queue_performance(self):
        """Test Scoopp job queue processing performance"""
        from services.scoopp_service import ScooppService
        scoopp = ScooppService(self.redis_client)
        
        # Queue 100 jobs
        job_ids = []
        start_time = time.time()
        
        for i in range(100):
            job_data = {
                "consultant_id": f"consultant-{i}",
                "job_type": "profile_sync",
                "priority": "normal"
            }
            job_id = await scoopp.create_job(job_data)
            job_ids.append(job_id)
        
        queue_time = time.time() - start_time
        
        # Test job processing rate
        process_start = time.time()
        processed_jobs = await scoopp.process_job_batch(job_ids[:10])
        process_time = time.time() - process_start
        
        # Performance assertions
        assert queue_time < 5.0  # Queue 100 jobs under 5 seconds
        assert process_time < 60.0  # Process 10 jobs under 60 seconds
        assert len(processed_jobs) >= 8  # At least 80% processing success
```

### Database Performance Testing

#### Consultant Data Query Performance
```python
class TestDatabasePerformanceConsultant:
    @pytest.fixture
    def db_performance_test(self, db_session):
        # Seed database with test consultant data
        from test_data.consultant_seeder import seed_consultant_data
        seed_consultant_data(db_session, count=1000)
        return db_session
    
    @pytest.mark.asyncio
    async def test_consultant_search_query_performance(self, db_performance_test):
        """Test consultant search query performance with large dataset"""
        from services.consultant_search_service import ConsultantSearchService
        search_service = ConsultantSearchService(db_performance_test)
        
        search_params = {
            "expertise": ["AI", "Digital Transformation"],
            "availability": "this_week",
            "price_min": 100,
            "price_max": 500,
            "rating_min": 4.0,
            "location": "Berlin"
        }
        
        start_time = time.time()
        results = await search_service.search_consultants(
            search_params, limit=50, offset=0
        )
        end_time = time.time()
        
        query_time = end_time - start_time
        
        # Performance assertions
        assert query_time < 0.5  # Under 500ms
        assert len(results["consultants"]) <= 50
        assert results["total_count"] is not None
    
    @pytest.mark.asyncio
    async def test_booking_availability_query_performance(self, db_performance_test):
        """Test availability checking performance"""
        from services.availability_service import AvailabilityService
        availability_service = AvailabilityService(db_performance_test)
        
        consultant_id = "consultant-1"
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        
        query_start = time.time()
        availability = await availability_service.get_consultant_availability(
            consultant_id, start_date, end_date
        )
        query_end = time.time()
        
        query_time = query_end - query_start
        
        # Performance assertions
        assert query_time < 0.3  # Under 300ms
        assert "available_slots" in availability
        assert "blocked_periods" in availability
    
    @pytest.mark.asyncio
    async def test_payment_history_query_performance(self, db_performance_test):
        """Test payment history query performance"""
        from services.payment_history_service import PaymentHistoryService
        payment_service = PaymentHistoryService(db_performance_test)
        
        consultant_id = "consultant-1"
        date_range = {
            "start_date": datetime.now() - timedelta(days=365),
            "end_date": datetime.now()
        }
        
        query_start = time.time()
        payment_history = await payment_service.get_consultant_payment_history(
            consultant_id, date_range, limit=100
        )
        query_end = time.time()
        
        query_time = query_end - query_start
        
        # Performance assertions
        assert query_time < 1.0  # Under 1 second
        assert "payments" in payment_history
        assert "total_earnings" in payment_history
        assert "summary" in payment_history
```

## End-to-End Testing

Comprehensive end-to-end testing covering complete consultant workflows, user journeys, and system integrations.

→ **E2E Test Coverage**: [User Personas](users/), [Feature Workflows](features/)
← **E2E Dependencies**: [Frontend Components](frontend/public.md), [Backend APIs](backend/api.md), [Integration Services](integrations/)

### Complete Consultant Onboarding Testing

```typescript
// E2E: Complete consultant onboarding workflow
import { test, expect } from '@playwright/test';

test.describe('Consultant Onboarding Flow', () => {
  test('complete consultant registration and verification', async ({ page }) => {
    // Navigate to consultant registration
    await page.goto('/consultant/register');
    
    // Fill basic information
    await page.fill('[name="firstName"]', 'Dr. Pascal');
    await page.fill('[name="lastName"]', 'Köth');
    await page.fill('[name="email"]', 'pascal.test@voltAIc.systems');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.fill('[name="confirmPassword"]', 'SecurePassword123!');
    
    // LinkedIn profile integration
    await page.fill('[name="linkedinUrl"]', 'https://linkedin.com/in/pascal-koth');
    await page.click('[data-testid="verify-linkedin-button"]');
    
    // Wait for LinkedIn verification
    await expect(page.locator('[data-testid="linkedin-verified"]')).toBeVisible({ timeout: 10000 });
    
    // Professional information
    await page.selectOption('[name="expertiseAreas"]', ['AI Strategy', 'Digital Transformation']);
    await page.fill('[name="hourlyRate"]', '250');
    await page.selectOption('[name="currency"]', 'EUR');
    await page.fill('[name="availableHoursPerWeek"]', '20');
    
    // Bio and description
    await page.fill('[name="bioEn"]', 'Experienced AI strategy consultant with 15+ years in digital transformation.');
    await page.fill('[name="bioDe"]', 'Erfahrener KI-Strategieberater mit über 15 Jahren Erfahrung in der digitalen Transformation.');
    
    // Upload profile photo
    await page.setInputFiles('[name="profilePhoto"]', 'test-files/consultant-photo.jpg');
    
    // Accept terms and conditions
    await page.check('[name="termsAccepted"]');
    await page.check('[name="privacyPolicyAccepted"]');
    
    // Submit registration
    await page.click('[data-testid="submit-registration"]');
    
    // Verify registration success
    await expect(page).toHaveURL(/\/consultant\/registration-success/);
    await expect(page.locator('h1')).toContainText('Registration Submitted');
    await expect(page.locator('[data-testid="next-steps"]')).toBeVisible();
  });
  
  test('KYC document upload and verification', async ({ page, context }) => {
    // Login as registered consultant
    await page.goto('/consultant/login');
    await page.fill('[name="email"]', 'pascal.test@voltAIc.systems');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to KYC section
    await page.click('[data-testid="complete-kyc-button"]');
    await expect(page).toHaveURL(/\/consultant\/kyc/);
    
    // Identity verification
    await page.selectOption('[name="documentType"]', 'passport');
    await page.fill('[name="documentNumber"]', 'ABC123456789');
    await page.fill('[name="expiryDate"]', '2030-12-31');
    await page.selectOption('[name="countryOfIssue"]', 'DE');
    
    // Upload identity document
    await page.setInputFiles('[name="identityDocument"]', 'test-files/passport-sample.jpg');
    
    // Tax information
    await page.selectOption('[name="taxCountry"]', 'DE');
    await page.fill('[name="taxId"]', 'DE123456789');
    await page.selectOption('[name="businessType"]', 'individual');
    
    // Upload tax documents
    await page.setInputFiles('[name="w8Form"]', 'test-files/w8-form.pdf');
    
    // Bank account information (for Stripe Connect)
    await page.fill('[name="bankAccountNumber"]', 'DE89370400440532013000');
    await page.fill('[name="bankCode"]', 'COBADEFFXXX');
    
    // Submit KYC information
    await page.click('[data-testid="submit-kyc"]');
    
    // Verify KYC submission
    await expect(page.locator('[data-testid="kyc-submitted"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-timeline"]')).toContainText('2-3 business days');
  });
});
```

### Payment Flow End-to-End Testing

```typescript
test.describe('Payment Processing Flow', () => {
  test('complete booking with payment processing', async ({ page, context }) => {
    // Customer books a consultation
    await page.goto('/consultants/pascal-koth');
    
    // Select 30-minute consultation
    await page.click('[data-testid="book-30min-session"]');
    
    // Select date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.click(`[data-date="${tomorrow.toISOString().split('T')[0]}"]`);
    await page.click('[data-testid="time-slot-14-00"]');
    
    // Fill client information
    await page.fill('[name="clientFirstName"]', 'John');
    await page.fill('[name="clientLastName"]', 'Doe');
    await page.fill('[name="clientEmail"]', 'john.doe@company.com');
    await page.fill('[name="clientCompany"]', 'Tech Corp');
    await page.fill('[name="clientPhone"]', '+49123456789');
    await page.fill('[name="meetingTopic"]', 'AI strategy implementation');
    
    // Proceed to payment
    await page.click('[data-testid="proceed-to-payment"]');
    
    // Fill payment information (Stripe test data)
    const stripeFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await stripeFrame.fill('[name="cardnumber"]', '4242424242424242');
    await stripeFrame.fill('[name="exp-date"]', '1225');
    await stripeFrame.fill('[name="cvc"]', '123');
    await stripeFrame.fill('[name="postal"]', '12345');
    
    // Complete payment
    await page.click('[data-testid="complete-payment"]');
    
    // Verify payment success and booking confirmation
    await expect(page).toHaveURL(/\/booking\/confirmation\/.*/);
    await expect(page.locator('[data-testid="booking-confirmed"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-reference"]')).toMatch(/VLT-\d{8}-\w{4}/);
    
    // Verify calendar download options
    await expect(page.locator('[data-testid="add-to-google-calendar"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-outlook-calendar"]')).toBeVisible();
    
    // Test calendar file download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="download-ics-file"]')
    ]);
    expect(download.suggestedFilename()).toMatch(/consultation.*\.ics/);
  });
  
  test('consultant payout processing workflow', async ({ page }) => {
    // Login as consultant
    await page.goto('/consultant/login');
    await page.fill('[name="email"]', 'pascal.test@voltAIc.systems');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to earnings dashboard
    await page.click('[data-testid="earnings-menu"]');
    await expect(page).toHaveURL(/\/consultant\/earnings/);
    
    // Verify earnings display
    await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-payouts"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-sessions"]')).toBeVisible();
    
    // Check individual session earnings
    await page.click('[data-testid="session-details-button"]');
    await expect(page.locator('[data-testid="session-earnings-breakdown"]')).toBeVisible();
    
    // Verify payout breakdown
    const sessionEarnings = await page.locator('[data-testid="session-amount"]').textContent();
    const platformFee = await page.locator('[data-testid="platform-fee"]').textContent();
    const stripeFee = await page.locator('[data-testid="stripe-fee"]').textContent();
    const consultantPayout = await page.locator('[data-testid="consultant-payout"]').textContent();
    
    // Verify calculations are correct
    expect(sessionEarnings).toMatch(/€\d+\.\d{2}/);
    expect(platformFee).toMatch(/€\d+\.\d{2}/);
    expect(stripeFee).toMatch(/€\d+\.\d{2}/);
    expect(consultantPayout).toMatch(/€\d+\.\d{2}/);
  });
});
```

### LinkedIn Integration E2E Testing

```typescript
test.describe('LinkedIn Integration Flow', () => {
  test('LinkedIn profile scraping and data sync', async ({ page, context }) => {
    // Login as consultant
    await page.goto('/consultant/dashboard');
    
    // Navigate to LinkedIn integration
    await page.click('[data-testid="linkedin-integration-menu"]');
    await expect(page).toHaveURL(/\/consultant\/linkedin/);
    
    // Initiate profile sync
    await page.click('[data-testid="sync-linkedin-profile"]');
    
    // Verify sync process started
    await expect(page.locator('[data-testid="sync-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('Fetching profile data');
    
    // Wait for sync completion (with polling)
    await page.waitForSelector('[data-testid="sync-completed"]', { timeout: 30000 });
    
    // Verify updated profile data
    await expect(page.locator('[data-testid="updated-headline"]')).toBeVisible();
    await expect(page.locator('[data-testid="updated-experience"]')).toBeVisible();
    await expect(page.locator('[data-testid="updated-skills"]')).toBeVisible();
    
    // Review and approve changes
    await page.click('[data-testid="review-changes-button"]');
    
    // Check individual field updates
    const headlineUpdate = page.locator('[data-testid="headline-diff"]');
    await expect(headlineUpdate).toBeVisible();
    
    // Approve selected changes
    await page.check('[data-testid="approve-headline"]');
    await page.check('[data-testid="approve-experience"]');
    await page.click('[data-testid="apply-changes"]');
    
    // Verify changes applied
    await expect(page.locator('[data-testid="changes-applied"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-updated"]')).toContainText('Profile updated successfully');
  });
  
  test('LinkedIn content publishing workflow', async ({ page }) => {
    // Navigate to content creation
    await page.goto('/consultant/content');
    
    // Create new LinkedIn post
    await page.click('[data-testid="create-linkedin-post"]');
    
    // Fill post content
    await page.fill('[name="postContent"]', `
      Excited to share insights from my recent AI strategy consultation! 
      
      Key takeaways:
      ✅ Start with business objectives, not technology
      ✅ Focus on high-impact, low-risk pilot projects  
      ✅ Build internal AI literacy before scaling
      
      What's your experience with AI transformation? 
      
      #AIStrategy #DigitalTransformation #voltAIc
    `);
    
    // Add image
    await page.setInputFiles('[name="postImage"]', 'test-files/ai-insights-image.jpg');
    
    // Schedule post
    await page.click('[data-testid="schedule-post"]');
    await page.fill('[name="scheduleDate"]', '2024-03-15');
    await page.fill('[name="scheduleTime"]', '09:00');
    
    // Review and publish
    await page.click('[data-testid="review-post"]');
    await expect(page.locator('[data-testid="post-preview"]')).toBeVisible();
    
    await page.click('[data-testid="confirm-publish"]');
    
    // Verify scheduling success
    await expect(page.locator('[data-testid="post-scheduled"]')).toBeVisible();
    await expect(page.locator('[data-testid="schedule-confirmation"]')).toContainText('March 15, 2024 at 9:00 AM');
  });
});
```

### Content Creation and Analytics Testing

```typescript
test.describe('Content Management and Analytics', () => {
  test('complete content creation and publication workflow', async ({ page }) => {
    // Login as consultant
    await page.goto('/consultant/dashboard');
    
    // Navigate to content creation
    await page.click('[data-testid="content-menu"]');
    await page.click('[data-testid="create-content-button"]');
    
    // Select content type
    await page.click('[data-testid="create-blog-post"]');
    
    // Fill blog post details
    await page.fill('[name="titleEn"]', 'The Future of AI in Manufacturing: A Strategic Perspective');
    await page.fill('[name="titleDe"]', 'Die Zukunft der KI im Fertigungswesen: Eine strategische Perspektive');
    
    // Rich text editor content
    const editor = page.locator('[data-testid="content-editor"]');
    await editor.click();
    await editor.fill(`
      Manufacturing is undergoing a profound transformation...
      
      ## Key Trends in AI Manufacturing
      
      1. **Predictive Maintenance**: AI algorithms can predict equipment failures
      2. **Quality Control**: Computer vision systems detect defects in real-time
      3. **Supply Chain Optimization**: Machine learning optimizes inventory
      
      ## Implementation Strategy
      
      The key to successful AI implementation in manufacturing...
    `);
    
    // Add SEO metadata
    await page.fill('[name="metaDescription"]', 'Comprehensive guide to implementing AI in manufacturing processes.');
    await page.fill('[name="keywords"]', 'AI, Manufacturing, Industry 4.0, Predictive Maintenance');
    
    // Upload featured image
    await page.setInputFiles('[name="featuredImage"]', 'test-files/ai-manufacturing.jpg');
    
    // Category and tags
    await page.selectOption('[name="category"]', 'AI Strategy');
    await page.fill('[name="tags"]', 'AI, Manufacturing, Industry40, Strategy');
    
    // Save draft first
    await page.click('[data-testid="save-draft"]');
    await expect(page.locator('[data-testid="draft-saved"]')).toBeVisible();
    
    // Preview content
    await page.click('[data-testid="preview-content"]');
    const previewPage = await context.waitForEvent('page');
    await expect(previewPage.locator('h1')).toContainText('The Future of AI in Manufacturing');
    await previewPage.close();
    
    // Publish content
    await page.click('[data-testid="publish-content"]');
    await expect(page.locator('[data-testid="content-published"]')).toBeVisible();
    
    // Verify content appears in public listing
    await page.goto('/insights');
    await expect(page.locator('[data-testid="blog-post-card"]')).toContainText('The Future of AI in Manufacturing');
  });
  
  test('analytics dashboard and performance tracking', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/consultant/analytics');
    
    // Verify dashboard components
    await expect(page.locator('[data-testid="profile-views"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-conversions"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-engagement"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-metrics"]')).toBeVisible();
    
    // Test date range filtering
    await page.selectOption('[name="dateRange"]', 'last_30_days');
    await page.click('[data-testid="apply-filters"]');
    
    // Verify chart updates
    await expect(page.locator('[data-testid="engagement-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-trend-chart"]')).toBeVisible();
    
    // Test detailed analytics
    await page.click('[data-testid="view-detailed-analytics"]');
    
    // Verify detailed metrics
    await expect(page.locator('[data-testid="content-performance-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-performing-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="audience-insights"]')).toBeVisible();
    
    // Export analytics report
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-analytics-report"]')
    ]);
    expect(download.suggestedFilename()).toMatch(/analytics-report.*\.pdf/);
  });
});
```

## Compliance Testing

Comprehensive compliance testing ensuring adherence to GDPR, PCI DSS, privacy regulations, and platform-specific guidelines.

→ **Compliance Requirements**: [Privacy Compliance](privacy-compliance.md), [Security Standards](security.md#compliance)
← **Compliance Dependencies**: [Data Protection](backend/database.md#data-protection), [Payment Security](integrations/stripe.md#compliance)

### GDPR Compliance Testing

```python
class TestGDPRCompliance:
    @pytest.fixture
    def gdpr_service(self, db_session):
        from services.gdpr_compliance_service import GDPRComplianceService
        return GDPRComplianceService(db_session)
    
    @pytest.mark.asyncio
    async def test_consultant_data_consent_management(self, gdpr_service):
        """Test consultant data consent tracking and management"""
        consultant_id = "consultant-1"
        
        # Record initial consent
        consent_data = {
            "consultant_id": consultant_id,
            "consent_types": [
                "profile_data_processing",
                "marketing_communications", 
                "analytics_tracking",
                "linkedin_data_scraping"
            ],
            "consent_version": "2.1",
            "ip_address": "192.168.1.100",
            "user_agent": "Mozilla/5.0..."
        }
        
        consent_record = await gdpr_service.record_consent(consent_data)
        
        assert consent_record["consent_id"] is not None
        assert consent_record["timestamp"] is not None
        assert len(consent_record["consents"]) == 4
    
    @pytest.mark.asyncio
    async def test_data_portability_export(self, gdpr_service):
        """Test consultant data export for portability rights"""
        consultant_id = "consultant-1"
        
        export_request = {
            "consultant_id": consultant_id,
            "export_format": "json",
            "include_sections": [
                "profile_data", 
                "booking_history", 
                "earnings_data",
                "content_created",
                "linkedin_data"
            ]
        }
        
        export_result = await gdpr_service.export_consultant_data(
            export_request
        )
        
        assert export_result["export_id"] is not None
        assert export_result["status"] == "completed"
        assert "download_url" in export_result
        
        # Verify export content structure
        export_data = json.loads(export_result["data"])
        assert "consultant_profile" in export_data
        assert "booking_history" in export_data
        assert "earnings_summary" in export_data
        assert "content_published" in export_data
    
    @pytest.mark.asyncio
    async def test_right_to_erasure(self, gdpr_service):
        """Test consultant account deletion and data erasure"""
        consultant_id = "consultant-1"
        
        deletion_request = {
            "consultant_id": consultant_id,
            "deletion_reason": "user_request",
            "retention_exceptions": [
                "financial_records",  # Required for tax compliance
                "completed_bookings"   # Required for client records
            ]
        }
        
        deletion_result = await gdpr_service.process_erasure_request(
            deletion_request
        )
        
        assert deletion_result["deletion_id"] is not None
        assert deletion_result["status"] == "completed"
        assert len(deletion_result["retained_data"]) == 2
        assert deletion_result["anonymization_applied"] is True
        
        # Verify data anonymization
        consultant_profile = await gdpr_service.get_consultant_profile(
            consultant_id
        )
        assert consultant_profile["first_name"] == "[DELETED]"
        assert consultant_profile["email"] == "[DELETED]"
        assert consultant_profile["linkedin_url"] is None
    
    @pytest.mark.asyncio
    async def test_consent_withdrawal_impact(self, gdpr_service):
        """Test impact of consent withdrawal on data processing"""
        consultant_id = "consultant-1"
        
        withdrawal_request = {
            "consultant_id": consultant_id,
            "withdrawn_consents": [
                "linkedin_data_scraping",
                "marketing_communications"
            ]
        }
        
        withdrawal_result = await gdpr_service.withdraw_consent(
            withdrawal_request
        )
        
        assert withdrawal_result["withdrawal_id"] is not None
        assert withdrawal_result["processing_stopped"] is True
        
        # Verify affected services are disabled
        service_status = await gdpr_service.get_processing_status(
            consultant_id
        )
        assert service_status["linkedin_scraping_active"] is False
        assert service_status["marketing_emails_active"] is False
        assert service_status["profile_processing_active"] is True  # Still consented
```

### PCI DSS Compliance Testing

```python
class TestPCIDSSCompliance:
    @pytest.fixture
    def pci_validator(self):
        from security.pci_compliance_validator import PCIDSSValidator
        return PCIDSSValidator()
    
    @pytest.mark.asyncio
    async def test_cardholder_data_handling(self, pci_validator):
        """Test that no cardholder data is stored or logged"""
        # Simulate payment processing request
        payment_request = {
            "amount": 25000,
            "currency": "EUR",
            "payment_method": "card",
            "consultant_id": "consultant-1"
        }
        
        # Process payment without storing card data
        processing_result = await pci_validator.validate_payment_processing(
            payment_request
        )
        
        # Verify no cardholder data is retained
        assert processing_result["card_data_stored"] is False
        assert processing_result["pci_compliant"] is True
        assert "payment_intent_id" in processing_result
        
        # Check database for any card data leakage
        data_scan = await pci_validator.scan_database_for_card_data()
        assert data_scan["card_data_found"] is False
        assert len(data_scan["flagged_records"]) == 0
    
    @pytest.mark.asyncio
    async def test_secure_transmission_validation(self, pci_validator):
        """Test secure transmission of payment data"""
        transmission_config = {
            "tls_version": "1.3",
            "cipher_suite": "AES256-GCM-SHA384",
            "certificate_valid": True,
            "hsts_enabled": True
        }
        
        security_validation = await pci_validator.validate_secure_transmission(
            transmission_config
        )
        
        assert security_validation["transmission_secure"] is True
        assert security_validation["pci_requirement_4_met"] is True
        assert security_validation["encryption_strength"] == "strong"
    
    @pytest.mark.asyncio
    async def test_access_control_validation(self, pci_validator):
        """Test access controls for payment systems"""
        access_attempt = {
            "user_id": "admin-1",
            "user_role": "content_editor",
            "requested_resource": "payment_data",
            "action": "read"
        }
        
        access_validation = await pci_validator.validate_access_control(
            access_attempt
        )
        
        assert access_validation["access_granted"] is False
        assert access_validation["pci_requirement_7_met"] is True
        assert "insufficient_privileges" in access_validation["denial_reason"]
    
    @pytest.mark.asyncio
    async def test_vulnerability_scanning(self, pci_validator):
        """Test regular vulnerability scanning compliance"""
        scan_config = {
            "scan_type": "quarterly",
            "target_systems": ["payment_api", "stripe_integration"],
            "scan_vendor": "approved_scanning_vendor"
        }
        
        scan_result = await pci_validator.perform_vulnerability_scan(
            scan_config
        )
        
        assert scan_result["scan_completed"] is True
        assert scan_result["high_risk_vulnerabilities"] == 0
        assert scan_result["pci_requirement_11_met"] is True
```

### LinkedIn API Compliance Testing

```python
class TestLinkedInAPICompliance:
    @pytest.fixture
    def linkedin_compliance_service(self):
        from integrations.linkedin_compliance_service import LinkedInComplianceService
        return LinkedInComplianceService()
    
    @pytest.mark.asyncio
    async def test_scraping_rate_limits_compliance(self, linkedin_compliance_service):
        """Test compliance with LinkedIn's rate limiting policies"""
        rate_limit_config = {
            "requests_per_hour": 50,  # Well below LinkedIn limits
            "concurrent_requests": 2,
            "user_agent": "voltAIc-Platform/1.0",
            "respect_robots_txt": True
        }
        
        compliance_check = await linkedin_compliance_service.validate_scraping_config(
            rate_limit_config
        )
        
        assert compliance_check["compliant"] is True
        assert compliance_check["rate_limit_ok"] is True
        assert compliance_check["ethical_scraping"] is True
        
        # Test rate limit enforcement
        for i in range(5):
            request_allowed = await linkedin_compliance_service.check_request_permission(
                "consultant-1"
            )
            assert request_allowed["allowed"] is True
    
    @pytest.mark.asyncio
    async def test_data_usage_compliance(self, linkedin_compliance_service):
        """Test compliance with LinkedIn's data usage policies"""
        data_usage_request = {
            "data_types": ["public_profile", "professional_experience"],
            "usage_purpose": "consultant_profile_verification",
            "data_retention_days": 90,
            "user_consent": True
        }
        
        usage_validation = await linkedin_compliance_service.validate_data_usage(
            data_usage_request
        )
        
        assert usage_validation["usage_permitted"] is True
        assert usage_validation["consent_valid"] is True
        assert usage_validation["retention_compliant"] is True
    
    @pytest.mark.asyncio
    async def test_content_publishing_guidelines(self, linkedin_compliance_service):
        """Test compliance with LinkedIn's content publishing guidelines"""
        content_data = {
            "post_content": "Sharing insights from recent AI consultation...",
            "hashtags": ["#AIStrategy", "#DigitalTransformation"],
            "includes_promotional_content": True,
            "promotional_ratio": 0.2,  # 20% promotional vs educational
            "spam_score": 0.1  # Low spam score
        }
        
        content_validation = await linkedin_compliance_service.validate_content(
            content_data
        )
        
        assert content_validation["content_approved"] is True
        assert content_validation["spam_score_acceptable"] is True
        assert content_validation["promotional_balance_ok"] is True
```

### International Privacy Law Compliance

```python
class TestInternationalPrivacyCompliance:
    @pytest.fixture
    def privacy_compliance_service(self, db_session):
        from services.international_privacy_service import InternationalPrivacyService
        return InternationalPrivacyService(db_session)
    
    @pytest.mark.asyncio
    async def test_cross_border_data_transfer(self, privacy_compliance_service):
        """Test compliance with international data transfer regulations"""
        transfer_request = {
            "consultant_id": "consultant-1",
            "source_country": "DE",  # Germany (GDPR)
            "destination_country": "US",  # United States
            "data_types": ["profile_data", "contact_information"],
            "transfer_purpose": "service_provision",
            "adequacy_decision": False,  # No adequacy decision for US
            "safeguards": ["standard_contractual_clauses"]
        }
        
        transfer_validation = await privacy_compliance_service.validate_data_transfer(
            transfer_request
        )
        
        assert transfer_validation["transfer_permitted"] is True
        assert transfer_validation["adequate_safeguards"] is True
        assert "standard_contractual_clauses" in transfer_validation["applied_safeguards"]
    
    @pytest.mark.asyncio
    async def test_ccpa_compliance(self, privacy_compliance_service):
        """Test California Consumer Privacy Act compliance"""
        ccpa_request = {
            "consultant_id": "consultant-california-1",
            "consultant_location": "CA",  # California resident
            "request_type": "data_disclosure",
            "requested_categories": [
                "personal_identifiers",
                "commercial_information",
                "professional_information"
            ]
        }
        
        ccpa_response = await privacy_compliance_service.handle_ccpa_request(
            ccpa_request
        )
        
        assert ccpa_response["request_acknowledged"] is True
        assert ccpa_response["response_timeline_days"] <= 45
        assert "data_categories" in ccpa_response
        assert "sources" in ccpa_response
        assert "business_purposes" in ccpa_response
    
    @pytest.mark.asyncio
    async def test_privacy_by_design_validation(self, privacy_compliance_service):
        """Test privacy by design implementation"""
        system_assessment = {
            "feature": "consultant_profile_system",
            "data_minimization": True,
            "purpose_limitation": True,
            "transparency": True,
            "user_control": True,
            "security_by_default": True
        }
        
        privacy_assessment = await privacy_compliance_service.assess_privacy_by_design(
            system_assessment
        )
        
        assert privacy_assessment["compliant"] is True
        assert privacy_assessment["privacy_score"] >= 0.9
        assert len(privacy_assessment["recommendations"]) == 0
```

## User Acceptance Testing

User acceptance testing focused on consultant and customer experiences, usability, and accessibility across all consultant system features.

→ **UAT Requirements**: [User Personas](users/), [User Experience](frontend/public.md#user-experience)
← **UAT Dependencies**: [Feature Implementation](features/), [Accessibility Standards](frontend/public.md#accessibility)

### Consultant User Experience Testing

```typescript
// UAT: Consultant dashboard and workflow testing
test.describe('Consultant User Experience', () => {
  test('consultant dashboard usability and navigation', async ({ page }) => {
    // Login as consultant
    await page.goto('/consultant/login');
    await page.fill('[name="email"]', 'pascal@voltAIc.systems');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Verify dashboard loads within acceptable time
    const dashboardStart = Date.now();
    await expect(page.locator('[data-testid="consultant-dashboard"]')).toBeVisible();
    const dashboardLoadTime = Date.now() - dashboardStart;
    expect(dashboardLoadTime).toBeLessThan(2000); // Under 2 seconds
    
    // Test main navigation elements
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-bookings"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-earnings"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-analytics"]')).toBeVisible();
    
    // Test responsive navigation on mobile
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
    
    // Test key dashboard metrics are displayed
    await page.setViewportSize({ width: 1200, height: 800 }); // Desktop
    await expect(page.locator('[data-testid="this-month-earnings"]')).toBeVisible();
    await expect(page.locator('[data-testid="upcoming-bookings-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-views-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-rate"]')).toBeVisible();
  });
  
  test('profile editing workflow usability', async ({ page }) => {
    await page.goto('/consultant/profile/edit');
    
    // Test auto-save functionality
    await page.fill('[name="bioEn"]', 'Updated bio with new information about my expertise.');
    await page.waitForSelector('[data-testid="auto-save-indicator"]', { timeout: 3000 });
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('Saved');
    
    // Test LinkedIn integration workflow
    await page.click('[data-testid="sync-from-linkedin"]');
    await expect(page.locator('[data-testid="linkedin-sync-modal"]')).toBeVisible();
    
    // Verify user can review changes before applying
    await expect(page.locator('[data-testid="changes-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="approve-changes-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="reject-changes-button"]')).toBeVisible();
    
    // Test selective change application
    await page.check('[data-testid="approve-headline-change"]');
    await page.uncheck('[data-testid="approve-location-change"]');
    await page.click('[data-testid="apply-selected-changes"]');
    
    await expect(page.locator('[data-testid="changes-applied-success"]')).toBeVisible();
  });
  
  test('booking management workflow', async ({ page }) => {
    await page.goto('/consultant/bookings');
    
    // Test booking list filtering and sorting
    await page.selectOption('[name="status-filter"]', 'confirmed');
    await page.selectOption('[name="date-range"]', 'this_week');
    await page.click('[data-testid="apply-filters"]');
    
    // Verify filtered results
    const bookingCards = page.locator('[data-testid="booking-card"]');
    const bookingCount = await bookingCards.count();
    expect(bookingCount).toBeGreaterThanOrEqual(0);
    
    if (bookingCount > 0) {
      // Test individual booking management
      await bookingCards.first().click();
      await expect(page.locator('[data-testid="booking-details-modal"]')).toBeVisible();
      
      // Test booking actions
      await expect(page.locator('[data-testid="reschedule-booking-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="cancel-booking-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="send-message-button"]')).toBeVisible();
      
      // Test client communication
      await page.click('[data-testid="send-message-button"]');
      await page.fill('[name="message"]', 'Looking forward to our consultation tomorrow!');
      await page.click('[data-testid="send-message"]');
      await expect(page.locator('[data-testid="message-sent-confirmation"]')).toBeVisible();
    }
  });
});
```

### Customer Booking Experience Testing

```typescript
test.describe('Customer Booking Experience', () => {
  test('consultant discovery and selection workflow', async ({ page }) => {
    // Navigate to consultant directory
    await page.goto('/consultants');
    
    // Test search and filtering usability
    await page.fill('[data-testid="search-consultants"]', 'AI strategy');
    await page.selectOption('[name="expertise-filter"]', 'AI Strategy');
    await page.selectOption('[name="price-range"]', '200-300');
    await page.selectOption('[name="availability"]', 'this_week');
    
    // Apply filters
    await page.click('[data-testid="apply-filters-button"]');
    
    // Verify search results load quickly
    const searchStart = Date.now();
    await expect(page.locator('[data-testid="consultant-results"]')).toBeVisible();
    const searchTime = Date.now() - searchStart;
    expect(searchTime).toBeLessThan(3000); // Under 3 seconds
    
    // Test consultant profile preview
    const consultantCard = page.locator('[data-testid="consultant-card"]').first();
    await consultantCard.hover();
    await expect(page.locator('[data-testid="quick-preview-tooltip"]')).toBeVisible();
    
    // Navigate to full profile
    await consultantCard.click();
    await expect(page).toHaveURL(/\/consultants\/.*/);
    
    // Verify profile information is comprehensive
    await expect(page.locator('[data-testid="consultant-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="consultant-expertise"]')).toBeVisible();
    await expect(page.locator('[data-testid="consultant-experience"]')).toBeVisible();
    await expect(page.locator('[data-testid="consultant-ratings"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-content"]')).toBeVisible();
  });
  
  test('booking process user experience', async ({ page }) => {
    await page.goto('/consultants/pascal-koth');
    
    // Test booking flow initiation
    await page.click('[data-testid="book-consultation-button"]');
    await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    
    // Test service selection
    await page.click('[data-testid="30min-consultation-option"]');
    await expect(page.locator('[data-testid="selected-service-summary"]')).toContainText('30-minute');
    
    // Test calendar integration and availability display
    const availableSlot = page.locator('[data-testid="available-slot"]').first();
    await availableSlot.click();
    await expect(page.locator('[data-testid="selected-time-summary"]')).toBeVisible();
    
    // Test form validation and user guidance
    await page.click('[data-testid="continue-to-details"]');
    
    // Test required field validation
    await page.click('[data-testid="proceed-to-payment"]');
    await expect(page.locator('[data-testid="validation-error-firstName"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error-email"]')).toBeVisible();
    
    // Fill form with valid data
    await page.fill('[name="clientFirstName"]', 'John');
    await page.fill('[name="clientLastName"]', 'Doe');
    await page.fill('[name="clientEmail"]', 'john.doe@company.com');
    await page.fill('[name="clientCompany"]', 'Tech Solutions Inc');
    await page.fill('[name="clientPhone"]', '+1-555-0123');
    
    // Test meeting preferences
    await page.selectOption('[name="meetingType"]', 'video_call');
    await page.fill('[name="meetingTopic"]', 'AI strategy for manufacturing company');
    await page.fill('[name="additionalNotes"]', 'Looking to implement predictive maintenance solutions');
    
    await page.click('[data-testid="proceed-to-payment"]');
    
    // Test payment interface usability
    await expect(page.locator('[data-testid="payment-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('€');
    
    // Test Stripe payment form integration
    const stripeFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe');
    await expect(stripeFrame.locator('[name="cardnumber"]')).toBeVisible();
    
    // Fill test payment data
    await stripeFrame.fill('[name="cardnumber"]', '4242424242424242');
    await stripeFrame.fill('[name="exp-date"]', '1225');
    await stripeFrame.fill('[name="cvc"]', '123');
    
    // Complete booking
    await page.click('[data-testid="complete-booking-button"]');
    
    // Test confirmation page experience
    await expect(page).toHaveURL(/\/booking\/confirmation\/.*/);
    await expect(page.locator('[data-testid="booking-success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-reference"]')).toMatch(/VLT-\d{8}-\w{4}/);
    
    // Test calendar integration options
    await expect(page.locator('[data-testid="add-to-calendar-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="google-calendar-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="outlook-calendar-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-ics-file"]')).toBeVisible();
  });
});
```

### Admin Panel User Experience Testing

```typescript
test.describe('Admin Panel User Experience', () => {
  test('consultant management workflow', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@voltAIc.systems');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('[data-testid="admin-login-button"]');
    
    // Navigate to consultant management
    await page.click('[data-testid="consultants-menu"]');
    await expect(page).toHaveURL(/\/admin\/consultants/);
    
    // Test consultant list management
    await expect(page.locator('[data-testid="consultants-table"]')).toBeVisible();
    
    // Test filtering and search
    await page.fill('[data-testid="search-consultants"]', 'Pascal');
    await page.selectOption('[name="status-filter"]', 'pending_approval');
    await page.click('[data-testid="apply-consultant-filters"]');
    
    // Test consultant approval workflow
    const pendingConsultant = page.locator('[data-testid="consultant-row"]').first();
    await pendingConsultant.click();
    
    await expect(page.locator('[data-testid="consultant-details-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="consultant-verification-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="kyc-documents-section"]')).toBeVisible();
    
    // Test document review interface
    await page.click('[data-testid="review-identity-document"]');
    await expect(page.locator('[data-testid="document-viewer"]')).toBeVisible();
    await page.click('[data-testid="approve-document-button"]');
    
    // Test approval decision
    await page.click('[data-testid="approve-consultant-button"]');
    await page.fill('[name="approval-notes"]', 'All documents verified successfully');
    await page.click('[data-testid="confirm-approval"]');
    
    await expect(page.locator('[data-testid="approval-success-message"]')).toBeVisible();
  });
  
  test('payment and earnings management', async ({ page }) => {
    await page.goto('/admin/payments');
    
    // Test payment monitoring dashboard
    await expect(page.locator('[data-testid="payment-metrics-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-volume-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="successful-payments-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="failed-payments-metric"]')).toBeVisible();
    
    // Test payout management
    await page.click('[data-testid="consultant-payouts-tab"]');
    await expect(page.locator('[data-testid="payouts-table"]')).toBeVisible();
    
    // Test individual payout review
    const payoutRow = page.locator('[data-testid="payout-row"]').first();
    await payoutRow.click();
    
    await expect(page.locator('[data-testid="payout-details-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-breakdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="fee-calculation"]')).toBeVisible();
    
    // Test payout approval
    await page.click('[data-testid="approve-payout-button"]');
    await page.fill('[name="payout-notes"]', 'Payout approved for completed sessions');
    await page.click('[data-testid="confirm-payout-approval"]');
    
    await expect(page.locator('[data-testid="payout-approved-message"]')).toBeVisible();
  });
});
```

### Mobile Responsiveness Testing

```typescript
test.describe('Mobile Responsiveness and Accessibility', () => {
  // Test on various mobile devices
  const devices = [
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'iPad', width: 820, height: 1180 }
  ];
  
  devices.forEach(device => {
    test(`consultant booking flow on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      
      // Test mobile booking flow
      await page.goto('/consultants/pascal-koth');
      
      // Test mobile-optimized consultant profile
      await expect(page.locator('[data-testid="mobile-consultant-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-book-button"]')).toBeVisible();
      
      // Test mobile booking modal
      await page.click('[data-testid="mobile-book-button"]');
      await expect(page.locator('[data-testid="mobile-booking-modal"]')).toBeVisible();
      
      // Test mobile form interaction
      await page.click('[data-testid="service-30min-mobile"]');
      await page.click('[data-testid="mobile-calendar-next"]');
      
      const mobileSlot = page.locator('[data-testid="mobile-time-slot"]').first();
      await mobileSlot.tap();
      
      await page.click('[data-testid="mobile-continue-button"]');
      
      // Test mobile form filling
      await page.fill('[name="clientFirstName"]', 'Mobile');
      await page.fill('[name="clientLastName"]', 'User');
      await page.fill('[name="clientEmail"]', 'mobile@example.com');
      
      // Test mobile payment interface
      await page.click('[data-testid="mobile-proceed-payment"]');
      await expect(page.locator('[data-testid="mobile-payment-form"]')).toBeVisible();
    });
  });
  
  test('accessibility compliance testing', async ({ page }) => {
    // Install axe-playwright for accessibility testing
    await page.goto('/consultants');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test search functionality with keyboard
    await page.keyboard.press('Tab'); // Navigate to search
    await page.keyboard.type('AI strategy');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Test consultant profile accessibility
    await page.click('[data-testid="consultant-card"]');
    
    // Verify proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1
    
    // Test screen reader compatibility
    await expect(page.locator('[data-testid="consultant-name"]')).toHaveAttribute('role', 'heading');
    await expect(page.locator('[data-testid="book-consultation-button"]')).toHaveAttribute('aria-label');
    
    // Test color contrast and visual indicators
    await expect(page.locator('[data-testid="availability-indicator"]')).toHaveCSS('color', /rgb\(/);
    
    // Test focus management in modals
    await page.click('[data-testid="book-consultation-button"]');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test modal escape functionality
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="booking-modal"]')).not.toBeVisible();
  });
});
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: magnetiq_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run linting
        run: |
          black . --check
          isort . --check-only
          flake8 .
      
      - name: Run type checking
        run: mypy .
      
      - name: Run tests
        run: pytest --cov=. --cov-report=xml
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/magnetiq_test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Start services
        run: |
          npm run start:backend &
          npm run start:frontend &
          sleep 30
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Reporting & Metrics

### Coverage Requirements
```json
// jest.config.js - Frontend coverage thresholds
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "./src/services/": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

```python
# pytest.ini - Backend coverage configuration
[tool:pytest]
addopts = 
    --cov=app
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
    --cov-branch
```

### Quality Gates
- **Unit Test Coverage**: >80% overall, >90% for services
- **Integration Test Coverage**: >70% for API endpoints  
- **E2E Test Coverage**: 100% for critical user journeys
- **Performance**: Page load <3s, API response <500ms
- **Security**: No high/critical vulnerabilities
- **Accessibility**: WCAG 2.1 AA compliance

## Success Metrics

### Test Effectiveness
- **Bug Detection Rate**: Percentage of bugs caught before production
- **Test Execution Time**: Time to run full test suite
- **Test Stability**: Flaky test rate <5%
- **Coverage Trends**: Maintaining or improving coverage over time

### Quality Metrics
- **Defect Density**: Bugs per 1000 lines of code
- **Mean Time to Detection**: How quickly bugs are found
- **Customer-Reported Issues**: Bugs that reach production
- **Regression Rate**: Percentage of fixes that introduce new bugs

This comprehensive testing strategy ensures Magnetiq v2 maintains high quality standards while enabling rapid, confident deployment of new features and improvements."}]