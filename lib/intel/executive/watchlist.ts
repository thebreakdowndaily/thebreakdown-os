import type { EditorialOverview } from '@/lib/intel/editorial/types';
import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { EditorialFactorKey } from '@/lib/intel/editorial/types';
import type { WatchlistItem } from './types';

// Governing document: Phase IV sprint brief (Editorial Watchlist).
// Ranks constituencies for editorial attention using the certified Editorial Engine's
// Investigation Priority Index, enriched with evidence counts from the Evidence Engine.
// Never shows a raw score alone — every entry carries a reason, an action, and a next step.

const WATCHLIST_LIMIT = 8;

const REPORTER_ACTION: Record<EditorialFactorKey, string> = {
  structural_priority: 'Assign a desk reporter to refresh the standing profile for this seat.',
  prediction_instability: 'Verify both predicted contenders on the ground before any draft.',
  scenario_exposure: 'Test the seat under each wave scenario before committing to an angle.',
  evidence_debt: 'Field-verify the registered gaps and request the missing district datasets.',
  verification_pressure: 'Resolve the conflicting signals before any publication moves forward.',
};

const NEXT_STEP: Record<EditorialFactorKey, string> = {
  structural_priority: 'Update the structural profile with the latest 2026 field observations.',
  prediction_instability: 'Interview both predicted contenders and the outgoing MLA.',
  scenario_exposure: 'Model the seat under the busiest scenario (see Scenario Monitor).',
  evidence_debt: 'Request the district statistical handbook and scheme datasets.',
  verification_pressure: 'Cross-check the LS2024 segment result against the sitting MLA record.',
};

function topFactorKey(item: { factors: Array<{ key: EditorialFactorKey; contribution: number }> }): EditorialFactorKey {
  return [...item.factors].sort((a, b) => b.contribution - a.contribution)[0]?.key ?? 'structural_priority';
}

export function buildEditorialWatchlist(editorial: EditorialOverview, evidence: EvidenceOverview): WatchlistItem[] {
  const evidenceByConstituency = new Map(
    evidence.all.map((e) => [e.canonical_constituency_id, e]),
  );

  return editorial.ranked.slice(0, WATCHLIST_LIMIT).map((case_, index) => {
    const topKey = topFactorKey(case_);
    const evidenceRecord = evidenceByConstituency.get(case_.canonical_constituency_id);
    const reason = case_.topReasons[0]?.why ?? case_.confidenceReason;
    const requiredAction = case_.recommendations[0]?.action ?? REPORTER_ACTION[topKey];

    return {
      rank: index + 1,
      canonical_constituency_id: case_.canonical_constituency_id,
      constituency_name: case_.constituency_name,
      region: case_.region,
      district: case_.district,
      current_mla_party: case_.current_mla_party,
      predicted_winner: case_.predicted_winner,
      winner_probability: case_.winner_probability,
      ipi: case_.ipi,
      confidence: case_.confidence,
      reason,
      requiredAction,
      evidenceCount: evidenceRecord?.items.length ?? 0,
      recommendedReporterAction: REPORTER_ACTION[topKey],
      suggestedNextStep: NEXT_STEP[topKey],
      factorContributions: case_.factors
        .map((f) => ({ key: f.key, label: f.label, contribution: f.contribution }))
        .sort((a, b) => b.contribution - a.contribution),
    };
  });
}
