# Test Suite for Public Booking Frontend

This test suite validates all aspects of the public consultation booking functionality at `http://localhost:8040/de/kontakt/terminbuchung`.

## Test Categories

- **e2e/**: End-to-end browser automation tests
- **api/**: Backend API integration tests
- **performance/**: Load testing and performance validation
- **accessibility/**: WCAG 2.1 AA compliance tests
- **mobile/**: Mobile responsiveness tests
- **security/**: Security vulnerability tests
- **cli/**: Command-line health checks and smoke tests
- **fixtures/**: Test data and mock configurations
- **utils/**: Shared test utilities and helpers

## Setup

### Prerequisites
```bash
# Install backend testing dependencies
pip install pytest pytest-asyncio pytest-httpx faker

# Install frontend testing dependencies
cd frontend
npm install --save-dev playwright @playwright/test axe-core @axe-core/playwright @testing-library/react

# Install CLI testing tools
npm install -g artillery
```

### Environment Setup
```bash
# Start backend services
cd backend
python -m uvicorn app.main:app --port 8037 --reload

# Start frontend (in separate terminal)
cd frontend  
npm run dev

# Verify services are running
curl http://localhost:8037/health
curl http://localhost:8041/
```

## Running Tests

### Complete Test Suite
```bash
# Run all tests
npm run test:all

# Run specific categories
npm run test:e2e        # Browser automation
npm run test:api        # API integration
npm run test:perf       # Performance
npm run test:a11y       # Accessibility
npm run test:mobile     # Mobile
npm run test:security   # Security
npm run test:cli        # CLI health checks
```

### Individual Test Files
```bash
# E2E tests
npx playwright test tests/e2e/booking-flow.spec.js

# API tests  
pytest tests/api/booking-api.test.py -v

# Performance tests
artillery run tests/performance/load-test.yml

# Accessibility tests
npx playwright test tests/accessibility/a11y.spec.js

# CLI health checks and smoke tests
./tests/cli/health-check.sh all
./tests/cli/smoke-test.sh
```

## Test Data

All test scenarios use the following verified consultants:
- **Ashant Chalasani** (Featured, Technology Leader)
- **Pascal Köth** (Business Strategy Consultant)

## Success Criteria

- ✅ All booking steps complete successfully
- ✅ German localization working correctly
- ✅ Date selection shows 21 days (weekdays only)
- ✅ Time slots (10:00, 14:00) available
- ✅ Form validation prevents invalid input
- ✅ €30 payment processing works
- ✅ Modal scroll functionality works
- ✅ Mobile responsive design
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Performance benchmarks met
- ✅ Security vulnerabilities addressed

## CLI Tools

### Health Check Scripts

Comprehensive system health monitoring and diagnostics:

```bash
# Run all health checks
./tests/cli/health-check.sh all

# Check specific components
./tests/cli/health-check.sh services    # Verify all services are running
./tests/cli/health-check.sh database    # Test database connectivity  
./tests/cli/health-check.sh api         # Validate API endpoints
./tests/cli/health-check.sh booking     # Test booking system functionality
./tests/cli/health-check.sh performance # Monitor response times
./tests/cli/health-check.sh logs        # Analyze recent logs for errors

# Advanced options
./tests/cli/health-check.sh all --verbose           # Show detailed output
./tests/cli/health-check.sh api --endpoint="/health" # Test specific endpoint
./tests/cli/health-check.sh all --timeout=30        # Set custom timeout
```

### Smoke Tests

Quick validation for deployments and continuous monitoring:

```bash
# Run comprehensive smoke tests
./tests/cli/smoke-test.sh

# Target specific areas
./tests/cli/smoke-test.sh --api-only      # Backend API only
./tests/cli/smoke-test.sh --frontend-only # Frontend accessibility only
./tests/cli/smoke-test.sh --locale=de     # German localization only
./tests/cli/smoke-test.sh --locale=en     # English localization only
./tests/cli/smoke-test.sh --fast          # Skip performance tests

# Development options
./tests/cli/smoke-test.sh --verbose       # Show detailed test output
./tests/cli/smoke-test.sh --timeout=30    # Custom timeout for requests
```

**Exit Codes:**
- `0` - All tests passed successfully
- `1` - Critical failures detected (deployment should be blocked)
- `2` - Non-critical issues found (warnings only)

## CI/CD Integration

These tests are designed to run in continuous integration pipelines:
- **Smoke tests**: Run on every commit
- **Full regression**: Run on pull requests
- **Performance tests**: Run nightly
- **Security scans**: Run weekly