import type { EditorialOverview } from '@/lib/intel/editorial/types';
import type { ToolkitOverview } from '@/lib/intel/toolkit/overview';
import type { NewsroomProductivity } from './types';

// Governing document: Phase IV sprint brief (Newsroom Productivity).
// Reuses the certified Toolkit and Editorial engines. Read-only: no fake assignments, no
// persistence, no write path. Every number derives from existing intelligence.

const IPI_HIGH_THRESHOLD = 60;
const VERIFICATION_HOT_THRESHOLD = 50;

export function buildNewsroomProductivity(editorial: EditorialOverview, toolkit: ToolkitOverview): NewsroomProductivity {
  const openInvestigations = editorial.ranked.filter((c) => c.ipi >= IPI_HIGH_THRESHOLD).length;
  const pendingVerification = editorial.ranked.filter(
    (c) => (c.factors.find((f) => f.key === 'verification_pressure')?.value ?? 0) >= VERIFICATION_HOT_THRESHOLD,
  ).length;

  return {
    briefsAvailable: toolkit.total,
    openInvestigations,
    pendingVerification,
    editorialReadiness: editorial.factorAggregates.map((f) => ({
      key: f.key,
      label: f.label,
      avg: f.avg,
      weight: f.weight,
    })),
    persistence: 'none',
    note: 'Read-only surface. No assignments or persistence exist — counts are derived from certified engine outputs on demand.',
  };
}
