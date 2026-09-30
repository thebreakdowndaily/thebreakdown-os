import { describe, it, expect, vi } from 'vitest';
import { HtmlCollector } from '../collectors/html';
import { RssCollector } from '../collectors/rss';
import { isSafeExternalUrl } from '../collectors/security';
import type { RadarSourceDefinition } from '../types';

describe('Radar Failure Injection & Adversarial Resiliency', () => {
  const dummySource: RadarSourceDefinition = {
    id: 'src-test-failure',
    name: 'Test Source',
    publisher: 'Test Pub',
    sourceType: 'GOVERNMENT',
    adapter: 'radar-html',
    url: 'https://example.com/test',
    canonicalDomain: 'example.com',
    jurisdiction: 'IN',
    language: 'en',
    authorityClass: 'PRIMARY',
    primarySource: true,
    enabled: true,
    topics: [],
    geographies: ['INDIA'],
    priority: 'P1',
    refreshPolicy: 'HOURLY',
    approvalStatus: 'ACTIVE',
    country: 'india',
    beat: 'government',
    officialStatus: 'official_primary',
    pollIntervalMinutes: 60,
    collectorType: 'html',
  };

  it('handles HTTP 500, 403, and 429 gracefully without uncaught exceptions', async () => {
    const collector = new HtmlCollector();

    for (const status of [500, 403, 429]) {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status,
        statusText: `Error ${status}`,
        headers: new Headers(),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await collector.collect(dummySource);
      expect(result.artifacts.length).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.httpStatus).toBe(status);
      expect(result.errors[0]).toContain(`${status}`);
    }

    vi.unstubAllGlobals();
  });

  it('handles network timeouts via AbortController gracefully', async () => {
    const collector = new HtmlCollector({
      timeoutMs: 10,
      maxResponseBytes: 5 * 1024 * 1024,
      userAgent: 'RadarTest/1.0',
      maxRetries: 1,
    });

    const mockFetch = vi.fn().mockImplementation((_url, opts) => {
      return new Promise((_resolve, reject) => {
        opts.signal.addEventListener('abort', () => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await collector.collect(dummySource);
    expect(result.artifacts.length).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('timed out');

    vi.unstubAllGlobals();
  });

  it('rejects oversized responses exceeding maxResponseBytes', async () => {
    const collector = new HtmlCollector({
      timeoutMs: 5000,
      maxResponseBytes: 1024, // 1KB limit
      userAgent: 'RadarTest/1.0',
      maxRetries: 1,
    });

    // Mock a stream returning 2KB
    const largeChunk = new Uint8Array(2048);
    let readCount = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (readCount === 0) {
          readCount++;
          return Promise.resolve({ done: false, value: largeChunk });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/html' }),
      url: 'https://example.com/test',
      body: {
        getReader: () => mockReader,
      },
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await collector.collect(dummySource);
    expect(result.artifacts.length).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('exceeds maximum allowed size');

    vi.unstubAllGlobals();
  });

  it('prevents redirect loops exceeding MAX_REDIRECTS', async () => {
    const collector = new HtmlCollector();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 301,
      headers: new Headers({ location: 'https://example.com/redirect-loop' }),
      url: 'https://example.com/test',
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await collector.collect(dummySource);
    expect(result.artifacts.length).toBe(0);
    expect(result.errors[0]).toContain('Too many redirects');

    vi.unstubAllGlobals();
  });

  it('strictly blocks SSRF against AWS/GCP metadata and internal network', async () => {
    const testCases = [
      { url: 'http://169.254.169.254/latest/meta-data', expectedReason: 'metadata' },
      { url: 'http://localhost:3000/api/internal', expectedReason: 'Prohibited' },
      { url: 'http://127.0.0.1:8080/admin', expectedReason: 'Prohibited' },
      { url: 'http://10.0.0.5/secret', expectedReason: 'Private IP' },
      { url: 'http://192.168.1.1/router', expectedReason: 'Private IP' },
      { url: 'http://172.16.0.1/cluster', expectedReason: 'Private IP' },
      { url: 'file:///etc/passwd', expectedReason: 'Disallowed protocol' },
      { url: 'ftp://ftp.example.com/file', expectedReason: 'Disallowed protocol' },
    ];

    for (const tc of testCases) {
      const check = isSafeExternalUrl(tc.url);
      expect(check.safe).toBe(false);
      expect(check.reason?.toLowerCase()).toContain(tc.expectedReason.toLowerCase());
    }

    // Public domains must be permitted
    expect(isSafeExternalUrl('https://pib.gov.in/rss').safe).toBe(true);
    expect(isSafeExternalUrl('https://mpinfo.org/').safe).toBe(true);
    expect(isSafeExternalUrl('https://rewa.nic.in/').safe).toBe(true);
  });

  it('handles malformed RSS XML gracefully', async () => {
    const collector = new RssCollector();

    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('<<<NOT VALID XML>>>') })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/xml' }),
      body: mockReader,
    });
    vi.stubGlobal('fetch', mockFetch);

    const rssSource = { ...dummySource, collectorType: 'rss' as const };
    const result = await collector.collect(rssSource);
    // Malformed XML returns 0 artifacts without throwing
    expect(result.artifacts.length).toBe(0);

    vi.unstubAllGlobals();
  });
});
