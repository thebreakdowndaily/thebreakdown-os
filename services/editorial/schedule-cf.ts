/**
 * Canonical publishing dispatcher for the Cloudflare Cron Worker.
 *
 * The application endpoint is the single publication authority. This Worker
 * must never publish directly through database RPCs when the canonical path
 * is unavailable; a failure is safer than bypassing editorial/fact-check gates.
 */

export type EditorialPublishOutcome = 'published' | 'already_published' | 'blocked' | 'skipped';

export type PostPublicationErrorCategory =
  | 'POST_PUBLICATION_EFFECTS_FAILED'
  | 'SCHEDULE_STATUS_UPDATE_FAILED'
  | 'AUDIT_LOG_FAILED';

export interface EditorialPublishDispatchResult {
  storyId: string;
  passed: boolean;
  outcome: EditorialPublishOutcome;
  checksCount: number;
  failedChecks: string[];
  postPublicationError?: boolean;
  postPublicationErrorCategory?: PostPublicationErrorCategory;
  correlationId?: string;
}

export interface EditorialPublishDispatchSummary {
  timestamp: string;
  totalChecked: number;
  published: number;
  alreadyPublished: number;
  blocked: number;
  skipped: number;
  results: EditorialPublishDispatchResult[];
}

interface CfEnv {
  APP_URL?: string;
  CRON_SECRET?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const ALLOWED_PUBLISHING_HOSTS = ['thebreakdown.in'] as const;

function canonicalEndpoint(appUrl: string | undefined): string {
  if (!appUrl?.trim()) {
    throw new Error('Canonical publishing APP_URL is not configured');
  }

  let base: URL;
  try {
    base = new URL(appUrl);
  } catch {
    throw new Error('Canonical publishing APP_URL is invalid');
  }

  if (
    base.protocol !== 'https:' ||
    base.username !== '' ||
    base.password !== '' ||
    base.pathname !== '/' ||
    base.search !== '' ||
    base.hash !== '' ||
    base.port !== ''
  ) {
    throw new Error('Canonical publishing APP_URL must be an HTTPS origin without credentials, path, query, or fragment');
  }

  const hostname = base.hostname.toLowerCase();
  const isAllowedHost = (ALLOWED_PUBLISHING_HOSTS as readonly string[]).includes(hostname);
  if (!isAllowedHost) {
    throw new Error(`Canonical publishing APP_URL host "${base.hostname}" is not trusted`);
  }

  return new URL('/api/editorial/publish-due', base.origin).toString();
}

function parseSummary(payload: unknown): EditorialPublishDispatchSummary {
  if (!isRecord(payload) || payload.ok !== true) {
    throw new Error('Canonical publishing endpoint returned an invalid response');
  }

  const { timestamp, totalChecked, published, alreadyPublished, blocked, skipped, results } = payload;
  if (
    typeof timestamp !== 'string' ||
    !Number.isFinite(Date.parse(timestamp)) ||
    !Number.isInteger(totalChecked) ||
    !Number.isInteger(published) ||
    !Number.isInteger(alreadyPublished) ||
    !Number.isInteger(blocked) ||
    !Number.isInteger(skipped) ||
    (totalChecked as number) < 0 ||
    (published as number) < 0 ||
    (alreadyPublished as number) < 0 ||
    (blocked as number) < 0 ||
    (skipped as number) < 0 ||
    !Array.isArray(results)
  ) {
    throw new Error('Canonical publishing endpoint returned an invalid summary');
  }

  const VALID_OUTCOMES = new Set(['published', 'already_published', 'blocked', 'skipped']);
  const VALID_ERROR_CATEGORIES = new Set([
    'POST_PUBLICATION_EFFECTS_FAILED',
    'SCHEDULE_STATUS_UPDATE_FAILED',
    'AUDIT_LOG_FAILED',
  ]);

  const normalized: EditorialPublishDispatchResult[] = results.map((item): EditorialPublishDispatchResult => {
    if (
      !isRecord(item) ||
      typeof item.storyId !== 'string' ||
      item.storyId.length === 0 ||
      typeof item.passed !== 'boolean' ||
      typeof item.outcome !== 'string' ||
      !VALID_OUTCOMES.has(item.outcome) ||
      !Number.isInteger(item.checksCount) ||
      (item.checksCount as number) < 0 ||
      !Array.isArray(item.failedChecks) ||
      !item.failedChecks.every((name) => typeof name === 'string') ||
      (item.postPublicationError !== undefined && typeof item.postPublicationError !== 'boolean') ||
      (item.postPublicationErrorCategory !== undefined &&
        (typeof item.postPublicationErrorCategory !== 'string' || !VALID_ERROR_CATEGORIES.has(item.postPublicationErrorCategory))) ||
      (item.correlationId !== undefined && typeof item.correlationId !== 'string')
    ) {
      throw new Error('Canonical publishing endpoint returned an invalid story result');
    }

    return {
      storyId: item.storyId,
      passed: item.passed,
      outcome: item.outcome as EditorialPublishOutcome,
      checksCount: item.checksCount as number,
      failedChecks: item.failedChecks as string[],
      ...(item.postPublicationError ? { postPublicationError: true } : {}),
      ...(typeof item.postPublicationErrorCategory === 'string'
        ? { postPublicationErrorCategory: item.postPublicationErrorCategory as PostPublicationErrorCategory }
        : {}),
      ...(typeof item.correlationId === 'string' ? { correlationId: item.correlationId } : {}),
    };
  });

  const newlyPublishedCount = normalized.filter((item) => item.outcome === 'published').length;
  const alreadyPublishedCount = normalized.filter((item) => item.outcome === 'already_published').length;
  const blockedCount = normalized.filter((item) => item.outcome === 'blocked').length;
  const skippedCount = normalized.filter((item) => item.outcome === 'skipped').length;

  if (
    normalized.length !== totalChecked ||
    (published as number) !== newlyPublishedCount ||
    (alreadyPublished as number) !== alreadyPublishedCount ||
    (blocked as number) !== blockedCount ||
    (skipped as number) !== skippedCount ||
    (published as number) + (alreadyPublished as number) + (blocked as number) + (skipped as number) !== (totalChecked as number)
  ) {
    throw new Error('Canonical publishing endpoint returned inconsistent result counts');
  }

  return {
    timestamp,
    totalChecked: totalChecked as number,
    published: published as number,
    alreadyPublished: alreadyPublished as number,
    blocked: blocked as number,
    skipped: skipped as number,
    results: normalized,
  };
}

/**
 * Dispatches to the canonical application endpoint and fails closed on every
 * configuration, transport, HTTP, or response-contract failure. There is
 * deliberately no direct database/RPC fallback in this worker.
 */
export async function publishDueStories(
  env: CfEnv,
): Promise<EditorialPublishDispatchSummary> {
  if (!env.CRON_SECRET?.trim()) {
    throw new Error('Canonical publishing CRON_SECRET is not configured');
  }

  const endpoint = canonicalEndpoint(env.APP_URL);
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.CRON_SECRET.trim()}`,
      },
      redirect: 'error',
    });
  } catch {
    throw new Error('Canonical publishing endpoint request failed');
  }

  if (!response.ok) {
    throw new Error(`Canonical publishing endpoint returned HTTP ${response.status}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Canonical publishing endpoint returned invalid JSON');
  }

  return parseSummary(payload);
}
