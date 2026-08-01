import type { ConstituencyRecord } from './types';

const PROVENANCE_MAP: Record<string, { authority: string; source: string; quality: string }> = {
  canonical_constituency_id: { authority: 'ECI Delimitation Order 2008', source: 'UP403-DATA-01', quality: 'AUTHENTIC' },
  constituency_name: { authority: 'ECI Delimitation Order 2008', source: 'UP403-DATA-01', quality: 'AUTHENTIC' },
  ac_number: { authority: 'ECI Delimitation Order 2008', source: 'UP403-DATA-01', quality: 'AUTHENTIC' },
  pc_number: { authority: 'ECI Delimitation Order 2008', source: 'UP403-DATA-01', quality: 'AUTHENTIC' },
  pc_name: { authority: 'ECI Delimitation Order 2008', source: 'UP403-DATA-01', quality: 'AUTHENTIC' },
  district: { authority: 'ECI Delimitation Order 2008 / UP Revenue Dept', source: 'UP403-DATA-08', quality: 'AUTHENTIC' },
  division: { authority: 'UP Revenue Department', source: 'UP403-DATA-08', quality: 'AUTHENTIC' },
  region: { authority: 'UP403 Classification', source: 'UP403-DATA-08', quality: 'DERIVED' },
  reservation_type: { authority: 'ECI Delimitation Order 2008', source: 'UP403-DATA-01', quality: 'AUTHENTIC' },
  winner_2012: { authority: 'Election Commission of India', source: 'UP403-DATA-02A', quality: 'AUTHENTIC' },
  winner_2017: { authority: 'Election Commission of India', source: 'UP403-DATA-03', quality: 'AUTHENTIC' },
  winner_2022: { authority: 'Election Commission of India', source: 'UP403-DATA-04', quality: 'AUTHENTIC' },
  ls2024_pc_winner: { authority: 'Election Commission of India', source: 'UP403-DATA-06', quality: 'AUTHENTIC' },
  current_mla_name: { authority: 'Election Commission of India / UP Vidhan Sabha', source: 'UP403-DATA-06', quality: 'AUTHENTIC' },
  current_mp_name: { authority: 'Election Commission of India / Lok Sabha', source: 'UP403-DATA-06', quality: 'AUTHENTIC' },
  dna_classification: { authority: 'UP403 DNA Algorithm v1.0.0', source: 'UP403-DATA-07', quality: 'DERIVED' },
  competitiveness_class: { authority: 'UP403 Competitiveness Algorithm v1.0.0', source: 'UP403-DATA-07', quality: 'DERIVED' },
  population_value: { authority: 'Census of India 2011 (PCA)', source: 'UP403-DATA-08', quality: 'NOT_AVAILABLE_AT_CONSTITUENCY_LEVEL' },
  demographics_availability_status: { authority: 'UP403 DATA-08 Pipeline', source: 'UP403-DATA-08', quality: 'METADATA' },
  economy_availability_status: { authority: 'UP403 DATA-09 Pipeline', source: 'UP403-DATA-09', quality: 'METADATA' },
  odop_product: { authority: 'UP Govt One District One Product', source: 'UP403-DATA-09', quality: 'NOT_AVAILABLE' },
  pmgsy_projects_info: { authority: 'Ministry of Rural Development', source: 'UP403-DATA-11', quality: 'STRUCTURED' },
  governance_issue_count: { authority: 'UP403 DATA-10 Pipeline', source: 'UP403-DATA-10', quality: 'DERIVED' },
};

export function getProvenanceForField(field: string): { authority: string; source: string; quality: string } {
  if (!(field in PROVENANCE_MAP)) {
    return { authority: 'UP403 Pipeline', source: 'UP403-DATA-08', quality: 'DERIVED' };
  }
  return PROVENANCE_MAP[field];
}

export function buildProvenance(record: ConstituencyRecord): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [field, info] of Object.entries(PROVENANCE_MAP)) {
    if (field in record) {
      result[field] = info;
    }
  }
  return result;
}

export function getApiProvenance(record: ConstituencyRecord): {
  original_authority: string;
  dataset: string;
  dataset_version: string;
  verification_date: string;
  research_cutoff_date: string;
  source_quality: string;
  originating_phase: string;
} {
  return {
    original_authority: 'Election Commission of India / Census of India / UP Government',
    dataset: 'UP403 Constituency Intelligence Dataset',
    dataset_version: record.master_dataset_version || '1.1.0',
    verification_date: record.verification_date || '2026-07-28',
    research_cutoff_date: record.research_cutoff_date || '2026-07-30',
    source_quality: 'AUTHENTIC',
    originating_phase: 'UP403-DATA-08',
  };
}
