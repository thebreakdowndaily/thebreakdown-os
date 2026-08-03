import type { ConfidenceTier } from '@/lib/intel/scoring/types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Editorial Intelligence)
// + docs/intelligence/roadmap.md (Part 14 — Editorial Intelligence)
// Canonical types for the Investigation Priority Index. This module is a factor surface
// OVER the shipped engines — it consumes scoring/predictions/scenarios/evidence, never re-implements them.

export type EditorialFactorKey =
  | 'structural_priority'
  | 'prediction_instability'
  | 'scenario_exposure'
  | 'evidence_debt'
  | 'verification_pressure';

export interface EditorialFactor {
  key: EditorialFactorKey;
  label: string;
  value: number;
  weight: number;
  contribution: number;
  confidence: ConfidenceTier;
  evidence: string[];
  limitation: string;
}

export interface ScenarioFlip {
  scenarioId: string;
  scenarioLabel: string;
  from: string;
  to: string;
}

export interface EditorialRecommendation {
  action: string;
  factor: EditorialFactorKey;
}

export interface EditorialReason {
  factor: EditorialFactorKey;
  label: string;
  why: string;
}

export interface InvestigationCase {
  canonical_constituency_id: string;
  constituency_name: string;
  ac_number: number;
  district: string;
  region: string;
  reservation_type: string;
  current_mla_party: string;
  predicted_winner: string;
  winner_probability: number;
  ipi: number;
  confidence: ConfidenceTier;
  confidenceReason: string;
  factors: EditorialFactor[];
  topReasons: EditorialReason[];
  recommendations: EditorialRecommendation[];
  limitations: string[];
  generatedFrom: string;
}

export interface EditorialFactorAggregate {
  key: EditorialFactorKey;
  label: string;
  weight: number;
  avg: number;
  min: number;
  max: number;
}

export interface EditorialOverview {
  generatedAt: string;
  dataSource: string;
  researchCutoff: string;
  total: number;
  ranked: InvestigationCase[];
  byRegion: Record<string, number>;
  factorAggregates: EditorialFactorAggregate[];
  topOverall: number;
  limitations: string[];
}
