"""
Test cases for webinar API endpoints
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business import Webinar, WebinarRegistration
from app.models.user import AdminUser


@pytest.fixture
async def sample_webinar(test_session: AsyncSession) -> Webinar:
    """Create a sample webinar for testing"""
    webinar = Webinar(
        title={"en": "Sample Webinar", "de": "Beispiel Webinar"},
        description={
            "en": "A comprehensive guide to AI implementation",
            "de": "Ein umfassender Leitfaden zur KI-Implementierung"
        },
        slug="sample-webinar-2024",
        scheduled_at=datetime.utcnow() + timedelta(days=7),
        duration_minutes=90,
        timezone="UTC",
        max_participants=100,
        meeting_url="https://meet.example.com/sample-webinar",
        presenter_name="Dr. Jane Smith",
        presenter_bio={
            "en": "Leading AI expert with 10+ years experience",
            "de": "Führende KI-Expertin mit über 10 Jahren Erfahrung"
        },
        registration_enabled=True,
        status="scheduled"
    )
    test_session.add(webinar)
    await test_session.commit()
    await test_session.refresh(webinar)
    return webinar


@pytest.fixture
async def past_webinar(test_session: AsyncSession) -> Webinar:
    """Create a past webinar for testing"""
    webinar = Webinar(
        title={"en": "Past Webinar", "de": "Vergangenes Webinar"},
        description={
            "en": "A completed webinar on data analytics",
            "de": "Ein abgeschlossenes Webinar über Datenanalytik"
        },
        slug="past-webinar-2024",
        scheduled_at=datetime.utcnow() - timedelta(days=7),
        duration_minutes=60,
        timezone="UTC",
        registration_enabled=True,
        status="completed"
    )
    test_session.add(webinar)
    await test_session.commit()
    await test_session.refresh(webinar)
    return webinar


class TestPublicWebinarEndpoints:
    """Test public webinar endpoints (no authentication required)"""

    @pytest.mark.asyncio
    async def test_list_public_webinars_upcoming_only(
        self, client: AsyncClient, sample_webinar: Webinar, past_webinar: Webinar
    ):
        """Test listing only upcoming public webinars"""
        response = await client.get("/api/v1/public/webinars?upcoming_only=true")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == sample_webinar.id
        assert data[0]["title"]["en"] == "Sample Webinar"

    @pytest.mark.asyncio
    async def test_list_public_webinars_all(
        self, client: AsyncClient, sample_webinar: Webinar, past_webinar: Webinar
    ):
        """Test listing all public webinars"""
        response = await client.get("/api/v1/public/webinars?upcoming_only=false")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    @pytest.mark.asyncio
    async def test_get_public_webinar_by_id(
        self, client: AsyncClient, sample_webinar: Webinar
    ):
        """Test getting webinar by ID (public endpoint)"""
        response = await client.get(f"/api/v1/public/webinars/{sample_webinar.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_webinar.id
        assert data["title"]["en"] == "Sample Webinar"
        assert data["slug"] == "sample-webinar-2024"

    @pytest.mark.asyncio
    async def test_get_public_webinar_by_slug(
        self, client: AsyncClient, sample_webinar: Webinar
    ):
        """Test getting webinar by slug (public endpoint)"""
        response = await client.get(f"/api/v1/public/webinars/slug/{sample_webinar.slug}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_webinar.id
        assert data["slug"] == "sample-webinar-2024"

    @pytest.mark.asyncio
    async def test_get_nonexistent_webinar(self, client: AsyncClient):
        """Test getting webinar that doesn't exist"""
        response = await client.get("/api/v1/public/webinars/999999")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_nonexistent_webinar_by_slug(self, client: AsyncClient):
        """Test getting webinar by nonexistent slug"""
        response = await client.get("/api/v1/public/webinars/slug/nonexistent-slug")
        assert response.status_code == 404


class TestWebinarRegistration:
    """Test webinar registration functionality"""

    async def test_register_for_webinar_success(
        self, client: AsyncClient, sample_webinar: Webinar
    ):
        """Test successful webinar registration"""
        registration_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "company": "Tech Corp",
            "job_title": "Software Engineer",
            "phone": "+1234567890"
        }
        
        response = await client.post(
            f"/api/v1/webinars/{sample_webinar.id}/register",
            json=registration_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "John"
        assert data["last_name"] == "Doe"
        assert data["email"] == "john.doe@example.com"
        assert data["webinar_id"] == sample_webinar.id

    async def test_register_duplicate_email(
        self, client: AsyncClient, sample_webinar: Webinar
    ):
        """Test registering with duplicate email"""
        registration_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "company": "Tech Corp"
        }
        
        # First registration should succeed
        response1 = await client.post(
            f"/api/v1/webinars/{sample_webinar.id}/register",
            json=registration_data
        )
        assert response1.status_code == 200
        
        # Second registration with same email should fail
        response2 = await client.post(
            f"/api/v1/webinars/{sample_webinar.id}/register",
            json=registration_data
        )
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"]

    async def test_register_for_nonexistent_webinar(self, client: AsyncClient):
        """Test registering for nonexistent webinar"""
        registration_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        }
        
        response = await client.post(
            "/api/v1/webinars/999999/register",
            json=registration_data
        )
        assert response.status_code == 404

    async def test_register_invalid_data(
        self, client: AsyncClient, sample_webinar: Webinar
    ):
        """Test registration with invalid data"""
        registration_data = {
            "first_name": "",  # Invalid: empty first name
            "email": "invalid-email"  # Invalid: malformed email
        }
        
        response = await client.post(
            f"/api/v1/webinars/{sample_webinar.id}/register",
            json=registration_data
        )
        assert response.status_code == 422  # Validation error


