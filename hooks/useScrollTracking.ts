'use client';

import { useEffect, useRef } from 'react';
import { trackEvent, getScrollDepth } from '@/utils/analytics';

/**
 * useScrollTracking — Tracks how far readers scroll through a story.
 *
 * Debounced at 200ms. Only records the maximum depth reached.
 *
 * @param storySlug — The story being read
 */
export function useScrollTracking(storySlug: string): void {
  const maxDepthRef = useRef(0);
  const lastEventRef = useRef(0); // timestamp of last scroll event
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastEventRef.current < 200) return; // debounce
      lastEventRef.current = now;

      const depth = getScrollDepth();
      if (depth > maxDepthRef.current) {
        maxDepthRef.current = depth;
      }

      trackEvent({
        type: 'scroll',
        storySlug,
        depth,
        maxDepth: maxDepthRef.current,
      });
    };

    // Also report every 5 seconds (in case reader stops scrolling mid-page)
    intervalRef.current = setInterval(() => {
      const depth = getScrollDepth();
      if (depth > maxDepthRef.current) {
        maxDepthRef.current = depth;
        trackEvent({
          type: 'scroll',
          storySlug,
          depth,
          maxDepth: maxDepthRef.current,
        });
      }
    }, 5000);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [storySlug]);
}
