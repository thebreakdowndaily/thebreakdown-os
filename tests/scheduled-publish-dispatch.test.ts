import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as publishDuePreflight } from '../app/api/editorial/publish-due/preflight/route';
import { publishDueStories } from '../services/editorial/schedule-cf';
import scheduledWorker from '../workers/scheduled-publish/index';

const APP_URL = 'https://thebreakdown.in';
const CRON_SECRET = 'test-cron-secret';
const NOW = new Date('2026-10-26T10:00:00.000Z');
const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET;

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const validResult = {
  storyId: 'story-test-1',
  passed: false,
  checksCount: 1,
  failedChecks: ['hero_image_approval'],
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (ORIGINAL_CRON_SECRET === undefined) {
    delete process.env.CRON_SECRET;
  } else {
    process.env.CRON_SECRET = ORIGINAL_CRON_SECRET;
  }
});

describe('read-only scheduled publication preflight route', () => {
  it('rejects unauthenticated callers and returns a fixed no-op contract only to the correct secret', async () => {
    process.env.CRON_SECRET = CRON_SECRET;

    const unauthenticated = await publishDuePreflight(
      new NextRequest('https://thebreakdown.in/api/editorial/publish-due/preflight'),
    );
    expect(unauthenticated.status).toBe(401);

    const authorized = await publishDuePreflight(new NextRequest(
      'https://thebreakdown.in/api/editorial/publish-due/preflight',
      { headers: { authorization: 'Bearer ' + CRON_SECRET } },
    ));
    expect(authorized.status).toBe(200);
    expect(await authorized.json()).toMatchObject({
      ok: true,
      mode: 'preflight',
      dryRun: true,
      totalChecked: 0,
      gatePassed: 0,
      blocked: 0,
      results: [],
    });
  });
});

