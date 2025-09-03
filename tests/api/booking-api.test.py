"""
API Integration Tests for Public Booking System

Tests all backend API endpoints used by the booking frontend:
- Consultant retrieval and validation
- Time slot availability checking  
- Booking creation and validation
- Payment processing
- Email notifications
- Data integrity and persistence

Tests API at: http://localhost:8037/api/v1/consultations/
"""

import pytest
import asyncio
import httpx
from datetime import datetime, timedelta, date
from typing import Dict, Any, List
import json
import uuid
import time

# Test configuration
API_BASE_URL = "http://localhost:8037"
CONSULTATIONS_BASE = f"{API_BASE_URL}/api/v1/consultations"

# Test data
EXPECTED_CONSULTANTS = {
    "ashant": {
        "name_contains": "Ashant Chalasani",
        "headline_contains": "Technology Leader",
        "industry": "Technology", 
        "specializations_include": ["AI Agent Development", "Cloud Application Development"],
        "is_featured": True,
        "is_verified": True
    },
    "pascal": {
        "name_contains": "Pascal Köth",
        "headline_contains": "Business Strategy",
        "industry": "Business Strategy",
        "specializations_include": ["Digital Transformation", "Business Strategy"],
        "is_featured": False,
        "is_verified": True
    }
}

VALID_CONTACT_INFO = {
    "first_name": "Max",
    "last_name": "Mustermann",
    "email": "max.mustermann@test.example.com",
    "phone": "+49 123 456 7890",
    "company": "Test GmbH",
    "website": "https://test-company.de"
}

VALID_BILLING_INFO = {
    "billing_first_name": "Max",
    "billing_last_name": "Mustermann", 
    "billing_company": "Test GmbH",
    "billing_street": "Musterstraße 123",
    "billing_postal_code": "10115",
    "billing_city": "Berlin",
    "billing_country": "DE",
    "vat_number": "DE123456789"
}

