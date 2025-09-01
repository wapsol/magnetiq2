# Backend API Testing Specification

## Overview

API tests validate HTTP endpoints including request/response handling, authentication, authorization, and error scenarios. This specification defines comprehensive API testing standards.

## Testing Framework

### Primary Tools
- **httpx**: Async HTTP client for API testing
- **FastAPI TestClient**: Integration with FastAPI applications
- **pytest-asyncio**: Async test support
- **pytest fixtures**: Test data and authentication setup

### Test Environment
- **Test Database**: In-memory SQLite for isolation
- **Mock Services**: External service mocking
- **Test Client**: Configured with dependency overrides

## Test Categories

### 1. Authentication Tests
Validate JWT token handling and user authentication.

```python
async def test_login_success(client: AsyncClient):
    """Test successful user login"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]

async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with invalid credentials"""
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@test.com", 
        "password": "wrongpass"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"
```

### 2. Authorization Tests
Validate role-based access control for protected endpoints.

```python
async def test_admin_endpoint_requires_admin_role(client: AsyncClient, auth_headers_viewer: dict):
    """Test that admin endpoints reject viewer tokens"""
    response = await client.get("/admin/users", headers=auth_headers_viewer)
    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions"

async def test_super_admin_only_endpoint(client: AsyncClient, auth_headers_admin: dict):
    """Test super admin exclusive endpoints"""
    response = await client.post("/admin/users/promote-to-super-admin/1", headers=auth_headers_admin)
    assert response.status_code == 403
```

### 3. CRUD Operations Tests
Validate Create, Read, Update, Delete operations.

```python
async def test_create_user_success(client: AsyncClient, auth_headers_admin: dict):
    """Test successful user creation"""
    user_data = {
        "email": "newuser@example.com",
        "first_name": "New",
        "last_name": "User",
        "role": "editor"
    }
    response = await client.post("/admin/users", json=user_data, headers=auth_headers_admin)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "editor"

async def test_update_user_partial(client: AsyncClient, auth_headers_admin: dict, editor_user: AdminUser):
    """Test partial user update"""
    update_data = {"first_name": "Updated"}
    response = await client.put(f"/admin/users/{editor_user.id}", 
                               json=update_data, headers=auth_headers_admin)
    assert response.status_code == 200
    assert response.json()["first_name"] == "Updated"
```

### 4. Validation Tests
Validate request data validation and error handling.

```python
async def test_create_user_invalid_email(client: AsyncClient, auth_headers_admin: dict):
    """Test user creation with invalid email format"""
    user_data = {
        "email": "invalid-email",
        "first_name": "Test",
        "last_name": "User"
    }
    response = await client.post("/admin/users", json=user_data, headers=auth_headers_admin)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any(error["loc"] == ["email"] for error in errors)

async def test_create_user_missing_required_fields(client: AsyncClient, auth_headers_admin: dict):
    """Test user creation with missing required fields"""
    response = await client.post("/admin/users", json={}, headers=auth_headers_admin)
    assert response.status_code == 422
```

### 5. Error Handling Tests
Validate proper error responses and status codes.

```python
async def test_get_nonexistent_user(client: AsyncClient, auth_headers_admin: dict):
    """Test retrieving non-existent user"""
    response = await client.get("/admin/users/99999", headers=auth_headers_admin)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

async def test_duplicate_email_creation(client: AsyncClient, auth_headers_admin: dict, admin_user: AdminUser):
    """Test creating user with duplicate email"""
    user_data = {
        "email": admin_user.email,
        "first_name": "Duplicate",
        "last_name": "User"
    }
    response = await client.post("/admin/users", json=user_data, headers=auth_headers_admin)
    assert response.status_code == 409
```

## Test Structure

### Fixture-Based Authentication
```python
@pytest_asyncio.fixture
async def auth_headers_admin(client: AsyncClient, admin_user: AdminUser) -> dict:
    """Get authorization headers for admin user"""
    response = await client.post("/api/v1/auth/login", json={
        "email": admin_user.email,
        "password": "testpass123"
    })
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

### Test Data Factories
```python
class UserFactory:
    @staticmethod
    def create_user_data(**kwargs) -> dict:
        """Create user data for API requests"""
        default_data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "role": "viewer"
        }
        default_data.update(kwargs)
        return default_data

@pytest.fixture
def user_factory() -> UserFactory:
    return UserFactory()
```

## Response Validation

### Standard Response Structure
```python
def validate_user_response(data: dict):
    """Validate standard user response structure"""
    required_fields = ["id", "email", "first_name", "last_name", "role", "is_active"]
    for field in required_fields:
        assert field in data
    
    assert isinstance(data["id"], int)
    assert "@" in data["email"]
    assert data["role"] in ["super_admin", "admin", "editor", "viewer"]
    assert isinstance(data["is_active"], bool)
