import { afterEach, describe, expect, it, vi } from 'vitest';
import { publishDueStories } from '@/services/editorial/schedule-cf';

const env = {
  APP_URL: 'https://newsroom.example.test',
  CRON_SECRET: 'test-cron-secret',
};

const successResult = {
  storyId: 'story-1',
  passed: true,
  checksCount: 10,
  failedChecks: [],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Cloudflare scheduled publisher canonical dispatch', () => {
  it('uses the actual canonical API response contract and retries a transient failure', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('temporary unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ok: true,
        results: [successResult],
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));

    await expect(publishDueStories(env)).resolves.toEqual([successResult]);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://newsroom.example.test/api/editorial/publish-due');
    expect(fetchSpy.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: 'Bearer test-cron-secret',
    });
  });

  it('fails after bounded retries rather than publishing through a database RPC fallback', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('unavailable', { status: 503 }));

    await expect(publishDueStories(env)).rejects.toThrow(
      'Canonical publication dispatch failed after 3 attempts; no fallback publication path was executed.'
    );
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy.mock.calls.every(([url]) => String(url).includes('/api/editorial/publish-due'))).toBe(true);
  });

  it('fails before dispatch when the cron secret is missing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(publishDueStories({ ...env, CRON_SECRET: '' })).rejects.toThrow(
      'Canonical publication dispatch requires CRON_SECRET.'
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a successful HTTP response with an invalid response contract', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ results: 'not-an-array' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));
    await expect(publishDueStories(env)).rejects.toThrow(
      'Canonical publication dispatch failed after 3 attempts'
    );
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});
