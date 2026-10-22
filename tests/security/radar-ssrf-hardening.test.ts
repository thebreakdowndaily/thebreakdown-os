import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isSafeIp,
  isSafeExternalUrl,
  resolveDnsSafe,
  createPinnedDnsLookup,
  safeFetch,
} from '@/services/radar/collectors/security';
import { HtmlCollector } from '@/services/radar/collectors/html';
import { RssCollector } from '@/services/radar/collectors/rss';
import { PdfCollector } from '@/services/radar/collectors/pdf';
import type { RadarSourceDefinition } from '@/services/radar/types';

describe('Radar Collector SSRF Hardening & DNS Protection', () => {
  describe('Direct IP Range Validation (isSafeIp)', () => {
    it('blocks IPv6 loopback (::1)', () => {
      expect(isSafeIp('::1').safe).toBe(false);
      expect(isSafeIp('[::1]').safe).toBe(false);
      expect(isSafeIp('0:0:0:0:0:0:0:1').safe).toBe(false);
    });

    it('blocks IPv4-mapped IPv6 loopback (::ffff:127.0.0.1)', () => {
      expect(isSafeIp('::ffff:127.0.0.1').safe).toBe(false);
      expect(isSafeIp('[::ffff:127.0.0.1]').safe).toBe(false);
    });

    it('blocks IPv4 loopback (127.0.0.0/8)', () => {
      expect(isSafeIp('127.0.0.1').safe).toBe(false);
      expect(isSafeIp('127.1.2.3').safe).toBe(false);
    });

    it('blocks zero / current network space (0.0.0.1, 0.0.0.0/8)', () => {
      expect(isSafeIp('0.0.0.1').safe).toBe(false);
      expect(isSafeIp('0.0.0.0').safe).toBe(false);
    });

    it('blocks carrier-grade NAT / shared space (100.64.0.1, 100.64.0.0/10)', () => {
      expect(isSafeIp('100.64.0.1').safe).toBe(false);
      expect(isSafeIp('100.127.255.254').safe).toBe(false);
    });

    it('blocks link-local and cloud metadata (169.254.169.254, 169.254.0.0/16)', () => {
      expect(isSafeIp('169.254.169.254').safe).toBe(false);
      expect(isSafeIp('169.254.1.1').safe).toBe(false);
    });

    it('blocks RFC 1918 private IPv4 spaces', () => {
      expect(isSafeIp('10.0.0.1').safe).toBe(false);
      expect(isSafeIp('172.16.0.1').safe).toBe(false);
      expect(isSafeIp('172.31.255.255').safe).toBe(false);
      expect(isSafeIp('192.168.1.1').safe).toBe(false);
    });

    it('blocks IPv6 link-local and unique-local ranges (fe80::, fc00::)', () => {
      expect(isSafeIp('fe80::1').safe).toBe(false);
      expect(isSafeIp('fc00::1').safe).toBe(false);
      expect(isSafeIp('fd00::1').safe).toBe(false);
    });

    it('allows valid public routable IP addresses', () => {
      expect(isSafeIp('93.184.216.34').safe).toBe(true);
      expect(isSafeIp('8.8.8.8').safe).toBe(true);
      expect(isSafeIp('2606:2800:220:1:248:1893:25c8:1946').safe).toBe(true);
    });
  });

  describe('Static URL Validation (isSafeExternalUrl)', () => {
    it('blocks http://[::1]', () => {
      const check = isSafeExternalUrl('http://[::1]/');
      expect(check.safe).toBe(false);
      expect(check.reason).toMatch(/Loopback IPv6|Prohibited private/);
    });

    it('blocks http://[::ffff:127.0.0.1]', () => {
      const check = isSafeExternalUrl('http://[::ffff:127.0.0.1]/');
      expect(check.safe).toBe(false);
      expect(check.reason).toMatch(/Loopback IP space/);
    });

    it('blocks https://0.0.0.1/', () => {
      const check = isSafeExternalUrl('https://0.0.0.1/');
      expect(check.safe).toBe(false);
      expect(check.reason).toMatch(/Zero\/current network IP space/);
    });

    it('blocks https://100.64.0.1/', () => {
      const check = isSafeExternalUrl('https://100.64.0.1/');
      expect(check.safe).toBe(false);
      expect(check.reason).toMatch(/Shared\/CGNAT IP space/);
    });

    it('blocks integer representation of 127.0.0.1 (http://2130706433)', () => {
      const check = isSafeExternalUrl('http://2130706433/');
      expect(check.safe).toBe(false);
      expect(check.reason).toMatch(/Loopback IP space|Prohibited private/);
    });

    it('blocks internal/cloud metadata hostnames', () => {
      expect(isSafeExternalUrl('http://metadata.google.internal/').safe).toBe(false);
      expect(isSafeExternalUrl('http://instance-data/').safe).toBe(false);
      expect(isSafeExternalUrl('http://service.local/').safe).toBe(false);
      expect(isSafeExternalUrl('http://db.internal/').safe).toBe(false);
    });

    it('allows syntactically safe public domains', () => {
      expect(isSafeExternalUrl('https://example.com/feed.xml').safe).toBe(true);
      expect(isSafeExternalUrl('https://pib.gov.in/pressrelease.aspx').safe).toBe(true);
    });
  });

  describe('DNS Resolution & Rebinding Protection (resolveDnsSafe)', () => {
    it('blocks public hostname resolving to cloud metadata IP (https://169.254.169.254.nip.io/)', async () => {
      const mockDns = vi.fn(async () => [
        { address: '169.254.169.254', family: 4 },
      ]);

      const res = await resolveDnsSafe('169.254.169.254.nip.io', mockDns);
      expect(res.safe).toBe(false);
      expect(res.reason).toMatch(/Link-local\/metadata IP space/);
    });

    it('blocks public hostname with a prohibited DNS answer (e.g. 10.0.0.5)', async () => {
      const mockDns = vi.fn(async () => [
        { address: '10.0.0.5', family: 4 },
      ]);

      const res = await resolveDnsSafe('attacker.com', mockDns);
      expect(res.safe).toBe(false);
      expect(res.reason).toMatch(/Private IP space/);
    });

    it('blocks multiple DNS answers containing any prohibited address (mixed public/private)', async () => {
      const mockDns = vi.fn(async () => [
        { address: '93.184.216.34', family: 4 },
        { address: '127.0.0.1', family: 4 }, // Rebinding target
      ]);

      const res = await resolveDnsSafe('mixed.attacker.com', mockDns);
      expect(res.safe).toBe(false);
      expect(res.reason).toMatch(/Loopback IP space/);
    });

    it('fails closed when DNS lookup fails (NXDOMAIN / error)', async () => {
      const mockDns = vi.fn(async () => {
        throw new Error('ENOTFOUND nxdomain.invalid');
      });

      const res = await resolveDnsSafe('nxdomain.invalid', mockDns);
      expect(res.safe).toBe(false);
      expect(res.reason).toMatch(/DNS lookup failed/);
    });

    it('fails closed when DNS lookup returns empty address array', async () => {
      const mockDns = vi.fn(async () => []);

      const res = await resolveDnsSafe('empty.invalid', mockDns);
      expect(res.safe).toBe(false);
      expect(res.reason).toMatch(/no addresses/);
    });

    it('approves DNS resolution when all returned addresses are public and safe', async () => {
      const mockDns = vi.fn(async () => [
        { address: '93.184.216.34', family: 4 },
        { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
      ]);

      const res = await resolveDnsSafe('example.com', mockDns);
      expect(res.safe).toBe(true);
      expect(res.addresses).toHaveLength(2);
    });
  });

  describe('DNS pinning at the outbound socket boundary', () => {
    it('returns only prevalidated addresses for the original hostname', async () => {
      const lookup = createPinnedDnsLookup('example.com', [
        { address: '93.184.216.34', family: 4 },
        // Defensive filter: a private address is not selectable even if a caller
        // accidentally bypasses the outer resolveDnsSafe result.
        { address: '127.0.0.1', family: 4 },
      ]) as unknown as (
        hostname: string,
        options: Record<string, unknown>,
        callback: (error: Error | null, address?: string, family?: number) => void
      ) => void;

      const result = await new Promise<{ address: string; family: number }>((resolve, reject) => {
        lookup('example.com', {}, (error, address, family) => {
          if (error) return reject(error);
          resolve({ address: address!, family: family! });
        });
      });

      expect(result).toEqual({ address: '93.184.216.34', family: 4 });
    });

    it('rejects attempts to reuse a pinned lookup for a different hostname', async () => {
      const lookup = createPinnedDnsLookup('example.com', [
        { address: '93.184.216.34', family: 4 },
      ]) as unknown as (
        hostname: string,
        options: Record<string, unknown>,
        callback: (error: Error | null, address?: string, family?: number) => void
      ) => void;

      await expect(
        new Promise<void>((resolve, reject) => {
          lookup('internal-victim.local', {}, (error) => {
            if (error) reject(error);
            else resolve();
          });
        })
      ).rejects.toThrow(/hostname mismatch/);
    });
  });

  describe('Safe HTTP Client & Redirect Hardening (safeFetch)', () => {
    it('blocks requests targeting [::1] directly in safeFetch', async () => {
      await expect(safeFetch('http://[::1]/secret')).rejects.toThrow(/SSRF blocked/);
    });

    it('blocks requests targeting 169.254.169.254.nip.io through DNS inspection in safeFetch', async () => {
      const mockDns = vi.fn(async () => [
        { address: '169.254.169.254', family: 4 },
      ]);

      await expect(
        safeFetch('https://169.254.169.254.nip.io/latest/meta-data', {
          dnsResolver: mockDns,
        })
      ).rejects.toThrow(/SSRF blocked.*Link-local\/metadata/);
    });

    it('blocks redirect from allowed destination to prohibited destination', async () => {
      const mockDns = vi.fn(async (host: string) => {
        if (host === 'safe-domain.org') {
          return [{ address: '93.184.216.34', family: 4 }];
        }
        if (host === 'internal-victim.local') {
          return [{ address: '192.168.1.50', family: 4 }];
        }
        return [{ address: '93.184.216.34', family: 4 }];
      });

      const mockFetch = vi.fn(async (url: string) => {
        if (url === 'https://safe-domain.org/landing') {
          return new Response(null, {
            status: 302,
            headers: { location: 'http://internal-victim.local/admin' },
          });
        }
        return new Response('internal payload', { status: 200 });
      });

      await expect(
        safeFetch('https://safe-domain.org/landing', {
          dnsResolver: mockDns,
          fetchFn: mockFetch as any,
        })
      ).rejects.toThrow(/SSRF blocked.*Prohibited local\/internal domain/);
    });

    it('blocks redirect to IPv6 loopback (http://[::1])', async () => {
      const mockDns = vi.fn(async () => [{ address: '93.184.216.34', family: 4 }]);
      const mockFetch = vi.fn(async (url: string) => {
        if (url === 'https://safe-domain.org/redirect-loopback') {
          return new Response(null, {
            status: 301,
            headers: { location: 'http://[::1]/status' },
          });
        }
        return new Response('ok', { status: 200 });
      });

      await expect(
        safeFetch('https://safe-domain.org/redirect-loopback', {
          dnsResolver: mockDns,
          fetchFn: mockFetch as any,
        })
      ).rejects.toThrow(/SSRF blocked.*(Loopback IPv6|Prohibited private)/);
    });

    it('successfully fetches valid public responses through safeFetch', async () => {
      const mockDns = vi.fn(async () => [{ address: '93.184.216.34', family: 4 }]);
      const mockFetch = vi.fn(async () => {
        return new Response('<h1>Public News</h1>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      });

      const res = await safeFetch('https://safe-news.org/articles', {
        dnsResolver: mockDns,
        fetchFn: mockFetch as any,
      });

      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toBe('<h1>Public News</h1>');
    });
  });

  describe('Collector Entry Points (HtmlCollector, RssCollector, PdfCollector)', () => {
    const makeSource = (url: string, collectorType: any): RadarSourceDefinition => ({
      id: 'src-ssrf-test',
      name: 'SSRF Test Source',
      url,
      country: 'India',
      beat: 'government',
      officialStatus: 'official_primary',
      pollIntervalMinutes: 60,
      collectorType,
      enabled: true,
      reliabilityScore: 80,
    });

    it('HtmlCollector blocks prohibited URL and records collector error', async () => {
      const collector = new HtmlCollector({
        timeoutMs: 5000,
        maxResponseBytes: 1024,
        userAgent: 'TestRadar',
        maxRetries: 0,
        allowPrivateIps: false,
      });

      const result = await collector.collect(makeSource('http://[::1]/index.html', 'html'));
      expect(result.artifacts).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toMatch(/SSRF blocked/);
    });

    it('HtmlCollector blocks DNS rebinding destination via mock DNS', async () => {
      const mockDns = vi.fn(async () => [{ address: '169.254.169.254', family: 4 }]);

      const collector = new HtmlCollector({
        timeoutMs: 5000,
        maxResponseBytes: 1024,
        userAgent: 'TestRadar',
        maxRetries: 0,
        allowPrivateIps: false,
        dnsResolver: mockDns,
      });

      const result = await collector.collect(makeSource('https://169.254.169.254.nip.io/article', 'html'));
      expect(result.artifacts).toHaveLength(0);
      expect(result.errors[0]).toMatch(/SSRF blocked.*Link-local\/metadata/);
    });

    it('RssCollector blocks prohibited link-local metadata and records error', async () => {
      const collector = new RssCollector({
        timeoutMs: 5000,
        maxResponseBytes: 1024,
        userAgent: 'TestRadar',
        maxRetries: 0,
        allowPrivateIps: false,
      });

      const result = await collector.collect(makeSource('http://169.254.169.254/feed.xml', 'rss'));
      expect(result.artifacts).toHaveLength(0);
      expect(result.errors[0]).toMatch(/SSRF blocked/);
    });

    it('PdfCollector blocks prohibited IPv4-mapped IPv6 destination', async () => {
      const collector = new PdfCollector({
        timeoutMs: 5000,
        maxResponseBytes: 1024,
        userAgent: 'TestRadar',
        maxRetries: 0,
        allowPrivateIps: false,
      });

      const result = await collector.collect(makeSource('http://[::ffff:127.0.0.1]/document.pdf', 'pdf'));
      expect(result.artifacts).toHaveLength(0);
      expect(result.errors[0]).toMatch(/SSRF blocked/);
    });

    it('HtmlCollector successfully collects safe HTML from controlled mock', async () => {
      const mockDns = vi.fn(async () => [{ address: '93.184.216.34', family: 4 }]);
      const mockFetch = vi.fn(async () => {
        return new Response('<html><body><h1>Official Notification</h1></body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      });

      const collector = new HtmlCollector({
        timeoutMs: 5000,
        maxResponseBytes: 1024 * 1024,
        userAgent: 'TestRadar',
        maxRetries: 0,
        allowPrivateIps: false,
        dnsResolver: mockDns,
        fetchFn: mockFetch as any,
      });

      const result = await collector.collect(makeSource('https://safe-gov.in/notification', 'html'));
      expect(result.errors).toHaveLength(0);
      expect(result.artifacts.length).toBeGreaterThan(0);
      expect(result.artifacts[0].content).toContain('Official Notification');
    });
  });
});
