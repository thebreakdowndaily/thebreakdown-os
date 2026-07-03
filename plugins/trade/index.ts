/**
 * Trade Plugin — India Trade Data Monitor
 *
 * Monitors India's international trade data: exports, imports,
 * trade balance, commodity-wise and country-wise breakdown.
 */

import type { PluginManifest, PluginImplementation, PluginOutput, PluginItem } from '../sdk/types';
import { buildPluginOutput, pluginFetch } from '../sdk/loader';

interface TradeDataGovResponse {
  records?: Array<{
    commodity?: string;
    country?: string;
    value?: number;
    year?: string;
    month?: string;
    export_import?: string;
  }>;
  count?: number;
}

export function createPlugin(manifest: PluginManifest): PluginImplementation {
  return {
    manifest,

    async fetch(): Promise<PluginOutput> {
      const start = Date.now();
      const allItems: PluginItem[] = [];
      let lastError: string | undefined;

      // Try fetching from data.gov.in API
      const apiKey = process.env.DATA_GOV_API_KEY;
      const source = manifest.sources[0];

      if (apiKey && source) {
        try {
          const data = await pluginFetch<TradeDataGovResponse>({
            url: `${source.url}?api-key=${apiKey}&limit=50&format=json`,
            method: 'GET',
            timeout: 20000,
            retries: 2,
          });

          if (data.records) {
            for (const record of data.records) {
              const direction = record.export_import?.toLowerCase() === 'export' ? 'export' : 'import';
              const itemId = `trade-${direction}-${record.commodity || 'unknown'}-${record.year || 'unknown'}`;

              allItems.push({
                id: itemId,
                title: `${direction === 'export' ? 'Export' : 'Import'}: ${record.commodity || 'Unknown'}${record.country ? ` to/from ${record.country}` : ''}`,
                summary: `${direction === 'export' ? 'Exports' : 'Imports'} of ${record.commodity || 'goods'} valued at ${record.value ? `₹${(record.value / 10000000).toFixed(2)} crore` : 'N/A'}${record.country ? ` from ${record.country}` : ''}`,
                url: 'https://tradestat.commerce.gov.in',
                publishedAt: record.year ? `${record.year}-${record.month || '01'}-01T00:00:00Z` : new Date().toISOString(),
                source: 'DGCI&S / Ministry of Commerce',
                category: `trade-${direction}`,
                tags: [
                  'trade',
                  direction,
                  ...(record.commodity ? [record.commodity.toLowerCase().replace(/\s+/g, '-')] : []),
                  ...(record.country ? [record.country.toLowerCase().replace(/\s+/g, '-'), 'bilateral'] : []),
                ],
                trust_tier: 2,
                metadata: {
                  tradeType: direction,
                  commodity: record.commodity,
                  value: record.value,
                  country: record.country,
                  period: record.year,
                  month: record.month,
                  direction,
                  tradePartner: record.country,
                },
              });
            }
          }
        } catch (err: any) {
          lastError = err.message;
          console.warn(`[Trade Plugin] Error fetching from data.gov.in:`, err.message);
        }
      }

      // If API data not available, try RSS source for trade news
      const rssSource = manifest.sources.find((s) => s.type === 'rss');
      if (rssSource && allItems.length === 0) {
        try {
          const xml = await pluginFetch<string>({
            url: rssSource.url,
            method: 'GET',
            parser: 'text',
            timeout: 15000,
            retries: 1,
          });

          const { parseRSS } = await import('../sdk/loader');
          const rssItems = parseRSS(xml);

          for (const rss of rssItems) {
            allItems.push({
              id: rss.guid || rss.link,
              title: rss.title,
              summary: rss.description.replace(/<[^>]*>/g, '').slice(0, 500),
              url: rss.link,
              publishedAt: new Date(rss.pubDate).toISOString(),
              source: 'Ministry of Commerce',
              category: 'trade-news',
              tags: ['trade', 'commerce', 'india', 'news'],
              trust_tier: 2,
              metadata: {
                tradeType: 'news',
              },
            });
          }
        } catch (err: any) {
          console.warn(`[Trade Plugin] Error fetching RSS:`, err.message);
          if (!lastError) lastError = err.message;
        }
      }

      return buildPluginOutput(
        manifest.id,
        manifest.version,
        allItems,
        'DGCI&S / Ministry of Commerce',
        allItems.length > 0 ? 'success' : lastError ? 'error' : 'no_data',
        lastError,
        Date.now() - start
      );
    },
  };
}
