'use client';

import { useCallback, useRef } from 'react';
import { trackEvent, sanitizeQuery } from '@/utils/analytics';

/**
 * useSearchTracking — Tracks internal search queries and result counts.
 *
 * Debounced at 500ms to avoid tracking every keystroke.
 *
 * @param storySlug — Optional story slug to associate with search
 */
export function useSearchTracking(storySlug?: string) {
  const lastQueryRef = useRef('');

  const trackSearch = useCallback(
    (query: string, resultsCount: number) => {
      const sanitized = sanitizeQuery(query);
      if (!sanitized || sanitized === lastQueryRef.current) return;
      lastQueryRef.current = sanitized;

      trackEvent({
        type: 'search',
        storySlug: storySlug || '__site_search__',
        query: sanitized,
        resultsCount,
      });
    },
    [storySlug]
  );

  return { trackSearch };
}
