/**
 * Supreme Court Plugin — Supreme Court of India Tracker
 *
 * Monitors Supreme Court judgments, case listings, and
 * constitutional bench decisions.
 */

import type { PluginManifest, PluginImplementation, PluginOutput, PluginItem } from '../sdk/types';
import { buildPluginOutput, parseRSS, pluginFetch } from '../sdk/loader';

function extractCaseInfo(title: string, summary: string): {
  caseNumber?: string;
  judges?: string[];
  outcome?: string;
  acts?: string[];
} {
  const text = `${title} ${summary}`;

  // Extract civil/criminal appeal number
  const caseMatch = text.match(/(?:Civil|Criminal)\s*Appeal\s*No\.?\s*(\d+)(?:\s*of\s*(\d+))?/i);
  const caseNumber = caseMatch ? caseMatch[0] : undefined;

  // Extract judgment outcome
  const outcome = text.includes('allowed') ? 'allowed'
    : text.includes('dismissed') ? 'dismissed'
    : text.includes('partially allowed') ? 'partially-allowed'
    : undefined;

  // Extract judges
  const judgeMatch = text.match(/Justice\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
  const judges = judgeMatch ? judgeMatch.map((j: string) => j.trim()) : undefined;

  // Extract acts mentioned
  const actPatterns = [
    /Constitution\s+of\s+India/g,
    /IPC|Indian\s+Penal\s+Code/g,
    /CrPC|Code\s+of\s+Criminal\s+Procedure/g,
    /CPC|Code\s+of\s+Civil\s+Procedure/g,
    /Evidence\s+Act/g,
    /IT\s+Act|Information\s+Technology\s+Act/g,
    /GST\s+Act/g,
    /Companies\s+Act/g,
  ];
  const acts: string[] = [];
  for (const pattern of actPatterns) {
    if (text.match(pattern)) {
      acts.push(pattern.source.replace(/\\s/g, ' ').replace(/\\/g, ''));
    }
  }

  return { caseNumber, judges, outcome, acts: acts.length > 0 ? acts : undefined };
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
            const caseInfo = extractCaseInfo(rss.title, rss.description);
            const isConstitutionBench = rss.title.toLowerCase().includes('constitution bench');

            allItems.push({
              id: rss.guid || rss.link,
              title: rss.title,
              summary: rss.description.replace(/<[^>]*>/g, '').slice(0, 500),
              url: rss.link,
              publishedAt: new Date(rss.pubDate).toISOString(),
              source: 'Supreme Court of India',
              category: isConstitutionBench ? 'constitution-bench' : 'judgment',
              tags: [
                'supreme-court',
                'judiciary',
                isConstitutionBench ? 'constitution-bench' : 'judgment',
                ...(caseInfo.outcome ? [caseInfo.outcome] : []),
                ...(caseInfo.acts || []).map((a) => a.toLowerCase().replace(/\s+/g, '-')),
              ],
              trust_tier: 1,
              metadata: {
                caseNumber: caseInfo.caseNumber,
                judges: caseInfo.judges,
                outcome: caseInfo.outcome,
                acts: caseInfo.acts,
                courtType: 'supreme-court',
                judgmentDate: rss.pubDate,
                constitutionBench: isConstitutionBench,
              },
            });
          }
        } catch (err: any) {
          lastError = err.message;
          console.warn(`[SupremeCourt Plugin] Error:`, err.message);
        }
      }

      return buildPluginOutput(
        manifest.id,
        manifest.version,
        allItems,
        'Supreme Court of India',
        allItems.length > 0 ? 'success' : lastError ? 'error' : 'no_data',
        lastError,
        Date.now() - start
      );
    },
  };
}
