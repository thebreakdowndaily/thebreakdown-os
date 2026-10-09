'use client';

import React, { useEffect, useRef } from 'react';
import type { NewsroomDeskItem } from '@/services/intelligence/newsroom/desk-service';
import type { NewsroomTriageAction } from '@/types/newsroom-intelligence';

export interface PreservedDraftContext {
  action: NewsroomTriageAction;
  note?: string;
  assignedTo?: string;
  escalatedPriority?: string;
}

export interface ConflictResolutionModalProps {
  isOpen: boolean;
  item: NewsroomDeskItem;
  preservedDraft: PreservedDraftContext;
  onReload: () => Promise<void> | void;
  onClose: () => void;
  isLoadingLatest?: boolean;
  errorMessage?: string;
}

/**
 * ─── ConflictResolutionModal (Phase 4A Wave 3) ──────────────────────────────
 *
 * Intercepts HTTP 409 Concurrency Conflicts without data loss.
 * Guarantees that unsent editorial rationale notes are strictly preserved,
 * blocks blind automatic re-submission, and provides a clear manual reload path.
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §8.1
 * Invariant: Never automatically retry. Never erase the editor's draft.
 * Accessibility: WCAG AA/AAA compliant (role="dialog", focus trap, ESC listener).
 */
export function ConflictResolutionModal({
  isOpen,
  item,
  preservedDraft,
  onReload,
  onClose,
  isLoadingLatest = false,
  errorMessage,
}: ConflictResolutionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const reloadBtnRef = useRef<HTMLButtonElement>(null);

  // Focus management & ESC key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoadingLatest) {
        e.preventDefault();
        onClose();
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

    const timer = setTimeout(() => {
      if (reloadBtnRef.current) {
        reloadBtnRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, isLoadingLatest, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="conflict-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 'var(--spacing-4)',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoadingLatest) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-modal-title"
        aria-describedby="conflict-modal-desc"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #f59e0b',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Amber Alert Header */}
        <header
          style={{
            padding: 'var(--spacing-5) var(--spacing-6)',
            backgroundColor: '#fffbeb',
            borderBottom: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--spacing-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fcd34d',
                fontWeight: 800,
                fontSize: '18px',
              }}
            >
              ⚠
            </span>
            <div>
              <h2
                id="conflict-modal-title"
                style={{
                  margin: 0,
                  fontSize: 'var(--text-base)',
                  fontWeight: 800,
                  color: '#92400e',
                  letterSpacing: '-0.01em',
                }}
              >
                Concurrency Conflict (HTTP 409)
              </h2>
              <span style={{ fontSize: '11px', color: '#b45309' }}>
                Item was updated concurrently by another editor
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoadingLatest}
            aria-label="Close conflict notice"
            style={{
              background: 'none',
              border: 'none',
              cursor: isLoadingLatest ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              color: '#92400e',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            ✕
          </button>
        </header>

        {/* Modal Body */}
        <div style={{ padding: 'var(--spacing-6)' }}>
          {/* Diagnostic Context */}
          <p
            id="conflict-modal-desc"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.5,
              margin: '0 0 var(--spacing-4) 0',
            }}
          >
            While you were formulating your action, the server state for{' '}
            <strong>{item.title}</strong> advanced beyond local version{' '}
            <code>{`v${item.version}`}</code>. To safeguard institutional truth and prevent blind
            overwrites, your action was not applied.
          </p>

          {/* Preserved Draft Workspace */}
          <div
            style={{
              padding: 'var(--spacing-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--spacing-2)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>
                Preserved Editorial Draft
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ffffff',
                  color: 'var(--color-brand-600)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                {`Intended: ${preservedDraft.action}`}
              </span>
            </div>

            {preservedDraft.note ? (
              <div
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-default)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'monospace',
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}
              >
                {preservedDraft.note}
              </div>
            ) : (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                (No rationale note was entered with this action)
              </div>
            )}

            {preservedDraft.assignedTo && (
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>
                Target Assignee: <strong>{preservedDraft.assignedTo}</strong>
              </div>
            )}
            {preservedDraft.escalatedPriority && (
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Target Priority: <strong>{preservedDraft.escalatedPriority}</strong>
              </div>
            )}
          </div>

          {/* Operational Guidance */}
          <div
            style={{
              padding: 'var(--spacing-3)',
              backgroundColor: '#eff6ff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bfdbfe',
              fontSize: 'var(--text-xs)',
              color: '#1e40af',
              lineHeight: 1.5,
              marginBottom: 'var(--spacing-4)',
            }}
          >
            <strong>Next Step:</strong> Click <strong>Reload Latest Version</strong> below to refresh the server item. Your draft notes above have been preserved in memory and can be re-applied after inspecting the latest updates.
          </div>

          {errorMessage && (
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
                marginBottom: 'var(--spacing-4)',
              }}
            >
              ⚠ {errorMessage}
            </div>
          )}

          {/* Modal Footer Controls */}
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
              onClick={onClose}
              disabled={isLoadingLatest}
              style={{
                padding: '8px 16px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-default)',
                cursor: isLoadingLatest ? 'not-allowed' : 'pointer',
              }}
            >
              Keep Draft &amp; Close
            </button>

            <button
              ref={reloadBtnRef}
              type="button"
              onClick={onReload}
              disabled={isLoadingLatest}
              style={{
                padding: '8px 20px',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#d97706',
                color: '#ffffff',
                border: 'none',
                cursor: isLoadingLatest ? 'not-allowed' : 'pointer',
                opacity: isLoadingLatest ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 2px 0 rgba(217, 119, 6, 0.4)',
              }}
            >
              {isLoadingLatest && (
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
              <span>{isLoadingLatest ? 'Reloading...' : 'Reload Latest Version'}</span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
