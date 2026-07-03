/**
 * Parliament Plugin — Indian Parliament Tracker
 *
 * Tracks bills, debates, questions, and committee activities
 * from Lok Sabha, Rajya Sabha, and PRS Legislative Research.
 */

import type { PluginManifest, PluginImplementation, PluginOutput, PluginItem } from '../sdk/types';
import { buildPluginOutput, parseRSS, pluginFetch } from '../sdk/loader';

function classifyItem(title: string, summary: string): {
  type: 'bill' | 'question' | 'debate' | 'committee' | 'other';
  house: 'lok-sabha' | 'rajya-sabha' | 'joint';
} {
  const text = `${title} ${summary}`.toLowerCase();

  const house = text.includes('rajya sabha') || text.includes('rajyasabha')
    ? 'rajya-sabha' as const
    : text.includes('joint session')
    ? 'joint' as const
    : 'lok-sabha' as const;

  const type = text.includes('bill') || text.includes('amendment') || text.includes('legislation')
    ? 'bill' as const
    : text.includes('question') || text.includes('starred')
    ? 'question' as const
    : text.includes('committee') || text.includes('standing committee')
    ? 'committee' as const
    : text.includes('debate') || text.includes('discussion')
    ? 'debate' as const
    : 'other' as const;

  return { type, house };
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
            timeout: 30000,
            retries: 2,
          });

          const rssItems = parseRSS(xml);

          for (const rss of rssItems) {
            const { type, house } = classifyItem(rss.title, rss.description);

            allItems.push({
              id: rss.guid || rss.link,
              title: rss.title,
              summary: rss.description.replace(/<[^>]*>/g, '').slice(0, 500),
              url: rss.link,
              publishedAt: new Date(rss.pubDate).toISOString(),
              source: house === 'lok-sabha' ? 'Lok Sabha' : house === 'rajya-sabha' ? 'Rajya Sabha' : 'Parliament',
              category: `parliament-${type}`,
              tags: ['parliament', house, type, 'india', 'legislation'],
              trust_tier: 1,
              metadata: {
                house,
                type,
              },
            });
          }
        } catch (err: any) {
          lastError = err.message;
          console.warn(`[Parliament Plugin] Error:`, err.message);
        }
      }

      return buildPluginOutput(
        manifest.id,
        manifest.version,
        allItems,
        'Parliament of India / PRS Legislative',
        allItems.length > 0 ? 'success' : lastError ? 'error' : 'no_data',
        lastError,
        Date.now() - start
      );
    },
  };
}
