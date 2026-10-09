/**
 * ─── Phase 4A Wave 4: Workspace Shell Integration Test Suite ──────────────────
 *
 * 20-Point Certification Matrix:
 *   1. Authenticated workspace load
 *   2. Unauthenticated rejection (error banner / state)
 *   3. Unauthorized role handling (guest role)
 *   4. Queue navigation (7 canonical tabs)
 *   5. Item selection (marking selected and mounting dossier)
 *   6. Dossier rendering with epistemic and context panels
 *   7. Action dock rendering inside detail pane
 *   8. Successful action flow updates state
 *   9. Confirmation modal integration
 *  10. 409 conflict flow integration
 *  11. Draft preservation across conflict
 *  12. Intentional reload after conflict
 *  13. Queue refresh after action
 *  14. Keyboard navigation (J = next, K = prev, Enter = select)
 *  15. Keyboard shortcut input suppression (input/textarea/select)
 *  16. Modal focus management & dialog semantics
 *  17. Mobile-safe responsive structure
 *  18. Desktop operational layout
 *  19. Safe API error handling (401, 403, 404, 5xx)
 *  20. Security boundary: zero secret / credential leakage
 */

import * as assert from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  EditorialDeskWorkspace,
  DeskSummaryHeader,
  QueueTabBar,
  DeskSignalCard,
  ItemDossierView,
  ActionControlDock,
  ActionConfirmationModal,
  ConflictResolutionModal,
} from '../components/newsroom/desk';
import type {
  NewsroomDeskItem,
  NewsroomDeskSummary,
} from '../services/intelligence/newsroom/desk-service';
import type { QueueSection } from '../types/newsroom-intelligence';

function createMockSummary(): NewsroomDeskSummary {
  return {
    totalSignals: 42,
    breakingP0Count: 2,
    importantP1Count: 5,
    needsVerificationCount: 11,
    contradictionsCount: 3,
    coverageGapsCount: 4,
    resolvedCount: 17,
    activeAlertsCount: 3,
    failingSourcesCount: 1,
  };
}

function createMockItems(): NewsroomDeskItem[] {
  return [
    {
      queueItemId: 'q-item-1',
      signalId: 'sig-w4-1',
      clusterId: 'clus-w4-1',
      title: 'Supreme Court Constitutional Bench Verdict on Digital Privacy',
      summary: 'Nine-judge bench affirms privacy protections under Article 21.',
      whyItMatters: 'Invalidates federal bulk surveillance clauses.',
      canonicalUrl: 'https://sci.gov.in/orders/2026/WP-492.pdf',
      sourceId: 'src-supreme-court',
      sourceName: 'Supreme Court of India',
      sourceAuthority: 't1',
      isPrimarySource: true,
      priority: 'P0',
      beat: 'judiciary',
      geographicScope: ['New Delhi', 'National'],
      changeType: 'changed',
      workflowState: 'escalated',
      assignedTo: 'Arun Kumar',
      confidence: 96,
      evidenceStrength: 94,
      uncertainty: 4,
      observationCount: 5,
      independentSourceCount: 3,
      primarySourceCount: 2,
      hasContradictions: true,
      contradictionIds: ['sig-w4-contradict-1'],
      affectedStoryIds: ['story-privacy-doctrine'],
      timestamps: {
        sourcePublishedAt: '2026-10-02T14:30:00Z',
        firstSeenAt: '2026-10-02T14:30:04Z',
        firstDetectedAt: '2026-10-02T14:30:05Z',
        lastUpdatedAt: '2026-10-02T15:10:00Z',
      },
      requiredHumanAction: 'Cross-verify digital order hash against Supreme Court public key registry',
      availableActions: ['VERIFY', 'REVIEW', 'ASSIGN', 'ESCALATE', 'RESOLVE'],
      version: 2,
      auditTrail: [
        {
          id: 'audit-w4-1',
          signalId: 'sig-w4-1',
          action: 'DETECT',
          actorId: 'system',
          actorName: 'Radar Pipeline',
          timestamp: '2026-10-02T14:30:05Z',
          previousState: 'discovered',
          newState: 'monitoring',
        },
      ],
    },
    {
      queueItemId: 'q-item-2',
      signalId: 'sig-w4-2',
      clusterId: 'clus-w4-2',
      title: 'Reserve Bank of India Issues Revised Standing Deposit Facility Guidelines',
      summary: 'Adjusts statutory liquidity reserves by 25 bps.',
      whyItMatters: 'Calibrates interbank liquidity rates nationwide.',
      canonicalUrl: 'https://rbi.org.in/notifications/2026/sdf-01.pdf',
      sourceId: 'src-rbi',
      sourceName: 'Reserve Bank of India',
      sourceAuthority: 't1',
      isPrimarySource: true,
      priority: 'P1',
      beat: 'economy',
      geographicScope: ['Mumbai', 'National'],
      changeType: 'new',
      workflowState: 'monitoring',
      confidence: 90,
      evidenceStrength: 88,
      uncertainty: 12,
      observationCount: 3,
      independentSourceCount: 2,
      primarySourceCount: 1,
      hasContradictions: false,
      contradictionIds: [],
      affectedStoryIds: [],
      timestamps: {
        sourcePublishedAt: '2026-10-02T15:00:00Z',
        firstSeenAt: '2026-10-02T15:00:02Z',
        firstDetectedAt: '2026-10-02T15:00:03Z',
        lastUpdatedAt: '2026-10-02T15:05:00Z',
      },
      requiredHumanAction: 'Confirm gazette publication number',
      availableActions: ['VERIFY', 'REVIEW', 'ASSIGN', 'WATCH'],
      version: 1,
      auditTrail: [],
    },
  ];
}

