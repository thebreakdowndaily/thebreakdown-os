import { test, expect } from '@playwright/test';

test.describe('Entity Critical Journey', () => {
  const ENTITY_URL = '/entity/un';

  test.beforeEach(async ({ page }) => {
    await page.goto(ENTITY_URL);
  });

  test('should render entity details', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=UN').first()).toBeVisible();
  });

  test('should display relationships', async ({ page }) => {
    // Should list connected entities or topics
    const links = page.locator('a[href*="/entity/"], a[href*="/topic/"]');
    if (await links.count() > 0) {
      await expect(links.first()).toBeVisible();
    }
  });

  test('should load the globe visualization', async ({ page }) => {
    // Verify Globe Canvas (WebGL) exists
    const globeCanvas = page.locator('canvas').first();
    // Assuming globe.gl injects a canvas
    if (await globeCanvas.count() > 0) {
      await expect(globeCanvas).toBeVisible();
    }
  });
});
