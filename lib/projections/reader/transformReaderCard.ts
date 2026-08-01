/**
 * ─── Bounded Projection Transformer: Reader Card ─────────────────────────────
 * Converts canonical Story objects into lightweight ReaderCardViewModel projections.
 */

import type { Story } from '@/types/canonical';
import type { ReaderCardViewModel } from './ReaderCardViewModel';

export function transformStoryToReaderCard(story: Story, isFeatured: boolean = false): ReaderCardViewModel {
  const verifiedCount = (story.claims || []).filter((c) => c.status === 'verified' || c.status === 'strong').length;
  const sourcesCount = (story.sources || []).length;

  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    headline: story.headline || story.title,
    summary: story.summary,
    heroImage: story.heroImage || '/assets/images/placeholder.jpg',
    category: story.category || 'Analysis',
    readingTimeMinutes: story.readingTime || 5,
    publishedAt: story.publishedAt,
    verifiedEvidenceBadge: `${verifiedCount} Verified Claims • ${sourcesCount} Primary Sources`,
    isFeatured,
  };
}
