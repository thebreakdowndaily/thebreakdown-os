import { computeIntelligenceScores, scoreConstituencies, overallScore, aggregateScores, rankedWatchList, SCORE_WEIGHTS } from '../lib/intel/scoring';
import { momentumScore } from '../lib/intel/scoring/momentum';
import { competitivenessScore } from '../lib/intel/scoring/competitiveness';
import { incumbencyRiskScore } from '../lib/intel/scoring/incumbency-risk';
import { volatilityScore } from '../lib/intel/scoring/volatility';
import { investigationPriorityScore } from '../lib/intel/scoring/investigation-priority';
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
    winner_party_2017: 'INC',
    winner_votes_2017: 0,
    winner_vote_share_2017: 35,
    runner_up_2017: '',
    runner_up_party_2017: '',
    victory_margin_pct_2017: 8,
    total_valid_votes_2017: 100000,
    total_candidates_2017: 10,
    winner_2022: '',
    winner_party_2022: 'SP',
    winner_votes_2022: 0,
    winner_vote_share_2022: 40,
    runner_up_2022: '',
    runner_up_party_2022: '',
    victory_margin_pct_2022: 12,
    total_valid_votes_2022: 100000,
    total_candidates_2022: 10,
    seat_history_summary: '2012→BSP 2017→INC 2022→SP',
    party_trajectory_compact: '',
    current_mla_name: '',
    current_mla_party: 'SP',
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
    dna_classification: 'CONTESTED',
    dna_sub_type: '',
    dna_reasoning: '',
    dna_confidence: 'HIGH',
    dna_algorithm_version: '1.0.0',
    competitiveness_class: 'COMPETITIVE',
    competitiveness_trend: '',
    competitiveness_avg_margin_pct: 8.33,
    competitiveness_thresholds: '',
    unique_parties_across_elections: 3,
    party_continuity_score: 0,
    most_persistent_party: '',
    party_turnover_count: 2,
    unique_winners_across_elections: 3,
    winner_continuity_score: 0,
    seat_volatility_index: 2,
    party_volatility_index: 2,
    trajectory_total_shifts: 4,
    trajectory_unique_parties: 3,
    trajectory_steps_compact: '',
    trajectory_formula: '',
    sociology_dominant_party_by_avg_share: '',
    sociology_dominant_party_avg_vote_share: 0,
    sociology_historical_behaviour_summary: '',
    sociology_most_persistent_party: '',
    sociology_party_persistent_consecutive_wins: 0,
    sociology_has_repeat_winner: false,
    derived_seat_volatility: 2,
    derived_winner_persistence_score: 0,
    derived_party_persistence_score: 0,
    derived_electoral_competitiveness_score: 0.4,
    derived_representation_continuity_score: 0,
    derived_governance_issue_density: 0.3,
    derived_development_coverage_index: 0,
    derived_bjp_competitiveness_score: 0,
    derived_sp_competitiveness_score: 0,
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
    governance_issue_count: 3,
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

