import type { ConstituencyRecord } from '../lib/up403/types';
import { buildEvidenceGraph, buildEvidenceGraphAll, aggregateEvidence } from '../lib/intel/evidence';
import { resolveSourceField, linkPredictionToEvidence } from '../lib/intel/evidence';
import { predictRecord } from '../lib/intel/predictions';
import { toConstituencyIntelligence } from '../lib/intel/scoring';

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
    runner_up_party_2012: 'SP',
    victory_margin_pct_2012: 5,
    total_valid_votes_2012: 100000,
    total_candidates_2012: 10,
    winner_2017: '',
    winner_party_2017: 'BJP',
    winner_votes_2017: 0,
    winner_vote_share_2017: 45,
    runner_up_2017: '',
    runner_up_party_2017: 'SP',
    victory_margin_pct_2017: 8,
    total_valid_votes_2017: 100000,
    total_candidates_2017: 10,
    winner_2022: '',
    winner_party_2022: 'BJP',
    winner_votes_2022: 0,
    winner_vote_share_2022: 52,
    runner_up_2022: '',
    runner_up_party_2022: 'SP',
    victory_margin_pct_2022: 12,
    total_valid_votes_2022: 100000,
    total_candidates_2022: 10,
    seat_history_summary: '2012:BSP 2017:BJP 2022:BJP',
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
    dna_reasoning: 'BJP won 2 of last 3 with rising margins',
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
    demographics_availability_status: 'NOT_AVAILABLE_AT_CONSTITUENCY_LEVEL',
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
    economy_availability_status: 'NOT_AVAILABLE',
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
    linked_projects_count: 4,
    governance_issue_count: 0,
    governance_issue_summary: '',
    environmental_issues_summary: '',
    disaster_risks_summary: '',
    governance_availability_status: '',
    source_datasets: 'DATA-02A; DATA-03; DATA-04',
    verification_date: '2026-07-28',
    research_cutoff_date: '2026-07-30',
    computed_at: '',
    master_dataset_version: '1.1.0',
    ...overrides,
  };
  return base;
}

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

  const rec = makeRecord({});
  const ev = buildEvidenceGraph(rec);

  // Test 1: Evidence graph built with all registered fields
  try {
    assert(ev.canonical_constituency_id === 'UP-AC-000', 'Graph carries constituency id');
    assert(ev.items.length >= 50, `Evidence graph registers expected field set (got ${ev.items.length})`);
  } catch (e) {
    console.error('  FAIL: graph construction threw', e);
    failed++;
  }

  // Test 2: Available election evidence is marked available with provenance
  try {
    const winner2022 = ev.items.find((i) => i.sourceField === 'winner_party_2022');
    assert(winner2022 !== undefined, 'Winner 2022 field registered');
    assert(winner2022?.status === 'available', 'Winner 2022 marked available');
    assert(winner2022?.value === 'BJP', 'Winner 2022 value correct');
    assert((winner2022?.sourceDataset ?? '').length > 0, 'Provenance source dataset present');
    assert((winner2022?.authority ?? '').length > 0, 'Provenance authority present');
  } catch (e) {
    console.error('  FAIL: election evidence threw', e);
    failed++;
  }

  // Test 3: Missing development indicators register as evidence debt, not zeros
  try {
    const literacy = ev.items.find((i) => i.sourceField === 'overall_literacy_rate');
    assert(literacy?.status === 'gap', 'Missing literacy registered as gap');
    assert(ev.gaps.some((g) => g.sourceField === 'overall_literacy_rate'), 'Gap list includes literacy');
    assert(ev.debt > 0, `Evidence debt > 0 (got ${ev.debt})`);
  } catch (e) {
    console.error('  FAIL: gap registration threw', e);
    failed++;
  }

  // Test 4: Coverage and confidence computed from presence
  try {
    assert(ev.coverage > 0 && ev.coverage < 100, `Coverage partial (got ${ev.coverage}%)`);
    assert(ev.confidence !== undefined, 'Confidence tier present');
    assert(ev.confidenceReason.includes('%'), 'Confidence reason quantifies coverage');
  } catch (e) {
    console.error('  FAIL: coverage/confidence threw', e);
    failed++;
  }

  // Test 5: Timeline includes elections, LS2024, and verification
  try {
    const types = new Set(ev.timeline.map((t) => t.type));
    assert(types.has('election'), 'Timeline has election events');
    assert(types.has('ls2024'), 'Timeline has LS2024 event');
    assert(types.has('verification'), 'Timeline has verification event');
    assert(ev.timeline.some((t) => t.description.includes('BJP')), 'Election event names the winner party');
  } catch (e) {
    console.error('  FAIL: timeline threw', e);
    failed++;
  }

  // Test 6: Better-data record has higher coverage than gap-heavy record
  try {
    const rich = makeRecord({
      population_value: 500000,
      overall_literacy_rate: 70,
      urban_percentage: 30,
      sc_percentage: 20,
      st_percentage: 1,
      bank_branches_count: '12',
      government_schools_count: '40',
      district_hospitals_count: '2',
      governance_issue_summary: 'Water scarcity reported',
      environmental_issues_summary: 'Flood risk in monsoon',
      disaster_risks_summary: 'Low',
    });
    const richEv = buildEvidenceGraph(rich);
    assert(richEv.coverage > ev.coverage, `Richer record higher coverage (${richEv.coverage}% vs ${ev.coverage}%)`);
    assert(richEv.debt < ev.debt, `Richer record lower debt (${richEv.debt} vs ${ev.debt})`);
  } catch (e) {
    console.error('  FAIL: coverage differential threw', e);
    failed++;
  }

  // Test 7: Aggregate computes counts and ranks
  try {
    const ev2 = buildEvidenceGraph(makeRecord({ canonical_constituency_id: 'UP-AC-001' }));
    const agg = aggregateEvidence([ev, ev2]);
    assert(agg.count === 2, 'Aggregate counts graphs');
    assert(agg.totalDebt === ev.debt + ev2.debt, 'Aggregate sums debt');
    assert(agg.byCategory.official_election_data.available > 0, 'Aggregate tracks official election data');
    assert(agg.mostGapped.length === 2, 'Most-gapped ranked list populated');
  } catch (e) {
    console.error('  FAIL: aggregate threw', e);
    failed++;
  }

  // Test 8: Prediction drivers resolve to supporting evidence through intelligence scores
  try {
    const prediction = predictRecord(rec);
    const intel = toConstituencyIntelligence(rec);
    const links = linkPredictionToEvidence(prediction, intel, ev);
    assert(links.length === prediction.drivers.length, 'One link per prediction driver');
    const supported = links.filter((l) => l.supporting.length > 0);
    assert(supported.length > 0, `At least one driver backed by evidence (${supported.length})`);
    const momentum = links.find((l) => l.sourceField === 'intel.scoring.momentum');
    assert(momentum !== undefined && momentum.supporting.length >= 1, 'Momentum driver resolves to margin/share evidence');
  } catch (e) {
    console.error('  FAIL: prediction linkage threw', e);
    failed++;
  }

  // Test 9: resolveSourceField matches wildcard and exact patterns
  try {
    const exact = resolveSourceField(ev, 'winner_party_2022');
    assert(exact.length === 1, 'Exact source field resolves');
    const wildcard = resolveSourceField(ev, 'winner_vote_share_*');
    assert(wildcard.length === 3, `Wildcard resolves all three years (got ${wildcard.length})`);
    const none = resolveSourceField(ev, 'does_not_exist');
    assert(none.length === 0, 'Unknown field resolves to empty');
  } catch (e) {
    console.error('  FAIL: resolveSourceField threw', e);
    failed++;
  }

  // Test 10: buildEvidenceGraphAll handles the full set and every seat has a graph
  try {
    const all = buildEvidenceGraphAll([rec, makeRecord({ canonical_constituency_id: 'UP-AC-002', constituency_name: 'Second' })]);
    assert(all.length === 2, 'Graph built for every record');
    for (const g of all) {
      assert(g.items.length > 0, `${g.constituency_name} has evidence nodes`);
      assert(g.timeline.length > 0, `${g.constituency_name} has timeline`);
    }
  } catch (e) {
    console.error('  FAIL: buildEvidenceGraphAll threw', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Intel Evidence Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
