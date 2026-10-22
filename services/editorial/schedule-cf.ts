/**
 * Editorial Schedule — thin Cloudflare trigger for the canonical publication API.
 *
 * All authorization, evidence validation, approval, idempotency, and audit
 * decisions must be made by /api/editorial/publish-due. This Worker retries
 * dispatch failures with bounded backoff and never publishes via a weaker DB
 * RPC fallback.
 */

export interface CanonicalDispatchResult {
  storyId: string;
  passed: boolean;
  checksCount: number;
  failedChecks: string[];
}

interface CfEnv {
  APP_URL: string;
  CRON_SECRET: string;
}

interface CanonicalDispatchPayload {
  ok?: boolean;
  results?: unknown;
}

const MAX_DISPATCH_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 250;
const ALLOWED_CANONICAL_HOSTS = ['thebreakdown.in'] as const;

function canonicalPublishingEndpoint(appUrl: string): string {
  let base: URL;
  try {
    base = new URL(appUrl);
  } catch {
    throw new Error('Canonical publication dispatch requires a valid APP_URL.');
  }

  if (
    base.protocol !== 'https:' ||
    base.username !== '' ||
    base.password !== '' ||
    base.pathname !== '/' ||
    base.search !== '' ||
    base.hash !== '' ||
    base.port !== '' ||
    !(ALLOWED_CANONICAL_HOSTS as readonly string[]).includes(base.hostname.toLowerCase())
  ) {
    throw new Error('Canonical publication dispatch requires the approved HTTPS origin.');
  }

  return new URL('/api/editorial/publish-due', base.origin).toString();
}

function isDispatchResult(value: unknown): value is CanonicalDispatchResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<CanonicalDispatchResult>;
  return (
    typeof result.storyId === 'string' &&
    typeof result.passed === 'boolean' &&
    Number.isInteger(result.checksCount) &&
    (result.checksCount as number) >= 0 &&
    Array.isArray(result.failedChecks) &&
    result.failedChecks.every((name) => typeof name === 'string')
  );
}

export async function publishDueStories(
  env: CfEnv,
  _now: Date = new Date(),
): Promise<CanonicalDispatchResult[]> {
  if (!env.APP_URL?.trim()) {
    throw new Error('Canonical publication dispatch requires APP_URL.');
  }
  if (!env.CRON_SECRET?.trim()) {
    throw new Error('Canonical publication dispatch requires CRON_SECRET.');
  }

  const endpoint = canonicalPublishingEndpoint(env.APP_URL);

  let lastStatus: number | undefined;
  let lastErrorName: string | undefined;

  for (let attempt = 1; attempt <= MAX_DISPATCH_ATTEMPTS; attempt += 1) {
    let attemptStatus: number | undefined;
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET.trim()}`,
        },
        redirect: 'error',
      });
      attemptStatus = response.status;

      if (!response.ok) {
        throw new Error(`Canonical publication API returned HTTP ${response.status}.`);
      }

      const body = (await response.json()) as CanonicalDispatchPayload;
      if (body?.ok !== true || !Array.isArray(body.results) || !body.results.every(isDispatchResult)) {
        throw new Error('Canonical publication API returned an invalid response contract.');
      }

      return body.results;
    } catch (error) {
      lastStatus = attemptStatus;
      lastErrorName = error instanceof Error ? error.name : 'UnknownError';
      console.error(JSON.stringify({
        event: 'editorial.publish_due.dispatch_attempt_failed',
        severity: attempt === MAX_DISPATCH_ATTEMPTS ? 'P1' : 'warning',
        attempt,
        maxAttempts: MAX_DISPATCH_ATTEMPTS,
        httpStatus: lastStatus,
        errorType: lastErrorName,
      }));

      if (attempt < MAX_DISPATCH_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1)),
        );
      }
    }
  }

  console.error(JSON.stringify({
    event: 'editorial.publish_due.canonical_dispatch_exhausted',
    severity: 'P1',
    attempts: MAX_DISPATCH_ATTEMPTS,
    httpStatus: lastStatus,
    errorType: lastErrorName ?? 'UnknownError',
    fallbackExecuted: false,
  }));

  throw new Error(
    `Canonical publication dispatch failed after ${MAX_DISPATCH_ATTEMPTS} attempts; no fallback publication path was executed.`,
  );
}
