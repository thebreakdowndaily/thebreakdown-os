import { test, expect } from '@playwright/test';

const viewports = [
  // Desktop
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  // Tablet
  { width: 1024, height: 1366 },
  { width: 768, height: 1024 },
  // Mobile
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
  { width: 360, height: 800 },
  { width: 320, height: 568 },
];

test.describe('Responsive Layout Verification', () => {
  const routesToTest = ['/', '/story/mgnrega-reform'];

  for (const route of routesToTest) {
    test.describe(`Route: ${route}`, () => {
      for (const vp of viewports) {
        test(`should not overflow or clip on ${vp.width}x${vp.height}`, async ({ page }) => {
          await page.setViewportSize(vp);
          await page.goto(route);
          
          // Wait for hydration and basic render
          await page.waitForLoadState('networkidle');

          // Check if document width exceeds viewport width (horizontal scroll / overflow)
          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
          
          expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 buffer for pixel rounding
        });
      }
    });
  }
});
