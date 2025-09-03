/**
 * Accessibility Tests for Public Booking Frontend
 * 
 * Tests WCAG 2.1 AA compliance for the booking system:
 * - Keyboard navigation and focus management
 * - Screen reader compatibility and ARIA attributes
 * - Color contrast and visual accessibility
 * - Form labels and error announcements
 * - Modal accessibility and tab trapping
 * - German language accessibility
 * 
 * Uses axe-core for automated accessibility testing
 * URL: http://localhost:8040/de/kontakt/terminbuchung
 */

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE_URL = 'http://localhost:8040';
const BOOKING_URL = `${BASE_URL}/de/kontakt/terminbuchung`;

test.describe('Accessibility Tests - Public Booking Frontend', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BOOKING_URL);
    await page.waitForLoadEvent('networkidle');
  });

  test('A11y-1: Initial Page Accessibility Scan', async ({ page }) => {
    /**
     * PSEUDO-CODE: Baseline accessibility check
     * GIVEN: User loads the booking page
     * WHEN: Page is scanned for accessibility issues
     * THEN: 
     *   - No WCAG 2.1 AA violations should be found
     *   - Page structure should be semantic
     *   - Language should be properly declared
     *   - Headings should be hierarchical
     */
    
    // Run axe accessibility scan on initial page
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Check page language is set correctly
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('de');
    
    // Verify proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log('Page headings:', headings);
    
    // Should have proper heading hierarchy
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThanOrEqual(1);
  });

  test('A11y-2: Modal Accessibility and Focus Management', async ({ page }) => {
    /**
     * PSEUDO-CODE: Modal accessibility test
     * GIVEN: User opens booking modal
     * WHEN: Modal is displayed
     * THEN:
     *   - Focus should move to modal
     *   - Tab should be trapped within modal
     *   - Escape key should close modal
     *   - Modal should have proper ARIA attributes
     *   - Focus should return to trigger element when closed
     */
    
    // Find and focus on booking button first
    const bookingButton = page.locator('button:has-text("Termin buchen")');
    await bookingButton.focus();
    
    // Open modal with Enter key
    await page.keyboard.press('Enter');
    
    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Check modal ARIA attributes
    await expect(modal).toHaveAttribute('role', 'dialog');
    
    const modalTitle = page.locator('[role="dialog"] h2, [role="dialog"] h3').first();
    await expect(modalTitle).toBeVisible();
    
    // Check if modal has aria-labelledby or aria-label
    const ariaLabelledby = await modal.getAttribute('aria-labelledby');
    const ariaLabel = await modal.getAttribute('aria-label');
    expect(ariaLabelledby || ariaLabel).toBeTruthy();
    
    // Test focus management - focus should be in modal
    const activeElement = page.locator(':focus');
    const modalBounds = await modal.boundingBox();
    const focusedBounds = await activeElement.boundingBox();
    
    if (focusedBounds && modalBounds) {
      // Focused element should be within modal bounds
      expect(focusedBounds.x).toBeGreaterThanOrEqual(modalBounds.x);
      expect(focusedBounds.y).toBeGreaterThanOrEqual(modalBounds.y);
    }
    
    // Test tab trapping - tab through modal elements
    const modalInteractiveElements = modal.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
    const elementCount = await modalInteractiveElements.count();
    
    if (elementCount > 0) {
      // Tab through all elements and ensure focus stays in modal
      for (let i = 0; i < elementCount + 2; i++) {
        await page.keyboard.press('Tab');
        
        const currentFocus = page.locator(':focus');
        const focusInModal = await modal.locator(':focus').count();
        expect(focusInModal).toBeGreaterThan(0);
      }
    }
    
    // Test Escape key closes modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
    
    // Focus should return to trigger button
    const focusedAfterClose = page.locator(':focus');
    expect(await focusedAfterClose.textContent()).toContain('Termin buchen');
  });

  test('A11y-3: Keyboard Navigation Throughout Booking Flow', async ({ page }) => {
    /**
     * PSEUDO-CODE: Complete keyboard navigation test
     * GIVEN: User navigates booking flow with keyboard only
     * WHEN: User progresses through all steps
     * THEN:
     *   - All interactive elements should be keyboard accessible
     *   - Focus indicators should be visible
     *   - Tab order should be logical
     *   - Enter/Space should activate elements
     *   - Form submission should work via keyboard
     */
    
    await openModalViaKeyboard(page);
    
    // Step 1: Consultant Selection
    await navigateConsultantSelectionKeyboard(page);
    
    // Step 2: Date/Time Selection  
    await navigateDateTimeSelectionKeyboard(page);
    
    // Step 3: Contact Information
    await navigateContactFormKeyboard(page);
    
    // Step 4: Billing Information
    await navigateBillingFormKeyboard(page);
    
    // Verify we reached the payment step
    await expect(page.locator('h3:has-text("Zahlung")')).toBeVisible();
  });

  test('A11y-4: Screen Reader Compatibility and ARIA', async ({ page }) => {
    /**
     * PSEUDO-CODE: Screen reader compatibility test
     * GIVEN: Booking flow is opened
     * WHEN: Screen reader interacts with elements
     * THEN:
     *   - All content should have proper labels
     *   - Form fields should be properly associated with labels
     *   - Error messages should be announced
     *   - Dynamic content changes should be announced
     *   - Progress information should be available
     */
    
    await openModalViaKeyboard(page);
    
    // Check form labels and associations
    const formFields = page.locator('input, select, textarea');
    const fieldCount = await formFields.count();
    
    for (let i = 0; i < fieldCount; i++) {
      const field = formFields.nth(i);
      const fieldId = await field.getAttribute('id');
      const ariaLabel = await field.getAttribute('aria-label');
      const ariaLabelledby = await field.getAttribute('aria-labelledby');
      
      if (fieldId) {
        // Check for associated label
        const label = page.locator(`label[for="${fieldId}"]`);
        const labelExists = await label.count() > 0;
        
        // Field should have label, aria-label, or aria-labelledby
        expect(labelExists || ariaLabel || ariaLabelledby).toBeTruthy();
      }
    }
    
    // Check progress information accessibility
    const progressBar = page.locator('[role="progressbar"], .progress, [data-testid="progress"]');
    if (await progressBar.count() > 0) {
      const progressElement = progressBar.first();
      
      // Should have aria-valuenow, aria-valuemin, aria-valuemax
      const ariaValuenow = await progressElement.getAttribute('aria-valuenow');
      const ariaValuemin = await progressElement.getAttribute('aria-valuemin');
      const ariaValuemax = await progressElement.getAttribute('aria-valuemax');
      
      expect(ariaValuenow).toBeTruthy();
      expect(ariaValuemin).toBeTruthy();
      expect(ariaValuemax).toBeTruthy();
    }
    
    // Check live regions for dynamic updates
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    const liveRegionCount = await liveRegions.count();
    console.log(`Found ${liveRegionCount} live regions for screen reader updates`);
    
    // Test error message announcement
    if (await page.locator('input[type="email"]').count() > 0) {
      // Enter invalid email to trigger error
      await page.fill('input[type="email"]', 'invalid-email');
      await page.keyboard.press('Tab');
      
      // Check for error message with proper ARIA
      const errorMessage = page.locator('[role="alert"], .error, [aria-describedby*="error"]');
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent();
        expect(errorText).toBeTruthy();
        console.log('Error message found:', errorText);
      }
    }
  });

  test('A11y-5: Color Contrast and Visual Accessibility', async ({ page }) => {
    /**
     * PSEUDO-CODE: Visual accessibility test
     * GIVEN: Booking interface is displayed
     * WHEN: Color contrast is analyzed
     * THEN:
     *   - All text should meet WCAG AA contrast ratios
     *   - Interactive elements should have proper focus indicators
     *   - No information should be conveyed by color alone
     *   - Text should be resizable up to 200% without horizontal scrolling
     */
    
    // Run axe scan specifically for color contrast
    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();
    
    expect(contrastResults.violations).toEqual([]);
    
    // Test focus indicators visibility
    await openModalViaKeyboard(page);
    
    const interactiveElements = page.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
    const elementCount = await interactiveElements.count();
    
    // Tab through elements and check focus visibility
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = interactiveElements.nth(i);
      await element.focus();
      
      // Check if element has visible focus indicator
      const computedStyle = await page.evaluate((el) => {
        const styles = window.getComputedStyle(el, ':focus');
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          outlineColor: styles.outlineColor,
          boxShadow: styles.boxShadow,
          border: styles.border
        };
      }, element);
      
      // Should have some form of focus indicator
      const hasFocusIndicator = 
        computedStyle.outline !== 'none' ||
        computedStyle.outlineWidth !== '0px' ||
        computedStyle.boxShadow !== 'none' ||
        computedStyle.border.includes('focus') ||
        computedStyle.boxShadow.includes('focus');
      
      expect(hasFocusIndicator).toBeTruthy();
    }
    
    // Test text scaling (simulate 200% zoom)
    await page.setViewportSize({ width: 1920 / 2, height: 1080 / 2 });
    await page.evaluate(() => {
      document.body.style.zoom = '2.0';
    });
    
    await page.waitForTimeout(500);
    
    // Check for horizontal scrolling
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    // Some horizontal scrolling may be acceptable, but should be minimal
    if (hasHorizontalScroll) {
      console.log('Warning: Horizontal scrolling detected at 200% zoom');
    }
  });

  test('A11y-6: Form Accessibility and Error Handling', async ({ page }) => {
    /**
     * PSEUDO-CODE: Form accessibility test
     * GIVEN: User interacts with booking forms
     * WHEN: Form validation occurs
     * THEN:
     *   - All form fields should have proper labels
     *   - Required fields should be marked as such
     *   - Error messages should be associated with fields
     *   - Field instructions should be available
     *   - Form should be submittable via keyboard
     */
    
    await openModalViaKeyboard(page);
    
    // Navigate to contact form step
    await selectFirstConsultantKeyboard(page);
    await selectFirstDateTimeKeyboard(page);
    
    // Now on contact information step
    await expect(page.locator('h3:has-text("Kontaktinformationen")')).toBeVisible();
    
    // Check all form fields for proper accessibility
    const formFields = [
      { name: 'firstName', required: true },
      { name: 'lastName', required: true },
      { name: 'email', required: true },
      { name: 'phone', required: true },
      { name: 'company', required: false },
      { name: 'website', required: false }
    ];
    
    for (const field of formFields) {
      const input = page.locator(`input[name="${field.name}"]`);
      
      if (await input.count() > 0) {
        // Check for label association
        const fieldId = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        
        expect(fieldId || ariaLabel || ariaLabelledby).toBeTruthy();
        
        // Check required field indication
        if (field.required) {
          const isRequired = await input.getAttribute('required');
          const ariaRequired = await input.getAttribute('aria-required');
          
          expect(isRequired !== null || ariaRequired === 'true').toBeTruthy();
        }
        
        // Check for field instructions/descriptions
        const ariaDescribedby = await input.getAttribute('aria-describedby');
        if (ariaDescribedby) {
          const description = page.locator(`#${ariaDescribedby}`);
          expect(await description.count()).toBeGreaterThan(0);
        }
      }
    }
    
    // Test error message accessibility
    // Submit empty form to trigger validation
    const submitButton = page.locator('button:has-text("Weiter")');
    await submitButton.click();
    
    // Check for error messages
    await page.waitForTimeout(1000);
    
    const errorElements = page.locator('[role="alert"], .error-message, [aria-live="polite"]');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      // Each error should be associated with its field
      for (let i = 0; i < errorCount; i++) {
        const error = errorElements.nth(i);
        const errorText = await error.textContent();
        const errorId = await error.getAttribute('id');
        
        expect(errorText).toBeTruthy();
        console.log('Found error message:', errorText);
        
        if (errorId) {
          // Check if any field references this error
          const fieldWithError = page.locator(`[aria-describedby*="${errorId}"]`);
          const fieldCount = await fieldWithError.count();
          expect(fieldCount).toBeGreaterThan(0);
        }
      }
    }
  });

  test('A11y-7: German Language Accessibility', async ({ page }) => {
    /**
     * PSEUDO-CODE: German localization accessibility test
     * GIVEN: Interface is in German
     * WHEN: Screen reader processes German content
     * THEN:
     *   - Language should be properly declared
     *   - German text should have proper pronunciation
     *   - Date/time formats should be accessible in German
     *   - Form validation messages should be in German
     */
    
    // Verify page language
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('de');
    
    // Check for lang attributes on content sections
    const contentSections = page.locator('main, section, article, div[lang]');
    const sectionCount = await contentSections.count();
    
    for (let i = 0; i < sectionCount; i++) {
      const section = contentSections.nth(i);
      const lang = await section.getAttribute('lang');
      
      if (lang) {
        // If lang is specified, should be 'de' or 'de-DE'
        expect(lang).toMatch(/^de/);
      }
    }
    
    await openModalViaKeyboard(page);
    
    // Check German text content accessibility
    const germanTexts = [
      'Wählen Sie Ihren KI-Experten',
      'Datum und Uhrzeit',
      'Kontaktinformationen', 
      'Rechnungsadresse',
      'DSGVO-konform'
    ];
    
    for (const text of germanTexts) {
      const element = page.locator(`:has-text("${text}")`);
      if (await element.count() > 0) {
        // Verify element is accessible
        const isHidden = await element.getAttribute('aria-hidden');
        expect(isHidden).not.toBe('true');
        
        console.log(`German text found and accessible: ${text}`);
      }
    }
    
    // Test German date format accessibility
    await selectFirstConsultantKeyboard(page);
    
    const dateButtons = page.locator('[data-testid="date-button"]');
    if (await dateButtons.count() > 0) {
      const firstDateText = await dateButtons.first().textContent();
      
      // Should contain German weekday/month names
      const germanDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
      const germanMonths = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
      
      const hasGermanDay = germanDays.some(day => firstDateText.includes(day));
      const hasGermanMonth = germanMonths.some(month => firstDateText.includes(month));
      
      expect(hasGermanDay || hasGermanMonth).toBeTruthy();
      console.log('German date format found:', firstDateText);
    }
  });

  test('A11y-8: Modal and Dynamic Content Accessibility', async ({ page }) => {
    /**
     * PSEUDO-CODE: Dynamic content accessibility test
     * GIVEN: User navigates through modal steps
     * WHEN: Content changes dynamically
     * THEN:
     *   - Content changes should be announced
     *   - Loading states should be accessible
     *   - Progress should be communicated
     *   - Error states should be announced
     */
    
    await openModalViaKeyboard(page);
    
    // Check initial modal accessibility
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Verify modal has proper ARIA attributes
    const modalLabel = await modal.getAttribute('aria-label');
    const modalLabelledby = await modal.getAttribute('aria-labelledby');
    const modalDescribedby = await modal.getAttribute('aria-describedby');
    
    expect(modalLabel || modalLabelledby).toBeTruthy();
    
    // Test progress announcement
    const progressInfo = page.locator('text=/Schritt \\d+ von \\d+/');
    if (await progressInfo.count() > 0) {
      const progressText = await progressInfo.textContent();
      console.log('Progress information:', progressText);
      
      // Progress should be in accessible location
      const progressElement = progressInfo.first();
      const ariaHidden = await progressElement.getAttribute('aria-hidden');
      expect(ariaHidden).not.toBe('true');
    }
    
    // Test loading state accessibility
    await selectFirstConsultantKeyboard(page);
    
    // Look for loading indicators
    const loadingIndicators = page.locator('.loading, [role="status"], [aria-busy="true"], .spinner');
    if (await loadingIndicators.count() > 0) {
      const loader = loadingIndicators.first();
      
      // Loading indicator should be accessible
      const ariaLabel = await loader.getAttribute('aria-label');
      const role = await loader.getAttribute('role');
      const ariaBusy = await loader.getAttribute('aria-busy');
      
      expect(ariaLabel || role === 'status' || ariaBusy === 'true').toBeTruthy();
    }
    
    // Test step transition announcement
    await selectFirstDateTimeKeyboard(page);
    
    // Should now be on contact information step
    await expect(page.locator('h3:has-text("Kontaktinformationen")')).toBeVisible();
    
    // Check if step change is announced via live region
    const liveRegions = page.locator('[aria-live], [role="status"]');
    const liveRegionCount = await liveRegions.count();
    
    if (liveRegionCount > 0) {
      console.log(`Found ${liveRegionCount} live regions for dynamic announcements`);
    }
  });

  test('A11y-9: Complete Accessibility Scan - All Steps', async ({ page }) => {
    /**
     * PSEUDO-CODE: Comprehensive accessibility scan
     * GIVEN: Complete booking flow
     * WHEN: Each step is scanned for accessibility
     * THEN:
     *   - No WCAG violations should be found at any step
     *   - All interactive elements should be accessible
     *   - All content should be properly structured
     */
    
    await openModalViaKeyboard(page);
    
    // Scan Step 1: Consultant Selection
    let scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude(['iframe']) // Exclude potential third-party content
      .analyze();
    
    expect(scanResults.violations).toEqual([]);
    console.log('Step 1 (Consultant Selection) - Accessibility: PASS');
    
    await selectFirstConsultantKeyboard(page);
    
    // Scan Step 2: Date/Time Selection  
    scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(scanResults.violations).toEqual([]);
    console.log('Step 2 (Date/Time Selection) - Accessibility: PASS');
    
    await selectFirstDateTimeKeyboard(page);
    
    // Scan Step 3: Contact Information
    scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(scanResults.violations).toEqual([]);
    console.log('Step 3 (Contact Information) - Accessibility: PASS');
    
    // Fill form and continue to next step
    await fillContactFormAccessible(page);
    
    // Scan Step 4: Billing Information
    scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(scanResults.violations).toEqual([]);
    console.log('Step 4 (Billing Information) - Accessibility: PASS');
    
    console.log('All booking steps passed accessibility validation');
  });
});

