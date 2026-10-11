import { NextRequest, NextResponse } from 'next/server';

/**
 * ─── Operational Health Check Engine ─────────────────────────────────────────
 *
 * Governing Document: AGENTS.md (Operating Doctrine - Platform Beta)
 *
 * Check Semantics:
 *  1. Liveness (?type=liveness):
 *     - Verifies that the application process is alive and responding.
 *     - Succeeds independently of database or external service availability.
 *  2. Readiness (?type=readiness, default):
 *     - Verifies that the process is responding AND required persistence
 *       dependencies can perform bounded read-only verification.
 *     - Fails closed (503 Service Unavailable, status: 'unhealthy') if persistence
 *       configuration is missing, invalid, or inaccessible.
 *     - Production readiness uses ONLY production configuration.
 *     - Staging readiness uses ONLY staging configuration.
 *     - Cross-environment database connections are strictly rejected.
 *     - Never writes synthetic newsroom or editorial data.
 *     - Requires valid HTTP 200 service-contract response from Supabase REST root (never 404).
 *
 * Subsystems Reporting:
 *  - Distinguishes: verified, degraded, unavailable, not_configured, not_checked.
 *  - Unverified subsystems are reported as 'not_checked', never claimed as 'operational'.
 *
 * Security & Disclosure:
 *  - Public response is minimal (status, check type, commitSha, timestamp).
 *  - Detailed subsystem diagnostics require authorization via x-monitoring-secret,
 *    CRON_SECRET, or SUPABASE_SERVICE_ROLE_KEY (or local test runner).
 */

export type SubsystemHealthState =
  | 'verified'
  | 'degraded'
  | 'unavailable'
  | 'not_configured'
  | 'not_checked';

export interface SubsystemStatus {
  domainRegistry: SubsystemHealthState;
  projectionEngine: SubsystemHealthState;
  editorialState: SubsystemHealthState;
  researchPlatform: SubsystemHealthState;
  persistence: SubsystemHealthState;
}

const KNOWN_PROD_SUPABASE_REF = 'mskyhaunnlwtwvsqcmav';
const KNOWN_STAGING_SUPABASE_REF = 'lvfovvidtowadmnggzzf';

export function isProdSupabaseHost(url?: string): boolean {
  if (!url) return false;
  return url.includes(KNOWN_PROD_SUPABASE_REF) || url.includes(`db.${KNOWN_PROD_SUPABASE_REF}.supabase.co`);
}

export function isStagingSupabaseHost(url?: string): boolean {
  if (!url) return false;
  return url.includes(KNOWN_STAGING_SUPABASE_REF) || url.includes('staging') || url.includes(`db.${KNOWN_STAGING_SUPABASE_REF}.supabase.co`);
}

export function isProductionHost(host?: string): boolean {
  if (!host) return false;
  return host.includes('thebreakdown.in') || host.includes('thebreakdown.org');
}

export function isStagingHost(host?: string): boolean {
  if (!host) return false;
  return host.includes('thebreakdown-os-staging') || host.includes('staging');
}

export type TargetEnvironment = 'production' | 'staging' | 'development' | 'test';

export function resolveEnvironment(req?: Request): TargetEnvironment {
  // 1. Trusted platform deployment configuration ALWAYS takes absolute precedence.
  // External callers must never be able to manipulate environment routing via headers.
  if (process.env.VERCEL_ENV === 'production' || process.env.APP_ENV === 'production') {
    return 'production';
  }
  if (process.env.VERCEL_ENV === 'preview' || process.env.APP_ENV === 'staging') {
    return 'staging';
  }

  // 2. Explicit target environment variables (e.g. CI / build scripts)
  if (process.env.TARGET_ENV === 'production' || process.env.TEST_TARGET_ENV === 'production') {
    return 'production';
  }
  if (process.env.TARGET_ENV === 'staging' || process.env.TEST_TARGET_ENV === 'staging') {
    return 'staging';
  }

  // 3. For local development or unit test requests without platform env vars,
  // inspect ONLY the validated canonical request URL hostname (never untrusted x-forwarded-host).
  if (req) {
    try {
      const url = new URL(req.url);
      const host = url.hostname.toLowerCase();
      if (isStagingHost(host)) return 'staging';
      if (isProductionHost(host)) return 'production';
    } catch {
      // ignore invalid URL
    }
  }

  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return 'test';
  }
  return (process.env.NODE_ENV as TargetEnvironment) || 'development';
}

export async function probePersistenceReadiness(req?: Request): Promise<SubsystemHealthState> {
  const env = resolveEnvironment(req);
  let sbUrl = '';
  let sbKey = '';

  if (env === 'production') {
    // Production readiness must use only production configuration.
    // Cross-environment fallbacks to staging variables are strictly prohibited.
    sbUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!sbUrl || !sbKey || sbUrl === 'https://dummy.supabase.co') {
      return 'not_configured';
    }

    // A staging database cannot satisfy production readiness
    if (isStagingSupabaseHost(sbUrl)) {
      return 'degraded';
    }
  } else if (env === 'staging') {
    // Staging readiness must use only staging configuration.
    // Cross-environment fallbacks to production variables are strictly prohibited.
    sbUrl =
      process.env.STAGING_SUPABASE_URL ||
      (process.env.VERCEL_ENV === 'preview' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '') ||
      '';
    sbKey =
      process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY ||
      (process.env.VERCEL_ENV === 'preview' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') ||
      '';

    if (!sbUrl || !sbKey || sbUrl === 'https://dummy.supabase.co') {
      return 'not_configured';
    }

    // A production database cannot satisfy staging readiness
    if (isProdSupabaseHost(sbUrl)) {
      return 'degraded';
    }
  } else {
    // Test or local development
    sbUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.STAGING_SUPABASE_URL ||
      '';
    sbKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY ||
      '';

    if (!sbUrl || !sbKey || sbUrl === 'https://dummy.supabase.co') {
      return 'not_configured';
    }
  }

  try {
    const probeUrl = `${sbUrl.replace(/\/+$/, '')}/rest/v1/`;
    const res = await fetch(probeUrl, {
      method: 'GET',
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
        Accept: 'application/openapi+json, application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    // Accept only responses that establish the expected dependency health under the actual configured service contract.
    // HTTP 404 does NOT establish dependency health.
    if (res.status === 200) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('json') || contentType.includes('openapi')) {
        return 'verified';
      }
      return 'degraded';
    }

    return 'degraded';
  } catch {
    return 'unavailable';
  }
}

export function isAuthorizedMonitoring(req?: Request | NextRequest): boolean {
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

export async function handleHealthCheck(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const checkType = url.searchParams.get('type') || 'readiness';

  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    'local';

  // 1. Liveness Check: process responsiveness independent of database
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

  // 2. Readiness Check: process responsiveness + verified persistence dependency
  const persistenceStatus = await probePersistenceReadiness(request);
  // Readiness fails closed: MUST be 'verified' to return healthy 200.
  const isHealthy = persistenceStatus === 'verified';

  const baseResponse: Record<string, unknown> = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    check: 'readiness',
    commitSha,
    timestamp: new Date().toISOString(),
  };

  // Detailed diagnostics for authorized monitoring / tests
  if (isAuthorizedMonitoring(request)) {
    const subsystems: SubsystemStatus = {
      domainRegistry: 'not_checked',
      projectionEngine: 'not_checked',
      editorialState: 'not_checked',
      researchPlatform: 'not_checked',
      persistence: persistenceStatus,
    };

    baseResponse.environment = resolveEnvironment(request);
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
