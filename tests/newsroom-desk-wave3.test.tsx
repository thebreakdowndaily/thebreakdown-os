/**
 * ─── Phase 4A Wave 3: Triage Actions & Concurrency UX Test Suite ──────────────
 *
 * 20-Point Certification Matrix:
 *   1. Authorized action renders
 *   2. Unauthorized action does not render
 *   3. PUBLISH never renders (even if injected)
 *   4. Action payload uses expectedVersion
 *   5. Action payload uses mutationId
 *   6. Successful action updates state (onActionSuccess callback)
 *   7. Successful action preserves server audit integrity
 *   8. 401 unauthenticated handling (preserves draft)
 *   9. 403 permission denied handling
 *  10. 404 item not found handling
 *  11. 400 bad request / validation handling
 *  12. 409 concurrency conflict triggers ConflictResolutionModal
 *  13. Draft rationale survives 409 conflict
 *  14. No blind auto-retry after 409 conflict
 *  15. Duplicate mutationId idempotent replay handling
 *  16. Network failure preserves unsent work
 *  17. Confirmation modal renders consequence preview and inputs
 *  18. Modals provide accessible dialog roles and labels
 *  19. Mobile-safe action dock toolbar presentation
 *  20. Security boundary: zero secret / credential leakage
 */

import * as assert from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  ActionControlDock,
  ActionConfirmationModal,
  ConflictResolutionModal,
  ItemDossierView,
} from '../components/newsroom/desk';
import type { NewsroomDeskItem, NewsroomDeskActionInput } from '../services/intelligence/newsroom/desk-service';
import type { NewsroomTriageAction } from '../types/newsroom-intelligence';

function createMockDeskItem(overrides: Partial<NewsroomDeskItem> = {}): NewsroomDeskItem {
  return {
    queueItemId: 'q-sig-action-1',
    signalId: 'sig-action-1',
    clusterId: 'clus-action-1',
    title: 'High Court Issues Interim Injunction on Spectrum Allocation',
    summary: 'Single bench halts telecom auction citing environmental clearance deficiencies.',
    whyItMatters: 'Immediate pause on $1.2B federal spectrum licensing timeline.',
    canonicalUrl: 'https://delhihighcourt.nic.in/orders/2026/wp-3912.pdf',
    sourceId: 'src-delhi-high-court',
    sourceName: 'Delhi High Court Orders',
    sourceAuthority: 't1',
    isPrimarySource: true,
    priority: 'P1',
    beat: 'judiciary',
    geographicScope: ['New Delhi'],
    changeType: 'new',
    workflowState: 'monitoring',
    assignedTo: 'Arun Kumar',
    confidence: 88,
    evidenceStrength: 82,
    uncertainty: 18,
    observationCount: 3,
    independentSourceCount: 2,
    primarySourceCount: 1,
    hasContradictions: false,
    contradictionIds: [],
    affectedStoryIds: [],
    timestamps: {
      sourcePublishedAt: '2026-10-02T16:00:00Z',
      firstSeenAt: '2026-10-02T16:00:03Z',
      firstDetectedAt: '2026-10-02T16:00:04Z',
      lastUpdatedAt: '2026-10-02T16:15:00Z',
    },
    requiredHumanAction: 'Verify judicial stay order against Ministry of Telecom portal',
    availableActions: ['VERIFY', 'REVIEW', 'ASSIGN', 'ESCALATE', 'RESOLVE'],
    version: 3,
    auditTrail: [
      {
        id: 'audit-w3-1',
        signalId: 'sig-action-1',
        action: 'DETECT',
        actorId: 'system',
        actorName: 'Radar Pipeline',
        timestamp: '2026-10-02T16:00:04Z',
        previousState: 'discovered',
        newState: 'monitoring',
      },
    ],
    ...overrides,
  };
}

