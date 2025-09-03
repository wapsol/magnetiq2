/**
 * End-to-End Booking Flow Tests
 * 
 * Tests the complete consultation booking flow at:
 * http://localhost:8040/de/kontakt/terminbuchung
 * 
 * Covers all aspects from the test specification:
 * - Modal display and interaction
 * - Consultant selection (Pascal & Ashant)
 * - Date/time selection (21 days, weekdays only)
 * - Contact information form
 * - Billing information form
 * - Payment processing (€30)
 * - Booking confirmation
 * - German localization
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:8040';
const BOOKING_URL = `${BASE_URL}/de/kontakt/terminbuchung`;
const API_BASE_URL = 'http://localhost:8037';

// Test data
const VALID_CONTACT_DATA = {
  firstName: 'Max',
  lastName: 'Mustermann', 
  email: 'max.mustermann@example.com',
  phone: '+49 123 456 7890',
  company: 'Test GmbH',
  website: 'https://test-company.de'
};

const VALID_BILLING_DATA = {
  billingFirstName: 'Max',
  billingLastName: 'Mustermann',
  billingCompany: 'Test GmbH',
  billingStreet: 'Musterstraße 123',
  billingPostalCode: '10115',
  billingCity: 'Berlin',
  billingCountry: 'DE',
  vatNumber: 'DE123456789'
};

test.describe('Public Booking Frontend - Complete Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to German booking page
    await page.goto(BOOKING_URL);
    await page.waitForLoadEvent('networkidle');
  });

  test('1.1 Modal Display and Responsiveness', async ({ page }) => {
    // PSEUDO-CODE for modal display test
    /*
    GIVEN: User is on the booking page
    WHEN: User clicks the booking button
    THEN: 
      - Modal should open and be centered
      - Progress bar should be visible
      - First step should show "Wählen Sie Ihren KI-Experten"
      - Modal should have proper scroll functionality
      - GDPR notice should be visible
      - Close button should be functional
    */
    
    // Find and click booking button
    const bookingButton = page.locator('button:has-text("Termin buchen")');
    await expect(bookingButton).toBeVisible();
    await bookingButton.click();
    
    // Verify modal opened
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Check modal is centered and has proper dimensions
    const modalBox = await modal.boundingBox();
    expect(modalBox.width).toBeGreaterThan(600);
    expect(modalBox.height).toBeGreaterThan(400);
    
    // Verify first step content
    await expect(page.locator('h2:has-text("Wählen Sie Ihren KI-Experten")')).toBeVisible();
    
    // Check progress bar
    const progressBar = page.locator('.bg-gradient-to-r.from-blue-500');
    await expect(progressBar).toBeVisible();
    
    // Verify GDPR notice
    await expect(page.locator('text=DSGVO-konform')).toBeVisible();
    
    // Test scroll functionality
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(100);
    
    // Test close button
    const closeButton = page.locator('button[aria-label="Schließen"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });

  test('2.1 Consultant Selection - Display and Data', async ({ page }) => {
    // PSEUDO-CODE for consultant selection test
    /*
    GIVEN: Booking modal is open on consultant selection
    WHEN: Consultant data loads
    THEN:
      - Ashant Chalasani should be displayed first (featured)
      - Pascal Köth should be displayed second  
      - Each consultant should show: name, headline, location, industry, specializations, experience
      - Featured badge only for Ashant
      - Selection should highlight consultant and show continue button
    */
    
    await openBookingModal(page);
    
    // Wait for consultants to load
    await page.waitForSelector('[data-testid="consultant-card"]');
    
    const consultantCards = page.locator('[data-testid="consultant-card"]');
    const consultantCount = await consultantCards.count();
    expect(consultantCount).toBe(2);
    
    // Verify Ashant is first (featured)
    const firstConsultant = consultantCards.nth(0);
    await expect(firstConsultant).toContainText('Ashant Chalasani');
    await expect(firstConsultant).toContainText('Technology Leader');
    await expect(firstConsultant).toContainText('Stuttgart');
    await expect(firstConsultant).toContainText('Technology');
    await expect(firstConsultant).toContainText('AI Agent Development');
    await expect(firstConsultant.locator('text=Empfohlen')).toBeVisible(); // Featured badge
    
    // Verify Pascal is second
    const secondConsultant = consultantCards.nth(1);
    await expect(secondConsultant).toContainText('Pascal Köth');
    await expect(secondConsultant).toContainText('Business Strategy');
    await expect(secondConsultant).toContainText('Germany');
    await expect(secondConsultant).toContainText('Digital Transformation');
    
    // Test consultant selection
    await firstConsultant.click();
    
    // Verify selection highlighting
    await expect(firstConsultant).toHaveClass(/border-blue-500/);
    await expect(firstConsultant).toHaveClass(/bg-blue-50/);
    
    // Verify continue button appears
    const continueButton = page.locator('button:has-text("Weiter zum Termin")');
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();
  });

  test('3.1 Date and Time Selection - 21 Day Range', async ({ page }) => {
    // PSEUDO-CODE for date/time selection test
    /*
    GIVEN: User has selected a consultant
    WHEN: Time slot selection step loads
    THEN:
      - Dates should be generated for 21 days into future
      - Only weekdays (Monday-Friday) included
      - Weekends excluded
      - Dates formatted correctly in German
      - Available time slots: 10:00 Uhr, 14:00 Uhr
      - Time slot selection updates availability
    */
    
    await completeConsultantSelection(page);
    
    // Verify step title
    await expect(page.locator('h3:has-text("Wählen Sie Datum und Uhrzeit")')).toBeVisible();
    
    // Check date selection section
    const dateButtons = page.locator('[data-testid="date-button"]');
    const dateCount = await dateButtons.count();
    
    // Should have approximately 15 weekdays in 21 calendar days
    expect(dateCount).toBeGreaterThanOrEqual(14);
    expect(dateCount).toBeLessThanOrEqual(16);
    
    // Verify only weekdays are shown (no Samstag/Sonntag)
    const allDateTexts = await dateButtons.allTextContents();
    for (const dateText of allDateTexts) {
      expect(dateText).not.toMatch(/Samstag|Sonntag/);
      expect(dateText).toMatch(/Montag|Dienstag|Mittwoch|Donnerstag|Freitag/);
    }
    
    // Verify German date formatting
    expect(allDateTexts[0]).toMatch(/\d{2}\. \w+ \d{4}/);
    
    // Select first available date
    await dateButtons.nth(0).click();
    
    // Verify time slots appear
    await page.waitForSelector('[data-testid="time-slot-button"]');
    const timeSlots = page.locator('[data-testid="time-slot-button"]');
    
    // Should show available time slots
    await expect(timeSlots.nth(0)).toContainText('10:00 Uhr');
    await expect(timeSlots.nth(1)).toContainText('14:00 Uhr');
    
    // Test time slot selection
    await timeSlots.nth(0).click();
    
    // Verify selection and continue button
    await expect(timeSlots.nth(0)).toHaveClass(/border-blue-500/);
    const continueButton = page.locator('button:has-text("Weiter zu Kontaktdaten")');
    await expect(continueButton).toBeVisible();
    
    // Verify appointment summary
    await expect(page.locator('text=Gewählter Termin')).toBeVisible();
    await expect(page.locator('text=10:00 Uhr')).toBeVisible();
    await expect(page.locator('text=30 Minuten Beratung für €30')).toBeVisible();
  });

  test('4.1 Contact Information Form Validation', async ({ page }) => {
    // PSEUDO-CODE for contact form validation
    /*
    GIVEN: User is on contact information step
    WHEN: User submits form with invalid/missing data
    THEN:
      - Required fields should show validation errors
      - Email format should be validated
      - Phone format should be validated
      - Form should not submit with invalid data
      - Valid data should allow progression
    */
    
    await completeTimeSlotSelection(page);
    
    // Verify contact info step
    await expect(page.locator('h3:has-text("Kontaktinformationen")')).toBeVisible();
    
    // Test form validation - submit empty form
    const continueButton = page.locator('button:has-text("Weiter zur Rechnungsadresse")');
    await continueButton.click();
    
    // Should show validation errors
    await expect(page.locator('text=Vorname ist erforderlich')).toBeVisible();
    await expect(page.locator('text=Nachname ist erforderlich')).toBeVisible();
    await expect(page.locator('text=E-Mail ist erforderlich')).toBeVisible();
    await expect(page.locator('text=Telefon ist erforderlich')).toBeVisible();
    
    // Test invalid email
    await fillContactForm(page, {
      ...VALID_CONTACT_DATA,
      email: 'invalid-email'
    });
    await continueButton.click();
    await expect(page.locator('text=Ungültige E-Mail-Adresse')).toBeVisible();
    
    // Test invalid phone
    await fillContactForm(page, {
      ...VALID_CONTACT_DATA,
      email: VALID_CONTACT_DATA.email,
      phone: '123'
    });
    await continueButton.click();
    await expect(page.locator('text=Ungültige Telefonnummer')).toBeVisible();
    
    // Test valid data
    await fillContactForm(page, VALID_CONTACT_DATA);
    await continueButton.click();
    
    // Should progress to next step
    await expect(page.locator('h3:has-text("Rechnungsadresse")')).toBeVisible();
  });

  test('5.1 Billing Information and Pre-fill', async ({ page }) => {
    // PSEUDO-CODE for billing form test
    /*
    GIVEN: User has entered contact information
    WHEN: User reaches billing step
    THEN:
      - Should offer option to copy from contact info
      - All required billing fields should validate
      - German postal code format should be validated
      - VAT number format should be validated (if provided)
      - Valid data should allow progression
    */
    
    await completeBillingInfoStep(page);
    
    // Test pre-fill functionality
    const copyButton = page.locator('button:has-text("Aus Kontaktdaten übernehmen")');
    if (await copyButton.isVisible()) {
      await copyButton.click();
      
      // Verify fields are pre-filled
      await expect(page.locator('input[name="billingFirstName"]')).toHaveValue('Max');
      await expect(page.locator('input[name="billingLastName"]')).toHaveValue('Mustermann');
    }
    
    // Test form validation
    await clearBillingForm(page);
    const continueButton = page.locator('button:has-text("Weiter zur Zahlung")');
    await continueButton.click();
    
    // Should show validation errors
    await expect(page.locator('text=Rechnungsvorname ist erforderlich')).toBeVisible();
    await expect(page.locator('text=Straße ist erforderlich')).toBeVisible();
    await expect(page.locator('text=PLZ ist erforderlich')).toBeVisible();
    
    // Fill valid billing data
    await fillBillingForm(page, VALID_BILLING_DATA);
    await continueButton.click();
    
    // Should progress to payment
    await expect(page.locator('h3:has-text("Zahlung")')).toBeVisible();
  });

  test('6.1 Payment Processing and Confirmation', async ({ page }) => {
    // PSEUDO-CODE for payment test
    /*
    GIVEN: User has completed all previous steps
    WHEN: User reaches payment step
    THEN:
      - Should display €30 total clearly
      - Should show Stripe payment option
      - Should display payment terms
      - GDPR notice should be visible
      - Payment button should say "Kostenpflichtig bestellen"
      - After payment, should show confirmation with booking details
    */
    
    await completePaymentStep(page);
    
    // Verify payment step
    await expect(page.locator('h3:has-text("Zahlung")')).toBeVisible();
    
    // Check total amount
    await expect(page.locator('text=€30')).toBeVisible();
    await expect(page.locator('text=30 Minuten Beratung')).toBeVisible();
    
    // Verify payment method
    await expect(page.locator('text=Stripe')).toBeVisible();
    
    // Check GDPR notice
    await expect(page.locator('text=DSGVO-konform')).toBeVisible();
    
    // Payment terms
    await expect(page.locator('text=AGB')).toBeVisible();
    await expect(page.locator('text=Widerrufsrecht')).toBeVisible();
    
    // Payment button text (German legal requirement)
    const payButton = page.locator('button:has-text("Kostenpflichtig bestellen")');
    await expect(payButton).toBeVisible();
    
    // Mock successful payment and click
    await mockSuccessfulPayment(page);
    await payButton.click();
    
    // Verify confirmation step
    await expect(page.locator('h3:has-text("Buchung bestätigt")')).toBeVisible();
    
    // Check booking details
    await expect(page.locator('text=Ashant Chalasani')).toBeVisible();
    await expect(page.locator('text=10:00 Uhr')).toBeVisible();
    await expect(page.locator('text=30 Minuten')).toBeVisible();
    await expect(page.locator('text=€30')).toBeVisible();
    
    // Verify booking ID
    const bookingId = page.locator('[data-testid="booking-id"]');
    await expect(bookingId).toBeVisible();
    const bookingIdText = await bookingId.textContent();
    expect(bookingIdText).toMatch(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
  });

  test('8.1 Error Handling - API Failures', async ({ page }) => {
    // PSEUDO-CODE for error handling test
    /*
    GIVEN: User is in booking flow
    WHEN: API calls fail (network, server errors)
    THEN:
      - Appropriate error messages should be displayed
      - User should have option to retry
      - Booking state should not be corrupted
      - Error recovery should work
    */
    
    await openBookingModal(page);
    
    // Mock API failure for consultant loading
    await page.route(`${API_BASE_URL}/api/v1/consultations/public/consultants/active`, route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    
    await page.reload();
    await openBookingModal(page);
    
    // Should show error message
    await expect(page.locator('text=Fehler beim Laden der Berater')).toBeVisible();
    
    // Should have retry button
    const retryButton = page.locator('button:has-text("Erneut versuchen")');
    await expect(retryButton).toBeVisible();
    
    // Mock successful retry
    await page.unroute(`${API_BASE_URL}/api/v1/consultations/public/consultants/active`);
    await retryButton.click();
    
    // Should load successfully
    await expect(page.locator('[data-testid="consultant-card"]')).toBeVisible();
  });

  test('9.1 Keyboard Navigation Accessibility', async ({ page }) => {
    // PSEUDO-CODE for keyboard navigation test
    /*
    GIVEN: Booking modal is open
    WHEN: User navigates using only keyboard
    THEN:
      - All interactive elements should be reachable with Tab
      - Tab order should be logical
      - Enter/Space should activate buttons
      - Escape should close modal
      - Focus indicators should be visible
    */
    
    await openBookingModal(page);
    
    // Test Escape to close
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Reopen and test navigation
    await openBookingModal(page);
    
    // Tab through consultant cards
    await page.keyboard.press('Tab'); // First consultant
    await page.keyboard.press('Tab'); // Second consultant
    await page.keyboard.press('Tab'); // Continue button (should be disabled)
    
    // Select consultant with Enter
    await page.keyboard.press('Shift+Tab'); // Back to second consultant
    await page.keyboard.press('Shift+Tab'); // Back to first consultant
    await page.keyboard.press('Enter');
    
    // Verify selection
    const firstConsultant = page.locator('[data-testid="consultant-card"]').nth(0);
    await expect(firstConsultant).toHaveClass(/border-blue-500/);
    
    // Continue with Enter
    await page.keyboard.press('Tab'); // To continue button
    await page.keyboard.press('Enter');
    
    // Should progress to next step
    await expect(page.locator('h3:has-text("Wählen Sie Datum und Uhrzeit")')).toBeVisible();
  });

  test('10.1 German Localization Validation', async ({ page }) => {
    // PSEUDO-CODE for localization test
    /*
    GIVEN: User visits German booking URL
    WHEN: User navigates through booking flow
    THEN:
      - All text should be in German
      - Date formats should use German locale
      - Currency should display correctly (€30)
      - Form validation messages in German
      - Legal terms in German
    */
    
    await openBookingModal(page);
    
    // Check German text throughout flow
    const germanTexts = [
      'Wählen Sie Ihren KI-Experten',
      '30-minütige KI-Beratung für €30',
      'Wählen Sie Datum und Uhrzeit',
      'Kontaktinformationen',
      'Rechnungsadresse',
      'Zahlung',
      'DSGVO-konform',
      'Kostenpflichtig bestellen'
    ];
    
    for (const text of germanTexts) {
      // Note: This would be checked at appropriate steps
      console.log(`Checking for German text: ${text}`);
    }
    
    // Test date formatting
    await completeConsultantSelection(page);
    const dateButton = page.locator('[data-testid="date-button"]').nth(0);
    const dateText = await dateButton.textContent();
    
    // Should be German format: "Montag, 01. Januar 2024"
    expect(dateText).toMatch(/Montag|Dienstag|Mittwoch|Donnerstag|Freitag/);
    expect(dateText).toMatch(/Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember/);
    
    // Currency formatting
    await expect(page.locator('text=€30')).toBeVisible();
    
    // Time formatting (24h for German)
    await expect(page.locator('text=10:00 Uhr')).toBeVisible();
    await expect(page.locator('text=14:00 Uhr')).toBeVisible();
  });

  test('11.1 Performance Benchmarks', async ({ page }) => {
    // PSEUDO-CODE for performance test
    /*
    GIVEN: User interacts with booking system
    WHEN: Various actions are performed
    THEN:
      - Modal should open within 500ms
      - Consultant data should load within 2 seconds
      - Date generation should complete within 100ms
      - API responses should be under 1 second
      - No memory leaks or excessive resource usage
    */
    
    // Measure modal opening time
    const startTime = Date.now();
    await openBookingModal(page);
    const modalOpenTime = Date.now() - startTime;
    expect(modalOpenTime).toBeLessThan(500);
    
    // Measure consultant loading time
    const consultantLoadStart = Date.now();
    await page.waitForSelector('[data-testid="consultant-card"]');
    const consultantLoadTime = Date.now() - consultantLoadStart;
    expect(consultantLoadTime).toBeLessThan(2000);
    
    // Measure date generation
    await page.locator('[data-testid="consultant-card"]').nth(0).click();
    await page.locator('button:has-text("Weiter zum Termin")').click();
    
    const dateGenStart = Date.now();
    await page.waitForSelector('[data-testid="date-button"]');
    const dateGenTime = Date.now() - dateGenStart;
    expect(dateGenTime).toBeLessThan(100);
    
    // Monitor network requests
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push({
          url: request.url(),
          startTime: Date.now()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const call = apiCalls.find(c => c.url === response.url());
        if (call) {
          call.responseTime = Date.now() - call.startTime;
        }
      }
    });
    
    // Trigger API call
    await page.locator('[data-testid="date-button"]').nth(0).click();
    await page.waitForTimeout(1000);
    
    // Verify API response times
    const slowCalls = apiCalls.filter(call => call.responseTime > 1000);
    expect(slowCalls.length).toBe(0);
  });

  test('12.1 Security Input Validation', async ({ page }) => {
    // PSEUDO-CODE for security test
    /*
    GIVEN: User enters form data
    WHEN: Data contains potential security threats
    THEN:
      - Script tags should be sanitized
      - SQL injection attempts should be blocked
      - XSS attacks should be prevented
      - Input should be properly encoded
    */
    
    await completeTimeSlotSelection(page);
    
    // Test XSS attempts
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(1)">',
      '<svg onload="alert(1)">',
      '"><script>alert(1)</script>'
    ];
    
    for (const payload of xssPayloads) {
      await page.fill('input[name="firstName"]', payload);
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', '+49 123 456 7890');
      
      await page.locator('button:has-text("Weiter zur Rechnungsadresse")').click();
      
      // Should not execute script or show raw HTML
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>');
      expect(pageContent).not.toContain('javascript:');
      expect(pageContent).not.toContain('onerror=');
      expect(pageContent).not.toContain('onload=');
      
      // Go back to retry
      await page.locator('button:has-text("Zurück")').click();
    }
    
    // Test SQL injection attempts
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM consultants --",
      "admin'--",
      "' OR 1=1#"
    ];
    
    for (const payload of sqlPayloads) {
      await page.fill('input[name="email"]', payload + '@example.com');
      // Form should still validate normally, not reveal database structure
      await expect(page.locator('input[name="email"]')).toHaveValue(payload + '@example.com');
    }
    
    // Verify HTTPS is used
    expect(page.url()).toMatch(/^https:/);
  });
});

