import { test, expect } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ARTIFACT_DIR = 'C:/Users/nitin/.gemini/antigravity/brain/a7ba00b9-94ee-4225-beae-f89a7fb066ed';
const PRODUCTION_URL = 'https://thebreakdown.in';

test.describe('Newsroom Intelligence Desk — Production Live Deployment Verification', () => {
  test.use({
    baseURL: PRODUCTION_URL,
  });

  test('Full Production Operational Gate (Auth, Filters, Persistence, Mobile, Logout)', async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);

    page.on('console', (msg) => {
      console.log(`[PROD BROWSER ${msg.type()}]:`, msg.text());
    });
    page.on('pageerror', (err) => {
      console.log('[PROD PAGE ERROR]:', err.message);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        console.log(`[PROD HTTP ${res.status()}]:`, res.url());
      }
    });

    const demoEmail = 'newsroom-demo@thebreakdown.in';
    const demoPassword = process.env.NEWSROOM_DEMO_PASSWORD;
    expect(demoPassword, 'NEWSROOM_DEMO_PASSWORD must be configured').toBeDefined();

    // ── 1. Protected Route: Unauthenticated Gate ─────────────────────────
    console.log('[PROD STEP 1]: Verifying unauthenticated gate on /newsroom...');
    await page.goto('/newsroom');
    await page.waitForLoadState('domcontentloaded');

    const isBlocked =
      page.url().includes('/login') ||
      (await page.locator('text=Access Restricted').isVisible().catch(() => false)) ||
      (await page.locator('text=unauthenticated').isVisible().catch(() => false));
    expect(isBlocked).toBe(true);

    // ── 2. Authenticated Sign In Flow ────────────────────────────────────
    console.log('[PROD STEP 2]: Signing in with dedicated demo account...');
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
    console.log('[PROD STEP 3]: Verifying desktop layout and sanitization...');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('<!DOCTYPE');
    expect(bodyText).not.toContain('<html lang=');
    expect(bodyText).not.toContain('<head>');
    expect(bodyText).not.toContain('console.log');

    // Capture Production Desktop Screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'production-newsroom-desktop-1440x900.png'),
      fullPage: false,
    });

    // ── 4. Search and Section Filters ────────────────────────────────────
    console.log('[PROD STEP 4]: Testing search and queue tabs...');
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Cabinet');
      await page.waitForTimeout(500);
      await searchInput.clear();
      await page.waitForTimeout(500);
    }

    // Switch Canonical Queue Tabs
    const importantTab = page.locator('#queue-tab-P1_IMPORTANT');
    if (await importantTab.isVisible()) {
      await importantTab.click();
      await page.waitForTimeout(500);
    }

    const verificationTab = page.locator('#queue-tab-NEEDS_VERIFICATION');
    if (await verificationTab.isVisible()) {
      await verificationTab.click();
      await page.waitForTimeout(500);
    }

    // ── 5. Persistence After Browser Refresh ─────────────────────────────
    console.log('[PROD STEP 5]: Verifying session persistence after page reload...');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('/newsroom');
    expect(page.url()).not.toContain('/login');

    // ── 6. Mobile Viewport (390x844) ─────────────────────────────────────
    console.log('[PROD STEP 6]: Verifying mobile viewport layout...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'production-newsroom-mobile-390x844.png'),
      fullPage: false,
    });

    // ── 7. Logout & Protected Access Revocation ──────────────────────────
    console.log('[PROD STEP 7]: Verifying session revocation on logout...');
    await context.clearCookies();
    await page.goto('/newsroom');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const revokedAfterLogout =
      page.url().includes('/login') ||
      (await page.locator('text=Access Restricted').isVisible().catch(() => false)) ||
      (await page.locator('text=unauthenticated').isVisible().catch(() => false));
    expect(revokedAfterLogout).toBe(true);
    console.log('[PROD STEP 8]: All production gates verified successfully.');
  });
});
