'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUp403Data, winnerRow, formatPct, formatNumber } from '@/components/up403/data';
import { PartyBadge } from '@/components/up403/ui';
import { downloadCsv } from '@/lib/up403/export';
import { toSlug } from '@/lib/up403/slug';
import { trackReaderEvent } from '@/lib/up403/reader-events';
import type { ConstituencyRecord } from '@/lib/up403/types';

const MAX_COMPARE = 5;

type Rec = ConstituencyRecord;

interface CompareRow {
  label: string;
  render: (r: Rec) => React.ReactNode;
}

const ROWS: CompareRow[] = [
  { label: 'District', render: r => r.district || '—' },
  { label: 'Division', render: r => r.division || '—' },
  { label: 'Reservation', render: r => r.reservation_type || 'GEN' },
  { label: 'PC', render: r => `${r.pc_name} (PC-${String(r.pc_number)})` },
  { label: 'DNA', render: r => r.dna_classification || '—' },
  { label: 'Competitiveness', render: r => r.competitiveness_class || '—' },
  { label: 'Avg margin', render: r => formatPct(r.competitiveness_avg_margin_pct) },
  { label: 'Seat volatility', render: r => formatNumber(r.seat_volatility_index) },
  { label: '2022 winner', render: r => `${r.winner_2022 || '—'} (${formatPct(r.victory_margin_pct_2022)})` },
  { label: '2022 margin', render: r => formatPct(r.victory_margin_pct_2022) },
  { label: '2022 runner-up party', render: r => r.runner_up_party_2022 || '—' },
  { label: '2017 winner', render: r => `${r.winner_2017 || '—'} (${formatPct(r.victory_margin_pct_2017)})` },
  { label: '2012 winner', render: r => `${r.winner_2012 || '—'} (${formatPct(r.victory_margin_pct_2012)})` },
  { label: 'Current MLA', render: r => `${r.current_mla_name || '—'} (${r.current_mla_party || '—'})` },
  { label: 'Current MP', render: r => `${r.current_mp_name || '—'} (${r.current_mp_party || '—'})` },
  { label: '2024 LS party', render: r => r.ls2024_pc_winner_party || '—' },
  { label: 'Governance issues', render: r => formatNumber(r.governance_issue_count) },
  { label: 'Linked projects', render: r => formatNumber(r.linked_projects_count) },
];

