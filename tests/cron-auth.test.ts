import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { isValidCronRequest } from '@/lib/security/cron-auth';
import { GET as newsroomGET, POST as newsroomPOST } from '@/app/api/v2/newsroom/observations/pull/route';
import { GET as radarGET, POST as radarPOST } from '@/app/api/v2/radar/poll/route';
import { middleware } from '@/middleware';
import { RadarPipeline } from '@/services/radar/pipeline';
import * as pibAdapter from '@/lib/intelligence/pib-adapter';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import * as apiAuth from '@/utils/api-auth';

describe('Phase 2F — Cron Authentication & Remediation', () => {
  const TEST_SECRET = 'test-cron-secret-super-secure-token-987';
  const originalEnvSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = TEST_SECRET;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalEnvSecret;
    vi.restoreAllMocks();
  });

  describe('Unit: isValidCronRequest Helper', () => {
    it('returns false when CRON_SECRET is undefined or empty', () => {
      delete process.env.CRON_SECRET;
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });
      expect(isValidCronRequest(req)).toBe(false);

      process.env.CRON_SECRET = '   ';
      expect(isValidCronRequest(req)).toBe(false);
    });

    it('returns false when Authorization header is missing', () => {
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll');
      expect(isValidCronRequest(req)).toBe(false);
    });

    it('returns false when Authorization header has wrong scheme or secret', () => {
      const wrongSecretReq = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        headers: { authorization: 'Bearer invalid-token' },
      });
      expect(isValidCronRequest(wrongSecretReq)).toBe(false);

      const wrongSchemeReq = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        headers: { authorization: `Basic ${TEST_SECRET}` },
      });
      expect(isValidCronRequest(wrongSchemeReq)).toBe(false);
    });

    it('returns true when Authorization header matches Bearer <CRON_SECRET>', () => {
      const validReq = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });
      expect(isValidCronRequest(validReq)).toBe(true);
    });
  });

  describe('Route: /api/v2/newsroom/observations/pull', () => {
    beforeEach(() => {
      vi.spyOn(newsroomIntelligenceCore, 'ensureLoaded').mockResolvedValue();
      vi.spyOn(pibAdapter, 'pullPibObservations').mockResolvedValue({
        pulled: 5,
        created: 2,
        updated: 1,
        unchanged: 2,
        items: [],
      } as any);
    });

    it('rejects GET unauthenticated request with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/newsroom/observations/pull', {
        method: 'GET',
      });
      const res = await newsroomGET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('unauthorized');
    });

    it('rejects GET request with incorrect Bearer token with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/newsroom/observations/pull', {
        method: 'GET',
        headers: { authorization: 'Bearer wrong-secret' },
      });
      const res = await newsroomGET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('unauthorized');
    });

    it('accepts GET request with valid Bearer token and returns 200', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/newsroom/observations/pull', {
        method: 'GET',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });
      const res = await newsroomGET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.pulled).toBe(5);
      expect(json.timestamp).toBeDefined();
    });

    it('preserves POST behavior with valid Bearer token', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/newsroom/observations/pull', {
        method: 'POST',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });
      const res = await newsroomPOST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.pulled).toBe(5);
    });

    it('rejects POST unauthenticated request with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/newsroom/observations/pull', {
        method: 'POST',
      });
      const res = await newsroomPOST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Route: /api/v2/radar/poll', () => {
    beforeEach(() => {
      vi.spyOn(RadarPipeline.prototype, 'poll').mockResolvedValue({
        id: 'mock-radar-run',
        runId: 'mock-radar-run',
        generatedAt: new Date().toISOString(),
        cycleDurationMs: 45,
        sourcesConsidered: 10,
        sourcesPolled: 5,
        successful: 5,
        failed: 0,
        newArtifacts: 1,
        changedArtifacts: 0,
        unchanged: 4,
        eventsOrSignalsCreated: 1,
        status: 'completed',
        medianDetectionLatencyMs: 500,
        p90DetectionLatencyMs: 1200,
        sourceFailureRate: 0,
        duplicateRate: 0,
      });
    });

    it('rejects GET unauthenticated request with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'GET',
      });
      const res = await radarGET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('unauthorized');
    });

    it('rejects GET request with incorrect Bearer token with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'GET',
        headers: { authorization: 'Bearer bad-secret' },
      });
      const res = await radarGET(req);
      expect(res.status).toBe(401);
    });

    it('accepts GET request with valid Bearer token and returns 200 with schema', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'GET',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });
      const res = await radarGET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.runId).toBe('mock-radar-run');
      expect(json.sourcesConsidered).toBe(10);
      expect(json.successful).toBe(5);
    });

    it('accepts POST request with valid Bearer token and returns 200', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'POST',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });
      const res = await radarPOST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.runId).toBe('mock-radar-run');
    });

    it('accepts request when authenticated via x-api-key', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'GET',
        headers: { 'x-api-key': 'tb_live_test_api_key' },
      });
      const res = await radarGET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.runId).toBe('mock-radar-run');
    });
  });

  describe('Integration: middleware.ts', () => {
    it('newsroom pull: blocks unauthenticated requests with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/newsroom/observations/pull', {
        method: 'GET',
      });
      const res = await middleware(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('newsroom pull: blocks incorrect bearer token with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/newsroom/observations/pull', {
        method: 'GET',
        headers: { authorization: 'Bearer wrong-secret' },
      });
      const res = await middleware(req);
      expect(res.status).toBe(401);
    });

    it('newsroom pull: allows valid Bearer token through', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/newsroom/observations/pull', {
        method: 'GET',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });
      const res = await middleware(req);
      // Next middleware returns 200 or x-middleware-next
      expect(res.status === 200 || res.headers.get('x-middleware-next') === '1').toBe(true);
    });

    it('radar poll: blocks unauthenticated request with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'GET',
      });
      const res = await middleware(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('radar poll: blocks incorrect bearer token without x-api-key with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'GET',
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = await middleware(req);
      expect(res.status).toBe(401);
    });

    it('radar poll: allows valid cron Bearer token through', async () => {
      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'GET',
        headers: { authorization: `Bearer ${TEST_SECRET}` },
      });
      const res = await middleware(req);
      expect(res.status === 200 || res.headers.get('x-middleware-next') === '1').toBe(true);
    });

    it('radar poll: allows valid x-api-key through API key gate', async () => {
      vi.spyOn(apiAuth, 'validateApiKeyAsync').mockResolvedValue({
        id: 'key-123',
        key: 'tb_live_test_key',
        tier: 'standard_api',
        allowed: true,
      } as any);

      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'GET',
        headers: { 'x-api-key': 'tb_live_test_key' },
      });
      const res = await middleware(req);
      expect(res.status === 200 || res.headers.get('x-middleware-next') === '1').toBe(true);
    });

    it('radar poll: rejects invalid x-api-key with 403', async () => {
      vi.spyOn(apiAuth, 'validateApiKeyAsync').mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/v2/radar/poll', {
        method: 'GET',
        headers: { 'x-api-key': 'tb_live_bad_key' },
      });
      const res = await middleware(req);
      expect(res.status).toBe(403);
    });
  });
});
