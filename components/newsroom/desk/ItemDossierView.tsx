'use client';

import React from 'react';
import type { NewsroomDeskItem } from '@/services/intelligence/newsroom/desk-service';
import type {
  EditorialPriority,
  SignalLifecycleState,
  NewsroomTriageAction,
} from '@/types/newsroom-intelligence';
import { SourceHealthBadge } from './SourceHealthBadge';
import { MutationLineagePanel } from './MutationLineagePanel';
import { LatencyTracePanel } from './LatencyTracePanel';
import { AuditHistoryView } from './AuditHistoryView';
import { ActionControlDock, type ActionControlDockProps } from './ActionControlDock';

export interface ItemDossierViewProps {
  item: NewsroomDeskItem | null;
  onClose?: () => void;
  onAction?: (action: NewsroomTriageAction, item: NewsroomDeskItem) => void;
  showActionDock?: boolean;
  onActionSuccess?: (updatedItem: NewsroomDeskItem) => void;
  onActionError?: (error: Error, code?: number) => void;
  onReloadRequested?: (signalId: string) => Promise<NewsroomDeskItem | null> | void;
  dispatchAction?: ActionControlDockProps['dispatchAction'];
  className?: string;
}

const PRIORITY_BADGE_MAP: Record<
  EditorialPriority,
  { bg: string; text: string; border: string; icon: string; label: string }
> = {
  P0: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', icon: '!', label: 'P0 — CRITICAL' },
  P1: { bg: '#ffedd5', text: '#9a3412', border: '#fdba74', icon: '◆', label: 'P1 — IMPORTANT' },
  P2: { bg: '#fef9c3', text: '#854d0e', border: '#fde047', icon: '▲', label: 'P2 — SIGNIFICANT' },
  P3: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', icon: '●', label: 'P3 — WATCH' },
};

const WORKFLOW_STATE_MAP: Record<
  SignalLifecycleState,
  { bg: string; text: string; label: string }
> = {
  discovered: { bg: '#f1f5f9', text: '#334155', label: 'Discovered' },
  monitoring: { bg: '#eff6ff', text: '#1d4ed8', label: 'Monitoring' },
  escalated: { bg: '#fef3c7', text: '#b45309', label: 'Escalated' },
  confirmed: { bg: '#ecfdf5', text: '#047857', label: 'Confirmed' },
  contested: { bg: '#fefce8', text: '#854d0e', label: 'Contested' },
  resolved: { bg: '#f4f4f5', text: '#52525b', label: 'Resolved' },
  superseded: { bg: '#f1f5f9', text: '#64748b', label: 'Superseded' },
  retracted: { bg: '#fee2e2', text: '#b91c1c', label: 'Retracted' },
};

const TIER_LABEL_MAP: Record<string, string> = {
  t1: 'T1 Primary',
  t2: 'T2 Institutional',
  t3: 'T3 Media',
  t4: 'T4 Secondary',
  t5: 'T5 Unverified',
};

/**
 * ─── ItemDossierView (Phase 4A Wave 2) ──────────────────────────────────────
 *
 * Full contextual intelligence dossier for a selected signal.
 * Synthesizes institutional narrative, provenance, mutations, latency, source health, and audit trail.
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §6
 * Accessibility: WCAG AA/AAA compliant (Semantic landmarks, visible focus, color independence).
 */
