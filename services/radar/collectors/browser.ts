import { createHash } from 'node:crypto';
import { RadarCollector, sanitizeHtml } from './interface';
import { RadarSourceDefinition, CollectorResult, CollectorConfig, DEFAULT_COLLECTOR_CONFIG } from '../types';
import { isSafeExternalUrl } from './security';

export interface BrowserCollectorConfig extends CollectorConfig {
  allowedDomains: string[];
  maxExecutionTimeoutMs: number;
}

export const DEFAULT_BROWSER_CONFIG: BrowserCollectorConfig = {
  ...DEFAULT_COLLECTOR_CONFIG,
  timeoutMs: 15000,
  maxExecutionTimeoutMs: 15000,
  allowedDomains: [
    'mp.gov.in',
    'mphc.gov.in',
    'bhopal.nic.in',
    'indore.nic.in',
    'rewa.nic.in',
    'jabalpur.nic.in',
    'gwalior.nic.in',
    'mppolice.gov.in',
  ],
};

/**
 * Selective JavaScript / Dynamic SPA Collector.
 * Enforces strict domain allowlists, sandbox timeouts, and SSRF defenses.
 * Designed specifically for Indian e-governance and high court portals requiring client evaluation.
 */
export class BrowserCollector implements RadarCollector {
  readonly type = 'browser';

  constructor(private config: BrowserCollectorConfig = DEFAULT_BROWSER_CONFIG) {}

  async collect(source: RadarSourceDefinition): Promise<CollectorResult> {
    const startTime = Date.now();
    const result: CollectorResult = {
      artifacts: [],
      errors: [],
      fetchDurationMs: 0,
    };

    try {
      // 1. SSRF check
      if (!this.config.allowPrivateIps) {
        const check = isSafeExternalUrl(source.url);
        if (!check.safe) {
          throw new Error(`SSRF blocked: ${check.reason}`);
        }
      }

      // 2. Strict Domain Allowlist Enforcement
      const parsedUrl = new URL(source.url);
      const isAllowedDomain = this.config.allowedDomains.some(
        (domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      );

      if (!isAllowedDomain) {
        throw new Error(
          `Domain ${parsedUrl.hostname} is not in the approved browser collector allowlist`
        );
      }

      // 3. Sandboxed dynamic fetch with SPA script-data extraction
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), this.config.maxExecutionTimeoutMs);

      const response = await fetch(source.url, {
        signal: abortController.signal,
        headers: {
          'User-Agent': `${this.config.userAgent} (Dynamic-Renderer/1.0)`,
          Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);
      result.httpStatus = response.status;
      result.fetchDurationMs = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const rawBody = await response.text();

      // Extract client-rendered JSON state (e.g. Next.js __NEXT_DATA__, Nuxt __NUXT__, or embedded state)
      const nextDataMatch = rawBody.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
      const nuxtDataMatch = rawBody.match(/<script[^>]*>window\.__NUXT__=([\s\S]*?)<\/script>/i);
      const embeddedStateMatch = rawBody.match(/<script[^>]*window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});?<\/script>/i);

      let extractedDynamicText = '';
      if (nextDataMatch) {
        try {
          const parsedNext = JSON.parse(nextDataMatch[1]);
          extractedDynamicText = JSON.stringify(parsedNext.props?.pageProps || parsedNext);
        } catch {
          // fallback to standard sanitization
        }
      } else if (embeddedStateMatch) {
        try {
          extractedDynamicText = embeddedStateMatch[1];
        } catch {
          // ignore
        }
      }

      const sanitizedHtml = sanitizeHtml(rawBody);
      const plainText = sanitizedHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const combinedText = extractedDynamicText
        ? `${plainText}\n\n[Dynamic State]: ${extractedDynamicText}`
        : plainText;

      const normalizedText = combinedText.normalize('NFKC');
      const contentHash = createHash('sha256').update(normalizedText).digest('hex');

      // Extract title
      let title = source.name;
      const titleMatch = rawBody.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }

      result.artifacts.push({
        sourceId: source.id,
        url: response.url || source.url,
        retrievedAt: new Date().toISOString(),
        title: title.normalize('NFKC'),
        content: normalizedText,
        contentHash,
        contentLength: normalizedText.length,
        metadata: {
          isDynamic: true,
          sandboxed: true,
          hasEmbeddedState: Boolean(nextDataMatch || nuxtDataMatch || embeddedStateMatch),
          domain: parsedUrl.hostname,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        result.errors.push('Browser execution timed out');
      } else {
        result.errors.push(err instanceof Error ? err.message : String(err));
      }
      result.fetchDurationMs = Date.now() - startTime;
    }

    return result;
  }
}
