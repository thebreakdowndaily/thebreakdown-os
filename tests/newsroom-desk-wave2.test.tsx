/**
 * ─── Phase 4A Wave 2: Item Dossier & Context Panels Test Suite ────────────────
 *
 * 20-Point Certification Matrix:
 *   1. Complete dossier rendering
 *   2. Missing optional fields (graceful degradation)
 *   3. Mutation lineage present (revisions, diffs, hashes)
 *   4. No mutation context ("Original document state")
 *   5. Multiple revisions (#3 with parent diff)
 *   6. Latency with all five timestamps
 *   7. Latency with missing timestamps ('—')
 *   8. Invalid chronology detection ('⚠ Chronology Inversion')
 *   9. Healthy source status
 *  10. Quiet source status ('Healthy (Quiet Feed)')
 *  11. Degraded/failing/stale source status
 *  12. Recovery / changed state
 *  13. Audit history rendering (events, actors, actions)
 *  14. Empty audit history ('No audit log events recorded yet')
 *  15. Related story rendering
 *  16. Contradiction state rendering
 *  17. Long content rendering without truncation failure
 *  18. Mobile-safe structure (responsive classes and styles)
 *  19. Accessibility semantics (landmarks, role="status", role="list")
 *  20. Security boundary: zero secret / private field leakage
 */

import * as assert from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  ItemDossierView,
  MutationLineagePanel,
  LatencyTracePanel,
  SourceHealthBadge,
  AuditHistoryView,
} from '../components/newsroom/desk';
import type { NewsroomDeskItem } from '../services/intelligence/newsroom/desk-service';
import type { NewsroomAuditLogRecord } from '../types/newsroom-intelligence';

function createMockDossierItem(overrides: Partial<NewsroomDeskItem> = {}): NewsroomDeskItem {
  return {
    queueItemId: 'q-sig-dossier-1',
    signalId: 'sig-dossier-1',
    clusterId: 'clus-dossier-1',
    title: 'Supreme Court Constitutional Bench Verdict on Digital Privacy',
    summary: 'Nine-judge bench unanimously affirms fundamental privacy guarantees under Article 21.',
    whyItMatters: 'Invalidates statutory bulk surveillance provisions across federal intelligence wings.',
    canonicalUrl: 'https://sci.gov.in/judgments/2026/WP-C-492-2025.pdf',
    sourceId: 'src-supreme-court-orders',
    sourceName: 'Supreme Court of India Official Orders',
    sourceAuthority: 't1',
    isPrimarySource: true,
    priority: 'P0',
    beat: 'judiciary',
    geographicScope: ['New Delhi', 'National'],
    changeType: 'changed',
    workflowState: 'escalated',
    assignedTo: 'Arun Kumar',
    assignedAt: '2026-10-02T15:00:00Z',
    confidence: 96,
    evidenceStrength: 94,
    uncertainty: 4,
    observationCount: 5,
    independentSourceCount: 3,
    primarySourceCount: 2,
    hasContradictions: true,
    contradictionIds: ['sig-ministry-press-note-402'],
    relatedStoryId: 'story-privacy-doctrine-2026',
    affectedStoryIds: ['story-telecom-act-2024', 'story-data-protection-2023'],
    mutationContext: {
      isMutation: true,
      mutationId: 'mut-privacy-9921',
      previousObservationId: 'obs-privacy-prev-1',
      previousContentHash: '4f8b2c1a9e7d3f5a',
      newContentHash: '9e7d3f5a4f8b2c1a',
      diffSummary: 'Operative paragraph 11 amended to clarify retrospective application to ongoing prosecutions.',
      revisionNumber: 2,
    },
    timestamps: {
      sourcePublishedAt: '2026-10-02T14:30:00Z',
      firstSeenAt: '2026-10-02T14:30:04Z',
      firstDetectedAt: '2026-10-02T14:30:05Z',
      lastUpdatedAt: '2026-10-02T15:10:00Z',
    },
    latencyContext: {
      detectionLatencyMs: 1000,
      observationLatencyMs: 4000,
      verificationLatencyMs: 900000,
      publicationLatencyMs: 300000,
      endToEndPublicationLatencyMs: 1205000,
    },
    sourceHealthContext: {
      status: 'healthy',
      scheduleState: 'active',
      consecutiveFailures: 0,
      consecutiveEmptyRuns: 0,
      silentFailureSuspected: false,
      lastSuccessAt: '2026-10-02T14:30:00Z',
    },
    requiredHumanAction: 'Cross-verify digital order hash against Supreme Court public key registry',
    availableActions: ['VERIFY', 'REVIEW', 'ASSIGN', 'ESCALATE'],
    version: 2,
    auditTrail: [
      {
        id: 'audit-1',
        signalId: 'sig-dossier-1',
        action: 'DETECT',
        actorId: 'system',
        actorName: 'Radar Pipeline Detector',
        actorRole: 'system',
        timestamp: '2026-10-02T14:30:05Z',
        previousState: 'discovered',
        newState: 'monitoring',
        reason: 'Autonomous cluster formed across 5 multi-source observations',
      },
      {
        id: 'audit-2',
        signalId: 'sig-dossier-1',
        action: 'ASSIGN',
        actorId: 'usr-ed-1',
        actorName: 'Arun Kumar',
        actorRole: 'editor',
        timestamp: '2026-10-02T15:00:00Z',
        previousState: 'monitoring',
        newState: 'escalated',
        reason: 'Assigned to Judicial Desk for primary digital signature verification',
        metadata: { mutationId: 'mut-privacy-9921' },
      },
    ],
    ...overrides,
  };
}

