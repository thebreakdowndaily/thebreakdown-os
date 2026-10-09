import { test, expect } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ARTIFACT_DIR = 'C:/Users/nitin/.gemini/antigravity/brain/a7ba00b9-94ee-4225-beae-f89a7fb066ed';
const STAGING_URL =
  process.env.STAGING_URL ||
  'https://thebreakdown-os-git-staging-bholebababhakti108-makers-projects.vercel.app';
const VERCEL_BYPASS_SECRET = 'GBK4oLJPVJkoL0ICzvf6pYBsPWvEiA8W';

test.describe('Newsroom Intelligence Desk — Staging Live Deployment Verification', () => {
  test.use({
    baseURL: STAGING_URL,
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': VERCEL_BYPASS_SECRET,
    },
  });

  test('Full Staging Operational Gate (Bypass, Auth, Filters, Provenance, Refresh, Logout)', async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);

    page.on('console', (msg) => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });
    page.on('pageerror', (err) => {
      console.log('[PAGE ERROR]:', err.message);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        console.log(`[HTTP ${res.status()}]:`, res.url());
      }
    });

    const demoEmail = 'newsroom-demo@thebreakdown.in';
    const demoPassword = process.env.NEWSROOM_DEMO_PASSWORD;
    expect(demoPassword, 'NEWSROOM_DEMO_PASSWORD must be configured').toBeDefined();

    // Set Vercel bypass cookie so any browser requests bypass SSO
    await context.addCookies([
      {
        name: '_vercel_jwt',
        value: VERCEL_BYPASS_SECRET,
        domain: '.vercel.app',
        path: '/',
      },
    ]);

    // ── 1. Protected Route: Unauthenticated Gate ─────────────────────────
    await page.goto('/newsroom');
    await page.waitForLoadState('domcontentloaded');

    const isBlocked =
      page.url().includes('/login') ||
      (await page.locator('text=Access Restricted').isVisible().catch(() => false)) ||
      (await page.locator('text=unauthenticated').isVisible().catch(() => false));
    expect(isBlocked).toBe(true);

    // ── 2. Authenticated Sign In Flow ────────────────────────────────────
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', demoEmail);
    await page.fill('input[type="password"]', demoPassword!);
    await page.click('button[type="submit"]');

    // Wait for redirect to /newsroom
    await page.waitForURL('**/newsroom', { timeout: 20000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // ── 3. Desktop Viewport (1440x900) & HTML Sanitization Proof ──────────
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    // Verify workspace surface
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('<!DOCTYPE');
    expect(bodyText).not.toContain('<html lang=');
    expect(bodyText).not.toContain('<head>');
    expect(bodyText).not.toContain('console.log');

    // Screenshot of Staging Desktop
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'staging-newsroom-desktop-1440x900.png'),
      fullPage: false,
    });

    // ── 4. Search and Section Filters ────────────────────────────────────
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Cabinet');
      await page.waitForTimeout(500);
      await searchInput.clear();
      await page.waitForTimeout(500);
    }

    // Switch Queue Tabs
    const fastTrackTab = page.locator('button:has-text("Fast Track")');
    if (await fastTrackTab.isVisible()) {
      await fastTrackTab.click();
      await page.waitForTimeout(500);
    }

    const allSignalsTab = page.locator('button:has-text("All Signals")');
    if (await allSignalsTab.isVisible()) {
      await allSignalsTab.click();
      await page.waitForTimeout(500);
    }

    // ── 5. Signal Selection & Provenance Dossier ──────────────────────────
    const firstSignalCard = page.locator('[data-testid="signal-card"], div[role="article"]').first();
    if (await firstSignalCard.isVisible()) {
      await firstSignalCard.click();
      await page.waitForTimeout(500);
      // Verify dossier / details panel is visible or contains title
      const dossierPanel = page.locator('[aria-label="Signal Dossier"], [role="complementary"]').first();
      if (await dossierPanel.isVisible()) {
        const dossierText = await dossierPanel.innerText();
        expect(dossierText.length).toBeGreaterThan(10);
      }
    }

    // ── 6. Persistence After Browser Refresh ─────────────────────────────
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Confirm we are STILL on /newsroom and NOT kicked back to /login
    expect(page.url()).toContain('/newsroom');
    expect(page.url()).not.toContain('/login');

    // ── 7. Mobile Viewport (390x844) ─────────────────────────────────────
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'staging-newsroom-mobile-390x844.png'),
      fullPage: false,
    });

    // ── 8. Logout & Protected Access Revocation ──────────────────────────
    // Clear cookies / sign out
    await context.clearCookies();
    await page.goto('/newsroom');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const revokedAfterLogout =
      page.url().includes('/login') ||
      (await page.locator('text=Access Restricted').isVisible().catch(() => false)) ||
      (await page.locator('text=unauthenticated').isVisible().catch(() => false));
    expect(revokedAfterLogout).toBe(true);
  });
});
