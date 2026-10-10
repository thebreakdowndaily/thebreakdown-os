import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseArgs, verifyDeployment } from '../scripts/verify-deployment-health';

describe('Deployment Health Verification Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly parses command-line arguments', () => {
    const opts = parseArgs([
      '--url', 'https://preview.thebreakdown.in',
      '--commit', 'abcd123',
      '--attempts', '5',
      '--interval', '2',
      '--strict-commit',
    ]);

    expect(opts.baseUrl).toBe('https://preview.thebreakdown.in');
    expect(opts.expectedCommit).toBe('abcd123');
    expect(opts.maxAttempts).toBe(5);
    expect(opts.intervalMs).toBe(2000);
    expect(opts.checkCommitParity).toBe(true);
  });

  it('succeeds when all deployment health checks pass', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'healthy',
          timestamp: '2026-10-10T12:00:00Z',
          version: '1.0.0-beta',
          commitSha: 'abcd1234567890',
          subsystems: {
            domainRegistry: 'operational',
            projectionEngine: 'operational',
            editorialState: 'operational',
            researchPlatform: 'operational',
          },
        }), { status: 200, headers: { 'content-type': 'application/json' } }));
      }
      if (url.endsWith('/newsroom')) {
        return Promise.resolve(new Response(null, {
          status: 307,
          headers: { location: 'https://thebreakdown.in/login' },
        }));
      }
      return Promise.resolve(new Response('<html>OK</html>', {
        status: 200,
        headers: { 'strict-transport-security': 'max-age=63072000' },
      }));
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await verifyDeployment({
      baseUrl: 'https://thebreakdown.in',
      maxAttempts: 1,
      intervalMs: 10,
    });

    expect(result.success).toBe(true);
    expect(result.homepageStatus).toBe(200);
    expect(result.newsroomRedirectStatus).toBe(307);
    expect(result.hstsPresent).toBe(true);
  });

  it('fails closed when /api/health returns error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      verifyDeployment({
        baseUrl: 'https://thebreakdown.in',
        maxAttempts: 2,
        intervalMs: 10,
      }),
    ).rejects.toThrow('Health verification timed out');
  });

  it('fails closed when protected route does not redirect to /login', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/health')) {
        return Promise.resolve(new Response(JSON.stringify({ status: 'healthy' }), { status: 200, headers: { 'content-type': 'application/json' } }));
      }
      if (url.endsWith('/newsroom')) {
        // Simulating unprotected leak
        return Promise.resolve(new Response('Confidential Newsroom Data', { status: 200 }));
      }
      return Promise.resolve(new Response('OK', { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      verifyDeployment({
        baseUrl: 'https://thebreakdown.in',
        maxAttempts: 1,
        intervalMs: 10,
      }),
    ).rejects.toThrow('Protected route verification failed');
  });
});
