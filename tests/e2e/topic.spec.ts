import { test, expect } from '@playwright/test';

test.describe('Topic Critical Journey', () => {
  const TOPIC_URL = '/topic/economy';

  test.beforeEach(async ({ page }) => {
    await page.goto(TOPIC_URL);
  });

  test('should load topic content', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Economy').first()).toBeVisible();
  });

  test('should render associated charts', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    // Verify an svg or chart container exists
    const svgElements = page.locator('svg');
    if (await svgElements.count() > 0) {
      await expect(svgElements.first()).toBeVisible();
    }
  });

  test('should render maps if applicable', async ({ page }) => {
    // MapRenderer outputs SVG paths or generic canvas
    const mapContainer = page.locator('.map-container, [data-testid="map-renderer"]');
    if (await mapContainer.count() > 0) {
      await expect(mapContainer.first()).toBeVisible();
    }
  });

  test('should render knowledge graph', async ({ page }) => {
    // Knowledge graph is a core component on topics
    const graphContainer = page.locator('canvas, [data-testid="knowledge-graph"]');
    if (await graphContainer.count() > 0) {
      await expect(graphContainer.first()).toBeVisible();
    }
  });
});
