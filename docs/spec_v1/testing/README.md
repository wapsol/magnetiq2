# voltAIc Systems Test Suite

This directory contains comprehensive tests for both frontend and backend components of the voltAIc Systems admin authentication system.

## Directory Structure

```
tests/
├── manual/               # Manual testing tools (HTML/Python scripts)
│   ├── test_admin_flow.html      # Interactive admin flow testing
│   ├── test_frontend_login.html  # Frontend login testing
│   └── test_page.html            # General page testing
├── backend/              # Backend tests (pytest)
│   ├── scripts/          # Backend test scripts
│   │   ├── test_login.py         # Login API testing
│   │   ├── test_email.py         # Email service testing
│   │   ├── test_password_reset.py # Password reset testing
│   │   └── login_test.json       # Login test data
│   ├── unit/             # Unit tests for services and models
│   ├── integration/      # API endpoint integration tests
│   └── conftest.py       # Test fixtures and configuration
├── frontend/             # Frontend tests (Jest + React Testing Library)
│   ├── components/       # Component unit tests
│   ├── integration/      # Frontend integration tests
│   └── setup/           # Test configuration and setup files
└── e2e/                  # End-to-end tests (future: Playwright)
```

## Manual Testing

### Interactive Testing Tools
These HTML files provide browser-based interfaces for manual testing:

#### Admin Flow Test (`manual/test_admin_flow.html`)
Interactive web interface to test:
- Backend connectivity
- Admin authentication 
- Settings API functionality
- Complete admin workflow

**Usage:** Open in browser at `http://localhost:8090/tests/manual/test_admin_flow.html`

#### Frontend Login Test (`manual/test_frontend_login.html`)
Test frontend login functionality independently.

#### Page Test (`manual/test_page.html`)
General page testing and validation.

### Backend Test Scripts
Located in `backend/scripts/`:
- `test_login.py`: Python script to test admin login API
- `test_email.py`: Email service functionality testing  
- `test_password_reset.py`: Password reset flow testing
- `login_test.json`: Test credentials and data

**Running Backend Scripts:**
```bash
cd tests/backend/scripts
python test_login.py
python test_email.py
python test_password_reset.py
```

## Frontend Testing

### Setup
The frontend tests use Jest with React Testing Library for comprehensive component and integration testing.

### Running Frontend Tests
```bash
# Run all frontend tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Categories
- **Component Tests**: Test individual React components (AdminLogin, AdminLayout)
- **Integration Tests**: Test complete user workflows and component interactions
- **Mock Services**: Mock API calls and localStorage for isolated testing

### Key Test Files
- `components/AdminLogin.test.tsx` - Tests email-based login form
- `components/AdminLayout.test.tsx` - Tests admin layout and navigation
- `integration/admin-auth-flow.test.tsx` - Tests complete authentication flow

## Backend Testing

### Setup
The backend tests use pytest with httpx for API testing and SQLAlchemy for database testing.

### Running Backend Tests
```bash
# Run all backend tests
cd backend && python -m pytest

# Run with coverage
cd backend && python -m pytest --cov=. --cov-report=html

# Run specific test categories
cd backend && python -m pytest -m unit      # Unit tests only
cd backend && python -m pytest -m integration  # Integration tests only
cd backend && python -m pytest -m auth      # Authentication tests only
```

### Test Categories
- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test API endpoints and database interactions
- **Authentication Tests**: Comprehensive testing of auth flows

### Key Test Files
- `unit/test_admin_auth_service.py` - Tests AdminAuthService functionality
- `unit/test_admin_models.py` - Tests AdminUser and AdminSession models
- `integration/test_admin_auth_endpoints.py` - Tests all auth API endpoints
- `integration/test_admin_login_flow.py` - Tests complete authentication workflows

## Test Fixtures and Utilities

### Backend Fixtures (`conftest.py`)
- `db_session` - Fresh database session for each test
- `client` - FastAPI test client with database override
- `test_admin_user` - Pre-created admin user for testing
- `admin_token` - Valid authentication token
- `auth_headers` - Authorization headers for authenticated requests

### Frontend Mocks
- Mock `fetch` API for HTTP requests
- Mock `localStorage` for token storage
- Mock `react-router-dom` for navigation testing
- Mock logger utilities

## Authentication Test Coverage

### Login Flow Tests
- ✅ Email-based login (not username)
- ✅ Password validation and hashing
- ✅ Token generation and verification
- ✅ Session creation and management
- ✅ Error handling and validation

### Security Tests
- ✅ Account lockout after failed attempts
- ✅ Password reset token generation
- ✅ Token expiration handling
- ✅ Session invalidation on logout
- ✅ Concurrent session management

### UI/UX Tests
- ✅ Form validation and error display
- ✅ Loading states and user feedback
- ✅ Navigation after login/logout
- ✅ User information display
- ✅ Email display (instead of username)

## Test Data and Constants

### Test Users
- **Email**: `test@voltAIc.systems`
- **Password**: `testpassword123`
- **Role**: `admin`
- **Super Admin**: `true`

### API Endpoints Tested
- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/logout`
- `POST /api/v1/admin/auth/request-password-reset`
- `POST /api/v1/admin/auth/reset-password`
- `POST /api/v1/admin/auth/change-password`

## Continuous Integration

### Test Commands for CI/CD
```bash
# Frontend tests
npm test -- --coverage --watchAll=false

# Backend tests  
python -m pytest --cov=backend --cov-report=xml
```

### Coverage Targets
- **Frontend**: >90% coverage for authentication components
- **Backend**: >95% coverage for authentication services
- **Integration**: 100% coverage for critical auth flows

## Adding New Tests

### Frontend Component Test Template
```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import YourComponent from '../../../src/components/YourComponent';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('YourComponent', () => {
  test('renders correctly', () => {
    renderWithRouter(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Backend API Test Template
```python
import pytest

class TestYourEndpoint:
    @pytest.mark.integration
    def test_endpoint_success(self, client, auth_headers):
        response = client.get("/api/v1/your-endpoint", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["success"] == True
```

## Best Practices

### Frontend Testing
1. Use `data-testid` for complex element selection
2. Mock external dependencies (APIs, localStorage)
3. Test user interactions, not implementation details
4. Use `waitFor` for async operations
5. Test error states and edge cases

### Backend Testing
1. Use database transactions that rollback after each test
2. Test both successful and error scenarios
3. Verify database state changes
4. Use descriptive test names
5. Group related tests in classes

### Authentication Testing
1. Always test the complete flow (login → use token → logout)
2. Test security boundaries (expired tokens, invalid credentials)
3. Verify sensitive data is not exposed in responses
4. Test rate limiting and account lockout
5. Ensure proper session management

## Troubleshooting

### Common Issues
1. **Database Lock**: Ensure proper test isolation and cleanup
2. **Async Issues**: Use `await` and `waitFor` appropriately
3. **Mock Conflicts**: Clear mocks between tests
4. **Token Expiry**: Use fresh tokens for each test
5. **CORS Issues**: Mock fetch instead of making real HTTP calls

### Debug Commands
```bash
# Run single test with verbose output
npm test -- --testNamePattern="specific test name" --verbose

# Run backend test with detailed output
python -m pytest tests/backend/unit/test_admin_auth_service.py::TestAdminAuthService::test_login_success -v -s
```

This test suite ensures the admin authentication system is robust, secure, and user-friendly. All tests should pass before deploying changes to production.