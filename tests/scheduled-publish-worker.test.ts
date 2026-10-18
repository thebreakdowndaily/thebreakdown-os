import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALLOWED_PUBLISHING_HOSTS, publishDueStories } from '@/services/editorial/schedule-cf';
import worker from '@/workers/scheduled-publish/index';
import { GET as publishDueRoute } from '@/app/api/editorial/publish-due/route';
import { NextRequest } from 'next/server';
import { validateAndPublishDueStories } from '@/services/editorial/schedule';
import { setServiceClient } from '@/supabase/client';

vi.mock('@/services/editorial/schedule', () => ({
  validateAndPublishDueStories: vi.fn(),
}));

const mockEvaluatePublicationContract = vi.fn();
const mockExecutePostPublicationEffects = vi.fn();
vi.mock('@/lib/editorial/canonical-publication', () => ({
  evaluatePublicationContractAsync: (...args: unknown[]) => mockEvaluatePublicationContract(...args),
  executePostPublicationEffects: (...args: unknown[]) => mockExecutePostPublicationEffects(...args),
}));

const mockStoryRepository = {
  saveStory: vi.fn(),
  getStory: vi.fn(),
};
vi.mock('@/services/factory/repository', () => ({
  RepositoryFactory: {
    getStoryRepository: () => mockStoryRepository,
  },
}));

const endpoint = 'https://thebreakdown.in/api/editorial/publish-due';
const env = { APP_URL: 'https://thebreakdown.in', CRON_SECRET: 'test-cron-secret' };

const summary = {
  ok: true,
  timestamp: '2026-10-17T00:00:00.000Z',
  totalChecked: 4,
  published: 1,
  alreadyPublished: 1,
  blocked: 1,
  skipped: 1,
  results: [
    { storyId: 'story-approved', passed: true, outcome: 'published' as const, checksCount: 13, failedChecks: [] },
    { storyId: 'story-existing', passed: true, outcome: 'already_published' as const, checksCount: 1, failedChecks: [] },
    { storyId: 'story-blocked', passed: false, outcome: 'blocked' as const, checksCount: 13, failedChecks: ['fact_check'] },
    { storyId: 'story-skipped', passed: false, outcome: 'skipped' as const, checksCount: 1, failedChecks: ['already_claimed'] },
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
      totalChecked: 4,
      published: 1,
      alreadyPublished: 1,
      blocked: 1,
      skipped: 1,
      results: [
        { storyId: 'story-approved', passed: true, outcome: 'published', checksCount: 13, failedChecks: [] },
        { storyId: 'story-existing', passed: true, outcome: 'already_published', checksCount: 1, failedChecks: [] },
        { storyId: 'story-blocked', passed: false, outcome: 'blocked', checksCount: 13, failedChecks: ['fact_check'] },
        { storyId: 'story-skipped', passed: false, outcome: 'skipped', checksCount: 1, failedChecks: ['already_claimed'] },
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
    'https://www.thebreakdown.in',
    'https://attacker.example.com',
    'https://staging.thebreakdown.in',
    'https://evil-thebreakdown.in',
    'https://notthebreakdown.in',
  ])('rejects untrusted HTTPS host (%s) without making a request', async (untrustedUrl) => {
    await expect(publishDueStories({ APP_URL: untrustedUrl, CRON_SECRET: env.CRON_SECRET })).rejects.toThrow(/not trusted/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts configured trusted host thebreakdown.in and dispatches GET request', async () => {
    expect(ALLOWED_PUBLISHING_HOSTS).toEqual(['thebreakdown.in']);
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      ok: true,
      timestamp: '2026-10-17T00:00:00.000Z',
      totalChecked: 0,
      published: 0,
      alreadyPublished: 0,
      blocked: 0,
      skipped: 0,
      results: [],
    }), { status: 200 }));

    await expect(publishDueStories({ APP_URL: 'https://thebreakdown.in', CRON_SECRET: env.CRON_SECRET })).resolves.toBeDefined();
    expect(fetchMock).toHaveBeenCalledWith('https://thebreakdown.in/api/editorial/publish-due', expect.objectContaining({
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
      alreadyPublished: 0,
      blocked: 0,
      skipped: 0,
      results: [],
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(emptySummary), { status: 200 }));

    await expect(publishDueStories(env)).resolves.toEqual({
      timestamp: emptySummary.timestamp,
      totalChecked: 0,
      published: 0,
      alreadyPublished: 0,
      blocked: 0,
      skipped: 0,
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
      alreadyPublished: 0,
      blocked: 1,
      skipped: 0,
      results: [
        { storyId: 'story-failed-fact-check', passed: false, outcome: 'blocked' as const, checksCount: 13, failedChecks: ['fact_check', 'evidence_vault'] },
      ],
    };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(blockedOnly), { status: 200 }));

    const res = await publishDueStories(env);
    expect(res.published).toBe(0);
    expect(res.alreadyPublished).toBe(0);
    expect(res.blocked).toBe(1);
    expect(res.skipped).toBe(0);
    expect(res.results[0].passed).toBe(false);
    expect(res.results[0].outcome).toBe('blocked');
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

  it.each([
    ['published count mismatch', { ...summary, published: 2 }],
    ['alreadyPublished count mismatch', { ...summary, alreadyPublished: 0 }],
    ['blocked count mismatch', { ...summary, blocked: 0 }],
    ['skipped count mismatch', { ...summary, skipped: 0 }],
    ['total sum mismatch', { ...summary, totalChecked: 5 }],
  ])('rejects summary counters inconsistent with the story results (%s)', async (_label, invalidSummary) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(invalidSummary), { status: 200 }));

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
      alreadyPublished: 0,
      blocked: 0,
      skipped: 0,
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
        outcome: 'published',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'fact_check', passed: true, reason: 'Verified' },
          { name: 'evidence_vault', passed: true, reason: 'Vault archived' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-blocked-fact-check',
        passed: false,
        outcome: 'blocked',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
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
    expect(body.alreadyPublished).toBe(0);
    expect(body.blocked).toBe(1);
    expect(body.skipped).toBe(0);
    expect(body.results).toHaveLength(2);

    const blockedItem = body.results.find((r: { storyId: string }) => r.storyId === 'story-blocked-fact-check');
    expect(blockedItem.passed).toBe(false);
    expect(blockedItem.outcome).toBe('blocked');
    expect(blockedItem.checksCount).toBe(3);
    expect(blockedItem.failedChecks).toEqual(['fact_check', 'evidence_vault']);
  });

  it('correctly categorizes all 4 outcomes and reconciles all summary counters', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-new-pub',
        passed: true,
        outcome: 'published',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'fact_check', passed: true, reason: 'Verified' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-prior-pub',
        passed: true,
        outcome: 'already_published',
        checks: [
          { name: 'already_published', passed: true, reason: 'Story is already published — skipping' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-gate-blocked',
        passed: false,
        outcome: 'blocked',
        checks: [
          { name: 'fact_check', passed: false, reason: 'Senior editor verification pending' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-worker-skipped',
        passed: false,
        outcome: 'skipped',
        checks: [
          { name: 'already_claimed', passed: false, reason: 'Claimed by another concurrent worker' },
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
    expect(body.totalChecked).toBe(4);
    expect(body.published).toBe(1);          // ONLY newly published
    expect(body.alreadyPublished).toBe(1);   // Idempotent skip
    expect(body.blocked).toBe(1);            // Content gate failure
    expect(body.skipped).toBe(1);            // Worker concurrency claim skip
    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);
    expect(body.results).toHaveLength(4);

    expect(body.results[0]).toEqual({
      storyId: 'story-new-pub',
      passed: true,
      outcome: 'published',
      checksCount: 2,
      failedChecks: [],
    });
    expect(body.results[1]).toEqual({
      storyId: 'story-prior-pub',
      passed: true,
      outcome: 'already_published',
      checksCount: 1,
      failedChecks: [],
    });
    expect(body.results[2]).toEqual({
      storyId: 'story-gate-blocked',
      passed: false,
      outcome: 'blocked',
      checksCount: 1,
      failedChecks: ['fact_check'],
    });
    expect(body.results[3]).toEqual({
      storyId: 'story-worker-skipped',
      passed: false,
      outcome: 'skipped',
      checksCount: 1,
      failedChecks: ['already_claimed'],
    });
  });

  it('never counts a result with passed: true and passing checks as newly published if outcome is missing', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-missing-explicit-outcome',
        passed: true,
        outcome: undefined,
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'fact_check', passed: true, reason: 'Verified' },
          { name: 'evidence_vault', passed: true, reason: 'Vault archived' },
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
    expect(body.totalChecked).toBe(1);
    expect(body.published).toBe(0);          // NEVER counted as newly published
    expect(body.alreadyPublished).toBe(0);
    expect(body.blocked).toBe(1);            // Fails closed to blocked
    expect(body.skipped).toBe(0);
    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);
    expect(body.results[0].outcome).toBe('blocked');

    // Emitted a safe diagnostic
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const loggedJson = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(loggedJson).toMatchObject({
      event: 'editorial.publish_due.unknown_outcome',
      storyId: 'story-missing-explicit-outcome',
      passed: true,
      outcome: null,
      classification: 'blocked',
    });

    consoleWarnSpy.mockRestore();
  });

  it('suppresses sensitive database credentials and connection strings from both response and server logs', async () => {
    const sensitiveDbError = 'password authentication failed for user "postgres.mock_project_42" at host db.fake-supabase.co:5432 with secret P@ssw0rd!123 and url postgres://mock_user:P@ssw0rd!123@db.fake-supabase.co:5432/postgres';
    vi.mocked(validateAndPublishDueStories).mockRejectedValue(new Error(sensitiveDbError));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const req = new NextRequest('https://thebreakdown.in/api/editorial/publish-due', {
      headers: { authorization: `Bearer ${ROUTE_SECRET}` },
    });

    const res = await publishDueRoute(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    // 1. Verify caller response is sanitized and includes correlationId
    expect(body).toEqual({
      ok: false,
      error: 'An internal error occurred while processing scheduled publishing',
      correlationId: expect.any(String),
      timestamp: expect.any(String),
    });
    expect(body.error).not.toContain('password');
    expect(body.error).not.toContain('fake-supabase.co');
    expect(body.error).not.toContain('P@ssw0rd!123');
    expect(body.error).not.toContain('mock_project_42');

    // 2. Verify server logs are sanitized
    expect(consoleErrorSpy).toHaveBeenCalled();
    const allLoggedArgs = consoleErrorSpy.mock.calls
      .flat()
      .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');

    expect(allLoggedArgs).not.toContain('P@ssw0rd!123');
    expect(allLoggedArgs).not.toContain('password authentication failed');
    expect(allLoggedArgs).not.toContain('mock_project_42');
    expect(allLoggedArgs).not.toContain('db.fake-supabase.co');
    expect(allLoggedArgs).toContain('DATABASE_AUTH_ERROR');
    expect(allLoggedArgs).toContain(body.correlationId);

    consoleErrorSpy.mockRestore();
  });

  it('preserves published outcome when post-publication effects fail after successful persistence', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-persisted-housekeeping-failed',
        passed: true,
        outcome: 'published',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'fact_check', passed: true, reason: 'Verified' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
        publishedAt: new Date().toISOString(),
        postPublicationError: true,
        postPublicationErrorCategory: 'POST_PUBLICATION_EFFECTS_FAILED',
        correlationId: 'corr-test-id-123',
      },
    ]);

    const req = new NextRequest('https://thebreakdown.in/api/editorial/publish-due', {
      headers: { authorization: `Bearer ${ROUTE_SECRET}` },
    });

    const res = await publishDueRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.ok).toBe(true);
    expect(body.totalChecked).toBe(1);
    expect(body.published).toBe(1); // Story WAS persisted and published!
    expect(body.alreadyPublished).toBe(0);
    expect(body.blocked).toBe(0); // Not falsely reported as blocked
    expect(body.skipped).toBe(0);

    expect(body.results[0]).toEqual({
      storyId: 'story-persisted-housekeeping-failed',
      passed: true,
      outcome: 'published',
      checksCount: 2,
      failedChecks: [],
      postPublicationError: true,
      postPublicationErrorCategory: 'POST_PUBLICATION_EFFECTS_FAILED',
      correlationId: 'corr-test-id-123',
    });
  });

  it('marks story blocked when repository save fails before persistence', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-repo-save-failed',
        passed: false,
        outcome: 'blocked',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'repository_publish_failed', passed: false, reason: 'Database unique constraint violation on slug' },
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
    expect(body.totalChecked).toBe(1);
    expect(body.published).toBe(0);
    expect(body.blocked).toBe(1);
    expect(body.results[0]).toEqual({
      storyId: 'story-repo-save-failed',
      passed: false,
      outcome: 'blocked',
      checksCount: 2,
      failedChecks: ['repository_publish_failed'],
    });
  });

  it('marks story blocked when decision was allowed but publication token was absent', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-missing-token',
        passed: false,
        outcome: 'blocked',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'missing_publication_token', passed: false, reason: 'Publication decision allowed but publication token is absent' },
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
    expect(body.totalChecked).toBe(1);
    expect(body.published).toBe(0);
    expect(body.blocked).toBe(1);
    expect(body.results[0].outcome).toBe('blocked');
    expect(body.results[0].passed).toBe(false);
    expect(body.results[0].failedChecks).toContain('missing_publication_token');
  });

  it('refuses to classify story as published if passed is true but checks have failure', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-corrupted-passed-flag',
        passed: true,
        outcome: undefined,
        checks: [
          { name: 'fact_check', passed: false, reason: 'Verification failed' },
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

    expect(body.published).toBe(0);
    expect(body.blocked).toBe(1);
    expect(body.results[0].outcome).toBe('blocked');

    consoleWarnSpy.mockRestore();
  });
});

