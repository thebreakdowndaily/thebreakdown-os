import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from '@/workers/scheduled-publish/index';
import { publishDueStories } from '@/services/editorial/schedule-cf';

vi.mock('@/services/editorial/schedule-cf', () => ({
  publishDueStories: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('scheduled publishing worker failure reporting', () => {
  it('rejects the scheduled invocation when canonical publication fails', async () => {
    const error = new Error('canonical publication endpoint unavailable');
    vi.mocked(publishDueStories).mockRejectedValueOnce(error);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = worker.scheduled(
      { cron: '0 * * * *', scheduledTime: Date.parse('2026-10-22T00:00:00Z') },
      { APP_URL: 'https://thebreakdown.in', CRON_SECRET: 'test-secret' },
      { waitUntil: vi.fn(), passThroughOnException: vi.fn() },
    );

    await expect(result).rejects.toBe(error);
    expect(publishDueStories).toHaveBeenCalledTimes(1);
  });
});