class TestAnalyticsTracking:
    """Test analytics tracking endpoints"""

    async def test_track_calendar_integration(
        self, client: AsyncClient, sample_webinar: Webinar
    ):
        """Test calendar integration tracking"""
        tracking_data = {
            "webinar_id": str(sample_webinar.id),
            "calendar_type": "google",
            "registration_id": "reg-12345",
            "timestamp": datetime.utcnow().isoformat(),
            "user_agent": "Mozilla/5.0 Test Browser",
            "timezone": "America/New_York"
        }
        
        response = await client.post(
            "/api/v1/public/analytics/calendar-integration",
            json=tracking_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["webinar_id"] == str(sample_webinar.id)
        assert data["calendar_type"] == "google"

    async def test_track_social_sharing(
        self, client: AsyncClient, sample_webinar: Webinar
    ):
        """Test social sharing tracking"""
        tracking_data = {
            "webinar_id": str(sample_webinar.id),
            "platform": "linkedin",
            "registration_id": "reg-12345",
            "timestamp": datetime.utcnow().isoformat(),
            "user_agent": "Mozilla/5.0 Test Browser",
            "utm_source": "social",
            "utm_medium": "linkedin",
            "utm_campaign": "webinar-promo"
        }
        
        response = await client.post(
            "/api/v1/public/analytics/social-sharing",
            json=tracking_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["webinar_id"] == str(sample_webinar.id)
        assert data["platform"] == "linkedin"


class TestAdminWebinarEndpoints:
    """Test admin webinar endpoints (authentication required)"""

    async def test_list_webinars_admin(
        self, 
        client: AsyncClient, 
        auth_headers_admin: dict,
        sample_webinar: Webinar
    ):
        """Test listing webinars as admin"""
        response = await client.get(
            "/api/v1/webinars/", 
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(w["id"] == sample_webinar.id for w in data)

    async def test_create_webinar_admin(
        self, 
        client: AsyncClient, 
        auth_headers_admin: dict
    ):
        """Test creating webinar as admin"""
        webinar_data = {
            "title": {"en": "New Test Webinar", "de": "Neues Test-Webinar"},
            "description": {
                "en": "Test webinar description",
                "de": "Test-Webinar-Beschreibung"
            },
            "slug": "new-test-webinar-2024",
            "scheduled_at": (datetime.utcnow() + timedelta(days=14)).isoformat(),
            "duration_minutes": 120,
            "timezone": "UTC",
            "registration_enabled": True
        }
        
        response = await client.post(
            "/api/v1/webinars/",
            json=webinar_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"]["en"] == "New Test Webinar"
        assert data["slug"] == "new-test-webinar-2024"

    async def test_update_webinar_admin(
        self, 
        client: AsyncClient, 
        auth_headers_admin: dict,
        sample_webinar: Webinar
    ):
        """Test updating webinar as admin"""
        update_data = {
            "title": {"en": "Updated Webinar Title", "de": "Aktualisierter Webinar-Titel"},
            "duration_minutes": 75
        }
        
        response = await client.put(
            f"/api/v1/webinars/{sample_webinar.id}",
            json=update_data,
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"]["en"] == "Updated Webinar Title"
        assert data["duration_minutes"] == 75

    async def test_delete_webinar_admin(
        self, 
        client: AsyncClient, 
        auth_headers_admin: dict,
        sample_webinar: Webinar
    ):
        """Test soft deleting webinar as admin"""
        response = await client.delete(
            f"/api/v1/webinars/{sample_webinar.id}",
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]

    async def test_unauthorized_access(self, client: AsyncClient, sample_webinar: Webinar):
        """Test accessing admin endpoints without authentication"""
        response = await client.get("/api/v1/webinars/")
        assert response.status_code == 401

    async def test_viewer_cannot_create_webinar(
        self, 
        client: AsyncClient, 
        auth_headers_viewer: dict
    ):
        """Test that viewer cannot create webinars"""
        webinar_data = {
            "title": {"en": "Unauthorized Webinar", "de": "Unberechtigtes Webinar"},
            "slug": "unauthorized-webinar",
            "scheduled_at": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "duration_minutes": 60,
            "timezone": "UTC",
            "registration_enabled": True
        }
        
        response = await client.post(
            "/api/v1/webinars/",
            json=webinar_data,
            headers=auth_headers_viewer
        )
        
        assert response.status_code == 403  # Forbidden


class TestWebinarRegistrationManagement:
    """Test webinar registration management endpoints"""

    async def test_list_webinar_registrations(
        self,
        client: AsyncClient,
        auth_headers_admin: dict,
        test_session: AsyncSession,
        sample_webinar: Webinar
    ):
        """Test listing registrations for a webinar"""
        # Create a test registration
        registration = WebinarRegistration(
            webinar_id=sample_webinar.id,
            first_name="Test",
            last_name="User",
            email="test.user@example.com",
            company="Test Company",
            registration_source="website"
        )
        test_session.add(registration)
        await test_session.commit()
        
        response = await client.get(
            f"/api/v1/webinars/{sample_webinar.id}/registrations",
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(r["email"] == "test.user@example.com" for r in data)