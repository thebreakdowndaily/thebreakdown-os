import { Page, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// CMS Test User Authentication Helpers
//
// Role: Editor (can create, edit, publish; cannot administer)
// Credentials: Environment variables only. Never hardcode.
// Production guard: Rejects known production domains in email.
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTION_EMAIL_PATTERNS = [
  /@thebreakdown\.in$/i,
  /@thebreakdowndaily\.com$/i,
  /admin@/i,
];

/**
 * Validates that the test user is NOT a production account.
 * Throws immediately if a production email pattern is detected.
 */
function assertNotProductionAccount(email: string): void {
  for (const pattern of PRODUCTION_EMAIL_PATTERNS) {
    if (pattern.test(email)) {
      throw new Error(
        `SECURITY: Refusing to use production account "${email}" in tests. ` +
        `Create a dedicated CMS_TEST_USER with Editor role instead.`
      );
    }
  }
}

/**
 * Returns CMS test user credentials from environment variables.
 * Throws if not configured.
 */
function getCmsTestCredentials(): { email: string; password: string } {
  const email = process.env.CMS_TEST_USER_EMAIL;
  const password = process.env.CMS_TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'CMS_TEST_USER_EMAIL and CMS_TEST_USER_PASSWORD must be defined in environment variables. ' +
      'Create a dedicated test user with Editor role (can create, edit, publish; cannot administer).'
    );
  }

  assertNotProductionAccount(email);

  return { email, password };
}

/**
 * Checks whether CMS test credentials are available.
 * Use this to conditionally skip tests when credentials are absent.
 */
export function hasCmsTestCredentials(): boolean {
  return !!(process.env.CMS_TEST_USER_EMAIL && process.env.CMS_TEST_USER_PASSWORD);
}

/**
 * Logs in the CMS test user (Editor role) via the login form.
 * Never uses production accounts.
 */
export async function loginCmsTestUser(page: Page): Promise<void> {
  const { email, password } = getCmsTestCredentials();

  await page.goto('/login');

  // Fill the login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for navigation to a protected route
  await page.waitForURL(/\/(dashboard|cms)/, { timeout: 15000 });
}

/**
 * Logs out the current user.
 */
export async function logout(page: Page): Promise<void> {
  // Navigate to a known route and trigger logout
  const logoutButton = page.locator('button, a').filter({ hasText: /log\s*out|sign\s*out/i }).first();
  
  if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL(/\/(login)?$/, { timeout: 10000 });
  } else {
    // Fallback: clear cookies to force logout
    await page.context().clearCookies();
    await page.goto('/');
  }
}

/**
 * Cleans up any test-created content after test execution.
 * 
 * Strategy: Delete stories created by the test user during this test run.
 * Uses the Supabase REST API with the service role key (available in CI only).
 * Falls back to a no-op if the service role key is unavailable.
 */
export async function resetTestState(page: Page): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const testEmail = process.env.CMS_TEST_USER_EMAIL;

  // If we don't have the service role key, we can't clean up server-side.
  // This is acceptable in local dev — CI should always have it.
  if (!supabaseUrl || !serviceRoleKey || !testEmail) {
    return;
  }

  try {
    // Delete any stories created by the test user with test-identifiable titles
    await fetch(`${supabaseUrl}/rest/v1/stories?title=ilike.Playwright*&author_email=eq.${testEmail}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
    });
  } catch {
    // Silently ignore cleanup failures to avoid masking real test failures.
    // The test user has Editor role, so leftover test content is harmless.
  }

  // Clear browser state for a clean next test
  await page.context().clearCookies();
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy compat: re-export `login` for non-CMS tests that still use the
// generic TEST_USER_EMAIL / TEST_USER_PASSWORD pattern.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use loginCmsTestUser for CMS tests.
 * Generic login using TEST_USER_EMAIL / TEST_USER_PASSWORD.
 */
export async function login(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be defined in environment variables');
  }

  assertNotProductionAccount(email);

  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|cms)/);
}
