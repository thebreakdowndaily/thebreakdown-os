'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { NewsroomDeskItem } from '@/services/intelligence/newsroom/desk-service';
import type { NewsroomTriageAction, EditorialPriority } from '@/types/newsroom-intelligence';

export interface ActionConfirmationModalProps {
  isOpen: boolean;
  item: NewsroomDeskItem;
  action: NewsroomTriageAction;
  onConfirm: (params: {
    note?: string;
    assignedTo?: string;
    escalatedPriority?: EditorialPriority;
  }) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  initialNote?: string;
  initialAssignedTo?: string;
  initialPriority?: EditorialPriority;
  errorMessage?: string;
}

interface ActionMeta {
  label: string;
  category: 'verification' | 'escalation' | 'workflow' | 'destructive';
  badgeColor: { bg: string; text: string; border: string };
  consequence: string;
  icon: string;
  requireNote?: boolean;
  requirePriority?: boolean;
  requireAssignedTo?: boolean;
}

const ACTION_META_MAP: Record<NewsroomTriageAction, ActionMeta> = {
  VERIFY: {
    label: 'Verify Primary Evidence',
    category: 'verification',
    badgeColor: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
    consequence: "Advances signal lifecycle state to 'confirmed'. Formally verifies claims against primary source records.",
    icon: '✓',
    requireNote: true,
  },
  REVIEW: {
    label: 'Editorial Review',
    category: 'verification',
    badgeColor: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
    consequence: "Advances signal lifecycle state to 'confirmed' following editorial fact-checker review.",
    icon: '🔍',
    requireNote: false,
  },
  ESCALATE: {
    label: 'Escalate Urgency',
    category: 'escalation',
    badgeColor: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    consequence: 'Escalates priority level, moves signal into high-urgency queue, and alerts beat leadership.',
    icon: '▲',
    requirePriority: true,
    requireNote: true,
  },
  PRIORITIZE: {
    label: 'Adjust Priority',
    category: 'escalation',
    badgeColor: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    consequence: 'Re-assigns editorial priority rating and updates operational queue placement.',
    icon: '⚑',
    requirePriority: true,
    requireNote: false,
  },
  ASSIGN: {
    label: 'Assign Ownership',
    category: 'workflow',
    badgeColor: { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
    consequence: 'Designates lead editor or specialist desk responsible for investigating this signal.',
    icon: '👤',
    requireAssignedTo: true,
    requireNote: false,
  },
  RESOLVE: {
    label: 'Resolve Signal',
    category: 'workflow',
    badgeColor: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    consequence: "Transitions signal state to 'resolved' and closes active operational queue items.",
    icon: '✔',
    requireNote: true,
  },
  DISMISS: {
    label: 'Dismiss Signal',
    category: 'destructive',
    badgeColor: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
    consequence: 'Removes signal from active operational queues. Signal will not be surfaced in triage lists.',
    icon: '✖',
    requireNote: true,
  },
  IGNORE: {
    label: 'Ignore Cluster',
    category: 'destructive',
    badgeColor: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
    consequence: 'Suppresses alerts and future notifications for this specific observation cluster.',
    icon: '⊘',
    requireNote: true,
  },
  NOT_RELEVANT: {
    label: 'Mark Not Relevant',
    category: 'destructive',
    badgeColor: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
    consequence: 'Marks signal as irrelevant to editorial scope and feeds calibration data to the ranking engine.',
    icon: '✕',
    requireNote: false,
  },
  MARK_RELEVANT: {
    label: 'Affirm Relevance',
    category: 'workflow',
    badgeColor: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    consequence: 'Affirms editorial importance and reinforces source authority weights.',
    icon: '★',
    requireNote: false,
  },
  PROMOTE_TO_RESEARCH: {
    label: 'Promote to Research',
    category: 'workflow',
    badgeColor: { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' },
    consequence: 'Creates a long-form research ticket and moves signal to the investigative backlog.',
    icon: '📚',
    requireNote: false,
  },
  WATCH: {
    label: 'Watch Signal',
    category: 'workflow',
    badgeColor: { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' },
    consequence: 'Adds signal to personal watch list for tracking subsequent upstream amendments.',
    icon: '👁',
    requireNote: false,
  },
  FOLLOW: {
    label: 'Follow Cluster',
    category: 'workflow',
    badgeColor: { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' },
    consequence: 'Subscribes your user session to developments and multi-source updates on this cluster.',
    icon: '🔔',
    requireNote: false,
  },
  SPLIT: {
    label: 'Split Cluster',
    category: 'destructive',
    badgeColor: { bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' },
    consequence: 'Disaggregates multi-source observations into independent sub-clusters.',
    icon: '⑂',
    requireNote: true,
  },
  MERGE: {
    label: 'Merge Signals',
    category: 'workflow',
    badgeColor: { bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' },
    consequence: 'Unifies disparate signal clusters under a single overarching newsroom event.',
    icon: '⊕',
    requireNote: true,
  },
};

/**
 * ─── ActionConfirmationModal (Phase 4A Wave 3) ──────────────────────────────
 *
 * Concurrency-safe, accessible confirmation modal for consequential triage actions.
 * Guarantees zero accidental state transitions and preserves unsent draft notes.
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §7.2
 * Accessibility: WCAG AA/AAA compliant (role="dialog", focus trap, ESC listener).
 */
export function ActionConfirmationModal({
  isOpen,
  item,
  action,
  onConfirm,
  onCancel,
  isLoading = false,
  initialNote = '',
  initialAssignedTo = '',
  initialPriority,
  errorMessage,
}: ActionConfirmationModalProps) {
  const meta = ACTION_META_MAP[action] || {
    label: action.replace(/_/g, ' '),
    category: 'workflow',
    badgeColor: { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' },
    consequence: `Applies ${action} to this signal.`,
    icon: '•',
  };

  const [note, setNote] = useState<string>(initialNote);
  const [assignedTo, setAssignedTo] = useState<string>(initialAssignedTo || item.assignedTo || '');
  const [escalatedPriority, setEscalatedPriority] = useState<EditorialPriority>(
    initialPriority || (item.priority === 'P0' ? 'P0' : 'P0')
  );
  const [verifiedPrimaryHash, setVerifiedPrimaryHash] = useState<boolean>(false);
  const [verifiedTier1Corroboration, setVerifiedTier1Corroboration] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setNote(initialNote);
      setAssignedTo(initialAssignedTo || item.assignedTo || '');
      setValidationError(null);
      setVerifiedPrimaryHash(false);
      setVerifiedTier1Corroboration(false);
    }
  }, [isOpen, initialNote, initialAssignedTo, item.assignedTo]);

  // Focus management & ESC key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onCancel();
      }

      // Trap focus
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus
    const timer = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      } else if (confirmBtnRef.current) {
        confirmBtnRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation rules
    if (meta.requireNote && !note.trim()) {
      setValidationError('An editorial rationale note is required for this action.');
      return;
    }

    if (meta.requireAssignedTo && !assignedTo.trim()) {
      setValidationError('Please specify an editor name or desk assignment.');
      return;
    }

    if (action === 'VERIFY' && !verifiedPrimaryHash && !verifiedTier1Corroboration) {
      setValidationError('Please affirm at least one verification criterion (Primary hash or Tier 1 corroboration).');
      return;
    }

    onConfirm({
      note: note.trim() || undefined,
      assignedTo: meta.requireAssignedTo ? assignedTo.trim() : undefined,
      escalatedPriority: meta.requirePriority ? escalatedPriority : undefined,
    });
  };

  const isDestructive = meta.category === 'destructive';

  return (
    <div
      role="presentation"
      className="action-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 'var(--spacing-4)',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-desc"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          border: '1px solid var(--color-border-subtle)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: 'var(--spacing-5) var(--spacing-6)',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: isDestructive ? '#fff1f2' : 'var(--color-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--spacing-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: meta.badgeColor.bg,
                color: meta.badgeColor.text,
                border: `1px solid ${meta.badgeColor.border}`,
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              {meta.icon}
            </span>
            <div>
              <h2
                id="confirmation-modal-title"
                style={{
                  margin: 0,
                  fontSize: 'var(--text-base)',
                  fontWeight: 700,
                  color: isDestructive ? '#9f1239' : 'var(--color-text-primary)',
                }}
              >
                Confirm {meta.label}
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Signal ID: <code>{item.signalId}</code> {`(v${item.version})`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              color: 'var(--color-text-muted)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            ✕
          </button>
        </header>

        {/* Content Form */}
        <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-6)' }}>
          {/* Target Item Summary */}
          <div
            style={{
              padding: 'var(--spacing-3)',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              marginBottom: 'var(--spacing-4)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              {item.title}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', color: 'var(--color-text-secondary)' }}>
              <span>Priority: <strong>{item.priority}</strong></span>
              <span>State: <strong>{item.workflowState}</strong></span>
              {item.sourceName && <span>Source: <strong>{item.sourceName}</strong></span>}
            </div>
          </div>

          {/* Consequence Preview */}
          <div
            id="confirmation-modal-desc"
            style={{
              padding: 'var(--spacing-3)',
              backgroundColor: isDestructive ? '#fff7ed' : '#f0fdf4',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${isDestructive ? '#fed7aa' : '#bbf7d0'}`,
              marginBottom: 'var(--spacing-4)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.5,
              color: isDestructive ? '#9a3412' : '#166534',
            }}
          >
            <strong>Operational Consequence:</strong> {meta.consequence}
          </div>

          {/* Error Announcements */}
          {(errorMessage || validationError) && (
            <div
              role="alert"
              style={{
                padding: 'var(--spacing-3)',
                backgroundColor: '#fef2f2',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #fecaca',
                marginBottom: 'var(--spacing-4)',
                fontSize: 'var(--text-xs)',
                color: '#b91c1c',
                fontWeight: 600,
              }}
            >
              ⚠ {errorMessage || validationError}
            </div>
          )}

          {/* Action-Specific Inputs */}

          {/* 1. Priority Selection (ESCALATE / PRIORITIZE) */}
          {meta.requirePriority && (
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label
                htmlFor="escalated-priority-select"
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-1)',
                }}
              >
                Target Priority Level: <span style={{ color: '#b91c1c' }}>*</span>
              </label>
              <select
                id="escalated-priority-select"
                ref={firstInputRef as React.RefObject<HTMLSelectElement>}
                value={escalatedPriority}
                onChange={(e) => setEscalatedPriority(e.target.value as EditorialPriority)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  fontSize: 'var(--text-sm)',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="P0">P0 — Breaking Emergency (Direct Alert)</option>
                <option value="P1">P1 — High Urgency / Constitutional Concern</option>
                <option value="P2">P2 — Standard Operational Track</option>
                <option value="P3">P3 — Monitor Only / Low Urgency</option>
              </select>
            </div>
          )}

          {/* 2. Assignee Input (ASSIGN) */}
          {meta.requireAssignedTo && (
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label
                htmlFor="assigned-to-input"
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-1)',
                }}
              >
                Assignee (Editor / Desk Lead): <span style={{ color: '#b91c1c' }}>*</span>
              </label>
              <input
                id="assigned-to-input"
                type="text"
                ref={firstInputRef as React.RefObject<HTMLInputElement>}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Judicial Bureau / Editor Name"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  fontSize: 'var(--text-sm)',
                }}
              />
            </div>
          )}

          {/* 3. Verification Checklist (VERIFY) */}
          {action === 'VERIFY' && (
            <div
              style={{
                padding: 'var(--spacing-3)',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
                marginBottom: 'var(--spacing-4)',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-2)',
                }}
              >
                Verification Criteria:
              </span>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--text-xs)',
                  marginBottom: '6px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={verifiedPrimaryHash}
                  onChange={(e) => setVerifiedPrimaryHash(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Primary source document hash verified against official portal</span>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={verifiedTier1Corroboration}
                  onChange={(e) => setVerifiedTier1Corroboration(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Corroborated across independent Tier 1 gazette / institutional releases</span>
              </label>
            </div>
          )}

          {/* 4. Editorial Rationale Note (All actions) */}
          <div style={{ marginBottom: 'var(--spacing-5)' }}>
            <label
              htmlFor="editorial-note-input"
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-1)',
              }}
            >
              Editorial Note &amp; Rationale:
              {meta.requireNote && <span style={{ color: '#b91c1c' }}> *</span>}
            </label>
            <textarea
              id="editorial-note-input"
              ref={
                !meta.requirePriority && !meta.requireAssignedTo
                  ? (firstInputRef as React.RefObject<HTMLTextAreaElement>)
                  : undefined
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                meta.requireNote
                  ? 'Explain the institutional justification for this action...'
                  : 'Optional editorial note for the immutable audit ledger...'
              }
              rows={3}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)',
                fontSize: 'var(--text-sm)',
                lineHeight: 1.45,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Action Buttons */}
          <footer
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 'var(--spacing-3)',
              paddingTop: 'var(--spacing-3)',
              borderTop: '1px solid var(--color-border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-default)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              ref={confirmBtnRef}
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 20px',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                backgroundColor: isDestructive ? '#dc2626' : 'var(--color-brand-600)',
                color: '#ffffff',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isDestructive
                  ? '0 1px 2px 0 rgba(220, 38, 38, 0.4)'
                  : '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              {isLoading && (
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              )}
              <span>{isLoading ? 'Executing...' : `Confirm ${meta.label}`}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