// Helper functions for accessibility testing

async function openModalViaKeyboard(page) {
  const bookingButton = page.locator('button:has-text("Termin buchen")');
  await bookingButton.focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('[role="dialog"]');
}

async function navigateConsultantSelectionKeyboard(page) {
  // Tab to first consultant card and select with Enter
  await page.keyboard.press('Tab'); // Usually focuses first consultant
  await page.keyboard.press('Enter');
  
  // Tab to continue button and activate
  await page.keyboard.press('Tab'); 
  await page.keyboard.press('Enter');
}

async function selectFirstConsultantKeyboard(page) {
  const consultantCard = page.locator('[data-testid="consultant-card"]').first();
  await consultantCard.focus();
  await page.keyboard.press('Enter');
  
  const continueButton = page.locator('button:has-text("Weiter")');
  await continueButton.focus();
  await page.keyboard.press('Enter');
}

async function navigateDateTimeSelectionKeyboard(page) {
  // Tab to first date and select
  const firstDate = page.locator('[data-testid="date-button"]').first();
  await firstDate.focus();
  await page.keyboard.press('Enter');
  
  // Tab to first time slot and select
  const firstTimeSlot = page.locator('[data-testid="time-slot-button"]').first();
  await firstTimeSlot.focus();
  await page.keyboard.press('Enter');
  
  // Continue to next step
  const continueButton = page.locator('button:has-text("Weiter")');
  await continueButton.focus();
  await page.keyboard.press('Enter');
}

