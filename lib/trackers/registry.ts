import type { TrackerDefinition } from './types';
import { mgnregaTracker } from './mgnrega-tracker';
import { semiconductorTracker } from './semiconductor-tracker';
import { upiTracker } from './upi-tracker';
import { pmfbyTracker } from './pmfby-tracker';

export const TRACKER_REGISTRY: Record<string, TrackerDefinition> = {
  mgnrega: mgnregaTracker,
  semiconductor: semiconductorTracker,
  upi: upiTracker,
  pmfby: pmfbyTracker,
};

export function getAllTrackers(): TrackerDefinition[] {
  return Object.values(TRACKER_REGISTRY);
}

export function getTrackerBySlug(slug: string): TrackerDefinition | undefined {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  return TRACKER_REGISTRY[normalized] || Object.values(TRACKER_REGISTRY).find((t) => t.slug === normalized || t.id === normalized);
}

export function getTrackersForTopic(topicSlug: string): TrackerDefinition[] {
  if (!topicSlug) return [];
  const normalized = topicSlug.toLowerCase().trim();
  return Object.values(TRACKER_REGISTRY).filter((t) => t.topicSlug.toLowerCase() === normalized);
}

export function getTrackersForStory(storySlug: string): TrackerDefinition[] {
  if (!storySlug) return [];
  const normalized = storySlug.toLowerCase().trim();
  return Object.values(TRACKER_REGISTRY).filter((t) =>
    t.relatedStorySlugs.some((s) => s.toLowerCase() === normalized)
  );
}