@pytest.fixture
async def http_client():
    """HTTP client for API requests"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        yield client

@pytest.fixture
def future_date():
    """Get a future weekday for testing"""
    today = date.today()
    # Find next Monday (weekday 0)
    days_ahead = 0 - today.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    return today + timedelta(days=days_ahead)

@pytest.fixture
def future_datetime(future_date):
    """Get future datetime for booking"""
    return datetime.combine(future_date, datetime.min.time().replace(hour=10))

class TestConsultantAPI:
    """Test consultant data retrieval and validation"""
    
    @pytest.mark.asyncio
    async def test_get_active_consultants_success(self, http_client):
        """
        PSEUDO-CODE: Test consultant retrieval
        GIVEN: API is running and consultants are configured
        WHEN: GET /public/consultants/active is called
        THEN: 
            - Should return 200 status
            - Should return both Pascal and Ashant
            - Ashant should be first (featured)
            - All required consultant fields present
            - Data should match expected values
        """
        
        response = await http_client.get(f"{CONSULTATIONS_BASE}/public/consultants/active")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "data" in data
        assert "consultants" in data["data"]
        assert data["data"]["total"] == 2
        
        consultants = data["data"]["consultants"]
        assert len(consultants) == 2
        
        # Verify Ashant is first (featured)
        ashant = consultants[0]
        self._validate_consultant_data(ashant, EXPECTED_CONSULTANTS["ashant"])
        assert ashant["is_featured"] is True
        
        # Verify Pascal is second
        pascal = consultants[1]
        self._validate_consultant_data(pascal, EXPECTED_CONSULTANTS["pascal"])
        assert pascal["is_featured"] is False
        
    def _validate_consultant_data(self, consultant: Dict[str, Any], expected: Dict[str, Any]):
        """Validate consultant data structure and content"""
        
        # Required fields
        required_fields = [
            "id", "first_name", "last_name", "full_name", 
            "headline", "location", "industry", "specializations",
            "years_experience", "is_featured", "total_projects"
        ]
        
        for field in required_fields:
            assert field in consultant, f"Missing required field: {field}"
        
        # Content validation
        assert expected["name_contains"] in consultant["full_name"]
        assert expected["headline_contains"] in consultant["headline"]
        assert consultant["industry"] == expected["industry"]
        
        for specialization in expected["specializations_include"]:
            assert specialization in consultant["specializations"]
        
        assert consultant["is_featured"] == expected["is_featured"]
        
        # Data type validation
        assert isinstance(consultant["id"], str)
        assert isinstance(consultant["years_experience"], int)
        assert isinstance(consultant["specializations"], list)
        assert isinstance(consultant["total_projects"], int)
        
    @pytest.mark.asyncio
    async def test_consultant_api_performance(self, http_client):
        """
        PSEUDO-CODE: Test API response time
        GIVEN: API is running
        WHEN: Multiple requests are made to consultant endpoint
        THEN:
            - Response time should be under 2 seconds
            - Subsequent requests should be even faster (caching)
            - No timeout or connection errors
        """
        
        # First request (cold start)
        start_time = time.time()
        response = await http_client.get(f"{CONSULTATIONS_BASE}/public/consultants/active")
        first_request_time = time.time() - start_time
        
        assert response.status_code == 200
        assert first_request_time < 2.0, f"First request took {first_request_time:.2f}s, should be < 2s"
        
        # Second request (should be faster)
        start_time = time.time()
        response = await http_client.get(f"{CONSULTATIONS_BASE}/public/consultants/active")
        second_request_time = time.time() - start_time
        
        assert response.status_code == 200
        assert second_request_time < 1.0, f"Cached request took {second_request_time:.2f}s, should be < 1s"

class TestAvailabilityAPI:
    """Test time slot availability checking"""
    
    @pytest.mark.asyncio
    async def test_get_availability_valid_date(self, http_client, future_date):
        """
        PSEUDO-CODE: Test availability for valid future date
        GIVEN: Valid consultant ID and future weekday date
        WHEN: GET /consultants/{id}/availability is called
        THEN:
            - Should return 200 status
            - Should return available time slots (10:00, 14:00)
            - Should include proper date and timezone info
            - Should have correct data structure
        """
        
        # Get consultant ID first
        consultants_response = await http_client.get(f"{CONSULTATIONS_BASE}/public/consultants/active")
        consultants = consultants_response.json()["data"]["consultants"]
        consultant_id = consultants[0]["id"]
        
        # Check availability
        params = {
            "target_date": future_date.isoformat(),
            "timezone": "Europe/Berlin"
        }
        
        response = await http_client.get(
            f"{CONSULTATIONS_BASE}/public/consultants/{consultant_id}/availability",
            params=params
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "data" in data
        assert data["data"]["consultant_id"] == consultant_id
        assert data["data"]["date"] == future_date.isoformat()
        assert data["data"]["timezone"] == "Europe/Berlin"
        
        # Should have default time slots available
        available_slots = data["data"]["available_slots"]
        assert isinstance(available_slots, list)
        assert len(available_slots) <= 2  # Max 2 slots per day
        
        # Slots should be from default set
        default_slots = data["data"]["default_slots"]
        assert default_slots == ["10:00", "14:00"]
        
        for slot in available_slots:
            assert slot in default_slots
            
    @pytest.mark.asyncio
    async def test_availability_invalid_consultant(self, http_client, future_date):
        """
        PSEUDO-CODE: Test availability for invalid consultant
        GIVEN: Invalid consultant ID
        WHEN: GET /consultants/{invalid_id}/availability is called  
        THEN:
            - Should return appropriate error
            - Should not crash or expose system info
        """
        
        invalid_id = str(uuid.uuid4())
        params = {
            "target_date": future_date.isoformat(),
            "timezone": "Europe/Berlin"
        }
        
        response = await http_client.get(
            f"{CONSULTATIONS_BASE}/public/consultants/{invalid_id}/availability",
            params=params
        )
        
        # Should handle gracefully (empty slots or 404)
        assert response.status_code in [200, 404]
        
        if response.status_code == 200:
            data = response.json()
            # Should return empty availability
            assert data["data"]["available_slots"] == []
        
    @pytest.mark.asyncio  
    async def test_availability_past_date(self, http_client):
        """
        PSEUDO-CODE: Test availability for past date
        GIVEN: Valid consultant but past date
        WHEN: Availability is requested for past date
        THEN:
            - Should return empty availability
            - Should not allow booking in the past
        """
        
        consultants_response = await http_client.get(f"{CONSULTATIONS_BASE}/public/consultants/active")
        consultant_id = consultants_response.json()["data"]["consultants"][0]["id"]
        
        past_date = date.today() - timedelta(days=1)
        params = {
            "target_date": past_date.isoformat(),
            "timezone": "Europe/Berlin"  
        }
        
        response = await http_client.get(
            f"{CONSULTATIONS_BASE}/public/consultants/{consultant_id}/availability",
            params=params
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["available_slots"] == []

class TestBookingCreationAPI:
    """Test booking creation and validation"""
    
    @pytest.mark.asyncio
    async def test_create_booking_success(self, http_client, future_datetime):
        """
        PSEUDO-CODE: Test successful booking creation
        GIVEN: Valid consultant, date/time, and contact info
        WHEN: POST /public/bookings is called with valid data
        THEN:
            - Should return 201 or 200 status
            - Should return booking ID
            - Should store booking in database
            - Should have correct status (pending payment)
            - Should include all provided data
        """
        
        # Get consultant ID
        consultants_response = await http_client.get(f"{CONSULTATIONS_BASE}/public/consultants/active")
        consultant_id = consultants_response.json()["data"]["consultants"][0]["id"]
        
        booking_data = {
            "consultant_id": consultant_id,
            "consultation_date": future_datetime.isoformat(),
            "time_slot": "10:00",
            "contact_info": VALID_CONTACT_INFO,
            "terms_accepted": True,
            "utm_source": "test",
            "utm_medium": "automated", 
            "utm_campaign": "api_test"
        }
        
        response = await http_client.post(
            f"{CONSULTATIONS_BASE}/public/bookings",
            json=booking_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "data" in data
        assert "booking_id" in data["data"]
        
        booking = data["data"]["booking"]
        assert booking["consultant_id"] == consultant_id
        assert booking["time_slot"] == "10:00"
        assert booking["first_name"] == VALID_CONTACT_INFO["first_name"]
        assert booking["email"] == VALID_CONTACT_INFO["email"]
        assert booking["amount"] == 30.0
        assert booking["currency"] == "EUR"
        assert booking["booking_status"] in ["pending_payment", "confirmed"]
        
        # Store booking ID for later tests
        pytest.booking_id = data["data"]["booking_id"]
        
    @pytest.mark.asyncio
    async def test_create_booking_validation_errors(self, http_client):
        """
        PSEUDO-CODE: Test booking validation
        GIVEN: Invalid or missing booking data
        WHEN: POST /public/bookings is called
        THEN:
            - Should return 400 status
            - Should include specific validation errors
            - Should not create partial booking
        """
        
        # Test missing consultant_id
        invalid_data = {
            "consultation_date": datetime.now().isoformat(),
            "time_slot": "10:00",
            "contact_info": VALID_CONTACT_INFO,
            "terms_accepted": True
        }
        
        response = await http_client.post(
            f"{CONSULTATIONS_BASE}/public/bookings",
            json=invalid_data
        )
        
        assert response.status_code == 422  # Pydantic validation error
        
        # Test invalid email in contact info
        consultants_response = await http_client.get(f"{CONSULTATIONS_BASE}/public/consultants/active")
        consultant_id = consultants_response.json()["data"]["consultants"][0]["id"]
        
        invalid_contact = VALID_CONTACT_INFO.copy()
        invalid_contact["email"] = "invalid-email"
        
        invalid_data = {
            "consultant_id": consultant_id,
            "consultation_date": datetime.now().isoformat(),
            "time_slot": "10:00", 
            "contact_info": invalid_contact,
            "terms_accepted": True
        }
        
        response = await http_client.post(
            f"{CONSULTATIONS_BASE}/public/bookings", 
            json=invalid_data
        )
        
        assert response.status_code == 422
        
        # Test terms not accepted
        invalid_data = {
            "consultant_id": consultant_id,
            "consultation_date": datetime.now().isoformat(),
            "time_slot": "10:00",
            "contact_info": VALID_CONTACT_INFO,
            "terms_accepted": False  # Should be required
        }
        
        response = await http_client.post(
            f"{CONSULTATIONS_BASE}/public/bookings",
            json=invalid_data  
        )
        
        assert response.status_code in [400, 422]
        
    @pytest.mark.asyncio
    async def test_booking_conflict_prevention(self, http_client, future_datetime):
        """
        PSEUDO-CODE: Test double booking prevention
        GIVEN: A time slot is already booked
        WHEN: Another booking is attempted for same slot
        THEN:
            - Should return conflict error
            - Should not create duplicate booking
            - Should suggest alternative times
        """
        
        consultants_response = await http_client.get(f"{CONSULTATIONS_BASE}/public/consultants/active")
        consultant_id = consultants_response.json()["data"]["consultants"][0]["id"]
        
        booking_data = {
            "consultant_id": consultant_id,
            "consultation_date": future_datetime.isoformat(),
            "time_slot": "10:00",
            "contact_info": VALID_CONTACT_INFO,
            "terms_accepted": True
        }
        
        # Create first booking
        response1 = await http_client.post(
            f"{CONSULTATIONS_BASE}/public/bookings",
            json=booking_data
        )
        
        if response1.status_code == 200:
            # Try to create conflicting booking
            conflicting_contact = VALID_CONTACT_INFO.copy()
            conflicting_contact["email"] = "conflict@test.example.com"
            
            booking_data["contact_info"] = conflicting_contact
            
            response2 = await http_client.post(
                f"{CONSULTATIONS_BASE}/public/bookings", 
                json=booking_data
            )
            
            # Should prevent double booking
            assert response2.status_code == 400
            data = response2.json()
            assert data["success"] is False
            assert "time slot" in data["detail"].lower() or "available" in data["detail"].lower()

class TestBillingAPI:
    """Test billing information update"""
    
    @pytest.mark.asyncio
    async def test_update_billing_info(self, http_client):
        """
        PSEUDO-CODE: Test billing information update
        GIVEN: Existing booking ID
        WHEN: PUT /public/bookings/{id}/billing is called
        THEN:
            - Should update billing information
            - Should validate required fields
            - Should return updated booking data
        """
        
        if not hasattr(pytest, 'booking_id'):
            pytest.skip("No booking ID available from previous test")
            
        billing_update = {
            "billing_info": VALID_BILLING_INFO
        }
        
        response = await http_client.put(
            f"{CONSULTATIONS_BASE}/public/bookings/{pytest.booking_id}/billing",
            json=billing_update
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        booking = data["data"]["booking"] 
        assert booking["billing_first_name"] == VALID_BILLING_INFO["billing_first_name"]
        assert booking["billing_city"] == VALID_BILLING_INFO["billing_city"]
        assert booking["billing_country"] == VALID_BILLING_INFO["billing_country"]

class TestPaymentAPI:
    """Test payment processing"""
    
    @pytest.mark.asyncio
    async def test_process_payment_success(self, http_client):
        """
        PSEUDO-CODE: Test payment processing
        GIVEN: Booking with billing info
        WHEN: POST /public/bookings/{id}/payment is called
        THEN:
            - Should process payment
            - Should update booking status to confirmed
            - Should return payment confirmation
            - Should trigger email notifications
        """
        
        if not hasattr(pytest, 'booking_id'):
            pytest.skip("No booking ID available from previous test")
            
        payment_data = {
            "payment_method": "stripe",
            "payment_provider": "stripe"
        }
        
        response = await http_client.post(
            f"{CONSULTATIONS_BASE}/public/bookings/{pytest.booking_id}/payment",
            json=payment_data
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        booking = data["data"]["booking"]
        assert booking["payment_status"] == "completed"
        assert booking["booking_status"] == "confirmed"
        assert booking["payment_method"] == "stripe"
        assert "payment_reference" in booking

class TestBookingRetrievalAPI:
    """Test booking data retrieval"""
    
    @pytest.mark.asyncio  
    async def test_get_booking_by_id(self, http_client):
        """
        PSEUDO-CODE: Test booking retrieval
        GIVEN: Valid booking ID
        WHEN: GET /public/bookings/{id} is called
        THEN:
            - Should return complete booking data
            - Should include consultant information
            - Should include all contact/billing details
            - Should include current status
        """
        
        if not hasattr(pytest, 'booking_id'):
            pytest.skip("No booking ID available from previous test")
            
        response = await http_client.get(
            f"{CONSULTATIONS_BASE}/public/bookings/{pytest.booking_id}"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        booking = data["data"]["booking"]
        
        # Validate complete booking structure
        required_fields = [
            "id", "consultant_id", "first_name", "last_name", "email",
            "consultation_date", "time_slot", "amount", "currency",
            "booking_status", "payment_status", "created_at"
        ]
        
        for field in required_fields:
            assert field in booking, f"Missing field: {field}"
            
        # Should include consultant data
        if "consultant" in booking:
            consultant = booking["consultant"]
            assert "first_name" in consultant
            assert "last_name" in consultant
            assert "headline" in consultant
            
    @pytest.mark.asyncio
    async def test_get_booking_invalid_id(self, http_client):
        """
        PSEUDO-CODE: Test invalid booking ID
        GIVEN: Invalid booking ID
        WHEN: GET /public/bookings/{invalid_id} is called
        THEN:
            - Should return 404 status
            - Should not expose system information
        """
        
        invalid_id = str(uuid.uuid4())
        
        response = await http_client.get(
            f"{CONSULTATIONS_BASE}/public/bookings/{invalid_id}"
        )
        
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Booking not found"

class TestBookingConfigAPI:
    """Test booking configuration endpoint"""
    
    @pytest.mark.asyncio
    async def test_get_booking_config(self, http_client):
        """
        PSEUDO-CODE: Test booking configuration
        GIVEN: API is running
        WHEN: GET /public/booking-config is called
        THEN:
            - Should return pricing information (€30)
            - Should return available time slots
            - Should return supported countries
            - Should return localized messages
        """
        
        response = await http_client.get(f"{CONSULTATIONS_BASE}/public/booking-config")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        config = data["data"]["config"]
        
        # Validate pricing
        assert config["pricing"]["amount"] == 30.00
        assert config["pricing"]["currency"] == "EUR"
        assert config["pricing"]["duration_minutes"] == 30
        
        # Validate time slots
        assert config["time_slots"] == ["10:00", "14:00"]
        
        # Validate countries
        assert "DE" in config["supported_countries"]
        assert "AT" in config["supported_countries"]
        assert "CH" in config["supported_countries"]
        
        # Validate localized messages
        assert "messages" in config
        assert "en" in config["messages"]
        assert "de" in config["messages"]
        
        de_messages = config["messages"]["de"]
        assert "€30" in de_messages["booking_description"]
        assert "Kostenpflichtig bestellen" in de_messages["payment_button"]
        assert "DSGVO" in de_messages["gdpr_notice"]

class TestAPIErrorHandling:
    """Test API error handling and resilience"""
    
    @pytest.mark.asyncio
    async def test_api_health_check(self, http_client):
        """
        PSEUDO-CODE: Test API health
        GIVEN: API should be running
        WHEN: Health check endpoint is called
        THEN:
            - Should return 200 status
            - Should confirm database connectivity
            - Should confirm all services are operational
        """
        
        response = await http_client.get(f"{API_BASE_URL}/health")
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("status") == "healthy"
        else:
            # If no health endpoint, check basic API functionality
            response = await http_client.get(f"{CONSULTATIONS_BASE}/public/booking-config")
            assert response.status_code == 200
            
    @pytest.mark.asyncio
    async def test_api_rate_limiting(self, http_client):
        """
        PSEUDO-CODE: Test API rate limiting
        GIVEN: API has rate limiting configured
        WHEN: Multiple rapid requests are made
        THEN:
            - Should handle requests gracefully
            - Should apply rate limiting if configured
            - Should not crash or become unresponsive
        """
        
        # Make rapid requests to test stability
        tasks = []
        for i in range(10):
            task = http_client.get(f"{CONSULTATIONS_BASE}/public/booking-config")
            tasks.append(task)
            
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Most requests should succeed
        success_count = sum(1 for r in responses if hasattr(r, 'status_code') and r.status_code == 200)
        assert success_count >= 8, "API should handle concurrent requests"
        
    @pytest.mark.asyncio
    async def test_invalid_json_handling(self, http_client):
        """
        PSEUDO-CODE: Test invalid JSON handling
        GIVEN: API expects JSON data
        WHEN: Invalid JSON is sent
        THEN:
            - Should return appropriate error status
            - Should not crash or expose stack traces
        """
        
        # Send invalid JSON
        response = await http_client.post(
            f"{CONSULTATIONS_BASE}/public/bookings",
            content="invalid json{{{",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [400, 422]
        
        # Should not expose internal errors
        response_text = response.text.lower()
        assert "traceback" not in response_text
        assert "internal server error" not in response_text or response.status_code != 500

if __name__ == "__main__":
    """
    Run API tests directly:
    python -m pytest tests/api/booking-api.test.py -v
    """
    pytest.main([__file__, "-v", "--tb=short"])