import { test, expect } from '@playwright/test';
import { loginCmsTestUser, hasCmsTestCredentials } from './helpers/auth';

test.describe('Dashboard and Fixes Interactive Sorting', () => {
  test.beforeEach(async ({ page }) => {
    if (!hasCmsTestCredentials()) {
      test.skip();
    }
    await loginCmsTestUser(page);
  });

  test('navigates to dashboard, opens The Fix tab, and tests sorting', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Switch to "The Fix (Solutions)" tab
    await page.locator('button', { hasText: 'The Fix (Solutions)' }).click();

    // Ensure the sorting buttons are visible
    const sortScoreBtn = page.locator('button', { hasText: 'Sort by score' });
    const sortDateBtn = page.locator('button', { hasText: 'Sort by date' });
    const sortPriorityBtn = page.locator('button', { hasText: 'Sort by priority' });

    await expect(sortScoreBtn).toBeVisible();
    await expect(sortDateBtn).toBeVisible();
    await expect(sortPriorityBtn).toBeVisible();

    // Test interactive sorting clicks
    await sortDateBtn.click();
    // Validate the active state style changes
    await expect(sortDateBtn).toHaveCSS('color', 'rgb(0, 0, 0)'); // color becomes #000

    await sortPriorityBtn.click();
    await expect(sortPriorityBtn).toHaveCSS('color', 'rgb(0, 0, 0)');

    await sortScoreBtn.click();
    await expect(sortScoreBtn).toHaveCSS('color', 'rgb(0, 0, 0)');
  });
});
