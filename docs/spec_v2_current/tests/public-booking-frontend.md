# Public Booking Frontend Test Specification

## Overview
This document specifies the test requirements for the public consultation booking frontend feature, which allows users to book 30-minute AI consultation sessions with verified consultants.

## Feature Summary
- **URL**: `/contact/booking`
- **Purpose**: Enable public users to book 30-minute consultation sessions
- **Price**: €30 per session
- **Consultants**: Any of the consultants from the AdminPanel.
- **Time Slots**: 10:00 AM and 2:00 PM (weekdays only)
- **Booking Window**: 21 days into the future (weekdays only)

## Test Categories

### 1. UI/UX Integration Tests

#### 1.1 Modal Display and Responsiveness
```gherkin
Feature: Booking Modal Display
  Scenario: User opens booking modal
    Given the user is on the contact/booking page
    When the user clicks the booking button
    Then the consultation booking modal should open
    And the modal should be centered on screen
    And the modal should have proper scroll functionality
    And the modal should display the progress bar
    And the modal should show "Select Your AI Expert" as the first step
```

#### 1.2 Mobile Responsiveness
```gherkin
Feature: Mobile Booking Experience
  Scenario: Booking on mobile device
    Given the user is on a mobile device
    When the user opens the booking modal
    Then the modal should be fully responsive
    And all content should be accessible via scrolling
    And buttons should be appropriately sized for touch
    And the layout should adapt to small screens
```

### 2. Consultant Selection Tests

#### 2.1 Consultant Data Display
```gherkin
Feature: Consultant Selection Step
  Scenario: Display active consultants
    Given the booking modal is open on consultant selection
    When the consultant data loads
    Then Ashant Chalasani should be displayed first (featured)
    And Pascal Köth should be displayed second
    And each consultant should show:
      | Field | Expected |
      | Name | Full name displayed |
      | Headline | Professional headline shown |
      | Location | Geographic location |
      | Industry | Industry specialization |
      | Specializations | List of expertise areas |
      | Experience | Years of experience |
      | Featured Badge | Only for Ashant |
```

#### 2.2 Consultant Selection Interaction
```gherkin
Feature: Consultant Selection
  Scenario: User selects a consultant
    Given consultants are displayed
    When the user clicks on a consultant card
    Then the consultant should be highlighted
    And the selection indicator should appear
    And the "Continue" button should become active
    And the selected consultant data should be stored
```

### 3. Date and Time Selection Tests

#### 3.1 Date Range Generation
```gherkin
Feature: Date Selection
  Scenario: Display available dates
    Given the user has selected a consultant
    When the time slot selection step loads
    Then dates should be generated for 21 days into the future
    And only weekdays (Monday-Friday) should be included
    And weekends should be excluded
    And dates should be formatted correctly for the user's language
    And the date list should be scrollable
```

#### 3.2 Date Selection Validation
```gherkin
Feature: Date Validation
  Scenario: User selects a date
    Given available dates are displayed
    When the user clicks on a date
    Then the date should be highlighted
    And the time slot section should activate
    And available time slots should be fetched from the API
    And previously selected time slot should be cleared
```

#### 3.3 Time Slot Availability
```gherkin
Feature: Time Slot Selection
  Scenario: Display available time slots
    Given a date has been selected
    When time slot data is loaded
    Then available slots should be displayed (10:00, 14:00)
    And unavailable slots should not be shown
    And each slot should show duration and price
    And time format should match user language (AM/PM vs 24h)
```

### 4. Contact Information Tests

#### 4.1 Form Validation
```gherkin
Feature: Contact Information Form
  Scenario: Form field validation
    Given the user is on the contact information step
    When the user submits the form
    Then required fields should be validated:
      | Field | Validation |
      | First Name | Required, min 2 chars |
      | Last Name | Required, min 2 chars |
      | Email | Required, valid email format |
      | Phone | Required, valid phone format |
      | Company | Optional |
      | Website | Optional, valid URL if provided |
```

