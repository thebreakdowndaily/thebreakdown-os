'use client';

import React, { useState, useCallback } from 'react';
import type { NewsroomDeskItem, NewsroomDeskActionInput } from '@/services/intelligence/newsroom/desk-service';
import type { NewsroomTriageAction, EditorialPriority } from '@/types/newsroom-intelligence';
import { ActionConfirmationModal } from './ActionConfirmationModal';
import { ConflictResolutionModal, PreservedDraftContext } from './ConflictResolutionModal';

export interface ActionControlDockProps {
  item: NewsroomDeskItem;
  onActionSuccess?: (updatedItem: NewsroomDeskItem) => void;
  onActionError?: (error: Error, code?: number) => void;
  onReloadRequested?: (signalId: string) => Promise<NewsroomDeskItem | null> | void;
  apiEndpoint?: string;
  dispatchAction?: (
    payload: NewsroomDeskActionInput
  ) => Promise<{ success: boolean; item: NewsroomDeskItem; status?: number; error?: string }>;
  className?: string;
  disabled?: boolean;
}

/** Helper to generate a client-side UUID v4 for M5 mutationId tracking */
function generateMutationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'mut-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
}

interface ActionButtonConfig {
  label: string;
  icon: string;
  group: 'verify' | 'escalate' | 'workflow' | 'terminal';
  style: {
    bg: string;
    text: string;
    border: string;
    hoverBg: string;
  };
}

const ACTION_BUTTON_CONFIGS: Record<NewsroomTriageAction, ActionButtonConfig> = {
  VERIFY: {
    label: 'Verify Evidence',
    icon: '✓',
    group: 'verify',
    style: { bg: '#059669', text: '#ffffff', border: '#047857', hoverBg: '#047857' },
  },
  REVIEW: {
    label: 'Fact-Check Review',
    icon: '🔍',
    group: 'verify',
    style: { bg: '#0d9488', text: '#ffffff', border: '#0f766e', hoverBg: '#0f766e' },
  },
  ESCALATE: {
    label: 'Escalate Urgency',
    icon: '▲',
    group: 'escalate',
    style: { bg: '#2563eb', text: '#ffffff', border: '#1d4ed8', hoverBg: '#1d4ed8' },
  },
  PRIORITIZE: {
    label: 'Set Priority',
    icon: '⚑',
    group: 'escalate',
    style: { bg: '#4f46e5', text: '#ffffff', border: '#4338ca', hoverBg: '#4338ca' },
  },
  ASSIGN: {
    label: 'Assign Desk',
    icon: '👤',
    group: 'workflow',
    style: { bg: '#ffffff', text: '#4338ca', border: '#c7d2fe', hoverBg: '#eef2ff' },
  },
  RESOLVE: {
    label: 'Resolve Signal',
    icon: '✔',
    group: 'workflow',
    style: { bg: '#16a34a', text: '#ffffff', border: '#15803d', hoverBg: '#15803d' },
  },
  DISMISS: {
    label: 'Dismiss',
    icon: '✖',
    group: 'terminal',
    style: { bg: '#ffffff', text: '#dc2626', border: '#fecaca', hoverBg: '#fef2f2' },
  },
  IGNORE: {
    label: 'Ignore Cluster',
    icon: '⊘',
    group: 'terminal',
    style: { bg: '#ffffff', text: '#9f1239', border: '#fecdd3', hoverBg: '#fff1f2' },
  },
  NOT_RELEVANT: {
    label: 'Not Relevant',
    icon: '✕',
    group: 'terminal',
    style: { bg: '#ffffff', text: '#b91c1c', border: '#fecaca', hoverBg: '#fef2f2' },
  },
  MARK_RELEVANT: {
    label: 'Mark Relevant',
    icon: '★',
    group: 'workflow',
    style: { bg: '#ffffff', text: '#059669', border: '#a7f3d0', hoverBg: '#ecfdf5' },
  },
  PROMOTE_TO_RESEARCH: {
    label: 'Promote to Research',
    icon: '📚',
    group: 'workflow',
    style: { bg: '#ffffff', text: '#334155', border: '#cbd5e1', hoverBg: '#f8fafc' },
  },
  WATCH: {
    label: 'Watch',
    icon: '👁',
    group: 'workflow',
    style: { bg: '#ffffff', text: '#334155', border: '#cbd5e1', hoverBg: '#f8fafc' },
  },
  FOLLOW: {
    label: 'Follow',
    icon: '🔔',
    group: 'workflow',
    style: { bg: '#ffffff', text: '#334155', border: '#cbd5e1', hoverBg: '#f8fafc' },
  },
  SPLIT: {
    label: 'Split Cluster',
    icon: '⑂',
    group: 'terminal',
    style: { bg: '#ffffff', text: '#ea580c', border: '#fed7aa', hoverBg: '#fff7ed' },
  },
  MERGE: {
    label: 'Merge Signals',
    icon: '⊕',
    group: 'workflow',
    style: { bg: '#ffffff', text: '#ea580c', border: '#fed7aa', hoverBg: '#fff7ed' },
  },
};

