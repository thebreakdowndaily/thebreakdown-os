'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import FilterTabs from './FilterTabs';
import SearchGroup from './SearchGroup';
import SearchEmpty from './SearchEmpty';
import { addRecentSearch } from '@/lib/search/recentSearches';
import type { SearchResultData } from './SearchResultItem';

interface UnifiedSearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function UnifiedSearchDialog({ open, onClose }: UnifiedSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultData[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [idle, setIdle] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setFilter('');
      setSelectedIndex(-1);
      setIdle(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Fetch search results with debounce
  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      setIdle(true);
      return;
    }
    setIdle(false);
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim(), limit: '20' });
        if (filter) params.set('type', filter);
        const res = await fetch(`/api/search?${params}`);
        const data: any = await res.json();
        const mapped: SearchResultData[] = (data.results || []).map((r: any) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          description: r.description,
          url: r.url,
          score: r.score,
          category: r.category,
          metadata: {
            evidenceScore: r.score,
            updatedAt: r.date,
            category: r.category,
          },
        }));
        setResults(mapped);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, filter, open]);

  // Group results by type
  const groups = useMemo(() => {
    const grouped: { label: string; key: string; results: SearchResultData[] }[] = [];
    const seen = new Set<string>();

    // Order: stories, entities, topics
    const typeOrder = ['story', 'entity', 'topic', 'organization', 'country', 'timeline', 'fix'];
    const typeLabels: Record<string, string> = {
      story: 'Stories',
      entity: 'Entities',
      topic: 'Topics',
      organization: 'Organizations',
      country: 'Countries',
      timeline: 'Timeline',
      fix: 'The Fix',
    };

    for (const type of typeOrder) {
      const items = results.filter((r) => {
        const key = `${r.type}:${r.id}`;
        if (seen.has(key)) return false;
        const matchType = r.type === type || (type === 'entity' && r.type === 'entity');
        if (matchType) {
          seen.add(key);
          return true;
        }
        return false;
      });
      if (items.length > 0) {
        grouped.push({ label: typeLabels[type] || type, key: type, results: items });
      }
    }
    return grouped;
  }, [results]);

  // Calculate flat index offsets
  const groupOffsets = useMemo(() => {
    let offset = 0;
    return groups.map((g) => {
      const start = offset;
      offset += g.results.length;
      return start;
    });
  }, [groups]);

  const totalResults = useMemo(() => groups.reduce((s, g) => s + g.results.length, 0), [groups]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalResults - 1));
      return;
    }
    if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      // Find the result at selectedIndex
      let idx = 0;
      for (const g of groups) {
        if (idx + g.results.length > selectedIndex) {
          const result = g.results[selectedIndex - idx];
          if (result) {
            addRecentSearch(query);
            window.location.href = result.url;
          }
          return;
        }
        idx += g.results.length;
      }
    }
  }, [selectedIndex, totalResults, groups, query, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl mx-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2A2A2A]">
          <svg className="w-5 h-5 text-[#A1A1AA] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, topics, entities, countries..."
            className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder-[#A1A1AA] outline-none"
            aria-label="Search input"
          />
          {loading && (
            <svg className="w-4 h-4 text-[#D4A843] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] text-[#A1A1AA] bg-[#151515] rounded border border-[#2A2A2A] shrink-0">ESC</kbd>
        </div>

        {/* Filter Tabs */}
        <FilterTabs active={filter} onChange={setFilter} />

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto" role="listbox" aria-label="Search results">
          {idle ? (
            <SearchEmpty query={query} onSearch={handleSearch} />
          ) : totalResults > 0 ? (
            <div className="py-2">
              {groups.map((group, gi) => {
                const offset = groupOffsets[gi];
                return (
                  <SearchGroup
                    key={group.key}
                    label={group.label}
                    results={group.results}
                    selectedIndex={selectedIndex}
                    globalOffset={offset}
                    onSelect={setSelectedIndex}
                  />
                );
              })}
            </div>
          ) : (
            <SearchEmpty query={query} onSearch={handleSearch} />
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[#2A2A2A] bg-[#0A0A0A]">
          <span className="text-[10px] text-[#A1A1AA]/40 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#151515] rounded text-[10px] border border-[#2A2A2A]">↑↓</kbd> Navigate
          </span>
          <span className="text-[10px] text-[#A1A1AA]/40 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#151515] rounded text-[10px] border border-[#2A2A2A]">⏎</kbd> Open
          </span>
          <span className="text-[10px] text-[#A1A1AA]/40 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#151515] rounded text-[10px] border border-[#2A2A2A]">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}
