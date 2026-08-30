'use client';

/**
 * ─── DemandDashboardClient ───────────────────────────────────────────────────
 *
 * Main client component for the Public Demand & Search Intelligence surface.
 * Follows the NewsroomDashboardClient pattern: inline styles, CSS variables,
 * tab-based navigation, metrics bar, filterable list.
 *
 * Governing document: docs/editorial/story-selection-framework.md
 */

import { useState, useMemo } from 'react';
import type {
  DemandOpportunity,
  DemandSummaryMetrics,
  DemandFilterState,
} from '@/types/demand-intelligence';
import { DemandMetricsBar } from './DemandMetricsBar';
import { DemandFilterBar } from './DemandFilterBar';
import { DemandOpportunityCard } from './DemandOpportunityCard';

interface DemandDashboardClientProps {
  opportunities: DemandOpportunity[];
  metrics: DemandSummaryMetrics;
}

type SortKey = 'gap_score' | 'volume' | 'trend';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'gap_score', label: 'Gap Score (highest first)' },
  { value: 'volume', label: 'Monthly Volume (highest first)' },
  { value: 'trend', label: 'Trend (spikes first)' },
];

const TREND_RANK: Record<string, number> = { spike: 0, rising: 1, stable: 2, declining: 3 };

const EMPTY_FILTERS: DemandFilterState = {
  categories: [],
  languages: [],
  coverageStates: [],
  intents: [],
  trends: [],
  searchText: '',
};

export function DemandDashboardClient({ opportunities, metrics }: DemandDashboardClientProps) {
  const [filters, setFilters] = useState<DemandFilterState>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey>('gap_score');

  const filtered = useMemo(() => {
    let list = [...opportunities];

    // Category filter
    if (filters.categories.length > 0) {
      list = list.filter((o) => filters.categories.includes(o.category));
    }
    // Language filter
    if (filters.languages.length > 0) {
      list = list.filter((o) => filters.languages.includes(o.primaryQuery.language));
    }
    // Coverage filter
    if (filters.coverageStates.length > 0) {
      list = list.filter((o) => filters.coverageStates.includes(o.coverageState));
    }
    // Intent filter
    if (filters.intents.length > 0) {
      list = list.filter((o) => filters.intents.includes(o.intent));
    }
    // Trend filter
    if (filters.trends.length > 0) {
      list = list.filter((o) => filters.trends.includes(o.trend));
    }
    // Text search
    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      list = list.filter(
        (o) =>
          o.primaryQuery.text.toLowerCase().includes(q) ||
          (o.primaryQuery.transliteration?.toLowerCase().includes(q) ?? false) ||
          o.relatedQueries.some((r) => r.text.toLowerCase().includes(q)),
      );
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'gap_score':
          return b.gapScore - a.gapScore;
        case 'volume':
          return b.totalMonthlyVolume - a.totalMonthlyVolume;
        case 'trend':
          return (TREND_RANK[a.trend] ?? 9) - (TREND_RANK[b.trend] ?? 9);
        default:
          return 0;
      }
    });

    return list;
  }, [opportunities, filters, sortBy]);

  const maxVolume = useMemo(
    () => Math.max(...opportunities.map((o) => o.totalMonthlyVolume), 1),
    [opportunities],
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Public Demand & Search Intelligence
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
              What does the Indian public want to understand — and where are we not covering it? Hindi/English demand signals from search intelligence.
            </p>
          </div>
          <span
            style={{
              padding: '4px 10px',
              background: '#e0f2fe',
              color: '#0369a1',
              borderRadius: '4px',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              border: '1px solid #bae6fd',
            }}
          >
            FIXTURE DATA — PRE-PRODUCTION
          </span>
        </div>
      </header>

      {/* Metrics */}
      <DemandMetricsBar metrics={metrics} />

      {/* Filters + Sort */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <DemandFilterBar
            filters={filters}
            onFilterChange={setFilters}
            resultCount={filtered.length}
            totalCount={opportunities.length}
          />
        </div>
      </div>

      {/* Sort control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h2
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          Opportunities ({filtered.length})
        </h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Sort by
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortKey); }}
            style={{
              padding: 'var(--spacing-1) var(--spacing-2)',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Opportunity List */}
      <section aria-label="Demand opportunities">
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 'var(--spacing-8)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            No demand opportunities match the current filters.
          </div>
        ) : (
          filtered.map((opp) => (
            <DemandOpportunityCard
              key={opp.id}
              opportunity={opp}
              maxVolume={maxVolume}
            />
          ))
        )}
      </section>

      {/* Footer provenance */}
      <footer
        style={{
          marginTop: 'var(--spacing-8)',
          padding: 'var(--spacing-3)',
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        Demand data: AnswerThePublic-style search intelligence fixtures · Hindi & English · Volumes are synthetic estimates ·
        Last assessed: {new Date(opportunities[0]?.lastAssessedAt ?? '2026-08-18T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </footer>
    </div>
  );
}