```

### Pagination Response Validation
```python
def validate_paginated_response(data: dict):
    """Validate paginated response structure"""
    required_fields = ["items", "total", "page", "size", "total_pages"]
    for field in required_fields:
        assert field in data
    
    assert isinstance(data["items"], list)
    assert isinstance(data["total"], int)
    assert data["page"] >= 1
    assert data["size"] >= 1
```

## Performance Testing

### Response Time Validation
```python
import time

async def test_api_response_time(client: AsyncClient, auth_headers_admin: dict):
    """Test API response time requirements"""
    start_time = time.time()
    response = await client.get("/admin/users", headers=auth_headers_admin)
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 2.0  # Max 2 seconds
```

### Load Testing Simulation
```python
async def test_concurrent_user_creation(client: AsyncClient, auth_headers_admin: dict):
    """Test concurrent API requests"""
    tasks = []
    for i in range(10):
        user_data = {
            "email": f"concurrent{i}@example.com",
            "first_name": f"User{i}",
            "last_name": "Test",
            "role": "viewer"
        }
        task = client.post("/admin/users", json=user_data, headers=auth_headers_admin)
        tasks.append(task)
    
    responses = await asyncio.gather(*tasks)
    success_count = sum(1 for r in responses if r.status_code == 201)
    assert success_count == 10
```

## Security Testing

### Authentication Security
```python
async def test_expired_token_rejection(client: AsyncClient):
    """Test that expired tokens are rejected"""
    expired_token = create_expired_jwt_token()
    headers = {"Authorization": f"Bearer {expired_token}"}
    
    response = await client.get("/admin/users", headers=headers)
    assert response.status_code == 401

async def test_malformed_token_rejection(client: AsyncClient):
    """Test malformed token rejection"""
    headers = {"Authorization": "Bearer invalid-token"}
    response = await client.get("/admin/users", headers=headers)
    assert response.status_code == 401
```

### Input Security
```python
async def test_sql_injection_protection(client: AsyncClient, auth_headers_admin: dict):
    """Test SQL injection protection"""
    malicious_input = "'; DROP TABLE users; --"
    response = await client.get(f"/admin/users?q={malicious_input}", headers=auth_headers_admin)
    assert response.status_code == 200  # Should not cause server error

async def test_xss_protection(client: AsyncClient, auth_headers_admin: dict):
    """Test XSS protection in user data"""
    user_data = {
        "email": "test@example.com",
        "first_name": "<script>alert('xss')</script>",
        "last_name": "User"
    }
    response = await client.post("/admin/users", json=user_data, headers=auth_headers_admin)
    # Should either reject or sanitize
    if response.status_code == 201:
        data = response.json()
        assert "<script>" not in data["first_name"]
```

## Integration Scenarios

### End-to-End User Lifecycle
```python
async def test_complete_user_lifecycle(client: AsyncClient, auth_headers_admin: dict):
    """Test complete user management lifecycle"""
    # 1. Create user
    user_data = {
        "email": "lifecycle@example.com",
        "first_name": "Lifecycle",
        "last_name": "Test",
        "role": "editor"
    }
    create_response = await client.post("/admin/users", json=user_data, headers=auth_headers_admin)
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]
    
    # 2. Read user
    get_response = await client.get(f"/admin/users/{user_id}", headers=auth_headers_admin)
    assert get_response.status_code == 200
    
    # 3. Update user
    update_data = {"first_name": "Updated"}
    update_response = await client.put(f"/admin/users/{user_id}", 
                                     json=update_data, headers=auth_headers_admin)
    assert update_response.status_code == 200
    
    # 4. Deactivate user
    deactivate_response = await client.post(f"/admin/users/{user_id}/deactivate", 
                                          headers=auth_headers_admin)
    assert deactivate_response.status_code == 200
    
    # 5. Delete user
    delete_response = await client.delete(f"/admin/users/{user_id}", headers=auth_headers_admin)
    assert delete_response.status_code == 200
```

## Test Organization

### Directory Structure
```
tests/api/
├── test_auth.py
├── test_admin_users.py  
├── test_permissions.py
├── test_validation.py
└── test_security.py
```

### Test Categorization
```python
@pytest.mark.api
@pytest.mark.admin
@pytest.mark.slow
async def test_bulk_operations(client: AsyncClient, auth_headers_admin: dict):
    """Test marked with multiple categories"""
    pass
```

## Quality Standards

### Coverage Requirements
- **API Endpoints**: 100% endpoint coverage
- **Response Codes**: All possible status codes tested
- **Error Scenarios**: All error paths validated
- **Security**: All authentication/authorization paths tested

### Performance Standards
- **Response Time**: <2 seconds for CRUD operations
- **Throughput**: Handle 100 concurrent requests
- **Memory**: No memory leaks during test execution
- **Database**: Efficient query patterns validated

This API testing specification ensures comprehensive validation of all HTTP endpoints while maintaining security and performance standards.