'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ConstituencyRecord } from '@/lib/up403/types';
export { partyColorClass, dataStatusBadge, formatNumber, formatPct, winnerRow } from '@/lib/up403/format';

const DATA_URL = '/api/up403/v1/constituencies?limit=100';

interface Up403State {
  records: ConstituencyRecord[];
  loading: boolean;
  error: string | null;
  byId: Map<string, ConstituencyRecord>;
  refetch: () => void;
}

let cachedRecords: ConstituencyRecord[] | null = null;
let cacheInFlight: Promise<ConstituencyRecord[]> | null = null;

async function fetchAll(): Promise<ConstituencyRecord[]> {
  if (cachedRecords) return cachedRecords;
  if (cacheInFlight) return cacheInFlight;

  cacheInFlight = (async () => {
    const all: ConstituencyRecord[] = [];
    let page = 1;
    for (;;) {
      const res = await fetch(`${DATA_URL}&page=${String(page)}`, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Data load failed: ' + String(res.status));
      const json = (await res.json()) as { data: ConstituencyRecord[]; total: number };
      all.push(...json.data);
      if (all.length >= json.total || json.data.length === 0) break;
      page += 1;
    }
    cachedRecords = all;
    return all;
  })();

  try {
    return await cacheInFlight;
  } finally {
    cacheInFlight = null;
  }
}

export function useUp403Data(): Up403State {
  const [records, setRecords] = useState<ConstituencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchAll()
      .then(records => {
        setRecords(records);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => {
    const map = new Map<string, ConstituencyRecord>();
    records.forEach(rec => map.set(rec.canonical_constituency_id, rec));
    return map;
  }, [records]);

  return { records, loading, error, byId, refetch: load };
}

export function sortRecords(records: ConstituencyRecord[], key: keyof ConstituencyRecord, direction: 'asc' | 'desc'): ConstituencyRecord[] {
  const toSortable = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return JSON.stringify(v) || '';
  };
  return [...records].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') {
      return direction === 'asc' ? av - bv : bv - av;
    }
    const as = toSortable(av).toLowerCase();
    const bs = toSortable(bv).toLowerCase();
    if (as < bs) return direction === 'asc' ? -1 : 1;
    if (as > bs) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
