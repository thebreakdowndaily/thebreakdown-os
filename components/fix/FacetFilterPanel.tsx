'use client';

import React, { useState } from 'react';

interface FacetFilterPanelProps {
  facets: { field: string; counts: { value: string; count: number }[] }[];
  selected: Record<string, string[]>;
  onFilterChange: (field: string, values: string[]) => void;
  className?: string;
}

const LABELS: Record<string, Record<string, string>> = {
  primaryCategory: {
    fiscal: 'Fiscal',
    statutory: 'Statutory',
    administrative: 'Administrative',
    technological: 'Technological',
    institutional: 'Institutional',
    judicial: 'Judicial',
  },
  maturityStatus: {
    published: 'Published',
    expert_reviewed: 'Expert Reviewed',
    pilot: 'Pilot',
    proposed: 'Proposed',
  },
  evidenceGrade: {
    High: 'High',
    Moderate: 'Moderate',
    Low: 'Low',
  },
  timeToImpact: {
    'short-term': 'Short-term',
    'medium-term': 'Medium-term',
    'long-term': 'Long-term',
  },
};

const FIELD_ICONS: Record<string, React.ReactNode> = {
  primaryCategory: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  ),
  maturityStatus: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  evidenceGrade: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
  ),
  timeToImpact: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
};

const FIELD_ORDER = ['primaryCategory', 'maturityStatus', 'evidenceGrade', 'timeToImpact'];

export default function FacetFilterPanel({ facets, selected, onFilterChange, className = '' }: FacetFilterPanelProps) {
  const [expandedField, setExpandedField] = useState<string | null>(FIELD_ORDER[0]);

  const sortedFacets = facets
    .filter(f => f.field !== 'publicationStatus')
    .sort((a, b) => FIELD_ORDER.indexOf(a.field) - FIELD_ORDER.indexOf(b.field));

  const toggleField = (field: string) => {
    setExpandedField(prev => prev === field ? null : field);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {sortedFacets.map(facet => {
        const isExpanded = expandedField === facet.field;
        const selectedCount = (selected[facet.field] || []).length;
        const labels = LABELS[facet.field] || {};
        const icon = FIELD_ICONS[facet.field];

        return (
          <div key={facet.field} className="border border-[var(--color-border)] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleField(facet.field)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[var(--color-surface-secondary)] transition-colors"
              aria-expanded={isExpanded}
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-secondary)]">{icon}</span>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {facet.field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </span>
                {selectedCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-brand-400)] text-[10px] font-bold text-gray-900">
                    {selectedCount}
                  </span>
                )}
              </div>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isExpanded && (
              <div className="px-3 pb-3 space-y-1">
                {facet.counts
                  .filter(c => c.count > 0 || (selected[facet.field] || []).includes(c.value))
                  .map(option => {
                    const isSelected = (selected[facet.field] || []).includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[var(--color-surface-secondary)] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const current = selected[facet.field] || [];
                            const next = isSelected
                              ? current.filter(v => v !== option.value)
                              : [...current, option.value];
                            onFilterChange(facet.field, next);
                          }}
                          className="w-3.5 h-3.5 rounded border-gray-600 text-[var(--color-brand-400)] focus:ring-[var(--color-brand-400)]"
                        />
                        <span className="text-sm text-[var(--color-text-primary)] flex-1">
                          {labels[option.value] || option.value}
                        </span>
                        <span className="text-[10px] text-gray-500 tabular-nums">{option.count}</span>
                      </label>
                    );
                  })}
                {facet.counts.filter(c => c.count > 0).length === 0 && (
                  <p className="text-xs text-gray-500 px-2 py-1">No results for current filters</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
