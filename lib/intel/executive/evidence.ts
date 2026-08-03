import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { EvidenceHealth } from './types';

// Governing document: Phase IV sprint brief (Evidence Health).
// Reuses the certified Evidence Engine aggregate. Links directly into the Research KB
// (/intel/research) — this panel summarizes; it never re-derives evidence.

const KNOWN_LIMITATIONS = [
  'Coverage measures field presence in the frozen dataset, not source quality or recency.',
  'Development/health/education indicators are absent at constituency level — this inflates evidence debt across all seats.',
];

function round100(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.round(Math.min(100, Math.max(0, n)));
}

export function buildEvidenceHealth(evidence: EvidenceOverview): EvidenceHealth {
  const agg = evidence.aggregate;

  const categoryCoverage = Object.entries(agg.byCategory).map(([category, c]) => ({
    category,
    label: c.label,
    pct: c.pct,
  }));

  const missingDatasets = categoryCoverage
    .filter((c) => c.pct < 100)
    .sort((a, b) => a.pct - b.pct)
    .map((c) => `${c.label} (${String(c.pct)}%)`);

  const researchCompleteness =
    categoryCoverage.length === 0
      ? 0
      : round100(categoryCoverage.reduce((sum, c) => sum + c.pct, 0) / categoryCoverage.length);

  return {
    count: agg.count,
    avgCoverage: round100(agg.avgCoverage),
    totalDebt: agg.totalDebt,
    confidenceDistribution: agg.confidenceDistribution,
    categoryCoverage,
    missingDatasets,
    researchCompleteness,
    highestDebt: agg.mostGapped.map((g) => ({
      constituency: g.constituency_name,
      debt: g.debt,
      coverage: g.coverage,
    })),
    limitations: KNOWN_LIMITATIONS,
  };
}
