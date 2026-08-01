'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUp403Data, winnerRow, formatNumber, formatPct, dataStatusBadge } from '@/components/up403/data';
import { PartyBadge, StatusPill } from '@/components/up403/ui';
import { useCollections } from '@/components/up403/collections';
import { downloadJson, downloadCsv } from '@/lib/up403/export';

export default function Up403ConstituencyPage() {
  const params = useParams<{ id: string }>();
  const { loading, error, byId } = useUp403Data();
  const { collections, addToCollection, createCollection } = useCollections();
  const [saveNote, setSaveNote] = useState('');
  const [targetCollection, setTargetCollection] = useState<string>('');

  const rec = byId.get(params.id);

  const rows = useMemo(() => (rec ? ([2012, 2017, 2022] as const).map(y => ({ year: y, ...winnerRow(rec, y) })) : []), [rec]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#A1A1AA]">Loading constituency record…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-[#FF3B30]/40 bg-[#FF3B30]/10 p-6 text-sm text-[#FF6B61]">Failed to load: {error}</div>;
  }

  if (!rec) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-10 text-center">
        <p className="text-sm text-[#A1A1AA]">Constituency not found.</p>
        <Link href="/up403/search" className="mt-2 inline-block text-sm text-[#D4A843] hover:underline">Search again →</Link>
      </div>
    );
  }

  const handleSave = () => {
    if (targetCollection) {
      addToCollection(targetCollection, [rec.canonical_constituency_id]);
    } else if (saveNote.trim()) {
      createCollection(`Research: ${rec.constituency_name}`, saveNote.trim(), [rec.canonical_constituency_id]);
      setSaveNote('');
    }
  };

  return (
    <div className="space-y-8">
      <nav className="text-xs text-[#6B6B6B]" aria-label="Breadcrumb">
        <Link href="/up403" className="hover:text-[#D4A843]">Research</Link>
        <span className="mx-2">/</span>
        <Link href="/up403/explore" className="hover:text-[#D4A843]">Explore</Link>
        <span className="mx-2">/</span>
        <span className="text-[#A1A1AA]">{rec.constituency_name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#F5F5F5]">{rec.constituency_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#A1A1AA]">
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">AC-{rec.ac_number}</span>
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">{rec.pc_name} · PC-{rec.pc_number}</span>
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">{rec.district} district</span>
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">{rec.division} division</span>
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">{rec.reservation_type || 'GEN'}</span>
          </div>
          <p className="mt-1 text-xs text-[#6B6B6B]">{rec.canonical_constituency_id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/up403/timeline/${rec.canonical_constituency_id}`} className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-[#E5E5E5] hover:border-[#D4A843]/40">
            Timeline
          </Link>
          <Link href={`/up403/evidence/${rec.canonical_constituency_id}`} className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-[#E5E5E5] hover:border-[#D4A843]/40">
            Evidence
          </Link>
          <Link href={`/up403/compare?ids=${rec.canonical_constituency_id}`} className="rounded-lg bg-[#D4A843] px-3 py-2 text-sm font-semibold text-black hover:opacity-90">
            Compare
          </Link>
          <button
            onClick={() => { downloadJson([rec], `UP403-${String(rec.ac_number)}-${rec.constituency_name.replace(/\s+/g, '-')}.json`); }}
            className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-[#E5E5E5] hover:border-[#22C55E]/40"
          >
            JSON
          </button>
          <button
            onClick={() => { downloadCsv([rec], `UP403-${String(rec.ac_number)}-${rec.constituency_name.replace(/\s+/g, '-')}.csv`); }}
            className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-[#E5E5E5] hover:border-[#22C55E]/40"
          >
            CSV
          </button>
        </div>
      </header>

      <section aria-label="Election history" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Election history</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {rows.map(row => (
            <div key={row.year} className={`rounded-xl border p-4 ${row.year === 2022 ? 'border-[#D4A843]/40 bg-[#D4A843]/5' : 'border-[#2A2A2A] bg-[#111111]'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#F5F5F5]">{row.year}</span>
                {row.year === 2022 ? <span className="text-[10px] uppercase tracking-widest text-[#D4A843]">Latest</span> : null}
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">Winner</span>
                  <span className="flex items-center gap-2 text-right text-[#F5F5F5]">{row.winner} <PartyBadge party={row.party} /></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">Vote share</span>
                  <span className="text-[#F5F5F5]">{formatPct(row.voteShare)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">Margin</span>
                  <span className="text-[#F5F5F5]">{formatPct(row.margin)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA]">Runner-up</span>
                  <PartyBadge party={row.runnerUpParty} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#6B6B6B]">{rec.seat_history_summary || 'No seat history summary recorded.'}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Analysis">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Political DNA</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#D4A843]/15 px-3 py-1 text-sm font-semibold text-[#D4A843]">{rec.dna_classification || 'Unclassified'}</span>
            {rec.dna_sub_type ? <span className="rounded-lg bg-[#1C1C1C] px-3 py-1 text-sm text-[#A1A1AA]">{rec.dna_sub_type}</span> : null}
          </div>
          <p className="mt-3 text-sm text-[#A1A1AA]">{rec.dna_reasoning || 'No reasoning recorded.'}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <StatusPill label={`Confidence: ${rec.dna_confidence || 'n/a'}`} kind={rec.dna_confidence === 'HIGH' ? 'available' : 'neutral'} />
            <span className="text-[#6B6B6B]">Algorithm: {rec.dna_algorithm_version || 'n/a'}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Competitiveness & stability</h2>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg bg-[#22C55E]/15 px-3 py-1 text-sm font-semibold text-[#22C55E]">{rec.competitiveness_class || 'n/a'}</span>
            <span className="rounded-lg bg-[#1C1C1C] px-3 py-1 text-sm text-[#A1A1AA]">Trend: {rec.competitiveness_trend || 'n/a'}</span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-[#111111] p-3"><dt className="text-xs text-[#6B6B6B]">Avg margin</dt><dd className="mt-1 font-semibold text-[#F5F5F5]">{formatPct(rec.competitiveness_avg_margin_pct)}</dd></div>
            <div className="rounded-lg bg-[#111111] p-3"><dt className="text-xs text-[#6B6B6B]">Seat volatility</dt><dd className="mt-1 font-semibold text-[#F5F5F5]">{formatNumber(rec.seat_volatility_index)}</dd></div>
            <div className="rounded-lg bg-[#111111] p-3"><dt className="text-xs text-[#6B6B6B]">Party continuity</dt><dd className="mt-1 font-semibold text-[#F5F5F5]">{formatNumber(rec.party_continuity_score)}</dd></div>
            <div className="rounded-lg bg-[#111111] p-3"><dt className="text-xs text-[#6B6B6B]">Most persistent</dt><dd className="mt-1 font-semibold text-[#F5F5F5]">{rec.most_persistent_party || '—'}</dd></div>
            <div className="rounded-lg bg-[#111111] p-3"><dt className="text-xs text-[#6B6B6B]">Unique winners</dt><dd className="mt-1 font-semibold text-[#F5F5F5]">{formatNumber(rec.unique_winners_across_elections)}</dd></div>
            <div className="rounded-lg bg-[#111111] p-3"><dt className="text-xs text-[#6B6B6B]">Trajectory</dt><dd className="mt-1 font-semibold text-[#F5F5F5]">{rec.trajectory_steps_compact || '—'}</dd></div>
          </dl>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Representation">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Current MLA</h2>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-lg font-semibold text-[#F5F5F5]">{rec.current_mla_name || 'n/a'}</div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <PartyBadge party={rec.current_mla_party} />
                <span className="text-[#A1A1AA]">{rec.current_mla_status || ''}</span>
              </div>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[#6B6B6B]">Elected via</dt><dd className="text-[#E5E5E5]">{rec.current_mla_elected_via || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-[#6B6B6B]">Change type</dt><dd className="text-[#E5E5E5]">{rec.current_mla_representation_change_type || '—'}</dd></div>
            {rec.current_mla_by_election_date ? <div className="flex justify-between"><dt className="text-[#6B6B6B]">By-election</dt><dd className="text-[#E5E5E5]">{rec.current_mla_by_election_date}</dd></div> : null}
            {rec.current_mla_vacancy_reason ? <div className="flex justify-between"><dt className="text-[#6B6B6B]">Vacancy</dt><dd className="text-[#E5E5E5]">{rec.current_mla_vacancy_reason}</dd></div> : null}
          </dl>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Lok Sabha alignment</h2>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-lg font-semibold text-[#F5F5F5]">{rec.current_mp_name || 'n/a'}</div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <PartyBadge party={rec.current_mp_party} />
                <span className="text-[#A1A1AA]">{rec.current_mp_pc_name}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[#2A2A2A] bg-[#111111] p-3">
            <div className="text-xs uppercase tracking-widest text-[#6B6B6B]">2024 Lok Sabha result</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-[#F5F5F5]">{rec.ls2024_pc_winner || 'n/a'}</span>
              <PartyBadge party={rec.ls2024_pc_winner_party} />
              {rec.ls2024_party_changed_flag ? <span className="rounded bg-[#D4A843]/15 px-2 py-0.5 text-xs text-[#D4A843]">Party changed vs incumbent</span> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3" aria-label="Context">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Geography & context</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-[#6B6B6B]">Area</dt><dd className="mt-0.5 text-[#E5E5E5]">{rec.area_sq_km ? `${formatNumber(rec.area_sq_km)} km²` : '—'}</dd></div>
            <div><dt className="text-xs text-[#6B6B6B]">Terrain</dt><dd className="mt-0.5 text-[#E5E5E5]">{rec.terrain_type || '—'}</dd></div>
            <div><dt className="text-xs text-[#6B6B6B]">Rivers</dt><dd className="mt-0.5 text-[#E5E5E5]">{rec.major_rivers || '—'}</dd></div>
            <div><dt className="text-xs text-[#6B6B6B]">Sub-divisions</dt><dd className="mt-0.5 text-[#E5E5E5]">{formatNumber(rec.sub_divisions_count)}</dd></div>
            <div><dt className="text-xs text-[#6B6B6B]">Tehsils</dt><dd className="mt-0.5 text-[#E5E5E5]">{formatNumber(rec.tehsils_count)}</dd></div>
            <div><dt className="text-xs text-[#6B6B6B]">Dev. blocks</dt><dd className="mt-0.5 text-[#E5E5E5]">{formatNumber(rec.development_blocks_count)}</dd></div>
          </dl>
          <div className="mt-4 border-t border-[#232323] pt-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest text-[#6B6B6B]">Governance status</h3>
              <span className={`text-xs ${dataStatusBadge(rec.governance_availability_status)} rounded px-2 py-0.5`}>{rec.governance_availability_status || 'n/a'}</span>
            </div>
            <p className="text-sm text-[#A1A1AA]">{rec.governance_issue_summary || 'No governance issue summary recorded at constituency level.'}</p>
            <div className="mt-2 flex gap-4 text-sm">
              <span className="text-[#A1A1AA]">Issues: <strong className="text-[#F5F5F5]">{rec.governance_issue_count}</strong></span>
              <span className="text-[#A1A1AA]">Projects: <strong className="text-[#F5F5F5]">{rec.linked_projects_count}</strong></span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Save to collection</h2>
          <div className="space-y-3">
            <select
              value={targetCollection}
              onChange={e => { setTargetCollection(e.target.value); }}
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-[#E5E5E5] outline-none"
              aria-label="Select collection"
            >
              <option value="">Save to existing collection…</option>
              {collections.map(col => (
                <option key={col.id} value={col.id}>{col.name} ({col.memberIds.length})</option>
              ))}
            </select>
            <input
              value={saveNote}
              onChange={e => { setSaveNote(e.target.value); }}
              placeholder="Or create a new collection (name)"
              className="w-full rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-[#E5E5E5] outline-none placeholder:text-[#6B6B6B]"
            />
            <button
              onClick={handleSave}
              disabled={!targetCollection && !saveNote.trim()}
              className="w-full rounded-lg bg-[#D4A843] px-3 py-2 text-sm font-semibold text-black disabled:opacity-40"
            >
              Save
            </button>
            <p className="text-xs text-[#6B6B6B]">Collections are stored locally in your browser and exportable to CSV/JSON.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