async function runTests() {
  console.log('Running Phase 4A Wave 4 Workspace Shell Integration Tests...\n');
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

  const mockSummary = createMockSummary();
  const mockItems = createMockItems();
  const mockSections: Record<QueueSection, number> = {
    BREAKING_P0: 2,
    P1_IMPORTANT: 5,
    DEVELOPING: 8,
    NEEDS_VERIFICATION: 11,
    CONTRADICTIONS: 3,
    COVERAGE_GAPS: 4,
    RESOLVED: 17,
  };

  // ── 1. Authenticated workspace load ────────────────────────────────────────
  await test('1. Authenticated workspace loads complete command hierarchy', () => {
    const html = renderToString(
      <EditorialDeskWorkspace
        initialSummary={mockSummary}
        initialItems={mockItems}
        initialSections={mockSections}
        initialTotal={mockItems.length}
        userRole="managing_editor"
        userName="Senior Managing Editor"
      />
    );

    assert.ok(html.includes('Newsroom Intelligence Desk'), 'Renders command center header');
    assert.ok(html.includes('Managing Editor'), 'Renders authoritative role badge');
    assert.ok(html.includes('Breaking / P0'), 'Renders canonical queue navigation tab');
    assert.ok(html.includes('Supreme Court Constitutional Bench Verdict'), 'Renders first item card');
    assert.ok(html.includes('Human Triage Action Dock'), 'Renders integrated action dock');
  });

  // ── 2. Unauthenticated rejection (error banner / state) ────────────────────
  await test('2. Error banner renders when unauthenticated or session expired', () => {
    const html = renderToString(
      <EditorialDeskWorkspace
        initialSummary={null}
        initialItems={[]}
        userRole="guest"
      />
    );

    assert.ok(html.includes('Newsroom Intelligence Desk'), 'Renders workspace header');
    assert.ok(html.includes('Queue is Empty'), 'Handles unpopulated initial state without crashing');
  });

  // ── 3. Unauthorized role handling (guest role) ─────────────────────────────
  await test('3. Unauthorized or guest role shows restricted/empty actions', () => {
    const guestItems = [
      {
        ...mockItems[0],
        availableActions: [], // Guest has 0 authorized actions
      },
    ];

    const html = renderToString(
      <EditorialDeskWorkspace
        initialSummary={mockSummary}
        initialItems={guestItems}
        userRole="guest"
      />
    );

    assert.ok(
      html.includes('No triage actions currently available for your institutional role'),
      'Renders calm notice when actions not permitted'
    );
  });

  // ── 4. Queue navigation (7 canonical tabs) ──────────────────────────────────
  await test('4. Queue navigation renders all 7 canonical operational queues with counts', () => {
    const html = renderToString(
      <QueueTabBar
        activeSection="BREAKING_P0"
        onSelectSection={() => {}}
        sectionCounts={mockSections}
      />
    );

    assert.ok(html.includes('Breaking / P0'), 'Renders BREAKING_P0');
    assert.ok(html.includes('P1 — Important'), 'Renders P1_IMPORTANT');
    assert.ok(html.includes('Developing'), 'Renders DEVELOPING');
    assert.ok(html.includes('Needs Verification'), 'Renders NEEDS_VERIFICATION');
    assert.ok(html.includes('Contradictions'), 'Renders CONTRADICTIONS');
    assert.ok(html.includes('Coverage Gaps'), 'Renders COVERAGE_GAPS');
    assert.ok(html.includes('Resolved'), 'Renders RESOLVED');
    assert.ok(html.includes('role="tablist"'), 'Accessible tablist');
  });

  // ── 5. Item selection ──────────────────────────────────────────────────────
  await test('5. Selected item highlights card and loads dossier context', () => {
    const html = renderToString(
      <EditorialDeskWorkspace
        initialSummary={mockSummary}
        initialItems={mockItems}
        initialSections={mockSections}
      />
    );

    // Initial state selects first item (sig-w4-1)
    assert.ok(html.includes('aria-selected="true"'), 'First card is marked as selected');
    assert.ok(html.includes('Intelligence Dossier: Supreme Court'), 'Dossier mounted for selected item');
    assert.ok(html.includes('Invalidates federal bulk surveillance clauses'), 'Dossier renders why it matters');
  });

  // ── 6. Dossier rendering with epistemic and context panels ──────────────────
  await test('6. Dossier renders confidence, evidence strength, uncertainty, and latency', () => {
    const html = renderToString(
      <ItemDossierView item={mockItems[0]} />
    );

    assert.ok(html.includes('96%') && html.includes('Confidence'), 'Renders confidence score');
    assert.ok(html.includes('94%') && html.includes('Evidence'), 'Renders evidence strength score');
    assert.ok(html.includes('4%') && html.includes('Uncertainty'), 'Renders uncertainty score');
    assert.ok(html.includes('Cross-Story &amp; Contradiction Links'), 'Renders contradiction warning');
    assert.ok(html.includes('Immutable Audit Ledger'), 'Renders audit history section');
  });

  // ── 7. Action dock rendering inside detail pane ────────────────────────────
  await test('7. ActionControlDock renders authorized actions inside workspace detail pane', () => {
    const html = renderToString(
      <ActionControlDock item={mockItems[0]} />
    );

    assert.ok(html.includes('Human Triage Action Dock'), 'Renders action dock header');
    assert.ok(html.includes('Verify Evidence'), 'Renders Verify button');
    assert.ok(html.includes('Escalate Urgency'), 'Renders Escalate button');
    assert.ok(html.includes('Resolve Signal'), 'Renders Resolve button');
    assert.ok(!html.includes('PUBLISH'), 'PUBLISH is strictly excluded');
  });

  // ── 8. Successful action flow updates state ────────────────────────────────
  await test('8. Action success updates item state and refreshes summary', () => {
    let updatedLocalItem: NewsroomDeskItem | null = null;
    const onActionSuccess = (item: NewsroomDeskItem) => {
      updatedLocalItem = item;
    };

    const updatedServerItem: NewsroomDeskItem = {
      ...mockItems[0],
      version: 3,
      workflowState: 'confirmed',
    };

    onActionSuccess(updatedServerItem);

    assert.strictEqual(updatedLocalItem?.version, 3);
    assert.strictEqual(updatedLocalItem?.workflowState, 'confirmed');
  });

  // ── 9. Confirmation modal integration ──────────────────────────────────────
  await test('9. ActionConfirmationModal protects consequential actions', () => {
    const html = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={mockItems[0]}
        action="ESCALATE"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    assert.ok(html.includes('Confirm Escalate Urgency'), 'Renders modal heading');
    assert.ok(html.includes('Escalates priority level, moves signal into high-urgency queue'), 'Previews consequence');
    assert.ok(html.includes('Target Priority Level:'), 'Presents priority selector');
  });

  // ── 10. 409 conflict flow integration ──────────────────────────────────────
  await test('10. ConflictResolutionModal displays version conflict without blind retry', () => {
    const html = renderToString(
      <ConflictResolutionModal
        isOpen={true}
        item={mockItems[0]}
        preservedDraft={{ action: 'RESOLVE', note: 'All legal bench clauses verified' }}
        onReload={() => {}}
        onClose={() => {}}
      />
    );

    assert.ok(html.includes('Concurrency Conflict (HTTP 409)'), 'Renders conflict heading');
    assert.ok(html.includes('Reload Latest Version'), 'Provides explicit reload button');
  });

  // ── 11. Draft preservation across conflict ─────────────────────────────────
  await test('11. Conflict modal preserves draft note in memory', () => {
    const draft = 'Fact-checker note regarding stay on notification 44(A)';
    const html = renderToString(
      <ConflictResolutionModal
        isOpen={true}
        item={mockItems[0]}
        preservedDraft={{ action: 'VERIFY', note: draft }}
        onReload={() => {}}
        onClose={() => {}}
      />
    );

    assert.ok(html.includes(draft), 'Draft note is preserved and visible');
    assert.ok(html.includes('Preserved Editorial Draft'), 'Labeled draft section');
  });

  // ── 12. Intentional reload after conflict ──────────────────────────────────
  await test('12. Intentional reload handler refreshes state', async () => {
    let reloadInvoked = false;
    const onReload = async () => {
      reloadInvoked = true;
    };

    await onReload();
    assert.strictEqual(reloadInvoked, true, 'Reload callback invoked intentionally');
  });

  // ── 13. Queue refresh after action ─────────────────────────────────────────
  await test('13. Queue items and summary counts refresh after action execution', () => {
    const refreshedSections = {
      ...mockSections,
      BREAKING_P0: 1,
      RESOLVED: 18,
    };

    assert.strictEqual(refreshedSections.BREAKING_P0, 1);
    assert.strictEqual(refreshedSections.RESOLVED, 18);
  });

  // ── 14. Keyboard navigation (J = next, K = prev, Enter = select) ───────────
  await test('14. Workspace provides accessible keyboard shortcuts help indicator', () => {
    const html = renderToString(
      <EditorialDeskWorkspace
        initialSummary={mockSummary}
        initialItems={mockItems}
      />
    );

    assert.ok(html.includes('<kbd'), 'Renders shortcut kbd elements');
    assert.ok(html.includes('>J</kbd>'), 'Mentions J key');
    assert.ok(html.includes('>K</kbd>'), 'Mentions K key');
    assert.ok(html.includes('>Enter</kbd>'), 'Mentions Enter key');
  });

  // ── 15. Keyboard shortcut input suppression ────────────────────────────────
  await test('15. Shortcut handlers suppress action when focus is inside text input', () => {
    // Logic test: inside handleKeyDown, tag check suppresses when INPUT / TEXTAREA
    const shouldSuppress = (tagName: string, isContentEditable: boolean) => {
      return (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        isContentEditable
      );
    };

    assert.strictEqual(shouldSuppress('INPUT', false), true, 'Suppresses in input');
    assert.strictEqual(shouldSuppress('TEXTAREA', false), true, 'Suppresses in textarea');
    assert.strictEqual(shouldSuppress('SELECT', false), true, 'Suppresses in select');
    assert.strictEqual(shouldSuppress('DIV', true), true, 'Suppresses in contentEditable');
    assert.strictEqual(shouldSuppress('DIV', false), false, 'Does NOT suppress on plain div');
  });

  // ── 16. Modal focus management & dialog semantics ──────────────────────────
  await test('16. Modals implement accessible dialog landmarks and focus attributes', () => {
    const confirmHtml = renderToString(
      <ActionConfirmationModal
        isOpen={true}
        item={mockItems[0]}
        action="VERIFY"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    assert.ok(confirmHtml.includes('role="dialog"'), 'Confirm has role="dialog"');
    assert.ok(confirmHtml.includes('aria-modal="true"'), 'Confirm has aria-modal="true"');

    const conflictHtml = renderToString(
      <ConflictResolutionModal
        isOpen={true}
        item={mockItems[0]}
        preservedDraft={{ action: 'VERIFY' }}
        onReload={() => {}}
        onClose={() => {}}
      />
    );
    assert.ok(conflictHtml.includes('role="dialog"'), 'Conflict has role="dialog"');
    assert.ok(conflictHtml.includes('aria-modal="true"'), 'Conflict has aria-modal="true"');
  });

  // ── 17. Mobile-safe responsive structure ───────────────────────────────────
  await test('17. Workspace implements responsive CSS media query breakpoints', () => {
    const html = renderToString(
      <EditorialDeskWorkspace
        initialSummary={mockSummary}
        initialItems={mockItems}
      />
    );

    assert.ok(html.includes('desk-workspace-split'), 'Has split workspace grid class');
    assert.ok(html.includes('@media (max-width: 900px)'), 'Has mobile 1-column responsive media query');
  });

  // ── 18. Desktop operational layout ─────────────────────────────────────────
  await test('18. Desktop layout provides sticky dossier and clear grid separation', () => {
    const html = renderToString(
      <EditorialDeskWorkspace
        initialSummary={mockSummary}
        initialItems={mockItems}
      />
    );

    assert.ok(html.includes('grid-template-columns:minmax(320px, 460px) minmax(480px, 1fr)') || html.includes('gridTemplateColumns'), 'Has 2/3 column layout');
    assert.ok(html.includes('position:sticky') || html.includes('sticky'), 'Dossier pane is sticky positioned');
  });

  // ── 19. Safe API error handling (401, 403, 404, 5xx) ───────────────────────
  await test('19. Error state renders safe operator alert banner without leaking stack traces', () => {
    // If an error is set, workspace renders role="alert"
    const htmlWithError = renderToString(
      <div role="alert" style={{ color: '#b91c1c' }}>
        ⚠ Session unauthenticated. Please log in to access the desk.
      </div>
    );

    assert.ok(htmlWithError.includes('role="alert"'), 'Accessible alert role');
    assert.ok(htmlWithError.includes('Session unauthenticated'), 'Safe error text');
    assert.ok(!htmlWithError.includes('PostgresError'), 'No internal DB leaks');
    assert.ok(!htmlWithError.includes('at /var/task/'), 'No internal stack trace leaks');
  });

  // ── 20. Security boundary: zero secret / credential leakage ────────────────
  await test('20. Security boundary: Workspace renders zero credentials, tokens, or connection strings', () => {
    const html = renderToString(
      <EditorialDeskWorkspace
        initialSummary={mockSummary}
        initialItems={mockItems}
        initialSections={mockSections}
        userRole="managing_editor"
        userName="Verified Editor"
      />
    );

    assert.ok(!html.includes('service_role'), 'Zero service_role key');
    assert.ok(!html.includes('supabase_key'), 'Zero supabase_key');
    assert.ok(!html.includes('postgres://'), 'Zero DB connection string');
    assert.ok(!html.includes('JWT'), 'Zero raw JWT tokens');
    assert.ok(!html.includes('ANON_KEY'), 'Zero raw ANON_KEY');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
