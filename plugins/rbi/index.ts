/**
 * RBI Plugin — Reserve Bank of India Monitor
 *
 * Monitors RBI circulars, monetary policy, and financial regulation.
 * Key rate changes (repo, CRR, SLR) are flagged for immediate attention.
 */

import type { PluginManifest, PluginImplementation, PluginOutput, PluginItem } from '../sdk/types';
import { buildPluginOutput, parseRSS, pluginFetch } from '../sdk/loader';

const RATE_PATTERNS = [
  { pattern: /repo\s*rate/i, label: 'repo-rate' },
  { pattern: /cash\s*reserve\s*ratio|CRR/i, label: 'crr' },
  { pattern: /statutory\s*liquidity\s*ratio|SLR/i, label: 'slr' },
  { pattern: /reverse\s*repo/i, label: 'reverse-repo' },
  { pattern: /bank\s*rate/i, label: 'bank-rate' },
  { pattern: /MSF|marginal\s*standing\s*facility/i, label: 'msf' },
];

function extractRateChanges(title: string, summary: string): Record<string, number> {
  const changes: Record<string, number> = {};
  const text = `${title} ${summary}`;

  for (const rp of RATE_PATTERNS) {
    if (rp.pattern.test(text)) {
      // Look for percentage changes
      const pctMatch = text.match(new RegExp(`${rp.pattern.source}.*?(\\d+\\.?\\d*)\\s*%`, 'i'));
      if (pctMatch) {
        changes[rp.label] = parseFloat(pctMatch[1]);
      }
    }
  }

  return changes;
}

function detectCircularType(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('master circular') || t.includes('master direction')) return 'master-circular';
  if (t.includes('notification')) return 'notification';
  if (t.includes('press release')) return 'press-release';
  if (t.includes('speech')) return 'speech';
  if (t.includes('report')) return 'report';
  return 'circular';
}

export function createPlugin(manifest: PluginManifest): PluginImplementation {
  return {
    manifest,

    async fetch(): Promise<PluginOutput> {
      const start = Date.now();
      const allItems: PluginItem[] = [];
      let lastError: string | undefined;

      for (const source of manifest.sources) {
        try {
          const xml = await pluginFetch<string>({
            url: source.url,
            method: 'GET',
            parser: 'text',
            timeout: 20000,
            retries: 2,
          });

          const rssItems = parseRSS(xml);

          for (const rss of rssItems) {
            const rateChanges = extractRateChanges(rss.title, rss.description);
            const circularType = detectCircularType(rss.title);
            const isRateChange = Object.keys(rateChanges).length > 0;

            allItems.push({
              id: rss.guid || rss.link,
              title: rss.title,
              summary: rss.description.replace(/<[^>]*>/g, '').slice(0, 500),
              url: rss.link,
              publishedAt: new Date(rss.pubDate).toISOString(),
              source: 'Reserve Bank of India',
              category: `rbi-${circularType}`,
              tags: [
                'rbi',
                'central-bank',
                circularType,
                ...(isRateChange ? ['rate-change', 'monetary-policy'] : []),
              ],
              trust_tier: 1,
              metadata: {
                circularType,
                rateChanges: Object.keys(rateChanges).length > 0 ? rateChanges : undefined,
                isMonetaryPolicy: isRateChange,
              },
            });
          }
        } catch (err: any) {
          lastError = err.message;
          console.warn(`[RBI Plugin] Error:`, err.message);
        }
      }

      return buildPluginOutput(
        manifest.id,
        manifest.version,
        allItems,
        'Reserve Bank of India',
        allItems.length > 0 ? 'success' : lastError ? 'error' : 'no_data',
        lastError,
        Date.now() - start
      );
    },
  };
}
