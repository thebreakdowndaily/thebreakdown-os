'use client';

/**
 * ─── DemandFilterBar ─────────────────────────────────────────────────────────
 *
 * Filter controls for the Demand Intelligence dashboard.
 * Inline styles with CSS variables, following the newsroom/intel pattern.
 *
 * Governing document: docs/editorial/story-selection-framework.md
 */

import type {
  DemandCategory,
  DemandCoverageState,
  DemandFilterState,
  DemandIntent,
  DemandLanguage,
  DemandTrend,
} from '@/types/demand-intelligence';

interface DemandFilterBarProps {
  filters: DemandFilterState;
  onFilterChange: (filters: DemandFilterState) => void;
  resultCount: number;
  totalCount: number;
}

const CATEGORY_OPTIONS: Array<{ value: DemandCategory; label: string }> = [
  { value: 'foreign_policy', label: 'Foreign Policy' },
  { value: 'defence', label: 'Defence' },
  { value: 'economy', label: 'Economy' },
  { value: 'governance', label: 'Governance' },
  { value: 'judiciary', label: 'Judiciary' },
  { value: 'history', label: 'History' },
  { value: 'elections', label: 'Elections' },
  { value: 'society', label: 'Society' },
];

const COVERAGE_OPTIONS: Array<{ value: DemandCoverageState; label: string }> = [
  { value: 'uncovered', label: 'Uncovered' },
  { value: 'gap', label: 'Gap' },
  { value: 'partially_covered', label: 'Partially Covered' },
  { value: 'fully_covered', label: 'Fully Covered' },
];

const LANGUAGE_OPTIONS: Array<{ value: DemandLanguage; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'mixed', label: 'Mixed' },
];

const INTENT_OPTIONS: Array<{ value: DemandIntent; label: string }> = [
  { value: 'what', label: 'What' },
  { value: 'why', label: 'Why' },
  { value: 'how', label: 'How' },
  { value: 'who', label: 'Who' },
  { value: 'when', label: 'When' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'list', label: 'List' },
  { value: 'explainer', label: 'Explainer' },
];

const TREND_OPTIONS: Array<{ value: DemandTrend; label: string }> = [
  { value: 'spike', label: '⚡ Spike' },
  { value: 'rising', label: '↑ Rising' },
  { value: 'stable', label: '→ Stable' },
  { value: 'declining', label: '↓ Declining' },
];

const selectStyle: React.CSSProperties = {
  padding: 'var(--spacing-1-5) var(--spacing-2)',
  background: 'var(--color-bg-primary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-xs)',
  cursor: 'pointer',
  minWidth: 100,
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  fontSize: '10px',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 600,
};

export function DemandFilterBar({ filters, onFilterChange, resultCount, totalCount }: DemandFilterBarProps) {
  const activeFilterCount =
    filters.categories.length +
    filters.languages.length +
    filters.coverageStates.length +
    filters.intents.length +
    filters.trends.length +
    (filters.searchText ? 1 : 0);

  const handleSelectChange = (
    key: keyof DemandFilterState,
    value: string,
  ) => {
    if (key === 'searchText') {
      onFilterChange({ ...filters, searchText: value });
      return;
    }
    // For array filters, treat empty string as "all" (clear filter)
    const arr = value ? [value] : [];
    onFilterChange({ ...filters, [key]: arr });
  };

  const clearAll = () => {
    onFilterChange({
      categories: [],
      languages: [],
      coverageStates: [],
      intents: [],
      trends: [],
      searchText: '',
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--spacing-3)',
        flexWrap: 'wrap',
        marginBottom: 'var(--spacing-5)',
        padding: 'var(--spacing-3) var(--spacing-4)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <label style={labelStyle}>
        Category
        <select
          value={filters.categories[0] ?? ''}
          onChange={(e) => { handleSelectChange('categories', e.target.value); }}
          style={selectStyle}
        >
          <option value="">All</option>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Language
        <select
          value={filters.languages[0] ?? ''}
          onChange={(e) => { handleSelectChange('languages', e.target.value); }}
          style={selectStyle}
        >
          <option value="">All</option>
          {LANGUAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Coverage
        <select
          value={filters.coverageStates[0] ?? ''}
          onChange={(e) => { handleSelectChange('coverageStates', e.target.value); }}
          style={selectStyle}
        >
          <option value="">All</option>
          {COVERAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Intent
        <select
          value={filters.intents[0] ?? ''}
          onChange={(e) => { handleSelectChange('intents', e.target.value); }}
          style={selectStyle}
        >
          <option value="">All</option>
          {INTENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Trend
        <select
          value={filters.trends[0] ?? ''}
          onChange={(e) => { handleSelectChange('trends', e.target.value); }}
          style={selectStyle}
        >
          <option value="">All</option>
          {TREND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Search
        <input
          type="text"
          value={filters.searchText}
          onChange={(e) => { handleSelectChange('searchText', e.target.value); }}
          placeholder="Filter queries…"
          style={{
            ...selectStyle,
            minWidth: 140,
          }}
        />
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginLeft: 'auto' }}>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              padding: 'var(--spacing-1-5) var(--spacing-3)',
              background: 'transparent',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Clear ({activeFilterCount})
          </button>
        )}
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
