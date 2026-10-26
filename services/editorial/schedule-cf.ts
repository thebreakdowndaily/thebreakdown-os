/**
 * Editorial Schedule - Cloudflare Worker variant.
 *
 * The Worker dispatches only to the canonical Next.js publication API.
 * It never writes stories directly or falls back to privileged database RPCs.
 */

export interface CfEnv {
  APP_URL?: string;
  CRON_SECRET?: string;
  /** Only the exact string "false" enables live publication; missing/invalid values stay in preflight. */
  DRY_RUN?: string;
}

/** Compact contract returned by GET /api/editorial/publish-due. */
export interface PublishDispatchSummary {
  storyId: string;
  passed: boolean;
  checksCount: number;
  failedChecks: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPublishDispatchSummary(value: unknown): value is PublishDispatchSummary {
  if (!isRecord(value)) return false;
  return (
    typeof value.storyId === 'string' &&
    typeof value.passed === 'boolean' &&
    typeof value.checksCount === 'number' &&
    Number.isInteger(value.checksCount) &&
    value.checksCount >= 0 &&
    Array.isArray(value.failedChecks) &&
    value.failedChecks.every((check) => typeof check === 'string')
  );
}

/** Accept an HTTPS origin only; never forward CRON_SECRET to an arbitrary URL or path. */
function canonicalPublishEndpoint(appUrl: string, dryRun: boolean): string | null {
  let parsed: URL;
  try {
    parsed = new URL(appUrl);
  } catch {
    return null;
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'thebreakdown.in' ||
    parsed.port !== '' ||
    parsed.username !== '' ||
    parsed.password !== '' ||
    parsed.search !== '' ||
    parsed.hash !== '' ||
    (parsed.pathname !== '' && parsed.pathname !== '/')
  ) {
    return null;
  }

  const path = dryRun
    ? '/api/editorial/publish-due/preflight'
    : '/api/editorial/publish-due';
  return new URL(path, parsed.origin).toString();
}

function failedDispatch(check: string, reason: string): PublishDispatchSummary[] {
  console.error('[Cloudflare Scheduler] Audit Failure: ' + check + ': ' + reason);
  return [{
    storyId: 'unknown',
    passed: false,
    checksCount: 1,
    failedChecks: [check],
  }];
}

/**
 * Dispatch due stories through the canonical publication API.
 * Missing configuration, bad response contracts, network errors and timeouts fail closed.
 */
export async function publishDueStories(
  env: CfEnv,
  _now: Date = new Date(),
): Promise<PublishDispatchSummary[]> {
  // Safe by default: only explicit DRY_RUN="false" enables live publication.
  const dryRun = (env.DRY_RUN || 'true').trim() !== 'false';
  const cronSecret = env.CRON_SECRET || '';
  if (!cronSecret.trim()) {
    return failedDispatch(
      'canonical_cron_secret',
      'CRON_SECRET missing: canonical dispatch cannot be authenticated; publication halted',
    );
  }

  const endpoint = canonicalPublishEndpoint(env.APP_URL || '', dryRun);
  if (!endpoint) {
    return failedDispatch(
      'canonical_app_url',
      'APP_URL must be an HTTPS origin with no credentials, path, query, or fragment; publication halted',
    );
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + cronSecret },
      signal: AbortSignal.timeout(10000),
      redirect: 'error',
    });

    if (!response.ok) {
      return failedDispatch(
        'canonical_dispatch_response',
        'Canonical cron dispatch returned HTTP ' + response.status,
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return failedDispatch(
        'canonical_dispatch_invalid_json',
        'Canonical cron dispatch returned a non-JSON response',
      );
    }

    if (
      !isRecord(body) ||
      body.ok !== true ||
      body.mode !== (dryRun ? 'preflight' : 'live') ||
      body.dryRun !== dryRun ||
      !Array.isArray(body.results) ||
      !body.results.every(isPublishDispatchSummary)
    ) {
      return failedDispatch(
        'canonical_dispatch_response_shape',
        'Canonical endpoint returned an unexpected mode or summary contract; dispatch rejected',
      );
    }

    if (dryRun && body.results.length !== 0) {
      return failedDispatch(
        'canonical_preflight_response_shape',
        'Read-only preflight must return zero story results',
      );
    }

    return body.results;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    const reason = err.name === 'TimeoutError' || err.name === 'AbortError'
      ? 'Canonical cron dispatch timed out (10s)'
      : 'Canonical cron dispatch failed: ' + err.message;
    return failedDispatch('canonical_dispatch_reachability', reason);
  }
}
