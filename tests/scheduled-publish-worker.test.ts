import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { publishDueStories } from '@/services/editorial/schedule-cf';
import worker from '@/workers/scheduled-publish/index';

const endpoint = 'https://thebreakdown.in/api/editorial/publish-due';
const env = { APP_URL: 'https://thebreakdown.in', CRON_SECRET: 'test-cron-secret' };

const summary = {
  ok: true,
  timestamp: '2026-10-17T00:00:00.000Z',
  totalChecked: 2,
  published: 1,
  blocked: 1,
  results: [
    { storyId: 'story-approved', passed: true, checksCount: 13, failedChecks: [] },
    { storyId: 'story-blocked', passed: false, checksCount: 13, failedChecks: ['fact_check'] },
  ],
};

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('scheduled publishing canonical dispatch', () => {
  it('dispatches to the HTTPS canonical endpoint and validates its result contract', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(summary), { status: 200 }));

    await expect(publishDueStories(env)).resolves.toEqual({
      timestamp: summary.timestamp,
      totalChecked: 2,
      published: 1,
      blocked: 1,
      results: [
        { storyId: 'story-approved', passed: true, checksCount: 13, failedChecks: [] },
        { storyId: 'story-blocked', passed: false, checksCount: 13, failedChecks: ['fact_check'] },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(endpoint, expect.objectContaining({
      method: 'GET',
      headers: { Authorization: 'Bearer test-cron-secret' },
      redirect: 'error',
    }));
  });

  it('fails closed if the cron secret is missing and makes no request', async () => {
    await expect(publishDueStories({ APP_URL: env.APP_URL })).rejects.toThrow(/CRON_SECRET/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    'http://thebreakdown.in',
    'https://thebreakdown.in/unexpected-path',
    'https://user:password@thebreakdown.in',
    'https://thebreakdown.in?redirect=elsewhere',
  ])('rejects unsafe APP_URL values (%s) without making a request', async (APP_URL) => {
    await expect(publishDueStories({ APP_URL, CRON_SECRET: env.CRON_SECRET })).rejects.toThrow(/HTTPS origin/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed on network errors rather than using a database fallback', async () => {
    fetchMock.mockRejectedValue(new Error('network unavailable'));

    await expect(publishDueStories(env)).rejects.toThrow(/request failed/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fails closed on non-2xx canonical responses', async () => {
    fetchMock.mockResolvedValue(new Response('unavailable', { status: 503 }));

    await expect(publishDueStories(env)).rejects.toThrow(/HTTP 503/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the endpoint redirects unexpectedly', async () => {
    fetchMock.mockRejectedValue(new TypeError('redirect mode is set to error: unexpected redirect to /login'));

    await expect(publishDueStories(env)).rejects.toThrow(/request failed/);
    expect(fetchMock).toHaveBeenCalledWith(endpoint, expect.objectContaining({ redirect: 'error' }));
  });

  it('accepts and summarizes a valid canonical response with zero due stories', async () => {
    const emptySummary = {
      ok: true,
      timestamp: '2026-10-17T00:00:00.000Z',
      totalChecked: 0,
      published: 0,
      blocked: 0,
      results: [],
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(emptySummary), { status: 200 }));

    await expect(publishDueStories(env)).resolves.toEqual({
      timestamp: emptySummary.timestamp,
      totalChecked: 0,
      published: 0,
      blocked: 0,
      results: [],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects an endpoint payload where ok is false', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 200 }));

    await expect(publishDueStories(env)).rejects.toThrow(/invalid response/);
  });

  it('preserves failed editorial/fact-check gates and never coerces blocked stories to passed', async () => {
    const blockedOnly = {
      ok: true,
      timestamp: '2026-10-17T00:00:00.000Z',
      totalChecked: 1,
      published: 0,
      blocked: 1,
      results: [
        { storyId: 'story-failed-fact-check', passed: false, checksCount: 13, failedChecks: ['fact_check', 'evidence_vault'] },
      ],
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(blockedOnly), { status: 200 }));

    const res = await publishDueStories(env);
    expect(res.published).toBe(0);
    expect(res.blocked).toBe(1);
    expect(res.results[0].passed).toBe(false);
    expect(res.results[0].failedChecks).toEqual(['fact_check', 'evidence_vault']);
  });

  it('rejects invalid JSON and malformed result shapes', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not-json', { status: 200 }));
    await expect(publishDueStories(env)).rejects.toThrow(/invalid JSON/);

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      ...summary,
      results: [{ storyId: 'story-1', passed: true, checks: [] }],
    }), { status: 200 }));
    await expect(publishDueStories(env)).rejects.toThrow(/invalid story result/);
  });

  it('rejects summary counters inconsistent with the story results', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ...summary, published: 2 }), { status: 200 }));

    await expect(publishDueStories(env)).rejects.toThrow(/inconsistent result counts/);
  });

  it('ensures worker scheduled handler logs and re-throws dispatch errors for platform telemetry', async () => {
    fetchMock.mockRejectedValue(new Error('network connection reset'));
    const controller = { cron: '0 * * * *', scheduledTime: Date.now() };
    const ctx = { waitUntil: vi.fn(), passThroughOnException: vi.fn() };

    await expect(worker.scheduled(controller, env as never, ctx as never)).rejects.toThrow(/request failed/);
  });
});
