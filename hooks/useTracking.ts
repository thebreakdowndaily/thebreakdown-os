'use client';

import { useEffect, useRef, useCallback } from 'react';
import { trackEvent, getScrollDepth, sanitizeQuery } from '@/utils/analytics';

interface TrackingConfig {
  storySlug?: string;
  enableScrollTracking?: boolean;
}

/**
 * useTracking — Unified plugin-based tracking system.
 * 
 * Replaces useScrollTracking, useSectionTracking, useSearchTracking, and useFAQTracking.
 */
export function useTracking({ storySlug = '', enableScrollTracking = false }: TrackingConfig = {}) {
  // ── Scroll Tracking Plugin ──────────────────────────────────────────────────
  const scrollMaxDepthRef = useRef(0);
  const scrollLastEventRef = useRef(0);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enableScrollTracking || !storySlug) return;

    const handleScroll = () => {
      const now = Date.now();
      if (now - scrollLastEventRef.current < 200) return;
      scrollLastEventRef.current = now;

      const depth = getScrollDepth();
      if (depth > scrollMaxDepthRef.current) {
        scrollMaxDepthRef.current = depth;
      }
      trackEvent({ type: 'scroll', storySlug, depth, maxDepth: scrollMaxDepthRef.current });
    };

    scrollIntervalRef.current = setInterval(() => {
      const depth = getScrollDepth();
      if (depth > scrollMaxDepthRef.current) {
        scrollMaxDepthRef.current = depth;
        trackEvent({ type: 'scroll', storySlug, depth, maxDepth: scrollMaxDepthRef.current });
      }
    }, 5000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [storySlug, enableScrollTracking]);

  // ── Section Tracking Plugin ─────────────────────────────────────────────────
  const sectionObserversRef = useRef<Map<string, { start: number; total: number; isVisible: boolean }>>(new Map());
  const observerInstanceRef = useRef<IntersectionObserver | null>(null);

  const registerSection = useCallback((sectionId: string) => (el: HTMLDivElement | null) => {
    if (!storySlug) return;
    if (!observerInstanceRef.current) {
      observerInstanceRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const id = entry.target.id;
            if (!id) return;
            const isVisible = entry.isIntersecting;
            const state = sectionObserversRef.current.get(id);
            if (!state) return;

            if (isVisible && !state.isVisible) {
              state.isVisible = true;
              state.start = Date.now();
            } else if (!isVisible && state.isVisible) {
              state.isVisible = false;
              const elapsed = Date.now() - state.start;
              state.total += elapsed;
              if (elapsed > 100) {
                trackEvent({ type: 'section_view', storySlug, sectionId: id, duration: state.total });
              }
            }
          });
        },
        { threshold: 0.25, rootMargin: '0px' }
      );
    }
    
    if (el) {
      // It's important the element has an ID for the observer to distinguish it
      if (!el.id) el.id = sectionId;
      if (!sectionObserversRef.current.has(sectionId)) {
        sectionObserversRef.current.set(sectionId, { start: 0, total: 0, isVisible: false });
      }
      observerInstanceRef.current.observe(el);
    }
  }, [storySlug]);

  useEffect(() => {
    return () => {
      if (observerInstanceRef.current) {
        observerInstanceRef.current.disconnect();
      }
      // Record final accumulated time on unmount
      sectionObserversRef.current.forEach((state, sectionId) => {
        if (state.isVisible) {
          const elapsed = Date.now() - state.start;
          state.total += elapsed;
          if (elapsed > 100) {
            trackEvent({ type: 'section_view', storySlug, sectionId, duration: state.total });
          }
        }
      });
    };
  }, [storySlug]);

  // ── FAQ Tracking Plugin ─────────────────────────────────────────────────────
  const trackFAQ = useCallback((questionIndex: number, action: 'open' | 'close') => {
    if (storySlug) {
      trackEvent({ type: 'faq_expansion', storySlug, questionIndex, action });
    }
  }, [storySlug]);

  // ── Search Tracking Plugin ──────────────────────────────────────────────────
  const searchLastQueryRef = useRef('');
  const trackSearch = useCallback((query: string, resultsCount: number) => {
    const sanitized = sanitizeQuery(query);
    if (!sanitized || sanitized === searchLastQueryRef.current) return;
    searchLastQueryRef.current = sanitized;

    trackEvent({
      type: 'search',
      storySlug: storySlug || '__site_search__',
      query: sanitized,
      resultsCount,
    });
  }, [storySlug]);

  return { registerSection, trackFAQ, trackSearch };
}
