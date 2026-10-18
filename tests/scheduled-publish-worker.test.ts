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
        checks: [
          { name: 'already_published', passed: true, reason: 'Story is already published — skipping' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-gate-blocked',
        passed: false,
        checks: [
          { name: 'fact_check', passed: false, reason: 'Senior editor verification pending' },
        ],
        checkedAt: new Date().toISOString(),
        triggeredBy: 'cron',
      },
      {
        storyId: 'story-worker-skipped',
        passed: false,
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
        postPublicationError: 'Webhook delivery failed: HTTP 504 Gateway Timeout',
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
      postPublicationError: 'Webhook delivery failed: HTTP 504 Gateway Timeout',
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
  });
});

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

  function createMockDb(initialStories: any[] = [], initialSchedule: any[] = [], failAtomicClaimIds: string[] = []) {
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
            };
          },
          update: (data: any) => {
            updatePayload = data;
            return builder;
          },
          then: (resolve: any) => {
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
    expect(results[0].postPublicationError).toContain('Search index webhook HTTP 504 Gateway Timeout');
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
});
