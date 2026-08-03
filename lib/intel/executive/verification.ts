import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { EditorialOverview } from '@/lib/intel/editorial/types';
import type { EvidenceOverview } from '@/lib/intel/evidence/overview';
import type { PredictionsOverview } from '@/lib/intel/predictions/overview';
import type { VerificationKind } from '@/lib/intel/toolkit/types';
import type { VerificationQueue, VerificationQueueItem } from './types';

// Governing document: Phase IV sprint brief (Verification Queue).
// Reuses verification outputs already produced by the certified engines: structural conflict
// signals (Editorial Engine verification_pressure factor), evidence gaps and confidence
// (Evidence Engine), and prediction sensitivity (Prediction Engine). No verification logic
// is re-implemented here.

const QUEUE_LIMIT = 10;

const RECOMMENDED_DOCUMENTS = [
  'ECI official result sheets 2012 / 2017 / 2022',
  'Candidate affidavit (ADRs) for the sitting MLA',
  'Census of India 2011 PCA tables (district level)',
  'District statistical handbook / development reports',
  'Data.gov.in flagship scheme datasets (PMGSY, Jal Jeevan, PMAY)',
  'LS2024 election result by assembly segment',
];

const KIND_COUNT_SEED: Record<VerificationKind, number> = {
  claim: 0,
  missing_evidence: 0,
  weak_evidence: 0,
  conflicting_evidence: 0,
};

export function buildVerificationQueue(
  editorial: EditorialOverview,
  evidence: EvidenceOverview,
  predictions: PredictionsOverview,
): VerificationQueue {
  const items: VerificationQueueItem[] = [];

  for (const c of editorial.ranked.filter(
    (x) => (x.factors.find((f) => f.key === 'verification_pressure')?.value ?? 0) >= 40,
  ).slice(0, 4)) {
    const vp = c.factors.find((f) => f.key === 'verification_pressure');
    for (const signal of (vp?.evidence ?? []).slice(0, 2)) {
      if (items.length >= QUEUE_LIMIT) break;
      items.push({
        id: `conflict-${c.canonical_constituency_id}-${items.length}`,
        kind: 'conflicting_evidence',
        title: c.constituency_name,
        detail: signal,
        confidence: c.confidence,
        recommendedAction: 'Resolve the conflicting signals before publication.',
        source: 'Editorial Engine (verification pressure)',
        relatedConstituency: c.canonical_constituency_id,
      });
    }
    if (items.length >= QUEUE_LIMIT) break;
  }

  for (const g of evidence.aggregate.mostGapped.slice(0, 3)) {
    if (items.length >= QUEUE_LIMIT) break;
    items.push({
      id: `missing-${g.canonical_constituency_id}`,
      kind: 'missing_evidence',
      title: g.constituency_name,
      detail: `Coverage ${String(g.coverage)}% with ${String(g.debt)} missing fields.`,
      confidence: g.confidence,
      recommendedAction: 'Request district datasets and verify the registered gaps.',
      source: 'Evidence Engine (evidence debt)',
      relatedConstituency: g.canonical_constituency_id,
    });
  }

  for (const e of evidence.all.filter((x) => x.confidence === 'LOW' || x.confidence === 'VERY_LOW').slice(0, 3)) {
    if (items.length >= QUEUE_LIMIT) break;
    items.push({
      id: `weak-${e.canonical_constituency_id}`,
      kind: 'weak_evidence',
      title: e.constituency_name,
      detail: `Evidence confidence ${e.confidence.replace('_', ' ')} — ${e.confidenceReason}`,
      confidence: e.confidence,
      recommendedAction: 'Re-verify the underlying source fields before relying on them.',
      source: 'Evidence Engine (confidence)',
      relatedConstituency: e.canonical_constituency_id,
    });
  }

  for (const s of predictions.aggregate.sensitiveSeats.slice(0, 3)) {
    if (items.length >= QUEUE_LIMIT) break;
    const top = s.sensitivity[0];
    items.push({
      id: `claim-${s.canonical_constituency_id}`,
      kind: 'claim',
      title: s.constituency_name,
      detail: top
        ? `Winning-probability claim is most sensitive to ${top.score.replace('_', ' ')} (${top.effect}, ±${String(top.delta)} pts).`
        : 'Winning-probability claim carries no sensitivity data — verify on the ground.',
      confidence: s.confidence,
      recommendedAction: 'Verify the predicted-winner claim with both campaigns.',
      source: 'Prediction Engine (sensitivity)',
      relatedConstituency: s.canonical_constituency_id,
    });
  }

  const counts: Record<VerificationKind, number> = { ...KIND_COUNT_SEED };
  for (const i of items) counts[i.kind] += 1;

  const lowConfidence = items.filter((i) => i.confidence === 'LOW' || i.confidence === 'VERY_LOW').length;
  const overallConfidence: ConfidenceTier = lowConfidence >= 2 ? 'LOW' : lowConfidence === 1 ? 'MEDIUM' : 'HIGH';

  return {
    overallConfidence,
    items: items.slice(0, QUEUE_LIMIT),
    counts,
    requiredDocuments: RECOMMENDED_DOCUMENTS,
  };
}