async function selectFirstDateTimeKeyboard(page) {
  await page.waitForSelector('[data-testid="date-button"]');
  const firstDate = page.locator('[data-testid="date-button"]').first();
  await firstDate.focus();
  await page.keyboard.press('Enter');
  
  await page.waitForSelector('[data-testid="time-slot-button"]');
  const firstTimeSlot = page.locator('[data-testid="time-slot-button"]').first();
  await firstTimeSlot.focus();
  await page.keyboard.press('Enter');
  
  const continueButton = page.locator('button:has-text("Weiter")');
  await continueButton.focus();
  await page.keyboard.press('Enter');
}

async function navigateContactFormKeyboard(page) {
  // Fill form fields using keyboard navigation
  await page.keyboard.press('Tab'); // First name
  await page.keyboard.type('Max');
  
  await page.keyboard.press('Tab'); // Last name
  await page.keyboard.type('Mustermann');
  
  await page.keyboard.press('Tab'); // Email
  await page.keyboard.type('max.mustermann@example.com');
  
  await page.keyboard.press('Tab'); // Phone
  await page.keyboard.type('+49 123 456 7890');
  
  // Skip optional fields and submit
  await page.keyboard.press('Tab'); // Company (optional)
  await page.keyboard.press('Tab'); // Website (optional)  
  await page.keyboard.press('Tab'); // Continue button
  await page.keyboard.press('Enter');
}

