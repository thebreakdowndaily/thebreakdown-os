'use client';

import { useState, useEffect, useRef } from 'react';
import type { SearchResult } from '../utils/types';

interface UseSearchOptions {
  type?: string;
  page?: number;
  limit?: number;
}

interface UseSearchResult {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
}

const DEBOUNCE_DELAY = 300;

export function useSearch(query: string, options: UseSearchOptions = {}): UseSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const { type, page = 1, limit = 20 } = options;

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    let syncActive = true;

    if (!query || query.trim().length === 0) {
      queueMicrotask(() => {
        if (syncActive) {
          setResults([]);
          setLoading(false);
          setError(null);
          setTotal(0);
          setTotalPages(0);
        }
      });
      return () => {
        syncActive = false;
      };
    }

    queueMicrotask(() => {
      if (syncActive) {
        setLoading(true);
        setError(null);
      }
    });

    timerRef.current = setTimeout(() => {
      cancelledRef.current = false;

      const searchParams = new URLSearchParams();
      searchParams.set('q', query.trim());
      if (type) searchParams.set('type', type);
      searchParams.set('page', String(page));
      searchParams.set('limit', String(limit));

      fetch(`/api/search?${searchParams.toString()}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
          return res.json() as Promise<{
            results?: SearchResult[];
            total?: number;
            totalPages?: number;
          }>;
        })
        .then((data) => {
          if (!cancelledRef.current) {
            setResults(data.results ?? []);
            setTotal(data.total ?? 0);
            setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / limit) || 0);
            setLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!cancelledRef.current) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setResults([]);
            setLoading(false);
          }
        });
    }, DEBOUNCE_DELAY);

    return () => {
      syncActive = false;
      cancelledRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, type, page, limit]);

  return { results, loading, error, total, totalPages };
}
