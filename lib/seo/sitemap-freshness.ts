/**
 * lib/seo/sitemap-freshness.ts
 *
 * Truthful, content-derived freshness resolution for sitemaps and metadata.
 *
 * Invariants:
 * 1. Freshness derives strictly from actual content timestamps (publishedAt, updatedAt).
 * 2. Timestamps must be finite, valid RFC 3339 / ISO 8601 dates.
 * 3. Future timestamps (relative to validation boundary) are rejected to prevent crawl poisoning.
 * 4. Build-time (new Date()) must NEVER be fabricated as a fallback for dynamic or static pages.
 * 5. If no valid content timestamp can be derived, use a documented, stable editorial baseline date.
 */

export interface StoryTimestampItem {
  publishedAt?: string | null;
  updatedAt?: string | null;
}

/**
 * Validates and safely converts a raw date string or Date object into a valid Date.
 * Rejects NaN, negative timestamps, or dates in the future relative to maxAllowedDate.
 */
export function parseValidContentDate(
  rawDate?: string | Date | null,
  maxAllowedDate: Date = new Date()
): Date | undefined {
  if (!rawDate) return undefined;
  const d = typeof rawDate === 'string' ? new Date(rawDate) : rawDate;
  const time = d.getTime();
  if (Number.isNaN(time) || time <= 0) return undefined;
  if (time > maxAllowedDate.getTime()) return undefined;
  return d;
}

/**
 * Finds the latest valid, non-future modification timestamp across an array of story items.
 * Evaluates `updatedAt` first, then `publishedAt`.
 */
export function getLatestContentDate(
  items: StoryTimestampItem[],
  maxAllowedDate: Date = new Date()
): Date | undefined {
  let maxTime = 0;

  for (const item of items) {
    // Prefer updatedAt if present; fallback to publishedAt
    const targetRaw = item.updatedAt || item.publishedAt;
    const validDate = parseValidContentDate(targetRaw, maxAllowedDate);
    if (validDate) {
      const t = validDate.getTime();
      if (t > maxTime) {
        maxTime = t;
      }
    }
  }

  return maxTime > 0 ? new Date(maxTime) : undefined;
}

export interface DynamicFreshnessOptions {
  sliceCount?: number;
  fallbackDate: Date;
  maxAllowedDate?: Date;
}

/**
 * Resolves truthful modification date for dynamic aggregation pages (Homepage, Story Archive).
 *
 * For the homepage: evaluates the top `sliceCount` (e.g. 10) stories sorted by publishedAt desc
 * that actually populate the lead, briefing, and deep-dive view models.
 * For the archive: evaluates all public stories in the repository.
 *
 * If content timestamps are unavailable or invalid, returns the stable fallbackDate.
 */
export function resolveDynamicPageFreshness(
  stories: StoryTimestampItem[],
  options: DynamicFreshnessOptions
): Date {
  if (!stories || stories.length === 0) {
    return options.fallbackDate;
  }

  // Sort by publishedAt descending to match homepage editorial selection
  const sortedStories = [...stories].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });

  const targetStories = options.sliceCount && options.sliceCount > 0
    ? sortedStories.slice(0, options.sliceCount)
    : sortedStories;

  const latestDate = getLatestContentDate(targetStories, options.maxAllowedDate);
  return latestDate || options.fallbackDate;
}
