import type { EditorialOverview } from '@/lib/intel/editorial/types';
import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { PredictionsOverview } from '@/lib/intel/predictions/overview';
import type { ResearchWatch } from './types';

// Governing document: Phase IV sprint brief (Research Watch).
// Summarizes the Research KB (/intel/research) — newest findings, highest-impact findings,
// and outstanding research gaps. Never duplicates the Research KB; it links to it. The
// frozen dataset has no temporal "newest" signal, so recency is reported honestly as the
// dataset baseline.

const FINDINGS_LIMIT = 5;
const GAPS_LIMIT = 6;

export function buildResearchWatch(
  editorial: EditorialOverview,
  evidence: EvidenceOverview,
  predictions: PredictionsOverview,
): ResearchWatch {
  const findings = editorial.ranked.slice(0, FINDINGS_LIMIT).map((c) => ({
    constituency: c.constituency_name,
    title: c.topReasons[0]?.label ?? 'Investigation priority',
    detail: c.topReasons[0]?.why ?? c.confidenceReason,
    confidence: c.confidence,
    source: 'Editorial Engine',
  }));

  const gaps = [
    ...Object.entries(evidence.aggregate.byCategory)
      .filter(([, c]) => c.pct < 100)
      .map(([category, c]) => ({
        category,
        label: c.label,
        detail: `${String(c.available)} of ${String(c.total)} fields present (${String(c.pct)}%).`,
      })),
  ]
    .slice(0, GAPS_LIMIT);

  const predictionGapCount = predictions.all.filter((p) => (p.dataGaps?.length ?? 0) > 0).length;

  return {
    researchCutoff: editorial.researchCutoff,
    dataSource: editorial.dataSource,
    findings,
    gaps,
    predictionGapCount,
    limitations: editorial.limitations.length > 0 ? editorial.limitations : ['No temporal history exists in the frozen dataset.'],
  };
}
