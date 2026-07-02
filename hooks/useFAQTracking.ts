'use client';

import { useCallback } from 'react';
import { trackEvent } from '@/utils/analytics';

/**
 * useFAQTracking — Tracks which FAQ questions readers open and close.
 *
 * Returns a handler to attach to FAQ toggle buttons.
 *
 * @param storySlug — The story being read
 */
export function useFAQTracking(storySlug: string) {
  const trackFAQ = useCallback(
    (questionIndex: number, action: 'open' | 'close') => {
      trackEvent({
        type: 'faq_expansion',
        storySlug,
        questionIndex,
        action,
      });
    },
    [storySlug]
  );

  return { trackFAQ };
}
