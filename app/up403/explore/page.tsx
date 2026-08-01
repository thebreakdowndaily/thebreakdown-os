'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useUp403Data } from '@/components/up403/data';
import { PartyBadge } from '@/components/up403/ui';

type Tab = 'mla' | 'mp' | 'party' | 'constituencies';

interface PersonRow {
  name: string;
  party: string;
  count: number;
  acs: string[];
  representativeId: string;
}

export default function Up403ExplorePage() {
  const [tab, setTab] = useState<Tab>('mla');
  const { records, loading, error } = useUp403Data();

  const mlas = useMemo<PersonRow[]>(() => {
    const map = new Map<string, PersonRow>();
    records.forEach(rec => {
      if (!rec.current_mla_name) return;
      const key = rec.current_mla_name;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.acs.push(rec.constituency_name);
      } else {
        map.set(key, {
          name: key,
          party: rec.current_mla_party || 'N/A',
          count: 1,
          acs: [rec.constituency_name],
          representativeId: rec.canonical_constituency_id,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [records]);

  const mps = useMemo<PersonRow[]>(() => {
    const map = new Map<string, PersonRow>();
    records.forEach(rec => {
      if (!rec.current_mp_name) return;
      const key = rec.current_mp_name;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.acs.push(rec.pc_name);
      } else {
        map.set(key, {
          name: key,
          party: rec.current_mp_party || 'N/A',
          count: 1,
          acs: [rec.pc_name],
          representativeId: rec.canonical_constituency_id,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [records]);

  const parties = useMemo(() => {
    const map = new Map<string, { seats2022: number; seats2017: number; seats2012: number }>();
    records.forEach(rec => {
      const u = (p: string) => (map.get(p) ?? { seats2022: 0, seats2017: 0, seats2012: 0 });
      const w22 = rec.winner_party_2022;
      const w17 = rec.winner_party_2017;
      const w12 = rec.winner_party_2012;
      if (w22) { const r = u(w22); r.seats2022 += 1; map.set(w22, r); }
      if (w17) { const r = u(w17); r.seats2017 += 1; map.set(w17, r); }
      if (w12) { const r = u(w12); r.seats2012 += 1; map.set(w12, r); }
    });
    return Array.from(map.entries()).sort((a, b) => b[1].seats2022 - a[1].seats2022);
  }, [records]);

  const TABS: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'mla', label: 'MLAs', count: mlas.length },
    { id: 'mp', label: 'MPs', count: mps.length },
    { id: 'party', label: 'Parties', count: parties.length },
    { id: 'constituencies', label: 'Constituencies', count: records.length },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-[#F5F5F5]">Explore</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">Browse the people and parties behind all 403 seats.</p>
      </header>

      <div role="tablist" aria-label="Explore categories" className="flex flex-wrap gap-1 rounded-xl border border-[#2A2A2A] bg-[#151515] p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => { setTab(t.id); }}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-[#D4A843] font-semibold text-black' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'}`}
          >
            {t.label} <span className={tab === t.id ? 'text-black/60' : 'text-[#6B6B6B]'}>{t.count}</span>
          </button>
        ))}
      </div>

      {error ? <div className="rounded-2xl border border-[#FF3B30]/40 bg-[#FF3B30]/10 p-4 text-sm text-[#FF6B61]">Failed to load: {error}</div> : null}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#A1A1AA]">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tab === 'mla' && mlas.map(p => (
            <Link key={p.name} href={`/up403/constituencies/${p.representativeId}`} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4 transition-all hover:border-[#D4A843]/40">
              <div className="flex items-center justify-between">
                <div className="font-medium text-[#F5F5F5]">{p.name}</div>
                <PartyBadge party={p.party} />
              </div>
              <div className="mt-2 text-xs text-[#A1A1AA]">{p.acs.join(' · ')}</div>
            </Link>
          ))}
          {tab === 'mp' && mps.map(p => (
            <Link key={p.name} href={`/up403/constituencies/${p.representativeId}`} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4 transition-all hover:border-[#D4A843]/40">
              <div className="flex items-center justify-between">
                <div className="font-medium text-[#F5F5F5]">{p.name}</div>
                <PartyBadge party={p.party} />
              </div>
              <div className="mt-2 text-xs text-[#A1A1AA]">{p.acs.join(' · ')}</div>
            </Link>
          ))}
          {tab === 'party' && parties.map(([party, seats]) => (
            <div key={party} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4">
              <div className="flex items-center justify-between">
                <PartyBadge party={party} />
                <span className="text-xs text-[#6B6B6B]">2022: <strong className="text-[#F5F5F5]">{seats.seats2022}</strong></span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-[#111111] p-2"><div className="text-lg font-semibold text-[#F5F5F5]">{seats.seats2012}</div><div className="text-[10px] uppercase tracking-widest text-[#6B6B6B]">2012</div></div>
                <div className="rounded-lg bg-[#111111] p-2"><div className="text-lg font-semibold text-[#F5F5F5]">{seats.seats2017}</div><div className="text-[10px] uppercase tracking-widest text-[#6B6B6B]">2017</div></div>
                <div className="rounded-lg bg-[#111111] p-2"><div className="text-lg font-semibold text-[#D4A843]">{seats.seats2022}</div><div className="text-[10px] uppercase tracking-widest text-[#6B6B6B]">2022</div></div>
              </div>
            </div>
          ))}
          {tab === 'constituencies' && records.map(rec => (
            <Link key={rec.canonical_constituency_id} href={`/up403/constituencies/${rec.canonical_constituency_id}`} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4 transition-all hover:border-[#D4A843]/40">
              <div className="flex items-center justify-between">
                <div className="font-medium text-[#F5F5F5]">{rec.constituency_name}</div>
                <span className="text-xs text-[#6B6B6B]">AC-{rec.ac_number}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#A1A1AA]">
                <span>{rec.district} · {rec.reservation_type || 'GEN'}</span>
                <PartyBadge party={rec.winner_party_2022} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
