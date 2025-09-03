/**
 * Mobile Responsiveness Tests for Public Booking Frontend
 * 
 * Tests mobile experience and responsive design:
 * - Various screen sizes and orientations
 * - Touch interactions and gestures
 * - Modal scroll functionality on mobile
 * - Form usability on small screens
 * - Viewport meta tag and zoom behavior
 * - Mobile-specific UI elements
 * - Performance on mobile devices
 * 
 * URL: http://localhost:8040/de/kontakt/terminbuchung
 */

const { test, expect, devices } = require('@playwright/test');

const BASE_URL = 'http://localhost:8040';
const BOOKING_URL = `${BASE_URL}/de/kontakt/terminbuchung`;

// Mobile device configurations to test
const MOBILE_DEVICES = {
  'iPhone_12': devices['iPhone 12'],
  'iPhone_SE': devices['iPhone SE'],
  'Samsung_Galaxy_S21': devices['Galaxy S21'],
  'iPad': devices['iPad'],
  'Pixel_5': devices['Pixel 5']
};

// Custom viewport sizes
const VIEWPORT_SIZES = [
  { width: 320, height: 568, name: 'iPhone 5/SE' },
  { width: 375, height: 667, name: 'iPhone 8' },
  { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  { width: 768, height: 1024, name: 'iPad Portrait' },
  { width: 1024, height: 768, name: 'iPad Landscape' },
  { width: 360, height: 640, name: 'Android Small' },
  { width: 412, height: 869, name: 'Android Large' }
];

test.describe('Mobile Responsiveness Tests', () => {
  
  // Test each major mobile device
  for (const [deviceName, deviceConfig] of Object.entries(MOBILE_DEVICES)) {
    test.describe(`Device: ${deviceName}`, () => {
      
      test.use(deviceConfig);
      
      test(`Mobile-1: Initial Page Load on ${deviceName}`, async ({ page }) => {
        /**
         * PSEUDO-CODE: Mobile page load test
         * GIVEN: User visits booking page on mobile device
         * WHEN: Page loads completely
         * THEN:
         *   - Page should load without horizontal scrolling
         *   - All content should be visible and accessible
         *   - Viewport meta tag should be present
         *   - Touch targets should be appropriately sized
         *   - Text should be readable without zooming
         */
        
        await page.goto(BOOKING_URL);
        await page.waitForLoadEvent('networkidle');
        
        // Check viewport meta tag
        const viewportMeta = page.locator('meta[name="viewport"]');
        await expect(viewportMeta).toHaveCount(1);
        
        const viewportContent = await viewportMeta.getAttribute('content');
        expect(viewportContent).toMatch(/width=device-width/);
        expect(viewportContent).toMatch(/initial-scale=1/);
        
        // Check for horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        expect(hasHorizontalScroll).toBe(false);
        
        // Check if main content is visible
        const mainContent = page.locator('main, [role="main"], .main-content');
        if (await mainContent.count() > 0) {
          await expect(mainContent.first()).toBeVisible();
        }
        
        // Verify booking button is accessible
        const bookingButton = page.locator('button:has-text("Termin buchen")');
        if (await bookingButton.count() > 0) {
          await expect(bookingButton).toBeVisible();
          
          // Check touch target size (minimum 44px)
          const buttonBox = await bookingButton.boundingBox();
          expect(buttonBox.height).toBeGreaterThanOrEqual(44);
          expect(buttonBox.width).toBeGreaterThanOrEqual(44);
        }
      });
      
      test(`Mobile-2: Modal Display and Interaction on ${deviceName}`, async ({ page }) => {
        /**
         * PSEUDO-CODE: Mobile modal test
         * GIVEN: User opens booking modal on mobile
         * WHEN: Modal is displayed
         * THEN:
         *   - Modal should fill screen appropriately
         *   - Content should be scrollable within modal
         *   - Touch interactions should work smoothly
         *   - Close button should be easily accessible
         *   - Keyboard should not overlap content
         */
        
        await page.goto(BOOKING_URL);
        await page.waitForLoadEvent('networkidle');
        
        // Open modal via touch
        const bookingButton = page.locator('button:has-text("Termin buchen")');
        await bookingButton.tap();
        
        // Wait for modal to appear
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Modal should not cause horizontal overflow
        const modalBox = await modal.boundingBox();
        const viewportWidth = page.viewportSize().width;
        expect(modalBox.width).toBeLessThanOrEqual(viewportWidth);
        
        // Check if content is scrollable
        const modalContent = modal.locator('.overflow-y-auto, .scrollable-content');
        if (await modalContent.count() > 0) {
          // Try scrolling within modal
          await modalContent.first().hover();
          await page.mouse.wheel(0, 200);
          await page.waitForTimeout(500);
          
          // Content should still be visible
          await expect(modal).toBeVisible();
        }
        
        // Test close button accessibility
        const closeButton = modal.locator('button[aria-label*="Schließen"], button:has-text("×")');
        await expect(closeButton).toBeVisible();
        
        // Close button should have adequate touch target
        const closeBox = await closeButton.boundingBox();
        expect(closeBox.height).toBeGreaterThanOrEqual(44);
        expect(closeBox.width).toBeGreaterThanOrEqual(44);
        
        // Test closing modal
        await closeButton.tap();
        await expect(modal).not.toBeVisible();
      });
      
      test(`Mobile-3: Complete Booking Flow on ${deviceName}`, async ({ page }) => {
        /**
         * PSEUDO-CODE: Mobile booking flow test
         * GIVEN: User completes booking flow on mobile
         * WHEN: Each step is navigated
         * THEN:
         *   - All steps should be usable on mobile
         *   - Form fields should be appropriately sized
         *   - Date/time selection should work with touch
         *   - Scroll behavior should be smooth
         *   - Virtual keyboard should not break layout
         */
        
        await page.goto(BOOKING_URL);
        await openMobileModal(page);
        
        // Step 1: Consultant Selection
        await testConsultantSelectionMobile(page);
        
        // Step 2: Date/Time Selection
        await testDateTimeSelectionMobile(page);
        
        // Step 3: Contact Form
        await testContactFormMobile(page);
        
        // Verify we reached billing step
        await expect(page.locator('h3:has-text("Rechnungsadresse")')).toBeVisible();
      });
      
      test(`Mobile-4: Form Input and Keyboard Interaction on ${deviceName}`, async ({ page }) => {
        /**
         * PSEUDO-CODE: Mobile form interaction test
         * GIVEN: User interacts with forms on mobile
         * WHEN: Virtual keyboard appears
         * THEN:
         *   - Layout should adapt to keyboard
         *   - Input fields should remain visible
         *   - Scrolling should work correctly
         *   - Form validation should be mobile-friendly
         */
        
        await page.goto(BOOKING_URL);
        await openMobileModal(page);
        
        // Navigate to contact form
        await selectFirstConsultantMobile(page);
        await selectFirstDateTimeMobile(page);
        
        // Test form field interactions
        const firstNameInput = page.locator('input[name="firstName"]');
        await expect(firstNameInput).toBeVisible();
        
        // Focus on input (should trigger virtual keyboard)
        await firstNameInput.tap();
        await page.waitForTimeout(500); // Wait for keyboard animation
        
        // Input should still be visible after keyboard appears
        await expect(firstNameInput).toBeVisible();
        
        // Test typing
        await firstNameInput.fill('Max');
        expect(await firstNameInput.inputValue()).toBe('Max');
        
        // Test form validation on mobile
        const emailInput = page.locator('input[name="email"]');
        await emailInput.tap();
        await emailInput.fill('invalid-email');
        
        // Move focus away to trigger validation
        await page.locator('input[name="phone"]').tap();
        
        // Error message should be visible and accessible
        const errorMessage = page.locator('.error, [role="alert"]');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
        
        // Correct the email
        await emailInput.tap();
        await emailInput.fill('max@example.com');
        
        // Continue to next step
        await page.fill('input[name="lastName"]', 'Mustermann');
        await page.fill('input[name="phone"]', '+49 123 456 7890');
        
        const continueButton = page.locator('button:has-text("Weiter")');
        await continueButton.tap();
        
        // Should progress to next step
        await expect(page.locator('h3:has-text("Rechnungsadresse")')).toBeVisible();
      });
      
    });
  }
  
  // Test custom viewport sizes
  test.describe('Custom Viewport Sizes', () => {
    
    for (const viewport of VIEWPORT_SIZES) {
      test(`Responsive-1: Layout on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        /**
         * PSEUDO-CODE: Viewport size test
         * GIVEN: Specific viewport dimensions
         * WHEN: Page is viewed at that size
         * THEN:
         *   - Layout should adapt appropriately
         *   - No content should be cut off
         *   - Navigation should remain usable
         *   - Text should remain readable
         */
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(BOOKING_URL);
        await page.waitForLoadEvent('networkidle');
        
        // Check for horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        expect(hasHorizontalScroll).toBe(false);
        
        // Check if critical content is visible
        const importantElements = [
          'h1, h2, .main-title',
          'button:has-text("Termin buchen")',
          'main, [role="main"]'
        ];
        
        for (const selector of importantElements) {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            const elementBox = await element.first().boundingBox();
            
            // Element should be within viewport
            expect(elementBox.x).toBeGreaterThanOrEqual(0);
            expect(elementBox.y).toBeGreaterThanOrEqual(0);
            expect(elementBox.x + elementBox.width).toBeLessThanOrEqual(viewport.width + 10); // Small tolerance
          }
        }
        
        // Test modal opening at this viewport size
        const bookingButton = page.locator('button:has-text("Termin buchen")');
        if (await bookingButton.count() > 0) {
          await bookingButton.click();
          
          const modal = page.locator('[role="dialog"]');
          await expect(modal).toBeVisible();
          
          const modalBox = await modal.boundingBox();
          
          // Modal should fit within viewport
          expect(modalBox.width).toBeLessThanOrEqual(viewport.width);
          expect(modalBox.height).toBeLessThanOrEqual(viewport.height);
        }
      });
    }
    
  });
  
  test.describe('Touch and Gesture Interactions', () => {
    
    test.use(devices['iPhone 12']);
    
    test('Touch-1: Touch Target Sizes and Spacing', async ({ page }) => {
      /**
       * PSEUDO-CODE: Touch target test
       * GIVEN: Mobile interface elements
       * WHEN: User attempts to tap elements
       * THEN:
       *   - Touch targets should be at least 44px
       *   - Adequate spacing between touch targets
       *   - No accidental taps on nearby elements
       */
      
      await page.goto(BOOKING_URL);
      await openMobileModal(page);
      
      // Check consultant selection cards
      const consultantCards = page.locator('[data-testid="consultant-card"]');
      const cardCount = await consultantCards.count();
      
      for (let i = 0; i < cardCount; i++) {
        const card = consultantCards.nth(i);
        const cardBox = await card.boundingBox();
        
        // Card should be large enough for easy touch
        expect(cardBox.height).toBeGreaterThanOrEqual(44);
        
        // Check spacing between cards
        if (i > 0) {
          const prevCard = consultantCards.nth(i - 1);
          const prevCardBox = await prevCard.boundingBox();
          
          const spacing = cardBox.y - (prevCardBox.y + prevCardBox.height);
          expect(spacing).toBeGreaterThanOrEqual(8); // Minimum 8px spacing
        }
      }
      
      // Test button sizes
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        
        if (await button.isVisible()) {
          const buttonBox = await button.boundingBox();
          
          // Buttons should meet minimum touch target size
          expect(Math.min(buttonBox.width, buttonBox.height)).toBeGreaterThanOrEqual(44);
        }
      }
    });
    
    test('Touch-2: Scroll Behavior and Performance', async ({ page }) => {
      /**
       * PSEUDO-CODE: Scroll behavior test
       * GIVEN: Scrollable content on mobile
       * WHEN: User scrolls through content
       * THEN:
       *   - Scrolling should be smooth and responsive
       *   - No lag or jank during scroll
       *   - Scroll position should be maintained
       *   - Nested scrolling should work correctly
       */
      
      await page.goto(BOOKING_URL);
      await openMobileModal(page);
      
      // Navigate to date selection (has scrollable content)
      await selectFirstConsultantMobile(page);
      
      // Test scrolling in date selection
      const dateContainer = page.locator('.date-selection, .overflow-y-auto');
      if (await dateContainer.count() > 0) {
        const container = dateContainer.first();
        
        // Get initial scroll position
        const initialScrollTop = await container.evaluate(el => el.scrollTop);
        
        // Perform touch scroll
        const containerBox = await container.boundingBox();
        const startY = containerBox.y + containerBox.height / 2;
        const endY = startY - 200; // Scroll up
        
        await page.touchscreen.swipe(containerBox.x + containerBox.width / 2, startY, containerBox.x + containerBox.width / 2, endY);
        
        await page.waitForTimeout(500);
        
        // Check if scroll position changed
        const newScrollTop = await container.evaluate(el => el.scrollTop);
        expect(newScrollTop).not.toBe(initialScrollTop);
      }
    });
    
    test('Touch-3: Swipe Gestures and Navigation', async ({ page }) => {
      /**
       * PSEUDO-CODE: Swipe gesture test
       * GIVEN: Modal with multiple steps
       * WHEN: User performs swipe gestures
       * THEN:
       *   - Swipes should not interfere with normal navigation
       *   - Pull-to-refresh should be disabled if inappropriate
       *   - Horizontal swipes should not close modal accidentally
       */
      
      await page.goto(BOOKING_URL);
      await openMobileModal(page);
      
      const modal = page.locator('[role="dialog"]');
      const modalBox = await modal.boundingBox();
      
      // Test horizontal swipe (should not close modal)
      await page.touchscreen.swipe(
        modalBox.x + modalBox.width / 2,
        modalBox.y + modalBox.height / 2,
        modalBox.x + modalBox.width / 2 + 100,
        modalBox.y + modalBox.height / 2
      );
      
      await page.waitForTimeout(500);
      
      // Modal should still be visible
      await expect(modal).toBeVisible();
      
      // Test that normal tap interactions still work after swipe
      const consultantCard = page.locator('[data-testid="consultant-card"]').first();
      await consultantCard.tap();
      
      // Should be able to continue normally
      const continueButton = page.locator('button:has-text("Weiter")');
      await expect(continueButton).toBeVisible();
    });
    
  });
  
  test.describe('Orientation Changes', () => {
    
    test('Orientation-1: Portrait to Landscape Transition', async ({ page }) => {
      /**
       * PSEUDO-CODE: Orientation change test
       * GIVEN: User is in booking flow in portrait mode
       * WHEN: Device is rotated to landscape
       * THEN:
       *   - Layout should adapt smoothly
       *   - Modal should remain usable
       *   - No content should be lost
       *   - Form state should be preserved
       */
      
      // Start in portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BOOKING_URL);
      await openMobileModal(page);
      
      // Navigate to contact form and fill some data
      await selectFirstConsultantMobile(page);
      await selectFirstDateTimeMobile(page);
      
      await page.fill('input[name="firstName"]', 'Max');
      await page.fill('input[name="lastName"]', 'Mustermann');
      
      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(500);
      
      // Verify modal is still visible and usable
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Form data should be preserved
      expect(await page.locator('input[name="firstName"]').inputValue()).toBe('Max');
      expect(await page.locator('input[name="lastName"]').inputValue()).toBe('Mustermann');
      
      // Should be able to continue interaction
      await page.fill('input[name="email"]', 'max@example.com');
      await page.fill('input[name="phone"]', '+49 123 456 7890');
      
      const continueButton = page.locator('button:has-text("Weiter")');
      await continueButton.tap();
      
      // Should progress to next step
      await expect(page.locator('h3:has-text("Rechnungsadresse")')).toBeVisible();
    });
    
  });
  
  test.describe('Mobile Performance', () => {
    
    test.use(devices['iPhone SE']); // Test on slower device
    
    test('Performance-1: Mobile Load Performance', async ({ page }) => {
      /**
       * PSEUDO-CODE: Mobile performance test
       * GIVEN: Slow mobile device
       * WHEN: Booking flow is used
       * THEN:
       *   - Initial load should be under 3 seconds
       *   - Modal opening should be under 1 second
       *   - Form interactions should be responsive
       *   - No memory leaks or excessive resource usage
       */
      
      const startTime = Date.now();
      
      await page.goto(BOOKING_URL);
      await page.waitForLoadEvent('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 second load time
      
      // Test modal opening performance
      const modalOpenStart = Date.now();
      await openMobileModal(page);
      const modalOpenTime = Date.now() - modalOpenStart;
      
      expect(modalOpenTime).toBeLessThan(1000); // 1 second modal open
      
      // Test consultant selection performance
      const consultantSelectStart = Date.now();
      await page.locator('[data-testid="consultant-card"]').first().tap();
      await page.waitForSelector('button:has-text("Weiter")');
      const consultantSelectTime = Date.now() - consultantSelectStart;
      
      expect(consultantSelectTime).toBeLessThan(500); // 500ms selection response
      
      console.log(`Mobile performance - Load: ${loadTime}ms, Modal: ${modalOpenTime}ms, Selection: ${consultantSelectTime}ms`);
    });
    
  });
  
});

// Helper functions for mobile testing

async function openMobileModal(page) {
  const bookingButton = page.locator('button:has-text("Termin buchen")');
  await bookingButton.tap();
  await page.waitForSelector('[role="dialog"]');
}

async function selectFirstConsultantMobile(page) {
  await page.waitForSelector('[data-testid="consultant-card"]');
  const firstConsultant = page.locator('[data-testid="consultant-card"]').first();
  await firstConsultant.tap();
  
  const continueButton = page.locator('button:has-text("Weiter")');
  await continueButton.tap();
}

async function selectFirstDateTimeMobile(page) {
  await page.waitForSelector('[data-testid="date-button"]');
  const firstDate = page.locator('[data-testid="date-button"]').first();
  await firstDate.tap();
  
  await page.waitForSelector('[data-testid="time-slot-button"]');
  const firstTimeSlot = page.locator('[data-testid="time-slot-button"]').first();
  await firstTimeSlot.tap();
  
  const continueButton = page.locator('button:has-text("Weiter")');
  await continueButton.tap();
}

async function testConsultantSelectionMobile(page) {
  // Wait for consultants to load
  await page.waitForSelector('[data-testid="consultant-card"]');
  
  // Test touch interaction
  const consultantCards = page.locator('[data-testid="consultant-card"]');
  const cardCount = await consultantCards.count();
  expect(cardCount).toBe(2);
  
  // Select first consultant
  await consultantCards.first().tap();
  
  // Verify selection highlighting
  await expect(consultantCards.first()).toHaveClass(/border-blue-500|bg-blue-50/);
  
  // Continue to next step
  const continueButton = page.locator('button:has-text("Weiter")');
  await expect(continueButton).toBeVisible();
  await continueButton.tap();
}

async function testDateTimeSelectionMobile(page) {
  // Wait for date options
  await page.waitForSelector('[data-testid="date-button"]');
  
  const dateButtons = page.locator('[data-testid="date-button"]');
  const dateCount = await dateButtons.count();
  expect(dateCount).toBeGreaterThan(10); // Should have multiple weekdays
  
  // Test scrolling if needed
  const dateContainer = page.locator('.date-selection, .overflow-y-auto').first();
  if (await dateContainer.count() > 0) {
    // Scroll to see more dates
    await page.touchscreen.swipe(400, 400, 400, 200);
    await page.waitForTimeout(300);
  }
  
  // Select first available date
  await dateButtons.first().tap();
  
  // Wait for time slots
  await page.waitForSelector('[data-testid="time-slot-button"]');
  const timeSlots = page.locator('[data-testid="time-slot-button"]');
  
  // Select first time slot
  await timeSlots.first().tap();
  
  // Continue to contact form
  const continueButton = page.locator('button:has-text("Weiter")');
  await continueButton.tap();
}

async function testContactFormMobile(page) {
  // Wait for contact form
  await expect(page.locator('h3:has-text("Kontaktinformationen")')).toBeVisible();
  
  // Fill form using mobile interactions
  const fields = [
    { name: 'firstName', value: 'Max' },
    { name: 'lastName', value: 'Mustermann' },
    { name: 'email', value: 'max.mustermann@example.com' },
    { name: 'phone', value: '+49 123 456 7890' }
  ];
  
  for (const field of fields) {
    const input = page.locator(`input[name="${field.name}"]`);
    await input.tap();
    await input.fill(field.value);
    
    // Verify input was filled correctly
    expect(await input.inputValue()).toBe(field.value);
  }
  
  // Submit form
  const continueButton = page.locator('button:has-text("Weiter")');
  await continueButton.tap();
}

module.exports = {
  openMobileModal,
  selectFirstConsultantMobile,
  selectFirstDateTimeMobile,
  testConsultantSelectionMobile,
  testDateTimeSelectionMobile,
  testContactFormMobile,
  VIEWPORT_SIZES,
  MOBILE_DEVICES
};