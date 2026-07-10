'use client';

import React from 'react';
import RecentSearches from './RecentSearches';

interface SearchEmptyProps {
  query: string;
  onSearch: (query: string) => void;
}

const suggestions = [
  { label: 'MGNREGA', query: 'MGNREGA' },
  { label: 'Agriculture', query: 'agriculture' },
  { label: 'Employment', query: 'employment' },
  { label: 'RBI', query: 'RBI' },
  { label: 'Digital Payments', query: 'digital payments' },
  { label: 'Crop Insurance', query: 'crop insurance' },
];

export default function SearchEmpty({ query, onSearch }: SearchEmptyProps) {
  if (query.trim()) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm font-serif text-text-secondary">No results for &quot;{query}&quot;</p>
        <p className="text-xs text-text-muted mt-2">Try searching for broader terms like &quot;employment&quot;, &quot;budget&quot;, or &quot;agriculture&quot;</p>
      </div>
    );
  }

  return (
    <div>
      <RecentSearches onSelect={onSearch} />
      <div className="px-4 py-4 border-t border-border">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Trending</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.query}
              type="button"
              onClick={() => onSearch(s.query)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest text-text-secondary bg-surface-tertiary border border-border hover:border-brand-400/50 hover:text-brand-400 transition-colors"
            >
              <svg className="w-3 h-3 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
