import type { EvidenceCategory } from './types';

export type EvidenceFieldKind = 'number' | 'string' | 'boolean' | 'object';

export interface EvidenceFieldDef {
  field: string;
  label: string;
  category: EvidenceCategory;
  kind: EvidenceFieldKind;
  gapReason?: string;
}

const officialElectionData = (suffix: number): EvidenceFieldDef[] => {
  const y = String(suffix);
  return [
    { field: `winner_party_${y}`, label: `Winner party (${y})`, category: 'official_election_data', kind: 'string' },
    { field: `winner_vote_share_${y}`, label: `Winner vote share (${y})`, category: 'official_election_data', kind: 'number' },
    { field: `winner_votes_${y}`, label: `Winner votes (${y})`, category: 'official_election_data', kind: 'number' },
    { field: `victory_margin_pct_${y}`, label: `Victory margin (${y})`, category: 'official_election_data', kind: 'number' },
    { field: `runner_up_party_${y}`, label: `Runner-up party (${y})`, category: 'official_election_data', kind: 'string' },
    { field: `total_valid_votes_${y}`, label: `Total valid votes (${y})`, category: 'official_election_data', kind: 'number' },
    { field: `total_candidates_${y}`, label: `Candidates (${y})`, category: 'official_election_data', kind: 'number' },
  ];
};

const historicalResults: EvidenceFieldDef[] = [
  { field: 'seat_history_summary', label: 'Seat history summary', category: 'historical_results', kind: 'string' },
  { field: 'party_trajectory_compact', label: 'Party trajectory (compact)', category: 'historical_results', kind: 'string' },
  { field: 'unique_parties_across_elections', label: 'Unique parties across elections', category: 'historical_results', kind: 'number' },
  { field: 'party_continuity_score', label: 'Party continuity score', category: 'historical_results', kind: 'number' },
  { field: 'most_persistent_party', label: 'Most persistent party', category: 'historical_results', kind: 'string' },
  { field: 'party_turnover_count', label: 'Party turnover count', category: 'historical_results', kind: 'number' },
  { field: 'unique_winners_across_elections', label: 'Unique winners across elections', category: 'historical_results', kind: 'number' },
  { field: 'winner_continuity_score', label: 'Winner continuity score', category: 'historical_results', kind: 'number' },
  { field: 'seat_volatility_index', label: 'Seat volatility index', category: 'historical_results', kind: 'number' },
  { field: 'party_volatility_index', label: 'Party volatility index', category: 'historical_results', kind: 'number' },
];

const politicalDna: EvidenceFieldDef[] = [
  { field: 'dna_classification', label: 'Political DNA classification', category: 'political_dna', kind: 'string' },
  { field: 'dna_sub_type', label: 'Political DNA sub-type', category: 'political_dna', kind: 'string' },
  { field: 'dna_reasoning', label: 'Political DNA reasoning', category: 'political_dna', kind: 'string' },
  { field: 'dna_confidence', label: 'Political DNA confidence', category: 'political_dna', kind: 'string' },
  { field: 'competitiveness_class', label: 'Competitiveness class', category: 'political_dna', kind: 'string' },
  { field: 'competitiveness_trend', label: 'Competitiveness trend', category: 'political_dna', kind: 'string' },
  { field: 'competitiveness_avg_margin_pct', label: 'Average margin %', category: 'political_dna', kind: 'number' },
];

const governanceReports: EvidenceFieldDef[] = [
  { field: 'governance_issue_count', label: 'Governance issue count', category: 'governance_reports', kind: 'number' },
  { field: 'governance_issue_summary', label: 'Governance issue summary', category: 'governance_reports', kind: 'string', gapReason: 'Not compiled for this seat in the frozen dataset' },
  { field: 'environmental_issues_summary', label: 'Environmental issues summary', category: 'governance_reports', kind: 'string', gapReason: 'Not compiled for this seat in the frozen dataset' },
  { field: 'disaster_risks_summary', label: 'Disaster risks summary', category: 'governance_reports', kind: 'string', gapReason: 'Not compiled for this seat in the frozen dataset' },
  { field: 'linked_projects_count', label: 'Linked flagship projects', category: 'governance_reports', kind: 'number' },
];

const developmentIndicators: EvidenceFieldDef[] = [
  { field: 'population_value', label: 'Population (Census)', category: 'development_indicators', kind: 'number', gapReason: 'Demographics unavailable at constituency level (DATA-08)' },
  { field: 'overall_literacy_rate', label: 'Literacy rate', category: 'development_indicators', kind: 'number', gapReason: 'Demographics unavailable at constituency level (DATA-08)' },
  { field: 'urban_percentage', label: 'Urban population %', category: 'development_indicators', kind: 'number', gapReason: 'Demographics unavailable at constituency level (DATA-08)' },
  { field: 'sc_percentage', label: 'SC population %', category: 'development_indicators', kind: 'number', gapReason: 'Demographics unavailable at constituency level (DATA-08)' },
  { field: 'st_percentage', label: 'ST population %', category: 'development_indicators', kind: 'number', gapReason: 'Demographics unavailable at constituency level (DATA-08)' },
  { field: 'bank_branches_count', label: 'Bank branches', category: 'development_indicators', kind: 'string', gapReason: 'Economy data unavailable (DATA-09)' },
  { field: 'government_schools_count', label: 'Government schools', category: 'development_indicators', kind: 'string', gapReason: 'Infrastructure data unavailable' },
  { field: 'district_hospitals_count', label: 'District hospitals', category: 'development_indicators', kind: 'string', gapReason: 'Infrastructure data unavailable' },
];

const researchSources: EvidenceFieldDef[] = [
  { field: 'source_datasets', label: 'Source datasets', category: 'research_sources', kind: 'string' },
  { field: 'master_dataset_version', label: 'Dataset version', category: 'research_sources', kind: 'string' },
  { field: 'verification_date', label: 'Verification date', category: 'research_sources', kind: 'string' },
  { field: 'research_cutoff_date', label: 'Research cutoff', category: 'research_sources', kind: 'string' },
];

export const EVIDENCE_FIELDS: EvidenceFieldDef[] = [
  ...officialElectionData(2012),
  ...officialElectionData(2017),
  ...officialElectionData(2022),
  ...historicalResults,
  ...politicalDna,
  ...governanceReports,
  ...developmentIndicators,
  ...researchSources,
];

export const EVIDENCE_CATEGORY_LABELS: Record<EvidenceCategory, string> = {
  official_election_data: 'Official Election Data',
  historical_results: 'Historical Results',
  political_dna: 'Political DNA',
  governance_reports: 'Government Reports',
  development_indicators: 'Development Indicators',
  research_sources: 'Research Sources',
  known_data_gaps: 'Known Data Gaps',
};
