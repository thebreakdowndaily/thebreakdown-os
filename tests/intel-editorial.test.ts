import type { ConstituencyRecord } from '../lib/up403/types';
import { buildInvestigationCase, rankInvestigationPipeline, computeFlips, factorAggregatesFor, pipelineByRegion, EDITORIAL_FACTORS } from '../lib/intel/editorial';
import { toConstituencyIntelligence } from '../lib/intel/scoring';
import { predictRecord } from '../lib/intel/predictions';
import { buildEvidenceGraph } from '../lib/intel/evidence';

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
    current_mla_name: 'Kapil Dev Agarwal',
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

  function noLeak(text: string): boolean {
    return !text.includes('null') && !text.includes('undefined') && !text.includes('[object Object]');
  }

  // Stable stronghold fixture — low investigation demand.
  const stable = makeRecord({
    canonical_constituency_id: 'UP-AC-001',
    dna_classification: 'INCUMBENT_STRONGHOLD',
    competitiveness_class: 'SAFE',
    party_turnover_count: 0,
    seat_volatility_index: 0,
    trajectory_total_shifts: 0,
    derived_winner_persistence_score: 0.9,
    derived_governance_issue_density: 0,
  });

  // Contested volatile fixture — high investigation demand.
  const contested = makeRecord({
    canonical_constituency_id: 'UP-AC-002',
    dna_classification: 'SWING',
    dna_sub_type: 'BJP_SP_SWING',
    competitiveness_class: 'CONTESTED',
    party_turnover_count: 3,
    seat_volatility_index: 3,
    trajectory_total_shifts: 3,
    winner_party_2012: 'SP',
    winner_party_2017: 'BSP',
    winner_party_2022: 'SP',
    current_mla_party: 'SP',
    ls2024_pc_winner_party: 'BJP',
    ls2024_party_changed_flag: true,
    derived_winner_persistence_score: 0.2,
    derived_governance_issue_density: 0.8,
  });

  const caseStable = buildInvestigationCase(stable);
  const caseContested = buildInvestigationCase(contested);

  // Test 1: Every seat gets a fully-formed investigation case
  try {
    assert(caseStable.canonical_constituency_id === 'UP-AC-001', 'Case carries constituency id');
    assert(caseStable.factors.length === 5, 'Exactly 5 factors per case');
    assert(caseStable.factors.every((f) => EDITORIAL_FACTORS.includes(f.key)), 'All factor keys are canonical');
    assert(caseStable.generatedFrom.includes('up403-master-dataset-v1'), 'Case names its data source');
    assert(caseStable.topReasons.length >= 1, 'At least one ranked reason');
    assert(caseStable.confidenceReason.length > 0, 'Confidence reason present');
  } catch (e) {
    console.error('  FAIL: assembly threw', e);
    failed++;
  }

  // Test 2: IPI is the weighted sum of contributions, bounded 0-100
  try {
    for (const c of [caseStable, caseContested]) {
      const sum = Math.round(c.factors.reduce((s, f) => s + f.contribution, 0));
      assert(Math.abs(c.ipi - sum) <= 1, `${c.canonical_constituency_id}: IPI equals sum of contributions (${c.ipi} vs ${sum})`);
      assert(c.ipi >= 0 && c.ipi <= 100, 'IPI within 0-100');
      for (const f of c.factors) {
        assert(f.value >= 0 && f.value <= 100, `${f.key} value in 0-100`);
        assert(f.weight > 0 && f.weight <= 1, `${f.key} weight in (0,1]`);
        assert(f.confidence.length > 0, `${f.key} carries confidence`);
        assert(f.evidence.length > 0, `${f.key} carries named evidence`);
        assert(f.limitation.length > 0, `${f.key} carries a limitation`);
      }
    }
  } catch (e) {
    console.error('  FAIL: weighted sum threw', e);
    failed++;
  }

  // Test 3: No duplicated engine logic — structural factor IS the shipped investigation_priority score
  try {
    const intelStable = toConstituencyIntelligence(stable);
    const structuralStable = caseStable.factors.find((f) => f.key === 'structural_priority');
    assert(structuralStable?.value === intelStable.scores.investigation_priority.value, 'Structural factor reuses investigation_priority score (no re-implementation)');
    const intelContested = toConstituencyIntelligence(contested);
    const structuralContested = caseContested.factors.find((f) => f.key === 'structural_priority');
    assert(structuralContested?.value === intelContested.scores.investigation_priority.value, 'Structural factor equals scoring for contested seat too');
  } catch (e) {
    console.error('  FAIL: reuse check threw', e);
    failed++;
  }

  // Test 4: Contested/volatile seat ranks above stable stronghold
  try {
    assert(caseContested.ipi > caseStable.ipi, `Contested seat IPI > stable seat IPI (${caseContested.ipi} > ${caseStable.ipi})`);
    const verificationStable = caseStable.factors.find((f) => f.key === 'verification_pressure');
    const verificationContested = caseContested.factors.find((f) => f.key === 'verification_pressure');
    assert((verificationContested?.value ?? 0) >= 30, 'Verification pressure fires on LS2024 conflict / turnover');
    assert((verificationContested?.value ?? 0) > (verificationStable?.value ?? 0), 'Verification pressure higher for conflicted seat');
  } catch (e) {
    console.error('  FAIL: ranking threw', e);
    failed++;
  }

  // Test 5: Scenario exposure is a multiple of 20 and matches recomputed flips
  try {
    const prediction = predictRecord(contested);
    const flips = computeFlips(prediction);
    const scenarioFactor = caseContested.factors.find((f) => f.key === 'scenario_exposure');
    const expected = Math.round((flips.length / 5) * 100);
    assert((scenarioFactor?.value ?? -1) === expected, `Scenario factor matches flip count (${String(scenarioFactor?.value)} vs ${expected})`);
    assert((scenarioFactor?.value ?? -1) % 20 === 0, 'Scenario factor is a multiple of 20');
  } catch (e) {
    console.error('  FAIL: scenario check threw', e);
    failed++;
  }

  // Test 6: Honest limitations — gaps surfaced, never leaked, no null/undefined strings
  try {
    for (const c of [caseStable, caseContested]) {
      assert(c.limitations.length >= 3, 'Limitations include global + per-seat honesty statements');
      assert(c.limitations.some((l) => l.toLowerCase().includes('population')), 'Population unavailability disclosed');
      const allText = [
        ...c.limitations,
        ...c.topReasons.map((r) => r.why),
        ...c.recommendations.map((r) => r.action),
        c.confidenceReason,
        ...c.factors.flatMap((f) => [...f.evidence, f.limitation]),
      ];
      for (const t of allText) {
        assert(noLeak(t), 'No null/undefined leakage in any generated string');
      }
    }
  } catch (e) {
    console.error('  FAIL: honesty check threw', e);
    failed++;
  }

  // Test 7: Ranking is deterministic and descending
  try {
    const ranked = rankInvestigationPipeline([stable, contested]);
    assert(ranked.length === 2, 'Pipeline ranks all given seats');
    assert(ranked[0].ipi >= ranked[1].ipi, 'Pipeline sorts descending by IPI');
    assert(ranked[0].canonical_constituency_id === 'UP-AC-002', 'Contested seat leads the pipeline');
    const rankedAgain = rankInvestigationPipeline([stable, contested]);
    assert(rankedAgain[0].canonical_constituency_id === ranked[0].canonical_constituency_id, 'Ranking is deterministic (stable order)');
  } catch (e) {
    console.error('  FAIL: ranking threw', e);
    failed++;
  }

  // Test 8: Aggregates stay consistent
  try {
    const byRegion = pipelineByRegion([caseStable, caseContested]);
    assert(byRegion['Test Region'] === 2, 'Region spread counts seats');
    const aggregates = factorAggregatesFor([caseStable, caseContested]);
    assert(aggregates.length === 5, 'Aggregates cover all factors');
    assert(aggregates.every((a) => a.avg >= a.min && a.avg <= a.max), 'Average within min-max range');
  } catch (e) {
    console.error('  FAIL: aggregates threw', e);
    failed++;
  }

  // Test 9: Recommendations reference canonical factor keys and only fire on meaningful contribution
  try {
    for (const c of [caseStable, caseContested]) {
      for (const r of c.recommendations) {
        assert(EDITORIAL_FACTORS.includes(r.factor), 'Recommendation names a canonical factor');
        const f = c.factors.find((x) => x.key === r.factor);
        assert(f !== undefined && f.contribution >= 8, 'Recommendation only fires on a meaningful factor');
      }
    }
  } catch (e) {
    console.error('  FAIL: recommendations threw', e);
    failed++;
  }

  // Test 10: Prediction instability reflects contest nature
  try {
    const instabilityStable = caseStable.factors.find((f) => f.key === 'prediction_instability');
    const instabilityContested = caseContested.factors.find((f) => f.key === 'prediction_instability');
    assert((instabilityContested?.value ?? 0) > (instabilityStable?.value ?? 0), 'Instability factor higher for a close race');
  } catch (e) {
    console.error('  FAIL: instability check threw', e);
    failed++;
  }

  // Test 11: Evidence debt factor is inverted coverage from the evidence graph
  try {
    const evidence = buildEvidenceGraph(stable);
    const debtFactor = caseStable.factors.find((f) => f.key === 'evidence_debt');
    assert((debtFactor?.value ?? -1) === 100 - evidence.coverage, 'Evidence debt = 100 − coverage (consumes evidence graph)');
  } catch (e) {
    console.error('  FAIL: evidence debt check threw', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Intel Editorial Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