export default function Up403ComparePanel() {
  const searchParams = useSearchParams();
  const initialIds = (searchParams.get('ids') ?? '').split(',').filter(Boolean);
  const { records, loading, error, byId } = useUp403Data();
  const [picked, setPicked] = useState<string[]>(initialIds.slice(0, MAX_COMPARE));
  const [search, setSearch] = useState('');

  const available = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records
      .filter(rec => !picked.includes(rec.canonical_constituency_id))
      .filter(rec => {
        if (!q) return true;
        return [rec.constituency_name, rec.district, rec.division, rec.pc_name].some(v => v.toLowerCase().includes(q));
      })
      .slice(0, 12);
  }, [records, picked, search]);

  const selected = useMemo(() => picked.map(id => byId.get(id)).filter((r): r is Rec => !!r), [picked, byId]);

  const toggle = (id: string) => {
    const adding = !picked.includes(id);
    trackReaderEvent(adding ? 'up403_compare_seat_added' : 'up403_compare_seat_removed', { constituency_id: id, total: picked.length + (adding ? 1 : -1) });
    setPicked(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const exportRows = () => {
    trackReaderEvent('up403_compare_export', { count: selected.length });
    downloadCsv(selected, 'UP403-compare.csv');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#F5F5F5]">Compare constituencies</h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">Side-by-side analysis of 2–5 seats — compare elections, margins, DNA and representation.</p>
        </div>
        <button
          onClick={exportRows}
          disabled={selected.length === 0}
          className="rounded-lg border border-[#2A2A2A] px-3 py-2 text-sm text-[#E5E5E5] hover:border-[#22C55E]/40 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:outline-none"
        >
          Export comparison CSV
        </button>
      </header>

      {error ? <div className="rounded-2xl border border-[#FF3B30]/40 bg-[#FF3B30]/10 p-4 text-sm text-[#FF6B61]">Failed to load: {error}</div> : null}

      <section aria-label="Select constituencies" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            placeholder="Search to add constituencies…"
            className="w-72 rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-[#E5E5E5] outline-none placeholder:text-[#6B6B6B] focus-visible:ring-2 focus-visible:ring-[#D4A843]"
          />
          <span className="text-xs text-[#6B6B6B]">{selected.length}/{MAX_COMPARE} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {available.map(rec => (
            <button
              key={rec.canonical_constituency_id}
              onClick={() => { toggle(rec.canonical_constituency_id); }}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:outline-none ${picked.includes(rec.canonical_constituency_id) ? 'border-[#D4A843]/60 bg-[#D4A843]/10 text-[#D4A843]' : 'border-[#2A2A2A] bg-[#111111] text-[#E5E5E5] hover:border-[#D4A843]/30'}`}
            >
              {rec.constituency_name}
            </button>
          ))}
          {available.length === 0 && !loading ? <span className="text-sm text-[#6B6B6B]">No more constituencies match.</span> : null}
        </div>
      </section>

      {loading ? (
        <div className="py-16 text-center text-sm text-[#A1A1AA]">Loading…</div>
      ) : selected.length === 0 ? (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-10 text-center text-sm text-[#A1A1AA]">
          Select at least two constituencies to compare.
        </div>
      ) : (
        <section aria-label="Comparison table" className="overflow-x-auto rounded-2xl border border-[#2A2A2A] bg-[#151515]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#1C1C1C]">
              <tr className="border-b border-[#2A2A2A]">
                <th className="px-3 py-3 text-xs font-medium uppercase tracking-wide text-[#A1A1AA]">Field</th>
                {selected.map(rec => (
                  <th key={rec.canonical_constituency_id} className="min-w-[160px] px-3 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/up403/${toSlug(rec.canonical_constituency_id)}`} className="font-medium text-[#F5F5F5] hover:text-[#D4A843]">
                        {rec.constituency_name}
                      </Link>
                      <button onClick={() => { toggle(rec.canonical_constituency_id); }} className="text-xs text-[#6B6B6B] hover:text-[#FF6B61] focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:outline-none" aria-label={`Remove ${rec.constituency_name}`}>
                        ✕
                      </button>
                    </div>
                    <div className="text-xs font-normal text-[#6B6B6B]">AC-{rec.ac_number}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#232323]">
                <td className="px-3 py-2 text-xs text-[#A1A1AA]">2022 party</td>
                {selected.map(rec => (
                  <td key={rec.canonical_constituency_id} className="px-3 py-2"><PartyBadge party={rec.winner_party_2022} /></td>
                ))}
              </tr>
              {ROWS.map(row => (
                <tr key={row.label} className="border-b border-[#232323] last:border-0">
                  <td className="px-3 py-2.5 text-xs text-[#A1A1AA]">{row.label}</td>
                  {selected.map(rec => (
                    <td key={rec.canonical_constituency_id} className="px-3 py-2.5 text-[#E5E5E5]">{row.render(rec)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {selected.length >= 2 ? (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Election matrix">
          {[2012, 2017, 2022].map(year => (
            <div key={year} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">{year} results</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selected.map(rec => {
                  const row = winnerRow(rec, year as 2012 | 2017 | 2022);
                  return (
                    <div key={rec.canonical_constituency_id} className="rounded-lg bg-[#111111] p-3">
                      <div className="text-xs text-[#A1A1AA]">{rec.constituency_name}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm text-[#F5F5F5]">{row.winner}</span>
                        <PartyBadge party={row.party} />
                      </div>
                      <div className="mt-1 text-xs text-[#6B6B6B]">Margin {formatPct(row.margin)} · share {formatPct(row.voteShare)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
