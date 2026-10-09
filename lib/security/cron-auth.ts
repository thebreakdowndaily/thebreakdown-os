/**
 * Cron Authentication Gate
 *
 * Edge-compatible and Node-compatible verification of Vercel Cron requests.
 * Conforms to Operating Standard §21.
 *
 * Verification rules:
 * 1. CRON_SECRET must be configured in the environment and non-empty.
 * 2. The incoming request must present an Authorization header matching `Bearer <CRON_SECRET>`.
 * 3. Query string secrets are strictly forbidden to prevent credential leakage in logs.
 *
 * Safe for Edge Runtime: Zero Node-only dependencies.
 */

export function isValidCronRequest(req: { headers: { get(name: string): string | null } }): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return false;
  }

  const authHeader = req.headers.get('authorization')?.trim();
  if (!authHeader) {
    return false;
  }

  return authHeader === `Bearer ${secret}`;
}
