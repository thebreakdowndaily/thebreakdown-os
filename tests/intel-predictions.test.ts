import { computeBaseStrength } from '../lib/intel/predictions/base';
import { buildBaseProbabilities, predictConstituency, predictRecord, predictAll, aggregatePredictions } from '../lib/intel/predictions';
import type { ConstituencyRecord } from '../lib/up403/types';

function makeRecord(overrides: Partial<ConstituencyRecord>): ConstituencyRecord {
  const base: ConstituencyRecord = {
    canonical_constituency_id: 'UP-AC-000',
    ac_number: 0,
    constituency_name: 'Test Seat',
    pc_number: 1,
    pc_name: 'Test PC',
    district: 'Test District',
    division: 'Test Division',
    region: 'Test Region',
    reservation_type: 'GENERAL',
    area_sq_km: null,
    terrain_type: '',
    major_rivers: '',
    forest_area: '',
    sub_divisions_count: 0,
    tehsils_count: 0,
    development_blocks_count: 0,
    municipal_bodies_count: 0,
    winner_2012: '',
    winner_party_2012: 'BSP',
    winner_votes_2012: 0,
    winner_vote_share_2012: 30,
    runner_up_2012: '',
    runner_up_party_2012: '',
    victory_margin_pct_2012: 5,
    total_valid_votes_2012: 100000,
    total_candidates_2012: 10,
    winner_2017: '',
    winner_party_2017: 'BJP',
    winner_votes_2017: 0,
    winner_vote_share_2017: 45,
    runner_up_2017: '',
    runner_up_party_2017: '',
    victory_margin_pct_2017: 8,
    total_valid_votes_2017: 100000,
    total_candidates_2017: 10,
    winner_2022: '',
    winner_party_2022: 'BJP',
    winner_votes_2022: 0,
    winner_vote_share_2022: 52,
    runner_up_2022: '',
    runner_up_party_2022: '',
    victory_margin_pct_2022: 12,
    total_valid_votes_2022: 100000,
    total_candidates_2022: 10,
    seat_history_summary: '',
    party_trajectory_compact: '',
    current_mla_name: '',
    current_mla_party: 'BJP',
    current_mla_status: 'SERVING',
    current_mla_elected_via: '2022_GENERAL',
    current_mla_previous_representative: '',
    current_mla_vacancy_reason: '',
    current_mla_by_election_date: '',
    current_mla_representation_change_type: 'SAME_PARTY',
    current_mp_name: '',
    current_mp_party: 'BJP',
    current_mp_term_start: '',
    current_mp_term_end: '',
    current_mp_pc_name: '',
    ls2024_pc_winner: '',
    ls2024_pc_winner_party: 'BJP',
    ls2024_pc_winner_party_id: '',
    ls2024_winner_changed_flag: false,
    ls2024_party_changed_flag: false,
    dna_classification: 'INCUMBENT_STRONGHOLD',
    dna_sub_type: 'BJP_STRONGHOLD',
    dna_reasoning: '',
    dna_confidence: 'HIGH',
    dna_algorithm_version: '1.0.0',
    competitiveness_class: 'SAFE',
    competitiveness_trend: '',
    competitiveness_avg_margin_pct: 20,
    competitiveness_thresholds: '',
    unique_parties_across_elections: 2,
    party_continuity_score: 0.5,
    most_persistent_party: 'BJP',
    party_turnover_count: 1,
    unique_winners_across_elections: 2,
    winner_continuity_score: 0.5,
    seat_volatility_index: 1,
    party_volatility_index: 1,
    trajectory_total_shifts: 2,
    trajectory_unique_parties: 2,
    trajectory_steps_compact: '',
    trajectory_formula: '',
    sociology_dominant_party_by_avg_share: 'BJP',
    sociology_dominant_party_avg_vote_share: 48,
    sociology_historical_behaviour_summary: '',
    sociology_most_persistent_party: 'BJP',
    sociology_party_persistent_consecutive_wins: 1,
    sociology_has_repeat_winner: true,
    derived_seat_volatility: 1,
    derived_winner_persistence_score: 0.5,
    derived_party_persistence_score: 0.5,
    derived_electoral_competitiveness_score: 0.2,
    derived_representation_continuity_score: 0.5,
    derived_governance_issue_density: 0.1,
    derived_development_coverage_index: 0,
    derived_bjp_competitiveness_score: 48,
    derived_sp_competitiveness_score: 20,
    population_value: null,
    population_reference_year: null,
    sc_population: null,
    sc_percentage: null,
    st_population: null,
    st_percentage: null,
    overall_literacy_rate: null,
    male_literacy_rate: null,
    female_literacy_rate: null,
    urban_population: null,
    rural_population: null,
    urban_percentage: null,
    rural_percentage: null,
    demographics_availability_status: '',
    major_crops_summary: '',
    irrigation_coverage: '',
    major_industries_summary: '',
    msme_units_count: '',
    odop_product: '',
    odop_cluster: '',
    odop_export_orientation: '',
    bank_branches_count: '',
    financial_inclusion_status: '',
    national_highways_count: '',
    railway_stations_count: '',
    economy_availability_status: '',
    government_schools_count: '',
    degree_colleges_count: '',
    iti_count: '',
    district_hospitals_count: '',
    phc_count: '',
    chc_count: '',
    household_electrification_info: '',
    infrastructure_availability_status: '',
    pmgsy_projects_info: {},
    jal_jeevan_mission_info: {},
    pmay_projects_info: {},
    flagship_scheme_presence: '',
    development_coverage_status: '',
    linked_projects_count: 0,
    governance_issue_count: 2,
    governance_issue_summary: '',
    environmental_issues_summary: '',
    disaster_risks_summary: '',
    governance_availability_status: '',
    source_datasets: '',
    verification_date: '',
    research_cutoff_date: '2026-07-30',
    computed_at: '',
    master_dataset_version: '1.1.0',
    ...overrides,
  };
  return base;
}