#### 4.2 Data Persistence
```gherkin
Feature: Contact Data Storage
  Scenario: Contact information is saved
    Given valid contact information is entered
    When the user continues to the next step
    Then the contact data should be stored in booking state
    And the data should persist when navigating back
```

### 5. Billing Information Tests

#### 5.1 Billing Form Validation
```gherkin
Feature: Billing Information
  Scenario: Billing address validation
    Given the user is on the billing information step
    When the user submits billing details
    Then all required fields should be validated:
      | Field | Validation |
      | Billing First Name | Required |
      | Billing Last Name | Required |
      | Street Address | Required |
      | Postal Code | Required, valid format |
      | City | Required |
      | Country | Required, default DE |
      | VAT Number | Optional, valid format if provided |
```

#### 5.2 Pre-fill Options
```gherkin
Feature: Billing Pre-fill
  Scenario: Copy from contact information
    Given contact information has been entered
    When the user reaches billing information
    Then there should be an option to copy contact details
    And copying should populate relevant billing fields
```

### 6. Payment Processing Tests

#### 6.1 Payment Method Selection
```gherkin
Feature: Payment Step
  Scenario: Payment method display
    Given the user is on the payment step
    When the payment options load
    Then Stripe payment should be available
    And the total amount (€30) should be clearly displayed
    And payment terms should be shown
    And GDPR notice should be visible
```

#### 6.2 Payment Validation
```gherkin
Feature: Payment Processing
  Scenario: Process payment
    Given valid payment information is entered
    When the user clicks "Pay Now"
    Then payment should be processed via Stripe
    And booking status should update to "confirmed"
    And user should be redirected to confirmation step
```

### 7. Confirmation and Email Tests

#### 7.1 Booking Confirmation
```gherkin
Feature: Booking Confirmation
  Scenario: Successful booking completion
    Given payment has been processed successfully
    When the confirmation step loads
    Then booking details should be displayed:
      | Detail | Expected |
      | Consultant Name | Selected consultant |
      | Date | Formatted date |
      | Time | Selected time slot |
      | Duration | 30 minutes |
      | Price | €30 |
      | Booking ID | Unique identifier |
```

#### 7.2 Email Notifications
```gherkin
Feature: Email Confirmations
  Scenario: Confirmation emails are sent
    Given a booking has been confirmed
    Then a confirmation email should be sent to the customer
    And a notification email should be sent to the consultant
    And the booking should appear in the admin dashboard
```

### 8. Error Handling Tests

#### 8.1 API Error Handling
```gherkin
Feature: API Error Handling
  Scenario Outline: Handle API failures
    Given the user is on step "<step>"
    When the API call fails with "<error_type>"
    Then an appropriate error message should be displayed
    And the user should have option to retry
    And the booking state should not be corrupted

    Examples:
      | step | error_type |
      | consultant-selection | 500 server error |
      | time-slot-selection | network timeout |
      | payment | payment processing error |
```

#### 8.2 Validation Error Display
```gherkin
Feature: Form Validation Errors
  Scenario: Display validation errors
    Given the user submits invalid form data
    When validation fails
    Then specific error messages should be displayed
    And the problematic fields should be highlighted
    And the form should remain in edit mode
```

### 9. Accessibility Tests

#### 9.1 Keyboard Navigation
```gherkin
Feature: Keyboard Accessibility
  Scenario: Navigate booking flow with keyboard
    Given the booking modal is open
    When the user navigates using only keyboard
    Then all interactive elements should be reachable
    And tab order should be logical
    And Enter/Space keys should activate buttons
    And Escape should close the modal
```

#### 9.2 Screen Reader Compatibility
```gherkin
Feature: Screen Reader Support
  Scenario: Screen reader accessibility
    Given a screen reader is active
    When the user navigates the booking flow
    Then all content should be announced properly
    And form labels should be associated with inputs
    And error messages should be announced
    And progress information should be available
```

### 10. Internationalization Tests

#### 10.1 Language Switching
```gherkin
Feature: Multi-language Support
  Scenario Outline: Display content in different languages
    Given the user's language is set to "<language>"
    When the booking modal is opened
    Then all text should be displayed in "<language>"
    And date formats should match locale
    And currency should be displayed correctly

    Examples:
      | language |
      | en |
      | de |
```

