'use client';

import React from 'react';
import type { RadarSourceHealthStatus, RadarSourceScheduleState } from '@/services/radar/types';

export interface SourceHealthBadgeProps {
  sourceHealth?: {
    status: RadarSourceHealthStatus;
    scheduleState?: RadarSourceScheduleState;
    consecutiveFailures: number;
    consecutiveEmptyRuns: number;
    silentFailureSuspected: boolean;
    lastSuccessAt?: string;
  } | null;
  sourceName?: string;
  sourceId?: string;
  className?: string;
}

interface StatusStyle {
  bg: string;
  text: string;
  border: string;
  icon: string;
  label: string;
}

const HEALTH_STATUS_MAP: Record<RadarSourceHealthStatus, StatusStyle> = {
  healthy: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', icon: '✓', label: 'Healthy' },
  degraded: { bg: '#fefce8', text: '#854d0e', border: '#fde047', icon: '⚠', label: 'Degraded' },
  failing: { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5', icon: '✖', label: 'Failing' },
  stale: { bg: '#fff7ed', text: '#9a3412', border: '#fdba74', icon: '◷', label: 'Stale' },
  changed: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', icon: '⟳', label: 'Changed' },
  unavailable: { bg: '#f4f4f5', text: '#52525b', border: '#d4d4d8', icon: '○', label: 'Unavailable' },
  disputed: { bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff', icon: '⚡', label: 'Disputed' },
  unknown: { bg: '#f4f4f5', text: '#71717a', border: '#e4e4e7', icon: '?', label: 'Unknown' },
};

/**
 * ─── SourceHealthBadge (Phase 4A Wave 2) ────────────────────────────────────
 *
 * Visual presentation of upstream source health telemetry from Phase 3B-M4.
 * Explicitly distinguishes "Healthy + Quiet Feed" from "Degraded / Failing / Stale".
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §9
 * Accessibility: WCAG AA/AAA compliant (Icon + Text Label + ARIA description).
 */
export function SourceHealthBadge({
  sourceHealth,
  sourceName,
  sourceId,
  className = '',
}: SourceHealthBadgeProps) {
  if (!sourceHealth) {
    return (
      <div
        className={`source-health-badge unavailable ${className}`}
        role="status"
        aria-label="Source Health: Telemetry Not Available"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          background: 'var(--color-bg-secondary)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <span aria-hidden="true">○</span>
        <span>Telemetry Not Recorded</span>
      </div>
    );
  }

  const { status, consecutiveEmptyRuns, consecutiveFailures, silentFailureSuspected, lastSuccessAt } = sourceHealth;
  const style = HEALTH_STATUS_MAP[status] || HEALTH_STATUS_MAP.unknown;

  // Distinguish healthy quiet feed vs active feed vs silent feed failure
  let subLabel = '';
  let isQuietFeed = false;

  if (status === 'healthy' && consecutiveEmptyRuns > 0 && !silentFailureSuspected) {
    isQuietFeed = true;
    subLabel = `Quiet Feed (${consecutiveEmptyRuns} empty runs)`;
  } else if (silentFailureSuspected || (status === 'stale' && consecutiveEmptyRuns > 0)) {
    subLabel = 'Silent Feed Anomaly Suspected';
  } else if (consecutiveFailures > 0) {
    subLabel = `${consecutiveFailures} consecutive failure(s)`;
  }

  return (
    <div
      className={`source-health-badge ${status} ${className}`}
      role="status"
      aria-label={`Source Health Status: ${style.label}${subLabel ? `, ${subLabel}` : ''}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '6px 12px',
        borderRadius: 'var(--radius-md)',
        background: silentFailureSuspected ? '#fff7ed' : style.bg,
        border: `1px solid ${silentFailureSuspected ? '#fdba74' : style.border}`,
        color: silentFailureSuspected ? '#9a3412' : style.text,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: '0.03em' }}>
        <span aria-hidden="true">{silentFailureSuspected ? '⚠' : style.icon}</span>
        <span>{silentFailureSuspected ? 'STALE / SILENT FAILURE' : (isQuietFeed ? 'HEALTHY (QUIET FEED)' : style.label.toUpperCase())}</span>
      </div>

      {subLabel && (
        <span style={{ fontSize: '11px', opacity: 0.9, fontWeight: 500 }}>
          {subLabel}
        </span>
      )}

      {lastSuccessAt && (
        <span style={{ fontSize: '10px', opacity: 0.8 }}>
          Last success: <time dateTime={lastSuccessAt}>{new Date(lastSuccessAt).toLocaleTimeString()}</time>
        </span>
      )}
    </div>
  );
}
