/**
 * ─── Research Intelligence Engine — Topic Expansion ───────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic topic expansion. Expands a canonical research topic into
 * synonyms, entities, concepts, historical references, geographic and temporal
 * expansions. Pure string/lexicon matching — no AI dependency, fully testable.
 *
 * The entity resolution is deliberately lexicon-driven at v1.0 (deterministic,
 * auditable). It is honest about what it does: it recognizes known names and
 * patterns, it does not "understand" the topic.
 */

import type { TopicEntity, TopicExpansion } from '@/types/research-intelligence';

interface TopicProfile {
  canonical: string;
  synonyms: string[];
  entities: TopicEntity[];
  concepts: string[];
  historicalReferences: string[];
  geographicExpansion: string[];
  temporalExpansion: string[];
}

const TOPIC_PROFILES: TopicProfile[] = [
  {
    canonical: 'india-us trade',
    synonyms: ['india-us trade', 'india usa trade', 'us india trade', 'india-america trade', 'indo-us trade'],
    entities: [
      { name: 'India', type: 'COUNTRY', aliases: ['India', 'Republic of India'] },
      { name: 'United States', type: 'COUNTRY', aliases: ['US', 'USA', 'United States of America', 'America'] },
      { name: 'Ministry of Commerce and Industry', type: 'MINISTRY', aliases: ['Ministry of Commerce', 'Commerce Ministry', 'DPIIT'] },
      { name: 'USTR', type: 'GOVERNMENT', aliases: ['Office of the United States Trade Representative'] },
      { name: 'US Department of Commerce', type: 'GOVERNMENT', aliases: ['US Commerce Department', 'DoC'] },
      { name: 'World Trade Organization', type: 'ORGANIZATION', aliases: ['WTO'] },
    ],
    concepts: ['tariff', 'trade deficit', 'trade agreement', 'GSP', 'duty', 'quantitative restriction', 'countervailing duty', 'trade war'],
    historicalReferences: ['1991 liberalisation', '2004 GSP', '2019 GSP revocation', '2025 tariff'],
    geographicExpansion: ['United States', 'India', 'China', 'European Union', 'ASEAN'],
    temporalExpansion: ['1990s', '2000s', '2019', '2025', '2026'],
  },
];

const GENERIC_ENTITIES: TopicEntity[] = [
  { name: 'India', type: 'COUNTRY', aliases: ['India', 'Republic of India'] },
];

function allTerms(lower: string): string[] {
  return lower.split(/\s+/);
}

function findProfiles(canonical: string): TopicProfile[] {
  const lower = canonical.toLowerCase();
  const terms = allTerms(lower);
  return TOPIC_PROFILES.filter((p) => {
    const profileTerms = allTerms(p.canonical);
    return profileTerms.some((t) => lower.includes(t) || terms.some((term) => term.includes(t)));
  });
}

/**
 * Expand a canonical research topic into a structured TopicExpansion.
 * Returns a generic expansion when no profile matches (deterministic baseline
 * so every topic still produces a usable, honest expansion).
 */
export function expandTopic(canonical: string): TopicExpansion {
  const trimmed = canonical.trim();
  const profiles = findProfiles(trimmed);
  const profile = profiles[0];

  const entities = profile
    ? profile.entities
    : [{ name: trimmed, type: 'UNKNOWN' as const, aliases: [trimmed] }];
  const synonyms = profile ? profile.synonyms : [trimmed, `research ${trimmed}`, `history of ${trimmed}`];
  const concepts = profile ? profile.concepts : [];
  const historicalReferences = profile ? profile.historicalReferences : [];
  const geographicExpansion = profile ? profile.geographicExpansion : [];
  const temporalExpansion = profile ? profile.temporalExpansion : [];

  const mergedEntities = mergeEntities([...GENERIC_ENTITIES, ...entities]);

  return {
    canonical: trimmed,
    synonyms,
    entities: mergedEntities,
    concepts,
    historicalReferences,
    geographicExpansion,
    temporalExpansion,
    expandedAt: new Date().toISOString(),
  };
}

function mergeEntities(entities: TopicEntity[]): TopicEntity[] {
  const seen = new Map<string, TopicEntity>();
  for (const entity of entities) {
    const key = entity.name.toLowerCase();
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, { ...entity, aliases: [...entity.aliases] });
      continue;
    }
    existing.aliases = Array.from(new Set([...existing.aliases, ...entity.aliases]));
  }
  return Array.from(seen.values());
}

/** All entity names + aliases usable as search terms. */
export function entitySearchTerms(entities: TopicEntity[]): string[] {
  return Array.from(
    new Set(entities.flatMap((e) => [e.name, ...e.aliases]).filter((t) => t.length > 1))
  );
}

/** Case-insensitive entity lookup by name/alias. */
export function findEntity(entities: TopicEntity[], mention: string): TopicEntity | undefined {
  const lower = mention.toLowerCase();
  return entities.find(
    (e) => e.name.toLowerCase() === lower || e.aliases.some((a) => a.toLowerCase() === lower)
  );
}
