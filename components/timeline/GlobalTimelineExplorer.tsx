'use client';

import { useState, useMemo } from 'react';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  source?: string;
  sourceSlug?: string | null;
  category?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function GlobalTimelineExplorer({ events }: { events: TimelineEvent[] }) {
  const [yearFilter, setYearFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const years = useMemo(() => {
    const ySet = new Set(events.map((e) => new Date(e.date).getFullYear()));
    return Array.from(ySet).sort((a, b) => b - a);
  }, [events]);

  const categories = useMemo(() => {
    const cSet = new Set(events.map((e) => e.category || 'general').filter(Boolean));
    return Array.from(cSet).sort();
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (yearFilter && new Date(e.date).getFullYear().toString() !== yearFilter) return false;
      if (categoryFilter && e.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.source || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, yearFilter, categoryFilter, searchQuery]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label htmlFor="timeline-search" className="block text-xs font-medium text-[#A1A1AA] mb-1.5 uppercase tracking-wider">Search</label>
          <input
            id="timeline-search"
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
            placeholder="Search events..."
            className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F5F5F5] text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 placeholder:text-[#A1A1AA]/50"
          />
        </div>
        <div>
          <label htmlFor="year-filter" className="block text-xs font-medium text-[#A1A1AA] mb-1.5 uppercase tracking-wider">Year</label>
          <select
            id="year-filter"
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); }}
            className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F5F5F5] text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category-filter" className="block text-xs font-medium text-[#A1A1AA] mb-1.5 uppercase tracking-wider">Category</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); }}
            className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F5F5F5] text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#A1A1AA]">
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== events.length && ` (filtered from ${events.length})`}
        </p>
      </div>

      <div className="relative" aria-label="Global timeline">
        <div className="absolute left-[31px] top-0 bottom-0 w-0.5 bg-[#2A2A2A]" aria-hidden="true" />
        <ul className="space-y-4">
          {filtered.map((event, i) => (
            <li key={i} className="relative flex gap-4">
              <div className="flex-shrink-0 w-[62px] pt-1 text-right">
                <time dateTime={event.date} className="text-xs font-semibold text-[#D4A843] whitespace-nowrap">
                  {formatDate(event.date)}
                </time>
              </div>
              <div className="relative flex items-start gap-4 flex-1">
                <span className="relative z-10 mt-1.5 w-3 h-3 rounded-full bg-[#D4A843] border-2 border-[#0A0A0A] flex-shrink-0" aria-hidden="true" />
                <div
                  className="flex-1 bg-[#151515] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#D4A843]/30 transition-colors cursor-pointer"
                  onClick={() => { setExpandedIndex(expandedIndex === i ? null : i); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedIndex(expandedIndex === i ? null : i); } }}
                  aria-expanded={expandedIndex === i}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#F5F5F5]">{event.title}</h3>
                    {event.category && (
                      <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#2A2A2A] text-[#A1A1AA] uppercase tracking-wider">
                        {event.category}
                      </span>
                    )}
                  </div>
                  {expandedIndex === i && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-[#A1A1AA] leading-relaxed">{event.description}</p>
                      {event.source && (
                        <div className="text-xs text-[#A1A1AA]">
                          Source:
                          {event.sourceSlug ? (
                            <a href={event.sourceSlug} className="ml-1 text-[#D4A843] hover:underline">{event.source}</a>
                          ) : (
                            <span className="ml-1">{event.source}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#A1A1AA] text-sm">No events match your filters.</p>
          <button
            onClick={() => { setYearFilter(''); setCategoryFilter(''); setSearchQuery(''); }}
            className="mt-2 text-[#D4A843] text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
