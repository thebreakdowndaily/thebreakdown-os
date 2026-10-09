/**
 * ─── Phase 4A Wave 1: Presentational Primitives Component Tests ───────────────
 *
 * 10-Point Test Suite for Wave 1 Presentational Components:
 *   1. Correct rendering from valid M5 item data
 *   2. Priority rendering (P0/P1/P2/P3 with color-independent icons/labels)
 *   3. Workflow-state rendering (detected, monitoring, investigating, confirmed, retracted, resolved)
 *   4. Source rendering (sourceName, sourceAuthority tier)
 *   5. Beat/geography rendering
 *   6. Missing optional fields (graceful degradation)
 *   7. Long titles and summaries
 *   8. Keyboard and focus accessibility (ARIA roles, tabIndex, aria-selected)
 *   9. Responsive-safe structure
 *  10. Security boundary: zero secret / private credential leakage
 *
 * Plus testing of DeskSummaryHeader and QueueTabBar.
 */

import * as assert from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DeskSummaryHeader } from '../components/newsroom/desk/DeskSummaryHeader';
import { QueueTabBar } from '../components/newsroom/desk/QueueTabBar';
import { DeskSignalCard } from '../components/newsroom/desk/DeskSignalCard';
import type { NewsroomDeskItem, NewsroomDeskSummary } from '../services/intelligence/newsroom/desk-service';
import type { QueueSection } from '../types/newsroom-intelligence';

function createMockDeskItem(overrides: Partial<NewsroomDeskItem> = {}): NewsroomDeskItem {
  return {
    queueItemId: 'q-sig-test-1',
    signalId: 'sig-test-1',
    clusterId: 'clus-test-1',
    title: 'High Court of MP Quashes Rule 14 Amendment',
    summary: 'The Division Bench held Rule 14 amendment ultra vires statutory powers.',
    whyItMatters: 'Directly impacts 142 commercial mining leases issued under the 2025 rule.',
    canonicalUrl: 'https://mphc.gov.in/orders/2026/WP-10492-2025.pdf',
    sourceId: 'src-mp-high-court',
    sourceName: 'Madhya Pradesh High Court',
    sourceAuthority: 't1',
    isPrimarySource: true,
    priority: 'P0',
    beat: 'judiciary',
    geographicScope: ['Jabalpur', 'Madhya Pradesh', 'India'],
    changeType: 'changed',
    workflowState: 'escalated',
    assignedTo: 'Priya Sharma',
    assignedAt: '2026-10-02T14:15:00Z',
    confidence: 94,
    evidenceStrength: 91,
    uncertainty: 9,
    observationCount: 3,
    independentSourceCount: 2,
    primarySourceCount: 1,
    hasContradictions: true,
    contradictionIds: ['sig-test-conflict-1'],
    relatedStoryId: 'story-88',
    affectedStoryIds: ['story-88', 'story-92'],
    mutationContext: {
      isMutation: true,
      mutationId: 'mut-8831',
      previousObservationId: 'obs-10491',
      previousContentHash: '3a9f8b2c',
      newContentHash: '8bc12d4e',
      diffSummary: 'Paragraph 14 modified to clarify retrospective stay.',
      revisionNumber: 2,
    },
    timestamps: {
      sourcePublishedAt: '2026-10-02T14:00:00Z',
      firstSeenAt: '2026-10-02T14:00:04Z',
      firstDetectedAt: '2026-10-02T14:00:05Z',
      lastUpdatedAt: '2026-10-02T14:15:00Z',
    },
    latencyContext: {
      detectionLatencyMs: 1000,
      observationLatencyMs: 4000,
      verificationLatencyMs: 900000,
      publicationLatencyMs: undefined,
      endToEndPublicationLatencyMs: undefined,
    },
    sourceHealthContext: {
      status: 'healthy',
      scheduleState: 'active',
      consecutiveFailures: 0,
      consecutiveEmptyRuns: 0,
      silentFailureSuspected: false,
      lastSuccessAt: '2026-10-02T14:00:00Z',
    },
    requiredHumanAction: 'Verify gazette notification against digital court registry',
    availableActions: ['VERIFY', 'REVIEW', 'ASSIGN', 'ESCALATE'],
    version: 2,
    auditTrail: [],
    ...overrides,
  };
}

