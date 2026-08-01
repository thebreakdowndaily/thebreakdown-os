'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '../ui/SearchBar';
import Pagination from '../ui/Pagination';
import FacetFilterPanel from './FacetFilterPanel';
import SortSelector, { SORT_OPTIONS } from './SortSelector';
import SavedViews from './SavedViews';
import FixHubCard from './FixHubCard';
import type { Fix } from '../../types/canonical';
import { MATURITY_ORDER } from '../../lib/fix-helpers';

interface FixHubClientProps {
  fixes: Fix[];
  facets: { field: string; counts: { value: string; count: number }[] }[];
  totalCount: number;
  initialFilters: Record<string, string[]>;
  initialSort: string;
  initialPage: number;
  initialQuery: string;
  pageSize: number;
}

export default function FixHubClient({
  fixes,
  facets,
  totalCount,
  initialFilters,
  initialSort,
  initialPage,
  initialQuery,
  pageSize,
}: FixHubClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Record<string, string[]>>(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [activeView, setActiveView] = useState('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const pushState = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === '0' || v === 'relevance' || v === '{}' || v === '[]' || v === '') {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    router.push(`/fix?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setPage(0);
    pushState({ q, page: '0' });
  }, [pushState]);

  const handleFilterChange = useCallback((field: string, values: string[]) => {
    setFilters(prev => {
      const next = { ...prev };
      if (values.length === 0) {
        delete next[field];
      } else {
        next[field] = values;
      }
      pushState({ filters: Object.keys(next).length > 0 ? JSON.stringify(next) : '{}', page: '0' });
      return next;
    });
    setPage(0);
  }, [pushState]);

  const handleSortChange = useCallback((s: string) => {
    setSort(s);
    pushState({ sort: s });
  }, [pushState]);

  const handleViewChange = useCallback((viewId: string, viewFilters: Record<string, string[]>) => {
    setActiveView(viewId);
    setFilters(viewFilters);
    setPage(0);
    pushState({ filters: JSON.stringify(viewFilters), page: '0' });
  }, [pushState]);

  const handleTagClick = useCallback((tag: string) => {
    setQuery(tag);
    setPage(0);
    pushState({ q: tag, page: '0' });
  }, [pushState]);

  const filteredFixes = useMemo(() => {
    let result = [...fixes];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(f =>
        f.headline.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.tags.some(t => t.toLowerCase().includes(q)) ||
        (f.problemStatement || '').toLowerCase().includes(q)
      );
    }

    Object.entries(filters).forEach(([field, values]) => {
      if (values.length === 0) return;
      result = result.filter(f => {
        const val = (f as unknown as Record<string, unknown>)[field];
        if (Array.isArray(val)) return values.some(v => val.includes(v));
        return values.includes(String(val));
      });
    });

    result.sort((a, b) => {
      switch (sort) {
        case 'evidence': return b.evidenceScore - a.evidenceScore;
        case 'freshness': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'maturity': return (MATURITY_ORDER[a.maturityStatus || 'proposed'] || 3) - (MATURITY_ORDER[b.maturityStatus || 'proposed'] || 3);
        case 'reading-time': return a.readingTime - b.readingTime;
        default: {
          const aScore = a.evidenceScore * 0.4 + (1 - MATURITY_ORDER[a.maturityStatus || 'proposed'] / 4) * 30 + (a.globalPrecedents?.length || 0) * 10;
          const bScore = b.evidenceScore * 0.4 + (1 - MATURITY_ORDER[b.maturityStatus || 'proposed'] / 4) * 30 + (b.globalPrecedents?.length || 0) * 10;
          return bScore - aScore;
        }
      }
    });

    return result;
  }, [fixes, query, filters, sort]);

  const totalPages = Math.ceil(filteredFixes.length / pageSize);
  const paginatedFixes = filteredFixes.slice(page * pageSize, (page + 1) * pageSize);

  const activeFilterChips = useMemo(() => {
    const chips: { field: string; value: string; label: string }[] = [];
    const LABELS: Record<string, Record<string, string>> = {
      primaryCategory: { fiscal: 'Fiscal', statutory: 'Statutory', administrative: 'Administrative', technological: 'Technological', institutional: 'Institutional', judicial: 'Judicial' },
      maturityStatus: { published: 'Published', expert_reviewed: 'Expert Reviewed', pilot: 'Pilot', proposed: 'Proposed' },
      evidenceGrade: { High: 'High', Moderate: 'Moderate', Low: 'Low' },
      timeToImpact: { 'short-term': 'Short-term', 'medium-term': 'Medium-term', 'long-term': 'Long-term' },
    };
    Object.entries(filters).forEach(([field, values]) => {
      values.forEach(v => {
        chips.push({ field, value: v, label: LABELS[field]?.[v] || v });
      });
    });
    return chips;
  }, [filters]);

  return (
    <div className="flex gap-6">
      {/* Desktop Facet Panel */}
      <aside className="hidden lg:block w-64 shrink-0" aria-label="Filter facets">
        <FacetFilterPanel
          facets={facets}
          selected={filters}
          onFilterChange={handleFilterChange}
        />
      </aside>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-[var(--color-surface-primary)] border-l border-[var(--color-border)] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-gray-400 hover:text-white" aria-label="Close filters">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <FacetFilterPanel
              facets={facets}
              selected={filters}
              onFilterChange={(field, values) => {
                handleFilterChange(field, values);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="flex-1">
            <SearchBar
              onChange={handleSearch}
              onSearch={handleSearch}
              placeholder="Search fixes by name, category, or problem..."
              initialValue={initialQuery}
              debounceMs={250}
            />
          </div>
          <div className="flex items-center gap-2">
            <SortSelector currentSort={sort} onSortChange={handleSortChange} />
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-xs font-medium"
              aria-label="Open filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters
              {activeFilterChips.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-brand-400)] text-[10px] font-bold text-gray-900">
                  {activeFilterChips.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Saved Views */}
        <div className="mb-5">
          <SavedViews activeView={activeView} onViewChange={handleViewChange} />
        </div>

        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5" aria-label="Active filters">
            <span className="text-xs text-gray-500">Active:</span>
            {activeFilterChips.map(chip => (
              <button
                key={`${chip.field}-${chip.value}`}
                onClick={() => handleFilterChange(chip.field, filters[chip.field].filter(v => v !== chip.value))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-brand-400)]/15 text-[var(--color-brand-400)] text-xs font-medium hover:bg-[var(--color-brand-400)]/25 transition-colors"
              >
                {chip.label}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            ))}
            <button
              onClick={() => {
                setFilters({});
                setActiveView('all');
                pushState({ filters: '{}', page: '0' });
              }}
              className="text-xs text-gray-500 hover:text-[var(--color-text-primary)] underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            {filteredFixes.length} {filteredFixes.length === 1 ? 'fix' : 'fixes'} found
            {query && <span> for &ldquo;{query}&rdquo;</span>}
          </p>
        </div>

        {/* Results Grid */}
        {paginatedFixes.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No fixes match your filters</h3>
            <p className="text-sm text-gray-400 mb-4">Try adjusting your search or removing some filters.</p>
            <button
              onClick={() => {
                setQuery('');
                setFilters({});
                setActiveView('all');
                pushState({ q: '', filters: '{}', page: '0' });
              }}
              className="text-sm text-[var(--color-brand-400)] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paginatedFixes.map((fix, i) => (
              <FixHubCard key={fix.id || fix.slug} fix={fix} index={i} onTagClick={handleTagClick} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              baseUrl="/fix"
              onPageChange={p => {
                setPage(p - 1);
                pushState({ page: String(p - 1) });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
