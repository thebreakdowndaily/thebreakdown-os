import { test, expect } from '@playwright/test';

test.describe('Homepage Critical Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Basic load check
    await expect(page).toHaveTitle(/The Breakdown/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display navigation and be interactive', async ({ page }) => {
    // Navigation bar should exist
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Contains links to key sections
    await expect(nav.locator('a[href*="/topics"]')).toBeVisible();
    await expect(nav.locator('a[href*="/stories"]')).toBeVisible();
  });

  test('should render the hero section with featured content', async ({ page }) => {
    // Hero section check (assumes an article or main heading)
    const hero = page.locator('main').locator('h1').first();
    await expect(hero).toBeVisible();
  });

  test('should have a functional search input', async ({ page }) => {
    // Check search form exists
    const searchInput = page.locator('input[type="search"]').first();
    await expect(searchInput).toBeVisible();

    // Typing should not crash
    await searchInput.fill('economy');
    await expect(searchInput).toHaveValue('economy');
  });
});
