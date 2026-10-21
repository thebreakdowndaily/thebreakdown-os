/**
 * Editorial Schedule - Cloudflare Worker dispatcher.
 *
 * Publication authority lives in the central Next.js endpoint. The Worker
 * must never publish directly through privileged database RPCs: if the
 * authenticated canonical endpoint is unavailable, fail closed and alert.
 */

import type { PublicationGateResult } from '@/types/editorial-calendar';

interface CfEnv {
  APP_URL: string;
  CRON_SECRET: string;
}

function isPublicationGateResult(value: unknown): value is PublicationGateResult {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  if (
    typeof row.storyId !== 'string' ||
    typeof row.passed !== 'boolean' ||
    typeof row.checkedAt !== 'string' ||
    !['cron', 'manual', 'fallback'].includes(String(row.triggeredBy)) ||
    !Array.isArray(row.checks)
  ) return false;

  return row.checks.every((check) => {
    if (!check || typeof check !== 'object') return false;
    const item = check as Record<string, unknown>;
    return typeof item.name === 'string' && typeof item.passed === 'boolean' && typeof item.reason === 'string';
  });
}

/**
 * Dispatch the hourly cron to the single publication authority.
 *
 * The API response includes full gate results separately from its compact
 * summary so callers can validate the contract and log failed checks. No
 * direct Supabase credential or RPC fallback exists in this Worker.
 */
export async function publishDueStories(env: CfEnv): Promise<PublicationGateResult[]> {
  const appUrl = env.APP_URL?.trim();
  const cronSecret = env.CRON_SECRET;

  if (!appUrl || !cronSecret) {
    throw new Error('[Cloudflare Scheduler] APP_URL and the CRON_SECRET binding are required.');
  }

  let endpoint: URL;
  try {
    endpoint = new URL('/api/editorial/publish-due', appUrl);
  } catch {
    throw new Error('[Cloudflare Scheduler] APP_URL must be a valid absolute URL.');
  }
  if (endpoint.protocol !== 'https:') {
    throw new Error('[Cloudflare Scheduler] The canonical publication endpoint must use HTTPS.');
  }

  let response: Response;
  try {
    response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'network error';
    throw new Error(`[Cloudflare Scheduler] Canonical publication dispatch failed: ${detail}`);
  }

  if (!response.ok) {
    throw new Error(`[Cloudflare Scheduler] Canonical publication endpoint returned HTTP ${response.status}; refusing any RPC fallback.`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error('[Cloudflare Scheduler] Canonical publication endpoint returned invalid JSON.');
  }

  if (!body || typeof body !== 'object') {
    throw new Error('[Cloudflare Scheduler] Canonical publication response has an invalid shape.');
  }

  const result = body as Record<string, unknown>;
  if (result.ok !== true || !Array.isArray(result.gateResults)) {
    throw new Error('[Cloudflare Scheduler] Canonical publication response is missing ok=true or gateResults.');
  }

  if (!result.gateResults.every(isPublicationGateResult)) {
    throw new Error('[Cloudflare Scheduler] Canonical publication response contains malformed gate results.');
  }

  return result.gateResults;
}
