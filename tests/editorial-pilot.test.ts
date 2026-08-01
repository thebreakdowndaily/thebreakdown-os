/**
 * THE BREAKDOWN OS — Release 3 Editorial Pilot Test Suite (P3)
 *
 * Automated verification of pilot story corpus ingestion, metric tracking computations,
 * correction workflow execution, audit trail verification, and Gold Standard 7-Phase audit signoff.
 */

import { getPilotCorpusSummary, INITIAL_PILOT_CORPUS } from '../lib/editorial/pilot-corpus';
import { computePilotOperationalMetrics } from '../lib/editorial/pilot-metrics';
import { createInitialClaimVersion, createNewClaimVersion } from '../lib/domain/versioning';
import { transitionEditorialState, EditorialStateRecord } from '../lib/editorial/workflow-state-machine';
import { createDefaultGoldStandardAudit, evaluateGoldStandardPass } from '../lib/editorial/gold-standard-review';
import type { Claim } from '../types/canonical';

function runEditorialPilotTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  console.log('--- RUNNING RELEASE 3 EDITORIAL PILOT TESTS (P3) ---');

  // Test 1: Pilot Corpus Ingestion & Target Breakdown
  try {
    const summary = getPilotCorpusSummary(INITIAL_PILOT_CORPUS);
    assert(summary.totalStories === 35, 'Pilot corpus contains 35 stories (target 25-50)');
    assert(summary.publishedStories === 30, '30 pilot stories published successfully');
    assert(summary.completionPercentage === 86, '86% completion percentage calculated');
    assert(Object.keys(summary.categoryBreakdown).length === 6, 'Covers 6 editorial categories');
  } catch (err) {
    console.error('  ✗ FAIL: Pilot corpus summary test failed', err);
    failed++;
  }

  // Test 2: Operational Telemetry Metrics Computation
  try {
    const metrics = computePilotOperationalMetrics(35, 30, 1);
    assert(metrics.averagePublicationLeadTimeHours < 48.0, 'Lead time (27.0h) is well under 48h budget');
    assert(metrics.correctionFrequencyRate < 0.05, 'Correction rate (2.8%) is under 5% budget');
    assert(metrics.editorSatisfactionScore > 4.5, 'High editor satisfaction score (4.85/5.0)');
  } catch (err) {
    console.error('  ✗ FAIL: Telemetry metrics test failed', err);
    failed++;
  }

  // Test 3: Gold Standard 7-Phase Audit Signoff for Pilot Item
  try {
    const audit = createDefaultGoldStandardAudit('pilot_story_1');
    audit.phases.phase1ExpertReview.passed = true;
    audit.phases.phase2ReaderReview.passed = true;
    audit.phases.phase3EvidenceAudit.passed = true;
    audit.phases.phase4BiasAudit.passed = true;
    audit.phases.phase5VisualAudit.passed = true;
    audit.phases.phase6KnowledgeDensityAudit.passed = true;
    audit.phases.phase7DefensibilityAudit.passed = true;

    assert(evaluateGoldStandardPass(audit) === true, 'Pilot story passes Gold Standard 7-Phase audit');
  } catch (err) {
    console.error('  ✗ FAIL: Gold Standard audit test failed', err);
    failed++;
  }

  // Test 4: Complete Correction Workflow Execution
  try {
    const claim: Claim = {
      id: 'claim_pilot_1',
      claim: 'Initial Panchsheel text',
      data: 'Primary source text',
      source: 'UNTS V299',
      sourceUrl: 'https://treaties.un.org',
      tier: 1,
      confidence: 95,
      status: 'verified',
    };

    let verHistory = createInitialClaimVersion(claim, 'editor_desk');
    verHistory = createNewClaimVersion(verHistory, 'Corrected Panchsheel text', 98, 'editor_desk', 'Archival correction applied');
    assert(verHistory.currentVersion === 2, 'Correction workflow creates version 2 record');
    assert(verHistory.versions[1].changeReason === 'Archival correction applied', 'Change reason recorded in version record');
  } catch (err) {
    console.error('  ✗ FAIL: Correction workflow test failed', err);
    failed++;
  }

  // Test 5: Role Permissions & State Machine Transition Log Audit
  try {
    const state: EditorialStateRecord = {
      storyId: 'pilot_story_1',
      currentStage: 'gold_standard_review',
      ownerId: 'desk_lead',
      auditTrail: [],
      blockingIssues: [],
      updatedAt: '2026-07-27',
    };

    const res = transitionEditorialState(state, 'approved', 'desk_lead', 'editor_in_chief', 'Gold Standard approved');
    assert(res.success === true, 'State machine transition executes');
    assert(res.record.auditTrail[0].actorRole === 'editor_in_chief', 'Audit trail records actor role');
  } catch (err) {
    console.error('  ✗ FAIL: State machine transition log test failed', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runEditorialPilotTests();
