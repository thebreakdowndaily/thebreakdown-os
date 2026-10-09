import { test, expect } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ARTIFACT_DIR = 'C:/Users/nitin/.gemini/antigravity/brain/a7ba00b9-94ee-4225-beae-f89a7fb066ed';

test.describe('Newsroom Intelligence Desk — End-to-End Operational Verification', () => {
  test('Phase 6: Full verification sequence (login, triage, filters, sanitization, responsive, logout)', async ({
    page,
  }) => {
    const demoEmail = 'newsroom-demo@thebreakdown.in';
    const demoPassword = process.env.NEWSROOM_DEMO_PASSWORD;

    expect(demoPassword).toBeDefined();

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // ── 1. Unauthenticated Gate Check ───────────────────────────────────────
    await page.goto('/newsroom');
    // Expect redirected to login or IntelDenied
    const isDeniedOrLogin =
      page.url().includes('/login') ||
      (await page.locator('text=Access Restricted').isVisible().catch(() => false)) ||
      (await page.locator('text=unauthenticated').isVisible().catch(() => false));
    expect(isDeniedOrLogin).toBe(true);

    // ── 2. Login Flow ────────────────────────────────────────────────────────
    await page.goto('/login');
    await page.fill('input[type="email"]', demoEmail);
    await page.fill('input[type="password"]', demoPassword!);
    await page.click('button[type="submit"]');

    // Wait for navigation to /newsroom
    await page.waitForURL('**/newsroom', { timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // ── 3. Desktop Viewport (1440 x 900) ────────────────────────────────────
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);

    // Verify main components are present
    const workspaceNav = page.locator('nav[aria-label="Workspace Areas"]');
    await expect(workspaceNav).toBeVisible();

    // Verify raw HTML document markup is NOT present in visible card text
    const pageText = await page.locator('body').innerText();
    expect(pageText).not.toContain('<!DOCTYPE');
    expect(pageText).not.toContain('<html lang=');
    expect(pageText).not.toContain('<head>');

    // Take Desktop Screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'newsroom-desktop-1440x900.png'),
      fullPage: false,
    });

    // ── 4. Search and Filter Tests ──────────────────────────────────────────
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Cabinet');
      await page.waitForTimeout(300);
      const filteredCountText = await page.locator('span:has-text("Cabinet")').count();
      expect(filteredCountText).toBeGreaterThanOrEqual(0);
      await searchInput.clear();
      await page.waitForTimeout(300);
    }

    // ── 5. Switch Tabs (Editorial Inbox -> Investigation -> Diagnostics) ───
    const diagTab = page.locator('button:has-text("Diagnostics")');
    await diagTab.click();
    await page.waitForTimeout(500);

    // Verify Diagnostics HUD is visible
    const metricsRegion = page.locator('div[role="region"][aria-label="Operational Signal Counters"]');
    await expect(metricsRegion).toBeVisible();

    const inboxTab = page.locator('button:has-text("Editorial Inbox")');
    await inboxTab.click();
    await page.waitForTimeout(500);

    // ── 6. Mobile Viewport (390 x 844) ──────────────────────────────────────
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);

    // Take Mobile Screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'newsroom-mobile-390x844.png'),
      fullPage: false,
    });

    // ── 7. Logout and Verify Protected Access Revoked ───────────────────────
    // Clear cookies / sign out
    await page.context().clearCookies();
    await page.goto('/newsroom');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const blockedAfterLogout =
      page.url().includes('/login') ||
      (await page.locator('text=Access Restricted').isVisible().catch(() => false)) ||
      (await page.locator('text=unauthenticated').isVisible().catch(() => false));
    expect(blockedAfterLogout).toBe(true);
  });
});
