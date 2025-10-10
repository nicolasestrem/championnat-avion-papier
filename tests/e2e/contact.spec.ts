import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('has correct title and headings', async ({ page }) => {
    await expect(page).toHaveTitle(/Contact.*FAQ/);
    await expect(page.locator('h1')).toContainText('Contact');
    await expect(page.locator('h2:has-text("FAQ")')).toBeVisible();
  });

  test('displays contact information', async ({ page }) => {
    // Check email
    await expect(page.locator('text=bonjour@championnatavionpapier.fr')).toBeVisible();
    
    // Check phone number
    await expect(page.locator('text=06 99 70 23 05')).toBeVisible();
    
    // Check event date and venue
    await expect(page.locator('text=Samedi 17 Mai 2025')).toBeVisible();
    await expect(page.locator('text=Complexe Sportif Daniel Colombier')).toBeVisible();
  });

  test('displays either contact form or unavailability message', async ({ page }) => {
    const form = page.locator('form');
    const unavailabilityNotice = page.locator('text=Formulaire de contact indisponible');

    const formVisible = await form.isVisible();
    const noticeVisible = await unavailabilityNotice.isVisible();

    expect(formVisible || noticeVisible).toBe(true);

    if (formVisible) {
      await expect(form.locator('input[name="name"]')).toBeVisible();
      await expect(form.locator('input[name="email"]')).toBeVisible();
      await expect(form.locator('textarea[name="message"]')).toBeVisible();
      await expect(form.locator('button[type="submit"]')).toBeVisible();

      const formAction = await form.getAttribute('action');
      await expect(formAction).not.toBe('#');
    }
  });

  test('contact form validation works if form is present', async ({ page }) => {
    const form = page.locator('form');
    if (await form.isVisible()) {
      const submitButton = form.locator('button[type="submit"]');
    
      // Try to submit empty form
      await submitButton.click();

      // Check that required fields show validation
      const nameInput = form.locator('input[name="name"]');
      const emailInput = form.locator('input[name="email"]');

      // HTML5 validation should prevent submission
      await expect(nameInput).toHaveAttribute('required', '');
      await expect(emailInput).toHaveAttribute('required', '');
    } else {
      // If form is not present, the test passes by default.
      test.skip(true, 'Form not available, skipping validation test.');
    }
  });

  test('FAQ accordions expand and collapse', async ({ page }) => {
    // Find FAQ section
    const faqSection = page.locator('section:has(h2:has-text("FAQ"))');
    
    // Get all details elements
    const details = faqSection.locator('details');
    const firstDetail = details.first();
    
    // Initially closed
    await expect(firstDetail).not.toHaveAttribute('open');
    
    // Click to open
    await firstDetail.locator('summary').click();
    
    // Should be open now
    await expect(firstDetail).toHaveAttribute('open', '');
    
    // Content should be visible
    const content = firstDetail.locator('div').first();
    await expect(content).toBeVisible();
    
    // Click to close
    await firstDetail.locator('summary').click();
    
    // Should be closed
    await expect(firstDetail).not.toHaveAttribute('open');
  });

  test('FAQ contains expected questions', async ({ page }) => {
    const faqSection = page.locator('section:has(h2:has-text("FAQ"))');
    
    // Check for specific FAQ items
    await expect(faqSection.locator('text=Tarif')).toBeVisible();
    await expect(faqSection.locator('text=Animations')).toBeVisible();
    await expect(faqSection.locator('text=Restauration')).toBeVisible();
    await expect(faqSection.locator('text=Horaires du Championnat')).toBeVisible();
  });

  test('Google Maps iframe loads', async ({ page }) => {
    // Check that map iframe exists
    const mapIframe = page.locator('iframe[src*="google.com/maps"]');
    await expect(mapIframe).toBeVisible();
    
    // Check iframe has proper attributes
    await expect(mapIframe).toHaveAttribute('allowfullscreen', '');
  });

  test('social media links are present', async ({ page }) => {
    // Check social links
    await expect(page.locator('a[href*="facebook"]')).toBeVisible();
    await expect(page.locator('a[href*="instagram"]')).toBeVisible();
    await expect(page.locator('a[href*="linkedin"]')).toBeVisible();
    await expect(page.locator('a[href*="youtube"]')).toBeVisible();
  });

  test('calendar button exists', async ({ page }) => {
    const calendarButton = page.locator('button:has-text("Ajouter au calendrier")');
    await expect(calendarButton).toBeVisible();
  });

  test('calendar button triggers ICS download', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#add-to-calendar').click()
    ]);
    await expect(download.suggestedFilename()).toBe('championnat-avion-papier-2025.ics');
  });
});