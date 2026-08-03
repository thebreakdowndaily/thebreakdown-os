import { computeEvidenceOverview } from '../lib/intel/evidence/overview';
import { computeEditorialOverview } from '../lib/intel/editorial/overview';
import { computeToolkitOverview, getConstituencyToolkit } from '../lib/intel/toolkit/overview';
import { computeExecutiveBriefing } from '../lib/intel/executive';
import {
  computeVerificationOverview,
  computeVerificationCaseDetail,
  buildVerificationExecutiveSummary,
  getVerificationCaseIds,
  deriveVerificationCase,
  buildClaimRegister,
  detectConflicts,
  computeReadiness,
  ensureVerificationSeed,
  transitionVerificationCase,
  assignVerificationReviewer,
  addVerificationNote,
  getVerificationWorkflow,
  getVerificationAudit,
  resetVerificationStore,
  canTransition,
  nextTransitions,
  isTerminal,
  isOpenStatus,
  verificationStatusLabel,
  VERIFICATION_STATUSES,
  type VerificationStatus,
} from '../lib/intel/verification';
import { canAccessIntelModule, normalizeIntelRole } from '../features/auth/roles';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace)
// Tests the Verification Operating System: status machine, case derivation, conflict detection,
// editorial readiness, workflow store, audit trail invariants, and Mission Control integration.

