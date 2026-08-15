/**
 * ─── Research Intelligence Engine — Source Quality ───────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic source-classification and quality scoring. Every source gets:
 *   - an explicit source class (PRIMARY → OFFICIAL → ... → SOCIAL)
 *   - a SourceQuality object with separate authority / primarySource /
 *     directness / transparency / methodology / freshness / independence /
 *     corroboration components and an overall composite.
 *
 * Component scores are always visible — never a mysterious single number.
 * Sources are NEVER treated equally (principle: source hierarchy is explicit).
 */

import type {
  ResearchSource,
  ResearchSourceClass,
  ResearchSourceType,
  SourceQuality,
} from '@/types/research-intelligence';

const DOMAIN_PATTERNS: Array<{ pattern: RegExp; sourceClass: ResearchSourceClass; sourceType: ResearchSourceType }> = [
  { pattern: /\.gov\.in$/i, sourceClass: 'OFFICIAL', sourceType: 'GOVERNMENT' },
  { pattern: /\.gov$/i, sourceClass: 'OFFICIAL', sourceType: 'GOVERNMENT' },
  { pattern: /\.ac\.in$/i, sourceClass: 'ACADEMIC', sourceType: 'ACADEMIC' },
  { pattern: /\.edu$/i, sourceClass: 'ACADEMIC', sourceType: 'ACADEMIC' },
  { pattern: /parliamentofindia\.nic\.in/i, sourceClass: 'PARLIAMENTARY', sourceType: 'PARLIAMENT' },
  { pattern: /loksabha\.nic\.in/i, sourceClass: 'PARLIAMENTARY', sourceType: 'PARLIAMENT' },
  { pattern: /sci\.gov\.in|indiankanoon\.org/i, sourceClass: 'JUDICIAL', sourceType: 'COURTS' },
  { pattern: /rbi\.org\.in|sebi\.gov\.in|trai\.gov\.in|customs\.gov\.in|cbec\.gov\.in/i, sourceClass: 'REGULATORY', sourceType: 'REGULATORS' },
  { pattern: /icrier\.org|ncaer\.org|iim/i, sourceClass: 'ACADEMIC', sourceType: 'ACADEMIC' },
  { pattern: /reuters\.com|apnews\.com|bloomberg\.com/i, sourceClass: 'HIGH_QUALITY_SECONDARY', sourceType: 'NEWS' },
  { pattern: /ptinews\.com|aninews\.in|ians\.in/i, sourceClass: 'SPECIALIST_MEDIA', sourceType: 'NEWS' },
  { pattern: /economictimes\.|business-standard\.|financialexpress\.|thehindu\.|livemint\.|indianexpress\./i, sourceClass: 'HIGH_QUALITY_SECONDARY', sourceType: 'NEWS' },
  { pattern: /twitter\.com|x\.com/i, sourceClass: 'SOCIAL', sourceType: 'SOCIAL' },
  { pattern: /linkedin\.com|facebook\.com|instagram\.com/i, sourceClass: 'SOCIAL', sourceType: 'SOCIAL' },
  { pattern: /reddit\.com/i, sourceClass: 'SOCIAL', sourceType: 'SOCIAL' },
  { pattern: /en\.wikipedia\.org|britannica\.com/i, sourceClass: 'HIGH_QUALITY_SECONDARY', sourceType: 'NEWS' },
];

const AUTHORITY_BY_CLASS: Record<ResearchSourceClass, number> = {
  PRIMARY: 1.0,
  OFFICIAL: 0.95,
  REGULATORY: 0.95,
  JUDICIAL: 0.95,
  PARLIAMENTARY: 0.95,
  ACADEMIC: 0.9,
  HIGH_QUALITY_SECONDARY: 0.75,
  SPECIALIST_MEDIA: 0.6,
  GENERAL_MEDIA: 0.5,
  SOCIAL: 0.15,
  USER_PROVIDED: 0.2,
  UNKNOWN: 0.1,
};

const PRIMARY_PROXIMITY_BY_CLASS: Record<ResearchSourceClass, number> = {
  PRIMARY: 1.0,
  OFFICIAL: 0.85,
  REGULATORY: 0.9,
  JUDICIAL: 0.9,
  PARLIAMENTARY: 0.9,
  ACADEMIC: 0.6,
  HIGH_QUALITY_SECONDARY: 0.5,
  SPECIALIST_MEDIA: 0.4,
  GENERAL_MEDIA: 0.35,
  SOCIAL: 0.2,
  USER_PROVIDED: 0.3,
  UNKNOWN: 0.2,
};

/** Classify a URL/domain into a source class + type. */
export function classifySource(url: string): { sourceClass: ResearchSourceClass; sourceType: ResearchSourceType } {
  for (const entry of DOMAIN_PATTERNS) {
    if (entry.pattern.test(url)) return { sourceClass: entry.sourceClass, sourceType: entry.sourceType };
  }
  const isGmp = /\.com$|\.in$|\.org$|\.net$|\.co$/i.test(url);
  return { sourceClass: isGmp ? 'GENERAL_MEDIA' : 'UNKNOWN', sourceType: 'NEWS' };
}

/** Age-based freshness in [0,1] using publishedAt. */
export function freshnessScore(publishedAt?: string): number {
  if (!publishedAt) return 0.5;
  const ageDays = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 1) return 1.0;
  if (ageDays <= 30) return 0.8;
  if (ageDays <= 365) return 0.5;
  if (ageDays <= 3650) return 0.25;
  return 0.1;
}

/**
 * Compute the full quality profile for a source. `corroboration` is supplied by
 * the corroboration engine (0 if unknown), so this function stays pure.
 */
export function computeSourceQuality(
  source: Pick<ResearchSource, 'url' | 'publisher' | 'publishedAt' | 'sourceClass' | 'sourceType'>,
  corroboration = 0
): SourceQuality {
  const authority = AUTHORITY_BY_CLASS[source.sourceClass] ?? 0.1;
  const primarySource = PRIMARY_PROXIMITY_BY_CLASS[source.sourceClass] ?? 0.2;
  const directness = source.sourceClass === 'PRIMARY' || source.sourceClass === 'OFFICIAL' ? 1.0 : 0.5;
  const transparency = source.sourceClass === 'ACADEMIC' || source.sourceClass === 'PRIMARY' ? 0.9 : 0.5;
  const methodology = source.sourceClass === 'ACADEMIC' ? 0.9 : 0.5;
  const freshness = freshnessScore(source.publishedAt);
  const independence = 1 - (authority < 0.3 ? 0.3 : 0.1);

  const overall =
    0.3 * authority +
    0.2 * primarySource +
    0.15 * freshness +
    0.15 * directness +
    0.1 * methodology +
    0.1 * Math.max(0, Math.min(1, corroboration));

  return {
    authority: round2(authority),
    primarySource: round2(primarySource),
    directness: round2(directness),
    transparency: round2(transparency),
    methodology: round2(methodology),
    freshness: round2(freshness),
    independence: round2(independence),
    corroboration: round2(Math.max(0, Math.min(1, corroboration))),
    overall: round2(overall),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Recompute the quality profile for a stored source with corroboration input. */
export function assessSourceQuality(source: ResearchSource, corroboration = 0): SourceQuality {
  return computeSourceQuality(source, corroboration);
}
