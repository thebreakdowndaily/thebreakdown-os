/**
 * ─── Research Intelligence Engine — Query Generation ─────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic generation of research queries from a TopicExpansion. Produces
 * a diverse, categorized query set covering exact terms, synonyms, entities,
 * primary sources, government, academic, legal/regulatory, social and
 * statistics searches — each query tagged with a category and source type so
 * the adapter layer can route appropriately.
 */

import type {
  ResearchQuery,
  ResearchQueryCategory,
  ResearchSourceType,
  TopicExpansion,
} from '@/types/research-intelligence';
import { entitySearchTerms } from './topic-expansion';
import { createQueryId } from './ids';

interface QueryTemplate {
  category: ResearchQueryCategory;
  sourceType: ResearchSourceType;
  template: (topic: string, expansion: TopicExpansion) => string[];
}

const QUERY_TEMPLATES: QueryTemplate[] = [
  { category: 'EXACT', sourceType: 'NEWS', template: (t) => [`"${t}"`] },
  { category: 'SYNONYM', sourceType: 'NEWS', template: (t, x) => x.synonyms.slice(1, 4).map((s) => `"${s}"`) },
  { category: 'NEWS', sourceType: 'NEWS', template: (t) => [`${t} latest`, `${t} update`, `${t} news`] },
  { category: 'EVENT', sourceType: 'NEWS', template: (t) => [`${t} events`, `${t} timeline`] },
  { category: 'ENTITY', sourceType: 'NEWS', template: (t, x) => entitySearchTerms(x.entities).slice(0, 6).map((e) => `${t} ${e}`) },
  { category: 'HISTORICAL', sourceType: 'REPORTS', template: (t, x) => x.historicalReferences.map((h) => `${t} ${h}`) },
  { category: 'GOVERNMENT', sourceType: 'GOVERNMENT', template: (t, x) => x.entities.filter((e) => e.type === 'MINISTRY' || e.type === 'GOVERNMENT').slice(0, 3).map((e) => `site:gov.in ${t} ${e.name}`) },
  { category: 'PRIMARY_SOURCE', sourceType: 'GOVERNMENT', template: (t) => [`${t} official statement`, `${t} notification`, `${t} gazette`] },
  { category: 'ACADEMIC', sourceType: 'ACADEMIC', template: (t) => [`${t} paper`, `${t} analysis`, `${t} academic`] },
  { category: 'LEGAL', sourceType: 'COURTS', template: (t) => [`${t} court`, `${t} judgement`] },
  { category: 'REGULATORY', sourceType: 'REGULATORS', template: (t) => [`${t} tariff`, `${t} duty`, `${t} export policy`] },
  { category: 'STATISTICS', sourceType: 'DATASETS', template: (t) => [`${t} statistics`, `${t} data`, `${t} figures`] },
  { category: 'SOCIAL', sourceType: 'SOCIAL', template: (t) => [`${t} discussion`, `${t} viral`] },
  { category: 'LANGUAGE_SPECIFIC', sourceType: 'NEWS', template: (t, x) => x.geographicExpansion.slice(0, 4).map((g) => `${t} ${g}`) },
];

/** Generate the bounded, deduplicated query set for a project run. */
export function generateQueries(
  expansion: TopicExpansion,
  options: { maxQueries?: number; seedTopic?: string } = {}
): ResearchQuery[] {
  const maxQueries = options.maxQueries ?? 24;
  const now = new Date().toISOString();
  const queries: ResearchQuery[] = [];
  const seen = new Set<string>();

  const add = (text: string, category: ResearchQueryCategory, sourceType: ResearchSourceType) => {
    const normalized = text.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    queries.push({
      id: createQueryId(),
      text: text.trim(),
      category,
      sourceType,
      generatedAt: now,
      usedInRuns: [],
    });
  };

  for (const template of QUERY_TEMPLATES) {
    if (queries.length >= maxQueries) break;
    for (const text of template.template(expansion.canonical, expansion)) {
      if (queries.length >= maxQueries) break;
      add(text, template.category, template.sourceType);
    }
  }

  return queries;
}