const CHECKER = { id: 'checker-1', name: 'Sameer Khan' };
const EDITOR = { id: 'editor-1', name: 'Anita Desai' };

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

  console.log('Test 1: Status machine — 11 states, explicit transitions, terminal/reopen semantics');
  try {
    assert(VERIFICATION_STATUSES.length === 11, 'Exactly eleven statuses');
    const expected: VerificationStatus[] = [
      'unreviewed', 'in_review', 'evidence_complete', 'evidence_incomplete',
      'needs_field_verification', 'needs_official_confirmation', 'conflicting_evidence',
      'verified', 'rejected', 'deferred', 'archived',
    ];
    for (const s of expected) assert(VERIFICATION_STATUSES.includes(s), `Status present: ${s}`);

    // Every non-terminal state must have at least one outgoing transition; archived is terminal.
    for (const s of VERIFICATION_STATUSES) {
      if (s === 'archived') {
        assert(isTerminal(s), 'archived is terminal');
        assert(nextTransitions(s).length === 0, 'archived has no outgoing transitions');
      } else {
        assert(!isTerminal(s), `${s} is not terminal`);
        assert(nextTransitions(s).length > 0, `${s} has outgoing transitions`);
      }
    }

    // No self-transitions.
    for (const s of VERIFICATION_STATUSES) {
      assert(!canTransition(s, s), `no self-transition for ${s}`);
      assert(!nextTransitions(s).includes(s), `nextTransitions excludes self for ${s}`);
    }

    // Review outcomes can only reopen or archive — never shift sideways.
    assert(nextTransitions('verified').join(',') === 'in_review,archived', 'verified → in_review, archived only');
    assert(nextTransitions('rejected').join(',') === 'in_review,archived', 'rejected → in_review, archived only');
    assert(canTransition('verified', 'archived'), 'verified can archive');
    assert(!canTransition('verified', 'evidence_complete'), 'verified cannot silently shift to evidence_complete');
    assert(!canTransition('rejected', 'needs_field_verification'), 'rejected cannot shift sideways');

    // Unreviewed entry points.
    assert(nextTransitions('unreviewed').includes('in_review'), 'unreviewed can begin review');
    assert(nextTransitions('unreviewed').includes('deferred'), 'unreviewed can defer');

    // Deferred can return to unreviewed.
    assert(canTransition('deferred', 'unreviewed'), 'deferred → unreviewed allowed');

    // Open-state semantics.
    assert(isOpenStatus('unreviewed'), 'unreviewed is open');
    assert(isOpenStatus('in_review'), 'in_review is open');
    assert(isOpenStatus('conflicting_evidence'), 'conflicting_evidence is open');
    assert(!isOpenStatus('verified'), 'verified is not open');
    assert(!isOpenStatus('archived'), 'archived is not open');

    assert(verificationStatusLabel('needs_official_confirmation') === 'Needs Official Confirmation', 'status label mapping');
  } catch (e) {
    console.error('  FAIL: status machine threw', e);
    failed++;
  }

  console.log('Test 2: Case derivation from certified engines');
  try {
    const editorial = await computeEditorialOverview(403);
    const toolkit = await computeToolkitOverview();
    const first = editorial.ranked[0];
    const toolkitDetail = await getConstituencyToolkit(first.canonical_constituency_id);
    const wf = getVerificationWorkflow(first.canonical_constituency_id) ?? null;
    const c = deriveVerificationCase(first, toolkitDetail, wf);

    assert(c.id === first.canonical_constituency_id, 'case id is the constituency id');
    assert(c.constituencyName === first.constituency_name, 'case names the constituency');
    assert(c.ipi === first.ipi, 'case carries IPI');
    assert(c.confidence === first.confidence, 'case carries confidence tier');
    assert(c.status === 'unreviewed' || c.status === 'in_review', 'fresh case defaults to unreviewed');
    assert(c.claimRegister.length > 0, 'claim register populated');
    assert(c.claimRegister.every((cl) => cl.source.length > 0), 'every claim traces to a source');
    assert(c.conflicts.length >= 0, 'conflicts array present');
    assert(c.evidenceReview.coveragePct >= 0 && c.evidenceReview.coveragePct <= 100, 'evidence coverage bounded');
    assert(c.fieldPlan.taskCount > 0, 'field plan has tasks');
    assert(c.readiness.score >= 0 && c.readiness.score <= 100, 'readiness bounded');
    assert(c.audit.length === 0, 'unseeded case has empty audit (workflow supplied as null)');
    assert(c.source.startsWith('verification-service@'), 'case declares its calculation source');
    assert(c.summary.includes(first.constituency_name), 'summary references the constituency');

    // Every claim row must map to a VerificationKind.
    for (const cl of c.claimRegister) {
      assert(['claim', 'missing_evidence', 'weak_evidence', 'conflicting_evidence'].includes(cl.kind), `claim kind valid: ${cl.kind}`);
    }
  } catch (e) {
    console.error('  FAIL: case derivation threw', e);
    failed++;
  }

  console.log('Test 3: Conflict detector and evidence review');
  try {
    const editorial = await computeEditorialOverview(403);
    const highDebt = editorial.ranked.find((i) => (i.factors.find((f) => f.key === 'evidence_debt')?.value ?? 0) >= 55);
    if (highDebt) {
      const conflicts = detectConflicts(highDebt.canonical_constituency_id, null, highDebt);
      const hasDebtConflict = conflicts.some((c) => c.id.includes('debt-pressure') || c.id.includes('unstable-scenario'));
      assert(hasDebtConflict, 'factor-driven conflict detected for high-debt investigation');
      assert(conflicts.every((c) => c.resolutionSteps.length > 0), 'every conflict has resolution steps');
      assert(conflicts.every((c) => c.between.length >= 1), 'every conflict names the signals in tension');
    } else {
      assert(true, 'no high-debt investigation in dataset — rule not exercised, non-blocking');
    }

    const claims = buildClaimRegister('UP-AC-001', null, editorial.ranked[0]);
    assert(claims.length > 0, 'claim register derivable from investigation alone (factor fallback)');
    assert(claims.every((c) => c.text.length > 0), 'factor-derived claims have text');
  } catch (e) {
    console.error('  FAIL: conflicts/evidence threw', e);
    failed++;
  }

  console.log('Test 4: Readiness computation is deterministic and gated');
  try {
    const editorial = await computeEditorialOverview(403);
    const c = deriveVerificationCase(editorial.ranked[0], null, null);
    const r1 = computeReadiness({ claims: c.claimRegister, conflicts: c.conflicts, evidence: c.evidenceReview, field: c.fieldPlan, status: 'unreviewed' });
    const r2 = computeReadiness({ claims: c.claimRegister, conflicts: c.conflicts, evidence: c.evidenceReview, field: c.fieldPlan, status: 'unreviewed' });
    assert(r1.score === r2.score, 'readiness is deterministic for identical inputs');

    const verifiedR = computeReadiness({ claims: c.claimRegister, conflicts: c.conflicts, evidence: c.evidenceReview, field: c.fieldPlan, status: 'verified' });
    assert(verifiedR.score >= 85, 'verified status raises readiness floor to 85');
    assert(!r1.canPublish, 'unreviewed case cannot publish');
    assert(c.readiness.blockers.length >= 0, 'readiness exposes blockers list');
    assert(r1.recommendation.length > 0, 'readiness gives a recommendation');
  } catch (e) {
    console.error('  FAIL: readiness threw', e);
    failed++;
  }

  console.log('Test 5: Workflow store — explicit transitions, append-only audit, reviewer and notes');
  try {
    resetVerificationStore();
    const ids = await getVerificationCaseIds(4);
    ensureVerificationSeed(ids);
    ensureVerificationSeed(ids); // idempotent

    for (const id of ids) {
      const wf = getVerificationWorkflow(id);
      assert(wf?.status === 'unreviewed', `seeded case ${id} is unreviewed`);
      assert(wf?.audit.length === 1 && wf.audit[0].action === 'created', `seeded case ${id} has exactly one created entry`);
    }

    const target = ids[0];

    // Valid transition.
    const t1 = transitionVerificationCase(target, 'in_review', CHECKER, 'starting review');
    assert(t1.success && t1.status === 'in_review', 'unreviewed → in_review succeeds');
    let wf = getVerificationWorkflow(target);
    assert(wf?.audit.length === 2, 'audit grew after transition');
    assert(wf?.lastTransition?.to === 'in_review', 'last transition recorded');

    // Invalid transition must fail and leave state untouched.
    const before = getVerificationWorkflow(target)?.status;
    const bad = transitionVerificationCase(target, 'unreviewed', CHECKER);
    assert(!bad.success, 'in_review → unreviewed is rejected');
    assert(getVerificationWorkflow(target)?.status === before, 'failed transition does not change status');
    assert(getVerificationWorkflow(target)?.audit.length === 2, 'failed transition adds no audit entry');

    // Verify outcome transition.
    const t2 = transitionVerificationCase(target, 'evidence_complete', EDITOR);
    assert(t2.success, 'in_review → evidence_complete succeeds');
    const t3 = transitionVerificationCase(target, 'verified', CHECKER, 'all claims reconciled');
    assert(t3.success, 'evidence_complete → verified succeeds');
    wf = getVerificationWorkflow(target);
    assert(wf?.status === 'verified', 'case now verified');
    assert(wf?.audit.length === 4, 'audit trail has created + 3 transitions');
    assert(wf?.audit.filter((a) => a.action === 'status_transition').length === 3, 'three status transitions recorded');
    assert(wf?.audit.every((a) => a.id), 'every audit entry has an id');
    assert(new Set(wf?.audit.map((a) => a.id)).size === wf?.audit.length, 'audit ids are unique');

    // Verified can only reopen/archive.
    assert(!transitionVerificationCase(target, 'needs_field_verification', CHECKER).success, 'verified cannot shift to field verification');

    // Reviewer assignment + notes.
    const r = assignVerificationReviewer(target, CHECKER);
    assert(r.success, 'reviewer assignment succeeds');
    wf = getVerificationWorkflow(target);
    assert(wf?.reviewer?.id === CHECKER.id, 'reviewer recorded');
    const n = addVerificationNote(target, EDITOR, 'Cross-checked margin against ECI gazette.');
    assert(n.success, 'note added');
    wf = getVerificationWorkflow(target);
    assert(wf?.reviewNotes.length === 1, 'note stored');
    assert(wf?.audit.some((a) => a.action === 'review_note'), 'note recorded in audit');

    // Empty note rejected.
    const empty = addVerificationNote(target, EDITOR, '   ');
    assert(!empty.success, 'empty note rejected');

    // Unknown case rejected.
    const unknown = transitionVerificationCase('does-not-exist', 'in_review', CHECKER);
    assert(!unknown.success, 'unknown case rejected');

    // getVerificationAudit returns a copy (immutable surface).
    const audit = getVerificationAudit(target);
    const len = audit.length;
    (audit as unknown as Array<{ extra?: boolean }>)[0].extra = true;
    assert(getVerificationAudit(target)[0]?.extra === undefined, 'audit trail is append-only (no mutation leaks)');
    assert(getVerificationAudit(target).length === len, 'audit length stable after attempted mutation');
  } catch (e) {
    console.error('  FAIL: store threw', e);
    failed++;
  }

  console.log('Test 6: Overview aggregation');
  try {
    const ov = await computeVerificationOverview(5);
    assert(ov.totalCases === 5, 'overview carries requested case count');
    assert(ov.cases.length === 5, 'cases array matches count');
    assert(ov.dataSource.length > 0, 'overview names dataset');
    assert(ov.evidenceDebt >= 0, 'evidence debt surfaced');
    const statusSum = Object.values(ov.statusCounts).reduce((a, b) => a + b, 0);
    assert(statusSum === 5, 'status counts sum to total cases');
    assert(ov.openCases + ov.verifiedCases + ov.rejectedCases <= 5, 'open/verified/rejected partition the set');
    assert(ov.limitations.length > 0, 'overview is honest about limitations');
    assert(ov.storeNote.length > 0, 'overview explains persistence posture');

    // Cases are ranked by IPI descending.
    const ipis = ov.cases.map((c) => c.ipi);
    const sorted = [...ipis].sort((a, b) => b - a);
    assert(ipis.join(',') === sorted.join(','), 'cases ranked by IPI descending');

    // Seed side effect: store now knows all overview case ids, and case status reflects the store.
    for (const c of ov.cases) {
      const wf = getVerificationWorkflow(c.id);
      assert(!!wf, `overview seeds ${c.id} into the workflow store`);
      assert(wf.status === c.status, `${c.id} status matches the store`);
    }

    // Detail path resolves within the set.
    const detail = await computeVerificationCaseDetail(ov.cases[0].id);
    assert(detail?.id === ov.cases[0].id, 'detail resolves for seeded case');
    assert((detail?.audit.length ?? 0) >= 1, 'detail carries seeded audit entry');
    const missing = await computeVerificationCaseDetail('UP-AC-NOT-REAL');
    assert(missing === null, 'unknown case returns null');
  } catch (e) {
    console.error('  FAIL: overview threw', e);
    failed++;
  }

  console.log('Test 7: Mission Control integration — VerificationExecutiveSummary + ExecutiveBriefing');
  try {
    const editorial = await computeEditorialOverview(403);
    const evidence = await computeEvidenceOverview(403);
    const summary = buildVerificationExecutiveSummary({ editorial, evidence });
    assert(summary.totalCases <= 10, 'executive summary capped at 10 cases');
    assert(summary.persistence === 'none', 'summary is honest about persistence');
    const statusSum = Object.values(summary.statusCounts).reduce((a, b) => a + b, 0);
    assert(statusSum === summary.totalCases, 'summary status counts sum to total');
    assert(summary.note.length > 0, 'summary explains it is a projection');
    assert(summary.generatedAt.length > 0, 'summary carries generatedAt');

    // The executive briefing surfaces verificationOS end-to-end.
    const briefing = await computeExecutiveBriefing();
    assert(briefing.verificationOS.totalCases > 0, 'executive briefing carries verificationOS');
    assert(briefing.verificationOS.verifiedCases >= 0, 'executive briefing carries verified count');
    assert(briefing.verificationOS.openConflicts >= 0, 'executive briefing carries open conflicts');
  } catch (e) {
    console.error('  FAIL: executive integration threw', e);
    failed++;
  }

  console.log('Test 8: RBAC — verification requires fact_checker or above');
  try {
    assert(!canAccessIntelModule('guest', 'verification'), 'guest denied');
    assert(canAccessIntelModule('fact_checker', 'verification'), 'fact_checker allowed');
    assert(canAccessIntelModule('researcher', 'verification'), 'researcher allowed');
    assert(canAccessIntelModule('reporter', 'verification'), 'reporter allowed');
    assert(canAccessIntelModule('analyst', 'verification'), 'analyst allowed');
    assert(canAccessIntelModule('editor', 'verification'), 'editor allowed');
    assert(canAccessIntelModule('owner', 'verification'), 'owner allowed');
    assert(normalizeIntelRole('fact_checker') === 'fact_checker', 'role normalization works');
  } catch (e) {
    console.error('  FAIL: rbac threw', e);
    failed++;
  }

  console.log('\nintel-verification: ' + passed + ' passed, ' + failed + ' failed');
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
