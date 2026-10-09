'use client';

import React from 'react';

export interface MutationLineagePanelProps {
  mutationContext?: {
    isMutation: boolean;
    mutationId?: string;
    previousObservationId?: string;
    previousContentHash?: string;
    newContentHash?: string;
    diffSummary?: string;
    revisionNumber?: number;
  } | null;
  changeType?: 'new' | 'changed' | 'unchanged';
  affectedStoryIds?: string[];
  canonicalUrl?: string;
  className?: string;
}

/**
 * ─── MutationLineagePanel (Phase 4A Wave 2) ─────────────────────────────────
 *
 * Read-only presentation of document mutation lineage and revision diffs (Phase 3B-M2).
 * Strictly preserves distinction between previous and current document states.
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §10
 * Accessibility: WCAG AA/AAA compliant (Semantic sections, ARIA labels for hashes).
 */
export function MutationLineagePanel({
  mutationContext,
  changeType,
  affectedStoryIds = [],
  canonicalUrl,
  className = '',
}: MutationLineagePanelProps) {
  const isMutation = Boolean(mutationContext?.isMutation) || changeType === 'changed';

  if (!isMutation || !mutationContext) {
    return (
      <section
        className={`mutation-lineage-panel clean ${className}`}
        aria-labelledby="mutation-lineage-title"
        style={{
          padding: 'var(--spacing-4)',
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        <h3
          id="mutation-lineage-title"
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
          <span aria-hidden="true">📄</span>
          <span>Document Lineage &amp; Revisions</span>
        </h3>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          No upstream document mutation recorded. This signal represents the original publication state.
        </p>
      </section>
    );
  }

  const { revisionNumber = 2, previousContentHash, newContentHash, diffSummary, mutationId, previousObservationId } = mutationContext;

  return (
    <section
      className={`mutation-lineage-panel modified ${className}`}
      aria-labelledby="mutation-lineage-title"
      style={{
        padding: 'var(--spacing-4)',
        background: '#fffdfa',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #fde68a',
        marginBottom: 'var(--spacing-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        <h3
          id="mutation-lineage-title"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            color: '#92400e',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span aria-hidden="true">⚠</span>
          <span>{`Document Mutation Detected — Revision #${revisionNumber}`}</span>
        </h3>

        {mutationId && (
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: '#fef3c7',
              color: '#78350f',
              border: '1px solid #fde68a',
            }}
          >
            {`ID: ${mutationId}`}
          </span>
        )}
      </div>

      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: '#78350f',
          marginTop: 0,
          marginBottom: 'var(--spacing-3)',
          lineHeight: 1.45,
        }}
      >
        The upstream publisher updated the contents of this document at the same canonical URL post-publication.
      </p>

      {/* Revision Diff Summary Box */}
      {diffSummary && (
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fde68a',
            marginBottom: 'var(--spacing-3)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--spacing-1)' }}>
            Diff Summary
          </div>
          <blockquote
            style={{
              margin: 0,
              fontSize: 'var(--text-xs)',
              lineHeight: 1.5,
              color: 'var(--color-text-primary)',
              fontStyle: 'italic',
            }}
          >
            {`"${diffSummary}"`}
          </blockquote>
        </div>
      )}

      {/* Hash Lineage Comparison Table */}
      <div
        role="region"
        aria-label="Content Hash Lineage Comparison"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        {/* Previous Revision State */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            {`Previous Revision (#${revisionNumber - 1})`}
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
            <span className="sr-only">Previous content hash: </span>
            {previousContentHash ? `${previousContentHash.slice(0, 16)}...` : 'Not recorded'}
          </div>
          {previousObservationId && (
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {`Obs: ${previousObservationId}`}
            </div>
          )}
        </div>

        {/* Current Revision State */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: '#f0fdf4',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #bbf7d0',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
            {`Current Revision (#${revisionNumber})`}
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#14532d', wordBreak: 'break-all' }}>
            <span className="sr-only">New content hash: </span>
            {newContentHash ? `${newContentHash.slice(0, 16)}...` : 'Not recorded'}
          </div>
          <div style={{ fontSize: '10px', color: '#166534', marginTop: '4px', fontWeight: 600 }}>
            Active Canonical Version
          </div>
        </div>
      </div>

      {/* Downstream Impact Alert & Tasks */}
      {affectedStoryIds.length > 0 ? (
        <div
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            background: '#fef2f2',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fecaca',
            fontSize: 'var(--text-xs)',
            color: '#991b1b',
          }}
        >
          <strong style={{ display: 'block', marginBottom: '2px' }}>
            {`Downstream Impact: ${affectedStoryIds.length} Published Story(ies) Affected`}
          </strong>
          <span style={{ display: 'block', marginBottom: '4px' }}>
            {`Referencing story IDs: ${affectedStoryIds.join(', ')}`}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.9 }}>
            Review tasks queued in EditorialQueue. Human verification required before updating narrative prose.
          </span>
        </div>
      ) : (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          No published stories currently reference this document.
        </div>
      )}
    </section>
  );
}
