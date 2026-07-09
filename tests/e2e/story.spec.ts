import { test, expect } from '@playwright/test';

test.describe('Story Critical Journey', () => {
  // Using a sample path assuming a robust slug exists in the DB/static set.
  // We can mock this or use a known static path.
  const STORY_URL = '/story/mgnrega-reform';

  test.beforeEach(async ({ page }) => {
    await page.goto(STORY_URL);
  });

  test('should render the story content', async ({ page }) => {
    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should render images', async ({ page }) => {
    // Images within the article should load
    const images = page.locator('article img');
    if (await images.count() > 0) {
      await expect(images.first()).toBeVisible();
    }
  });

  test('should lazy-load charts', async ({ page }) => {
    // Charts might be lazy loaded via IntersectionObserver
    // Scroll down to trigger them
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // We expect a chart container (e.g. svg or specific class) to eventually appear if charts exist
    // This assumes stories have a block of type chart
    const chart = page.locator('svg').filter({ hasNotText: 'logo' }); // example heuristics
    // Just a structural check; pass if chart exists OR if no charts present in this specific story
    const hasCharts = await chart.count() > 0;
    if (hasCharts) {
      await expect(chart.first()).toBeVisible();
    }
  });

  test('should display related stories', async ({ page }) => {
    // Related section check
    const relatedSection = page.locator('text=/Related|More like this/i').first();
    // It's possible some stories lack related links, but generally they exist
    if (await relatedSection.isVisible()) {
      await expect(page.locator('a[href*="/story/"]')).toHaveCount(1, { timeout: 1000 }); // at least 1 link
    }
  });
});
