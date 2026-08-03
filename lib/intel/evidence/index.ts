import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import { EVIDENCE_CATEGORY_LABELS } from './registry';
import type { ConstituencyEvidence, EvidenceAggregate, EvidenceCategory } from './types';

export type { ConstituencyEvidence, EvidenceAggregate, EvidenceItem, EvidenceCategory, EvidenceTimelineEntry, EvidenceCategoryCoverage } from './types';
export { EVIDENCE_FIELDS, EVIDENCE_CATEGORY_LABELS } from './registry';
export { buildEvidenceGraph, buildEvidenceGraphAll } from './graph';
export { resolveSourceField, linkPredictionToEvidence, totalSupportingEvidence } from './linkage';
export type { PredictionEvidenceLink } from './linkage';

export function aggregateEvidence(items: ConstituencyEvidence[]): EvidenceAggregate {
  const categories = Object.keys(EVIDENCE_CATEGORY_LABELS) as EvidenceCategory[];

  const byCategory = Object.fromEntries(
    categories.map((cat) => [
      cat,
      {
        label: EVIDENCE_CATEGORY_LABELS[cat],
        available: 0,
        total: 0,
        pct: 0,
      },
    ]),
  ) as EvidenceAggregate['byCategory'];

  for (const ev of items) {
    for (const cc of ev.categoryCoverage) {
      byCategory[cc.category].available += cc.available;
      byCategory[cc.category].total += cc.total;
    }
  }
  for (const cat of categories) {
    const c = byCategory[cat];
    c.pct = c.total === 0 ? 0 : Math.round((c.available / c.total) * 100);
  }

  const confidenceDistribution: Record<ConfidenceTier, number> = {
    VERY_HIGH: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    VERY_LOW: 0,
  };
  let avgCoverage = 0;
  let totalDebt = 0;
  for (const ev of items) {
    avgCoverage += ev.coverage;
    totalDebt += ev.debt;
    confidenceDistribution[ev.confidence] += 1;
  }

  const mostGapped = [...items].sort((a, b) => b.debt - a.debt).slice(0, 10);
  const bestCovered = [...items].sort((a, b) => b.coverage - a.coverage).slice(0, 10);

  return {
    count: items.length,
    avgCoverage: items.length === 0 ? 0 : avgCoverage / items.length,
    totalDebt,
    byCategory,
    confidenceDistribution,
    mostGapped,
    bestCovered,
  };
}
