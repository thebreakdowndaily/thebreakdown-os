'use client';

import React from 'react';
import { getRecentSearches, clearRecentSearches } from '@/lib/search/recentSearches';

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export default function RecentSearches({ onSelect }: RecentSearchesProps) {
  const [items, setItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    setItems(getRecentSearches());
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#A1A1AA]">Recent Searches</h3>
        <button
          type="button"
          onClick={() => { clearRecentSearches(); setItems([]); }}
          className="text-[10px] text-[#A1A1AA]/40 hover:text-[#D4A843] transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect(q)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-[#A1A1AA] bg-[#151515] border border-[#2A2A2A] hover:border-[#D4A843]/30 hover:text-[#F5F5F5] transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
