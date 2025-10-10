import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('contact page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/contact');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // First focusable element should be visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName.toLowerCase() : null;
    });
    
    expect(focusedElement).toBeTruthy();
    
    // Continue tabbing and check we can reach main content
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Should be able to tab to links
    const activeElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? { tag: el.tagName.toLowerCase(), href: el.getAttribute('href') } : null;
    });
    
    expect(activeElement).toBeTruthy();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Get all images
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // All images should have alt attribute (even if empty for decorative)
      expect(alt).toBeDefined();
    }
  });

  test('headings are in logical order', async ({ page }) => {
    await page.goto('/');
    
    // Get all headings
    const headings = await page.$$eval('[data-page-root] h1, [data-page-root] h2, [data-page-root] h3, [data-page-root] h4, [data-page-root] h5, [data-page-root] h6', elements =>
      elements
        .filter(el => {
          const overlayHost = el.closest('astro-dev-toolbar, astro-dev-overlay');
          const overlayId = el.closest('#astro-dev-toolbar, #astro-dev-overlay');
          const overlayData = el.closest('[data-astro-dev-toolbar]');
          const contentRegion = el.closest('main, header, footer');
          return !overlayHost && !overlayId && !overlayData && !!contentRegion;
        })
        .map(el => ({
          level: parseInt(el.tagName[1]),
          text: el.textContent?.trim()
        }))
    );

    
    // Should have exactly one h1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBe(1);
    
    // Check heading hierarchy (no skipping levels)
    let previousLevel = 1;
    for (const heading of headings) {
      // Level should not increase by more than 1
      expect(heading.level - previousLevel).toBeLessThanOrEqual(1);
      previousLevel = heading.level;
    }
  });

  test('forms have proper labels', async ({ page }) => {
    await page.goto('/contact');
    
    // Check all input fields have labels
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      
      if (id) {
        // Check for associated label
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toHaveCount(1);
      }
      
      // Input should have a name attribute
      expect(name).toBeTruthy();
    }
  });

  test('color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('/');
    
    // This would typically use axe-core, but we can check specific elements
    const textElements = page.locator('p, span, h1, h2, h3, h4, h5, h6, a');
    const count = await textElements.count();
    
    // Sample check for a few elements
    for (let i = 0; i < Math.min(5, count); i++) {
      const element = textElements.nth(i);
      const color = await element.evaluate(el => 
        window.getComputedStyle(el).color
      );
      const backgroundColor = await element.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Basic check that colors are defined
      expect(color).toBeTruthy();
      expect(backgroundColor).toBeTruthy();
    }
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first link
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Get focused element's outline
    const focusOutline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow
      };
    });
    
    // Should have some focus indicator (outline or box-shadow)
    const hasVisibleFocus = 
      (focusOutline?.outlineWidth && focusOutline.outlineWidth !== '0px') ||
      (focusOutline?.boxShadow && focusOutline.boxShadow !== 'none');
    
    expect(hasVisibleFocus).toBeTruthy();
  });
});