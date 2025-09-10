# Backend Unit Testing Specification

## Overview

Unit tests validate individual components, functions, and classes in isolation from external dependencies. This specification defines the approach, standards, and requirements for backend unit testing.

## Testing Framework

### Primary Tools
- **pytest**: Primary testing framework for Python backend
- **pytest-asyncio**: Async test support
- **unittest.mock**: Mocking framework for isolating components
- **coverage**: Code coverage measurement

### Configuration
- **Test Discovery**: Files matching `test_*.py` pattern
- **Async Support**: Automatic async test detection  
- **Coverage Target**: >90% for critical business logic
- **Test Markers**: Custom markers for test categorization

## Test Categories

### 1. Service Layer Tests
Test business logic without database or HTTP dependencies.

```python
# Example: User Management Service Tests
class TestUserManagementService:
    def test_can_manage_role_permissions(self):
        """Test role management permission logic"""
        assert can_manage_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)
        assert not can_manage_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    
    @pytest.mark.asyncio
    async def test_create_user_validation(self):
        """Test user creation validation without database"""
        # Mock database interactions
        # Test validation logic
        pass
```

### 2. Model Tests  
Test data models, validation, and computed properties.

```python
def test_user_model_properties(self):
    """Test AdminUser model computed properties"""
    user = AdminUser(first_name="John", last_name="Doe")
    assert user.full_name == "John Doe"
    assert user.is_locked is False
```

### 3. Utility Function Tests
Test helper functions and utilities.

```python
def test_password_generation(self):
    """Test secure password generation"""
    password = generate_password()
    assert len(password) >= 12
    assert any(c.isupper() for c in password)
```

### 4. Permission System Tests
Test role-based access control logic.

```python
def test_permission_system(self):
    """Test permission validation"""
    assert has_permission(UserRole.ADMIN, Permission.USER_MANAGEMENT)
    assert not has_permission(UserRole.VIEWER, Permission.WRITE)
```

## Test Structure

### Naming Conventions
- **Test Files**: `test_{module_name}.py`
- **Test Classes**: `TestClassName`  
- **Test Methods**: `test_specific_behavior`
- **Async Tests**: Use `@pytest.mark.asyncio` decorator

### Test Organization
```
tests/unit/
├── test_user_management_service.py
├── test_permissions.py
├── test_security.py
├── test_models.py
└── test_utilities.py
```

### Fixture Usage
```python
@pytest.fixture
def mock_user():
    """Create mock user for testing"""
    return AdminUser(
        email="test@example.com",
        role=UserRole.ADMIN
    )

def test_function_with_fixture(mock_user):
    """Test using fixture data"""
    assert mock_user.email == "test@example.com"
```

## Mocking Strategy

### Database Mocking
```python
@patch('app.database.get_db')
async def test_service_without_db(mock_get_db):
    """Mock database dependencies"""
    mock_db = AsyncMock()
    mock_get_db.return_value = mock_db
    # Test service logic
```

### External Service Mocking
```python
@patch('app.services.email_service.send_email')
async def test_notification_without_email(mock_send_email):
    """Mock external email service"""
    mock_send_email.return_value = True
    # Test notification logic
```

## Validation Testing

### Input Validation
- Test valid input scenarios
- Test invalid input handling
- Test edge cases and boundary conditions
- Test data sanitization

### Error Handling
- Test exception raising for invalid inputs
- Test error message accuracy
- Test graceful degradation

### Security Testing
- Test permission checks
- Test data sanitization
- Test authentication logic
- Test authorization rules

## Performance Considerations

### Test Execution Speed
- Keep unit tests fast (<10ms per test)
- Mock all external dependencies
- Use in-memory data structures
- Avoid file system operations

### Parallel Execution
```ini
# pytest.ini
[tool:pytest]
addopts = -n auto
```

## Coverage Requirements

### Coverage Targets
- **Critical Business Logic**: 95%+
- **Service Layer**: 90%+
- **Utility Functions**: 85%+
- **Models**: 80%+

### Coverage Exclusions
```python
# Exclude from coverage
if __name__ == "__main__":  # pragma: no cover
    main()
```

### Coverage Reporting
```bash
pytest --cov=app --cov-report=html --cov-report=term
```

## Test Data Management

### Test Data Creation
```python
class UserFactory:
    """Factory for creating test users"""
    
    @staticmethod
    def create_user(**kwargs):
        defaults = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User"
        }
        defaults.update(kwargs)
        return AdminUser(**defaults)
```

### Data Isolation
- Each test should create its own test data
- No shared state between tests
- Clean up after each test

## Quality Standards

### Test Quality Metrics
- **Reliability**: Tests pass consistently
- **Maintainability**: Easy to update when code changes
- **Readability**: Clear test intent and structure
- **Speed**: Fast execution for rapid feedback

### Best Practices
1. **Single Responsibility**: One test per behavior
2. **Clear Naming**: Descriptive test names
3. **Arrange-Act-Assert**: Clear test structure
4. **Independent Tests**: No dependencies between tests
5. **Minimal Mocking**: Mock only what's necessary

## Continuous Integration

### Automated Testing
```yaml
# GitHub Actions example
- name: Run Unit Tests
  run: |
    pytest tests/unit/ -v --cov=app/services
    pytest tests/unit/ -v --cov=app/models
```

### Quality Gates
- All unit tests must pass
- Coverage threshold must be met
- No critical security issues
- Performance benchmarks met

## Documentation Requirements

### Test Documentation
- Each test file should have module docstring
- Complex tests should have detailed comments
- Test categories should be marked clearly

### Example Documentation
```python
"""
Unit tests for UserManagementService

Tests the core business logic of user management operations without 
involving the database or HTTP layer.

Test Categories:
- Permission validation
- Role management 
- Data validation
- Error handling
"""
```

This unit testing specification ensures comprehensive testing of business logic while maintaining fast execution and clear test organization.