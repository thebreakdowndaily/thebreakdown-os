'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ToolkitConstituencyEntry } from '@/lib/intel/toolkit/types';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)
// Client-only: search + navigate to a constituency workspace. No data logic here.

export function ConstituencyPicker({ entries }: { entries: ToolkitConstituencyEntry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, 60);
    return entries
      .filter((e) =>
        e.constituency_name.toLowerCase().includes(q) ||
        e.district.toLowerCase().includes(q) ||
        e.canonical_constituency_id.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.predicted_winner.toLowerCase().includes(q),
      )
      .slice(0, 60);
  }, [entries, query]);

  const open = (id: string) => {
    router.push(`/intel/toolkit?constituency=${encodeURIComponent(id)}`);
  };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); }}
        placeholder={`Search ${String(entries.length)} constituencies by name, district, region, party, or ID…`}
        aria-label="Search constituencies"
        style={{
          width: '100%',
          padding: 'var(--spacing-3) var(--spacing-4)',
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-sm)',
          outline: 'none',
        }}
      />
      <div role="list" style={{ marginTop: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 480, overflowY: 'auto' }}>
        {results.map((e) => (
          <button
            key={e.canonical_constituency_id}
            type="button"
            onClick={() => { open(e.canonical_constituency_id); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              padding: 'var(--spacing-3) var(--spacing-4)',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 'var(--text-sm)',
            }}
            onMouseEnter={(ev) => { ev.currentTarget.style.background = 'var(--color-bg-secondary)'; }}
            onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{e.constituency_name}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{e.canonical_constituency_id} · {e.district} · {e.region}</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Predicted: <strong>{e.predicted_winner}</strong> {String(e.winner_probability)}%</span>
          </button>
        ))}
        {results.length === 0 ? (
          <div style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>No constituency matches "{query}".</div>
        ) : null}
      </div>
    </div>
  );
}
