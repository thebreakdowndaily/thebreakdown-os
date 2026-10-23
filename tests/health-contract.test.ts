import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as healthGet } from '../app/api/health/route';
import { verifyDeployment } from '../scripts/verify-deployment-health';

describe('Health Contract & Commit Parity Specification', () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('app/api/health/route.ts semantics', () => {
    it('1. Liveness works when the database is unavailable', async () => {
      // Point database configuration to an unreachable service and break fetch
      process.env.SUPABASE_URL = 'https://mskyhaunnlwtwvsqcmav.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
      global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED: Database connection dropped'));

      const req = new NextRequest('https://thebreakdown.in/api/health?type=liveness');
      const res = await healthGet(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('live');
      expect(data.check).toBe('liveness');
      expect(data.commitSha).toBeDefined();
      expect(data.timestamp).toBeDefined();
      // Liveness must not probe the database
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('2. Readiness fails when required configuration is missing', async () => {
      // Production request without SUPABASE_URL / key
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_ANON_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.STAGING_SUPABASE_URL;
      delete process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY;

      const req = new NextRequest('https://thebreakdown.in/api/health?type=readiness');
      const res = await healthGet(req);

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.status).toBe('unhealthy');
      expect(data.check).toBe('readiness');
      // Subsystems persistence should be not_configured
      expect(data.subsystems?.persistence).toBe('not_configured');
    });

    it('3. Readiness fails when the configured database is inaccessible', async () => {
      process.env.SUPABASE_URL = 'https://mskyhaunnlwtwvsqcmav.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
      global.fetch = vi.fn().mockRejectedValue(new Error('ETIMEDOUT'));

      const req = new NextRequest('https://thebreakdown.in/api/health?type=readiness');
      const res = await healthGet(req);

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.status).toBe('unhealthy');
      expect(data.subsystems?.persistence).toBe('unavailable');
    });

    it('4. A staging database cannot satisfy production readiness', async () => {
      // In production host, configuring staging Supabase URL must fail readiness
      process.env.SUPABASE_URL = 'https://lvfovvidtowadmnggzzf.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-staging-key';

      // Even if fetch returns 200, cross-environment connection must be rejected
      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ swagger: '2.0' }), {
          status: 200,
          headers: { 'content-type': 'application/openapi+json' },
        }),
      );

      const req = new NextRequest('https://thebreakdown.in/api/health?type=readiness');
      const res = await healthGet(req);

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.status).toBe('unhealthy');
      expect(data.subsystems?.persistence).toBe('degraded');
      // Probing cross-environment database should have been blocked before calling fetch
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('4b. A production database cannot satisfy staging readiness', async () => {
      // In staging host, configuring production Supabase URL must fail readiness
      process.env.STAGING_SUPABASE_URL = 'https://mskyhaunnlwtwvsqcmav.supabase.co';
      process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY = 'test-prod-key';

      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ swagger: '2.0' }), {
          status: 200,
          headers: { 'content-type': 'application/openapi+json' },
        }),
      );

      const req = new NextRequest('https://thebreakdown-os-staging.vercel.app/api/health?type=readiness');
      const res = await healthGet(req);

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.status).toBe('unhealthy');
      expect(data.subsystems?.persistence).toBe('degraded');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('5. Unexpected HTTP responses do not establish dependency health', async () => {
      process.env.SUPABASE_URL = 'https://mskyhaunnlwtwvsqcmav.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

      // Test HTTP 404 from REST root (previously misclassified as healthy)
      global.fetch = vi.fn().mockResolvedValue(
        new Response('Not Found', {
          status: 404,
          headers: { 'content-type': 'text/plain' },
        }),
      );

      const req404 = new NextRequest('https://thebreakdown.in/api/health?type=readiness');
      const res404 = await healthGet(req404);
      expect(res404.status).toBe(503);
      const data404 = await res404.json();
      expect(data404.status).toBe('unhealthy');
      expect(data404.subsystems?.persistence).toBe('degraded');

      // Test HTTP 500
      global.fetch = vi.fn().mockResolvedValue(
        new Response('Internal Server Error', {
          status: 500,
          headers: { 'content-type': 'text/plain' },
        }),
      );

      const req500 = new NextRequest('https://thebreakdown.in/api/health?type=readiness');
      const res500 = await healthGet(req500);
      expect(res500.status).toBe(503);
      const data500 = await res500.json();
      expect(data500.status).toBe('unhealthy');
      expect(data500.subsystems?.persistence).toBe('degraded');
    });

    it('6. Unverified subsystems are never represented as operational', async () => {
      process.env.SUPABASE_URL = 'https://mskyhaunnlwtwvsqcmav.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ swagger: '2.0' }), {
          status: 200,
          headers: { 'content-type': 'application/openapi+json' },
        }),
      );

      const req = new NextRequest('https://thebreakdown.in/api/health?type=readiness');
      const res = await healthGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('healthy');
      expect(data.subsystems).toBeDefined();

      // Persistence is verified
      expect(data.subsystems.persistence).toBe('verified');

      // Unverified subsystems must strictly be 'not_checked', never 'operational'
      expect(data.subsystems.domainRegistry).toBe('not_checked');
      expect(data.subsystems.projectionEngine).toBe('not_checked');
      expect(data.subsystems.editorialState).toBe('not_checked');
      expect(data.subsystems.researchPlatform).toBe('not_checked');
    });

    it('6b. Adversarial test: spoofed x-forwarded-host on production cannot force staging credentials', async () => {
      // Platform is deployed in production
      process.env.VERCEL_ENV = 'production';
      process.env.SUPABASE_URL = 'https://mskyhaunnlwtwvsqcmav.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'prod-key';
      delete process.env.STAGING_SUPABASE_URL;
      delete process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY;

      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ swagger: '2.0' }), {
          status: 200,
          headers: { 'content-type': 'application/openapi+json' },
        }),
      );

      // Caller sends spoofed x-forwarded-host attempting to make production select staging DB
      const spoofedReq = new NextRequest('https://thebreakdown.in/api/health?type=readiness', {
        headers: {
          'x-forwarded-host': 'thebreakdown-os-staging.vercel.app',
          'host': 'thebreakdown-os-staging.vercel.app',
        },
      });

      const res = await healthGet(spoofedReq);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('healthy');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('mskyhaunnlwtwvsqcmav.supabase.co'),
        expect.anything(),
      );
      expect(data.environment).toBe('production');
    });

    it('6c. Adversarial test: spoofed x-forwarded-host on staging cannot force production credentials', async () => {
      // Platform is deployed in staging
      process.env.VERCEL_ENV = 'preview';
      process.env.STAGING_SUPABASE_URL = 'https://lvfovvidtowadmnggzzf.supabase.co';
      process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY = 'staging-key';
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ swagger: '2.0' }), {
          status: 200,
          headers: { 'content-type': 'application/openapi+json' },
        }),
      );

      // Caller sends spoofed x-forwarded-host attempting to make staging select production DB
      const spoofedReq = new NextRequest('https://thebreakdown-os-staging.vercel.app/api/health?type=readiness', {
        headers: {
          'x-forwarded-host': 'thebreakdown.in',
          'host': 'thebreakdown.in',
        },
      });

      const res = await healthGet(spoofedReq);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('healthy');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('lvfovvidtowadmnggzzf.supabase.co'),
        expect.anything(),
      );
      expect(data.environment).toBe('staging');
    });

    it('6d. Adversarial test: fallback URL host inspection ignores spoofed x-forwarded-host and Host headers', async () => {
      delete process.env.VERCEL_ENV;
      delete process.env.APP_ENV;
      delete process.env.TARGET_ENV;
      delete process.env.TEST_TARGET_ENV;

      process.env.SUPABASE_URL = 'https://mskyhaunnlwtwvsqcmav.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'prod-key';

      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ swagger: '2.0' }), {
          status: 200,
          headers: { 'content-type': 'application/openapi+json' },
        }),
      );

      // Request to canonical production URL with conflicting spoofed x-forwarded-host header
      const spoofedReq = new NextRequest('https://thebreakdown.in/api/health?type=readiness', {
        headers: {
          'x-forwarded-host': 'thebreakdown-os-staging.vercel.app',
        },
      });

      const res = await healthGet(spoofedReq);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.environment).toBe('production');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('mskyhaunnlwtwvsqcmav.supabase.co'),
        expect.anything(),
      );
    });
  });

  describe('scripts/verify-deployment-health.ts commit parity', () => {
    const validFullSha = 'c3ee9902948e35e14de06bfacab0039e3bcc48b8';

    it('7. Full matching SHAs pass', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/health')) {
          return Promise.resolve(new Response(JSON.stringify({
            status: 'healthy',
            commitSha: validFullSha,
          }), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        if (url.endsWith('/newsroom')) {
          return Promise.resolve(new Response(null, {
            status: 307,
            headers: { location: 'https://thebreakdown.in/login' },
          }));
        }
        return Promise.resolve(new Response('OK', {
          status: 200,
          headers: { 'strict-transport-security': 'max-age=63072000' },
        }));
      });

      vi.stubGlobal('fetch', fetchMock);

      const result = await verifyDeployment({
        baseUrl: 'https://thebreakdown.in',
        expectedCommit: validFullSha,
        maxAttempts: 1,
        intervalMs: 10,
      });

      expect(result.success).toBe(true);
      expect(result.health.commitSha).toBe(validFullSha);
    });

    it('8. Different full SHAs sharing a seven-character prefix fail', async () => {
      const collidingSha = 'c3ee990fffffffffffffffffffffffffffff48b8';

      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/health')) {
          return Promise.resolve(new Response(JSON.stringify({
            status: 'healthy',
            commitSha: collidingSha,
          }), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        return Promise.resolve(new Response('OK', { status: 200 }));
      });

      vi.stubGlobal('fetch', fetchMock);

      await expect(
        verifyDeployment({
          baseUrl: 'https://thebreakdown.in',
          expectedCommit: validFullSha,
          maxAttempts: 2,
          intervalMs: 10,
        }),
      ).rejects.toThrow('Commit SHA mismatch after 2 attempts');
    });

    it('9. Missing or malformed SHAs fail', async () => {
      // Case A: missing commitSha
      const fetchMockMissing = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/health')) {
          return Promise.resolve(new Response(JSON.stringify({
            status: 'healthy',
          }), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        return Promise.resolve(new Response('OK', { status: 200 }));
      });

      vi.stubGlobal('fetch', fetchMockMissing);

      await expect(
        verifyDeployment({
          baseUrl: 'https://thebreakdown.in',
          expectedCommit: validFullSha,
          maxAttempts: 1,
          intervalMs: 10,
        }),
      ).rejects.toThrow('missing or undefined commitSha');

      // Case B: abbreviated SHA when full SHA is expected
      const fetchMockAbbr = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/health')) {
          return Promise.resolve(new Response(JSON.stringify({
            status: 'healthy',
            commitSha: 'c3ee990',
          }), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        return Promise.resolve(new Response('OK', { status: 200 }));
      });

      vi.stubGlobal('fetch', fetchMockAbbr);

      await expect(
        verifyDeployment({
          baseUrl: 'https://thebreakdown.in',
          expectedCommit: validFullSha,
          maxAttempts: 1,
          intervalMs: 10,
        }),
      ).rejects.toThrow('malformed or abbreviated SHA');
    });

    it('10. Deployment propagation retries remain bounded', async () => {
      let attempts = 0;
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/health')) {
          attempts++;
          return Promise.resolve(new Response(JSON.stringify({
            status: 'healthy',
            commitSha: '0000000000000000000000000000000000000000',
          }), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        return Promise.resolve(new Response('OK', { status: 200 }));
      });

      vi.stubGlobal('fetch', fetchMock);

      const maxAttempts = 3;
      await expect(
        verifyDeployment({
          baseUrl: 'https://thebreakdown.in',
          expectedCommit: validFullSha,
          maxAttempts,
          intervalMs: 10,
        }),
      ).rejects.toThrow(`Commit SHA mismatch after ${maxAttempts} attempts`);

      expect(attempts).toBe(maxAttempts);
    });
  });
});
