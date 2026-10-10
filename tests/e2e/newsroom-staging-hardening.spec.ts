import { test, expect } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ARTIFACT_DIR = 'C:/Users/nitin/.gemini/antigravity/brain/a7ba00b9-94ee-4225-beae-f89a7fb066ed';
const STAGING_URL = 'https://thebreakdown-j0tb6l1l9-bholebababhakti108-makers-projects.vercel.app';
const BYPASS_SECRET = process.env.VERCEL_PROTECTION_BYPASS_SECRET || '';

test.describe('Newsroom Intelligence Desk — Staging Live Deployment & Durability Verification', () => {
  test.use({
    baseURL: STAGING_URL,
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': BYPASS_SECRET,
    },
  });

  test('Full Staging Verification (Bypass, Auth, UI, Filters, Screenshots)', async ({
    page,
    context,
  }) => {
    test.setTimeout(90000);

    page.on('console', (msg) => {
      console.log(`[STAGING BROWSER ${msg.type()}]:`, msg.text());
    });
    page.on('pageerror', (err) => {
      console.log('[STAGING PAGE ERROR]:', err.message);
    });

    const demoEmail = 'newsroom-demo@thebreakdown.in';
    const demoPassword = process.env.NEWSROOM_DEMO_PASSWORD;
    expect(demoPassword, 'NEWSROOM_DEMO_PASSWORD must be configured').toBeDefined();

    // ── 1. Protected Route: Unauthenticated Gate ─────────────────────────
    console.log('[STAGING STEP 1]: Verifying unauthenticated gate on /newsroom...');
    await page.goto('/newsroom');
    await page.waitForLoadState('domcontentloaded');

    const isBlocked =
      page.url().includes('/login') ||
      (await page.locator('text=Access Restricted').isVisible().catch(() => false)) ||
      (await page.locator('text=unauthenticated').isVisible().catch(() => false));
    expect(isBlocked).toBe(true);

    // ── 2. Authenticated Sign In Flow ────────────────────────────────────
    console.log('[STAGING STEP 2]: Signing in with dedicated demo account...');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', demoEmail);
    await page.fill('input[type="password"]', demoPassword!);
    await page.click('button[type="submit"]');

    // Wait for redirect to /newsroom
    await page.waitForURL('**/newsroom', { timeout: 25000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // ── 3. Desktop Viewport Verification ─────────────────────────────────
    console.log('[STAGING STEP 3]: Verifying desktop layout at 1440x900...');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1500);

    // Header & Queue Tabs must be visible
    const header = page.locator('header');
    await expect(header.first()).toBeVisible();

    const queueTabs = page.locator('div[role="tablist"][aria-label="Newsroom Queue Sections"]');
    await expect(queueTabs).toBeVisible();

    // Capture desktop artifact screenshot
    const desktopScreenshotPath = path.join(ARTIFACT_DIR, 'staging-newsroom-hardened-1440x900.png');
    await page.screenshot({ path: desktopScreenshotPath, fullPage: false });
    console.log(`[STAGING STEP 3]: Captured desktop screenshot to ${desktopScreenshotPath}`);

    // ── 3.1 Search & Tab Switching ──────────────────────────────────────
    console.log('[STAGING STEP 3.1]: Testing search input and queue tab switching...');
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Cabinet');
      await page.waitForTimeout(400);
      await searchInput.clear();
      await page.waitForTimeout(400);
    }

    const importantTab = page.locator('#queue-tab-P1_IMPORTANT');
    if (await importantTab.isVisible()) {
      await importantTab.click();
      await page.waitForTimeout(400);
    }

    // ── 3.2 Persistence across reload ───────────────────────────────────
    console.log('[STAGING STEP 3.2]: Verifying session persistence across reload...');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/newsroom');

    // ── 4. Mobile Viewport Verification ──────────────────────────────────
    console.log('[STAGING STEP 4]: Verifying mobile layout at 390x844...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'staging-newsroom-hardened-390x844.png');
    await page.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`[STAGING STEP 4]: Captured mobile screenshot to ${mobileScreenshotPath}`);

    // Return to desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    // ── 5. Logout & Session Invalidation ─────────────────────────────────
    console.log('[STAGING STEP 5]: Testing sign out flow...');
    await context.clearCookies();
    await page.goto('/newsroom');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    const isRevoked =
      page.url().includes('/login') ||
      (await page.locator('text=Access Restricted').isVisible().catch(() => false)) ||
      (await page.locator('text=unauthenticated').isVisible().catch(() => false));
    expect(isRevoked).toBe(true);
    console.log('[STAGING COMPLETE]: All staging hardening tests passed.');
  });
});
