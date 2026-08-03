import type { ConfidenceTier } from '@/lib/intel/scoring/types';

// Governing document: AGENTS.md (Institutional Trust Index composition)
// + docs/intelligence/mission-control-readiness.md (Phase III deliverable 5)
// Canonical types for the Institutional Trust Index — a shared intelligence service.
// The index is a weighted aggregation of six evidence-derived components. Every component
// carries its value, weight, contribution, confidence, evidence, and limitation so the
// calculation is never hidden. The index never uses AI estimation.

export type TrustComponentKey =
  | 'evidence_coverage'
  | 'evidence_confidence'
  | 'verification_completeness'
  | 'prediction_stability'
  | 'scenario_consistency'
  | 'research_completeness';

export interface TrustComponentInput {
  /** 0–100 source value for this component. */
  value: number;
  confidence?: ConfidenceTier;
  /** Why this value is what it is — every component must explain itself. */
  evidence: string[];
  /** What this component cannot tell you. */
  limitation?: string;
}

export type TrustInputs = Record<TrustComponentKey, TrustComponentInput>;

export interface TrustComponent {
  key: TrustComponentKey;
  label: string;
  value: number;
  weight: number;
  /** value × weight, rounded. Contributions sum to the index. */
  contribution: number;
  confidence: ConfidenceTier;
  evidence: string[];
  limitation: string;
  /** Engine provenance — which certified service produced this value. */
  source: string;
}

export interface TrustIndex {
  value: number;
  version: string;
  generatedAt: string;
  dataSource: string;
  components: TrustComponent[];
  confidence: ConfidenceTier;
  confidenceReason: string;
  limitations: string[];
}
