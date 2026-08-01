/**
 * ─── Bounded Projection Transformer: Timeline ───────────────────────────────
 * Converts canonical TimelineEvent arrays into clean TimelineViewModel projections.
 */

import type { TimelineEvent } from '@/types/canonical';
import type { TimelineViewModel, TimelineEventViewModel } from './TimelineViewModel';

export function transformTimelineToViewModel(
  id: string,
  slug: string,
  title: string,
  description: string,
  events: TimelineEvent[] = []
): TimelineViewModel {
  const formattedEvents: TimelineEventViewModel[] = events.map((evt) => {
    const year = evt.date ? evt.date.split('-')[0] : '1947';
    return {
      id: evt.id,
      date: evt.date,
      year,
      title: evt.title,
      description: evt.description,
      linkedStorySlug: evt.storyId,
      confidenceScore: typeof evt.confidence === 'number' ? evt.confidence : 95,
    };
  });

  const sorted = [...formattedEvents].sort((a, b) => a.date.localeCompare(b.date));
  const startYear = sorted.length > 0 ? sorted[0].year : '1947';
  const endYear = sorted.length > 0 ? sorted[sorted.length - 1].year : '1962';

  return {
    id,
    slug,
    title,
    description,
    totalEventsCount: formattedEvents.length,
    startYear,
    endYear,
    events: sorted,
    seo: {
      title: `${title} (${startYear}–${endYear}) Timeline | The Breakdown`,
      description,
      canonicalUrl: `https://thebreakdown.in/timelines/${slug}`,
    },
  };
}
