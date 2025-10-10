import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Championnat du Monde de Lancer d'Avions en Papier 2025/);
  });

  test('displays hero section with event details', async ({ page }) => {
    // Check hero heading
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Championnat du Monde de Lancer d'Avions en Papier 2025/,
      }),
    ).toBeVisible();
    
    // Check event date
    await expect(page.getByTestId('event-date')).toBeVisible();
    
    // Check venue
    await expect(page.getByTestId('event-location')).toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    // Check header navigation
    const contactLink = page.locator('nav a:has-text("Contact")');
    await expect(contactLink).toBeVisible();
    
    // Navigate to contact page
    await contactLink.click();
    await expect(page).toHaveURL(/contact/);
    await expect(page.getByRole('heading', { level: 1, name: 'Contact' })).toBeVisible();
  });

  test('displays sponsor section', async ({ page }) => {
    // Scroll to sponsors
    await page.locator('text=Nos sponsors').scrollIntoViewIfNeeded();
    
    // Check sponsor section is visible
    const sponsorSection = page.locator('section:has-text("Nos sponsors")');
    await expect(sponsorSection).toBeVisible();
    
    // Check some sponsor names
    await expect(page.locator('img[alt="ASAS-TECH Logo"]')).toBeVisible();
    await expect(page.locator('img[alt="Holiday Inn Logo"]')).toBeVisible();
  });

  test('displays histoire section', async ({ page }) => {
    // Scroll to history section
    await page.locator('text=Une Histoire déjà riche').scrollIntoViewIfNeeded();
    
    // Check content
    await expect(page.locator('text=Francis Pascutto')).toBeVisible();
    await expect(page.locator('text=88,31 mètres')).toBeVisible();
  });

  test('footer contains social links', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Check social media links
    const footer = page.locator('footer');
    await expect(footer.locator('a[href*="facebook"]')).toBeVisible();
    await expect(footer.locator('a[href*="instagram"]')).toBeVisible();
    await expect(footer.locator('a[href*="linkedin"]')).toBeVisible();
    
    // Check email link
    await expect(footer.locator('a[href^="mailto:"]')).toBeVisible();
  });

  test('mobile menu works on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that the page adapts to mobile
    await expect(page.locator('nav')).toBeVisible();
    
    // Hero should still be visible
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Championnat du Monde de Lancer d'Avions en Papier 2025/,
      }),
    ).toBeVisible();
  });
});