import type { ConstituencyRecord } from '../lib/up403/types';
import { predictRecord } from '../lib/intel/predictions';
import { applySwings, projectSeat, runScenario, buildSeatShare, scoreCoalitions, MAJORITY } from '../lib/intel/scenarios';
import { SCENARIOS, COALITIONS } from '../lib/intel/scenarios/definitions';
import type { ScenarioDef } from '../lib/intel/scenarios/types';

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

const bjpStronghold = makeRecord({});
const spSeat = makeRecord({
  canonical_constituency_id: 'UP-AC-001',
  winner_party_2012: 'SP',
  winner_vote_share_2012: 38,
  winner_party_2017: 'BJP',
  winner_vote_share_2017: 34,
  winner_party_2022: 'SP',
  winner_vote_share_2022: 41,
  current_mla_party: 'SP',
  ls2024_pc_winner_party: 'SP',
  dna_classification: 'CONTESTED',
  dna_sub_type: 'SP_vs_BJP',
  seat_volatility_index: 2,
  trajectory_total_shifts: 2,
  derived_bjp_competitiveness_score: 33,
  derived_sp_competitiveness_score: 41,
  derived_electoral_competitiveness_score: 0.45,
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

  const bjpPred = predictRecord(bjpStronghold);
  const spPred = predictRecord(spSeat);

  // Test 1: Positive swing increases target probability
  try {
    const swings = [{ target: 'SP', delta: 30, scope: { applyToAll: true }, note: '' }];
    const before = spPred.probabilities.find((p) => p.party === 'SP')?.probability ?? 0;
    const after = applySwings(spPred.probabilities, swings, 'Test Region', 'Test District', 'SP').find((p) => p.party === 'SP')?.probability ?? 0;
    assert(after > before, `SP probability rises after +30 swing (${before} -> ${after})`);
  } catch (e) {
    console.error('  FAIL: positive swing threw', e);
    failed++;
  }

  // Test 2: Negative swing decreases target probability
  try {
    const swings = [{ target: 'SP', delta: -30, scope: { applyToAll: true }, note: '' }];
    const before = spPred.probabilities.find((p) => p.party === 'SP')?.probability ?? 0;
    const after = applySwings(spPred.probabilities, swings, 'Test Region', 'Test District', 'SP').find((p) => p.party === 'SP')?.probability ?? 0;
    assert(after < before, `SP probability falls after -30 swing (${before} -> ${after})`);
  } catch (e) {
    console.error('  FAIL: negative swing threw', e);
    failed++;
  }

  // Test 3: Probabilities renormalize to 1 after swings
  try {
    const swings = [{ target: 'SP', delta: 25, scope: { applyToAll: true }, note: '' }];
    const adjusted = applySwings(spPred.probabilities, swings, 'Test Region', 'Test District', 'SP');
    const sum = adjusted.reduce((s, p) => s + p.probability, 0);
    assert(Math.abs(sum - 1) < 0.001, `Renormalised sum ~1 (got ${sum})`);
    for (const p of adjusted) assert(p.probability >= 0 && p.probability <= 1, `Party ${p.party} probability in [0,1]`);
  } catch (e) {
    console.error('  FAIL: renormalisation threw', e);
    failed++;
  }

  // Test 4: Regional scope only affects matching region
  try {
    const swings = [{ target: 'SP', delta: 60, scope: { region: 'Western UP (NCR + Western)' }, note: '' }];
    const west = applySwings(spPred.probabilities, swings, 'Western UP (NCR + Western)', 'X', 'SP').find((p) => p.party === 'SP')?.probability ?? 0;
    const east = applySwings(spPred.probabilities, swings, 'Eastern UP (Gangetic Plain)', 'Y', 'SP').find((p) => p.party === 'SP')?.probability ?? 0;
    assert(west > east, `Regional swing applies in West but not East (${west} vs ${east})`);
  } catch (e) {
    console.error('  FAIL: regional scope threw', e);
    failed++;
  }

  // Test 5: projectSeat detects flips
  try {
    const runnerUp = [...bjpPred.probabilities].sort((a, b) => b.probability - a.probability)[1];
    const flips = [{ target: runnerUp.party, delta: 60, scope: { applyToAll: true }, note: '' }];
    const outcome = projectSeat(bjpPred, flips);
    assert(outcome.flipped === true, `Seat flips under massive ${runnerUp.party} swing`);
    assert(outcome.baselineWinner === 'BJP', 'Baseline winner recorded');
    assert(outcome.scenarioWinner === runnerUp.party, 'Scenario winner changed to challenger');
  } catch (e) {
    console.error('  FAIL: projectSeat flip detection threw', e);
    failed++;
  }

  // Test 6: No-swings baseline produces no flips
  try {
    const outcome = projectSeat(bjpPred, []);
    assert(outcome.flipped === false, 'Baseline seat does not flip with no swings');
  } catch (e) {
    console.error('  FAIL: baseline projectSeat threw', e);
    failed++;
  }

  // Test 7: runScenario produces coherent result
  try {
    const def: ScenarioDef = SCENARIOS[1];
    const result = runScenario([bjpPred, spPred], def, COALITIONS);
    assert(result.totalSeats === 2, 'Scenario covers all seats');
    assert(result.flipCount >= 0, 'Flip count present');
    const shareSum = Object.values(result.seatShare).reduce((a, b) => a + b, 0);
    assert(shareSum === 2, 'Seat share sums to total seats');
    assert(result.coalitions.length === COALITIONS.length, 'Coalition outcomes match coalition list');
    assert(result.majority === MAJORITY, 'Majority threshold correct');
  } catch (e) {
    console.error('  FAIL: runScenario threw', e);
    failed++;
  }

  // Test 8: Coalition arithmetic sums member seats
  try {
    const share = { BJP: 200, SP: 150, INC: 20, RLD: 10, BSP: 15, OTHER: 8 };
    const outcomes = scoreCoalitions(share, COALITIONS);
    const nda = outcomes.find((c) => c.coalitionId === 'nda');
    const spLed = outcomes.find((c) => c.coalitionId === 'sp-led');
    assert((nda?.seats ?? 0) === 200, 'NDA coalition sums BJP + allies');
    assert((spLed?.seats ?? 0) === 180, 'SP-led coalition sums SP + INC + RLD');
  } catch (e) {
    console.error('  FAIL: coalition arithmetic threw', e);
    failed++;
  }

  // Test 9: Anti-incumbent stress swings against the sitting party
  try {
    const def = SCENARIOS.find((s) => s.id === 'anti-incumbent');
    assert(def !== undefined, 'Anti-incumbent scenario defined');
    const outcome = projectSeat(bjpPred, def!.swings);
    const probBefore = bjpPred.probabilities.find((p) => p.party === 'BJP')?.probability ?? 0;
    const probAfter = outcome.probabilities.find((p) => p.party === 'BJP')?.probability ?? 0;
    assert(probAfter < probBefore, `Incumbent BJP probability falls under anti-incumbent stress (${probBefore} -> ${probAfter})`);
  } catch (e) {
    console.error('  FAIL: anti-incumbent stress threw', e);
    failed++;
  }

  // Test 10: All defined scenarios run without throwing and sum seat shares
  try {
    for (const def of SCENARIOS) {
      const result = runScenario([bjpPred, spPred], def, COALITIONS);
      const sum = Object.values(result.seatShare).reduce((a, b) => a + b, 0);
      assert(sum === 2, `Scenario ${def.id} seat share sums to total`);
    }
  } catch (e) {
    console.error('  FAIL: full scenario sweep threw', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Intel Scenarios Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
