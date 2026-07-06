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
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-[#A1A1AA]">No results for &quot;{query}&quot;</p>
        <p className="text-xs text-[#A1A1AA]/40 mt-1">Try searching for broader terms like &quot;employment&quot;, &quot;budget&quot;, or &quot;agriculture&quot;</p>
      </div>
    );
  }

  return (
    <div>
      <RecentSearches onSelect={onSearch} />
      <div className="px-4 py-3 border-t border-[#2A2A2A]/50">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA] mb-2">Trending</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.query}
              type="button"
              onClick={() => onSearch(s.query)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-[#A1A1AA] bg-[#151515] border border-[#2A2A2A] hover:border-[#D4A843]/30 hover:text-[#F5F5F5] transition-colors"
            >
              <svg className="w-3 h-3 text-[#D4A843]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