export function ItemDossierView({
  item,
  onClose,
  onAction,
  showActionDock = false,
  onActionSuccess,
  onActionError,
  onReloadRequested,
  dispatchAction,
  className = '',
}: ItemDossierViewProps) {
  if (!item) {
    return (
      <aside
        className={`item-dossier-view empty ${className}`}
        aria-label="Intelligence Dossier: No Signal Selected"
        style={{
          padding: 'var(--spacing-8)',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '32px', marginBottom: 'var(--spacing-2)' }}>
          📋
        </span>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 var(--spacing-1) 0' }}>
          No Signal Selected
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', margin: 0, maxWidth: '320px', lineHeight: 1.45 }}>
          Select an item from the queue list to inspect its complete evidence dossier, document mutations, and latency trace.
        </p>
      </aside>
    );
  }

  const priorityStyle = PRIORITY_BADGE_MAP[item.priority] || PRIORITY_BADGE_MAP.P3;
  const stateStyle = WORKFLOW_STATE_MAP[item.workflowState] || WORKFLOW_STATE_MAP.discovered;
  const isPrimary = item.isPrimarySource;

  return (
    <aside
      className={`item-dossier-view active ${className}`}
      aria-label={`Intelligence Dossier: ${item.title}`}
      style={{
        padding: 'var(--spacing-6)',
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* ── Dossier Header ─────────────────────────────────────────────────── */}
      <header style={{ marginBottom: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border-default)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
          {/* Metadata Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 700,
                background: priorityStyle.bg,
                color: priorityStyle.text,
                border: `1px solid ${priorityStyle.border}`,
                letterSpacing: '0.04em',
              }}
            >
              <span aria-hidden="true">{priorityStyle.icon}</span>
              <span>{priorityStyle.label}</span>
            </span>

            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 600,
                background: stateStyle.bg,
                color: stateStyle.text,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              {stateStyle.label}
            </span>

            {item.beat && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                {`Beat: ${item.beat}`}
              </span>
            )}

            {isPrimary && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                }}
              >
                Primary Source
              </span>
            )}
          </div>

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dossier view"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: 'var(--color-text-muted)',
                padding: '4px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--spacing-2) 0',
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </h2>

        {/* Geographic Scope & Version */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
          {item.geographicScope.length > 0 && (
            <span>
              Geography: <strong>{item.geographicScope.join(', ')}</strong>
            </span>
          )}
          <span>
            Signal ID: <code style={{ fontSize: '11px' }}>{item.signalId}</code>
          </span>
          <span>
            {`Version: v${item.version}`}
          </span>
          {item.assignedTo && (
            <span>
              Assigned to: <strong>{item.assignedTo}</strong>
            </span>
          )}
        </div>
      </header>

      {/* ── Section 1: Institutional Narrative & Context ──────────────────── */}
      <section aria-labelledby="dossier-narrative-title" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3 id="dossier-narrative-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 var(--spacing-2) 0' }}>
          Executive Synthesis
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: '0 0 var(--spacing-3) 0' }}>
          {(item.summary || '').replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim()}
        </p>

        {item.whyItMatters && (
          <div
            style={{
              padding: 'var(--spacing-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-brand-600)',
              marginBottom: 'var(--spacing-3)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.5,
              color: 'var(--color-text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>Why It Matters:</strong>{' '}
            {item.whyItMatters}
          </div>
        )}

        {item.requiredHumanAction && (
          <div
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              background: '#fef3c7',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fde68a',
              fontSize: 'var(--text-xs)',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span aria-hidden="true" style={{ fontWeight: 700 }}>→</span>
            <span>
              <strong>Required Editorial Action:</strong> {item.requiredHumanAction}
            </span>
          </div>
        )}
      </section>

      {/* ── Section 2: Source Provenance & Evidence Metrics ───────────────── */}
      <section aria-labelledby="dossier-provenance-title" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h3 id="dossier-provenance-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 var(--spacing-2) 0' }}>
          Source Provenance &amp; Verification Evidence
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-3)',
          }}
        >
          {/* Source Card */}
          <div
            style={{
              padding: 'var(--spacing-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Originating Feed
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
              {item.sourceName || item.sourceId || 'Institutional Feed'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {`Authority: ${TIER_LABEL_MAP[item.sourceAuthority] || item.sourceAuthority.toUpperCase()} (${item.sourceAuthority === 't1' ? 'Official Gazette / Judicial' : 'Secondary Feed'})`}
            </div>
            {item.canonicalUrl && (
              <a
                href={item.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  color: 'var(--color-brand-600)',
                  marginTop: '6px',
                  wordBreak: 'break-all',
                }}
              >
                Inspect Official Document ↗
              </a>
            )}
          </div>

          {/* Evidence Metrics Meter */}
          <div
            style={{
              padding: 'var(--spacing-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Epistemic Strength
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: '4px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Confidence</span>
                <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>{`${item.confidence}%`}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Evidence</span>
                <strong style={{ fontSize: 'var(--text-base)', color: '#047857' }}>{`${item.evidenceStrength}%`}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Uncertainty</span>
                <strong style={{ fontSize: 'var(--text-base)', color: item.uncertainty > 50 ? '#b91c1c' : 'var(--color-text-secondary)' }}>{`${item.uncertainty}%`}</strong>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              {`Observations: ${item.observationCount} · Independent Sources: ${item.independentSourceCount}`}
            </div>
          </div>
        </div>

        {/* Source Health Badge Component (M4) */}
        <SourceHealthBadge
          sourceHealth={item.sourceHealthContext}
          sourceName={item.sourceName}
          sourceId={item.sourceId}
        />
      </section>

      {/* ── Section 3: Document Mutation Lineage (M2) ────────────────────── */}
      <MutationLineagePanel
        mutationContext={item.mutationContext}
        changeType={item.changeType}
        affectedStoryIds={item.affectedStoryIds}
        canonicalUrl={item.canonicalUrl}
      />

      {/* ── Section 4: Precision Latency Trace (M3) ───────────────────────── */}
      <LatencyTracePanel
        timestamps={item.timestamps}
        latencyContext={item.latencyContext}
      />

      {/* ── Section 5: Contradictions & Related Stories ───────────────────── */}
      {(item.hasContradictions || item.relatedStoryId || item.affectedStoryIds.length > 0) && (
        <section aria-labelledby="dossier-relations-title" style={{ marginBottom: 'var(--spacing-4)' }}>
          <h3 id="dossier-relations-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 var(--spacing-2) 0' }}>
            Cross-Story &amp; Contradiction Links
          </h3>

          {item.hasContradictions && (
            <div
              style={{
                padding: 'var(--spacing-3)',
                background: '#fefce8',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #fde047',
                fontSize: 'var(--text-xs)',
                color: '#854d0e',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              <strong>⚡ Contradiction Detected:</strong> This signal conflicts with {item.contradictionIds.length} other active signal(s):{' '}
              <code>{item.contradictionIds.join(', ')}</code>. Fact-checker corroboration required.
            </div>
          )}

          {item.relatedStoryId && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>
              Linked Canonical Story: <strong>{item.relatedStoryId}</strong>
            </div>
          )}
        </section>
      )}

      {/* ── Section 6: Immutable Audit History Ledger ─────────────────────── */}
      <AuditHistoryView auditTrail={item.auditTrail} signalId={item.signalId} />

      {/* ── Section 7: Available Actions Dock ─────────────────────────────── */}
      {showActionDock ? (
        <footer style={{ paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border-default)' }}>
          <ActionControlDock
            item={item}
            onActionSuccess={onActionSuccess}
            onActionError={onActionError}
            onReloadRequested={onReloadRequested}
            dispatchAction={dispatchAction}
          />
        </footer>
      ) : item.availableActions.length > 0 && (
        <footer
          style={{
            paddingTop: 'var(--spacing-4)',
            borderTop: '1px solid var(--color-border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-2)',
          }}
        >
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Permitted Human Actions:
          </span>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            {item.availableActions.map((action) => {
              const isHigh = action === 'VERIFY' || action === 'ESCALATE';
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => onAction?.(action, item)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    background: isHigh ? 'var(--color-brand-600)' : 'var(--color-bg-secondary)',
                    color: isHigh ? '#ffffff' : 'var(--color-text-primary)',
                    border: isHigh ? 'none' : '1px solid var(--color-border-default)',
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                  }}
                >
                  {action.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </footer>
      )}
    </aside>
  );
}
