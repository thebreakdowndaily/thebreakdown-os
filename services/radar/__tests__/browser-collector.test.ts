import { describe, it, expect } from 'vitest';
import { BrowserCollector } from '../collectors/browser';

describe('Browser / Dynamic SPA Collector', () => {
  it('blocks unapproved domains outside the approved portal allowlist', async () => {
    const collector = new BrowserCollector();
    const result = await collector.collect({
      id: 'unapproved-domain-test',
      name: 'Unapproved Dynamic Portal',
      publisher: 'Unknown',
      sourceType: 'NEWS',
      adapter: 'radar-browser',
      url: 'https://evil-unapproved-portal.com/news',
      canonicalDomain: 'evil-unapproved-portal.com',
      authorityClass: 'GENERAL_MEDIA',
      primarySource: false,
      enabled: true,
      topics: [],
      geographies: ['INDIA'],
      priority: 'P2',
      refreshPolicy: 'HOURLY',
      approvalStatus: 'PROPOSED',
      country: 'india',
      state: 'mp',
      beat: 'politics',
      officialStatus: 'media',
      pollIntervalMinutes: 60,
      collectorType: 'browser',
    });

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('not in the approved browser collector allowlist');
    expect(result.artifacts.length).toBe(0);
  });

  it('blocks SSRF private IPs in BrowserCollector', async () => {
    const collector = new BrowserCollector({
      allowedDomains: ['169.254.169.254'],
      maxExecutionTimeoutMs: 5000,
      maxRetries: 1,
      userAgent: 'TheBreakdownRadar/1.0',
      timeoutMs: 5000,
      maxResponseBytes: 1048576,
      allowPrivateIps: false,
    });

    const result = await collector.collect({
      id: 'ssrf-browser-test',
      name: 'Metadata IP',
      publisher: 'Test',
      sourceType: 'GOVERNMENT',
      adapter: 'radar-browser',
      url: 'http://169.254.169.254/latest/meta-data',
      canonicalDomain: '169.254.169.254',
      authorityClass: 'PRIMARY',
      primarySource: true,
      enabled: true,
      topics: [],
      geographies: ['INDIA'],
      priority: 'P0',
      refreshPolicy: 'HOURLY',
      approvalStatus: 'PROPOSED',
      country: 'india',
      state: 'mp',
      beat: 'government',
      officialStatus: 'official_primary',
      pollIntervalMinutes: 30,
      collectorType: 'browser',
    });

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('SSRF blocked');
  });
});