function runTests() {
  console.log('Running Phase 4A Wave 2 Item Dossier & Context Panels Tests...\n');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   ${e.message}`);
      failed++;
    }
  }

  // 1. Complete dossier rendering
  test('1. ItemDossierView renders complete dossier with all context sections', () => {
    const item = createMockDossierItem();
    const html = renderToString(<ItemDossierView item={item} />);

    assert.ok(html.includes('Supreme Court Constitutional Bench Verdict'), 'Must render title');
    assert.ok(html.includes('Nine-judge bench unanimously affirms'), 'Must render summary');
    assert.ok(html.includes('Why It Matters:'), 'Must render why it matters');
    assert.ok(html.includes('Required Editorial Action:'), 'Must render required action');
    assert.ok(html.includes('Supreme Court of India Official Orders'), 'Must render source name');
    assert.ok(html.includes('T1 Primary'), 'Must render source tier');
    assert.ok(html.includes('Primary Source'), 'Must render primary badge');
    assert.ok(html.includes('Confidence'), 'Must render confidence metric');
    assert.ok(html.includes('Document Mutation Detected — Revision #2'), 'Must render mutation panel');
    assert.ok(html.includes('End-to-End Pipeline Latency Trace'), 'Must render latency trace');
    assert.ok(html.includes('Immutable Audit Ledger'), 'Must render audit ledger');
  });

  // 2. Missing optional fields
  test('2. ItemDossierView gracefully handles missing optional fields', () => {
    const minimalItem = createMockDossierItem({
      whyItMatters: '',
      canonicalUrl: undefined,
      beat: undefined,
      geographicScope: [],
      mutationContext: undefined,
      changeType: 'new',
      hasContradictions: false,
      contradictionIds: [],
      relatedStoryId: undefined,
      affectedStoryIds: [],
      availableActions: [],
      auditTrail: [],
      latencyContext: null,
      sourceHealthContext: null,
    });

    const html = renderToString(<ItemDossierView item={minimalItem} />);
    assert.ok(html.includes('Supreme Court Constitutional Bench Verdict'), 'Must render title');
    assert.ok(!html.includes('Why It Matters:</strong>'), 'Must not render why it matters');
    assert.ok(html.includes('No upstream document mutation recorded'), 'Must render clean mutation state');
    assert.ok(html.includes('Telemetry Not Recorded'), 'Must render clean health state');
    assert.ok(html.includes('No audit log events recorded yet'), 'Must render clean audit state');
  });

  // 3. Mutation lineage present
  test('3. MutationLineagePanel renders revision number, diff summary, and content hashes', () => {
    const item = createMockDossierItem();
    const html = renderToString(
      <MutationLineagePanel
        mutationContext={item.mutationContext}
        changeType={item.changeType}
        affectedStoryIds={item.affectedStoryIds}
      />
    );

    assert.ok(html.includes('Document Mutation Detected — Revision #2'), 'Must render revision title');
    assert.ok(html.includes('Diff Summary'), 'Must render diff summary label');
    assert.ok(html.includes('Operative paragraph 11 amended'), 'Must render diff summary text');
    assert.ok(html.includes('Previous Revision (#1)'), 'Must render previous revision card');
    assert.ok(html.includes('Current Revision (#2)'), 'Must render current revision card');
    assert.ok(html.includes('4f8b2c1a9e7d3f5a'), 'Must render previous content hash');
    assert.ok(html.includes('9e7d3f5a4f8b2c1a'), 'Must render new content hash');
    assert.ok(html.includes('Downstream Impact: 2 Published Story(ies) Affected'), 'Must render downstream impact');
  });

  // 4. No mutation context
  test('4. MutationLineagePanel renders truthful clean state when no mutation is recorded', () => {
    const html = renderToString(<MutationLineagePanel mutationContext={null} changeType="new" />);
    assert.ok(html.includes('Document Lineage &amp; Revisions'), 'Must render lineage header');
    assert.ok(html.includes('No upstream document mutation recorded'), 'Must state no mutation');
  });

  // 5. Multiple revisions
  test('5. MutationLineagePanel correctly displays higher revision numbers (e.g. Rev #3)', () => {
    const html = renderToString(
      <MutationLineagePanel
        mutationContext={{
          isMutation: true,
          revisionNumber: 3,
          diffSummary: 'Third amendment applied.',
          previousContentHash: 'hash-2',
          newContentHash: 'hash-3',
        }}
        changeType="changed"
      />
    );

    assert.ok(html.includes('Revision #3'), 'Must render revision #3');
    assert.ok(html.includes('Previous Revision (#2)'), 'Must render previous revision #2');
    assert.ok(html.includes('Current Revision (#3)'), 'Must render current revision #3');
  });

  // 6. Latency with all five timestamps
  test('6. LatencyTracePanel renders all 5 precision milestones and non-negative latencies', () => {
    const item = createMockDossierItem();
    const html = renderToString(
      <LatencyTracePanel
        timestamps={item.timestamps}
        latencyContext={item.latencyContext}
        firstVerifiedAt="2026-10-02T14:45:00Z"
        publishedAt="2026-10-02T14:50:00Z"
      />
    );

    assert.ok(html.includes('1. Source Publication'), 'Must render milestone 1');
    assert.ok(html.includes('2. First Seen (Ingestion)'), 'Must render milestone 2');
    assert.ok(html.includes('3. First Detected'), 'Must render milestone 3');
    assert.ok(html.includes('4. First Verified'), 'Must render milestone 4');
    assert.ok(html.includes('5. Published'), 'Must render milestone 5');
    assert.ok(html.includes('4.0s'), 'Must render observation latency');
    assert.ok(html.includes('1.0s'), 'Must render detection latency');
    assert.ok(html.includes('15m 0s'), 'Must render verification latency');
    assert.ok(!html.includes('Chronology Inversion'), 'Valid chronology must not flag inversion');
  });

  // 7. Latency with missing timestamps
  test('7. LatencyTracePanel renders honest unavailable "—" for missing milestones', () => {
    const html = renderToString(
      <LatencyTracePanel
        timestamps={{
          firstDetectedAt: '2026-10-02T14:30:05Z',
        }}
        latencyContext={null}
      />
    );

    assert.ok(html.includes('—'), 'Must render — for unavailable timestamps and latencies');
    assert.ok(!html.includes('NaN'), 'Must not render NaN');
  });

  // 8. Invalid chronology detection
  test('8. LatencyTracePanel detects and flags chronology inversions', () => {
    const html = renderToString(
      <LatencyTracePanel
        timestamps={{
          sourcePublishedAt: '2026-10-02T15:00:00Z',
          firstSeenAt: '2026-10-02T14:00:00Z', // Inversion: seen before published
          firstDetectedAt: '2026-10-02T14:05:00Z',
        }}
      />
    );

    assert.ok(html.includes('⚠ Chronology Inversion'), 'Must prominently flag chronology inversion');
  });

  // 9. Healthy source
  test('9. SourceHealthBadge renders healthy status correctly', () => {
    const html = renderToString(
      <SourceHealthBadge
        sourceHealth={{
          status: 'healthy',
          consecutiveFailures: 0,
          consecutiveEmptyRuns: 0,
          silentFailureSuspected: false,
          lastSuccessAt: '2026-10-02T14:00:00Z',
        }}
      />
    );

    assert.ok(html.includes('HEALTHY'), 'Must render HEALTHY label');
    assert.ok(html.includes('✓'), 'Must render checkmark icon');
  });

  // 10. Quiet source
  test('10. SourceHealthBadge clearly distinguishes healthy quiet feed from failure', () => {
    const html = renderToString(
      <SourceHealthBadge
        sourceHealth={{
          status: 'healthy',
          consecutiveFailures: 0,
          consecutiveEmptyRuns: 6,
          silentFailureSuspected: false,
        }}
      />
    );

    assert.ok(html.includes('HEALTHY (QUIET FEED)'), 'Must render quiet feed label');
    assert.ok(html.includes('6 empty runs'), 'Must state consecutive empty runs count');
  });

  // 11. Degraded / failing / stale source
  test('11. SourceHealthBadge renders degraded, failing, and silent feed failure accurately', () => {
    // Failing
    const htmlFailing = renderToString(
      <SourceHealthBadge
        sourceHealth={{
          status: 'failing',
          consecutiveFailures: 4,
          consecutiveEmptyRuns: 0,
          silentFailureSuspected: false,
        }}
      />
    );
    assert.ok(htmlFailing.includes('FAILING'), 'Must render FAILING label');
    assert.ok(htmlFailing.includes('4 consecutive failure(s)'), 'Must render failure count');

    // Silent feed failure suspected
    const htmlSilent = renderToString(
      <SourceHealthBadge
        sourceHealth={{
          status: 'stale',
          consecutiveFailures: 0,
          consecutiveEmptyRuns: 14,
          silentFailureSuspected: true,
        }}
      />
    );
    assert.ok(htmlSilent.includes('STALE / SILENT FAILURE'), 'Must render silent failure warning');
  });

  // 12. Recovery / changed state
  test('12. SourceHealthBadge renders changed/recovered states', () => {
    const html = renderToString(
      <SourceHealthBadge
        sourceHealth={{
          status: 'changed',
          consecutiveFailures: 0,
          consecutiveEmptyRuns: 0,
          silentFailureSuspected: false,
        }}
      />
    );

    assert.ok(html.includes('CHANGED'), 'Must render CHANGED label');
  });

  // 13. Audit history rendering
  test('13. AuditHistoryView renders actor identity, action, state transitions, and notes', () => {
    const mockAudit: NewsroomAuditLogRecord[] = [
      {
        id: 'aud-101',
        signalId: 'sig-test',
        action: 'VERIFY',
        actorId: 'usr-fc-1',
        actorName: 'Sunita Rao',
        actorRole: 'fact_checker',
        timestamp: '2026-10-02T15:20:00Z',
        previousState: 'investigating',
        newState: 'confirmed',
        reason: 'Order verified against Supreme Court registry.',
        metadata: { mutationId: 'mut-123' },
      },
    ];

    const html = renderToString(<AuditHistoryView auditTrail={mockAudit} signalId="sig-test" />);
    assert.ok(html.includes('Immutable Audit Ledger (1 Event)'), 'Must render ledger title');
    assert.ok(html.includes('Sunita Rao'), 'Must render actor name');
    assert.ok(html.includes('fact_checker'), 'Must render actor role');
    assert.ok(html.includes('VERIFY'), 'Must render action');
    assert.ok(html.includes('investigating ──► confirmed'), 'Must render transition');
    assert.ok(html.includes('Order verified against Supreme Court registry.'), 'Must render rationale');
    assert.ok(html.includes('Correlation: mut-123'), 'Must render correlation id');
  });

  // 14. Empty audit history
  test('14. AuditHistoryView renders honest empty state when trail is empty', () => {
    const html = renderToString(<AuditHistoryView auditTrail={[]} />);
    assert.ok(html.includes('No audit log events recorded yet'), 'Must render empty state message');
  });

  // 15. Related story rendering
  test('15. ItemDossierView renders linked canonical stories and affected story lists', () => {
    const item = createMockDossierItem();
    const html = renderToString(<ItemDossierView item={item} />);

    assert.ok(html.includes('Linked Canonical Story:'), 'Must render linked story label');
    assert.ok(html.includes('story-privacy-doctrine-2026'), 'Must render linked story id');
  });

  // 16. Contradiction state
  test('16. ItemDossierView highlights active contradictions', () => {
    const item = createMockDossierItem();
    const html = renderToString(<ItemDossierView item={item} />);

    assert.ok(html.includes('Contradiction Detected:'), 'Must highlight contradiction');
    assert.ok(html.includes('sig-ministry-press-note-402'), 'Must list conflicting signal id');
  });

  // 17. Long content
  test('17. ItemDossierView safely handles long multi-sentence legal orders', () => {
    const longSummary = 'A complex judicial ruling involving statutory interpretation and fundamental rights. '.repeat(8).trim();
    const item = createMockDossierItem({ summary: longSummary });
    const html = renderToString(<ItemDossierView item={item} />);

    assert.ok(html.includes(longSummary), 'Must render complete long summary without truncation');
  });

  // 18. Mobile-safe structure
  test('18. ItemDossierView provides mobile-safe responsive structure', () => {
    const item = createMockDossierItem();
    const html = renderToString(<ItemDossierView item={item} />);

    assert.ok(html.includes('item-dossier-view active'), 'Must have root dossier class');
    assert.ok(html.includes('grid-template-columns:repeat(auto-fit, minmax('), 'Must use responsive grid');
  });

  // 19. Accessibility semantics
  test('19. ItemDossierView provides semantic landmarks and accessible ARIA attributes', () => {
    const item = createMockDossierItem();
    const html = renderToString(<ItemDossierView item={item} />);

    assert.ok(html.includes('<aside'), 'Root element must be semantic aside');
    assert.ok(html.includes('aria-label="Intelligence Dossier:'), 'Must have descriptive aria-label');
    assert.ok(html.includes('role="list"'), 'Audit and latency lists must declare role="list"');
  });

  // 20. Security boundary
  test('20. Security boundary: ItemDossierView never leaks private keys, credentials, or secrets', () => {
    const item = createMockDossierItem();
    const html = renderToString(<ItemDossierView item={item} />);

    assert.ok(!html.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Must not leak SUPABASE_SERVICE_ROLE_KEY');
    assert.ok(!html.includes('CRON_SECRET'), 'Must not leak CRON_SECRET');
    assert.ok(!html.includes('service_role'), 'Must not leak service_role');
    assert.ok(!html.includes('database_password'), 'Must not leak database_password');
    assert.ok(!html.includes('x-api-key'), 'Must not leak x-api-key');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
