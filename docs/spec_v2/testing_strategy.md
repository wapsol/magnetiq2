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