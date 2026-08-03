import type { ConstituencyRecord } from '@/lib/up403/types';

export type ScoreKey = 'momentum' | 'competitiveness' | 'incumbency_risk' | 'volatility' | 'investigation_priority';

export type ConfidenceTier = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export interface ScoreDriver {
  factor: string;
  direction: 'positive' | 'negative' | 'neutral';
  magnitude: number;
  evidence: string;
  sourceField: string;
}

export interface ScoreAssumption {
  assumption: string;
  basis: string;
}

export interface IntelligenceScore {
  key: ScoreKey;
  label: string;
  value: number;
  range: [number, number];
  confidence: ConfidenceTier;
  confidenceReason: string;
  drivers: ScoreDriver[];
  assumptions: ScoreAssumption[];
  dataGaps: string[];
  interpretation: string;
}

export interface ConstituencyIntelligence {
  canonical_constituency_id: string;
  constituency_name: string;
  ac_number: number;
  district: string;
  region: string;
  current_mla_party: string;
  scores: Record<ScoreKey, IntelligenceScore>;
  overall: number;
}

export interface ScoreAggregate {
  count: number;
  byScore: Record<ScoreKey, { avg: number; min: number; max: number }>;
  overall: { avg: number; min: number; max: number };
}

export interface ScoreComputeContext {
  record: ConstituencyRecord;
}
