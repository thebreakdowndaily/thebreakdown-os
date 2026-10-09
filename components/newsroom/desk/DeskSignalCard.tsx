'use client';

import React from 'react';
import type { NewsroomDeskItem } from '@/services/intelligence/newsroom/desk-service';
import type {
  EditorialPriority,
  SignalLifecycleState,
  NewsroomTriageAction,
} from '@/types/newsroom-intelligence';

export interface DeskSignalCardProps {
  item: NewsroomDeskItem;
  isSelected?: boolean;
  onClick?: (item: NewsroomDeskItem) => void;
  onAction?: (action: NewsroomTriageAction, item: NewsroomDeskItem) => void;
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
 * ─── DeskSignalCard (Phase 4A Wave 1) ───────────────────────────────────────
 *
 * Canonical card representing a single newsroom intelligence signal in the queue.
 * Consumes the validated M5 NewsroomDeskItem contract.
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §5
 * Accessibility: WCAG AA/AAA compliant (role="article", keyboard focus, color independence).
 */
export function DeskSignalCard({
  item,
  isSelected = false,
  onClick,
  onAction,
  className = '',
}: DeskSignalCardProps) {
  const priorityStyle = PRIORITY_BADGE_MAP[item.priority] || PRIORITY_BADGE_MAP.P3;
  const stateStyle = WORKFLOW_STATE_MAP[item.workflowState] || WORKFLOW_STATE_MAP.discovered;
  const isMutation = item.changeType === 'changed' || Boolean(item.mutationContext?.isMutation);
  const revNumber = item.mutationContext?.revisionNumber || 2;
  const tierLabel = TIER_LABEL_MAP[item.sourceAuthority] || item.sourceAuthority.toUpperCase();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(item);
    }
  };

  return (
    <article
      className={`desk-signal-card ${isSelected ? 'selected' : ''} ${className}`}
      role="article"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`Signal ${item.title} (Priority: ${item.priority}, Status: ${item.workflowState})`}
      onClick={() => onClick?.(item)}
      onKeyDown={handleKeyDown}
      style={{
        padding: 'var(--spacing-4)',
        background: isSelected ? 'var(--color-bg-primary)' : 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${isSelected ? 'var(--color-brand-600)' : 'var(--color-border-default)'}`,
        boxShadow: isSelected
          ? '0 0 0 2px var(--color-brand-600), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        marginBottom: 'var(--spacing-3)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        outline: 'none',
      }}
    >
      {/* ── Top Status & Classification Row ───────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Priority Pill */}
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

          {/* Workflow State Pill */}
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              background: stateStyle.bg,
              color: stateStyle.text,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            <span className="sr-only">Workflow State: </span>
            {stateStyle.label}
          </span>

          {/* Mutation Flag (Phase 3B-M2) */}
          {isMutation && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 700,
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
              }}
            >
              <span aria-hidden="true">⟳</span>
              <span>{`REV #${revNumber} CHANGED`}</span>
            </span>
          )}

          {/* Contradiction Flag */}
          {item.hasContradictions && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 700,
                background: '#fefce8',
                color: '#854d0e',
                border: '1px solid #fde047',
              }}
            >
              <span aria-hidden="true">⚡</span>
              <span>CONTRADICTION</span>
            </span>
          )}
        </div>

        {/* Source Provenance & Tier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            {tierLabel}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {`v${item.version}`}
          </span>
        </div>
      </div>

      {/* ── Title & Summary ──────────────────────────────────────────────── */}
      <h3
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: '0 0 var(--spacing-2) 0',
          lineHeight: 1.35,
        }}
      >
        {item.title}
      </h3>

      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          margin: '0 0 var(--spacing-3) 0',
          lineHeight: 1.5,
        }}
      >
        {(item.summary || '').replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim()}
      </p>

      {/* ── Why It Matters Callout ───────────────────────────────────────── */}
      {item.whyItMatters && (
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-brand-600)',
            marginBottom: 'var(--spacing-3)',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.45,
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-text-primary)' }}>Why it matters:</strong>{' '}
          {item.whyItMatters}
        </div>
      )}

      {/* ── Mutation Diff Summary (if present) ───────────────────────────── */}
      {isMutation && item.mutationContext?.diffSummary && (
        <div
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            background: '#fffbeb',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #fef3c7',
            marginBottom: 'var(--spacing-3)',
            fontSize: 'var(--text-xs)',
            color: '#78350f',
          }}
        >
          <strong>Mutation Diff:</strong> {item.mutationContext.diffSummary}
        </div>
      )}

      {/* ── Context & Metadata Badges ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--spacing-2)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        {/* Beat Tag */}
        {item.beat && (
          <span
            style={{
              padding: '1px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
            }}
          >
            Beat: <strong>{item.beat}</strong>
          </span>
        )}

        {/* Geographic Scope Tag */}
        {item.geographicScope.length > 0 && (
          <span
            style={{
              padding: '1px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
            }}
          >
            Geo: <strong>{item.geographicScope.join(', ')}</strong>
          </span>
        )}

        {/* Source Name */}
        {item.sourceName && (
          <span>
            Source: <strong>{item.sourceName}</strong>
          </span>
        )}

        {/* Confidence & Evidence Metrics */}
        <span>
          Confidence: <strong>{`${item.confidence}%`}</strong>
        </span>
        <span>
          Evidence: <strong>{`${item.evidenceStrength}%`}</strong>
        </span>

        {/* Downstream Impact Alert */}
        {item.affectedStoryIds.length > 0 && (
          <span style={{ color: '#b45309', fontWeight: 600 }}>
            Affects {item.affectedStoryIds.length} story(ies)
          </span>
        )}

        {/* Assigned Editor */}
        {item.assignedTo && (
          <span>
            Assigned: <strong>{item.assignedTo}</strong>
          </span>
        )}
      </div>

      {/* ── Required Human Action Box ────────────────────────────────────── */}
      {item.requiredHumanAction && (
        <div
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span aria-hidden="true" style={{ color: 'var(--color-brand-600)', fontWeight: 700 }}>
            →
          </span>
          <span>
            <strong>Required Action:</strong> {item.requiredHumanAction}
          </span>
        </div>
      )}

      {/* Quick Actions removed to eliminate duplicate action surface. All actions are now centralized in the Dossier/Action Dock. */}
    </article>
  );
}