describe('Phase 23: Strict Outcome Consistency & Adversarial Contract Enforcement', () => {
  const ROUTE_SECRET = 'route-test-cron-secret-token-p23';
  const originalEnvSecret = process.env.CRON_SECRET;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.CRON_SECRET = ROUTE_SECRET;
    vi.mocked(validateAndPublishDueStories).mockReset();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalEnvSecret;
    consoleWarnSpy.mockRestore();
  });

  it('1. missing outcome with passed: true and all checks passing classifies as blocked', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-p23-missing-outcome',
        passed: true,
        outcome: undefined,
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'fact_check', passed: true, reason: 'Verified' },
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

    expect(body.published).toBe(0);
    expect(body.blocked).toBe(1);
    expect(body.results[0].outcome).toBe('blocked');
    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const log = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(log).toMatchObject({
      event: 'editorial.publish_due.unknown_outcome',
      storyId: 'story-p23-missing-outcome',
      classification: 'blocked',
      reason: 'missing_outcome',
    });
  });

  it('2. unknown outcome with otherwise successful-looking data classifies as blocked', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-p23-unknown-outcome',
        passed: true,
        outcome: 'auto_publish_success' as never,
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'fact_check', passed: true, reason: 'Verified' },
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

    expect(body.published).toBe(0);
    expect(body.blocked).toBe(1);
    expect(body.results[0].outcome).toBe('blocked');
    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const log = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(log).toMatchObject({
      event: 'editorial.publish_due.unknown_outcome',
      storyId: 'story-p23-unknown-outcome',
      outcome: 'auto_publish_success',
      classification: 'blocked',
      reason: 'unrecognized_outcome',
    });
  });

  it('3. explicit blocked outcome plus an already_published check marker remains blocked', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-p23-blocked-already-pub-marker',
        passed: false,
        outcome: 'blocked',
        checks: [
          { name: 'already_published', passed: true, reason: 'Story is already published — skipping' },
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

    expect(body.published).toBe(0);
    expect(body.alreadyPublished).toBe(0); // MUST NOT be inferred as already_published!
    expect(body.blocked).toBe(1);          // Explicit blocked is preserved
    expect(body.results[0].outcome).toBe('blocked');
    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const log = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(log).toMatchObject({
      event: 'editorial.publish_due.inconsistent_outcome',
      storyId: 'story-p23-blocked-already-pub-marker',
      classification: 'blocked',
      reason: 'blocked_with_contradictory_state_or_markers',
    });
  });

  it('4. explicit blocked outcome plus an already_claimed marker remains blocked', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-p23-blocked-already-claimed-marker',
        passed: false,
        outcome: 'blocked',
        checks: [
          { name: 'already_claimed', passed: false, reason: 'Claimed by another worker' },
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

    expect(body.published).toBe(0);
    expect(body.skipped).toBe(0);  // MUST NOT be inferred as skipped!
    expect(body.blocked).toBe(1);  // Explicit blocked is preserved
    expect(body.results[0].outcome).toBe('blocked');
    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const log = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(log).toMatchObject({
      event: 'editorial.publish_due.inconsistent_outcome',
      storyId: 'story-p23-blocked-already-claimed-marker',
      classification: 'blocked',
      reason: 'blocked_with_contradictory_state_or_markers',
    });
  });

  it('5. explicit published outcome with passed: false classifies as blocked', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-p23-published-passed-false',
        passed: false,
        outcome: 'published',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
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

    expect(body.published).toBe(0); // Inconsistent passed: false cannot be published
    expect(body.blocked).toBe(1);
    expect(body.results[0].outcome).toBe('blocked');
    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const log = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(log).toMatchObject({
      event: 'editorial.publish_due.inconsistent_outcome',
      storyId: 'story-p23-published-passed-false',
      classification: 'blocked',
      reason: 'published_with_failed_checks_or_invalid_state',
    });
  });

  it('6. explicit published outcome with any failed check classifies as blocked', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-p23-published-failed-check',
        passed: true,
        outcome: 'published',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'fact_check', passed: false, reason: 'Unverified primary claims' },
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

    expect(body.published).toBe(0); // Failed check blocks publication regardless of passed: true
    expect(body.blocked).toBe(1);
    expect(body.results[0].outcome).toBe('blocked');
    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const log = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(log).toMatchObject({
      event: 'editorial.publish_due.inconsistent_outcome',
      storyId: 'story-p23-published-failed-check',
      classification: 'blocked',
      reason: 'published_with_failed_checks_or_invalid_state',
    });
  });

  it('7. valid, internally consistent examples of all 4 outcomes retain their intended classifications', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-valid-pub',
        passed: true,
        outcome: 'published',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'fact_check', passed: true, reason: 'Verified' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-valid-already-pub',
        passed: true,
        outcome: 'already_published',
        checks: [
          { name: 'already_published', passed: true, reason: 'Story is already published — skipping' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-valid-skipped',
        passed: false,
        outcome: 'skipped',
        checks: [
          { name: 'already_claimed', passed: false, reason: 'Claimed by concurrent worker' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-valid-blocked',
        passed: false,
        outcome: 'blocked',
        checks: [
          { name: 'fact_check', passed: false, reason: 'Senior editor verification pending' },
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

    expect(body.totalChecked).toBe(4);
    expect(body.published).toBe(1);
    expect(body.alreadyPublished).toBe(1);
    expect(body.skipped).toBe(1);
    expect(body.blocked).toBe(1);

    expect(body.results.map((r: { outcome: string }) => r.outcome)).toEqual([
      'published',
      'already_published',
      'skipped',
      'blocked',
    ]);
    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);
    // Zero warning logs for completely consistent legitimate entries
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('8. strictly preserves the four-way counter invariant across mixed valid, missing, and contradictory inputs', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'mixed-1-valid-pub',
        passed: true,
        outcome: 'published',
        checks: [{ name: 'fact_check', passed: true, reason: 'OK' }],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'mixed-2-missing-outcome',
        passed: true,
        outcome: undefined,
        checks: [{ name: 'fact_check', passed: true, reason: 'OK' }],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'mixed-3-unknown-outcome',
        passed: true,
        outcome: 'bogus' as never,
        checks: [{ name: 'fact_check', passed: true, reason: 'OK' }],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'mixed-4-contradictory-blocked',
        passed: false,
        outcome: 'blocked',
        checks: [{ name: 'already_published', passed: true, reason: 'Marker' }],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'mixed-5-valid-skipped',
        passed: false,
        outcome: 'skipped',
        checks: [{ name: 'already_claimed', passed: false, reason: 'Claimed' }],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'mixed-6-contradictory-pub',
        passed: true,
        outcome: 'published',
        checks: [{ name: 'fact_check', passed: false, reason: 'Fail' }],
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

    expect(body.totalChecked).toBe(6);
    expect(body.published).toBe(1);          // only mixed-1
    expect(body.alreadyPublished).toBe(0);
    expect(body.skipped).toBe(1);            // only mixed-5
    expect(body.blocked).toBe(4);            // mixed-2, mixed-3, mixed-4, mixed-6

    expect(body.published + body.alreadyPublished + body.blocked + body.skipped).toBe(body.totalChecked);
    expect(body.results).toHaveLength(6);
  });

  it('9. contradictory and unknown cases emit structured diagnostics without exposing sensitive credentials', async () => {
    const SENSITIVE_TOKEN = ['tok', 'adversarial', 'fixture', 'p23', 'secret'].join('_');
    const SENSITIVE_DB_URL = 'postgres://postgres:SuperSecretP23Pass@db.fake-supabase.co:5432/postgres';

    vi.mocked(validateAndPublishDueStories).mockResolvedValue([
      {
        storyId: 'story-p23-sensitive-data',
        scheduleId: 'sched-p23-456',
        passed: true,
        outcome: undefined,
        checks: [
          { name: 'token_check', passed: false, reason: `Token expired: ${SENSITIVE_TOKEN}`, details: SENSITIVE_DB_URL },
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

    expect(body.blocked).toBe(1);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const rawLogged = consoleWarnSpy.mock.calls[0][0];
    expect(rawLogged).not.toContain(SENSITIVE_TOKEN);
    expect(rawLogged).not.toContain(SENSITIVE_DB_URL);
    expect(rawLogged).not.toContain('SuperSecretP23Pass');

    const parsedLog = JSON.parse(rawLogged);
    expect(parsedLog).toEqual({
      event: 'editorial.publish_due.unknown_outcome',
      storyId: 'story-p23-sensitive-data',
      scheduleId: 'sched-p23-456',
      passed: true,
      outcome: null,
      reason: 'missing_outcome',
      classification: 'blocked',
      timestamp: expect.any(String),
    });
  });
});

function createMockDb(
  initialStories: any[] = [],
  initialSchedule: any[] = [],
  failAtomicClaimIds: string[] = [],
  failPublishedUpdateError?: Error | null,
) {
  const scheduleStore = initialSchedule.map(s => ({ ...s }));
  const storiesStore = initialStories.map(s => ({ ...s }));
  const logsStore: any[] = [];

  const mockDb: any = {
    from: (table: string) => {
      let currentFilter: (row: any) => boolean = () => true;
      let updatePayload: any = null;
      let isEqScheduleId: string | null = null;

      const builder: any = {
        select: () => builder,
        eq: (col: string, val: any) => {
          const prev = currentFilter;
          currentFilter = (r: any) => prev(r) && r[col] === val;
          if (table === 'editorial_schedule' && col === 'id') {
            isEqScheduleId = val;
          }
          return builder;
        },
        neq: (col: string, val: any) => {
          const prev = currentFilter;
          currentFilter = (r: any) => prev(r) && r[col] !== val;
          return builder;
        },
        in: (col: string, vals: any[]) => {
          const prev = currentFilter;
          currentFilter = (r: any) => prev(r) && vals.includes(r[col]);
          return builder;
        },
        lte: (col: string, val: any) => {
          const prev = currentFilter;
          currentFilter = (r: any) => prev(r) && r[col] <= val;
          return builder;
        },
        or: (clause: string) => {
          const prev = currentFilter;
          const parts = clause.split(',');
          currentFilter = (r: any) => {
            if (!prev(r)) return false;
            for (const part of parts) {
              if (part.endsWith('.is.null')) {
                const col = part.replace('.is.null', '');
                if (r[col] === null || r[col] === undefined) return true;
              } else if (part.includes('.lt.')) {
                const [col, val] = part.split('.lt.');
                if (!r[col] || new Date(r[col]).getTime() < new Date(val).getTime()) return true;
              }
            }
            return false;
          };
          return builder;
        },
        order: () => builder,
        limit: () => builder,
        single: async () => {
          if (table === 'editorial_schedule' && isEqScheduleId && failAtomicClaimIds.includes(isEqScheduleId)) {
            return { data: null, error: new Error('Claim race lost: 0 rows affected') };
          }
          const store = table === 'editorial_schedule' ? scheduleStore : storiesStore;
          const row = store.find(currentFilter);
          if (row && updatePayload) {
            Object.assign(row, updatePayload);
          }
          return { data: row || null, error: row ? null : new Error('Not found') };
        },
        maybeSingle: async () => {
          if (table === 'editorial_schedule' && isEqScheduleId && failAtomicClaimIds.includes(isEqScheduleId)) {
            return { data: null, error: null };
          }
          const store = table === 'editorial_schedule' ? scheduleStore : storiesStore;
          const row = store.find(currentFilter);
          if (row && updatePayload) {
            Object.assign(row, updatePayload);
          }
          return { data: row || null, error: null };
        },
        insert: (data: any) => {
          const row = { id: data.id || 'log-' + Math.random(), ...data };
          logsStore.push(row);
          return {
            select: () => ({
              single: async () => ({ data: row, error: null }),
            }),
            then: (resolve: any) => resolve({ data: [row], error: null }),
          };
        },
        update: (data: any) => {
          updatePayload = data;
          return builder;
        },
        then: (resolve: any) => {
          if (table === 'editorial_schedule' && updatePayload?.status === 'published' && failPublishedUpdateError) {
            return resolve({ data: null, error: failPublishedUpdateError });
          }
          const store = table === 'editorial_schedule' ? scheduleStore : storiesStore;
          if (updatePayload) {
            store.filter(currentFilter).forEach(r => Object.assign(r, updatePayload));
          }
          const rows = store.filter(currentFilter);
          return resolve({ data: rows, error: null });
        },
      };
      return builder;
    },
  };

  return { mockDb, scheduleStore, storiesStore, logsStore };
}

describe('editorial schedule service publication lifecycle and invariants', () => {
  let realValidateAndPublishDueStories: typeof import('@/services/editorial/schedule').validateAndPublishDueStories;

  beforeEach(async () => {
    vi.resetAllMocks();
    const actualSchedule = await vi.importActual<typeof import('@/services/editorial/schedule')>('@/services/editorial/schedule');
    realValidateAndPublishDueStories = actualSchedule.validateAndPublishDueStories;
  });

  afterEach(() => {
    setServiceClient(null);
  });

  it('handles concurrent-worker skips with outcome="skipped" and passed=false', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-race-1', story_id: 'story-race-1', status: 'ready', slot_date: today, priority: 10 },
    ];
    const initialStories = [
      { id: 'story-race-1', slug: 'story-race-1', title: 'Race Story', status: 'ready' },
    ];

    const { mockDb } = createMockDb(initialStories, initialSchedule, ['sched-race-1']);
    setServiceClient(mockDb);

    const results = await realValidateAndPublishDueStories(new Date());
    expect(results).toHaveLength(1);
    expect(results[0].storyId).toBe('story-race-1');
    expect(results[0].passed).toBe(false);
    expect(results[0].outcome).toBe('skipped');
    expect(results[0].checks[0].name).toBe('already_claimed');
    expect(mockStoryRepository.saveStory).not.toHaveBeenCalled();
  });

  it('handles idempotent skips with outcome="already_published" and passed=true', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-idem-1', story_id: 'story-idem-1', status: 'validated', slot_date: today, priority: 5 },
    ];
    const initialStories = [
      { id: 'story-idem-1', slug: 'story-idem-1', title: 'Already Published Story', status: 'published', published_at: '2026-10-15T10:00:00.000Z' },
    ];

    const { mockDb, scheduleStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    const results = await realValidateAndPublishDueStories(new Date());
    expect(results).toHaveLength(1);
    expect(results[0].storyId).toBe('story-idem-1');
    expect(results[0].passed).toBe(true);
    expect(results[0].outcome).toBe('already_published');
    expect(results[0].checks[0].name).toBe('already_published');
    expect(results[0].publishedAt).toBe('2026-10-15T10:00:00.000Z');
    expect(mockStoryRepository.saveStory).not.toHaveBeenCalled();
    expect(scheduleStore[0].status).toBe('published');
  });

  it('handles gate failure with outcome="blocked" and passed=false', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-gate-1', story_id: 'story-gate-1', status: 'ready', slot_date: today, priority: 8 },
    ];
    const initialStories = [
      { id: 'story-gate-1', slug: 'story-gate-1', title: 'Gate Failed Story', status: 'ready' },
    ];

    const { mockDb, scheduleStore, storiesStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: false,
      error: 'Fact check pending verification',
      gateResult: {
        storyId: 'story-gate-1',
        passed: false,
        checks: [{ name: 'fact_check', passed: false, reason: 'Pending senior editor review' }],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
    });

    const results = await realValidateAndPublishDueStories(new Date());
    expect(results).toHaveLength(1);
    expect(results[0].storyId).toBe('story-gate-1');
    expect(results[0].passed).toBe(false);
    expect(results[0].outcome).toBe('blocked');
    expect(results[0].checks[0].name).toBe('fact_check');
    expect(mockStoryRepository.saveStory).not.toHaveBeenCalled();
    expect(scheduleStore[0].status).toBe('blocked');
    expect(storiesStore[0].status).toBe('review');
  });

  it('handles missing publication token when decision allowed with outcome="blocked"', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-token-1', story_id: 'story-token-1', status: 'ready', slot_date: today, priority: 9 },
    ];
    const initialStories = [
      { id: 'story-token-1', slug: 'story-token-1', title: 'Token Missing Story', status: 'ready' },
    ];

    const { mockDb, scheduleStore, storiesStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: undefined,
      updatedStory: { id: 'story-token-1', slug: 'story-token-1', title: 'Token Missing Story' },
      gateResult: {
        storyId: 'story-token-1',
        passed: true,
        checks: [{ name: 'editorial_check', passed: true, reason: 'Passed' }],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
    });

    const results = await realValidateAndPublishDueStories(new Date());
    expect(results).toHaveLength(1);
    expect(results[0].storyId).toBe('story-token-1');
    expect(results[0].passed).toBe(false);
    expect(results[0].outcome).toBe('blocked');
    expect(results[0].checks.some(c => c.name === 'missing_publication_token' && !c.passed)).toBe(true);
    expect(mockStoryRepository.saveStory).not.toHaveBeenCalled();
    expect(scheduleStore[0].status).toBe('blocked');
    expect(storiesStore[0].status).toBe('review');
  });

  it('handles failure before persistence (repository rejection) with outcome="blocked"', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-repo-1', story_id: 'story-repo-1', status: 'ready', slot_date: today, priority: 7 },
    ];
    const initialStories = [
      { id: 'story-repo-1', slug: 'story-repo-1', title: 'Repo Reject Story', status: 'ready' },
    ];

    const { mockDb, scheduleStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: 'valid-pub-token-123',
      updatedStory: { id: 'story-repo-1', slug: 'story-repo-1', title: 'Repo Reject Story' },
    });

    mockStoryRepository.saveStory.mockRejectedValueOnce(new Error('Unique constraint violation: slug conflict'));

    const results = await realValidateAndPublishDueStories(new Date());
    expect(results).toHaveLength(1);
    expect(results[0].storyId).toBe('story-repo-1');
    expect(results[0].passed).toBe(false);
    expect(results[0].outcome).toBe('blocked');
    expect(results[0].checks.some(c => c.name === 'repository_publish_failed' && !c.passed)).toBe(true);
    expect(scheduleStore[0].status).toBe('blocked');
  });

  it('handles failure after persistence (post-publication error) with outcome="published"', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-post-1', story_id: 'story-post-1', status: 'ready', slot_date: today, priority: 6 },
    ];
    const initialStories = [
      { id: 'story-post-1', slug: 'story-post-1', title: 'Post Effects Error Story', status: 'ready' },
    ];

    const { mockDb, scheduleStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: 'valid-pub-token-456',
      updatedStory: { id: 'story-post-1', slug: 'story-post-1', title: 'Post Effects Error Story' },
    });

    mockStoryRepository.saveStory.mockResolvedValueOnce({ id: 'story-post-1', status: 'published' });
    mockExecutePostPublicationEffects.mockImplementationOnce(() => {
      throw new Error('Search index webhook HTTP 504 Gateway Timeout');
    });

    const results = await realValidateAndPublishDueStories(new Date());
    expect(results).toHaveLength(1);
    expect(results[0].storyId).toBe('story-post-1');
    expect(results[0].passed).toBe(true);
    expect(results[0].outcome).toBe('published'); // Persistence succeeded!
    expect(results[0].postPublicationError).toBe(true);
    expect(results[0].postPublicationErrorCategory).toBe('POST_PUBLICATION_EFFECTS_FAILED');
    expect(results[0].correlationId).toBeDefined();
    expect(scheduleStore[0].status).toBe('published');
  });

  it('reconciles all 4 outcomes in a single run: published + alreadyPublished + blocked + skipped === totalChecked', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-all-1', story_id: 'story-pub', status: 'ready', slot_date: today, priority: 10 },
      { id: 'sched-all-2', story_id: 'story-idem', status: 'ready', slot_date: today, priority: 9 },
      { id: 'sched-all-3', story_id: 'story-block', status: 'ready', slot_date: today, priority: 8 },
      { id: 'sched-all-4', story_id: 'story-skip', status: 'ready', slot_date: today, priority: 7 },
    ];
    const initialStories = [
      { id: 'story-pub', slug: 'story-pub', title: 'Pub Story', status: 'ready' },
      { id: 'story-idem', slug: 'story-idem', title: 'Idem Story', status: 'published', published_at: '2026-10-16T00:00:00Z' },
      { id: 'story-block', slug: 'story-block', title: 'Block Story', status: 'ready' },
      { id: 'story-skip', slug: 'story-skip', title: 'Skip Story', status: 'ready' },
    ];

    const { mockDb } = createMockDb(initialStories, initialSchedule, ['sched-all-4']);
    setServiceClient(mockDb);

    // story-pub succeeds
    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: 'valid-token-all',
      updatedStory: { id: 'story-pub', slug: 'story-pub' },
    });
    mockStoryRepository.saveStory.mockResolvedValueOnce({ id: 'story-pub', status: 'published' });

    // story-block fails gate
    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: false,
      error: 'Evidence missing',
      gateResult: {
        storyId: 'story-block',
        passed: false,
        checks: [{ name: 'evidence_vault', passed: false, reason: 'No archived artifact' }],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
    });

    const results = await realValidateAndPublishDueStories(new Date());
    expect(results).toHaveLength(4);

    const published = results.filter(r => r.outcome === 'published').length;
    const alreadyPublished = results.filter(r => r.outcome === 'already_published').length;
    const blocked = results.filter(r => r.outcome === 'blocked').length;
    const skipped = results.filter(r => r.outcome === 'skipped').length;

    expect(published).toBe(1);
    expect(alreadyPublished).toBe(1);
    expect(blocked).toBe(1);
    expect(skipped).toBe(1);
    expect(published + alreadyPublished + blocked + skipped).toBe(4);
    expect(results.length).toBe(4);
  });

  it('Phase 31: two concurrent workers racing on a ready entry produce exactly one winner and one skipped loser', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-concurrent-race', story_id: 'story-concurrent-race', status: 'ready', slot_date: today, priority: 10 },
    ];
    const initialStories = [
      { id: 'story-concurrent-race', slug: 'story-concurrent-race', title: 'Concurrent Race Story', status: 'ready' },
    ];

    const { mockDb, scheduleStore, storiesStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValue({
      allowed: true,
      publicationToken: 'valid-concurrent-token',
      updatedStory: { id: 'story-concurrent-race', slug: 'story-concurrent-race' },
    });
    mockStoryRepository.saveStory.mockImplementation(async (story: any) => {
      const existing = storiesStore.find(s => s.id === story.id);
      if (existing) Object.assign(existing, story);
      return story;
    });

    // Run Worker 1 and Worker 2 against the same database instance
    const [worker1Results, worker2Results] = await Promise.all([
      realValidateAndPublishDueStories(new Date()),
      realValidateAndPublishDueStories(new Date()),
    ]);

    const allResults = [...worker1Results, ...worker2Results];
    const publishedResults = allResults.filter(r => r.outcome === 'published');
    const skippedResults = allResults.filter(r => r.outcome === 'skipped');

    // Exactly one worker won and published
    expect(publishedResults).toHaveLength(1);
    expect(publishedResults[0].passed).toBe(true);

    // Exactly one worker lost the atomic claim race and skipped cleanly
    expect(skippedResults).toHaveLength(1);
    expect(skippedResults[0].passed).toBe(false);
    expect(skippedResults[0].checks[0].name).toBe('already_claimed');

    // Exactly one repository persistence operation occurred
    expect(mockStoryRepository.saveStory).toHaveBeenCalledTimes(1);

    // Final database state is published
    expect(scheduleStore[0].status).toBe('published');
    expect(storiesStore[0].status).toBe('published');
  });

  it('Phase 31: an entry in validated status with an active unexpired lease cannot be claimed by another worker', async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    // Lease held 1 minute ago (lease is 5 minutes, so still active for 4 more minutes)
    const activeLeaseTime = new Date(now.getTime() - 60 * 1000).toISOString();

    const initialSchedule = [
      {
        id: 'sched-active-lease',
        story_id: 'story-active-lease',
        status: 'validated',
        slot_date: today,
        priority: 10,
        validated_at: activeLeaseTime,
      },
    ];
    const initialStories = [
      { id: 'story-active-lease', slug: 'story-active-lease', title: 'Active Lease Story', status: 'ready' },
    ];

    const { mockDb } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    const results = await realValidateAndPublishDueStories(now);
    expect(results).toHaveLength(1);
    expect(results[0].outcome).toBe('skipped');
    expect(results[0].passed).toBe(false);
    expect(results[0].checks[0].name).toBe('already_claimed');
    expect(mockStoryRepository.saveStory).not.toHaveBeenCalled();
  });

  it('Phase 31: safe recovery from crashed worker when lease has expired (> 5 minutes)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    // Lease held 10 minutes ago (lease is 5 minutes, so expired 5 minutes ago)
    const expiredLeaseTime = new Date(now.getTime() - 10 * 60 * 1000).toISOString();

    const initialSchedule = [
      {
        id: 'sched-expired-lease',
        story_id: 'story-crashed-recovery',
        status: 'validated',
        slot_date: today,
        priority: 10,
        validated_at: expiredLeaseTime,
      },
    ];
    const initialStories = [
      { id: 'story-crashed-recovery', slug: 'story-crashed-recovery', title: 'Crashed Worker Story', status: 'ready' },
    ];

    const { mockDb, scheduleStore, storiesStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: 'valid-recovery-token',
      updatedStory: { id: 'story-crashed-recovery', slug: 'story-crashed-recovery' },
    });
    mockStoryRepository.saveStory.mockImplementation(async (story: any) => {
      const existing = storiesStore.find(s => s.id === story.id);
      if (existing) Object.assign(existing, story);
      return story;
    });

    const results = await realValidateAndPublishDueStories(now);
    expect(results).toHaveLength(1);
    expect(results[0].outcome).toBe('published');
    expect(results[0].passed).toBe(true);
    expect(mockStoryRepository.saveStory).toHaveBeenCalledTimes(1);

    // Lease was renewed and publication completed
    expect(scheduleStore[0].status).toBe('published');
    expect(storiesStore[0].status).toBe('published');
  });

  it('Phase 31: pre-persistence re-check stops worker if story was published concurrently before saveStory', async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const initialSchedule = [
      { id: 'sched-concurrent-pub', story_id: 'story-concurrent-pub', status: 'ready', slot_date: today, priority: 10 },
    ];
    const initialStories = [
      { id: 'story-concurrent-pub', slug: 'story-concurrent-pub', title: 'Concurrent Pub Story', status: 'ready' },
    ];

    const { mockDb, storiesStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockImplementation(async () => {
      // Out-of-band publish occurs during contract evaluation
      storiesStore[0].status = 'published';
      storiesStore[0].published_at = new Date(now.getTime() - 1000).toISOString();
      return {
        allowed: true,
        publicationToken: 'valid-interim-token',
        updatedStory: { id: 'story-concurrent-pub', slug: 'story-concurrent-pub' },
      };
    });

    const results = await realValidateAndPublishDueStories(now);
    expect(results).toHaveLength(1);
    expect(results[0].outcome).toBe('already_published');
    expect(results[0].passed).toBe(true);
    // saveStory was NOT invoked because pre-persistence check caught the out-of-band publication
    expect(mockStoryRepository.saveStory).not.toHaveBeenCalled();
  });

  it('Phase 31: truthful post-publication error reporting when eventBus fails', async () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const initialSchedule = [
      { id: 'sched-truth-post', story_id: 'story-truth-post', status: 'ready', slot_date: today, priority: 10 },
    ];
    const initialStories = [
      { id: 'story-truth-post', slug: 'story-truth-post', title: 'Truth Post Story', status: 'ready' },
    ];

    const { mockDb, scheduleStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: 'valid-truth-token',
      updatedStory: { id: 'story-truth-post', slug: 'story-truth-post' },
    });
    mockStoryRepository.saveStory.mockResolvedValueOnce({ id: 'story-truth-post', status: 'published' });

    mockExecutePostPublicationEffects.mockImplementationOnce((_story, _principal, gateResult) => {
      if (gateResult) {
        gateResult.postPublicationError = true;
        gateResult.postPublicationErrorCategory = 'POST_PUBLICATION_EFFECTS_FAILED';
      }
      return {
        eventBusEmitted: false,
        revalidationTriggered: false,
        errorCategory: 'POST_PUBLICATION_EFFECTS_FAILED',
      };
    });

    const results = await realValidateAndPublishDueStories(now);
    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(true);
    expect(results[0].outcome).toBe('published');
    expect(results[0].postPublicationError).toBe(true);
    expect(results[0].postPublicationErrorCategory).toBe('POST_PUBLICATION_EFFECTS_FAILED');

    // Schedule status was updated to published despite post-effects failure
    expect(scheduleStore[0].status).toBe('published');
  });

  it('Phase 31: direct executePostPublicationEffects call populates gateResult and returns failure diagnostics when eventBus throws', async () => {
    const actualCanonical = await vi.importActual<typeof import('@/lib/editorial/canonical-publication')>('@/lib/editorial/canonical-publication');
    const { eventBus } = await vi.importActual<typeof import('@/lib/events/event-bus')>('@/lib/events/event-bus');

    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(eventBus, 'publish').mockImplementation(() => {
      throw new Error('Kafka event bus connection refused');
    });

    const dummyStory: any = {
      id: 'story-effects-direct',
      slug: 'story-effects-direct',
      title: 'Direct Effects Story',
      status: 'published',
      publishedAt: new Date().toISOString(),
      author: 'author-effects',
    };
    const dummyPrincipal: any = {
      userId: 'user-effects',
      role: 'owner',
      name: 'Owner Principal',
    };
    const dummyGateResult: any = {
      storyId: dummyStory.id,
      passed: true,
      outcome: 'published',
      checks: [],
    };

    const res = actualCanonical.executePostPublicationEffects(dummyStory, dummyPrincipal, dummyGateResult);

    expect(res.eventBusEmitted).toBe(false);
    expect(res.errorCategory).toBe('POST_PUBLICATION_EFFECTS_FAILED');
    expect(dummyGateResult.postPublicationError).toBe(true);
    expect(dummyGateResult.postPublicationErrorCategory).toBe('POST_PUBLICATION_EFFECTS_FAILED');
    expect(dummyGateResult.outcome).toBe('published');
    expect(dummyGateResult.passed).toBe(true);
  });
});

