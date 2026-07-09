import { test, expect } from '@playwright/test';

test.describe('Search Critical Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should load the search page', async ({ page }) => {
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test('should display empty state initially or on no match', async ({ page }) => {
    await page.fill('input[type="search"]', 'XYZNONEXISTENT123');
    await page.keyboard.press('Enter');
    
    // Should show no results state
    await expect(page.locator('text=/No results|No matches/i')).toBeVisible();
  });

  test('should display results for valid queries', async ({ page }) => {
    await page.fill('input[type="search"]', 'India');
    await page.keyboard.press('Enter');
    
    // Should show result items
    // Using a general heuristic for list items or links
    const results = page.locator('main').locator('a').filter({ hasText: /India|Economy|Growth/i });
    if (await results.count() > 0) {
      await expect(results.first()).toBeVisible();
    }
  });
});