const contested = makeRecord({});
const safeSeat = makeRecord({
  dna_classification: 'INCUMBENT_STRONGHOLD',
  dna_sub_type: 'BJP_STRONGHOLD',
  victory_margin_pct_2012: 25,
  victory_margin_pct_2017: 30,
  victory_margin_pct_2022: 35,
  winner_vote_share_2012: 45,
  winner_vote_share_2017: 50,
  winner_vote_share_2022: 55,
  competitiveness_avg_margin_pct: 30,
  unique_parties_across_elections: 1,
  party_turnover_count: 0,
  seat_volatility_index: 0,
  party_volatility_index: 0,
  trajectory_total_shifts: 0,
  unique_winners_across_elections: 1,
  winner_continuity_score: 1,
  derived_winner_persistence_score: 1,
  derived_electoral_competitiveness_score: 0,
  derived_governance_issue_density: 0,
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

  // Test 1: Scores fall in range 0-100 for a contested seat
  try {
    const scores = computeIntelligenceScores(contested);
    for (const key of Object.keys(scores) as Array<keyof typeof scores>) {
      const v = scores[key].value;
      assert(v >= 0 && v <= 100, `Score ${key} is ${v}, expected in [0,100]`);
    }
  } catch (e) {
    console.error('  FAIL: computeIntelligenceScores threw', e);
    failed++;
  }

  // Test 2: Contested seat scores higher than safe seat
  try {
    const contestedScores = computeIntelligenceScores(contested);
    const safeScores = computeIntelligenceScores(safeSeat);
    assert(contestedScores.volatility.value > safeScores.volatility.value, 'Contested seat should be more volatile than safe seat');
    assert(contestedScores.competitiveness.value > safeScores.competitiveness.value, 'Contested seat should be more competitive than safe seat');
    assert(contestedScores.incumbency_risk.value > safeScores.incumbency_risk.value, 'Contested seat should have higher incumbency risk');
    assert(contestedScores.investigation_priority.value > safeScores.investigation_priority.value, 'Contested seat should have higher investigation priority');
  } catch (e) {
    console.error('  FAIL: contested vs safe comparison threw', e);
    failed++;
  }

  // Test 3: Drivers are explainable and reference source fields
  try {
    const momentum = momentumScore(contested);
    assert(momentum.drivers.length > 0, 'Momentum has at least one driver');
    for (const d of momentum.drivers) {
      assert(typeof d.sourceField === 'string' && d.sourceField.length > 0, 'Driver references a source field');
      assert(typeof d.evidence === 'string' && d.evidence.length > 0, 'Driver includes evidence text');
    }
  } catch (e) {
    console.error('  FAIL: momentum driver explainability threw', e);
    failed++;
  }

  // Test 4: Confidence tiers present and valid
  try {
    const scores = computeIntelligenceScores(contested);
    for (const key of Object.keys(scores) as Array<keyof typeof scores>) {
      const tier = scores[key].confidence;
      assert(['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'VERY_LOW'].includes(tier), `Confidence tier ${tier} is valid for ${key}`);
      assert(typeof scores[key].confidenceReason === 'string' && scores[key].confidenceReason.length > 0, 'Confidence reason present');
      assert(typeof scores[key].interpretation === 'string' && scores[key].interpretation.length > 0, 'Interpretation present');
    }
  } catch (e) {
    console.error('  FAIL: confidence validation threw', e);
    failed++;
  }

  // Test 5: Assumptions documented
  try {
    for (const score of [momentumScore(contested), competitivenessScore(contested), incumbencyRiskScore(contested), volatilityScore(contested), investigationPriorityScore(contested)]) {
      assert(score.assumptions.length > 0, `${score.label} documents assumptions`);
    }
  } catch (e) {
    console.error('  FAIL: assumptions validation threw', e);
    failed++;
  }

  // Test 6: Overall score is weighted blend of the five
  try {
    const scores = computeIntelligenceScores(contested);
    const total = overallScore(scores);
    assert(total >= 0 && total <= 100, `Overall ${total} in [0,100]`);
    const manual = Object.keys(SCORE_WEIGHTS).reduce((sum, k) => sum + SCORE_WEIGHTS[k as keyof typeof SCORE_WEIGHTS] * scores[k as keyof typeof SCORE_WEIGHTS].value, 0);
    assert(Math.abs(total - Math.round(manual)) <= 1, `Overall ${total} matches rounded manual weighted sum ${Math.round(manual)}`);
  } catch (e) {
    console.error('  FAIL: overall score validation threw', e);
    failed++;
  }

  // Test 7: scoreConstituencies maps all records
  try {
    const items = scoreConstituencies([contested, safeSeat]);
    assert(items.length === 2, 'scoreConstituencies returns all records');
    assert(items[0].scores.investigation_priority.value !== undefined, 'Investigation priority present per record');
  } catch (e) {
    console.error('  FAIL: scoreConstituencies threw', e);
    failed++;
  }

  // Test 8: Aggregate summary correctness
  try {
    const items = scoreConstituencies([contested, safeSeat]);
    const agg = aggregateScores(items);
    assert(agg.count === 2, 'Aggregate counts records');
    const compAvg = (items[0].scores.competitiveness.value + items[1].scores.competitiveness.value) / 2;
    assert(Math.abs(agg.byScore.competitiveness.avg - compAvg) < 0.001, 'Aggregate average is correct');
    assert(agg.byScore.competitiveness.min === Math.min(items[0].scores.competitiveness.value, items[1].scores.competitiveness.value), 'Aggregate min correct');
    assert(agg.byScore.competitiveness.max === Math.max(items[0].scores.competitiveness.value, items[1].scores.competitiveness.value), 'Aggregate max correct');
  } catch (e) {
    console.error('  FAIL: aggregateScores threw', e);
    failed++;
  }

  // Test 9: Ranked watch list orders by score descending and respects limit
  try {
    const items = scoreConstituencies([contested, safeSeat]);
    const list = rankedWatchList(items, 'investigation_priority', 1);
    assert(list.length === 1, 'Watch list respects limit');
    assert(list[0].canonical_constituency_id === 'UP-AC-000', 'Highest investigation priority ranks first');
  } catch (e) {
    console.error('  FAIL: rankedWatchList threw', e);
    failed++;
  }

  // Test 10: Volatility score uses trajectory shifts
  try {
    const high = volatilityScore(makeRecord({ trajectory_total_shifts: 4, seat_volatility_index: 2 }));
    const low = volatilityScore(makeRecord({ trajectory_total_shifts: 0, seat_volatility_index: 0 }));
    assert(high.value > low.value, 'More trajectory shifts raises volatility');
  } catch (e) {
    console.error('  FAIL: volatility shift sensitivity threw', e);
    failed++;
  }

  // Test 11: Empty aggregate handles zero records
  try {
    const agg = aggregateScores([]);
    assert(agg.count === 0, 'Empty aggregate has zero count');
    assert(agg.overall.avg === 0, 'Empty aggregate overall avg is 0');
  } catch (e) {
    console.error('  FAIL: empty aggregate threw', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Intel Scoring Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
