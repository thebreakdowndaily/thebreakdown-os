import { computePredictionsOverview } from '../lib/intel/predictions/overview';
import { computeScenariosOverview } from '../lib/intel/scenarios/overview';
import { computeEvidenceOverview } from '../lib/intel/evidence/overview';
import { computeEditorialOverview } from '../lib/intel/editorial/overview';
import { computeToolkitOverview } from '../lib/intel/toolkit/overview';
import { computeExecutiveBriefing, buildExecutiveBriefingFrom, EXECUTIVE_CALC_VERSION } from '../lib/intel/executive';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Mission Control)
// + docs/intelligence/mission-control-readiness.md (Phase III deliverable 5)
// + Phase IV sprint brief (Executive Intelligence Surface)
// Tests the Executive Intelligence Service — the ONLY service Mission Control consumes.
// The service aggregates certified engine overviews; it must not re-implement any engine.

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

  // Build a briefing from real certified engine overviews via the pure reshaper.
  const predictions = await computePredictionsOverview(403);
  const scenarios = await computeScenariosOverview();
  const evidence = await computeEvidenceOverview(403);
  const editorial = await computeEditorialOverview(403);
  const toolkit = await computeToolkitOverview();

  const briefing = buildExecutiveBriefingFrom({ predictions, scenarios, evidence, editorial, toolkit });

  // Test 1: The briefing is complete — every surface section is present and shaped.
  try {
    assert(briefing.metrics.length === 7, 'Exactly seven executive metrics');
    assert(briefing.trustIndex.components.length === 6, 'Trust index carries six components');
    assert(briefing.watchlist.length > 0 && briefing.watchlist.length <= 8, 'Watchlist populated within cap of 8');
    assert(briefing.alerts.length > 0 && briefing.alerts.length <= 10, 'Alerts populated within cap of 10');
    assert(briefing.verification.items.length <= 10, 'Verification queue within cap of 10');
    assert(briefing.scenarioMonitor.items.length > 0, 'Scenario monitor populated');
    assert(briefing.evidenceHealth.categoryCoverage.length > 0, 'Evidence health categories present');
    assert(briefing.researchWatch.findings.length > 0, 'Research findings present');
    assert(briefing.newsroom.briefsAvailable === toolkit.total, 'Newsroom briefs count matches Toolkit engine');
  } catch (e) {
    console.error('  FAIL: completeness threw', e);
    failed++;
  }

  // Test 2: Every metric is bounded, labeled, versioned, and explains itself.
  try {
    const keys = briefing.metrics.map((m) => m.key);
    const unique = new Set(keys);
    assert(unique.size === 7, 'Metric keys are unique');
    for (const m of briefing.metrics) {
      assert(m.value >= 0 && m.value <= 100, `${m.key} value within 0-100 (${m.value})`);
      assert(m.calculationVersion === EXECUTIVE_CALC_VERSION, `${m.key} carries calculation version`);
      assert(m.source.length > 0, `${m.key} names its source engine`);
      assert(m.primaryDriver.length > 0, `${m.key} names a primary driver`);
      assert(m.evidenceSummary.length > 0, `${m.key} carries evidence`);
      assert(m.limitations.length > 0, `${m.key} carries limitations`);
      assert(m.trend.direction === 'na', `${m.key} reports trend honestly as na (no temporal history)`);
    }
  } catch (e) {
    console.error('  FAIL: metrics threw', e);
    failed++;
  }

  // Test 3: Trust index value equals the sum of contributions (no hidden math).
  try {
    const sum = briefing.trustIndex.components.reduce((s, c) => s + c.contribution, 0);
    assert(Math.abs(briefing.trustIndex.value - sum) <= 1, `Trust value equals sum of contributions (${briefing.trustIndex.value} vs ${sum})`);
    for (const c of briefing.trustIndex.components) {
      assert(c.value >= 0 && c.value <= 100, `${c.key} value within 0-100`);
      assert(c.source.length > 0, `${c.key} names its source`);
    }
  } catch (e) {
    console.error('  FAIL: trust threw', e);
    failed++;
  }

  // Test 4: Watchlist entries are ranked by IPI descending and each carries an action + next step.
  try {
    for (let i = 0; i < briefing.watchlist.length - 1; i++) {
      assert(briefing.watchlist[i].ipi >= briefing.watchlist[i + 1].ipi, `Watchlist sorted descending by IPI (rank ${i + 1})`);
    }
    for (const w of briefing.watchlist) {
      assert(w.reason.length > 0, `${w.constituency_name}: reason present`);
      assert(w.requiredAction.length > 0, `${w.constituency_name}: action present`);
      assert(w.suggestedNextStep.length > 0, `${w.constituency_name}: next step present`);
      assert(w.factorContributions.length === 5, `${w.constituency_name}: five factor contributions`);
      assert(w.ipi >= 0 && w.ipi <= 100, `${w.constituency_name}: IPI within bounds`);
    }
  } catch (e) {
    console.error('  FAIL: watchlist threw', e);
    failed++;
  }

  // Test 5: Alerts are actionable, severity-sorted, and honestly cross-sectional.
  try {
    const order = { critical: 3, high: 2, medium: 1, info: 0 };
    for (let i = 0; i < briefing.alerts.length - 1; i++) {
      const a = briefing.alerts[i];
      const b = briefing.alerts[i + 1];
      assert(order[a.severity] >= order[b.severity], `Alerts sorted by severity (${a.severity} before ${b.severity})`);
    }
    for (const a of briefing.alerts) {
      assert(a.title.length > 0, 'Alert has a title');
      assert(a.detail.length > 0, 'Alert has detail');
      assert(a.action.length > 0, 'Alert recommends an action');
      assert(a.basis.length > 0, 'Alert states its basis');
      assert(a.source.length > 0, 'Alert names its source');
      assert(!a.detail.includes('Δ') && !a.detail.toLowerCase().includes('changed by'), 'No fabricated temporal delta in alerts');
    }
  } catch (e) {
    console.error('  FAIL: alerts threw', e);
    failed++;
  }

  // Test 6: Verification queue kinds are canonical and counts match item list.
  try {
    const kinds = new Set(briefing.verification.items.map((i) => i.kind));
    for (const k of kinds) {
      assert(['claim', 'missing_evidence', 'weak_evidence', 'conflicting_evidence'].includes(k), `Verification kind ${k} is canonical`);
    }
    const counted = briefing.verification.counts;
    const total = Object.values(counted).reduce((s, n) => s + n, 0);
    assert(total === briefing.verification.items.length, `Counts match item list (${total} vs ${briefing.verification.items.length})`);
    assert(briefing.verification.requiredDocuments.length > 0, 'Required documents listed');
  } catch (e) {
    console.error('  FAIL: verification threw', e);
    failed++;
  }

  // Test 7: Scenario monitor only shows meaningful flips and stays consistent.
  try {
    for (const s of briefing.scenarioMonitor.items) {
      assert(s.flipCount >= 3, `${s.label}: flip count meets meaningful threshold`);
      assert(s.totalSeats > 0, `${s.label}: seats modelled`);
      assert(s.seatShareTop.length > 0, `${s.label}: seat-share top parties present`);
      assert(s.majority > 0, `${s.label}: majority threshold present`);
    }
    const sumFlips = briefing.scenarioMonitor.items.reduce((s, i) => s + i.flipCount, 0);
    assert(sumFlips === briefing.scenarioMonitor.totalFlips, 'totalFlips is the sum of scenario flips');
  } catch (e) {
    console.error('  FAIL: scenarios threw', e);
    failed++;
  }

  // Test 8: Evidence health is honest — coverage and research completeness within bounds.
  try {
    assert(briefing.evidenceHealth.avgCoverage >= 0 && briefing.evidenceHealth.avgCoverage <= 100, 'Avg coverage within 0-100');
    assert(briefing.evidenceHealth.researchCompleteness >= 0 && briefing.evidenceHealth.researchCompleteness <= 100, 'Research completeness within 0-100');
    assert(briefing.evidenceHealth.totalDebt >= 0, 'Evidence debt non-negative');
    assert(briefing.evidenceHealth.limitations.length > 0, 'Evidence health states limitations');
  } catch (e) {
    console.error('  FAIL: evidence health threw', e);
    failed++;
  }

  // Test 9: Newsroom productivity is read-only — no persistence, all numbers derived.
  try {
    assert(briefing.newsroom.persistence === 'none', 'No persistence in newsroom productivity');
    assert(briefing.newsroom.openInvestigations >= 0, 'Open investigations count derived');
    assert(briefing.newsroom.pendingVerification >= 0, 'Pending verification count derived');
    assert(briefing.newsroom.editorialReadiness.length === 5, 'Readiness covers the five editorial factors');
  } catch (e) {
    console.error('  FAIL: newsroom threw', e);
    failed++;
  }

  // Test 10: No engine re-implementation — key numbers match the certified engine overviews.
  try {
    const metrics = briefing.metrics;
    const investigation = metrics.find((m) => m.key === 'investigation_priority');
    const editorialAvg = editorial.ranked.reduce((s, c) => s + c.ipi, 0) / editorial.ranked.length;
    assert(Math.abs((investigation?.value ?? 0) - Math.round(editorialAvg)) <= 1, 'Investigation priority metric matches Editorial engine average');
    const evidenceMetric = metrics.find((m) => m.key === 'evidence_coverage');
    assert((evidenceMetric?.value ?? 0) === Math.round(evidence.aggregate.avgCoverage), 'Evidence coverage metric matches Evidence engine aggregate');
    assert(briefing.dataSource === editorial.dataSource, 'Briefing data source matches engines');
    assert(briefing.researchCutoff === editorial.researchCutoff, 'Briefing research cutoff matches engines');
  } catch (e) {
    console.error('  FAIL: no re-implementation threw', e);
    failed++;
  }

  // Test 11: The integration path (computeExecutiveBriefing) produces a briefing too.
  try {
    const integrated = await computeExecutiveBriefing();
    assert(integrated.metrics.length === 7, 'Integrated briefing has seven metrics');
    assert(integrated.trustIndex.value === briefing.trustIndex.value, 'Integrated trust index matches pure reshaper');
    assert(integrated.watchlist.length === briefing.watchlist.length, 'Integrated watchlist matches pure reshaper');
  } catch (e) {
    console.error('  FAIL: integration threw', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Intel Executive Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
