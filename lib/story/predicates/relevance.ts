/**
 * Relevance Predicates
 *
 * Strict relevance rules for timeline events, visual intelligence assets, and entities.
 *
 * CRITICAL RULE FOR TIMELINE:
 * Entity association, shared tags, shared keywords, or textual similarity MUST NEVER
 * independently qualify an event for the story timeline.
 *
 * Allowed timeline inclusion:
 * 1. Event explicitly belongs to canonical story.timeline
 * 2. Event has explicit storyId matching current story slug
 * 3. Event is explicitly linked to a chapter of the story
 * 4. Event has a curated contextual relationship with explicit provenance
 */

import type { Story, TimelineEvent } from '@/types/canonical';

export function isTimelineEventRelevant(event: TimelineEvent, story: Story): boolean {
  if (!event || !story) return false;

  // 1. Direct story timeline event
  if (story.timeline && story.timeline.some((e) => e.date === event.date && e.title === event.title)) {
    return true;
  }

  // 2. Explicit storyId match
  if (event.storyId && (event.storyId === story.id || event.storyId === story.slug)) {
    return true;
  }

  // 3. Explicit chapter link
  if ((event as any).chapterId || (event as any).chapterSlug) {
    const chSlug = (event as any).chapterSlug || (event as any).chapterId;
    if (chSlug === story.slug || story.id === chSlug) {
      return true;
    }
  }

  // 4. Curated contextual event with explicit provenance
  if ((event as any).curatedForStorySlug === story.slug || (event as any).provenance === 'curated_story') {
    return true;
  }

  // Otherwise: OMIT. Keywords, shared tags, or generic entity events are explicitly rejected.
  return false;
}

export function filterRelevantTimelineEvents(
  rawTimelineEvents: TimelineEvent[],
  story: Story
): TimelineEvent[] {
  if (!rawTimelineEvents || rawTimelineEvents.length === 0) return [];
  
  const relevant = rawTimelineEvents.filter((event) => isTimelineEventRelevant(event, story));
  // Deduplicate by date + title
  const seen = new Set<string>();
  const unique: TimelineEvent[] = [];

  for (const e of relevant) {
    const key = `${e.date}::${e.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(e);
    }
  }

  return unique.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Filter visual assets: standalone logos do NOT qualify as major Visual Intelligence unless
 * they serve as explicit visual evidence.
 */
export function isVisualAssetRelevant(assetRef: any): boolean {
  if (!assetRef || !assetRef.resolvedAsset) return false;
  const asset = assetRef.resolvedAsset;
  const category = asset.metadata?.imageCategory || asset.type || '';
  
  // Exclude standalone logo assets from visual intelligence gallery unless explicitly marked as evidence
  if (category === 'LOGO' || asset.type === 'logo') {
    return false;
  }

  return true;
}