const strongBjp = makeRecord({});
const contested = makeRecord({
  canonical_constituency_id: 'UP-AC-001',
  winner_party_2012: 'BSP',
  winner_vote_share_2012: 28,
  winner_party_2017: 'INC',
  winner_vote_share_2017: 32,
  winner_party_2022: 'SP',
  winner_vote_share_2022: 36,
  current_mla_party: 'SP',
  ls2024_pc_winner_party: 'INC',
  dna_classification: 'CONTESTED',
  dna_sub_type: 'INC_vs_SP',
  seat_volatility_index: 2,
  party_volatility_index: 2,
  trajectory_total_shifts: 4,
  unique_parties_across_elections: 3,
  party_turnover_count: 2,
  derived_bjp_competitiveness_score: 24,
  derived_sp_competitiveness_score: 23,
  derived_electoral_competitiveness_score: 0.4,
});

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, msg: string) {
    if (cond) {
      passed++;
    } else {
      console.error(`  FAIL: ${msg}`);
      failed++;
    }
  }

  // Test 1: Base strength favours BJP in stronghold
  try {
    const base = computeBaseStrength(strongBjp);
    const bjp = base.candidates.find((c) => c.party === 'BJP');
    assert(bjp !== undefined, 'BJP is a candidate in stronghold');
    assert((bjp?.baseStrength ?? 0) > 0, 'BJP base strength is positive');
  } catch (e) {
    console.error('  FAIL: computeBaseStrength threw', e);
    failed++;
  }

  // Test 2: Base probabilities sum to 1
  try {
    const probs = buildBaseProbabilities(strongBjp);
    const sum = probs.reduce((s, p) => s + p.probability, 0);
    assert(Math.abs(sum - 1) < 0.001, `Base probabilities sum to ~1 (got ${sum})`);
    assert(probs.length >= 2, 'At least two parties in the race');
  } catch (e) {
    console.error('  FAIL: buildBaseProbabilities threw', e);
    failed++;
  }

  // Test 3: predictRecord returns full explainability model
  try {
    const p = predictRecord(strongBjp);
    assert(p.predicted_winner === 'BJP', `BJP predicted in stronghold (got ${p.predicted_winner})`);
    assert(p.winner_probability > 50, 'Winner probability exceeds 50%');
    assert(p.winner_probability <= 100 && p.winner_probability >= 0, 'Winner probability in [0,100]');
    assert(p.winner_ci[0] <= p.winner_probability && p.winner_probability <= p.winner_ci[1], 'Winner CI brackets winner probability');
    assert(p.confidence === 'HIGH' || p.confidence === 'MEDIUM', `Confidence is reasonable (got ${p.confidence})`);
    assert(p.assumptions.length > 0, 'Assumptions documented');
    assert(p.drivers.length >= 0, 'Drivers array present');
    assert(p.sensitivity.length >= 3, 'Sensitivity covers main scores');
    assert(p.whyLeading.length > 0, 'Why-leading narrative present');
    assert(p.whatCouldChangeIt.length > 0, 'What-could-change-it narrative present');
  } catch (e) {
    console.error('  FAIL: predictRecord threw', e);
    failed++;
  }

  // Test 4: Sensitivity is sorted by delta descending
  try {
    const p = predictRecord(contested);
    const deltas = p.sensitivity.map((s) => s.delta);
    const sorted = [...deltas].sort((a, b) => b - a);
    assert(JSON.stringify(deltas) === JSON.stringify(sorted), 'Sensitivity sorted by magnitude');
  } catch (e) {
    console.error('  FAIL: sensitivity ordering threw', e);
    failed++;
  }

  // Test 5: Contested seat is less certain than stronghold
  try {
    const strong = predictRecord(strongBjp);
    const open = predictRecord(contested);
    assert(open.winner_probability < strong.winner_probability, 'Contested seat has lower winner probability');
  } catch (e) {
    console.error('  FAIL: contested vs strong comparison threw', e);
    failed++;
  }

  // Test 6: predictAll maps all records, aggregate is coherent
  try {
    const all = predictAll([strongBjp, contested]);
    assert(all.length === 2, 'predictAll returns all records');
    const agg = aggregatePredictions(all);
    assert(agg.count === 2, 'Aggregate count correct');
    assert(agg.seatShare[all[0].predicted_winner] !== undefined, 'Seat share counts winners');
    const shareSum = Object.values(agg.seatShare).reduce((a, b) => a + b, 0);
    assert(shareSum === 2, 'Seat share sums to total seats');
    assert(agg.sensitiveSeats.length > 0, 'Sensitive seats list populated');
  } catch (e) {
    console.error('  FAIL: predictAll/aggregate threw', e);
    failed++;
  }

  // Test 7: Probabilities per party sum to 100% after prediction
  try {
    const p = predictRecord(contested);
    const sum = p.probabilities.reduce((s, x) => s + x.probability, 0);
    assert(Math.abs(sum - 1) < 0.001, `Party probabilities sum to ~1 (got ${sum})`);
    for (const x of p.probabilities) {
      assert(x.probability >= 0 && x.probability <= 1, `Party ${x.party} probability in [0,1]`);
      assert(x.ciLow <= x.probability && x.probability <= x.ciHigh, `Party ${x.party} CI brackets probability`);
    }
  } catch (e) {
    console.error('  FAIL: per-party probability validation threw', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Intel Predictions Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
