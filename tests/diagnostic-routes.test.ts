import { NextRequest } from 'next/server';
import { describe, expect, test } from 'vitest';
import { GET as analyticsGet, DELETE as analyticsDelete, POST as analyticsPost } from '../app/api/analytics/route';
import { GET as storyAnalyticsGet } from '../app/api/analytics/story/[slug]/route';
import { GET as healthGet } from '../app/api/health/route';
import { createApiKey } from '../features/auth/api-keys/service';

describe('diagnostic route exposure', () => {
  test('analytics reads and clears require authentication outside development', async () => {
    const request = new NextRequest('https://thebreakdown.in/api/analytics');
    expect((await analyticsGet(request)).status).toBe(401);
    expect((await analyticsDelete(request)).status).toBe(401);
  });

  test('story analytics endpoint rejects unauthenticated requests', async () => {
    const request = new NextRequest('https://thebreakdown.in/api/analytics/story/rbi-repo-rate');
    const res = await storyAnalyticsGet(request, { params: Promise.resolve({ slug: 'rbi-repo-rate' }) });
    expect(res.status).toBe(401);
  });

  test('story analytics endpoint resolves in-process for authenticated admin without HTTP loopback', async () => {
    const { raw_key: adminKey } = await createApiKey({ name: 'Admin Reporter', role: 'admin' });

    // Seed an analytics event via POST
    const postReq = new NextRequest('https://thebreakdown.in/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'sess-test-12345',
        events: [
          {
            type: 'section_view',
            storySlug: 'rbi-repo-rate',
            sectionId: 'sec-1',
            duration: 5000,
            sessionId: 'sess-test-12345',
            ts: new Date().toISOString(),
          },
        ],
      }),
      headers: { 'content-type': 'application/json' },
    });
    await analyticsPost(postReq);

    // Call story analytics with admin key
    const authReq = new NextRequest('https://thebreakdown.in/api/analytics/story/rbi-repo-rate', {
      headers: { 'x-api-key': adminKey },
    });
    const res = await storyAnalyticsGet(authReq, { params: Promise.resolve({ slug: 'rbi-repo-rate' }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.slug).toBe('rbi-repo-rate');
    expect(data.totalEvents).toBeGreaterThanOrEqual(1);
    expect(data.analytics).not.toBeNull();
  });

  test('health returns liveness only', async () => {
    expect(await (await healthGet()).json()).toEqual({ status: 'ok' });
  });
});

