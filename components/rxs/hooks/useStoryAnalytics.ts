'use client';
// @rxs/implementation: contracts/story-shell.md — analytics v2 (consistent event shape with auto-enrichment)

import { useCallback, useRef } from 'react';
import type { AnalyticsEvent } from '@/types/canonical';

type StoryEvent =
  | 'story_started'
  | 'story_completed'
  | 'section_entered'
  | 'section_completed'
  | 'reading_mode_changed'
  | 'toc_navigation'
  | 'claim_expanded'
  | 'evidence_opened'
  | 'source_opened'
  | 'document_opened'
  | 'timeline_opened'
  | 'thinker_opened'
  | 'continue_learning_clicked'
  | 'feedback_submitted';

let analyticsService: import('@/services/analytics/service').AnalyticsService | null = null;

async function getAnalytics(): Promise<typeof analyticsService> {
  if (analyticsService) return analyticsService;
  try {
    const { bootstrapServices } = await import('@/lib/bootstrap');
    const { getServices } = await import('@/services/registry');
    bootstrapServices();
    analyticsService = getServices().analytics;
  } catch {
    // analytics not available — skip silently
  }
  return analyticsService;
}

export function useStoryAnalytics(storySlug?: string) {
  const shared = useRef({ storySlug, version: 'rxs-v1.0' });

  const enrich = useCallback((event: StoryEvent, metadata?: Record<string, unknown>): AnalyticsEvent => ({
    type: event,
    storyId: shared.current.storySlug,
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata,
      story_slug: shared.current.storySlug,
      version: shared.current.version,
    },
  }), []);

  const track = useCallback((event: StoryEvent, metadata?: Record<string, unknown>) => {
    const payload = enrich(event, metadata);
    void getAnalytics().then((svc) => svc?.track(payload));
  }, [enrich]);

  return { track, enrich };
}
