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

    // RC-1 editorial nav: Chapters / Explainers / Topics / Data / About
    await expect(nav.locator('a[href="/series"]')).toBeVisible();
    await expect(nav.locator('a[href="/fix"]')).toBeVisible();
    await expect(nav.locator('a[href="/topics"]')).toBeVisible();
    await expect(nav.locator('a[href="/data"]')).toBeVisible();
    await expect(nav.locator('a[href="/about"]')).toBeVisible();
  });

  test('should render the hero section with featured content', async ({ page }) => {
    // Hero section check (assumes an article or main heading)
    const hero = page.locator('main').locator('h1').first();
    await expect(hero).toBeVisible();
  });

  test('should have a functional search input', async ({ page }) => {
    // RC-1 search opens a ⌘K dialog — trigger it from the header button
    const searchButton = page.locator('button[aria-label^="Search"]').first();
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // The dialog input must be visible and focusable
    const searchInput = page.locator('input[aria-label="Search input"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('economy');
    await expect(searchInput).toHaveValue('economy');
  });
});
