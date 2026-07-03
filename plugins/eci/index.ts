/**
 * ECI Plugin — Election Commission of India Tracker
 *
 * Monitors election schedules, results, model code of conduct,
 * voter list updates, and electoral notifications.
 */

import type { PluginManifest, PluginImplementation, PluginOutput, PluginItem } from '../sdk/types';
import { buildPluginOutput, parseRSS, pluginFetch } from '../sdk/loader';

function classifyECIContent(title: string, summary: string): {
  notificationType: string;
  electionType: string;
  state?: string;
} {
  const text = `${title} ${summary}`.toLowerCase();

  const notificationType = text.includes('schedule') || text.includes('poll')
    ? 'schedule'
    : text.includes('result')
    ? 'result'
    : text.includes('model code') || text.includes('mcc')
    ? 'model-code'
    : text.includes('voter list') || text.includes('electoral roll')
    ? 'voter-list'
    : 'notification';

  const electionType = text.includes('general election') || text.includes('lok sabha')
    ? 'general'
    : text.includes('assembly') || text.includes('vidhan sabha')
    ? 'state-assembly'
    : text.includes('by-election') || text.includes('bypoll')
    ? 'by-election'
    : 'other';

  // Extract state name
  const statePattern = /(?:in|for|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s+election|\s+assembly|\s+before)/;
  const stateMatch = statePattern.exec(text);

  return {
    notificationType,
    electionType,
    state: stateMatch?.[1],
  };
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
          if (source.type === 'rss') {
            const xml = await pluginFetch<string>({
              url: source.url,
              method: 'GET',
              parser: 'text',
              timeout: 20000,
              retries: 2,
            });

            const rssItems = parseRSS(xml);

            for (const rss of rssItems) {
              const { notificationType, electionType, state } = classifyECIContent(rss.title, rss.description);

              allItems.push({
                id: rss.guid || rss.link,
                title: rss.title,
                summary: rss.description.replace(/<[^>]*>/g, '').slice(0, 500),
                url: rss.link,
                publishedAt: new Date(rss.pubDate).toISOString(),
                source: 'Election Commission of India',
                category: `eci-${notificationType}`,
                tags: [
                  'election-commission',
                  'elections',
                  notificationType,
                  electionType,
                  ...(state ? [state.toLowerCase().replace(/\s+/g, '-')] : []),
                ],
                trust_tier: 1,
                metadata: {
                  notificationType,
                  electionType,
                  state,
                },
              });
            }
          }
        } catch (err: any) {
          lastError = err.message;
          console.warn(`[ECI Plugin] Error:`, err.message);
        }
      }

      return buildPluginOutput(
        manifest.id,
        manifest.version,
        allItems,
        'Election Commission of India',
        allItems.length > 0 ? 'success' : lastError ? 'error' : 'no_data',
        lastError,
        Date.now() - start
      );
    },
  };
}
