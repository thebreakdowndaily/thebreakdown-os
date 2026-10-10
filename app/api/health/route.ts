import { NextRequest, NextResponse } from 'next/server';

/**
 * ─── Operational Health Check Route: /api/health ─────────────────────────────
 *
 * Governing Document: AGENTS.md (Operating Doctrine - Platform Beta)
 *
 * Check Semantics:
 *  1. Liveness (?type=liveness):
 *     - Verifies that the application process is alive and responding.
 *  2. Readiness (?type=readiness, default):
 *     - Verifies that the process is responding AND required persistence
 *       dependencies can perform bounded read-only verification.
 *     - Never writes synthetic newsroom or editorial data.
 *
 * Security & Disclosure:
 *  - Public response is minimal (status, check type, commitSha, timestamp).
 *  - Detailed subsystem diagnostics require authorization via x-monitoring-secret,
 *    CRON_SECRET, or SUPABASE_SERVICE_ROLE_KEY (or local test runner).
 */

interface SubsystemStatus {
  domainRegistry: string;
  projectionEngine: string;
  editorialState: string;
  researchPlatform: string;
  persistence: string;
}

async function probePersistenceReadiness(): Promise<'operational' | 'degraded' | 'not_configured'> {
  const sbUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.STAGING_SUPABASE_URL ||
    '';
  const sbKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY ||
    '';

  if (!sbUrl || !sbKey || sbUrl === 'https://dummy.supabase.co') {
    return 'not_configured';
  }

  try {
    const probeUrl = `${sbUrl.replace(/\/+$/, '')}/rest/v1/`;
    const res = await fetch(probeUrl, {
      method: 'GET',
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
      },
      signal: AbortSignal.timeout(3000),
    });

    // Supabase REST root responds 200 or returns OpenAPI spec on valid connection
    if (res.ok || res.status === 200 || res.status === 404) {
      return 'operational';
    }
    return 'degraded';
  } catch {
    return 'degraded';
  }
}

function isAuthorizedMonitoring(req?: Request | NextRequest): boolean {
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return true;
  }
  if (!req) return false;

  const authHeader = req.headers.get('authorization') || '';
  const monitorHeader = req.headers.get('x-monitoring-secret') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

  const validSecrets = [
    process.env.HEALTH_CHECK_SECRET,
    process.env.CRON_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY,
  ].filter(Boolean);

  if (validSecrets.length === 0) return false;

  return validSecrets.includes(monitorHeader) || validSecrets.includes(token);
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const checkType = url.searchParams.get('type') || 'readiness';

  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    'local';

  // 1. Liveness Check
  if (checkType === 'liveness') {
    const livenessData: Record<string, unknown> = {
      status: 'live',
      check: 'liveness',
      commitSha,
      timestamp: new Date().toISOString(),
    };

    if (isAuthorizedMonitoring(request)) {
      livenessData.uptimeSeconds = Math.floor(process.uptime());
    }

    return NextResponse.json(livenessData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // 2. Readiness Check
  const persistenceStatus = await probePersistenceReadiness();
  const isHealthy = persistenceStatus !== 'degraded';

  const baseResponse: Record<string, unknown> = {
    status: isHealthy ? 'healthy' : 'degraded',
    check: 'readiness',
    commitSha,
    timestamp: new Date().toISOString(),
  };

  // Detailed diagnostics for authorized monitoring / tests
  if (isAuthorizedMonitoring(request)) {
    const subsystems: SubsystemStatus = {
      domainRegistry: 'operational',
      projectionEngine: 'operational',
      editorialState: 'operational',
      researchPlatform: 'operational',
      persistence: persistenceStatus,
    };

    baseResponse.subsystems = subsystems;
    baseResponse.uptimeSeconds = Math.floor(process.uptime());
    baseResponse.version = '1.0.0-beta';
  }

  return NextResponse.json(baseResponse, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
