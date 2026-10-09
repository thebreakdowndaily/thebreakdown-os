'use client';

import React from 'react';
import type { NewsroomDeskSummary } from '@/services/intelligence/newsroom/desk-service';

export interface DeskSummaryHeaderProps {
  summary?: NewsroomDeskSummary | null;
  userRole?: string;
  userName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastRefreshedAt?: string;
  hideMetrics?: boolean;
  className?: string;
}

/**
 * ─── DeskSummaryHeader (Phase 4A Wave 1) ────────────────────────────────────
 *
 * Presentational summary header for the Newsroom Intelligence Desk.
 * Consumes existing M5 NewsroomDeskSummary without recalculating metrics.
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §3
 * Accessibility: WCAG AA/AAA compliant, semantic headings, color-independent badges.
 */
export function DeskSummaryHeader({
  summary,
  userRole,
  userName,
  onRefresh,
  isRefreshing = false,
  lastRefreshedAt,
  hideMetrics = false,
  className = '',
}: DeskSummaryHeaderProps) {
  // Format user role label
  const formattedRole = userRole
    ? userRole
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    : 'Reporter';

  return (
    <header
      className={`desk-summary-header ${className}`}
      aria-label="Newsroom Operational Summary and Header"
      style={{
        padding: 'var(--spacing-6)',
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        marginBottom: 'var(--spacing-6)',
      }}
    >
      {/* Top Identity & Action Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--spacing-4)',
          marginBottom: hideMetrics ? '0' : 'var(--spacing-6)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Newsroom Intelligence Desk
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <span aria-hidden="true">👤</span>
              <span className="sr-only">Logged in role: </span>
              {userName ? `${userName} (${formattedRole})` : formattedRole}
            </span>
          </div>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              marginTop: 'var(--spacing-1)',
              marginBottom: 0,
            }}
          >
            Operational intelligence command surface · Human-governed verification and triage loop.
          </p>
        </div>

        {/* Refresh & Sync Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          {lastRefreshedAt && (
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              Last synced:{' '}
              <time dateTime={lastRefreshedAt}>
                {new Date(lastRefreshedAt).toLocaleTimeString()}
              </time>
            </span>
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh desk queue data"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                background: isRefreshing ? 'var(--color-bg-secondary)' : 'var(--color-brand-600)',
                color: isRefreshing ? 'var(--color-text-muted)' : '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <span aria-hidden="true" style={{ display: 'inline-block', transform: isRefreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }}>
                ⟳
              </span>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* Operational HUD Metrics Grid */}
      {!hideMetrics && (
      <div
        role="region"
        aria-label="Operational Signal Counters"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 'var(--spacing-3)',
        }}
      >
        {/* Breaking P0 */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: (summary?.breakingP0Count ?? 0) > 0 ? '#fef2f2' : 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${(summary?.breakingP0Count ?? 0) > 0 ? '#fca5a5' : 'var(--color-border-subtle)'}`,
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: (summary?.breakingP0Count ?? 0) > 0 ? '#991b1b' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span aria-hidden="true">!</span> Breaking (P0)
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: (summary?.breakingP0Count ?? 0) > 0 ? '#991b1b' : 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            {summary?.breakingP0Count ?? 0}
          </div>
        </div>

        {/* P1 Important */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: (summary?.importantP1Count ?? 0) > 0 ? '#fff7ed' : 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${(summary?.importantP1Count ?? 0) > 0 ? '#fdba74' : 'var(--color-border-subtle)'}`,
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: (summary?.importantP1Count ?? 0) > 0 ? '#9a3412' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span aria-hidden="true">◆</span> Important (P1)
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: (summary?.importantP1Count ?? 0) > 0 ? '#9a3412' : 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            {summary?.importantP1Count ?? 0}
          </div>
        </div>

        {/* Needs Verification */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span aria-hidden="true">🔍</span> Verification
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            {summary?.needsVerificationCount ?? 0}
          </div>
        </div>

        {/* Contradictions */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: (summary?.contradictionsCount ?? 0) > 0 ? '#fefce8' : 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${(summary?.contradictionsCount ?? 0) > 0 ? '#fde047' : 'var(--color-border-subtle)'}`,
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: (summary?.contradictionsCount ?? 0) > 0 ? '#854d0e' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span aria-hidden="true">⚡</span> Contradictions
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: (summary?.contradictionsCount ?? 0) > 0 ? '#854d0e' : 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            {summary?.contradictionsCount ?? 0}
          </div>
        </div>

        {/* Coverage Gaps */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span aria-hidden="true">◫</span> Coverage Gaps
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            {summary?.coverageGapsCount ?? 0}
          </div>
        </div>

        {/* Active Alerts */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: (summary?.activeAlertsCount ?? 0) > 0 ? '#fef2f2' : 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${(summary?.activeAlertsCount ?? 0) > 0 ? '#fca5a5' : 'var(--color-border-subtle)'}`,
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: (summary?.activeAlertsCount ?? 0) > 0 ? '#991b1b' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span aria-hidden="true">🔔</span> Alerts
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: (summary?.activeAlertsCount ?? 0) > 0 ? '#991b1b' : 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            {summary?.activeAlertsCount ?? 0}
          </div>
        </div>

        {/* Failing / Silent Feeds (M4) */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: (summary?.failingSourcesCount ?? 0) > 0 ? '#fef2f2' : 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${(summary?.failingSourcesCount ?? 0) > 0 ? '#fca5a5' : 'var(--color-border-subtle)'}`,
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: (summary?.failingSourcesCount ?? 0) > 0 ? '#991b1b' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span aria-hidden="true">📡</span> Failing Feeds
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: (summary?.failingSourcesCount ?? 0) > 0 ? '#991b1b' : 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            {summary?.failingSourcesCount ?? 0}
          </div>
        </div>

        {/* Total Active Signals */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span aria-hidden="true">∑</span> Total Signals
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
            {summary?.totalSignals ?? 0}
          </div>
        </div>
      </div>
      )}
    </header>
  );
}
