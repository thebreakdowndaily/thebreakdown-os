import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v2/newsroom/alerts/webhook/route';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Newsroom webhook payload bounds', () => {
  it('rejects a payload over 256 KiB before signature verification or JSON parsing', async () => {
    vi.stubEnv('RADAR_ALERT_WEBHOOK_SECRET', 'test-only-webhook-secret');
    const oversizedBody = 'x'.repeat(256 * 1024 + 1);
    const request = new NextRequest('http://localhost/api/v2/newsroom/alerts/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-breakdown-signature': 'not-a-valid-signature',
      },
      body: oversizedBody,
    });

    const response = await POST(request);
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Payload exceeds maximum permitted size (256 KB)',
    });
  });
});
