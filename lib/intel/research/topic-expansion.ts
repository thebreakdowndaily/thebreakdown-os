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
  {
    canonical: 'personal data protection',
    synonyms: ['personal data protection', 'data protection', 'data compliance', 'data privacy', 'dpdp'],
    entities: [
      { name: 'India', type: 'COUNTRY', aliases: ['India', 'Republic of India'] },
      { name: 'Ministry of Electronics and Information Technology', type: 'MINISTRY', aliases: ['MeitY', 'Electronics Ministry', 'IT Ministry'] },
      { name: 'Data Protection Board', type: 'GOVERNMENT', aliases: ['DPB', 'Data Protection Board of India'] },
    ],
    concepts: ['consent', 'penalty', 'compliance', 'data fiduciary', 'data principal', 'personal data', 'processing'],
    historicalReferences: ['2023 act', 'srikrishna committee'],
    geographicExpansion: ['India', 'Global'],
    temporalExpansion: ['2023', '2024', '2026'],
  },
  {
    canonical: 'monetary policy',
    synonyms: ['monetary policy', 'repo rate', 'mpc stance', 'interest rate', 'rbi policy'],
    entities: [
      { name: 'Reserve Bank of India', type: 'INSTITUTION', aliases: ['RBI', 'Reserve Bank', 'Central Bank'] },
      { name: 'Monetary Policy Committee', type: 'GOVERNMENT', aliases: ['MPC'] },
    ],
    concepts: ['repo rate', 'inflation', 'gdp growth', 'accommodation stance', 'growth projection', 'interest rates'],
    historicalReferences: ['2026 meeting', 'previous stance'],
    geographicExpansion: ['India'],
    temporalExpansion: ['2026'],
  },
  {
    canonical: 'irrigation audit',
    synonyms: ['irrigation audit', 'irrigation project', 'kaleshwaram project', 'cag report'],
    entities: [
      { name: 'Comptroller and Auditor General', type: 'INSTITUTION', aliases: ['CAG', 'Auditor General'] },
      { name: 'Telangana', type: 'REGION', aliases: ['Telangana State', 'Telangana Assembly'] },
    ],
    concepts: ['cost overrun', 'unviable', 'barrage', 'deficiencies', 'medigadda'],
    historicalReferences: ['2024 audit', 'project launch'],
    geographicExpansion: ['Telangana', 'India'],
    temporalExpansion: ['2023', '2024'],
  },
  {
    canonical: 'cabinet allocation',
    synonyms: ['cabinet allocation', 'portfolio allocation', 'cabinet ministers', 'विभाग आवंटन'],
    entities: [
      { name: 'മहാരാഷ്ട്ര', type: 'REGION', aliases: ['മഹാരാഷ്ട്ര', 'Maharashtra', 'mh', 'महाराष्ट्र'] },
      { name: 'വിഭാഗ', type: 'GOVERNMENT', aliases: ['വിഭാഗ', 'Cabinet', 'Cabinet Ministers', 'मंत्रिमंडल', 'विभाग'] },
    ],
    concepts: ['portfolio', 'reassigned', 'gazette', 'विभाग', 'अधिसूचना'],
    historicalReferences: ['2026 allocation'],
    geographicExpansion: ['Maharashtra', 'India'],
    temporalExpansion: ['2026'],
  },
  {
    canonical: 'land dispute',
    synonyms: ['land dispute', 'court verdict', 'ayodhya land verdict', 'अयोध्या विवाद'],
    entities: [
      { name: 'अयोध्या', type: 'REGION', aliases: ['अयोध्या', 'Ayodhya'] },
      { name: 'Supreme Court', type: 'INSTITUTION', aliases: ['Supreme Court of India', 'SCI', 'सुप्रीम कोर्ट'] },
      { name: 'Archaeological Survey of India', type: 'INSTITUTION', aliases: ['ASI', 'भारतीय पुरातत्व सर्वेक्षण'] },
      { name: 'Dainik Jagran', type: 'COMPANY', aliases: ['Jagran', 'दैनिक जागरण'] },
    ],
    concepts: ['verdict', 'judgement', 'excavation', 'विवादित जमीन', '५ एकड़'],
    historicalReferences: ['2019 verdict'],
    geographicExpansion: ['Ayodhya', 'India'],
    temporalExpansion: ['2019'],
  },
  {
    canonical: 'un resolution',
    synonyms: ['un resolution', 'kashmir mediation', 'resolution 47', 'security council'],
    entities: [
      { name: 'United Nations', type: 'ORGANIZATION', aliases: ['UN', 'Security Council', 'UNSC'] },
      { name: 'Kashmir', type: 'REGION', aliases: ['Jammu and Kashmir', 'J&K'] },
    ],
    concepts: ['mediation', 'plebiscite', 'withdrawal', 'forces', 'india-pakistan question'],
    historicalReferences: ['1948 resolution'],
    geographicExpansion: ['Kashmir', 'India', 'Pakistan'],
    temporalExpansion: ['1947', '1948'],
  },
  {
    canonical: 'landslides disaster alert',
    synonyms: ['landslide warning', 'landslides alert', 'early warning alert', 'red alert warning', 'disaster alert', 'മുന്നറിയിപ്പ്'],
    entities: [
      { name: 'വയനാട്', type: 'REGION', aliases: ['വയനാട്', 'Wayanad', 'വയനാട്ടിലെ', 'Wayanad district'] },
      { name: 'കേരളം', type: 'REGION', aliases: ['കേരളം', 'Kerala', 'Kerala State'] },
    ],
    concepts: ['landslide', 'red alert', 'timelines', 'ദുരന്തം', 'ഉരുൾപൊട്ടൽ'],
    historicalReferences: ['2024 disaster'],
    geographicExpansion: ['Wayanad', 'Kerala'],
    temporalExpansion: ['2024'],
  },
  {
    canonical: 'bihar panchayat',
    synonyms: ['bihar panchayat', 'panchayat audit', 'local funds diversion', 'बिहार पंचायती राज', 'ग्रामीण विकास'],
    entities: [
      { name: 'Bihar', type: 'REGION', aliases: ['Bihar', 'बिहार', 'बिहार राज्य'] },
      { name: 'Panchayati Raj', type: 'GOVERNMENT', aliases: ['Panchayat', 'पंचायती राज', 'पंचायती राज विभाग'] },
      { name: 'Rural Development', type: 'GOVERNMENT', aliases: ['ग्रामीण विकास', 'ग्रामीण शौचालय'] },
    ],
    concepts: ['fund diversion', 'fake beneficiaries', 'audit', 'डाइवर्ट', 'फर्जी लाभार्थी'],
    historicalReferences: ['2024 audit'],
    geographicExpansion: ['Bihar', 'India'],
    temporalExpansion: ['2024'],
  },
  {
    canonical: 'karnataka reservation',
    synonyms: ['karnataka reservation', 'karnataka bill', 'local reservation private sector', 'कर्नाटक आरक्षण'],
    entities: [
      { name: 'Government of Karnataka', type: 'GOVERNMENT', aliases: ['Karnataka Cabinet', 'Karnataka Government'] },
      { name: 'Karnataka', type: 'REGION', aliases: ['Karnataka State'] },
    ],
    concepts: ['reservation', 'management positions', 'private sector', 'local candidates'],
    historicalReferences: ['2026 bill'],
    geographicExpansion: ['Karnataka', 'India'],
    temporalExpansion: ['2026'],
  },
  {
    canonical: 'ngt western ghats',
    synonyms: ['ngt western ghats', 'national green tribunal western ghats', 'western ghats esa', 'NGT पश्चिम घाट'],
    entities: [
      { name: 'National Green Tribunal', type: 'INSTITUTION', aliases: ['NGT'] },
      { name: 'Ministry of Environment Forest and Climate Change', type: 'MINISTRY', aliases: ['MoEFCC', 'Forest Ministry'] },
      { name: 'Western Ghats', type: 'REGION', aliases: ['Western Ghats ESA', 'Ecologically Sensitive Zones'] },
    ],
    concepts: ['notification', 'ecologically sensitive zones', 'polluting activities', 'prohibited'],
    historicalReferences: ['2024 order'],
    geographicExpansion: ['Western Ghats', 'India'],
    temporalExpansion: ['2024'],
  },
  {
    canonical: 'metro safety certification',
    synonyms: ['metro safety', 'metro line safety', 'cmrs certification', 'mumbai metro'],
    entities: [
      { name: 'Commissioner of Metro Railway Safety', type: 'INSTITUTION', aliases: ['CMRS', 'Metro Railway Safety'] },
      { name: 'Mumbai Metro', type: 'REGION', aliases: ['Mumbai Metro Line-3', 'Metro Line-3'] },
    ],
    concepts: ['safety certification', 'passenger operations', 'safety standards'],
    historicalReferences: ['2026 certification'],
    geographicExpansion: ['Mumbai', 'India'],
    temporalExpansion: ['2026'],
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
