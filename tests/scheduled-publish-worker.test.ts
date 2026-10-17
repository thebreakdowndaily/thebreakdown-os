import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALLOWED_PUBLISHING_HOSTS, publishDueStories } from '@/services/editorial/schedule-cf';
import worker from '@/workers/scheduled-publish/index';
import { GET as publishDueRoute } from '@/app/api/editorial/publish-due/route';
import { NextRequest } from 'next/server';
import { validateAndPublishDueStories } from '@/services/editorial/schedule';

vi.mock('@/services/editorial/schedule', () => ({
  validateAndPublishDueStories: vi.fn(),
}));

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

  it('fails closed if APP_URL is missing, empty, or whitespace and makes no request', async () => {
    await expect(publishDueStories({ CRON_SECRET: env.CRON_SECRET })).rejects.toThrow(/APP_URL is not configured/);
    expect(fetchMock).not.toHaveBeenCalled();

    await expect(publishDueStories({ APP_URL: '', CRON_SECRET: env.CRON_SECRET })).rejects.toThrow(/APP_URL is not configured/);
    expect(fetchMock).not.toHaveBeenCalled();

    await expect(publishDueStories({ APP_URL: '   ', CRON_SECRET: env.CRON_SECRET })).rejects.toThrow(/APP_URL is not configured/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    'http://thebreakdown.in',
    'https://thebreakdown.in/unexpected-path',
    'https://user:password@thebreakdown.in',
    'https://thebreakdown.in?redirect=elsewhere',
    'https://thebreakdown.in#fragment',
    'https://thebreakdown.in:8443',
  ])('rejects unsafe APP_URL values (%s) without making a request', async (APP_URL) => {
    await expect(publishDueStories({ APP_URL, CRON_SECRET: env.CRON_SECRET })).rejects.toThrow(/HTTPS origin/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    'https://attacker.example.com',
    'https://staging.thebreakdown.in',
    'https://evil-thebreakdown.in',
    'https://notthebreakdown.in',
  ])('rejects untrusted HTTPS host (%s) without making a request', async (untrustedUrl) => {
    await expect(publishDueStories({ APP_URL: untrustedUrl, CRON_SECRET: env.CRON_SECRET })).rejects.toThrow(/not trusted/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts configured trusted host www.thebreakdown.in and dispatches GET request', async () => {
    expect(ALLOWED_PUBLISHING_HOSTS).toContain('www.thebreakdown.in');
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      ok: true,
      timestamp: '2026-10-17T00:00:00.000Z',
      totalChecked: 0,
      published: 0,
      blocked: 0,
      results: [],
    }), { status: 200 }));

    await expect(publishDueStories({ APP_URL: 'https://www.thebreakdown.in', CRON_SECRET: env.CRON_SECRET })).resolves.toBeDefined();
    expect(fetchMock).toHaveBeenCalledWith('https://www.thebreakdown.in/api/editorial/publish-due', expect.objectContaining({
      method: 'GET',
      headers: { Authorization: 'Bearer test-cron-secret' },
    }));
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

describe('canonical publishing route GET /api/editorial/publish-due', () => {
  const ROUTE_SECRET = 'route-test-cron-secret-token-42';
  const originalEnvSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = ROUTE_SECRET;
    vi.mocked(validateAndPublishDueStories).mockReset();
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalEnvSecret;
  });

  it('fails closed with HTTP 500 when server CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;
    const req = new NextRequest('https://thebreakdown.in/api/editorial/publish-due', {
      headers: { authorization: `Bearer ${ROUTE_SECRET}` },
    });

    const res = await publishDueRoute(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: 'Server misconfiguration: CRON_SECRET not set' });
    expect(validateAndPublishDueStories).not.toHaveBeenCalled();
  });

  it.each([
    ['missing authorization header', {}],
    ['wrong secret', { authorization: 'Bearer wrong-secret' }],
    ['wrong scheme', { authorization: `Basic ${ROUTE_SECRET}` }],
    ['malformed header', { authorization: ROUTE_SECRET }],
  ])('rejects unauthorized requests with HTTP 401 (%s) without executing publishing', async (_label, headers) => {
    const req = new NextRequest('https://thebreakdown.in/api/editorial/publish-due', { headers });

    const res = await publishDueRoute(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
    expect(validateAndPublishDueStories).not.toHaveBeenCalled();
  });

  it('rejects query parameter secrets without executing publishing', async () => {
    const req = new NextRequest(`https://thebreakdown.in/api/editorial/publish-due?secret=${ROUTE_SECRET}`);

    const res = await publishDueRoute(req);
    expect(res.status).toBe(401);
    expect(validateAndPublishDueStories).not.toHaveBeenCalled();
  });

  it('returns valid canonical response contract when queue has zero due stories', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([]);
    const req = new NextRequest('https://thebreakdown.in/api/editorial/publish-due', {
      headers: { authorization: `Bearer ${ROUTE_SECRET}` },
    });

    const res = await publishDueRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      ok: true,
      totalChecked: 0,
      published: 0,
      blocked: 0,
      results: [],
    });
    expect(typeof body.timestamp).toBe('string');
    expect(validateAndPublishDueStories).toHaveBeenCalledTimes(1);
  });

  it('preserves failed editorial/fact-check/evidence gates and never converts blocked stories to passed', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-passed-checks',
        passed: true,
        checks: [
          { name: 'editorial_approval', passed: true },
          { name: 'fact_check', passed: true },
          { name: 'evidence_vault', passed: true },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-blocked-fact-check',
        passed: false,
        checks: [
          { name: 'editorial_approval', passed: true },
          { name: 'fact_check', passed: false, reason: 'Pending senior fact check' },
          { name: 'evidence_vault', passed: false, reason: 'Source hash missing' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
    ]);

    const req = new NextRequest('https://thebreakdown.in/api/editorial/publish-due', {
      headers: { authorization: `Bearer ${ROUTE_SECRET}` },
    });

    const res = await publishDueRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.ok).toBe(true);
    expect(body.totalChecked).toBe(2);
    expect(body.published).toBe(1);
    expect(body.blocked).toBe(1);
    expect(body.results).toHaveLength(2);

    const blockedItem = body.results.find((r: { storyId: string }) => r.storyId === 'story-blocked-fact-check');
    expect(blockedItem.passed).toBe(false);
    expect(blockedItem.checksCount).toBe(3);
    expect(blockedItem.failedChecks).toEqual(['fact_check', 'evidence_vault']);
  });

  it('catches and returns safe HTTP 500 when publishing service throws an error', async () => {
    vi.mocked(validateAndPublishDueStories).mockRejectedValue(new Error('PostgreSQL connection timeout'));
    const req = new NextRequest('https://thebreakdown.in/api/editorial/publish-due', {
      headers: { authorization: `Bearer ${ROUTE_SECRET}` },
    });

    const res = await publishDueRoute(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe('PostgreSQL connection timeout');
    expect(typeof body.timestamp).toBe('string');
  });
});
