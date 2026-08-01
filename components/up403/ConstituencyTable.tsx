'use client';

import { useMemo } from 'react';
import type { ConstituencyRecord } from '@/lib/up403/types';
import { sortRecords } from './data';
import { PartyBadge } from './ui';
import { formatPct } from './data';

interface Props {
  records: ConstituencyRecord[];
  onSelect?: (rec: ConstituencyRecord) => void;
  selectedIds?: Set<string>;
  maxHeight?: string;
}

const COLUMNS: Array<{ key: keyof ConstituencyRecord; label: string; sortable?: boolean; numeric?: boolean }> = [
  { key: 'constituency_name', label: 'Constituency', sortable: true },
  { key: 'district', label: 'District', sortable: true },
  { key: 'reservation_type', label: 'Resv' },
  { key: 'winner_party_2022', label: '2022' },
  { key: 'victory_margin_pct_2022', label: 'Margin', numeric: true },
  { key: 'winner_party_2017', label: '2017' },
  { key: 'winner_party_2012', label: '2012' },
  { key: 'dna_classification', label: 'DNA' },
  { key: 'competitiveness_class', label: 'Comp' },
];

export function ConstituencyTable({ records, onSelect, selectedIds, maxHeight }: Props) {
  const sorted = useMemo(() => sortRecords(records, 'ac_number', 'asc'), [records]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#151515]">
      <div className={`overflow-x-auto ${maxHeight ?? 'max-h-[65vh]'} overflow-y-auto`}>
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#1C1C1C]">
            <tr className="border-b border-[#2A2A2A]">
              {onSelect ? <th className="w-8 px-3 py-2.5" /> : null}
              {COLUMNS.map(col => (
                <th key={col.key} className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-[#A1A1AA] whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(rec => {
              const isSel = selectedIds?.has(rec.canonical_constituency_id);
              return (
                <tr
                  key={rec.canonical_constituency_id}
                  onClick={onSelect ? () => { onSelect(rec); } : undefined}
                  className={`border-b border-[#232323] last:border-0 ${onSelect ? 'cursor-pointer hover:bg-[#1C1C1C]' : ''} ${isSel ? 'bg-[#D4A843]/5' : ''}`}
                >
                  {onSelect ? (
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={!!isSel}
                        onChange={() => { onSelect(rec); }}
                        aria-label={`Select ${rec.constituency_name}`}
                      />
                    </td>
                  ) : null}
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-[#F5F5F5]">{rec.constituency_name}</div>
                    <div className="text-xs text-[#A1A1AA]">AC-{rec.ac_number} · {rec.pc_name}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[#A1A1AA]">{rec.district}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-[#A1A1AA]">{rec.reservation_type || 'GEN'}</span>
                  </td>
                  <td className="px-3 py-2.5"><PartyBadge party={rec.winner_party_2022} /></td>
                  <td className="px-3 py-2.5 text-right text-[#A1A1AA]">{formatPct(rec.victory_margin_pct_2022)}</td>
                  <td className="px-3 py-2.5"><PartyBadge party={rec.winner_party_2017} /></td>
                  <td className="px-3 py-2.5"><PartyBadge party={rec.winner_party_2012} /></td>
                  <td className="px-3 py-2.5 text-xs text-[#A1A1AA]">{rec.dna_classification || '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-[#A1A1AA]">{rec.competitiveness_class || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function useLocalSearch(records: ConstituencyRecord[], query: string): ConstituencyRecord[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter(rec => {
      return [
        rec.constituency_name,
        rec.district,
        rec.division,
        rec.region,
        rec.pc_name,
        rec.current_mla_name,
        rec.current_mp_name,
        rec.winner_2012,
        rec.winner_2017,
        rec.winner_2022,
        rec.ls2024_pc_winner,
        rec.winner_party_2012,
        rec.winner_party_2017,
        rec.winner_party_2022,
        rec.current_mla_party,
        rec.current_mp_party,
      ]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(q));
    });
  }, [records, query]);
}
