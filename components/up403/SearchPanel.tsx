'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUp403Data } from '@/components/up403/data';
import { ConstituencyTable, useLocalSearch } from '@/components/up403/ConstituencyTable';
import { PartyBadge } from '@/components/up403/ui';
import { toSlug } from '@/lib/up403/slug';
import { trackReaderEvent } from '@/lib/up403/reader-events';

export default function Up403SearchPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { records, loading, error } = useUp403Data();
  const results = useLocalSearch(records, query);

  const suggestions = useMemo(() => results.slice(0, 6), [results]);

  const grouped = useMemo(() => {
    const mlas = new Map<string, number>();
    const mps = new Map<string, number>();
    const parties = new Map<string, number>();
    results.forEach(rec => {
      if (rec.current_mla_name) mlas.set(rec.current_mla_name, (mlas.get(rec.current_mla_name) ?? 0) + 1);
      if (rec.current_mp_name) mps.set(rec.current_mp_name, (mps.get(rec.current_mp_name) ?? 0) + 1);
      [rec.winner_party_2012, rec.winner_party_2017, rec.winner_party_2022, rec.current_mla_party, rec.current_mp_party]
        .forEach(p => parties.set(p, (parties.get(p) ?? 0) + 1));
    });
    return {
      mlas: Array.from(mlas.entries()).sort((a, b) => b[1] - a[1]),
      mps: Array.from(mps.entries()).sort((a, b) => b[1] - a[1]),
      parties: Array.from(parties.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12),
    };
  }, [results]);

  const openActive = (index: number) => {
    if (index < 0 || index >= suggestions.length) return;
    const target = suggestions[index];
    setOpenSuggestions(false);
    setActiveIndex(-1);
    trackReaderEvent('up403_search_select', { constituency_id: target.canonical_constituency_id, name: target.constituency_name, query });
    router.push(`/up403/${toSlug(target.canonical_constituency_id)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!openSuggestions || suggestions.length === 0) {
        setOpenSuggestions(true);
        setActiveIndex(0);
      } else {
        setActiveIndex(i => (i + 1) % suggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (openSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        openActive(activeIndex);
      }
    } else if (e.key === 'Escape') {
      setOpenSuggestions(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-[#F5F5F5]">Universal Search</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">Searches constituency names, districts, divisions, MLAs, MPs and parties.</p>
      </header>

      <form
        onSubmit={e => {
          e.preventDefault();
          setOpenSuggestions(false);
          setActiveIndex(-1);
          if (query.trim()) trackReaderEvent('up403_search_submit', { query });
        }}
        className="relative flex items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#151515] p-3"
        role="search"
      >
        <svg className="h-5 w-5 text-[#A1A1AA]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpenSuggestions(true);
            setActiveIndex(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => { if (query.trim()) setOpenSuggestions(true); }}
          onBlur={() => { window.setTimeout(() => { setOpenSuggestions(false); }, 120); }}
          placeholder="e.g. Azamgarh, SP, Ayodhya, Rampur, Rahul…"
          className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder:text-[#6B6B6B] outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:rounded"
          aria-label="Search constituencies, MLAs, MPs, districts or parties"
          role="combobox"
          aria-expanded={openSuggestions}
          aria-controls="up403-search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `up403-suggestion-${String(activeIndex)}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <span className="shrink-0 rounded-lg bg-[#1C1C1C] px-3 py-2 text-xs text-[#A1A1AA]">
          {loading ? '…' : `${String(results.length)} result${results.length === 1 ? '' : 's'}`}
        </span>

        {openSuggestions && !loading && suggestions.length > 0 ? (
          <ul
            id="up403-search-suggestions"
            role="listbox"
            aria-label="Search suggestions"
            className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#151515] shadow-xl"
            onMouseDown={e => { e.preventDefault(); }}
          >
            {suggestions.map((rec, i) => (
              <li
                key={rec.canonical_constituency_id}
                id={`up403-suggestion-${String(i)}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => { setActiveIndex(i); }}
                onClick={() => { openActive(i); }}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm ${i === activeIndex ? 'bg-[#1C1C1C]' : ''}`}
              >
                <span>
                  <span className="font-medium text-[#F5F5F5]">{rec.constituency_name}</span>
                  <span className="ml-2 text-xs text-[#A1A1AA]">AC-{String(rec.ac_number)} · {rec.district}</span>
                </span>
                <PartyBadge party={rec.winner_party_2022} />
              </li>
            ))}
            <li className="border-t border-[#232323] px-4 py-2 text-xs text-[#6B6B6B]">
              ↑↓ to navigate · Enter to open · Esc to close
            </li>
          </ul>
        ) : null}
      </form>

      {error ? (
        <div className="rounded-2xl border border-[#FF3B30]/40 bg-[#FF3B30]/10 p-4 text-sm text-[#FF6B61]">Failed to load: {error}</div>
      ) : null}

      {!loading && query.trim() === '' ? (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-10 text-center text-sm text-[#A1A1AA]">
          Enter a query to search the full 403-constituency dataset.
        </div>
      ) : null}

      {!loading && query.trim() !== '' && results.length === 0 ? (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-10 text-center">
          <p className="text-sm text-[#A1A1AA]">No matches for &quot;{query}&quot;.</p>
          <p className="mt-1 text-xs text-[#6B6B6B]">Try a constituency name, district, party code (BJP, SP, INC, BSP), or MLA/MP name.</p>
        </div>
      ) : null}

      {grouped.mlas.length > 0 && query.trim() !== '' ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">People — MLA</h2>
          <div className="flex flex-wrap gap-2">
            {grouped.mlas.slice(0, 8).map(([name, count]) => (
              <span key={name} className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-1.5 text-sm text-[#E5E5E5]">
                {name} <span className="text-[#6B6B6B]">· {String(count)}</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {grouped.mps.length > 0 && query.trim() !== '' ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">People — MP</h2>
          <div className="flex flex-wrap gap-2">
            {grouped.mps.slice(0, 8).map(([name, count]) => (
              <span key={name} className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-1.5 text-sm text-[#E5E5E5]">
                {name} <span className="text-[#6B6B6B]">· {String(count)}</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {grouped.parties.length > 0 && query.trim() !== '' ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">Parties</h2>
          <div className="flex flex-wrap gap-2">
            {grouped.parties.map(([party]) => (
              <PartyBadge key={party} party={party} />
            ))}
          </div>
        </section>
      ) : null}

      {!loading && results.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">Top matches</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, 9).map(rec => (
              <Link
                key={rec.canonical_constituency_id}
                href={`/up403/${toSlug(rec.canonical_constituency_id)}`}
                className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4 transition-all hover:border-[#D4A843]/40"
              >
                <div className="font-medium text-[#F5F5F5]">{rec.constituency_name}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-[#A1A1AA]">
                  <span>AC-{String(rec.ac_number)}</span>
                  <span>·</span>
                  <span>{rec.district}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <PartyBadge party={rec.winner_party_2022} />
                  <span className="text-xs text-[#6B6B6B]">2022</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && results.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">Full result table</h2>
          <ConstituencyTable records={results} maxHeight="70vh" />
        </section>
      ) : null}
    </div>
  );
}
