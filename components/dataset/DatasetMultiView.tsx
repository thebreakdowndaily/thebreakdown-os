'use client';

import { useState, useMemo } from 'react';
import type { Dataset } from '@/types/canonical';

type ViewMode = 'card' | 'grid' | 'table';

interface DatasetMultiViewProps {
  datasets: Dataset[];
}

const categoryColors: Record<string, string> = {
  economy: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  climate: 'bg-green-500/20 text-green-400 border-green-500/30',
  health: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  education: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  demographics: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  energy: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  trade: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  governance: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  technology: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  social: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
};

function CardView({ datasets }: { datasets: Dataset[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {datasets.map((dataset) => (
        <a
          key={dataset.id}
          href={`/dataset/${dataset.slug}`}
          className="block p-5 bg-[#151515] rounded-xl border border-[#2A2A2A] hover:border-[#D4A843] transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#F5F5F5] group-hover:text-[#D4A843] transition-colors">{dataset.title}</h2>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColors[dataset.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
              {dataset.category}
            </span>
          </div>
          <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-2">{dataset.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#A1A1AA]">
            <span className="inline-flex items-center gap-1">{dataset.frequency}</span>
            <span>{dataset.metrics.length} metrics</span>
            <span>v{dataset.versions[0]?.version || '0'}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

function GridView({ datasets }: { datasets: Dataset[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {datasets.map((dataset) => (
        <a
          key={dataset.id}
          href={`/dataset/${dataset.slug}`}
          className="flex flex-col items-center text-center p-4 bg-[#151515] rounded-xl border border-[#2A2A2A] hover:border-[#D4A843] transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#2A2A2A] flex items-center justify-center mb-3 group-hover:bg-[#D4A843]/10 transition-colors">
            <svg className="w-6 h-6 text-[#A1A1AA] group-hover:text-[#D4A843] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xs font-semibold text-[#F5F5F5] group-hover:text-[#D4A843] transition-colors line-clamp-2 mb-1">{dataset.title}</h3>
          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${categoryColors[dataset.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
            {dataset.category}
          </span>
        </a>
      ))}
    </div>
  );
}

function TableView({ datasets }: { datasets: Dataset[] }) {
  return (
    <div className="overflow-x-auto bg-[#151515] rounded-xl border border-[#2A2A2A]">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-[#2A2A2A]">
            <th className="px-4 py-3 text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Title</th>
            <th className="px-4 py-3 text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Category</th>
            <th className="px-4 py-3 text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Frequency</th>
            <th className="px-4 py-3 text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Metrics</th>
            <th className="px-4 py-3 text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Version</th>
            <th className="px-4 py-3 text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Source</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((dataset) => (
            <tr key={dataset.id} className="border-b border-[#2A2A2A]/50 last:border-0 hover:bg-[#1A1A1A] transition-colors">
              <td className="px-4 py-3">
                <a href={`/dataset/${dataset.slug}`} className="text-[#F5F5F5] font-medium hover:text-[#D4A843] transition-colors">
                  {dataset.title}
                </a>
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColors[dataset.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                  {dataset.category}
                </span>
              </td>
              <td className="px-4 py-3 text-[#A1A1AA]">{dataset.frequency}</td>
              <td className="px-4 py-3 text-[#A1A1AA]">{dataset.metrics.length}</td>
              <td className="px-4 py-3 text-[#A1A1AA]">v{dataset.versions[0]?.version || '0'}</td>
              <td className="px-4 py-3 text-[#A1A1AA] max-w-[200px] truncate">{dataset.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DatasetMultiView({ datasets }: DatasetMultiViewProps) {
  const [view, setView] = useState<ViewMode>('card');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = useMemo(() => {
    const cSet = new Set(datasets.map((d) => d.category).filter(Boolean));
    return Array.from(cSet).sort();
  }, [datasets]);

  const filtered = useMemo(() => {
    return datasets.filter((d) => {
      if (search) {
        const q = search.toLowerCase();
        if (!d.title.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q) && !(d.tags || []).some((t) => t.toLowerCase().includes(q))) return false;
      }
      if (categoryFilter && d.category !== categoryFilter) return false;
      return true;
    });
  }, [datasets, search, categoryFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              placeholder="Search datasets..."
              className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F5F5F5] text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 placeholder:text-[#A1A1AA]/50"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); }}
            className="bg-[#151515] border border-[#2A2A2A] text-[#F5F5F5] text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#151515] rounded-lg border border-[#2A2A2A] p-0.5">
          {(['card', 'grid', 'table'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => { setView(v); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                view === v ? 'bg-[#D4A843] text-[#0A0A0A]' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
              }`}
              aria-label={`${v} view`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#A1A1AA] mb-4">
        {filtered.length} dataset{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== datasets.length && ` (filtered from ${datasets.length})`}
      </p>

      {view === 'card' && <CardView datasets={filtered} />}
      {view === 'grid' && <GridView datasets={filtered} />}
      {view === 'table' && <TableView datasets={filtered} />}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#A1A1AA] text-sm">No datasets match your filters.</p>
          <button
            onClick={() => { setSearch(''); setCategoryFilter(''); }}
            className="mt-2 text-[#D4A843] text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