describe('scheduled publish canonical dispatch contract', () => {
  it('fails closed without CRON_SECRET and makes no request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await publishDueStories({ APP_URL }, NOW);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result[0]).toMatchObject({
      passed: false,
      checksCount: 1,
      failedChecks: ['canonical_cron_secret'],
    });
  });

  it('fails closed when APP_URL is missing and when dispatch times out', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const missingAppUrl = await publishDueStories({ CRON_SECRET }, NOW);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(missingAppUrl[0].failedChecks).toEqual(['canonical_app_url']);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('The operation timed out', 'TimeoutError')),
    );
    const timedOut = await publishDueStories({ APP_URL, CRON_SECRET }, NOW);

    expect(timedOut[0].passed).toBe(false);
    expect(timedOut[0].failedChecks).toEqual(['canonical_dispatch_reachability']);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Canonical cron dispatch timed out (10s)'),
    );
  });

  it('rejects HTTP URLs and non-origin APP_URL values before sending the secret', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const insecure = await publishDueStories({ APP_URL: 'http://thebreakdown.in', CRON_SECRET }, NOW);
    const pathInjected = await publishDueStories({
      APP_URL: 'https://thebreakdown.in/untrusted-path',
      CRON_SECRET,
    }, NOW);
    const foreignHost = await publishDueStories({
      APP_URL: 'https://attacker.example',
      CRON_SECRET,
    }, NOW);
    const customPort = await publishDueStories({
      APP_URL: 'https://thebreakdown.in:8443',
      CRON_SECRET,
    }, NOW);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(insecure[0].failedChecks).toEqual(['canonical_app_url']);
    expect(pathInjected[0].failedChecks).toEqual(['canonical_app_url']);
    expect(foreignHost[0].failedChecks).toEqual(['canonical_app_url']);
    expect(customPort[0].failedChecks).toEqual(['canonical_app_url']);
  });

  it('defaults to a non-publishing preflight against the fixed canonical host', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      ok: true,
      mode: 'preflight',
      dryRun: true,
      results: [],
    }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await publishDueStories({ APP_URL, CRON_SECRET }, NOW);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://thebreakdown.in/api/editorial/publish-due/preflight',
      expect.objectContaining({
        method: 'GET',
        redirect: 'error',
        headers: { Authorization: 'Bearer ' + CRON_SECRET },
      }),
    );
    expect(result).toEqual([]);
  });

  it('uses the live publishing endpoint only when DRY_RUN is explicitly false', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      ok: true,
      mode: 'live',
      dryRun: false,
      results: [validResult],
    }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await publishDueStories({ APP_URL, CRON_SECRET, DRY_RUN: 'false' }, NOW);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://thebreakdown.in/api/editorial/publish-due',
      expect.objectContaining({
        method: 'GET',
        redirect: 'error',
        headers: { Authorization: 'Bearer ' + CRON_SECRET },
      }),
    );
    expect(result).toEqual([validResult]);
  });

  it('fails closed on non-2xx responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 })));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await publishDueStories({ APP_URL, CRON_SECRET }, NOW);

    expect(result[0].passed).toBe(false);
    expect(result[0].failedChecks).toEqual(['canonical_dispatch_response']);
  });

  it('fails closed on malformed JSON and invalid response shapes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not-json', { status: 200 })));
    const malformed = await publishDueStories({ APP_URL, CRON_SECRET }, NOW);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({
      ok: true,
      mode: 'preflight',
      dryRun: true,
      results: [{ storyId: 'story-test-1', passed: true, checks: [] }],
    })));
    const invalidShape = await publishDueStories({ APP_URL, CRON_SECRET }, NOW);

    expect(malformed[0].failedChecks).toEqual(['canonical_dispatch_invalid_json']);
    expect(invalidShape[0].failedChecks).toEqual(['canonical_dispatch_response_shape']);
  });

  it('fails closed on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await publishDueStories({ APP_URL, CRON_SECRET }, NOW);

    expect(result[0].passed).toBe(false);
    expect(result[0].failedChecks).toEqual(['canonical_dispatch_reachability']);
  });

  it('worker logs successful preflight as a non-publishing check', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({
      ok: true, mode: 'preflight', dryRun: true, results: [],
    })));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await scheduledWorker.scheduled(
      { cron: '0 * * * *', scheduledTime: NOW.getTime() } as never,
      { APP_URL, CRON_SECRET } as never,
      {} as never,
    );

    const completionLine = logSpy.mock.calls
      .map(([line]) => String(line))
      .find((line) => line.includes('"event":"editorial.publish_due.preflight.complete"'));

    expect(completionLine).toBeDefined();
    expect(JSON.parse(completionLine as string)).toMatchObject({
      mode: 'preflight',
      dryRun: true,
      status: 'ok',
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('worker logs preflight failures separately from editorial story blocks', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 })));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await scheduledWorker.scheduled(
      { cron: '0 * * * *', scheduledTime: NOW.getTime() } as never,
      { APP_URL, CRON_SECRET } as never,
      {} as never,
    );

    const failureLine = errorSpy.mock.calls
      .map(([line]) => String(line))
      .find((line) => String(line).includes('"event":"editorial.publish_due.preflight.failed"'));

    expect(failureLine).toBeDefined();
    expect(JSON.parse(failureLine as string)).toMatchObject({
      event: 'editorial.publish_due.preflight.failed',
      mode: 'preflight',
      dryRun: true,
      failedChecks: ['canonical_dispatch_response'],
    });
    expect(logSpy.mock.calls.some(([line]) => String(line).includes('"event":"editorial.publish_due.preflight.complete"'))).toBe(false);
  });

  it('worker logs the canonical summary shape without dereferencing missing checks arrays', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({
      ok: true, mode: 'live', dryRun: false, results: [validResult],
    })));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await scheduledWorker.scheduled(
      { cron: '0 * * * *', scheduledTime: NOW.getTime() } as never,
      { APP_URL, CRON_SECRET, DRY_RUN: 'false' } as never,
      {} as never,
    );

    const completionLine = logSpy.mock.calls
      .map(([line]) => String(line))
      .find((line) => line.includes('"event":"editorial.publish_due.complete"'));

    expect(completionLine).toBeDefined();
    const completion = JSON.parse(completionLine as string) as {
      gatePassed: number;
      blocked: number;
      details: Array<{ failedChecks: string[]; checksCount: number }>;
    };
    expect(completion.gatePassed).toBe(0);
    expect(completion.blocked).toBe(1);
    expect(completion).not.toHaveProperty('published');
    expect(completion.details[0]).toMatchObject({
      checksCount: 1,
      failedChecks: ['hero_image_approval'],
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
