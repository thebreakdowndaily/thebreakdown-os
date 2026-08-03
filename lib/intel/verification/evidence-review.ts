import type { ConstituencyEvidence } from '@/lib/intel/evidence/types';
import type { InvestigationCase, EditorialFactor } from '@/lib/intel/editorial/types';
import type { EvidenceReview } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Evidence Review)
// The Evidence Review summarises what is available, what is missing, and what is low-confidence
// for a case. It is a projection over the certified evidence engine (ConstituencyEvidence) with a
// factor-derived fallback when the full evidence graph is not loaded.

function factorValue(factors: EditorialFactor[], key: string): number | undefined {
  return factors.find((f) => f.key === key)?.value;
}

function fromEvidenceGraph(evidence: ConstituencyEvidence): EvidenceReview {
  const totalFields = evidence.items.length;
  const availableFields = evidence.items.filter((i) => i.status === 'available').length;
  const missingCategories = evidence.categoryCoverage
    .filter((c) => c.pct < 100 && c.total > 0)
    .map((c) => ({ category: c.category, label: c.label, missing: c.total - c.available, total: c.total }));
  const lowConfidenceItems = evidence.items
    .filter((i) => i.status === 'available' && (i.confidence === 'LOW' || i.confidence === 'VERY_LOW'))
    .map((i) => ({ label: i.label, value: i.value, confidence: i.confidence, source: i.sourceField }));

  return {
    coveragePct: evidence.coverage,
    totalFields,
    availableFields,
    confidence: evidence.confidence,
    missingCategories,
    lowConfidenceItems,
    derivedFrom: 'evidence-engine:constituency-evidence',
  };
}

function fromInvestigation(investigation: InvestigationCase): EvidenceReview {
  const debt = factorValue(investigation.factors, 'evidence_debt') ?? 50;
  const coveragePct = Math.max(0, Math.min(100, Math.round(100 - debt)));
  const confidence = coveragePct >= 70 ? 'HIGH' : coveragePct >= 50 ? 'MEDIUM' : 'LOW';
  return {
    coveragePct,
    totalFields: 0,
    availableFields: 0,
    confidence,
    missingCategories: [],
    lowConfidenceItems: [],
    derivedFrom: 'editorial-factor:evidence_debt',
  };
}

/** Build the Evidence Review for a case, preferring the full evidence graph when available. */
export function buildEvidenceReview(
  evidence: ConstituencyEvidence | null,
  investigation: InvestigationCase | null
): EvidenceReview {
  if (evidence) return fromEvidenceGraph(evidence);
  if (investigation) return fromInvestigation(investigation);
  return {
    coveragePct: 0,
    totalFields: 0,
    availableFields: 0,
    confidence: 'VERY_LOW',
    missingCategories: [],
    lowConfidenceItems: [],
    derivedFrom: 'none',
  };
}
