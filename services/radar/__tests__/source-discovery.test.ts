import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SourceDiscoveryEngine } from '../discovery/engine';
import { INDIA_COUNTRY_PACK } from '@/data/radar/countries';

describe('Source Discovery Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('extracts RSS feeds and official PDF orders from portal HTML', async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>District Collectorate Rewa</title>
          <link rel="alternate" type="application/rss+xml" title="District Notices RSS" href="/notices/rss.xml" />
        </head>
        <body>
          <h1>कार्यालय कलेक्टर रीवा</h1>
          <p>Official notices and citizen services.</p>
          <a href="/orders/gazette-2026.pdf">Gazette Notification Order No. 45/2026</a>
        </body>
      </html>
    `;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('rss.xml')) {
        return new Response('<rss><channel><title>Notices</title></channel></rss>', {
          status: 200,
          headers: { 'content-type': 'application/rss+xml' },
        });
      }
      if (urlStr.endsWith('.pdf')) {
        return new Response('%PDF-1.5 test', {
          status: 200,
          headers: { 'content-type': 'application/pdf' },
        });
      }
      return new Response(mockHtml, {
        status: 200,
        headers: { 'content-type': 'text/html' },
      });
    });

    const engine = new SourceDiscoveryEngine();
    const candidates = await engine.discoverFromPortal({
      countryPack: INDIA_COUNTRY_PACK,
      organizationName: 'District Collectorate Rewa',
      seedUrl: 'https://rewa.nic.in/',
      district: 'rewa-district',
    });

    expect(candidates.length).toBeGreaterThanOrEqual(2);

    const rssCandidate = candidates.find((c) => c.feedType === 'rss');
    expect(rssCandidate).toBeDefined();
    expect(rssCandidate?.url).toBe('https://rewa.nic.in/notices/rss.xml');
    expect(rssCandidate?.validationStatus).toBe('validated');

    const pdfCandidate = candidates.find((c) => c.feedType === 'pdf');
    expect(pdfCandidate).toBeDefined();
    expect(pdfCandidate?.url).toBe('https://rewa.nic.in/orders/gazette-2026.pdf');
    expect(pdfCandidate?.validationStatus).toBe('validated');

    // Section 21: Never autonomously approved
    for (const cand of candidates) {
      expect(cand.validationStatus).not.toBe('approved');
      expect(cand.approvedAt).toBeUndefined();
    }
  });
});
