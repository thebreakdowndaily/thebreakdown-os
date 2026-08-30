/**
 * ─── RIE v1.2 — Primary-Source Discovery Query Intelligence ──────────────────
 * Governing document: docs/research/benchmarks/RIE_V1_2_FAILURE_ANALYSIS.md
 * Baseline: docs/research/RIE_V1_1_SOURCE_EXPANSION_STANDARD.md
 *
 * Generic, topic-family-driven query generation for primary-source discovery:
 *
 *   DOCUMENT_TYPE — `"<topic>" <docType>` against the document vocabulary the
 *                   topic's family actually publishes (Act/Bill/Notification/
 *                   Gazette for policy; Judgment/Verdict/Order for courts;
 *                   Order/Circular/Warning letter/Press release for regulators;
 *                   Resolution/Debate/Bill for parliament; etc.)
 *   OFFICIAL      — `site:<domain> "<topic>"` for registry-known authoritative
 *                   domains whose authority class matches the topic family.
 *
 * The family classifier is generic keyword logic. It never references the
 * benchmark gold corpus: no gold URL, gold source id, gold claim, or expected
 * fact may appear in a generated query (anti-leakage invariant).
 */

import type {
  PrimarySourceFamily,
  ResearchQueryCategory,
  ResearchSourceClass,
  ResearchSourceContextEntry,
  ResearchSourceType,
} from '@/types/research-intelligence';

export interface PrimarySourceQuerySpec {
  text: string;
  category: 'DOCUMENT_TYPE' | 'OFFICIAL';
  sourceType: ResearchSourceType;
  reason: string;
}

interface DocumentTypeSpec {
  docType: string;
  sourceType: ResearchSourceType;
}

const DOCUMENT_TYPES_BY_FAMILY: Record<
  Exclude<PrimarySourceFamily, 'GENERIC'>,
  DocumentTypeSpec[]
> = {
  POLICY: [
    { docType: 'act', sourceType: 'GOVERNMENT' },
    { docType: 'bill', sourceType: 'GOVERNMENT' },
    { docType: 'notification', sourceType: 'GOVERNMENT' },
    { docType: 'gazette', sourceType: 'GOVERNMENT' },
  ],
  PARLIAMENT: [
    { docType: 'resolution', sourceType: 'PARLIAMENT' },
    { docType: 'debate', sourceType: 'PARLIAMENT' },
    { docType: 'bill', sourceType: 'PARLIAMENT' },
  ],
  REGULATORY: [
    { docType: 'order', sourceType: 'REGULATORS' },
    { docType: 'circular', sourceType: 'REGULATORS' },
    { docType: 'warning letter', sourceType: 'REGULATORS' },
    { docType: 'press release', sourceType: 'REGULATORS' },
  ],
  COURT: [
    { docType: 'judgment', sourceType: 'COURTS' },
    { docType: 'verdict', sourceType: 'COURTS' },
    { docType: 'order', sourceType: 'COURTS' },
  ],
  GOVERNMENT_ACTION: [
    { docType: 'notification', sourceType: 'GOVERNMENT' },
    { docType: 'gazette', sourceType: 'GOVERNMENT' },
    { docType: 'press release', sourceType: 'GOVERNMENT' },
  ],
};

/** Ordered authority-class fit per family (most relevant domain first). */
const FAMILY_CLASS_ORDER: Record<PrimarySourceFamily, ResearchSourceClass[]> = {
  POLICY: ['OFFICIAL', 'PARLIAMENTARY', 'PRIMARY'],
  PARLIAMENT: ['PARLIAMENTARY', 'OFFICIAL', 'PRIMARY'],
  REGULATORY: ['REGULATORY', 'PRIMARY'],
  COURT: ['JUDICIAL', 'REGULATORY'],
  GOVERNMENT_ACTION: ['PRIMARY', 'OFFICIAL'],
  GENERIC: ['PRIMARY', 'OFFICIAL', 'REGULATORY', 'JUDICIAL', 'PARLIAMENTARY'],
};

const PARLIAMENT_KEYWORDS = ['parliament', 'lok sabha', 'rajya sabha', 'motion', 'debate'];
const REGULATORY_KEYWORDS = [
  'rbi', 'mpc', 'monetary policy', 'sebi', 'cag', 'audit', 'ngt',
  'tribunal', 'trai', 'irda', 'tariff', 'regulator', 'circular',
  'warning letter', 'disclosure', 'order',
];
const COURT_KEYWORDS = ['court', 'verdict', 'judgment', 'judgement', 'petition', 'writ'];
const POLICY_KEYWORDS = [
  'act', 'bill', 'law', 'policy', 'scheme', 'amendment',
  'gazette', 'notification', 'agreement', 'treaty',
];
const GOVERNMENT_ACTION_KEYWORDS = [
  'cabinet', 'ministry', 'government', 'department', 'announced',
  'launch', 'allocation', 'directive', 'decision',
];

function matchesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

