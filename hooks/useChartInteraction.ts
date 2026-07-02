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

    const handleInteraction = (e: MouseEvent | WheelEvent) => {
      let action: 'hover' | 'click' | 'zoom' = 'hover';

      if (e.type === 'click') {
        action = 'click';
      } else if (e.type === 'wheel') {
        action = 'zoom';
      }

      trackEvent({
        type: 'chart_interaction',
        storySlug,
        chartId,
        action,
      });
    };

    el.addEventListener('mouseenter', () => {
      trackEvent({ type: 'chart_interaction', storySlug, chartId, action: 'hover' });
    });

    el.addEventListener('click', (e) => {
      trackEvent({ type: 'chart_interaction', storySlug, chartId, action: 'click' });
    });

    el.addEventListener('wheel', (e) => {
      trackEvent({ type: 'chart_interaction', storySlug, chartId, action: 'zoom' });
    });

    return () => {
      // Cleanup handled by ref
    };
  }, [storySlug, chartId]);

  return containerRef;
}
