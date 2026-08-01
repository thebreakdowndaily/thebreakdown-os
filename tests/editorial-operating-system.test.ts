/**
 * THE BREAKDOWN OS — Editorial Operating System & Workflow Tests (Phase 6)
 *
 * Verifies workflow state machine transitions, Gold Standard Review evaluation,
 * and workflow analytics engines.
 */

import {
  canTransition,
  transitionEditorialState,
  EditorialStateRecord,
} from '../lib/editorial/workflow-state-machine';

import {
  createDefaultGoldStandardAudit,
  evaluateGoldStandardPass,
} from '../lib/editorial/gold-standard-review';

import { computeWorkflowMetrics } from '../lib/editorial/workflow-analytics';

function runEditorialOSTests() {
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

  console.log('--- RUNNING PHASE 6 EDITORIAL OPERATING SYSTEM TESTS ---');

  // Test 1: Valid State Machine Transition
  try {
    assert(canTransition('draft', 'research_complete') === true, 'Draft -> Research Complete is valid');
    assert(canTransition('research_complete', 'evidence_verified') === true, 'Research Complete -> Evidence Verified is valid');
    assert(canTransition('evidence_verified', 'gold_standard_review') === true, 'Evidence Verified -> Gold Standard Review is valid');
    assert(canTransition('gold_standard_review', 'approved') === true, 'Gold Standard Review -> Approved is valid');
  } catch (err) {
    console.error('  ✗ FAIL: Valid transition test threw exception', err);
    failed++;
  }

  // Test 2: Invalid State Machine Transition
  try {
    assert(canTransition('draft', 'published') === false, 'Direct transition from Draft -> Published blocked');
    assert(canTransition('draft', 'approved') === false, 'Direct transition from Draft -> Approved blocked');
  } catch (err) {
    console.error('  ✗ FAIL: Invalid transition test threw exception', err);
    failed++;
  }

  // Test 3: State Transition Execution & Audit Trail
  try {
    const record: EditorialStateRecord = {
      storyId: 'chapter-1-foundations',
      currentStage: 'draft',
      ownerId: 'editor_sarah',
      auditTrail: [],
      blockingIssues: [],
      updatedAt: '2026-07-26',
    };

    const res = transitionEditorialState(record, 'research_complete', 'editor_sarah', 'editor', 'Research completed for Vol I');
    assert(res.success === true, 'State transition executes successfully');
    assert(res.record.currentStage === 'research_complete', 'Current stage updated');
    assert(res.record.auditTrail.length === 1, 'Audit log recorded entry');
  } catch (err) {
    console.error('  ✗ FAIL: Transition execution test threw exception', err);
    failed++;
  }

  // Test 4: Gold Standard Review Audit Evaluation
  try {
    const audit = createDefaultGoldStandardAudit('chapter-1-foundations');
    assert(evaluateGoldStandardPass(audit) === false, 'Default audit fails until all 7 phases pass');

    // Mark all 7 phases as passed
    audit.phases.phase1ExpertReview.passed = true;
    audit.phases.phase2ReaderReview.passed = true;
    audit.phases.phase3EvidenceAudit.passed = true;
    audit.phases.phase4BiasAudit.passed = true;
    audit.phases.phase5VisualAudit.passed = true;
    audit.phases.phase6KnowledgeDensityAudit.passed = true;
    audit.phases.phase7DefensibilityAudit.passed = true;

    assert(evaluateGoldStandardPass(audit) === true, 'Audit passes when all 7 phases pass with 0 blocking issues');
  } catch (err) {
    console.error('  ✗ FAIL: Gold Standard Review evaluation threw exception', err);
    failed++;
  }

  // Test 5: Workflow Analytics Calculation
  try {
    const records: EditorialStateRecord[] = [
      { storyId: 's1', currentStage: 'draft', ownerId: 'e1', auditTrail: [], blockingIssues: [], updatedAt: '2026-07-26' },
      { storyId: 's2', currentStage: 'gold_standard_review', ownerId: 'e2', auditTrail: [], blockingIssues: [], updatedAt: '2026-07-26' },
      { storyId: 's3', currentStage: 'gold_standard_review', ownerId: 'e3', auditTrail: [], blockingIssues: [], updatedAt: '2026-07-26' },
    ];
    const metrics = computeWorkflowMetrics(records);
    assert(metrics.totalStoriesTracked === 3, 'Total stories tracked computed');
    assert(metrics.bottleneckStage === 'gold_standard_review', 'Bottleneck stage identified correctly');
  } catch (err) {
    console.error('  ✗ FAIL: Workflow analytics test threw exception', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runEditorialOSTests();