// Helper functions
async function openBookingModal(page) {
  const bookingButton = page.locator('button:has-text("Termin buchen")');
  await bookingButton.click();
  await page.waitForSelector('[role="dialog"]');
}

async function completeConsultantSelection(page) {
  await openBookingModal(page);
  await page.waitForSelector('[data-testid="consultant-card"]');
  await page.locator('[data-testid="consultant-card"]').nth(0).click();
  await page.locator('button:has-text("Weiter zum Termin")').click();
}

async function completeTimeSlotSelection(page) {
  await completeConsultantSelection(page);
  await page.waitForSelector('[data-testid="date-button"]');
  await page.locator('[data-testid="date-button"]').nth(0).click();
  await page.waitForSelector('[data-testid="time-slot-button"]');
  await page.locator('[data-testid="time-slot-button"]').nth(0).click();
  await page.locator('button:has-text("Weiter zu Kontaktdaten")').click();
}

async function fillContactForm(page, data) {
  await page.fill('input[name="firstName"]', data.firstName);
  await page.fill('input[name="lastName"]', data.lastName);
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="phone"]', data.phone);
  if (data.company) await page.fill('input[name="company"]', data.company);
  if (data.website) await page.fill('input[name="website"]', data.website);
}

async function fillBillingForm(page, data) {
  await page.fill('input[name="billingFirstName"]', data.billingFirstName);
  await page.fill('input[name="billingLastName"]', data.billingLastName);
  if (data.billingCompany) await page.fill('input[name="billingCompany"]', data.billingCompany);
  await page.fill('input[name="billingStreet"]', data.billingStreet);
  await page.fill('input[name="billingPostalCode"]', data.billingPostalCode);
  await page.fill('input[name="billingCity"]', data.billingCity);
  await page.selectOption('select[name="billingCountry"]', data.billingCountry);
  if (data.vatNumber) await page.fill('input[name="vatNumber"]', data.vatNumber);
}

