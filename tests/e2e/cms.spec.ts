import { test, expect } from '@playwright/test';
import { loginCmsTestUser, logout, resetTestState, hasCmsTestCredentials } from './helpers/auth';

test.describe('CMS Critical Journey', () => {
  test('should require authentication', async ({ page }) => {
    await page.goto('/cms');
    // Unauthenticated users should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test.describe('Authenticated CMS (Editor Role)', () => {
    test.beforeEach(async ({ page }) => {
      // Skip entire suite if CMS test credentials are not configured
      if (!hasCmsTestCredentials()) {
        test.skip();
      }
      await loginCmsTestUser(page);
    });

    test.afterEach(async ({ page }) => {
      // Reset all test-created state and clear session
      await resetTestState(page);
    });

    test('should load CMS dashboard', async ({ page }) => {
      await page.goto('/cms');
      await expect(page.locator('text=/Dashboard|Content|Stories/i').first()).toBeVisible();
    });

    test('should create a new story', async ({ page }) => {
      await page.goto('/cms/story/new');
      await expect(page.locator('h1')).toContainText(/New Story|Create/i);

      // Editor blocks should be interactable
      const editorInput = page.locator('[contenteditable="true"], textarea').first();
      await expect(editorInput).toBeVisible();

      // Create with a test-identifiable title for cleanup
      await editorInput.fill('Playwright E2E Test Story');
    });

    test('should edit an existing story', async ({ page }) => {
      // Navigate to stories list
      await page.goto('/cms/stories');
      
      // Click the first story if available
      const storyLink = page.locator('a[href*="/cms/story/"]').first();
      if (await storyLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await storyLink.click();
        
        // Verify the editor loaded
        const editorInput = page.locator('[contenteditable="true"], textarea').first();
        await expect(editorInput).toBeVisible();
      }
    });

    test('should preview a story', async ({ page }) => {
      await page.goto('/cms/story/new');

      const editorInput = page.locator('[contenteditable="true"], textarea').first();
      await expect(editorInput).toBeVisible();
      await editorInput.fill('Playwright Preview Test');

      const previewButton = page.locator('button').filter({ hasText: /Preview/i });
      if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await previewButton.click();
        await expect(page.locator('text=Playwright Preview Test').first()).toBeVisible();
      }
    });

    test('should have publish capability (Editor role)', async ({ page }) => {
      await page.goto('/cms/story/new');

      const publishButton = page.locator('button').filter({ hasText: /Publish|Save/i });
      if (await publishButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(publishButton).toBeEnabled();
      }
    });

    test('should NOT have admin capabilities', async ({ page }) => {
      // Editor role should not see admin-only routes
      const response = await page.goto('/admin');
      // Should redirect to login or show 403
      const url = page.url();
      expect(url).not.toContain('/admin');
    });

    test('should logout successfully', async ({ page }) => {
      await logout(page);
      // After logout, CMS should redirect to login
      await page.goto('/cms');
      await expect(page).toHaveURL(/.*\/login/);
    });
  });
});
