/**
 * PIB Plugin — Press Information Bureau
 *
 * Fetches PIB press releases from RSS feeds and structures them
 * for the Research Agent with ministry attribution and category tags.
 */

import type { PluginManifest, PluginImplementation, PluginOutput, PluginItem } from '../sdk/types';
import { buildPluginOutput, parseRSS, pluginFetch } from '../sdk/loader';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  agriculture: ['agriculture', 'farmer', 'crop', 'kisan', 'mandi', 'foodgrain', 'irrigation'],
  defence: ['defence', 'army', 'navy', 'air force', 'Rafale', 'DRDO', 'military'],
  economy: ['economy', 'GDP', 'inflation', 'fiscal', 'budget', 'finance', 'tax', 'revenue'],
  education: ['education', 'school', 'college', 'university', 'NEP', 'skill', 'literacy'],
  energy: ['energy', 'power', 'renewable', 'solar', 'wind', 'coal', 'petroleum', 'electricity'],
  environment: ['environment', 'climate', 'forest', 'pollution', 'green', 'sustainable', 'wildlife'],
  health: ['health', 'hospital', 'disease', 'vaccine', 'Ayushman', 'medical', 'pharma'],
  infrastructure: ['infrastructure', 'road', 'highway', 'railway', 'port', 'airport', 'metro', 'construction'],
  'science-tech': ['science', 'technology', 'ISRO', 'space', 'digital', 'startup', 'innovation'],
  'social-justice': ['social', 'justice', 'welfare', 'tribal', 'minority', 'women', 'child', 'disability'],
};

function categorizeRelease(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  const categories: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ['uncategorized'];
}

function extractMinistry(title: string, summary: string): string | undefined {
  const ministryPattern = /(?:Ministry of|Minister of|Department of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/;
  const match = ministryPattern.exec(`${title} ${summary}`);
  return match?.[1]?.trim();
}

export function createPlugin(manifest: PluginManifest): PluginImplementation {
  return {
    manifest,

    async fetch(): Promise<PluginOutput> {
      const start = Date.now();
      const sources = manifest.sources;
      const allItems: PluginItem[] = [];
      let lastError: string | undefined;

      for (const source of sources) {
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
            const categories = categorizeRelease(rss.title, rss.description);
            const ministry = extractMinistry(rss.title, rss.description);

            allItems.push({
              id: rss.guid || rss.link,
              title: rss.title,
              summary: rss.description.replace(/<[^>]*>/g, '').slice(0, 500),
              url: rss.link,
              publishedAt: new Date(rss.pubDate).toISOString(),
              source: 'Press Information Bureau',
              category: categories[0],
              tags: categories,
              trust_tier: 1,
              metadata: {
                ministry,
                sourceType: 'press-release',
                feedUrl: source.url,
                categories,
              },
            });
          }
        } catch (err: any) {
          lastError = err.message;
          console.warn(`[PIB Plugin] Error fetching ${source.url}:`, err.message);
        }
      }

      // Deduplicate by URL
      const seen = new Set<string>();
      const unique = allItems.filter((item) => {
        if (seen.has(item.url)) return false;
        seen.add(item.url);
        return true;
      });

      return buildPluginOutput(
        manifest.id,
        manifest.version,
        unique.slice(0, (manifest.config.limit as number) || 50),
        'Press Information Bureau (RSS)',
        unique.length > 0 ? 'success' : lastError ? 'error' : 'no_data',
        lastError,
        Date.now() - start
      );
    },
  };
}