### 11. Performance Tests

#### 11.1 Load Times
```gherkin
Feature: Performance Requirements
  Scenario: Modal load performance
    Given the user clicks to open booking modal
    When the modal initializes
    Then consultant data should load within 2 seconds
    And the modal should open within 500ms
    And date generation should complete within 100ms
```

#### 11.2 API Response Times
```gherkin
Feature: API Performance
  Scenario: Time slot availability check
    Given a date is selected
    When availability is fetched
    Then the API should respond within 1 second
    And loading states should be shown during fetch
    And results should cache for subsequent selections
```

### 12. Security Tests

#### 12.1 Data Sanitization
```gherkin
Feature: Input Security
  Scenario: Prevent malicious input
    Given the user enters form data
    When the data contains script tags or SQL injection attempts
    Then the input should be sanitized
    And malicious content should be stripped
    And the booking should process safely
```

#### 12.2 HTTPS Requirements
```gherkin
Feature: Secure Communication
  Scenario: Secure data transmission
    Given the booking form is submitted
    When payment information is transmitted
    Then all communication should use HTTPS
    And payment data should be encrypted
    And PCI compliance should be maintained
```

## Test Data Requirements

### Consultant Test Data
```json
{
  "consultants": [
    {
      "id": "ashant-test-id",
      "name": "Ashant Chalasani",
      "email": "ashant@magnetiq.de",
      "headline": "Technology Leader focused on AI, Cloud Computing, and Enterprise Solutions",
      "specializations": ["AI Agent Development", "Cloud Application Development"],
      "is_featured": true,
      "is_verified": true,
      "status": "active"
    },
    {
      "id": "pascal-test-id",
      "name": "Pascal Köth",
      "email": "pascal@magnetiq.de",
      "headline": "Business Strategy and Digital Transformation Consultant",
      "specializations": ["Digital Transformation", "Business Strategy"],
      "is_featured": false,
      "is_verified": true,
      "status": "active"
    }
  ]
}
```

### Test Booking Data
```json
{
  "valid_booking": {
    "consultant_id": "ashant-test-id",
    "consultation_date": "2024-09-10T10:00:00Z",
    "time_slot": "10:00",
    "contact_info": {
      "first_name": "Test",
      "last_name": "User",
      "email": "test@example.com",
      "phone": "+49 123 456 7890",
      "company": "Test Company"
    },
    "billing_info": {
      "billing_first_name": "Test",
      "billing_last_name": "User",
      "billing_street": "Test Street 123",
      "billing_postal_code": "12345",
      "billing_city": "Berlin",
      "billing_country": "DE"
    }
  }
}
```

## Environment Requirements

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Test Environment Setup
```bash
# Start backend services
cd backend
python -m uvicorn app.main:app --port 8037

# Start frontend
cd frontend
npm run dev

# Run tests
npm run test:e2e
```

## Success Criteria

### Functional Requirements
- ✅ All booking steps complete successfully
- ✅ Payment processing works end-to-end
- ✅ Emails are sent correctly
- ✅ Data validation prevents invalid submissions
- ✅ Error states are handled gracefully

### Non-Functional Requirements
- ✅ Page load time < 3 seconds
- ✅ API response time < 2 seconds
- ✅ 99% uptime during business hours
- ✅ Mobile responsive design
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Multi-language support (EN/DE)

### Security Requirements
- ✅ HTTPS encryption
- ✅ Input sanitization
- ✅ PCI compliance for payments
- ✅ GDPR compliance for data handling

## Maintenance and Monitoring

### Ongoing Tests
- Daily automated smoke tests
- Weekly full regression suite
- Monthly performance benchmarks
- Quarterly security assessments

### Monitoring Metrics
- Booking conversion rate
- Step abandonment rates
- Error frequency by step
- Payment success rate
- User satisfaction scores

---

*This test specification should be updated whenever the booking functionality changes or new requirements are added.*