/**
 * ─── ActionControlDock (Phase 4A Wave 3) ───────────────────────────────────
 *
 * Dedicated triage action dock that projects only authorized M5 actions.
 * Enforces strict safety rules:
 *   - Never renders PUBLISH
 *   - Enforces expectedVersion optimistic concurrency
 *   - Generates client-side mutationId for idempotent replays
 *   - Handles 401, 403, 404, 409 safely with draft preservation
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §7, §8
 * Accessibility: WCAG AA/AAA compliant (Semantic buttons, focus management).
 */
export function ActionControlDock({
  item,
  onActionSuccess,
  onActionError,
  onReloadRequested,
  apiEndpoint = '/api/v2/newsroom/desk',
  dispatchAction,
  className = '',
  disabled = false,
}: ActionControlDockProps) {
  // Modal visibility states
  const [activeModalAction, setActiveModalAction] = useState<NewsroomTriageAction | null>(null);
  const [conflictModalOpen, setConflictModalOpen] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isLoadingLatest, setIsLoadingLatest] = useState<boolean>(false);

  // Persistent draft state across concurrency conflicts or errors
  const [preservedDraft, setPreservedDraft] = useState<PreservedDraftContext>({
    action: 'VERIFY',
    note: '',
  });

  // User-facing feedback banners
  const [actionError, setActionError] = useState<{ message: string; code?: number } | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // 1. HARD RULE: Filter out PUBLISH if ever present
  const authorizedActions = (item.availableActions || []).filter(
    (action) => (action as string) !== 'PUBLISH'
  );

  // Open confirmation modal for selected action
  const handleActionClick = (action: NewsroomTriageAction) => {
    setActionError(null);
    setSuccessBanner(null);
    setActiveModalAction(action);
  };

  // Close confirmation modal
  const handleModalCancel = () => {
    setActiveModalAction(null);
  };

  // Primary Action Dispatcher
  const handleConfirmAction = async (params: {
    note?: string;
    assignedTo?: string;
    escalatedPriority?: EditorialPriority;
  }) => {
    if (!activeModalAction) return;

    const actionToRun = activeModalAction;
    setIsExecuting(true);
    setActionError(null);
    setSuccessBanner(null);

    // Save draft state in case of 409 or network failure
    setPreservedDraft({
      action: actionToRun,
      note: params.note,
      assignedTo: params.assignedTo,
      escalatedPriority: params.escalatedPriority,
    });

    const mutationId = generateMutationId();
    const payload: NewsroomDeskActionInput = {
      signalId: item.signalId,
      action: actionToRun,
      note: params.note,
      assignedTo: params.assignedTo,
      escalatedPriority: params.escalatedPriority,
      mutationId,
      expectedVersion: item.version,
    };

    try {
      let result: { success: boolean; item: NewsroomDeskItem; status?: number; error?: string };

      if (dispatchAction) {
        // Use injected dispatcher (for tests / server actions)
        result = await dispatchAction(payload);
      } else {
        // Default: invoke M5 API endpoint
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

        if (!res.ok) {
          result = {
            success: false,
            item: item,
            status: res.status,
            error: (data.error as string) || `Request failed with HTTP ${res.status}`,
          };
        } else {
          result = {
            success: true,
            item: data.item as NewsroomDeskItem,
            status: res.status,
          };
        }
      }

      setIsExecuting(false);

      if (result.success && result.item) {
        // ── Success Flow ────────────────────────────────────────────────────
        setActiveModalAction(null);
        setSuccessBanner(`Action ${actionToRun} applied successfully.`);
        // Clear draft on confirmed success
        setPreservedDraft({ action: 'VERIFY', note: '' });
        onActionSuccess?.(result.item);
      } else {
        // ── Error Flow ──────────────────────────────────────────────────────
        const status = result.status || 400;
        const errMessage = result.error || 'Action execution failed';

        if (status === 409 || errMessage.toLowerCase().includes('version conflict')) {
          // Concurrency Conflict: close action modal, trigger conflict modal, preserve draft
          setActiveModalAction(null);
          setConflictModalOpen(true);
          onActionError?.(new Error(errMessage), 409);
        } else if (status === 401) {
          setActionError({
            code: 401,
            message: 'Session unauthenticated or expired. Please sign in to perform triage.',
          });
          onActionError?.(new Error('Session unauthenticated'), 401);
        } else if (status === 403) {
          setActionError({
            code: 403,
            message: `Permission denied: Action ${actionToRun} is not permitted for your institutional role.`,
          });
          onActionError?.(new Error('Permission denied'), 403);
        } else if (status === 404) {
          setActionError({
            code: 404,
            message: 'Signal item not found or has been removed from the operational queue.',
          });
          onActionError?.(new Error('Signal not found'), 404);
        } else if (status === 429) {
          setActionError({
            code: 429,
            message: 'Rate limit exceeded. Please wait a moment before trying again.',
          });
          onActionError?.(new Error('Rate limit exceeded'), 429);
        } else if (status === 503 || errMessage.toLowerCase().includes('persistence')) {
          setActionError({
            code: 503,
            message: `Database Persistence Error: ${errMessage}. No changes were committed to the database. Your draft has been preserved.`,
          });
          onActionError?.(new Error(errMessage), 503);
        } else {

          setActionError({
            code: status,
            message: errMessage,
          });
          onActionError?.(new Error(errMessage), status);
        }
      }
    } catch (err: unknown) {
      setIsExecuting(false);
      const message = err instanceof Error ? err.message : 'Network communication failure';
      setActionError({
        message: `Network error: ${message}. Your editorial draft has been saved.`,
      });
      onActionError?.(err instanceof Error ? err : new Error(message), 500);
    }
  };

  // Reload handler triggered from ConflictResolutionModal
  const handleReloadConflict = useCallback(async () => {
    setIsLoadingLatest(true);
    setActionError(null);

    try {
      if (onReloadRequested) {
        await onReloadRequested(item.signalId);
      } else {
        // Default: GET /api/v2/newsroom/desk?signalId=...
        const res = await fetch(`${apiEndpoint}?signalId=${encodeURIComponent(item.signalId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.item) {
            onActionSuccess?.(data.item);
          }
        }
      }
      setIsLoadingLatest(false);
      setConflictModalOpen(false);
      setSuccessBanner('Latest server state loaded. You may now review and re-apply your action.');
    } catch (err: unknown) {
      setIsLoadingLatest(false);
      setActionError({
        message: 'Failed to reload latest item state. Please refresh the page.',
      });
    }
  }, [apiEndpoint, item.signalId, onActionSuccess, onReloadRequested]);

  return (
    <section
      className={`action-control-dock ${className}`}
      aria-label="Triage Action Controls"
      style={{
        padding: 'var(--spacing-4)',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* ── Operational Context Header ────────────────────────────────────── */}
      <div style={{ marginBottom: 'var(--spacing-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h3
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            Human Triage Action Dock
          </h3>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            v{item.version}
          </span>
        </div>

        {/* Required Human Action Prompt */}
        {item.requiredHumanAction && (
          <div
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: '#f0fdf4',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bbf7d0',
              fontSize: 'var(--text-xs)',
              color: '#166534',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              lineHeight: 1.4,
            }}
          >
            <span aria-hidden="true" style={{ fontWeight: 700 }}>🎯</span>
            <div>
              <strong>Action Directive:</strong> {item.requiredHumanAction}
            </div>
          </div>
        )}
      </div>

      {/* ── Feedback Banners ───────────────────────────────────────────────── */}
      {actionError && (
        <div
          role="alert"
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: '#fef2f2',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fecaca',
            fontSize: 'var(--text-xs)',
            color: '#b91c1c',
            fontWeight: 600,
            marginBottom: 'var(--spacing-3)',
          }}
        >
          ⚠ {actionError.message}
        </div>
      )}

      {successBanner && (
        <div
          role="status"
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            backgroundColor: '#ecfdf5',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #a7f3d0',
            fontSize: 'var(--text-xs)',
            color: '#065f46',
            fontWeight: 600,
            marginBottom: 'var(--spacing-3)',
          }}
        >
          ✓ {successBanner}
        </div>
      )}

      {/* ── Action Buttons Cluster ─────────────────────────────────────────── */}
      {authorizedActions.length === 0 ? (
        <div
          style={{
            padding: 'var(--spacing-4)',
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          No triage actions currently available for your institutional role on this signal.
        </div>
      ) : (
        <div
          role="toolbar"
          aria-label="Available triage actions"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-2)',
            alignItems: 'center',
          }}
        >
          {authorizedActions.map((action) => {
            const config = ACTION_BUTTON_CONFIGS[action] || {
              label: action.replace(/_/g, ' '),
              icon: '•',
              group: 'workflow',
              style: { bg: '#ffffff', text: '#334155', border: '#cbd5e1', hoverBg: '#f8fafc' },
            };

            const isHighPriorityAction = action === 'VERIFY' || action === 'ESCALATE';

            return (
              <button
                key={action}
                type="button"
                onClick={() => handleActionClick(action)}
                disabled={disabled || isExecuting}
                aria-label={`Execute action: ${config.label}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: isHighPriorityAction ? 800 : 600,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: config.style.bg,
                  color: config.style.text,
                  border: `1px solid ${config.style.border}`,
                  cursor: disabled || isExecuting ? 'not-allowed' : 'pointer',
                  opacity: disabled || isExecuting ? 0.6 : 1,
                  transition: 'background-color 0.15s ease, transform 0.05s ease',
                  boxShadow: isHighPriorityAction
                    ? '0 1px 2px 0 rgba(0, 0, 0, 0.15)'
                    : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                }}
              >
                <span aria-hidden="true" style={{ fontSize: '11px' }}>
                  {config.icon}
                </span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {/* 1. Action Confirmation Modal */}
      {activeModalAction && (
        <ActionConfirmationModal
          isOpen={Boolean(activeModalAction)}
          item={item}
          action={activeModalAction}
          onConfirm={handleConfirmAction}
          onCancel={handleModalCancel}
          isLoading={isExecuting}
          initialNote={preservedDraft.note}
          initialAssignedTo={preservedDraft.assignedTo}
          errorMessage={actionError?.message}
        />
      )}

      {/* 2. Concurrency Conflict Modal (409) */}
      <ConflictResolutionModal
        isOpen={conflictModalOpen}
        item={item}
        preservedDraft={preservedDraft}
        onReload={handleReloadConflict}
        onClose={() => setConflictModalOpen(false)}
        isLoadingLatest={isLoadingLatest}
      />
    </section>
  );
}
