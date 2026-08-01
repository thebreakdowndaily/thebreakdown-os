export interface ConstituencyRecord {
  canonical_constituency_id: string;
  ac_number: number;
  constituency_name: string;
  pc_number: number;
  pc_name: string;
  district: string;
  division: string;
  region: string;
  reservation_type: string;
  area_sq_km: number | null;
  terrain_type: string;
  major_rivers: string;
  forest_area: string;
  sub_divisions_count: number;
  tehsils_count: number;
  development_blocks_count: number;
  municipal_bodies_count: number;
  winner_2012: string;
  winner_party_2012: string;
  winner_votes_2012: number;
  winner_vote_share_2012: number;
  runner_up_2012: string;
  runner_up_party_2012: string;
  victory_margin_pct_2012: number;
  total_valid_votes_2012: number;
  total_candidates_2012: number;
  winner_2017: string;
  winner_party_2017: string;
  winner_votes_2017: number;
  winner_vote_share_2017: number;
  runner_up_2017: string;
  runner_up_party_2017: string;
  victory_margin_pct_2017: number;
  total_valid_votes_2017: number;
  total_candidates_2017: number;
  winner_2022: string;
  winner_party_2022: string;
  winner_votes_2022: number;
  winner_vote_share_2022: number;
  runner_up_2022: string;
  runner_up_party_2022: string;
  victory_margin_pct_2022: number;
  total_valid_votes_2022: number;
  total_candidates_2022: number;
  seat_history_summary: string;
  party_trajectory_compact: string;
  current_mla_name: string;
  current_mla_party: string;
  current_mla_status: string;
  current_mla_elected_via: string;
  current_mla_previous_representative: string;
  current_mla_vacancy_reason: string;
  current_mla_by_election_date: string;
  current_mla_representation_change_type: string;
  current_mp_name: string;
  current_mp_party: string;
  current_mp_term_start: string;
  current_mp_term_end: string;
  current_mp_pc_name: string;
  ls2024_pc_winner: string;
  ls2024_pc_winner_party: string;
  ls2024_pc_winner_party_id: string;
  ls2024_winner_changed_flag: boolean;
  ls2024_party_changed_flag: boolean;
  dna_classification: string;
  dna_sub_type: string;
  dna_reasoning: string;
  dna_confidence: string;
  dna_algorithm_version: string;
  competitiveness_class: string;
  competitiveness_trend: string;
  competitiveness_avg_margin_pct: number;
  competitiveness_thresholds: string;
  unique_parties_across_elections: number;
  party_continuity_score: number;
  most_persistent_party: string;
  party_turnover_count: number;
  unique_winners_across_elections: number;
  winner_continuity_score: number;
  seat_volatility_index: number;
  party_volatility_index: number;
  trajectory_total_shifts: number;
  trajectory_unique_parties: number;
  trajectory_steps_compact: string;
  trajectory_formula: string;
  sociology_dominant_party_by_avg_share: string;
  sociology_dominant_party_avg_vote_share: number;
  sociology_historical_behaviour_summary: string;
  sociology_most_persistent_party: string;
  sociology_party_persistent_consecutive_wins: number;
  sociology_has_repeat_winner: boolean;
  derived_seat_volatility: number;
  derived_winner_persistence_score: number;
  derived_party_persistence_score: number;
  derived_electoral_competitiveness_score: number;
  derived_representation_continuity_score: number;
  derived_governance_issue_density: number;
  derived_development_coverage_index: number;
  derived_bjp_competitiveness_score: number;
  derived_sp_competitiveness_score: number;
  population_value: number | null;
  population_reference_year: number | null;
  sc_population: number | null;
  sc_percentage: number | null;
  st_population: number | null;
  st_percentage: number | null;
  overall_literacy_rate: number | null;
  male_literacy_rate: number | null;
  female_literacy_rate: number | null;
  urban_population: number | null;
  rural_population: number | null;
  urban_percentage: number | null;
  rural_percentage: number | null;
  demographics_availability_status: string;
  major_crops_summary: string;
  irrigation_coverage: string;
  major_industries_summary: string;
  msme_units_count: string;
  odop_product: string;
  odop_cluster: string;
  odop_export_orientation: string;
  bank_branches_count: string;
  financial_inclusion_status: string;
  national_highways_count: string;
  railway_stations_count: string;
  economy_availability_status: string;
  government_schools_count: string;
  degree_colleges_count: string;
  iti_count: string;
  district_hospitals_count: string;
  phc_count: string;
  chc_count: string;
  household_electrification_info: string;
  infrastructure_availability_status: string;
  pmgsy_projects_info: Record<string, unknown>;
  jal_jeevan_mission_info: Record<string, unknown>;
  pmay_projects_info: Record<string, unknown>;
  flagship_scheme_presence: string;
  development_coverage_status: string;
  linked_projects_count: number;
  governance_issue_count: number;
  governance_issue_summary: string;
  environmental_issues_summary: string;
  disaster_risks_summary: string;
  governance_availability_status: string;
  source_datasets: string;
  verification_date: string;
  research_cutoff_date: string;
  computed_at: string;
  master_dataset_version: string;
  [key: string]: unknown;
}

export interface PersonRecord {
  person_id: string;
  name: string;
  role: 'MLA' | 'MP';
  party: string;
  constituencies: Array<{
    canonical_id: string;
    name: string;
    role: string;
    year: number;
  }>;
  election_history: Array<{
    year: number;
    constituency_id: string;
    constituency_name: string;
    position: 'winner' | 'runner_up';
    party: string;
    votes: number;
    vote_share: number;
  }>;
}

export interface GraphNode {
  id: string;
  type: 'constituency' | 'district' | 'division' | 'pc' | 'person' | 'party';
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TimelineEvent {
  date: string;
  type: string;
  description: string;
  category: 'election' | 'representation' | 'by_election' | 'vacancy' | 'project' | 'governance';
}

export interface ApiProvenance {
  original_authority: string;
  dataset: string;
  dataset_version: string;
  verification_date: string;
  research_cutoff_date: string;
  source_quality: string;
  originating_phase: string;
}

export interface ApiResponse<T> {
  success: boolean;
  version: string;
  dataset_version: string;
  count?: number;
  page?: number;
  limit?: number;
  total?: number;
  data: T;
  provenance?: ApiProvenance;
}

export interface ApiError {
  success: false;
  version: string;
  error: string;
  message: string;
  documentation_url: string;
}

export interface ElectionYear {
  year: number;
  label: string;
  type: 'Vidhan Sabha' | 'Lok Sabha';
  constituencies_contested: number;
  total_valid_votes: number;
  winner_parties: Record<string, number>;
}

export interface AnalyticsMetrics {
  dna_distribution: Record<string, number>;
  competitiveness_distribution: Record<string, number>;
  party_hold_counts: Record<string, number>;
  regional_party_dominance: Record<string, Record<string, number>>;
  volatility_summary: {
    avg_seat_volatility: number;
    avg_party_volatility: number;
    high_volatility_seats: number;
    stable_seats: number;
  };
  reservation_summary: Record<string, number>;
}

export interface FilterOptions {
  districts: string[];
  divisions: string[];
  regions: string[];
  reservation_types: string[];
  dna_classifications: string[];
  competitiveness_classes: string[];
  parties: string[];
  election_years: number[];
}
