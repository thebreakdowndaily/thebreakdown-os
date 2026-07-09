import { test, expect } from '@playwright/test';

test.describe('Visual Regression Baseline', () => {
  // Capture full page screenshots for baselines.
  // We use masks or ignore regions for dynamic content if needed,
  // but for a strict baseline we capture the whole rendered state.

  test('Homepage visual baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-baseline.png', { fullPage: true, maxDiffPixels: 100 });
  });

  test('Story visual baseline', async ({ page }) => {
    await page.goto('/story/mgnrega-reform');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('story-baseline.png', { fullPage: true, maxDiffPixels: 100 });
  });

  test('Topic visual baseline', async ({ page }) => {
    await page.goto('/topic/economy');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('topic-baseline.png', { fullPage: true, maxDiffPixels: 100 });
  });

  test('Entity visual baseline', async ({ page }) => {
    await page.goto('/entity/un');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('entity-baseline.png', { fullPage: true, maxDiffPixels: 100 });
  });

  test('Search visual baseline', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('search-baseline.png', { fullPage: true, maxDiffPixels: 100 });
  });
});
