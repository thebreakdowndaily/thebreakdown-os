'use client';

import { useEffect } from 'react';
import { captureEvent, sanitizeSearchQuery } from '@/lib/analytics/capture';

const SEARCH_QUERY_KEY = 'tbd_last_search_query';

interface SearchAnalyticsProps {
  query: string;
  resultsCount: number;
}

/**
 * SearchAnalytics — search acquisition measurement.
 *
 * Fires `search_performed` once per search results page view and stores the
 * sanitized query so subsequent result clicks are attributed via
 * `search_result_clicked` (see InteractionTracker).
 */
export function SearchAnalytics({ query, resultsCount }: SearchAnalyticsProps) {
  useEffect(() => {
    const raw = query.trim();
    if (!raw) return;
    const sanitized = sanitizeSearchQuery(raw);
    if (!sanitized) return;

    captureEvent('search_performed', {
      search_query: sanitized,
      results_count: resultsCount,
      search_type: 'site',
    });

    try {
      sessionStorage.setItem(SEARCH_QUERY_KEY, sanitized);
    } catch {
      // ignore storage failures
    }
  }, [query, resultsCount]);

  return null;
}