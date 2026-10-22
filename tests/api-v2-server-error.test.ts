import { afterEach, describe, expect, it, vi } from 'vitest';
import { serverError } from '../lib/api-v2';

describe('v2 API server error responses', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('does not expose internal exception messages in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const internalMessage = 'relation public.editorial_schedule does not exist';
    const response = serverError(new Error(internalMessage));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: 'Internal server error' });
    expect(JSON.stringify(payload)).not.toContain(internalMessage);
  });

  it('retains diagnostic details in non-production environments', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const internalMessage = 'relation public.editorial_schedule does not exist';
    const response = serverError(new Error(internalMessage));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      error: 'Internal server error',
      details: internalMessage,
    });
  });
});
