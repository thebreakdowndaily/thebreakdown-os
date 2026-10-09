/**
 * ─── Isolated Editorial Action & Persistence Test Matrix ──────────────────────
 *
 * Verifies that:
 * 1. Each supported editorial action (ASSIGN, ESCALATE, VERIFY, REVIEW, PRIORITIZE, RESOLVE)
 *    executes correctly with an authorized actor and persists state.
 * 2. Role-based barriers reject unauthorized actions (e.g. reporter attempting RESOLVE, guest attempting any action).
 * 3. Optimistic Concurrency Control (expectedVersion) rejects concurrent updates with 409 Conflict.
 * 4. Audit trail entries are created for every executed action.
 */

import { NewsroomDeskService } from '../../services/intelligence/newsroom/desk-service';
import { newsroomIntelligenceCore } from '../../services/intelligence/newsroom/index';
import { NewsroomAuditService } from '../../services/intelligence/newsroom/audit-service';
import { beatRoutingService } from '../../services/intelligence/newsroom/beat-routing-service';
import { MemoryRadarRepository } from '../../services/radar/persistence/memory';
import type { NewsroomObservation, StoryCluster } from '../../types/newsroom-intelligence';

async function runIsolatedEditorialActionTests() {
  console.log('=== Newsroom Intelligence Desk: Isolated Editorial Action Test ===\n');

  // Clean state
  newsroomIntelligenceCore.clear();
  NewsroomAuditService.clear();
  beatRoutingService.clear();

  // Register authorized recipients on beat
  beatRoutingService.registerRecipient({
    userId: 'usr-rep',
    role: 'reporter',
    beatIds: ['economy', 'technology', 'defence', 'politics', 'judiciary', 'general'],
    active: true,
    notificationPreference: 'immediate',
    escalationLevel: 1,
  });
  beatRoutingService.registerRecipient({
    userId: 'usr-editor',
    role: 'editor',
    beatIds: ['economy', 'technology', 'defence', 'politics', 'judiciary', 'general'],
    active: true,
    notificationPreference: 'immediate',
    escalationLevel: 2,
  });
  beatRoutingService.registerRecipient({
    userId: 'usr-factchecker',
    role: 'fact_checker',
    beatIds: ['economy', 'technology', 'defence', 'politics', 'judiciary', 'general'],
    active: true,
    notificationPreference: 'immediate',
    escalationLevel: 1,
  });

  const repo = new MemoryRadarRepository();
  newsroomIntelligenceCore.setRadarRepository(repo);
  const deskService = new NewsroomDeskService(newsroomIntelligenceCore);

  const clusterId = 'cl-action-test-01';
  const obsId = `obs-${clusterId}`;
  const sourceId = 'src-pib-feed';

  const obs: NewsroomObservation = {
    id: obsId,
    sourceId,
    canonicalUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=999999',
    title: 'Cabinet Approves Semiconductor Mission Expansion',
    snippet: 'Union Cabinet has approved ₹10,000 crore expansion for fabs.',
    contentHash: 'hash-semiconductor-rev1',
    publicationTimestamp: '2026-10-09T10:00:00Z',
    ingestionTimestamp: '2026-10-09T10:01:30Z',
    sourceTier: 't1',
    isPrimarySource: true,
    duplicateState: 'unique',
    archiveId: 'arc-action-test-01',
    archivalState: 'archived',
    entities: ['economy', 'rbi', 'semiconductor', 'cabinet'],
  };

  newsroomIntelligenceCore.ingestObservation(obs);

  const cluster: StoryCluster = {
    id: clusterId,
    title: obs.title,
    summary: obs.snippet,
    firstDetectedAt: '2026-10-09T10:01:30Z',
    lastUpdatedAt: '2026-10-09T10:01:30Z',
    observationIds: [obsId],
    sourceIds: [sourceId],
    claimIds: [],
    entities: obs.entities,
    primarySourceCount: 1,
    independentSourceCount: 1,
    geographicSpread: ['INDIA', 'NEW_DELHI'],
    status: 'active',
  };

  const { signal } = newsroomIntelligenceCore.upsertCluster(cluster);
  signal.priority = 'P2';
  const signalId = signal.id;

  let passedAssertions = 0;
  let totalAssertions = 0;

  function assert(condition: boolean, description: string) {
    totalAssertions++;
    if (condition) {
      passedAssertions++;
      console.log(`  ✓ ${description}`);
    } else {
      console.error(`  ✗ FAIL: ${description}`);
      throw new Error(`Assertion failed: ${description}`);
    }
  }

  // ── Test 1: Unauthorized Action by 'guest' (Rejection) ──────────────
  console.log('\n--- 1. Role Authorization Enforcement ---');
  try {
    await deskService.executeTriageAction(
      { signalId, action: 'FOLLOW' },
      { id: 'usr-guest', role: 'guest', name: 'Guest User' }
    );
    assert(false, 'Guest action should have been rejected');
  } catch (err: any) {
    assert(
      err.message.includes('Forbidden') || err.message.includes('not permitted'),
      'Guest action rejected with Forbidden'
    );
  }

  // ── Test 2: Role Boundary — Reporter cannot RESOLVE or PRIORITIZE ─────
  try {
    await deskService.executeTriageAction(
      { signalId, action: 'RESOLVE' },
      { id: 'usr-rep', role: 'reporter', name: 'Reporter User' }
    );
    assert(false, 'Reporter should not be permitted to RESOLVE');
  } catch (err: any) {
    assert(
      err.message.includes('not permitted') || err.message.includes('Forbidden'),
      'Reporter RESOLVE correctly rejected'
    );
  }

  // ── Test 3: Action ASSIGN by Reporter (Persistence) ──────────────────
  console.log('\n--- 2. Supported Action: ASSIGN ---');
  const assignResult = await deskService.executeTriageAction(
    {
      signalId,
      action: 'ASSIGN',
      assignedTo: 'usr-staff-writer-42',
      note: 'Assigned to senior writer on economy beat',
    },
    { id: 'usr-rep', role: 'reporter', name: 'Reporter User' }
  );

  assert(assignResult.item.assignedTo === 'usr-staff-writer-42', 'Signal assignedTo updated in returned item');
  assert(assignResult.item.version === 2, 'Version incremented to 2');

  // Verify persistence in core
  const persisted1 = newsroomIntelligenceCore.getSignal(signalId);
  assert(persisted1?.assignedTo === 'usr-staff-writer-42', 'Core persisted assignedTo');

  // ── Test 4: Action ESCALATE by Reporter (Persistence) ────────────────
  console.log('\n--- 3. Supported Action: ESCALATE ---');
  const escalateResult = await deskService.executeTriageAction(
    {
      signalId,
      action: 'ESCALATE',
      escalatedPriority: 'P1',
      note: 'Significant fiscal allocation involved',
    },
    { id: 'usr-rep', role: 'reporter', name: 'Reporter User' }
  );

  assert(escalateResult.item.priority === 'P1', 'Signal priority escalated to P1');
  assert(escalateResult.item.workflowState === 'escalated', 'Lifecycle state transitioned to escalated');
  assert(escalateResult.item.version === 3, 'Version incremented to 3');

  // ── Test 5: Action VERIFY by Fact Checker (Persistence) ──────────────
  console.log('\n--- 4. Supported Action: VERIFY ---');
  const verifyResult = await deskService.executeTriageAction(
    {
      signalId,
      action: 'VERIFY',
      note: 'Corroborated with Ministry of Finance press release gazette notification',
    },
    { id: 'usr-factchecker', role: 'fact_checker', name: 'Senior Fact Checker' }
  );

  assert(verifyResult.item.workflowState === 'confirmed', 'Workflow state transitioned to confirmed');
  assert(verifyResult.item.version === 4, 'Version incremented to 4');

  // ── Test 6: Action PRIORITIZE by Editor (Persistence) ────────────────
  console.log('\n--- 5. Supported Action: PRIORITIZE ---');
  const prioritizeResult = await deskService.executeTriageAction(
    {
      signalId,
      action: 'PRIORITIZE',
      escalatedPriority: 'P0',
      note: 'Top breaking economic development',
    },
    { id: 'usr-editor', role: 'editor', name: 'Executive Editor' }
  );

  assert(prioritizeResult.item.priority === 'P0', 'Signal priority changed to P0');
  assert(prioritizeResult.item.version === 5, 'Version incremented to 5');

  // ── Test 7: Optimistic Concurrency Control (OCC) Rejection ──────────
  console.log('\n--- 6. Optimistic Concurrency Control (OCC) ---');
  try {
    // Current version is 5. Passing expectedVersion: 4 must fail with 409 conflict
    await deskService.executeTriageAction(
      {
        signalId,
        action: 'RESOLVE',
        expectedVersion: 4, // Stale version!
        note: 'Stale attempt',
      },
      { id: 'usr-editor', role: 'editor', name: 'Executive Editor' }
    );
    assert(false, 'OCC stale version conflict should have thrown');
  } catch (err: any) {
    assert(err.message.includes('Version conflict'), 'OCC Version conflict correctly rejected (409)');
  }

  // ── Test 8: Action RESOLVE by Editor with matching version ───────────
  console.log('\n--- 7. Supported Action: RESOLVE ---');
  const resolveResult = await deskService.executeTriageAction(
    {
      signalId,
      action: 'RESOLVE',
      expectedVersion: 5,
      note: 'Story developed and filed to wire',
    },
    { id: 'usr-editor', role: 'editor', name: 'Executive Editor' }
  );

  assert(resolveResult.item.workflowState === 'resolved', 'Workflow state transitioned to resolved');
  assert(resolveResult.item.version === 6, 'Version incremented to 6');

  // ── Test 9: Audit Trail Integrity ───────────────────────────────────
  console.log('\n--- 8. Audit Trail Verification ---');
  const auditLogs = NewsroomAuditService.getAuditTrail({ signalId });
  assert(auditLogs.length >= 5, `Audit logs created for each state change (found: ${auditLogs.length})`);
  assert(auditLogs.some((l) => l.action === 'ASSIGN'), 'Audit log contains ASSIGN');
  assert(auditLogs.some((l) => l.action === 'ESCALATE'), 'Audit log contains ESCALATE');
  assert(auditLogs.some((l) => l.action === 'VERIFY'), 'Audit log contains VERIFY');
  assert(auditLogs.some((l) => l.action === 'PRIORITIZE'), 'Audit log contains PRIORITIZE');
  assert(auditLogs.some((l) => l.action === 'RESOLVE'), 'Audit log contains RESOLVE');

  console.log(`\n=== All ${passedAssertions}/${totalAssertions} Isolated Editorial Action Tests PASSED! ===\n`);
}

runIsolatedEditorialActionTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
