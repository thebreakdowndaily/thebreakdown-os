'use client';

/**
 * ─── DemandOpportunityCard ───────────────────────────────────────────────────
 *
 * A single demand opportunity card with expand/collapse to reveal the detail
 * panel. Follows the SignalCard pattern: inline styles, CSS variables, dark
 * theme first.
 *
 * Governing document: docs/editorial/story-selection-framework.md
 */

import { useState } from 'react';
import type { DemandOpportunity, DemandCoverageState, DemandTrend } from '@/types/demand-intelligence';
import { DemandOpportunityDetail } from './DemandOpportunityDetail';

interface DemandOpportunityCardProps {
  opportunity: DemandOpportunity;
  /** Max volume across all opportunities — used to scale the volume bar. */
  maxVolume: number;
}

const COVERAGE_BADGE: Record<DemandCoverageState, { bg: string; text: string; label: string }> = {
  fully_covered: { bg: '#064e3b', text: '#34d399', label: 'Covered' },
  partially_covered: { bg: '#78350f', text: '#fbbf24', label: 'Partial' },
  gap: { bg: '#7c2d12', text: '#fb923c', label: 'Gap' },
  uncovered: { bg: '#7f1d1d', text: '#f87171', label: 'Uncovered' },
};

const TREND_ICON: Record<DemandTrend, { symbol: string; color: string }> = {
  spike: { symbol: '⚡', color: '#f59e0b' },
  rising: { symbol: '↑', color: '#34d399' },
  stable: { symbol: '→', color: 'var(--color-text-muted)' },
  declining: { symbol: '↓', color: '#f87171' },
};

const CATEGORY_LABELS: Record<string, string> = {
  foreign_policy: 'Foreign Policy',
  defence: 'Defence',
  economy: 'Economy',
  governance: 'Governance',
  judiciary: 'Judiciary',
  history: 'History',
  elections: 'Elections',
  society: 'Society',
};

const INTENT_LABELS: Record<string, string> = {
  what: 'What',
  why: 'Why',
  how: 'How',
  who: 'Who',
  when: 'When',
  comparison: 'Compare',
  list: 'List',
  explainer: 'Explainer',
};

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function DemandOpportunityCard({ opportunity, maxVolume }: DemandOpportunityCardProps) {
  const [expanded, setExpanded] = useState(false);

  const coverage = COVERAGE_BADGE[opportunity.coverageState];
  const trend = TREND_ICON[opportunity.trend];
  const volumePct = maxVolume > 0 ? Math.round((opportunity.totalMonthlyVolume / maxVolume) * 100) : 0;
  const lang = opportunity.primaryQuery.language;

  return (
    <article
      aria-label={`Demand opportunity: ${opportunity.primaryQuery.text}`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
      style={{
        padding: 'var(--spacing-4)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-default)',
        marginBottom: 'var(--spacing-3)',
        outline: 'none',
        transition: 'border-color var(--duration-fast)',
      }}
    >
      {/* Top row: badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)', flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: coverage.bg,
            color: coverage.text,
            letterSpacing: '0.04em',
          }}
        >
          {coverage.label}
        </span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            background: 'var(--color-bg-tertiary)',
            color: trend.color,
          }}
        >
          {trend.symbol} {opportunity.trend.charAt(0).toUpperCase() + opportunity.trend.slice(1)}
        </span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 600,
            background: lang === 'hi' ? 'color-mix(in srgb, #f97316 15%, transparent)' : 'var(--color-bg-tertiary)',
            color: lang === 'hi' ? '#fb923c' : 'var(--color-text-muted)',
            letterSpacing: '0.05em',
          }}
        >
          {lang === 'hi' ? 'हिंदी' : lang === 'mixed' ? 'EN/HI' : 'EN'}
        </span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 500,
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-muted)',
          }}
        >
          {CATEGORY_LABELS[opportunity.category] ?? opportunity.category}
        </span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 500,
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-muted)',
          }}
        >
          {INTENT_LABELS[opportunity.intent] ?? opportunity.intent}
        </span>
        {opportunity.gapScore >= 70 && (
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 700,
              background: '#7f1d1d',
              color: '#fca5a5',
              letterSpacing: '0.04em',
            }}
          >
            HIGH PRIORITY
          </span>
        )}
      </div>

      {/* Query text + volume */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-3)' }}>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {opportunity.primaryQuery.text}
            {opportunity.primaryQuery.transliteration && (
              <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginLeft: 'var(--spacing-2)' }}>
                ({opportunity.primaryQuery.transliteration})
              </span>
            )}
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--spacing-1) 0 0' }}>
            {opportunity.coverageReason}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {formatVolume(opportunity.totalMonthlyVolume)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>searches/mo</div>
        </div>
      </div>

      {/* Volume bar */}
      <div
        style={{
          marginTop: 'var(--spacing-2)',
          height: 4,
          background: 'var(--color-bg-tertiary)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${String(volumePct)}%`,
            background: coverage.text,
            borderRadius: 2,
            transition: 'width var(--duration-default)',
          }}
        />
      </div>

      {/* Footer: gap score + expand button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Gap Score: <strong style={{ color: opportunity.gapScore >= 70 ? '#f87171' : opportunity.gapScore >= 40 ? '#fb923c' : 'var(--color-text-secondary)' }}>{opportunity.gapScore}</strong>
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Related: <strong>{opportunity.relatedQueries.length}</strong> queries
          </span>
        </div>
        <button
          type="button"
          onClick={() => { setExpanded(!expanded); }}
          style={{
            padding: 'var(--spacing-1) var(--spacing-2)',
            background: 'transparent',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
          }}
        >
          {expanded ? 'Collapse ▲' : 'Details ▼'}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && <DemandOpportunityDetail opportunity={opportunity} />}
    </article>
  );
}
