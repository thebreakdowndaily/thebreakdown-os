'use client';

import { useRef, useEffect, useCallback } from 'react';
import { trackEvent } from '@/utils/analytics';

/**
 * useSectionTracking — Tracks how long readers spend on each story section.
 *
 * Uses IntersectionObserver to detect when a section enters/exits the viewport.
 * Accumulates time across multiple viewport entries (reader can revisit).
 *
 * @param storySlug — The story being read
 * @param sectionId — The section element ID (e.g., "hero", "evidence", "charts")
 */
export function useSectionTracking(storySlug: string, sectionId: string): React.RefObject<HTMLDivElement | null> {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<{ start: number; total: number }>({ start: 0, total: 0 });
  const isVisibleRef = useRef(false);

  const handleVisibility = useCallback(
    (isVisible: boolean) => {
      if (isVisible && !isVisibleRef.current) {
        // Section entered viewport — start timer
        isVisibleRef.current = true;
        timerRef.current.start = Date.now();
      } else if (!isVisible && isVisibleRef.current) {
        // Section left viewport — stop timer and record
        isVisibleRef.current = false;
        const elapsed = Date.now() - timerRef.current.start;
        timerRef.current.total += elapsed;

        if (elapsed > 100) {
          // Only record if section was visible for >100ms
          trackEvent({
            type: 'section_view',
            storySlug,
            sectionId,
            duration: timerRef.current.total,
          });
        }
      }
    },
    [storySlug, sectionId]
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        handleVisibility(entry.isIntersecting);
      },
      {
        threshold: 0.25, // 25% of section must be visible
        rootMargin: '0px',
      }
    );

    observer.observe(el);

    const timer = timerRef.current;

    return () => {
      observer.disconnect();
      // Record final accumulated time on unmount
      if (isVisibleRef.current) {
        const elapsed = Date.now() - timer.start;
        timer.total += elapsed;
        if (elapsed > 100) {
          trackEvent({
            type: 'section_view',
            storySlug,
            sectionId,
            duration: timer.total,
          });
        }
      }
    };
  }, [storySlug, sectionId, handleVisibility]);

  return sectionRef;
}