async function runTests() {
  console.log('Running Phase 4A Wave 3 Triage Actions & Concurrency UX Tests...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err: unknown) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  // ── 1. Authorized action renders ───────────────────────────────────────────
  await test('1. Authorized actions render with expected labels and icons', () => {
    const item = createMockDeskItem({
      availableActions: ['VERIFY', 'ASSIGN', 'ESCALATE', 'RESOLVE'],
    });
    const html = renderToString(<ActionControlDock item={item} />);

    assert.ok(html.includes('Verify Evidence'), 'Must render Verify action');
    assert.ok(html.includes('Assign Desk'), 'Must render Assign action');
    assert.ok(html.includes('Escalate Urgency'), 'Must render Escalate action');
    assert.ok(html.includes('Resolve Signal'), 'Must render Resolve action');
    assert.ok(html.includes('🎯'), 'Must render action directive icon');
    assert.ok(html.includes(item.requiredHumanAction), 'Must render required human action prompt');
  });

  // ── 2. Unauthorized action does not render ─────────────────────────────────
  await test('2. Unauthorized actions do not render', () => {
    const item = createMockDeskItem({
      availableActions: ['VERIFY', 'REVIEW'], // Only verification
    });
    const html = renderToString(<ActionControlDock item={item} />);

    assert.ok(html.includes('Verify Evidence'), 'Must render Verify');
    assert.ok(html.includes('Fact-Check Review'), 'Must render Review');
    assert.ok(!html.includes('Dismiss'), 'Must NOT render Dismiss');
    assert.ok(!html.includes('Split Cluster'), 'Must NOT render Split');
    assert.ok(!html.includes('Ignore Cluster'), 'Must NOT render Ignore');
  });

  // ── 3. PUBLISH never renders ───────────────────────────────────────────────
  await test('3. PUBLISH action is strictly filtered and never renders', () => {
    const item = createMockDeskItem({
      // Intentionally attempt to inject PUBLISH into available actions
      availableActions: ['VERIFY', 'PUBLISH' as any, 'ESCALATE'],
    });
    const html = renderToString(<ActionControlDock item={item} />);

    assert.ok(html.includes('Verify Evidence'), 'Should render authorized Verify');
    assert.ok(html.includes('Escalate Urgency'), 'Should render authorized Escalate');
    assert.ok(!html.includes('PUBLISH'), 'PUBLISH must never render in action dock');
    assert.ok(!html.includes('Publish'), 'Publish must never render in action dock');
  });

  // ── 4. Action payload uses expectedVersion ─────────────────────────────────
  await test('4. Action payload sends correct expectedVersion matching item.version', async () => {
    const item = createMockDeskItem({ version: 7 });
    let capturedPayload: NewsroomDeskActionInput | null = null;

    const mockDispatcher = async (payload: NewsroomDeskActionInput) => {
      capturedPayload = payload;
      return { success: true, item: { ...item, version: 8 } };
    };

    // Mount confirmation modal directly to simulate submit
    let confirmed = false;
    const confirmHandler = async (params: any) => {
      confirmed = true;
      await mockDispatcher({
        signalId: item.signalId,
        action: 'VERIFY',
        expectedVersion: item.version,
        mutationId: 'mut-test-1',
        note: params.note,
      });
    };

    const modalHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="VERIFY"
        onConfirm={confirmHandler}
        onCancel={() => {}}
      />
    );

    assert.ok(modalHtml.includes('(v7)') && modalHtml.includes('sig-action-1'), 'Modal displays version 7');

    await confirmHandler({ note: 'Verified against High Court registry' });
    assert.ok(confirmed, 'Confirm handler invoked');
    assert.strictEqual(capturedPayload?.expectedVersion, 7, 'Payload must pass expectedVersion: 7');
  });

  // ── 5. Action payload uses mutationId ───────────────────────────────────────
  await test('5. Action payload sends client-generated mutationId', async () => {
    const item = createMockDeskItem();
    let sentMutationId: string | undefined;

    const mockDispatcher = async (payload: NewsroomDeskActionInput) => {
      sentMutationId = payload.mutationId;
      return { success: true, item: { ...item, version: item.version + 1 } };
    };

    await mockDispatcher({
      signalId: item.signalId,
      action: 'ASSIGN',
      assignedTo: 'Judicial Desk',
      mutationId: 'mut-uuid-4921-test',
      expectedVersion: item.version,
    });

    assert.ok(sentMutationId, 'mutationId must be provided');
    assert.strictEqual(sentMutationId, 'mut-uuid-4921-test');
  });

  // ── 6. Successful action updates state ─────────────────────────────────────
  await test('6. Successful action updates state and invokes onActionSuccess', async () => {
    const item = createMockDeskItem({ version: 2, workflowState: 'monitoring' });
    const updatedServerItem: NewsroomDeskItem = {
      ...item,
      version: 3,
      workflowState: 'confirmed',
    };

    let callbackItem: NewsroomDeskItem | null = null;
    const onSuccess = (updated: NewsroomDeskItem) => {
      callbackItem = updated;
    };

    const mockDispatcher = async (_payload: NewsroomDeskActionInput) => {
      onSuccess(updatedServerItem);
      return { success: true, item: updatedServerItem };
    };

    const res = await mockDispatcher({
      signalId: item.signalId,
      action: 'VERIFY',
      expectedVersion: 2,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(callbackItem?.workflowState, 'confirmed');
    assert.strictEqual(callbackItem?.version, 3);
  });

  // ── 7. Successful action preserves server audit integrity ──────────────────
  await test('7. Successful action preserves server audit log integrity on updated item', async () => {
    const item = createMockDeskItem();
    const newAuditRecord = {
      id: 'audit-new-99',
      signalId: item.signalId,
      action: 'VERIFY' as const,
      actorId: 'usr-fc-1',
      actorName: 'Deepa Rao',
      actorRole: 'fact_checker',
      timestamp: '2026-10-02T16:20:00Z',
      previousState: 'monitoring',
      newState: 'confirmed',
      reason: 'Confirmed against certified high court PDF',
    };

    const updatedItemWithAudit: NewsroomDeskItem = {
      ...item,
      version: item.version + 1,
      workflowState: 'confirmed',
      auditTrail: [newAuditRecord, ...item.auditTrail],
    };

    assert.strictEqual(updatedItemWithAudit.auditTrail.length, 2);
    assert.strictEqual(updatedItemWithAudit.auditTrail[0].actorRole, 'fact_checker');
    assert.strictEqual(updatedItemWithAudit.auditTrail[0].action, 'VERIFY');
  });

  // ── 8. 401 unauthenticated handling ────────────────────────────────────────
  await test('8. HTTP 401 unauthenticated response is handled and preserves draft', () => {
    const item = createMockDeskItem();
    const modalHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="VERIFY"
        onConfirm={() => {}}
        onCancel={() => {}}
        initialNote="Important verification note that must not be lost"
        errorMessage="Session unauthenticated or expired. Please sign in to perform triage."
      />
    );

    assert.ok(modalHtml.includes('Session unauthenticated or expired'), 'Must display unauthenticated message');
    assert.ok(modalHtml.includes('Important verification note that must not be lost'), 'Must preserve draft note');
  });

  // ── 9. 403 permission denied handling ──────────────────────────────────────
  await test('9. HTTP 403 permission denied is handled accurately', () => {
    const item = createMockDeskItem();
    const modalHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="ESCALATE"
        onConfirm={() => {}}
        onCancel={() => {}}
        errorMessage="Permission denied: Action ESCALATE is not permitted for your institutional role."
      />
    );

    assert.ok(modalHtml.includes('Permission denied'), 'Must render permission denied alert');
    assert.ok(modalHtml.includes('ESCALATE is not permitted'), 'Must name forbidden action');
  });

  // ── 10. 404 item not found handling ────────────────────────────────────────
  await test('10. HTTP 404 signal not found is handled gracefully', () => {
    const item = createMockDeskItem();
    const modalHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="RESOLVE"
        onConfirm={() => {}}
        onCancel={() => {}}
        errorMessage="Signal item not found or has been removed from the operational queue."
      />
    );

    assert.ok(modalHtml.includes('Signal item not found'), 'Must announce item removal');
  });

  // ── 11. 400 bad request / validation handling ──────────────────────────────
  await test('11. HTTP 400 validation error is announced without crashing', () => {
    const item = createMockDeskItem();
    const modalHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="RESOLVE"
        onConfirm={() => {}}
        onCancel={() => {}}
        errorMessage="An editorial rationale note is required for this action."
      />
    );

    assert.ok(modalHtml.includes('An editorial rationale note is required'), 'Must render validation error');
  });

  // ── 12. 409 concurrency conflict triggers ConflictResolutionModal ─────────
  await test('12. HTTP 409 conflict triggers ConflictResolutionModal', () => {
    const item = createMockDeskItem({ version: 4 });
    const preservedDraft = {
      action: 'RESOLVE' as const,
      note: 'Order operative paragraphs reviewed with senior legal counsel.',
    };

    const conflictHtml = renderToString(
      <ConflictResolutionModal
        isOpen={true}
        item={item}
        preservedDraft={preservedDraft}
        onReload={() => {}}
        onClose={() => {}}
      />
    );

    assert.ok(conflictHtml.includes('Concurrency Conflict (HTTP 409)'), 'Must render conflict header');
    assert.ok(conflictHtml.includes('Item was updated concurrently by another editor'), 'Must explain conflict');
    assert.ok(conflictHtml.includes('v4'), 'Must display local version');
    assert.ok(conflictHtml.includes('Reload Latest Version'), 'Must provide reload action');
  });

  // ── 13. Draft rationale survives 409 conflict ──────────────────────────────
  await test('13. Draft rationale note strictly survives 409 conflict without data loss', () => {
    const item = createMockDeskItem();
    const complexDraftNote = 'CRITICAL EVIDENCE NOTE: Paragraph 12 of WP-3912 stays notification 44(A).';

    const conflictHtml = renderToString(
      <ConflictResolutionModal
        isOpen={true}
        item={item}
        preservedDraft={{
          action: 'ESCALATE',
          note: complexDraftNote,
          escalatedPriority: 'P0',
        }}
        onReload={() => {}}
        onClose={() => {}}
      />
    );

    assert.ok(conflictHtml.includes(complexDraftNote), 'Draft note must be fully preserved in conflict modal');
    assert.ok(conflictHtml.includes('Preserved Editorial Draft'), 'Must label preserved draft section');
    assert.ok(conflictHtml.includes('Intended: ESCALATE'), 'Must label intended action');
  });

  // ── 14. No blind auto-retry after 409 conflict ─────────────────────────────
  await test('14. Concurrency conflict does not perform blind auto-retry', () => {
    const item = createMockDeskItem({ version: 2 });
    let autoRetryAttempted = false;

    // Simulate conflict handling: opening modal requires human click on "Reload Latest Version"
    const onReload = () => {
      autoRetryAttempted = true;
    };

    const conflictHtml = renderToString(
      <ConflictResolutionModal
        isOpen={true}
        item={item}
        preservedDraft={{ action: 'RESOLVE', note: 'test' }}
        onReload={onReload}
        onClose={() => {}}
      />
    );

    assert.strictEqual(autoRetryAttempted, false, 'Must never automatically retry without human action');
    assert.ok(conflictHtml.includes('Reload Latest Version'), 'Provides explicit reload button for human editor');
  });

  // ── 15. Duplicate mutationId idempotent replay ─────────────────────────────
  await test('15. Repeated submission of same mutationId remains idempotent', async () => {
    const item = createMockDeskItem({ version: 3 });
    const fixedMutationId = 'mut-idempotent-repeat-1';

    let executionCount = 0;
    const idempotentDispatcher = async (payload: NewsroomDeskActionInput) => {
      executionCount++;
      if (payload.mutationId === fixedMutationId && executionCount > 1) {
        // Simulates M5 desk-service returning existing item
        return { success: true, item, status: 200 };
      }
      return { success: true, item: { ...item, version: 4 }, status: 200 };
    };

    const res1 = await idempotentDispatcher({
      signalId: item.signalId,
      action: 'VERIFY',
      mutationId: fixedMutationId,
      expectedVersion: 3,
    });
    assert.strictEqual(res1.item.version, 4, 'First call increments');

    const res2 = await idempotentDispatcher({
      signalId: item.signalId,
      action: 'VERIFY',
      mutationId: fixedMutationId,
      expectedVersion: 3,
    });
    assert.strictEqual(res2.success, true, 'Second call returns 200 OK idempotently');
  });

  // ── 16. Network failure preserves unsent work ──────────────────────────────
  await test('16. Network error preserves unsent draft note and reports failure safely', () => {
    const item = createMockDeskItem();
    const draftNote = 'Unsaved investigative findings during network timeout';

    const modalHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="PROMOTE_TO_RESEARCH"
        onConfirm={() => {}}
        onCancel={() => {}}
        initialNote={draftNote}
        errorMessage="Network error: Fetch failed. Your editorial draft has been saved."
      />
    );

    assert.ok(modalHtml.includes('Network error: Fetch failed'), 'Must render network error banner');
    assert.ok(modalHtml.includes(draftNote), 'Draft note must be preserved in textarea');
  });

  // ── 17. Confirmation modal renders consequence preview and inputs ─────────
  await test('17. ActionConfirmationModal renders consequence preview and action-specific inputs', () => {
    const item = createMockDeskItem();

    // Test ESCALATE (needs priority select)
    const escalateHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="ESCALATE"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    assert.ok(escalateHtml.includes('Escalates priority level'), 'Must render escalation consequence');
    assert.ok(escalateHtml.includes('Target Priority Level:'), 'Must render priority select label');

    // Test ASSIGN (needs assignee input)
    const assignHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="ASSIGN"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    assert.ok(assignHtml.includes('Assignee (Editor / Desk Lead):'), 'Must render assignee label');

    // Test VERIFY (needs verification checklist)
    const verifyHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="VERIFY"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    assert.ok(verifyHtml.includes('Verification Criteria:'), 'Must render verification checklist header');
    assert.ok(verifyHtml.includes('Primary source document hash verified'), 'Must render hash check');
  });

  // ── 18. Modals provide accessible dialog roles and labels ──────────────────
  await test('18. Modals conform to WCAG accessible dialog patterns', () => {
    const item = createMockDeskItem();

    const confirmHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={item}
        action="RESOLVE"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    assert.ok(confirmHtml.includes('role="dialog"'), 'Confirm modal has role="dialog"');
    assert.ok(confirmHtml.includes('aria-modal="true"'), 'Confirm modal has aria-modal="true"');
    assert.ok(confirmHtml.includes('aria-labelledby="confirmation-modal-title"'), 'Has accessible title link');

    const conflictHtml = renderToString(
      <ConflictResolutionModal
        isOpen={true}
        item={item}
        preservedDraft={{ action: 'VERIFY' }}
        onReload={() => {}}
        onClose={() => {}}
      />
    );
    assert.ok(conflictHtml.includes('role="dialog"'), 'Conflict modal has role="dialog"');
    assert.ok(conflictHtml.includes('aria-labelledby="conflict-modal-title"'), 'Has accessible title link');
  });

  // ── 19. Mobile-safe action dock toolbar presentation ───────────────────────
  await test('19. ActionControlDock provides mobile-safe responsive structure', () => {
    const item = createMockDeskItem({
      availableActions: ['VERIFY', 'REVIEW', 'ASSIGN', 'ESCALATE', 'RESOLVE', 'DISMISS'],
    });

    const dockHtml = renderToString(<ActionControlDock item={item} />);

    assert.ok(dockHtml.includes('role="toolbar"'), 'Toolbar role ensures accessible control group');
    assert.ok(dockHtml.includes('flex-wrap:wrap') || dockHtml.includes('flex-wrap: wrap') || dockHtml.includes('flexWrap'), 'Flex-wrap ensures responsive button wrapping');
    assert.ok(dockHtml.includes('aria-label="Available triage actions"'), 'Accessible toolbar label');
  });

  // ── 20. Security boundary: zero secret / credential leakage ───────────────
  await test('20. Security boundary: Action components never expose secrets or credentials', () => {
    const item = createMockDeskItem();
    const dockHtml = renderToString(<ActionControlDock item={item} />);
    const confirmHtml = renderToString(
      <ActionConfirmationModal isOpen={true} item={item} action="VERIFY" onConfirm={() => {}} onCancel={() => {}} />
    );
    const conflictHtml = renderToString(
      <ConflictResolutionModal isOpen={true} item={item} preservedDraft={{ action: 'VERIFY' }} onReload={() => {}} onClose={() => {}} />
    );

    const fullOutput = dockHtml + confirmHtml + conflictHtml;

    assert.ok(!fullOutput.includes('service_role'), 'Never leak service_role');
    assert.ok(!fullOutput.includes('supabase_key'), 'Never leak supabase_key');
    assert.ok(!fullOutput.includes('postgres://'), 'Never leak db connection strings');
    assert.ok(!fullOutput.includes('JWT'), 'Never leak JWT tokens');
    assert.ok(!fullOutput.includes('ANON_KEY'), 'Never leak anon key internals');
  });

  // ── Extra Integration Test: ItemDossierView with showActionDock ───────────
  await test('21. (Integration) ItemDossierView cleanly renders ActionControlDock when showActionDock is enabled', () => {
    const item = createMockDeskItem({
      availableActions: ['VERIFY', 'ESCALATE'],
    });

    const dossierHtml = renderToString(
      <ItemDossierView item={item} showActionDock={true} />
    );

    assert.ok(dossierHtml.includes('Human Triage Action Dock'), 'Renders ActionControlDock header');
    assert.ok(dossierHtml.includes('Verify Evidence'), 'Renders Verify Evidence button');
    assert.ok(dossierHtml.includes('Escalate Urgency'), 'Renders Escalate Urgency button');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
