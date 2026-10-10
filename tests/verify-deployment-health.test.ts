import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseArgs, verifyDeployment } from '../scripts/verify-deployment-health';

describe('Deployment Health Verification & Parity Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly parses command-line arguments and automatically enables commit parity on --commit', () => {
    const opts = parseArgs([
      '--url', 'https://thebreakdown.in',
      '--commit', 'abcd1234567890',
      '--attempts', '5',
      '--interval', '2',
      '--bypass-token', 'test_secret_token_123',
    ]);

    expect(opts.baseUrl).toBe('https://thebreakdown.in');
    expect(opts.expectedCommit).toBe('abcd1234567890');
    expect(opts.checkCommitParity).toBe(true);
    expect(opts.maxAttempts).toBe(5);
    expect(opts.intervalMs).toBe(2000);
    expect(opts.bypassToken).toBe('test_secret_token_123');
  });

  it('succeeds when real application responds healthy with matching commit SHA', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'healthy',
          check: 'readiness',
          timestamp: '2026-10-10T12:00:00Z',
          version: '1.0.0-beta',
          commitSha: '610b48297bcdedbc6c0b2ea8e6ceff05005fd7a0',
          subsystems: {
            domainRegistry: 'operational',
            projectionEngine: 'operational',
            editorialState: 'operational',
            researchPlatform: 'operational',
            persistence: 'operational',
          },
        }), { status: 200, headers: { 'content-type': 'application/json' } }));
      }
      if (url.endsWith('/newsroom')) {
        return Promise.resolve(new Response(null, {
          status: 307,
          headers: { location: 'https://thebreakdown.in/login' },
        }));
      }
      return Promise.resolve(new Response('<html>Canonical The Breakdown</html>', {
        status: 200,
        headers: { 'strict-transport-security': 'max-age=63072000' },
      }));
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await verifyDeployment({
      baseUrl: 'https://thebreakdown.in',
      expectedCommit: '610b482',
      maxAttempts: 1,
      intervalMs: 10,
    });

    expect(result.success).toBe(true);
    expect(result.state).toBe('HEALTHY');
    expect(result.health.commitSha).toBe('610b48297bcdedbc6c0b2ea8e6ceff05005fd7a0');
    expect(result.homepageStatus).toBe(200);
    expect(result.newsroomRedirectStatus).toBe(307);
    expect(result.hstsPresent).toBe(true);
  });

  it('strictly rejects Vercel SSO redirects and never synthesizes a healthy response (PROTECTED_BUT_UNVERIFIED)', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve(new Response('<html>SSO Login</html>', {
          status: 302,
          headers: {
            location: 'https://vercel.com/sso-api?url=https%3A%2F%2Fthebreakdown.in%2Fapi%2Fhealth',
            'x-vercel-id': 'iad1::edge-id-12345',
          },
        }));
      }
      return Promise.resolve(new Response('OK', { status: 200 }));
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      verifyDeployment({
        baseUrl: 'https://thebreakdown-os-staging.vercel.app',
        expectedCommit: '610b482',
        maxAttempts: 2,
        intervalMs: 10,
      }),
    ).rejects.toThrow('PROTECTED_BUT_UNVERIFIED');
  });

  it('fails release verification when deployed commit SHA is mismatched after retries', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'healthy',
          commitSha: 'old_previous_commit_1111111',
        }), { status: 200, headers: { 'content-type': 'application/json' } }));
      }
      return Promise.resolve(new Response('OK', { status: 200 }));
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      verifyDeployment({
        baseUrl: 'https://thebreakdown.in',
        expectedCommit: 'new_target_commit_2222222',
        maxAttempts: 2,
        intervalMs: 10,
      }),
    ).rejects.toThrow('Commit SHA mismatch after 2 attempts');
  });

  it('fails release verification when deployed commit SHA is missing or unspecified', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'healthy',
          // commitSha omitted
        }), { status: 200, headers: { 'content-type': 'application/json' } }));
      }
      return Promise.resolve(new Response('OK', { status: 200 }));
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      verifyDeployment({
        baseUrl: 'https://thebreakdown.in',
        expectedCommit: '610b482',
        maxAttempts: 1,
        intervalMs: 10,
      }),
    ).rejects.toThrow('missing or undefined commitSha');
  });

  it('fails verification when response is malformed non-JSON', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve(new Response('Internal Webpack Crash <<malformed>>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }));
      }
      return Promise.resolve(new Response('OK', { status: 200 }));
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      verifyDeployment({
        baseUrl: 'https://thebreakdown.in',
        expectedCommit: '610b482',
        maxAttempts: 2,
        intervalMs: 10,
      }),
    ).rejects.toThrow('Malformed non-JSON response');
  });

  it('retries during deployment-not-yet-ready state and succeeds once new revision becomes live', async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        callCount++;
        if (callCount === 1) {
          // Attempt 1: serving previous revision while building
          return Promise.resolve(new Response(JSON.stringify({
            status: 'healthy',
            commitSha: 'old_sha_0000000',
          }), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        // Attempt 2: new revision goes live
        return Promise.resolve(new Response(JSON.stringify({
          status: 'healthy',
          commitSha: '610b48297bcdedbc6c0b2ea8e6ceff05005fd7a0',
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
      expectedCommit: '610b482',
      maxAttempts: 3,
      intervalMs: 10,
    });

    expect(result.success).toBe(true);
    expect(callCount).toBe(2);
    expect(result.health.commitSha).toBe('610b48297bcdedbc6c0b2ea8e6ceff05005fd7a0');
  });
});
