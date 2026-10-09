'use client';

import React from 'react';
import type { NewsroomAuditLogRecord } from '@/types/newsroom-intelligence';

export interface AuditHistoryViewProps {
  auditTrail: readonly NewsroomAuditLogRecord[];
  signalId?: string;
  className?: string;
}

/**
 * ─── AuditHistoryView (Phase 4A Wave 2) ─────────────────────────────────────
 *
 * Read-only chronological ledger of all triage actions and state transitions.
 * Directly consumes the immutable audit trail from NewsroomAuditService.
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §12
 * Accessibility: WCAG AA/AAA compliant (Semantic list, timeline structure).
 */
export function AuditHistoryView({
  auditTrail,
  signalId,
  className = '',
}: AuditHistoryViewProps) {
  if (!auditTrail || auditTrail.length === 0) {
    return (
      <section
        className={`audit-history-view empty ${className}`}
        aria-labelledby="audit-history-title"
        style={{
          padding: 'var(--spacing-4)',
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        <h3
          id="audit-history-title"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--spacing-2) 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span aria-hidden="true">📜</span>
          <span>Immutable Audit Ledger</span>
        </h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
          No audit log events recorded yet for this signal.
        </p>
      </section>
    );
  }

  return (
    <section
      className={`audit-history-view ${className}`}
      aria-labelledby="audit-history-title"
      style={{
        padding: 'var(--spacing-4)',
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        marginBottom: 'var(--spacing-4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
        <h3
          id="audit-history-title"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span aria-hidden="true">📜</span>
          <span>{`Immutable Audit Ledger (${auditTrail.length} Event${auditTrail.length > 1 ? 's' : ''})`}</span>
        </h3>
        {signalId && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
            {`Signal: ${signalId}`}
          </span>
        )}
      </div>

      <ol
        role="list"
        aria-label="Audit history event trail"
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-3)',
        }}
      >
        {auditTrail.map((entry, idx) => {
          const actionFormatted = typeof entry.action === 'string' ? entry.action.replace(/_/g, ' ') : 'ACTION';
          const mutationId = (entry.metadata as any)?.mutationId;

          return (
            <li
              key={entry.id || `audit-${idx}`}
              style={{
                padding: 'var(--spacing-3)',
                background: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
                borderLeft: '3px solid var(--color-brand-600)',
              }}
            >
              {/* Event Header: Actor, Role, Time */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-2)',
                  marginBottom: 'var(--spacing-1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {entry.actorName || entry.actorId}
                  </span>
                  {entry.actorRole && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#ffffff',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border-subtle)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {entry.actorRole}
                    </span>
                  )}
                </div>

                <time
                  dateTime={entry.timestamp}
                  style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}
                >
                  {new Date(entry.timestamp).toLocaleString()}
                </time>
              </div>

              {/* Action and Transition */}
              <div style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--spacing-1)' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-brand-600)' }}>
                  {actionFormatted}
                </span>
                {entry.previousState && entry.newState && (
                  <span style={{ color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                    {`(${entry.previousState} ──► ${entry.newState})`}
                  </span>
                )}
              </div>

              {/* Rationale / Note */}
              {entry.reason && (
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    fontStyle: 'italic',
                    marginTop: '2px',
                  }}
                >
                  {`Note: "${entry.reason}"`}
                </div>
              )}

              {/* Correlation / Mutation ID */}
              {mutationId && (
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                  {`Correlation: ${mutationId}`}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