describe('Phase 20 & 21: end-to-end post-publication error redaction across all 5 sinks', () => {
  // Deterministic runtime-constructed fixtures for adversarial leak-detection testing
  // Constructed via array joins to prevent false-positive static secret scanner findings
  const FAKE_PASSWORD = ['FakeP', 'ssword!999'].join('@');
  const FAKE_TOKEN = ['tok', 'adversarial', 'synthetic', 'leak', 'fixture', '12345'].join('_');
  const FAKE_HOST = ['secret', 'db', 'internal:5432'].join('.');
  const FAKE_WEBHOOK_SECRET = ['whsec', 'adversarial', 'synthetic', 'leak', 'fixture', 'abc987'].join('_');
  const FAKE_CONNECTION_STRING = `postgres://app_user:${FAKE_PASSWORD}@${FAKE_HOST}/prod_db?token=${FAKE_TOKEN}`;
  const ROUTE_AUTH_SECRET = ['cron', 'route', 'synthetic', 'secret', 'phase21'].join('-');

  let realValidateAndPublishDueStories: typeof import('@/services/editorial/schedule').validateAndPublishDueStories;
  const originalEnvSecret = process.env.CRON_SECRET;

  beforeEach(async () => {
    vi.resetAllMocks();
    process.env.CRON_SECRET = ROUTE_AUTH_SECRET;
    const actualSchedule = await vi.importActual<typeof import('@/services/editorial/schedule')>('@/services/editorial/schedule');
    realValidateAndPublishDueStories = actualSchedule.validateAndPublishDueStories;
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalEnvSecret;
    setServiceClient(null);
    vi.restoreAllMocks();
  });

  it('Sink 1: pre-persistence repo failure redacts secrets from checks, schedule table, and logs', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-sink1', story_id: 'story-sink1', status: 'ready', slot_date: today, priority: 10 },
    ];
    const initialStories = [
      { id: 'story-sink1', slug: 'story-sink1', title: 'Sink 1 Story', status: 'ready' },
    ];

    const { mockDb, scheduleStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: 'valid-pub-token-sink1',
      updatedStory: { id: 'story-sink1', slug: 'story-sink1', title: 'Sink 1 Story' },
    });

    const repoError = new Error(`Database connection failed: ${FAKE_CONNECTION_STRING}`);
    mockStoryRepository.saveStory.mockRejectedValueOnce(repoError);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const results = await realValidateAndPublishDueStories(new Date());

    expect(results).toHaveLength(1);
    const r = results[0];
    expect(r.passed).toBe(false);
    expect(r.outcome).toBe('blocked');
    expect(r.checks).toContainEqual({
      name: 'repository_publish_failed',
      passed: false,
      reason: 'Repository rejected publication persistence',
    });

    // Schedule entry block_reason is strictly the constant safe reason
    expect(scheduleStore[0].status).toBe('blocked');
    expect(scheduleStore[0].block_reason).toBe('Repository rejected publication persistence');

    // Verify none of the secrets leaked into the return structure or any console calls
    const serializedResults = JSON.stringify(results);
    expect(serializedResults).not.toContain(FAKE_PASSWORD);
    expect(serializedResults).not.toContain(FAKE_TOKEN);
    expect(serializedResults).not.toContain(FAKE_HOST);

    const allConsoleLogs = consoleErrorSpy.mock.calls
      .flat()
      .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');
    expect(allConsoleLogs).not.toContain(FAKE_PASSWORD);
    expect(allConsoleLogs).not.toContain(FAKE_TOKEN);
    expect(allConsoleLogs).not.toContain(FAKE_HOST);
  });

  it('Sink 2a: post-persistence effects failure sets boolean error & category without leaking webhook secret', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-sink2a', story_id: 'story-sink2a', status: 'ready', slot_date: today, priority: 10 },
    ];
    const initialStories = [
      { id: 'story-sink2a', slug: 'story-sink2a', title: 'Sink 2a Story', status: 'ready' },
    ];

    const { mockDb, scheduleStore } = createMockDb(initialStories, initialSchedule);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: 'valid-pub-token-sink2a',
      updatedStory: { id: 'story-sink2a', slug: 'story-sink2a', title: 'Sink 2a Story' },
    });
    mockStoryRepository.saveStory.mockResolvedValueOnce({ id: 'story-sink2a', status: 'published' });

    mockExecutePostPublicationEffects.mockImplementationOnce(() => {
      throw new Error(`Webhook push failed: https://search.internal/hook?token=${FAKE_WEBHOOK_SECRET}&db_pass=${FAKE_PASSWORD}`);
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const results = await realValidateAndPublishDueStories(new Date());

    expect(results).toHaveLength(1);
    const r = results[0];
    // Critical: outcome is published because persistence succeeded!
    expect(r.passed).toBe(true);
    expect(r.outcome).toBe('published');
    expect(r.postPublicationError).toBe(true);
    expect(r.postPublicationErrorCategory).toBe('POST_PUBLICATION_EFFECTS_FAILED');
    expect(r.correlationId).toBeDefined();
    expect(typeof r.correlationId).toBe('string');
    expect(scheduleStore[0].status).toBe('published');

    // Verify secrets are redacted from results object
    const serializedResults = JSON.stringify(results);
    expect(serializedResults).not.toContain(FAKE_WEBHOOK_SECRET);
    expect(serializedResults).not.toContain(FAKE_PASSWORD);
    expect(serializedResults).not.toContain('search.internal');

    // Verify console.error received structured JSON with zero secrets
    expect(consoleErrorSpy).toHaveBeenCalled();
    const allConsoleLogs = consoleErrorSpy.mock.calls
      .flat()
      .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');
    expect(allConsoleLogs).toContain('POST_PUBLICATION_EFFECTS_FAILED');
    expect(allConsoleLogs).toContain(r.correlationId!);
    expect(allConsoleLogs).not.toContain(FAKE_WEBHOOK_SECRET);
    expect(allConsoleLogs).not.toContain(FAKE_PASSWORD);
    expect(allConsoleLogs).not.toContain('search.internal');
  });

  it('Sink 2b: post-persistence schedule update failure sets SCHEDULE_STATUS_UPDATE_FAILED with zero secrets', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-sink2b', story_id: 'story-sink2b', status: 'ready', slot_date: today, priority: 10 },
    ];
    const initialStories = [
      { id: 'story-sink2b', slug: 'story-sink2b', title: 'Sink 2b Story', status: 'ready' },
    ];

    const failUpdateErr = new Error(`Connection dead: ${FAKE_CONNECTION_STRING}`);
    const { mockDb } = createMockDb(initialStories, initialSchedule, [], failUpdateErr);
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: 'valid-pub-token-sink2b',
      updatedStory: { id: 'story-sink2b', slug: 'story-sink2b', title: 'Sink 2b Story' },
    });
    mockStoryRepository.saveStory.mockResolvedValueOnce({ id: 'story-sink2b', status: 'published' });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const results = await realValidateAndPublishDueStories(new Date());

    expect(results).toHaveLength(1);
    const r = results[0];
    expect(r.passed).toBe(true);
    expect(r.outcome).toBe('published');
    expect(r.postPublicationError).toBe(true);
    expect(r.postPublicationErrorCategory).toBe('SCHEDULE_STATUS_UPDATE_FAILED');
    expect(r.correlationId).toBeDefined();

    const allConsoleLogs = consoleErrorSpy.mock.calls
      .flat()
      .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');
    expect(allConsoleLogs).toContain('SCHEDULE_STATUS_UPDATE_FAILED');
    expect(allConsoleLogs).toContain(r.correlationId!);
    expect(allConsoleLogs).not.toContain(FAKE_PASSWORD);
    expect(allConsoleLogs).not.toContain(FAKE_TOKEN);
    expect(allConsoleLogs).not.toContain(FAKE_HOST);
  });

  it('Sink 2c: post-persistence audit log failure sets AUDIT_LOG_FAILED with zero secrets', async () => {
    const today = new Date().toISOString().split('T')[0];
    const initialSchedule = [
      { id: 'sched-sink2c', story_id: 'story-sink2c', status: 'ready', slot_date: today, priority: 10 },
    ];
    const initialStories = [
      { id: 'story-sink2c', slug: 'story-sink2c', title: 'Sink 2c Story', status: 'ready' },
    ];

    const { mockDb } = createMockDb(initialStories, initialSchedule);
    // Intercept insert on publication_gate_log to fail post-persistence
    const origFrom = mockDb.from;
    mockDb.from = (table: string) => {
      const b = origFrom(table);
      if (table === 'publication_gate_log') {
        b.insert = () => ({
          ...b,
          then: (resolve: any) => resolve({ data: null, error: new Error(`Log insert dead: ${FAKE_CONNECTION_STRING}`) }),
        });
      }
      return b;
    };
    setServiceClient(mockDb);

    mockEvaluatePublicationContract.mockResolvedValueOnce({
      allowed: true,
      publicationToken: 'valid-pub-token-sink2c',
      updatedStory: { id: 'story-sink2c', slug: 'story-sink2c', title: 'Sink 2c Story' },
    });
    mockStoryRepository.saveStory.mockResolvedValueOnce({ id: 'story-sink2c', status: 'published' });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const results = await realValidateAndPublishDueStories(new Date());

    expect(results).toHaveLength(1);
    const r = results[0];
    expect(r.passed).toBe(true);
    expect(r.outcome).toBe('published');
    expect(r.postPublicationError).toBe(true);
    expect(r.postPublicationErrorCategory).toBe('AUDIT_LOG_FAILED');
    expect(r.correlationId).toBeDefined();

    const allConsoleLogs = consoleErrorSpy.mock.calls
      .flat()
      .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');
    expect(allConsoleLogs).toContain('AUDIT_LOG_FAILED');
    expect(allConsoleLogs).toContain(r.correlationId!);
    expect(allConsoleLogs).not.toContain(FAKE_PASSWORD);
    expect(allConsoleLogs).not.toContain(FAKE_TOKEN);
    expect(allConsoleLogs).not.toContain(FAKE_HOST);
  });

  it('Sink 3: route response serializes postPublicationError safely with zero raw error text', async () => {
    vi.mocked(validateAndPublishDueStories).mockResolvedValueOnce([
      {
        storyId: 'story-sink3-safe',
        passed: true,
        outcome: 'published',
        checks: [
          { name: 'editorial_approval', passed: true, reason: 'Approved' },
          { name: 'fact_check', passed: true, reason: 'Verified' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
        publishedAt: new Date().toISOString(),
        postPublicationError: true,
        postPublicationErrorCategory: 'POST_PUBLICATION_EFFECTS_FAILED',
        correlationId: 'sink3-corr-id-uuid',
      },
    ]);

    const req = new NextRequest('https://thebreakdown.in/api/editorial/publish-due', {
      headers: { authorization: `Bearer ${ROUTE_AUTH_SECRET}` },
    });

    const res = await publishDueRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.ok).toBe(true);
    expect(body.published).toBe(1);
    expect(body.results[0]).toEqual({
      storyId: 'story-sink3-safe',
      passed: true,
      outcome: 'published',
      checksCount: 2,
      failedChecks: [],
      postPublicationError: true,
      postPublicationErrorCategory: 'POST_PUBLICATION_EFFECTS_FAILED',
      correlationId: 'sink3-corr-id-uuid',
    });
    // Ensure no raw error details or exception stack leaked
    expect(JSON.stringify(body)).not.toContain('error:');
    expect(JSON.stringify(body)).not.toContain('Exception');
  });

  it('Sink 4: canonical publication eventBus failure logs structured error and does not leak secrets', async () => {
    const actualCanonical = await vi.importActual<typeof import('@/lib/editorial/canonical-publication')>('@/lib/editorial/canonical-publication');
    const { eventBus } = await vi.importActual<typeof import('@/lib/events/event-bus')>('@/lib/events/event-bus');

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {
      throw new Error(`Kafka broker rejected message with credentials redis://stream_admin:${FAKE_PASSWORD}@eventstream.internal:6379`);
    });

    const dummyStory: any = {
      id: 'story-sink4',
      slug: 'story-sink4-slug',
      title: 'Sink 4 Story',
      status: 'published',
      publishedAt: new Date().toISOString(),
      author: 'author-1',
    };
    const dummyPrincipal: any = {
      userId: 'user-sink4',
      role: 'owner',
      name: 'Owner Principal',
    };

    // Must not throw
    expect(() => {
      actualCanonical.executePostPublicationEffects(dummyStory, dummyPrincipal);
    }).not.toThrow();

    expect(publishSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    const allConsoleLogs = consoleErrorSpy.mock.calls
      .flat()
      .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');

    expect(allConsoleLogs).toContain('EVENT_BUS_PUBLISH_FAILED');
    expect(allConsoleLogs).toContain('canonical_publication.event_publish_failed');
    expect(allConsoleLogs).not.toContain(FAKE_PASSWORD);
    expect(allConsoleLogs).not.toContain('eventstream.internal');
    expect(allConsoleLogs).not.toContain('stream_admin');
  });

  it('Sink 5a: worker success telemetry safely logs postPublicationError diagnostics with zero secrets', async () => {
    const successPayload = {
      ok: true,
      timestamp: new Date().toISOString(),
      totalChecked: 1,
      published: 1,
      alreadyPublished: 0,
      blocked: 0,
      skipped: 0,
      results: [
        {
          storyId: 'story-sink5a',
          passed: true,
          outcome: 'published' as const,
          checksCount: 2,
          failedChecks: [],
          postPublicationError: true,
          postPublicationErrorCategory: 'POST_PUBLICATION_EFFECTS_FAILED' as const,
          correlationId: 'corr-worker-telemetry-5a',
        },
      ],
    };

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(successPayload), { status: 200 }));

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const controller = { cron: '0 * * * *', scheduledTime: Date.now() };
    const ctx = { waitUntil: vi.fn(), passThroughOnException: vi.fn() };

    await worker.scheduled(controller, env as never, ctx as never);

    expect(consoleLogSpy).toHaveBeenCalled();
    const completedLogCall = consoleLogSpy.mock.calls.find(call => {
      const str = typeof call[0] === 'string' ? call[0] : JSON.stringify(call[0]);
      return str.includes('editorial.publish_due.complete');
    });
    expect(completedLogCall).toBeDefined();
    const completedJson = JSON.parse(completedLogCall![0] as string);
    expect(completedJson.published).toBe(1);
    expect(completedJson.details[0]).toEqual({
      storyId: 'story-sink5a',
      passed: true,
      outcome: 'published',
      checksCount: 2,
      failedChecks: [],
      postPublicationError: true,
      postPublicationErrorCategory: 'POST_PUBLICATION_EFFECTS_FAILED',
      correlationId: 'corr-worker-telemetry-5a',
    });
  });

  it('Sink 5b: worker telemetry redacts sensitive fetch rejections to safe canonical message', async () => {
    const controller = { cron: '0 * * * *', scheduledTime: Date.now() };
    const ctx = { waitUntil: vi.fn(), passThroughOnException: vi.fn() };

    fetchMock.mockRejectedValue(new Error(`Fetch failed to https://admin:${FAKE_PASSWORD}@thebreakdown.in/api/editorial/publish-due?token=${FAKE_TOKEN}`));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(worker.scheduled(controller, env as never, ctx as never)).rejects.toThrow(/request failed/);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const loggedJson = consoleErrorSpy.mock.calls
      .flat()
      .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');

    expect(loggedJson).toContain('DISPATCH_ERROR');
    expect(loggedJson).not.toContain(FAKE_PASSWORD);
    expect(loggedJson).not.toContain(FAKE_TOKEN);
    expect(loggedJson).not.toContain('admin:');
    expect(loggedJson).toContain('Canonical publishing endpoint request failed');
  });

  it('Sink 5c: worker catch block redacts sensitive error messages and propagates only approved generic error without cause', async () => {
    const controller = { cron: '0 * * * *', scheduledTime: Date.now() };
    const ctx = { waitUntil: vi.fn(), passThroughOnException: vi.fn() };

    const cfModule = await import('@/services/editorial/schedule-cf');
    const publishDueStoriesSpy = vi.spyOn(cfModule, 'publishDueStories');
    // Inject a fake error containing credentials, a hostname and a connection URI
    publishDueStoriesSpy.mockRejectedValueOnce(
      new Error(`Internal driver failure: credentials=${FAKE_PASSWORD}&token=${FAKE_TOKEN} at host=${FAKE_HOST} via uri=${FAKE_CONNECTION_STRING}`)
    );

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Confirm the scheduled invocation still rejects so the platform records failure
    let propagatedError: unknown;
    try {
      await worker.scheduled(controller, env as never, ctx as never);
    } catch (err) {
      propagatedError = err;
    }

    expect(propagatedError).toBeDefined();
    expect(propagatedError).toBeInstanceOf(Error);
    // Confirm the propagated rejection contains ONLY the approved generic message
    expect((propagatedError as Error).message).toBe('Scheduled publishing request failed');
    // Confirm the raw exception was not attached as cause
    expect((propagatedError as Error).cause).toBeUndefined();

    // Confirm the explicit worker log contains none of credentials, hostname, or connection URI
    expect(consoleErrorSpy).toHaveBeenCalled();
    const loggedJson = consoleErrorSpy.mock.calls
      .flat()
      .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');

    expect(loggedJson).toContain('DISPATCH_ERROR');
    expect(loggedJson).not.toContain(FAKE_PASSWORD);
    expect(loggedJson).not.toContain(FAKE_TOKEN);
    expect(loggedJson).not.toContain(FAKE_HOST);
    expect(loggedJson).not.toContain('postgres://');
    expect(loggedJson).toContain('Scheduled publishing request failed due to an upstream error');

    publishDueStoriesSpy.mockRestore();
  });

  it('Sink 5d: worker error logging never discloses untrusted APP_URL hostnames when origin is rejected', async () => {
    const syntheticOrigin = 'https://staging-preview.example.com';
    const syntheticEnv = {
      APP_URL: syntheticOrigin,
      CRON_SECRET: 'test-cron-secret-value-1234',
    };
    const controller = { cron: '0 * * * *', scheduledTime: Date.now() };
    const ctx = { waitUntil: vi.fn(), passThroughOnException: vi.fn() };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      let propagatedError: unknown;
      try {
        await worker.scheduled(controller, syntheticEnv as never, ctx as never);
      } catch (err) {
        propagatedError = err;
      }

      // 1. The origin is rejected with generic failure
      expect(propagatedError).toBeDefined();
      expect(propagatedError).toBeInstanceOf(Error);
      expect((propagatedError as Error).message).toBe('Scheduled publishing request failed');
      expect((propagatedError as Error).cause).toBeUndefined();

      // 2. No network dispatch occurs
      expect(fetchMock).not.toHaveBeenCalled();

      // 3. The hostname does not appear in console.error, console.warn, or telemetry
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedErrorText = consoleErrorSpy.mock.calls
        .flat()
        .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' ');

      const loggedWarnText = consoleWarnSpy.mock.calls
        .flat()
        .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' ');

      expect(loggedErrorText).not.toContain('staging-preview.example.com');
      expect(loggedErrorText).not.toContain('example.com');
      expect(loggedWarnText).not.toContain('staging-preview.example.com');

      // 4. Safe fixed diagnostic message is logged
      expect(loggedErrorText).toContain('DISPATCH_ERROR');
      expect(loggedErrorText).toContain('Canonical publishing APP_URL host is not trusted');
    } finally {
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    }
  });

  it('Sink 5e: worker error logging never discloses credentials or synthetic URLs from malformed origins', async () => {
    const syntheticCredentials = 'mock-user:mock-password';
    const syntheticOrigin = `https://${syntheticCredentials}@staging-preview.example.com/malicious-path`;
    const syntheticEnv = {
      APP_URL: syntheticOrigin,
      CRON_SECRET: 'test-cron-secret-value-1234',
    };
    const controller = { cron: '0 * * * *', scheduledTime: Date.now() };
    const ctx = { waitUntil: vi.fn(), passThroughOnException: vi.fn() };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      let propagatedError: unknown;
      try {
        await worker.scheduled(controller, syntheticEnv as never, ctx as never);
      } catch (err) {
        propagatedError = err;
      }

      // 1. Invocation fails closed
      expect(propagatedError).toBeDefined();
      expect(propagatedError).toBeInstanceOf(Error);
      expect((propagatedError as Error).message).toBe('Scheduled publishing request failed');
      expect((propagatedError as Error).cause).toBeUndefined();

      // 2. No network dispatch occurs
      expect(fetchMock).not.toHaveBeenCalled();

      // 3. Neither credentials, path, nor hostname appear in console output
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedErrorText = consoleErrorSpy.mock.calls
        .flat()
        .map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
        .join(' ');

      expect(loggedErrorText).not.toContain('mock-user');
      expect(loggedErrorText).not.toContain('mock-password');
      expect(loggedErrorText).not.toContain('staging-preview.example.com');
      expect(loggedErrorText).not.toContain('malicious-path');

      // 4. Safe fixed diagnostic message is logged
      expect(loggedErrorText).toContain('Canonical publishing APP_URL must be an HTTPS origin without credentials, path, query, or fragment');
    } finally {
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    }
  });
});