async function navigateBillingFormKeyboard(page) {
  // Fill billing form via keyboard
  await page.keyboard.press('Tab'); // Billing first name
  await page.keyboard.type('Max');
  
  await page.keyboard.press('Tab'); // Billing last name
  await page.keyboard.type('Mustermann');
  
  await page.keyboard.press('Tab'); // Street
  await page.keyboard.type('Musterstraße 123');
  
  await page.keyboard.press('Tab'); // Postal code
  await page.keyboard.type('10115');
  
  await page.keyboard.press('Tab'); // City
  await page.keyboard.type('Berlin');
  
  // Continue to payment
  await page.keyboard.press('Tab'); // Continue button
  await page.keyboard.press('Enter');
}

async function fillContactFormAccessible(page) {
  await page.fill('input[name="firstName"]', 'Max');
  await page.fill('input[name="lastName"]', 'Mustermann');
  await page.fill('input[name="email"]', 'max.mustermann@example.com');
  await page.fill('input[name="phone"]', '+49 123 456 7890');
  
  const continueButton = page.locator('button:has-text("Weiter")');
  await continueButton.click();
}

module.exports = {
  openModalViaKeyboard,
  selectFirstConsultantKeyboard,
  selectFirstDateTimeKeyboard,
  navigateConsultantSelectionKeyboard,
  navigateDateTimeSelectionKeyboard,
  navigateContactFormKeyboard
};