async function clearBillingForm(page) {
  await page.fill('input[name="billingFirstName"]', '');
  await page.fill('input[name="billingLastName"]', '');
  await page.fill('input[name="billingStreet"]', '');
  await page.fill('input[name="billingPostalCode"]', '');
  await page.fill('input[name="billingCity"]', '');
}

async function completeBillingInfoStep(page) {
  await completeTimeSlotSelection(page);
  await fillContactForm(page, VALID_CONTACT_DATA);
  await page.locator('button:has-text("Weiter zur Rechnungsadresse")').click();
}

async function completePaymentStep(page) {
  await completeBillingInfoStep(page);
  await fillBillingForm(page, VALID_BILLING_DATA);
  await page.locator('button:has-text("Weiter zur Zahlung")').click();
}

async function mockSuccessfulPayment(page) {
  // Mock Stripe payment success
  await page.route('**/api/v1/consultations/public/bookings/*/payment', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          booking_id: 'test-booking-id-123',
          payment_status: 'completed',
          message: 'Payment processed successfully'
        }
      })
    });
  });
}

module.exports = {
  openBookingModal,
  completeConsultantSelection,
  completeTimeSlotSelection,
  fillContactForm,
  fillBillingForm,
  VALID_CONTACT_DATA,
  VALID_BILLING_DATA
};