import type { ConstituencyRecord } from '../lib/up403/types';
import { buildConstituencyToolkit, buildInterviewBriefs, interviewQuestionCount, buildStoryAngles, buildVerificationWorkspace, buildFieldPack, buildExplorer, buildResearchSummary, buildScenarios, toConstituencyEntry } from '../lib/intel/toolkit';
import { toReporterBriefMarkdown, toToolkitJson } from '../lib/intel/toolkit/export';
import type { ConstituencyToolkit } from '../lib/intel/toolkit/types';
import { predictRecord } from '../lib/intel/predictions';
import { SCENARIOS } from '../lib/intel/scenarios/definitions';

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

  const rec = makeRecord({});
  const toolkit: ConstituencyToolkit = buildConstituencyToolkit(rec);

  // Test 1: Toolkit assembles every section from the engines
  try {
    assert(toolkit.canonical_constituency_id === 'UP-AC-000', 'Toolkit carries constituency id');
    assert(toolkit.dataSource.includes('up403-master-dataset-v1'), 'Toolkit names its data source');
    assert(toolkit.researchCutoff === '2026-07-30', 'Toolkit carries research cutoff');
    assert(toolkit.brief.overview.length > 0, 'Brief overview present');
    assert(toolkit.brief.sourcesUsed.length > 0, 'Brief lists provenance sources');
  } catch (e) {
    console.error('  FAIL: assembly threw', e);
    failed++;
  }

  // Test 2: No hallucinated development facts — gaps surfaced honestly
  try {
    const gapPhrase = 'not available at constituency level';
    assert(toolkit.evidence.gaps.length > 0, 'Registered gaps exist for missing indicators');
    assert(toolkit.brief.dataGaps.length > 0, 'Brief names registered data gaps');
    assert(toolkit.fieldPack.travelNotes.length > 0, 'Field pack has travel note');
    assert(toolkit.fieldPack.travelNotes[0].toLowerCase().includes('not available') || toolkit.fieldPack.unknowns.length > 0, 'Missing geography flagged, not invented');
    for (const note of toolkit.fieldPack.travelNotes) {
      assert(!note.includes('null') && !note.includes('undefined'), 'Travel notes never leak null/undefined');
    }
  } catch (e) {
    console.error('  FAIL: honesty check threw', e);
    failed++;
  }

  // Test 3: Interviews derived from evidence with no invented controversies
  try {
    assert(toolkit.interviews.length === 12, '12 personas interviewed');
    const total = interviewQuestionCount(toolkit.interviews);
    assert(total >= 30, `Interview question bank substantial (${total})`);
    for (const brief of toolkit.interviews) {
      assert(brief.questions.length >= 2, `${brief.personaLabel} has >=2 questions`);
      for (const q of brief.questions) {
        assert(q.signal.length > 0, 'Question carries signal');
        assert(q.basis.startsWith('Evidence:') || q.basis.startsWith('Prediction engine:') || q.basis.startsWith('Scoring engine:'), 'Question cites engine/evidence basis');
      }
    }
  } catch (e) {
    console.error('  FAIL: interviews threw', e);
    failed++;
  }

  // Test 4: Checklist reflects real completeness state
  try {
    assert(toolkit.checklist.length === 10, '10 checklist items');
    const historical = toolkit.checklist.find((c) => c.id === 'historical');
    assert(historical !== undefined, 'Historical item present');
    assert(historical?.status === 'done', 'Historical item done when election data present');
    const devGap = toolkit.checklist.find((c) => c.id === 'dev-indicators');
    assert(devGap !== undefined, 'Dev-indicator gap item present');
    assert(devGap?.status === 'warning', 'Missing development indicators flagged as warning');
    for (const item of toolkit.checklist) {
      assert(['done', 'warning', 'todo'].includes(item.status), `Valid status for ${item.id}`);
    }
  } catch (e) {
    console.error('  FAIL: checklist threw', e);
    failed++;
  }

  // Test 5: Story angles grounded in available evidence
  try {
    assert(toolkit.angles.length >= 6, 'Core story angles generated');
    const devAngle = toolkit.angles.find((a) => a.id === 'development-gap');
    assert(devAngle !== undefined, 'Development-gap angle present');
    assert(devAngle?.confidence === 'HIGH', 'Development-gap angle high confidence (gap is certain)');
    for (const a of toolkit.angles) {
      assert(a.evidenceUsed.length > 0, `${a.id} cites evidence`);
      assert(a.suggestedInterviews.length > 0, `${a.id} names interviews`);
    }
  } catch (e) {
    console.error('  FAIL: angles threw', e);
    failed++;
  }

  // Test 6: Verification workspace separates claims, gaps, conflicts
  try {
    const counts = toolkit.verification.items.reduce((m: Record<string, number>, i) => {
      m[i.kind] = (m[i.kind] ?? 0) + 1;
      return m;
    }, {});
    assert((counts['claim'] ?? 0) >= 1, 'Verification claims present');
    assert((counts['missing_evidence'] ?? 0) >= 1, 'Missing-evidence items present');
    assert(toolkit.verification.recommendedDocuments.length > 0, 'Recommended documents present');
    assert(toolkit.verification.groundReporting.length > 0, 'Ground reporting checklist present');
    assert(toolkit.verification.officialDatasets.length > 0, 'Official datasets to verify present');
  } catch (e) {
    console.error('  FAIL: verification threw', e);
    failed++;
  }

  // Test 7: Explorer renders the prediction chain with evidence nodes
  try {
    assert(toolkit.explorer.stage === 'root', 'Explorer root present');
    assert(toolkit.explorer.children.length >= 1, 'Explorer has prediction child');
    assert(toolkit.explorer.children[0].label.includes(toolkit.prediction.predicted_winner), 'Explorer prediction node names winner');
    assert(toolkit.explorer.children[0].children.length >= 1, 'Prediction node has children (drivers/history/gaps)');
  } catch (e) {
    console.error('  FAIL: explorer threw', e);
    failed++;
  }

  // Test 8: Scenario analysis reuses engine projection per scenario
  try {
    assert(toolkit.scenarios.baselineWinner === toolkit.prediction.predicted_winner, 'Scenario baseline matches prediction');
    assert(toolkit.scenarios.flips.length === SCENARIOS.length, 'One flip record per scenario');
    for (const f of toolkit.scenarios.flips) {
      assert(typeof f.flipped === 'boolean', 'Flip boolean present');
      assert(f.winnerProbability >= 0 && f.winnerProbability <= 100, 'Scenario probability in range');
    }
  } catch (e) {
    console.error('  FAIL: scenarios threw', e);
    failed++;
  }

  // Test 9: Export serialisers produce complete, reviewable outputs
  try {
    const md = toReporterBriefMarkdown(toolkit);
    assert(md.includes('# Reporter Brief'), 'Markdown has title');
    assert(md.includes('Constituency Brief'), 'Markdown has brief section');
    assert(md.includes('Interview Briefs'), 'Markdown has interview section');
    assert(md.includes('Verification Workspace'), 'Markdown has verification section');
    assert(md.includes(toolkit.prediction.predicted_winner), 'Markdown names predicted winner');
    assert(!md.includes('undefined') && !md.includes('null)'), 'Markdown has no leaked undefined/null');

    const json = toToolkitJson(toolkit);
    const parsed = JSON.parse(json) as ConstituencyToolkit;
    assert(parsed.constituency_name === 'Test Seat', 'JSON round-trips constituency');
    assert(parsed.interviews.length === 12, 'JSON round-trips interviews');
    assert(parsed.brief.overview === toolkit.brief.overview, 'JSON round-trips brief');
  } catch (e) {
    console.error('  FAIL: export threw', e);
    failed++;
  }

  // Test 10: Overview entry helper
  try {
    const prediction = predictRecord(rec);
    const entry = toConstituencyEntry(rec, prediction.predicted_winner, prediction.winner_probability);
    assert(entry.canonical_constituency_id === 'UP-AC-000', 'Entry carries id');
    assert(entry.current_mla_party === 'BJP', 'Entry carries MLA party');
    assert(entry.predicted_winner === prediction.predicted_winner, 'Entry carries predicted winner');
  } catch (e) {
    console.error('  FAIL: entry threw', e);
    failed++;
  }

  // Test 11: LS2024 change surfaces as conflict + risk, not silently ignored
  try {
    const changed = makeRecord({
      ls2024_pc_winner_party: 'SP',
      ls2024_party_changed_flag: true,
      current_mla_party: 'BJP',
    });
    const t2 = buildConstituencyToolkit(changed);
    assert(t2.brief.knownRisks.some((r) => r.includes('2024')), 'LS2024 change listed as known risk');
    assert(t2.verification.items.some((i) => i.kind === 'conflicting_evidence' && i.title.includes('LS2024')), 'LS2024 change flagged as conflicting evidence');
    assert(t2.interviews.some((b) => b.persona === 'MP' && b.prepNotes.some((n) => n.includes('LS2024'))), 'MP brief prepared for the change');
  } catch (e) {
    console.error('  FAIL: ls2024 change threw', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Intel Toolkit Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