/**
 * Generic topic-family classification. Deterministic and corpus-agnostic.
 * Order matters: PARLIAMENT and REGULATORY are checked before COURT so
 * regulatory instruments ("NGT order", "SEBI warning order") are never
 * mistaken for court rulings.
 */
export function classifyPrimarySourceFamily(
  topic: string,
  expansion?: { entities: Array<{ name: string; type: string }> }
): PrimarySourceFamily {
  const text = `${topic} ${(expansion?.entities ?? [])
    .map((e) => e.name)
    .join(' ')}`.trim();
  if (matchesAny(text, PARLIAMENT_KEYWORDS)) return 'PARLIAMENT';
  if (matchesAny(text, REGULATORY_KEYWORDS)) return 'REGULATORY';
  if (matchesAny(text, COURT_KEYWORDS)) return 'COURT';
  if (matchesAny(text, POLICY_KEYWORDS)) return 'POLICY';
  if (matchesAny(text, GOVERNMENT_ACTION_KEYWORDS)) return 'GOVERNMENT_ACTION';
  return 'GENERIC';
}

/** Document-type vocabulary (DOCUMENT_TYPE category) for a topic family. */
export function documentTypesForFamily(family: PrimarySourceFamily): DocumentTypeSpec[] {
  if (family === 'GENERIC') {
    return [
      { docType: 'notification', sourceType: 'GOVERNMENT' },
      { docType: 'official statement', sourceType: 'GOVERNMENT' },
      { docType: 'gazette', sourceType: 'GOVERNMENT' },
    ];
  }
  return DOCUMENT_TYPES_BY_FAMILY[family];
}

const PRIORITY_RANK: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

/** Significant topic tokens used as a neutral domain-fit tiebreak. */
function topicTokens(topic: string): string[] {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/** How many topic tokens appear in a domain name (e.g. sebi for sebi.gov.in). */
function domainTopicOverlap(domain: string, tokens: string[]): number {
  const host = domain.split('.')[0].toLowerCase();
  return tokens.filter((t) => host.includes(t)).length;
}

/**
 * Deterministic domain ranking: family class fit, then priority, then
 * domain-name/topic overlap, then name. The overlap tiebreak is a neutral
 * signal (a regulator's name matching the topic names that regulator) — it is
 * never a gold-source reference.
 */
function orderDomains(
  family: PrimarySourceFamily,
  sourceContext: ResearchSourceContextEntry[],
  topic: string
): ResearchSourceContextEntry[] {
  const classOrder = FAMILY_CLASS_ORDER[family];
  const classRank = new Map(classOrder.map((c, i) => [c, i]));
  const tokens = topicTokens(topic);
  return sourceContext
    .filter((entry) => classRank.has(entry.authorityClass))
    .sort((a, b) => {
      const classDiff = (classRank.get(a.authorityClass) ?? 9) - (classRank.get(b.authorityClass) ?? 9);
      if (classDiff !== 0) return classDiff;
      const priorityDiff = (PRIORITY_RANK[a.priority ?? 'P3'] ?? 9) - (PRIORITY_RANK[b.priority ?? 'P3'] ?? 9);
      if (priorityDiff !== 0) return priorityDiff;
      const overlapDiff =
        domainTopicOverlap(b.domain, tokens) - domainTopicOverlap(a.domain, tokens);
      if (overlapDiff !== 0) return overlapDiff;
      return a.domain.localeCompare(b.domain);
    });
}

/**
 * Generate the primary-source query block for a topic. Bounded: at most
 * `maxOfficialDomains` (default 5) OFFICIAL queries plus the top domain's
 * document-type query. Produces zero queries without a source context.
 */
export function generatePrimarySourceDiscoveryQueries(
  topic: string,
  sourceContext: ResearchSourceContextEntry[] | undefined,
  options: { maxOfficialDomains?: number } = {}
): PrimarySourceQuerySpec[] {
  const specs: PrimarySourceQuerySpec[] = [];
  const family = classifyPrimarySourceFamily(topic);

  for (const { docType, sourceType } of documentTypesForFamily(family)) {
    specs.push({
      text: `"${topic}" ${docType}`,
      category: 'DOCUMENT_TYPE',
      sourceType,
      reason: `Document-type search for ${family} family (${docType}).`,
    });
  }

  if (sourceContext && sourceContext.length > 0) {
    const maxDomains = options.maxOfficialDomains ?? 5;
    const domains = orderDomains(family, sourceContext, topic).slice(0, maxDomains);
    for (const entry of domains) {
      specs.push({
        text: `site:${entry.domain} "${topic}"`,
        category: 'OFFICIAL',
        sourceType: 'GOVERNMENT',
        reason: `Official-domain search on ${entry.domain} (${entry.authorityClass}) for ${family} family.`,
      });
    }
    const top = domains[0];
    if (top?.documentTypes?.length) {
      specs.push({
        text: `site:${top.domain} "${topic}" ${top.documentTypes[0]}`,
        category: 'OFFICIAL',
        sourceType: 'GOVERNMENT',
        reason: `Document-type search restricted to top official domain ${top.domain} (${top.documentTypes[0]}).`,
      });
    }
  }

  return specs;
}