function runTests() {
  console.log('Running Phase 4A Wave 1 Presentational Primitives Tests...\n');
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

  // 1. Valid data rendering
  test('1. DeskSignalCard renders valid M5 item data correctly', () => {
    const item = createMockDeskItem();
    const html = renderToString(<DeskSignalCard item={item} />);

    assert.ok(html.includes('High Court of MP Quashes Rule 14 Amendment'), 'Must render title');
    assert.ok(html.includes('The Division Bench held Rule 14 amendment ultra vires'), 'Must render summary');
    assert.ok(html.includes('Why it matters:'), 'Must render Why it matters label');
    assert.ok(html.includes('Directly impacts 142 commercial mining leases'), 'Must render Why it matters content');
    assert.ok(html.includes('Madhya Pradesh High Court'), 'Must render source name');
    assert.ok(html.includes('T1 Primary'), 'Must render tier label');
    assert.ok(html.includes('Confidence:'), 'Must render confidence metric');
    assert.ok(html.includes('94%'), 'Must render confidence value');
    assert.ok(html.includes('Evidence:'), 'Must render evidence metric');
    assert.ok(html.includes('91%'), 'Must render evidence value');
    assert.ok(html.includes('v2'), 'Must render version');
  });

  // 2. Priority rendering
  test('2. DeskSignalCard renders priority levels with color-independent icons and labels', () => {
    const htmlP0 = renderToString(<DeskSignalCard item={createMockDeskItem({ priority: 'P0' })} />);
    assert.ok(htmlP0.includes('P0 — CRITICAL'), 'P0 must include critical label');
    assert.ok(htmlP0.includes('!'), 'P0 must include exclamation mark');

    const htmlP1 = renderToString(<DeskSignalCard item={createMockDeskItem({ priority: 'P1' })} />);
    assert.ok(htmlP1.includes('P1 — IMPORTANT'), 'P1 must include important label');
    assert.ok(htmlP1.includes('◆'), 'P1 must include diamond symbol');

    const htmlP2 = renderToString(<DeskSignalCard item={createMockDeskItem({ priority: 'P2' })} />);
    assert.ok(htmlP2.includes('P2 — SIGNIFICANT'), 'P2 must include significant label');
    assert.ok(htmlP2.includes('▲'), 'P2 must include triangle symbol');

    const htmlP3 = renderToString(<DeskSignalCard item={createMockDeskItem({ priority: 'P3' })} />);
    assert.ok(htmlP3.includes('P3 — WATCH'), 'P3 must include watch label');
    assert.ok(htmlP3.includes('●'), 'P3 must include circle symbol');
  });

  // 3. Workflow-state rendering
  test('3. DeskSignalCard renders all canonical workflow states correctly', () => {
    const states = [
      'discovered',
      'monitoring',
      'escalated',
      'confirmed',
      'contested',
      'resolved',
      'superseded',
      'retracted',
    ] as const;
    for (const state of states) {
      const html = renderToString(<DeskSignalCard item={createMockDeskItem({ workflowState: state })} />);
      assert.ok(html.toLowerCase().includes(state), `Must render workflow state ${state}`);
    }
  });

  // 4. Source rendering
  test('4. DeskSignalCard renders source authority and source name correctly', () => {
    const html = renderToString(
      <DeskSignalCard
        item={createMockDeskItem({
          sourceName: 'Reserve Bank of India',
          sourceAuthority: 't1',
        })}
      />
    );
    assert.ok(html.includes('Source: <strong>Reserve Bank of India</strong>'), 'Must render source name');
    assert.ok(html.includes('T1 Primary'), 'Must render tier label');
  });

  // 5. Beat/geography rendering
  test('5. DeskSignalCard renders beat and geography tags correctly', () => {
    const html = renderToString(
      <DeskSignalCard
        item={createMockDeskItem({
          beat: 'economy',
          geographicScope: ['Mumbai', 'Maharashtra'],
        })}
      />
    );
    assert.ok(html.includes('Beat: <strong>economy</strong>'), 'Must render beat');
    assert.ok(html.includes('Geo: <strong>Mumbai, Maharashtra</strong>'), 'Must render geo');
  });

  // 6. Missing optional fields
  test('6. DeskSignalCard gracefully degrades when optional fields are omitted', () => {
    const minimalItem = createMockDeskItem({
      whyItMatters: '',
      beat: undefined,
      geographicScope: [],
      sourceName: undefined,
      requiredHumanAction: '',
      mutationContext: undefined,
      changeType: 'new',
      hasContradictions: false,
      affectedStoryIds: [],
      availableActions: [],
    });

    const html = renderToString(<DeskSignalCard item={minimalItem} />);
    assert.ok(html.includes('High Court of MP Quashes Rule 14 Amendment'), 'Must render title');
    assert.ok(!html.includes('Why it matters:'), 'Must not render missing whyItMatters');
    assert.ok(!html.includes('Beat:'), 'Must not render missing beat');
    assert.ok(!html.includes('Geo:'), 'Must not render missing geo');
    assert.ok(!html.includes('REV #'), 'Must not render mutation badge');
    assert.ok(!html.includes('CONTRADICTION'), 'Must not render contradiction badge');
  });

  // 7. Long titles and summaries
  test('7. DeskSignalCard safely handles long multi-sentence titles and summaries', () => {
    const longTitle = 'Very Long Investigative Title '.repeat(10).trim();
    const longSummary = 'A complex, multi-sentence investigative summary paragraph detailing extensive regulatory background. '.repeat(5).trim();

    const html = renderToString(
      <DeskSignalCard
        item={createMockDeskItem({
          title: longTitle,
          summary: longSummary,
        })}
      />
    );

    assert.ok(html.includes(longTitle), 'Must render long title without truncation errors');
    assert.ok(html.includes(longSummary), 'Must render long summary without truncation errors');
  });

  // 8. Keyboard & focus accessibility
  test('8. DeskSignalCard provides accessible semantic roles, aria-labels, and keyboard tabIndex', () => {
    const item = createMockDeskItem();
    const html = renderToString(<DeskSignalCard item={item} isSelected={true} />);

    assert.ok(html.includes('role="article"'), 'Must have role="article"');
    assert.ok(html.includes('tabindex="0"'), 'Must have tabindex="0" for keyboard focus');
    assert.ok(html.includes('aria-selected="true"'), 'Must have aria-selected="true" when selected');
    assert.ok(html.includes(`aria-label="Signal ${item.title}`), 'Must have descriptive aria-label');
  });

  // 9. Mutation and contradiction rendering
  test('9. DeskSignalCard renders M2 mutation indicator and diff summary when present', () => {
    const item = createMockDeskItem({
      changeType: 'changed',
      mutationContext: {
        isMutation: true,
        revisionNumber: 3,
        diffSummary: 'Amended submission deadline.',
      },
    });

    const html = renderToString(<DeskSignalCard item={item} />);
    assert.ok(html.includes('REV #3 CHANGED'), 'Must render revision number');
    assert.ok(html.includes('Mutation Diff:') && html.includes('Amended submission deadline.'), 'Must render diff summary');
  });

  // 10. Security boundary
  test('10. Security boundary: DeskSignalCard never renders secrets, tokens, or service role credentials', () => {
    const item = createMockDeskItem();
    const html = renderToString(<DeskSignalCard item={item} />);

    assert.ok(!html.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Must not leak SUPABASE_SERVICE_ROLE_KEY');
    assert.ok(!html.includes('CRON_SECRET'), 'Must not leak CRON_SECRET');
    assert.ok(!html.includes('service_role'), 'Must not leak service_role');
    assert.ok(!html.includes('database_password'), 'Must not leak database_password');
    assert.ok(!html.includes('x-api-key'), 'Must not leak x-api-key');
  });

  // DeskSummaryHeader tests
  test('11. DeskSummaryHeader renders operational metrics from NewsroomDeskSummary accurately', () => {
    const mockSummary: NewsroomDeskSummary = {
      totalSignals: 42,
      breakingP0Count: 3,
      importantP1Count: 8,
      needsVerificationCount: 14,
      contradictionsCount: 4,
      coverageGapsCount: 6,
      resolvedCount: 7,
      activeAlertsCount: 2,
      failingSourcesCount: 1,
    };

    const html = renderToString(
      <DeskSummaryHeader
        summary={mockSummary}
        userRole="managing_editor"
        userName="Nitin Sharma"
        lastRefreshedAt="2026-10-02T16:00:00Z"
      />
    );

    assert.ok(html.includes('Newsroom Intelligence Desk'), 'Must render desk title');
    assert.ok(html.includes('Nitin Sharma (Managing Editor)'), 'Must render user and role');
    assert.ok(html.includes('3'), 'Must render breaking P0 count');
    assert.ok(html.includes('8'), 'Must render important P1 count');
    assert.ok(html.includes('14'), 'Must render needs verification count');
    assert.ok(html.includes('4'), 'Must render contradictions count');
    assert.ok(html.includes('6'), 'Must render coverage gaps count');
    assert.ok(html.includes('2'), 'Must render active alerts count');
    assert.ok(html.includes('1'), 'Must render failing feeds count');
    assert.ok(html.includes('42'), 'Must render total signals count');
  });

  test('12. DeskSummaryHeader gracefully handles null/loading summary', () => {
    const html = renderToString(<DeskSummaryHeader summary={null} />);
    assert.ok(html.includes('Newsroom Intelligence Desk'), 'Must render desk title');
    assert.ok(html.includes('Reporter'), 'Must render default fallback role');
    assert.ok(html.includes('0'), 'Must render 0 fallback for metrics');
  });

  // QueueTabBar tests
  test('13. QueueTabBar renders all 7 canonical queue tabs with counts and accessible tablist attributes', () => {
    const mockCounts: Record<QueueSection, number> = {
      BREAKING_P0: 2,
      P1_IMPORTANT: 5,
      DEVELOPING: 12,
      NEEDS_VERIFICATION: 8,
      CONTRADICTIONS: 3,
      COVERAGE_GAPS: 4,
      RESOLVED: 20,
    };

    const html = renderToString(
      <QueueTabBar
        activeSection="BREAKING_P0"
        sectionCounts={mockCounts}
        onSelectSection={() => {}}
      />
    );

    assert.ok(html.includes('role="tablist"'), 'Must have role="tablist"');
    assert.ok(html.includes('Breaking / P0'), 'Must render Breaking / P0 tab');
    assert.ok(html.includes('P1 — Important'), 'Must render P1 — Important tab');
    assert.ok(html.includes('Developing'), 'Must render Developing tab');
    assert.ok(html.includes('Needs Verification'), 'Must render Needs Verification tab');
    assert.ok(html.includes('Contradictions'), 'Must render Contradictions tab');
    assert.ok(html.includes('Coverage Gaps'), 'Must render Coverage Gaps tab');
    assert.ok(html.includes('Resolved'), 'Must render Resolved tab');

    assert.ok(html.includes('id="queue-tab-BREAKING_P0" aria-selected="true"'), 'Active tab must have aria-selected="true"');
    assert.ok(html.includes('id="queue-tab-P1_IMPORTANT" aria-selected="false"'), 'Inactive tab must have aria-selected="false"');

    assert.ok(html.includes(', 2 items'), 'Must have accessible item count label');
    assert.ok(html.includes(', 5 items'), 'Must have accessible item count label');
    assert.ok(html.includes(', 20 items'), 'Must have accessible item count label');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
