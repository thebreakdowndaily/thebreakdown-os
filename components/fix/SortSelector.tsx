'use client';

import React from 'react';

export type SortOption = {
  value: string;
  label: string;
  description: string;
};

export const SORT_OPTIONS: SortOption[] = [
  { value: 'relevance', label: 'Relevance', description: 'Default text + evidence + freshness' },
  { value: 'evidence', label: 'Evidence Score', description: 'Highest evidence score first' },
  { value: 'freshness', label: 'Recently Updated', description: 'Most recently updated' },
  { value: 'maturity', label: 'Maturity', description: 'Published > Expert Reviewed > Pilot > Proposed' },
  { value: 'reading-time', label: 'Quick Reads', description: 'Shortest reading time first' },
];

interface SortSelectorProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export default function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 whitespace-nowrap">Sort by</span>
      <select
        value={currentSort}
        onChange={e => onSortChange(e.target.value)}
        className="text-xs font-medium bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] px-2.5 py-1.5 rounded border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-400)] cursor-pointer"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value} title={opt.description}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
