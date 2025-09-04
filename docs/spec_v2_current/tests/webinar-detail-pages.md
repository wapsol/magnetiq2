# Webinar Detail Pages - Test Specifications

## Overview

Comprehensive testing specifications for webinar detail pages, including calendar integration, social sharing, registration flow, and multi-language support.

## Test Categories

### 1. Unit Tests

#### 1.1 Calendar Integration Utilities
**File**: `frontend/src/utils/calendar.test.ts`

```typescript
describe('Calendar Integration Utilities', () => {
  describe('generateGoogleCalendarUrl', () => {
    it('should generate valid Google Calendar URL with all parameters', () => {
      const webinar = mockWebinarData;
      const url = generateGoogleCalendarUrl(webinar);
      expect(url).toContain('calendar.google.com/calendar/render');
      expect(url).toContain('action=TEMPLATE');
      expect(url).toContain(`text=${encodeURIComponent(webinar.title)}`);
    });

    it('should handle special characters in title and description', () => {
      const webinar = { ...mockWebinarData, title: 'AI & Machine Learning: Trends & Insights' };
      const url = generateGoogleCalendarUrl(webinar);
      expect(url).toContain(encodeURIComponent('AI & Machine Learning: Trends & Insights'));
    });

    it('should correctly format date and time in ISO format', () => {
      const webinar = mockWebinarData;
      const url = generateGoogleCalendarUrl(webinar);
      expect(url).toMatch(/dates=\d{8}T\d{6}Z\/\d{8}T\d{6}Z/);
    });
  });

  describe('generateOutlookCalendarUrl', () => {
    it('should generate valid Outlook Calendar URL', () => {
      const webinar = mockWebinarData;
      const url = generateOutlookCalendarUrl(webinar);
      expect(url).toContain('outlook.live.com/calendar/0/deeplink/compose');
    });

    it('should handle timezone conversion correctly', () => {
      const webinar = { ...mockWebinarData, timezone: 'America/New_York' };
      const url = generateOutlookCalendarUrl(webinar);
      expect(url).toContain('startTime=');
      expect(url).toContain('endTime=');
    });
  });

  describe('generateICSFile', () => {
    it('should generate valid ICS file content', () => {
      const webinar = mockWebinarData;
      const icsContent = generateICSFile(webinar);
      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(icsContent).toContain('VERSION:2.0');
      expect(icsContent).toContain('BEGIN:VEVENT');
      expect(icsContent).toContain('END:VEVENT');
      expect(icsContent).toContain('END:VCALENDAR');
    });

    it('should include all required ICS properties', () => {
      const webinar = mockWebinarData;
      const icsContent = generateICSFile(webinar);
      expect(icsContent).toContain('SUMMARY:');
      expect(icsContent).toContain('DTSTART:');
      expect(icsContent).toContain('DTEND:');
      expect(icsContent).toContain('DESCRIPTION:');
      expect(icsContent).toContain('UID:');
    });
  });
});
```

#### 1.2 Social Sharing Utilities
**File**: `frontend/src/utils/socialSharing.test.ts`

```typescript
describe('Social Sharing Utilities', () => {
  describe('generateLinkedInShareUrl', () => {
    it('should generate valid LinkedIn share URL', () => {
      const webinar = mockWebinarData;
      const url = generateLinkedInShareUrl(webinar);
      expect(url).toContain('linkedin.com/sharing/share-offsite');
      expect(url).toContain(`url=${encodeURIComponent(webinar.shareUrl)}`);
    });

    it('should include professional messaging for LinkedIn', () => {
      const webinar = mockWebinarData;
      const message = generateLinkedInMessage(webinar);
      expect(message).toContain('professional development');
      expect(message).toContain('#AI #MachineLearning');
    });
  });

  describe('generateTwitterShareUrl', () => {
    it('should generate valid Twitter share URL', () => {
      const webinar = mockWebinarData;
      const url = generateTwitterShareUrl(webinar);
      expect(url).toContain('twitter.com/intent/tweet');
      expect(url).toContain('text=');
      expect(url).toContain('url=');
    });

    it('should respect Twitter character limit', () => {
      const webinar = { ...mockWebinarData, title: 'A'.repeat(200) };
      const message = generateTwitterMessage(webinar);
      expect(message.length).toBeLessThanOrEqual(280);
    });
  });

  describe('generateCustomShareMessage', () => {
    it('should customize message based on user role', () => {
      const webinar = mockWebinarData;
      const message = generateCustomShareMessage(webinar, { role: 'CTO', industry: 'Technology' });
      expect(message).toContain('CTO');
      expect(message).toContain('Technology');
    });
  });
});
```

#### 1.3 Registration Form Validation
**File**: `frontend/src/components/webinars/RegistrationModal.test.tsx`

