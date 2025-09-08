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
    const heading = page.locator('h1');
    await expect(heading).toContainText('Championnat du Monde de Lancer d\'Avions en Papier 2025');
    
    // Check event date
    await expect(page.locator('text=17 Mai 2025')).toBeVisible();
    
    // Check venue
    await expect(page.locator('text=Complexe Sportif D. Colombier')).toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    // Check header navigation
    const contactLink = page.locator('nav a:has-text("Contact")');
    await expect(contactLink).toBeVisible();
    
    // Navigate to contact page
    await contactLink.click();
    await expect(page).toHaveURL(/contact/);
    await expect(page.locator('h1')).toContainText('Contact');
  });

  test('displays sponsor section', async ({ page }) => {
    // Scroll to sponsors
    await page.locator('text=Nos sponsors').scrollIntoViewIfNeeded();
    
    // Check sponsor section is visible
    const sponsorSection = page.locator('section:has-text("Nos sponsors")');
    await expect(sponsorSection).toBeVisible();
    
    // Check some sponsor names
    await expect(page.locator('text=ASAS-TECH')).toBeVisible();
    await expect(page.locator('text=Holiday Inn')).toBeVisible();
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
    await expect(page.locator('h1')).toBeVisible();
  });
});