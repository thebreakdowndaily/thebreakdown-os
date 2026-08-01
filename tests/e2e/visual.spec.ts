import { test, expect } from '@playwright/test';

test.describe('Visual Regression Baseline', () => {
  // Capture full page screenshots for baselines.
  // 2% pixel-ratio tolerance (maxDiffPixelRatio: 0.02): these pages render
  // dynamic canvases (knowledge graph, globe, charts) that re-render slightly
  // between loads. A 98% pixel match still catches real regressions while
  // tolerating animated canvas output.

  test('Homepage visual baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage-baseline.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('Story visual baseline', async ({ page }) => {
    await page.goto('/story/mgnrega-reform');
    await expect(page).toHaveScreenshot('story-baseline.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('Topic visual baseline', async ({ page }) => {
    await page.goto('/topic/economy');
    await expect(page).toHaveScreenshot('topic-baseline.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('Entity visual baseline', async ({ page }) => {
    await page.goto('/entity/un');
    await expect(page).toHaveScreenshot('entity-baseline.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });

  test('Search visual baseline', async ({ page }) => {
    await page.goto('/search');
    await expect(page).toHaveScreenshot('search-baseline.png', { fullPage: true, maxDiffPixelRatio: 0.02 });
  });
});
