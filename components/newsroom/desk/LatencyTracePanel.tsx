'use client';

import React from 'react';

export interface LatencyTracePanelProps {
  timestamps: {
    sourcePublishedAt?: string;
    firstSeenAt?: string;
    firstDetectedAt: string;
    lastUpdatedAt?: string;
  };
  latencyContext?: {
    detectionLatencyMs?: number;
    observationLatencyMs?: number;
    verificationLatencyMs?: number;
    publicationLatencyMs?: number;
    endToEndPublicationLatencyMs?: number;
  } | null;
  firstVerifiedAt?: string;
  publishedAt?: string;
  className?: string;
}

function formatDuration(ms?: number | null): string {
  if (ms === undefined || ms === null) {
    return '—';
  }
  if (ms < 0) {
    return 'Invalid (<0)';
  }
  if (ms < 1000) {
    return `${ms} ms`;
  }
  if (ms < 60000) {
    const s = (ms / 1000).toFixed(1);
    return `${s}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function formatTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '—';
  }
}

/**
 * ─── LatencyTracePanel (Phase 4A Wave 2) ────────────────────────────────────
 *
 * Visual representation of the 5-timestamp precision intelligence chain from Phase 3B-M3.
 * Strictly respects honest states: missing timestamps remain '—', zero fabrication.
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §11
 * Accessibility: WCAG AA/AAA compliant (role="region", ordered milestones).
 */
export function LatencyTracePanel({
  timestamps,
  latencyContext,
  firstVerifiedAt,
  publishedAt,
  className = '',
}: LatencyTracePanelProps) {
  const { sourcePublishedAt, firstSeenAt, firstDetectedAt } = timestamps;

  // Chronology validation check
  const tSource = sourcePublishedAt ? new Date(sourcePublishedAt).getTime() : null;
  const tSeen = firstSeenAt ? new Date(firstSeenAt).getTime() : null;
  const tDetect = firstDetectedAt ? new Date(firstDetectedAt).getTime() : null;
  const tVerify = firstVerifiedAt ? new Date(firstVerifiedAt).getTime() : null;
  const tPublish = publishedAt ? new Date(publishedAt).getTime() : null;

  let hasChronologyInversion = false;
  if (tSource && tSeen && tSeen < tSource) hasChronologyInversion = true;
  if (tSeen && tDetect && tDetect < tSeen) hasChronologyInversion = true;
  if (tDetect && tVerify && tVerify < tDetect) hasChronologyInversion = true;
  if (tVerify && tPublish && tPublish < tVerify) hasChronologyInversion = true;

  const milestones = [
    {
      key: 'source_published',
      label: '1. Source Publication',
      time: sourcePublishedAt,
      latencyLabel: 'Ingestion Latency',
      latencyValue: latencyContext?.observationLatencyMs,
    },
    {
      key: 'first_seen',
      label: '2. First Seen (Ingestion)',
      time: firstSeenAt,
      latencyLabel: 'Detection Latency',
      latencyValue: latencyContext?.detectionLatencyMs,
    },
    {
      key: 'first_detected',
      label: '3. First Detected',
      time: firstDetectedAt,
      latencyLabel: 'Verification Latency',
      latencyValue: latencyContext?.verificationLatencyMs,
    },
    {
      key: 'first_verified',
      label: '4. First Verified',
      time: firstVerifiedAt,
      latencyLabel: 'Publication Latency',
      latencyValue: latencyContext?.publicationLatencyMs,
    },
    {
      key: 'published',
      label: '5. Published',
      time: publishedAt,
      latencyLabel: 'End-to-End Latency',
      latencyValue: latencyContext?.endToEndPublicationLatencyMs,
    },
  ];

  return (
    <section
      className={`latency-trace-panel ${className}`}
      aria-labelledby="latency-trace-title"
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
          id="latency-trace-title"
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
          <span aria-hidden="true">⏱</span>
          <span>End-to-End Pipeline Latency Trace</span>
        </h3>

        {hasChronologyInversion && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 700,
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
            }}
          >
            ⚠ Chronology Inversion
          </span>
        )}
      </div>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: '0 0 var(--spacing-4) 0' }}>
        Chronological intelligence lifecycle measurements. Uninstrumented milestones display as &ldquo;—&rdquo;.
      </p>

      {/* 5-Step Milestone Trace Grid */}
      <ol
        role="list"
        aria-label="Chronological Latency Milestones"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 'var(--spacing-2)',
          margin: '0 0 var(--spacing-3) 0',
          padding: 0,
          listStyle: 'none',
        }}
      >
        {milestones.map((m) => {
          const isComplete = Boolean(m.time);
          return (
            <li
              key={m.key}
              style={{
                padding: 'var(--spacing-3)',
                background: isComplete ? 'var(--color-bg-secondary)' : '#fafafa',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isComplete ? 'var(--color-border-subtle)' : '#e5e7eb'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: isComplete ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                {m.label}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'monospace', fontWeight: 700, color: isComplete ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                <span className="sr-only">{`Timestamp for ${m.label}: `}</span>
                {formatTime(m.time)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {m.latencyLabel}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: m.latencyValue !== undefined ? 'var(--color-brand-600)' : 'var(--color-text-muted)' }}>
                {formatDuration(m.latencyValue)}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Overall End-to-End Summary Line */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'var(--text-xs)',
          paddingTop: 'var(--spacing-2)',
          borderTop: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>
          Total Pipeline Latency: <strong>{formatDuration(latencyContext?.endToEndPublicationLatencyMs)}</strong>
        </span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
          M3 Instrumentation Certified
        </span>
      </div>
    </section>
  );
}
