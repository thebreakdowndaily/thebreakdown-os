'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/utils/analytics';

/**
 * useChartInteraction — Tracks hover, click, and zoom events on charts.
 *
 * Uses event delegation on the chart container element.
 *
 * @param storySlug — The story being read
 * @param chartId — The unique chart identifier from VisualPlan
 */
export function useChartInteraction(
  storySlug: string,
  chartId: string
): React.RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('mouseenter', () => {
      trackEvent({ type: 'chart_interaction', storySlug, chartId, action: 'hover' });
    });

    el.addEventListener('click', () => {
      trackEvent({ type: 'chart_interaction', storySlug, chartId, action: 'click' });
    });

    el.addEventListener('wheel', () => {
      trackEvent({ type: 'chart_interaction', storySlug, chartId, action: 'zoom' });
    });
  }, [storySlug, chartId]);

  return containerRef;
}
