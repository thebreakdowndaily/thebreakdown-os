import type { ScoreKey } from '@/lib/intel/scoring/types';

export type PredictionConfidence = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export interface PartyProbability {
  party: string;
  partyLabel: string;
  probability: number;
  ciLow: number;
  ciHigh: number;
  baseStrength: number;
}

export interface PredictionDriver {
  factor: string;
  direction: 'positive' | 'negative' | 'neutral';
  magnitude: number;
  evidence: string;
  sourceField: string;
}

export interface PredictionAssumption {
  assumption: string;
  basis: string;
}

export interface PredictionSensitivity {
  score: ScoreKey | 'incumbency_risk' | 'competitiveness' | 'volatility';
  factor: string;
  delta: number;
  effect: string;
}

export interface ConstituencyPrediction {
  canonical_constituency_id: string;
  constituency_name: string;
  ac_number: number;
  district: string;
  region: string;
  current_mla_party: string;
  predicted_winner: string;
  winner_probability: number;
  winner_ci: [number, number];
  probabilities: PartyProbability[];
  confidence: PredictionConfidence;
  confidenceReason: string;
  drivers: PredictionDriver[];
  assumptions: PredictionAssumption[];
  sensitivity: PredictionSensitivity[];
  whyLeading: string;
  whyNot: string;
  whatCouldChangeIt: string;
  dataGaps: string[];
  generatedFrom: string;
}

export interface PredictionAggregate {
  count: number;
  seatShare: Record<string, number>;
  avgWinnerProbability: number;
  highConfidence: number;
  sensitiveSeats: ConstituencyPrediction[];
}