```typescript
describe('Registration Form Validation', () => {
  it('should validate email format correctly', () => {
    const { getByLabelText, getByText } = render(<RegistrationModal />);
    const emailInput = getByLabelText('Email');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    expect(getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('should validate required fields', () => {
    const { getByRole, getByText } = render(<RegistrationModal />);
    const submitButton = getByRole('button', { name: /register/i });
    
    fireEvent.click(submitButton);
    
    expect(getByText('First name is required')).toBeInTheDocument();
    expect(getByText('Last name is required')).toBeInTheDocument();
    expect(getByText('Email is required')).toBeInTheDocument();
  });

  it('should prevent submission with invalid data', async () => {
    const mockSubmit = jest.fn();
    const { getByRole } = render(<RegistrationModal onSubmit={mockSubmit} />);
    
    fireEvent.click(getByRole('button', { name: /register/i }));
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

### 2. Integration Tests

#### 2.1 Webinar Detail Page Integration
**File**: `frontend/src/tests/integration/WebinarDetailPage.test.tsx`

```typescript
describe('Webinar Detail Page Integration', () => {
  beforeEach(() => {
    // Mock API responses
    jest.spyOn(api, 'getWebinarById').mockResolvedValue(mockWebinarData);
    jest.spyOn(api, 'registerForWebinar').mockResolvedValue(mockRegistrationResponse);
  });

  it('should load webinar data and render all sections', async () => {
    const { getByText, getByRole } = render(
      <MemoryRouter initialEntries={['/webinars/1']}>
        <WebinarDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText(mockWebinarData.title)).toBeInTheDocument();
      expect(getByText(mockWebinarData.presenter)).toBeInTheDocument();
      expect(getByRole('button', { name: /register now/i })).toBeInTheDocument();
    });
  });

  it('should open registration modal when register button is clicked', async () => {
    const { getByRole, getByText } = render(<WebinarDetailPage />);
    
    await waitFor(() => {
      const registerButton = getByRole('button', { name: /register now/i });
      fireEvent.click(registerButton);
    });

    expect(getByText('Register for Webinar')).toBeInTheDocument();
  });

  it('should handle registration submission successfully', async () => {
    const { getByRole, getByLabelText } = render(<WebinarDetailPage />);
    
    // Open modal and fill form
    fireEvent.click(getByRole('button', { name: /register now/i }));
    
    fireEvent.change(getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(getByLabelText('Email'), { target: { value: 'john@example.com' } });
    
    fireEvent.click(getByRole('button', { name: /submit registration/i }));
    
    await waitFor(() => {
      expect(api.registerForWebinar).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }));
    });
  });
});
```

#### 2.2 Calendar Integration Tests
**File**: `frontend/src/tests/integration/CalendarIntegration.test.tsx`

```typescript
describe('Calendar Integration', () => {
  it('should display all calendar options', () => {
    const { getByText } = render(<CalendarIntegration webinar={mockWebinarData} />);
    
    expect(getByText('Add to Google Calendar')).toBeInTheDocument();
    expect(getByText('Add to Outlook')).toBeInTheDocument();
    expect(getByText('Download ICS File')).toBeInTheDocument();
  });

  it('should open Google Calendar in new tab', () => {
    const mockOpen = jest.spyOn(window, 'open').mockImplementation();
    const { getByText } = render(<CalendarIntegration webinar={mockWebinarData} />);
    
    fireEvent.click(getByText('Add to Google Calendar'));
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('calendar.google.com'),
      '_blank'
    );
  });

  it('should trigger ICS download', () => {
    const mockDownload = jest.fn();
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
    global.URL.revokeObjectURL = jest.fn();
    
    const { getByText } = render(<CalendarIntegration webinar={mockWebinarData} />);
    
    fireEvent.click(getByText('Download ICS File'));
    
    // Verify blob creation and download trigger
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});
```

### 3. End-to-End Tests

#### 3.1 Complete Registration Flow
**File**: `frontend/cypress/e2e/webinar-registration-flow.cy.ts`

```typescript
describe('Webinar Registration Flow', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/v1/business/webinars/1', { fixture: 'webinar-detail.json' });
    cy.intercept('POST', '/api/v1/business/webinars/1/register', { fixture: 'registration-success.json' });
  });

  it('should complete full registration flow from webinar list to confirmation', () => {
    // Start from webinars page
    cy.visit('/webinars');
    
    // Click on a webinar card
    cy.get('[data-cy=webinar-card]').first().click();
    
    // Verify webinar detail page loads
    cy.url().should('include', '/webinars/');
    cy.get('[data-cy=webinar-title]').should('be.visible');
    cy.get('[data-cy=webinar-presenter]').should('be.visible');
    
    // Click register button
    cy.get('[data-cy=register-button]').click();
    
    // Fill out registration form
    cy.get('[data-cy=registration-modal]').should('be.visible');
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('john.doe@example.com');
    cy.get('input[name="company"]').type('Example Corp');
    
    // Submit registration
    cy.get('[data-cy=submit-registration]').click();
    
    // Verify confirmation
    cy.get('[data-cy=registration-confirmation]').should('be.visible');
    cy.get('[data-cy=confirmation-message]').should('contain', 'Successfully registered');
  });

  it('should handle calendar integration after registration', () => {
    cy.visit('/webinars/1');
    cy.get('[data-cy=register-button]').click();
    
    // Complete registration (shortened)
    cy.get('input[name="firstName"]').type('Jane');
    cy.get('input[name="lastName"]').type('Smith');
    cy.get('input[name="email"]').type('jane@example.com');
    cy.get('[data-cy=submit-registration]').click();
    
    // Test calendar integration
    cy.get('[data-cy=add-to-calendar-dropdown]').click();
    cy.get('[data-cy=google-calendar-option]').should('be.visible');
    cy.get('[data-cy=outlook-calendar-option]').should('be.visible');
    cy.get('[data-cy=download-ics-option]').should('be.visible');
    
    // Test Google Calendar link
    cy.get('[data-cy=google-calendar-option]')
      .should('have.attr', 'href')
      .and('include', 'calendar.google.com');
  });

  it('should handle social sharing after registration', () => {
    cy.visit('/webinars/1');
    
    // Complete registration flow
    // ... registration steps ...
    
    // Test social sharing
    cy.get('[data-cy=share-dropdown]').click();
    cy.get('[data-cy=linkedin-share]').should('be.visible');
    cy.get('[data-cy=twitter-share]').should('be.visible');
    cy.get('[data-cy=copy-link]').should('be.visible');
    
    // Test copy link functionality
    cy.get('[data-cy=copy-link]').click();
    cy.get('[data-cy=copy-success-message]').should('be.visible');
  });
});
```

#### 3.2 Multi-Language Support Tests
**File**: `frontend/cypress/e2e/webinar-multilingual.cy.ts`

```typescript
describe('Webinar Multi-Language Support', () => {
  it('should display webinar content in German', () => {
    cy.visit('/de/webinare/1');
    
    cy.get('[data-cy=webinar-title]').should('contain', 'KI-Bereitschaftsbewertung');
    cy.get('[data-cy=register-button]').should('contain', 'Jetzt registrieren');
    cy.get('[data-cy=webinar-description]').should('contain', 'Dieses grundlegende Webinar');
  });

  it('should switch languages correctly', () => {
    cy.visit('/webinars/1');
    
    // Switch to German
    cy.get('[data-cy=language-switcher]').click();
    cy.get('[data-cy=language-de]').click();
    
    cy.url().should('include', '/de/webinare/1');
    cy.get('[data-cy=register-button]').should('contain', 'Jetzt registrieren');
  });

  it('should handle registration form in German', () => {
    cy.visit('/de/webinare/1');
    cy.get('[data-cy=register-button]').click();
    
    cy.get('[data-cy=registration-modal]').within(() => {
      cy.get('label').contains('Vorname').should('be.visible');
      cy.get('label').contains('Nachname').should('be.visible');
      cy.get('label').contains('E-Mail').should('be.visible');
      cy.get('label').contains('Unternehmen').should('be.visible');
    });
  });
});
```

### 4. Performance Tests

#### 4.1 Page Load Performance
**File**: `frontend/cypress/e2e/webinar-performance.cy.ts`

```typescript
describe('Webinar Performance Tests', () => {
  it('should load webinar detail page within performance budgets', () => {
    cy.visit('/webinars/1', {
      onBeforeLoad: (win) => {
        win.performance.mark('start');
      },
      onLoad: (win) => {
        win.performance.mark('end');
        win.performance.measure('pageLoad', 'start', 'end');
      }
    });

    cy.window().then((win) => {
      const measure = win.performance.getEntriesByName('pageLoad')[0];
      expect(measure.duration).to.be.lessThan(2500); // 2.5 seconds
    });
  });

  it('should optimize image loading', () => {
    cy.visit('/webinars/1');
    
    // Check that images are lazy loaded
    cy.get('[data-cy=webinar-image]')
      .should('have.attr', 'loading', 'lazy')
      .and('be.visible');
  });
});
```

### 5. Accessibility Tests

#### 5.1 WCAG Compliance Tests
**File**: `frontend/cypress/e2e/webinar-accessibility.cy.ts`

```typescript
describe('Webinar Accessibility Tests', () => {
  it('should be accessible to screen readers', () => {
    cy.visit('/webinars/1');
    
    // Check for proper heading hierarchy
    cy.get('h1').should('exist').and('be.visible');
    cy.get('[data-cy=webinar-title]').should('have.attr', 'aria-label');
    
    // Check form accessibility
    cy.get('[data-cy=register-button]').click();
    cy.get('input[name="firstName"]').should('have.attr', 'aria-required', 'true');
    cy.get('input[name="email"]').should('have.attr', 'type', 'email');
  });

  it('should support keyboard navigation', () => {
    cy.visit('/webinars/1');
    
    // Tab through interactive elements
    cy.get('body').tab();
    cy.focused().should('contain', 'Register Now');
    
    cy.focused().tab();
    cy.focused().should('contain', 'Add to Calendar');
  });
});
```

### 6. Security Tests

#### 6.1 Input Validation and XSS Prevention
**File**: `frontend/src/tests/security/WebinarSecurity.test.tsx`

```typescript
describe('Webinar Security Tests', () => {
  it('should sanitize user input in registration form', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    
    const { getByLabelText } = render(<RegistrationModal />);
    const nameInput = getByLabelText('First Name');
    
    fireEvent.change(nameInput, { target: { value: maliciousInput } });
    
    expect(nameInput.value).not.toContain('<script>');
  });

  it('should validate email domains for suspicious patterns', () => {
    const suspiciousEmails = [
      'test@tempmail.com',
      'user@10minutemail.com',
      'fake@guerrillamail.com'
    ];

    suspiciousEmails.forEach(email => {
      const isValid = validateEmail(email);
      expect(isValid).toBe(false);
    });
  });
});
```

### 7. Backend API Tests

#### 7.1 Webinar Detail API Tests
**File**: `backend/tests/api/business/test_webinar_detail_api.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestWebinarDetailAPI:
    def test_get_webinar_by_id_success(self):
        """Test successful webinar retrieval by ID"""
        response = client.get("/api/v1/business/webinars/1")
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "title" in data
        assert "scheduled_at" in data
        assert "presenter_name" in data

    def test_get_webinar_by_slug_success(self):
        """Test successful webinar retrieval by slug"""
        response = client.get("/api/v1/business/webinars/slug/ai-readiness-assessment")
        
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "ai-readiness-assessment"

    def test_get_nonexistent_webinar_returns_404(self):
        """Test 404 for non-existent webinar"""
        response = client.get("/api/v1/business/webinars/99999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_webinar_registration_success(self):
        """Test successful webinar registration"""
        registration_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "company": "Example Corp",
            "job_title": "Software Engineer"
        }
        
        response = client.post("/api/v1/business/webinars/1/register", json=registration_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "john.doe@example.com"
        assert "registration_id" in data

    def test_duplicate_registration_prevention(self):
        """Test prevention of duplicate registrations"""
        registration_data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane.smith@example.com",
            "company": "Example Corp"
        }
        
        # First registration
        response1 = client.post("/api/v1/business/webinars/1/register", json=registration_data)
        assert response1.status_code == 201
        
        # Duplicate registration attempt
        response2 = client.post("/api/v1/business/webinars/1/register", json=registration_data)
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"].lower()

    def test_capacity_limit_enforcement(self):
        """Test webinar capacity limit enforcement"""
        # This would require setting up a webinar with limited capacity
        # and registering up to the limit, then testing rejection
        pass

    def test_registration_deadline_enforcement(self):
        """Test registration deadline enforcement"""
        # This would require setting up a webinar with past deadline
        # and testing rejection of new registrations
        pass
```

## Test Execution Strategy

### Test Pyramid Structure
1. **Unit Tests (60%)**: Fast, focused tests for individual utilities and components
2. **Integration Tests (30%)**: Component integration and API interaction tests  
3. **E2E Tests (10%)**: Complete user journey tests

### CI/CD Pipeline Integration
```yaml
test-stages:
  - name: unit-tests
    command: npm run test:unit
    coverage-threshold: 80%
  
  - name: integration-tests
    command: npm run test:integration
    requires: [unit-tests]
  
  - name: e2e-tests
    command: npm run test:e2e
    requires: [integration-tests]
    browser: [chrome, firefox]
  
  - name: performance-tests
    command: npm run test:performance
    requires: [e2e-tests]
    lighthouse-audit: true
  
  - name: accessibility-tests
    command: npm run test:a11y
    axe-core: true
```

### Test Data Management
- **Fixtures**: Consistent test data for webinars, speakers, registrations
- **Factories**: Dynamic test data generation for edge cases
- **Mocking**: API responses and external service calls
- **Cleanup**: Automated test data cleanup between runs

This comprehensive testing strategy ensures the webinar detail pages are robust, performant, accessible, and secure across all supported browsers and devices.