/**
 * ─── Bounded Projection Context: Timeline ────────────────────────────────────
 * Frontend View Model Contract for Chronological Context Surfaces.
 * Consumed strictly by app/(public)/timelines/[slug] components.
 */

export interface TimelineEventViewModel {
  id?: string;
  date: string;
  year: string;
  title: string;
  description: string;
  linkedStorySlug?: string;
  confidenceScore?: number;
}

export interface TimelineSEOViewModel {
  title: string;
  description: string;
  canonicalUrl: string;
}

export interface TimelineViewModel {
  id: string;
  slug: string;
  title: string;
  description: string;
  totalEventsCount: number;
  startYear: string;
  endYear: string;
  events: TimelineEventViewModel[];
  seo: TimelineSEOViewModel;
}
