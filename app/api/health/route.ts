import { handleHealthCheck } from '@/lib/health/checker';

/**
 * ─── Operational Health Check Route: /api/health ─────────────────────────────
 *
 * Governing Document: AGENTS.md (Operating Doctrine - Platform Beta)
 *
 * Route Handler conforming strictly to Next.js App Router route constraints.
 * Core verification logic is encapsulated in `@/lib/health/checker`.
 */

export async function GET(request: Request) {
  return handleHealthCheck(request);
}
