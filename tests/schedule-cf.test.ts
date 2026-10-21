import { afterEach, describe, expect, it, vi } from 'vitest';
import { publishDueStories } from '@/services/editorial/schedule-cf';
import type { PublicationGateResult } from '@/types/editorial-calendar';

const env = {
  APP_URL: 'https://thebreakdown.in',
  CRON_SECRET: 'test-cron-secret',
};

const gateResults: PublicationGateResult[] = [{
  storyId: 'story-uuid',
  scheduleId: 'schedule-uuid',
  passed: false,
  checks: [{ name: 'evidence', passed: false, reason: 'Evidence gate failed.' }],
  checkedAt: '2026-10-22T00:00:00.000Z',
  triggeredBy: 'cron',
}];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Cloudflare publisher RPC boundary', () => {
  it('dispatches to the canonical API and returns full, validated gate results', async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      results: [{ storyId: 'story-uuid', passed: false, checksCount: 1, failedChecks: ['evidence'] }],
      gateResults,
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', request);

    await expect(publishDueStories(env)).resolves.toEqual(gateResults);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith('https://thebreakdown.in/api/editorial/publish-due', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-cron-secret' },
    });
  });

  it('fails closed on canonical API errors and never attempts a database RPC fallback', async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false }), { status: 503 }));
    vi.stubGlobal('fetch', request);

    await expect(publishDueStories(env)).rejects.toThrow(/HTTP 503; refusing any RPC fallback/);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('rejects missing credentials and malformed responses', async () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);

    await expect(publishDueStories({ ...env, CRON_SECRET: '' })).rejects.toThrow(/CRON_SECRET binding are required/);
    expect(request).not.toHaveBeenCalled();

    request.mockResolvedValue(new Response(JSON.stringify({ ok: true, results: [] }), { status: 200 }));
    await expect(publishDueStories(env)).rejects.toThrow(/missing ok=true or gateResults/);
  });
});
