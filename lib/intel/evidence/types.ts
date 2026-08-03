import type { ConfidenceTier } from '@/lib/intel/scoring/types';

export type EvidenceCategory =
  | 'official_election_data'
  | 'historical_results'
  | 'political_dna'
  | 'governance_reports'
  | 'development_indicators'
  | 'research_sources'
  | 'known_data_gaps';

export type EvidenceStatus = 'available' | 'partial' | 'gap';

export interface EvidenceItem {
  id: string;
  category: EvidenceCategory;
  label: string;
  value: string;
  sourceField: string;
  sourceDataset: string;
  authority: string;
  status: EvidenceStatus;
  confidence: ConfidenceTier;
}

export interface EvidenceTimelineEntry {
  date: string;
  type: 'election' | 'representation' | 'by_election' | 'vacancy' | 'verification' | 'ls2024';
  description: string;
  sourceField: string;
}

export interface EvidenceCategoryCoverage {
  category: EvidenceCategory;
  label: string;
  available: number;
  total: number;
  pct: number;
}

export interface ConstituencyEvidence {
  canonical_constituency_id: string;
  constituency_name: string;
  ac_number: number;
  district: string;
  region: string;
  current_mla_party: string;
  items: EvidenceItem[];
  byCategory: Record<EvidenceCategory, EvidenceItem[]>;
  categoryCoverage: EvidenceCategoryCoverage[];
  coverage: number;
  gaps: EvidenceItem[];
  debt: number;
  confidence: ConfidenceTier;
  confidenceReason: string;
  timeline: EvidenceTimelineEntry[];
  generatedFrom: string;
}

export interface EvidenceAggregate {
  count: number;
  avgCoverage: number;
  totalDebt: number;
  byCategory: Record<EvidenceCategory, { label: string; available: number; total: number; pct: number }>;
  confidenceDistribution: Record<ConfidenceTier, number>;
  mostGapped: ConstituencyEvidence[];
  bestCovered: ConstituencyEvidence[];
}
