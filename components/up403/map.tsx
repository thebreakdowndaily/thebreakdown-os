'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useUp403Data } from '@/components/up403/data';
import { toSlug } from '@/lib/up403/slug';
import { formatNumber } from '@/lib/up403/format';
import { trackReaderEvent } from '@/lib/up403/reader-events';

type Metric = 'party' | 'dna' | 'competitiveness';

const PARTY_COLORS: Record<string, string> = {
  BJP: '#D4A843',
  SP: '#22C55E',
  INC: '#38BDF8',
  BSP: '#3B82F6',
};

const DNA_COLORS: Record<string, string> = {
  CONTESTED: '#64748B',
  POST_2014_REALIGNMENT: '#D4A843',
  SP_FORTRESS: '#22C55E',
  INCUMBENT_STRONGHOLD: '#38BDF8',
  SWING: '#F43F5E',
};

const COMPETITIVENESS_COLORS: Record<string, string> = {
  ULTRA_SAFE: '#22C55E',
  SAFE: '#84CC16',
  LEAN: '#D4A843',
  COMPETITIVE: '#F97316',
  HIGHLY_COMPETITIVE: '#F43F5E',
  MARGINAL: '#EF4444',
};

const REGIONS = ['Western UP (NCR + Western)', 'Central UP', 'Eastern UP (Gangetic Plain)'] as const;

const METRICS: Array<{ id: Metric; label: string }> = [
  { id: 'party', label: 'Party (MLA)' },
  { id: 'dna', label: 'Political DNA' },
  { id: 'competitiveness', label: 'Competitiveness' },
];

function colorFor(rec: { current_mla_party?: string; dna_classification?: string; competitiveness_class?: string }, metric: Metric): string {
  if (metric === 'party') return PARTY_COLORS[rec.current_mla_party || ''] || '#3A3A3A';
  if (metric === 'dna') return DNA_COLORS[rec.dna_classification || ''] || '#3A3A3A';
  return COMPETITIVENESS_COLORS[rec.competitiveness_class || ''] || '#3A3A3A';
}

function legendFor(metric: Metric): Array<{ label: string; color: string }> {
  if (metric === 'party') {
    return Object.entries(PARTY_COLORS).map(([label, color]) => ({ label, color }));
  }
  if (metric === 'dna') {
    return Object.entries(DNA_COLORS).map(([label, color]) => ({ label: label.replace(/_/g, ' '), color }));
  }
  return Object.entries(COMPETITIVENESS_COLORS).map(([label, color]) => ({ label: label.replace(/_/g, ' '), color }));
}

export default function Up403Map() {
  const { records, loading, error } = useUp403Data();
  const [metric, setMetric] = useState<Metric>('party');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [valueFilter, setValueFilter] = useState<string>('');

  const filterValues = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      const v = metric === 'party' ? r.current_mla_party : metric === 'dna' ? r.dna_classification : r.competitiveness_class;
      if (v) set.add(v);
    }
    return [...set].sort();
  }, [records, metric]);

  const regions = useMemo(() => REGIONS.map(region => ({
    region,
    seats: records
      .filter(r => !regionFilter || r.region === regionFilter)
      .filter(r => r.region === region),
  })), [records, regionFilter]);

  const matches = (r: { current_mla_party?: string; dna_classification?: string; competitiveness_class?: string }) => {
    if (!valueFilter) return true;
    const v = metric === 'party' ? r.current_mla_party : metric === 'dna' ? r.dna_classification : r.competitiveness_class;
    return v === valueFilter;
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#A1A1AA]">Loading 403 constituencies…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-[#FF3B30]/40 bg-[#FF3B30]/10 p-6 text-sm text-[#FF6B61]">Failed to load: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Colour by</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Map colour metric">
          {METRICS.map(m => (
            <button
              key={m.id}
              onClick={() => { setMetric(m.id); setValueFilter(''); trackReaderEvent('up403_map_metric_toggle', { metric: m.id }); }}
              aria-pressed={metric === m.id}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:outline-none ${metric === m.id ? 'bg-[#D4A843] font-semibold text-black' : 'border border-[#2A2A2A] bg-[#111111] text-[#A1A1AA] hover:text-[#F5F5F5]'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-[#A1A1AA]">
            Region
            <select
              value={regionFilter}
              onChange={e => { setRegionFilter(e.target.value); }}
              className="rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 text-sm text-[#E5E5E5] outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]"
            >
              <option value="">All regions</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-[#A1A1AA]">
            {metric === 'party' ? 'Party' : metric === 'dna' ? 'DNA' : 'Class'}
            <select
              value={valueFilter}
              onChange={e => { setValueFilter(e.target.value); }}
              className="rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 text-sm text-[#E5E5E5] outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]"
            >
              <option value="">All</option>
              {filterValues.map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3" aria-label="Legend">
          {legendFor(metric).map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-6" aria-label="Constituency map by region">
        {regions.map(({ region, seats }) => (
          <div key={region}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F5F5F5]">{region}</h3>
              <span className="text-xs text-[#A1A1AA]">{formatNumber(seats.length)} seats</span>
            </div>
            {seats.length > 0 ? (
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-[3px]" aria-label={`${region} constituencies`}>
                {seats.map(rec => {
                  const active = matches(rec);
                  const color = colorFor(rec, metric);
                  return (
                    <li key={rec.canonical_constituency_id}>
                      <Link
                        href={`/up403/${toSlug(rec.canonical_constituency_id)}`}
                        title={`${rec.constituency_name} — ${metric === 'party' ? rec.current_mla_party : metric === 'dna' ? rec.dna_classification : rec.competitiveness_class}`}
                        aria-label={`${rec.constituency_name} assembly constituency`}
                        onClick={() => { trackReaderEvent('up403_map_tile_open', { constituency_id: rec.canonical_constituency_id, name: rec.constituency_name, party: rec.current_mla_party, metric }); }}
                        className={`block aspect-square w-full rounded-[2px] transition-opacity hover:ring-1 hover:ring-[#F5F5F5] focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:outline-none ${active ? '' : 'opacity-15'}`}
                        style={{ backgroundColor: color }}
                      />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[#6B6B6B]">No seats match the current filter in this region.</p>
            )}
          </div>
        ))}
      </section>

      <p className="text-xs leading-relaxed text-[#6B6B6B]">
        Schematic map: each tile is one assembly constituency. Positions are grid-arranged, not geographic — the frozen dataset
        has no boundary geometry. Hover for the label; select a tile to open the constituency profile. Colours are derived from
        the dataset (party = current MLA party, DNA = UP403 DNA Algorithm v1.0.0, competitiveness = UP403 Competitiveness Algorithm v1.0.0).
      </p>
    </div>
  );
}
