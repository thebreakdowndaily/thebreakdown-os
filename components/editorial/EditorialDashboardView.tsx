'use client';

/**
 * ─── Editorial Studio Presentation Component: EditorialDashboardView ─────────
 * Authenticated Mission Control displaying assignment queue, Gold Standard Review pass
 * status, stage distribution, and workflow analytics.
 */

import React from 'react';
import type { EditorialStateRecord } from '@/lib/editorial/workflow-state-machine';
import type { GoldStandardAuditRecord } from '@/lib/editorial/gold-standard-review';
import type { EditorialWorkflowMetrics } from '@/lib/editorial/workflow-analytics';

export interface EditorialDashboardViewProps {
  activeRecords: EditorialStateRecord[];
  goldStandardAudit: GoldStandardAuditRecord;
  metrics: EditorialWorkflowMetrics;
}

export function EditorialDashboardView({
  activeRecords = [],
  goldStandardAudit,
  metrics,
}: EditorialDashboardViewProps) {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
          Editorial Studio • Authenticated Mission Control
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
          Volume I Editorial Operating System
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748b' }}>
          Managing assignment queues, claim verification pipelines, and 7-Phase Gold Standard Reviews.
        </p>
      </header>

      {/* Workflow Analytics Metrics Bar */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Workflow Stories</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{metrics.totalStoriesTracked}</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg Lead Time</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{metrics.averageLeadTimeHours}h</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Evidence Completeness</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>{metrics.evidenceCompletenessPercentage}%</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bottleneck Stage</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', textTransform: 'capitalize' }}>
            {metrics.bottleneckStage.replace('_', ' ')}
          </div>
        </div>
      </section>

      {/* Gold Standard Review Audit Status */}
      <section style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          7-Phase Gold Standard Review Status (Chapter 1)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.875rem' }}>
          {Object.entries(goldStandardAudit.phases).map(([key, phase]) => (
            <div
              key={key}
              style={{
                padding: '0.875rem',
                backgroundColor: phase.passed ? '#f0fdf4' : '#fef2f2',
                borderRadius: '6px',
                border: phase.passed ? '1px solid #bbf7d0' : '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                  Phase {phase.phaseId}: {phase.phaseName}
                </div>
                <div style={{ fontSize: '0.75rem', color: phase.passed ? '#166534' : '#991b1b' }}>
                  {phase.passed ? '✓ PASSED' : '⚠️ PENDING REVIEW'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Assignment Queue Table */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          Active Assignment Queue
        </h2>

        <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Story ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Stage</th>
                <th style={{ padding: '0.75rem 1rem' }}>Owner</th>
                <th style={{ padding: '0.75rem 1rem' }}>Blocking Issues</th>
                <th style={{ padding: '0.75rem 1rem' }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {activeRecords.map((record) => (
                <tr key={record.storyId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{record.storyId}</td>
                  <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 600 }}>
                      {record.currentStage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{record.ownerId}</td>
                  <td style={{ padding: '0.75rem 1rem', color: record.blockingIssues.length > 0 ? '#dc2626' : '#059669' }}>
                    {record.blockingIssues.length} issues
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{record.updatedAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
