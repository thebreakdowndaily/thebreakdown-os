/**
 * Canonical publishing dispatcher for the Cloudflare Cron Worker.
 *
 * The application endpoint is the single publication authority. This Worker
 * must never publish directly through database RPCs when the canonical path
 * is unavailable; a failure is safer than bypassing editorial/fact-check gates.
 */

export interface EditorialPublishDispatchResult {
  storyId: string;
  passed: boolean;
  checksCount: number;
  failedChecks: string[];
}

export interface EditorialPublishDispatchSummary {
  timestamp: string;
  totalChecked: number;
  published: number;
  blocked: number;
  results: EditorialPublishDispatchResult[];
}

interface CfEnv {
  APP_URL?: string;
  CRON_SECRET?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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
    base.hash !== ''
  ) {
    throw new Error('Canonical publishing APP_URL must be an HTTPS origin without credentials, path, query, or fragment');
  }

  return new URL('/api/editorial/publish-due', base.origin).toString();
}

function parseSummary(payload: unknown): EditorialPublishDispatchSummary {
  if (!isRecord(payload) || payload.ok !== true) {
    throw new Error('Canonical publishing endpoint returned an invalid response');
  }

  const { timestamp, totalChecked, published, blocked, results } = payload;
  if (
    typeof timestamp !== 'string' ||
    !Number.isFinite(Date.parse(timestamp)) ||
    !Number.isInteger(totalChecked) ||
    !Number.isInteger(published) ||
    !Number.isInteger(blocked) ||
    (totalChecked as number) < 0 ||
    (published as number) < 0 ||
    (blocked as number) < 0 ||
    !Array.isArray(results)
  ) {
    throw new Error('Canonical publishing endpoint returned an invalid summary');
  }

  const normalized: EditorialPublishDispatchResult[] = results.map((item): EditorialPublishDispatchResult => {
    if (
      !isRecord(item) ||
      typeof item.storyId !== 'string' ||
      item.storyId.length === 0 ||
      typeof item.passed !== 'boolean' ||
      !Number.isInteger(item.checksCount) ||
      (item.checksCount as number) < 0 ||
      !Array.isArray(item.failedChecks) ||
      !item.failedChecks.every((name) => typeof name === 'string')
    ) {
      throw new Error('Canonical publishing endpoint returned an invalid story result');
    }

    return {
      storyId: item.storyId,
      passed: item.passed,
      checksCount: item.checksCount as number,
      failedChecks: item.failedChecks as string[],
    };
  });

  const passedCount = normalized.filter((item) => item.passed).length;
  const blockedCount = normalized.length - passedCount;
  if (
    normalized.length !== totalChecked ||
    (published as number) !== passedCount ||
    (blocked as number) !== blockedCount ||
    (published as number) + (blocked as number) !== (totalChecked as number)
  ) {
    throw new Error('Canonical publishing endpoint returned inconsistent result counts');
  }

  return {
    timestamp,
    totalChecked: totalChecked as number,
    published: published as number,
    blocked: blocked as number,
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
