import type { Story } from '@/types/canonical';
import { matchImageToStoryContext } from './context-matcher';
import { getManifestEntry } from './manifest';

export interface HeroImageContextValidation {
  passed: boolean;
  skipped: boolean;
  reason: string;
}

/**
 * Verify an assigned hero image against story subject and the editorial manifest.
 * Blank images are skipped here; this gate prevents wrong provided images, while
 * any separate requirement to require a hero image belongs to the publication schema.
 */
export function validateHeroImageContext(story: Pick<
  Story,
  'slug' | 'title' | 'headline' | 'category' | 'tags' | 'heroImage' | 'primaryEntityId' | 'relatedEntityIds'
>): HeroImageContextValidation {
  const image = typeof story.heroImage === 'string' ? story.heroImage.trim() : '';
  if (!image) {
    return { passed: true, skipped: true, reason: 'No hero image assigned; image-context check skipped.' };
  }

  const match = matchImageToStoryContext(image, {
    slug: story.slug,
    title: story.title,
    headline: story.headline,
    category: story.category,
    tags: story.tags,
    primaryEntityId: story.primaryEntityId,
    relatedEntityIds: story.relatedEntityIds,
  }, getManifestEntry);

  return {
    passed: match.isMatch,
    skipped: false,
    reason: match.isMatch
      ? `Hero image passed story-context check (${match.matchType}): ${match.reason}`
      : `Hero image context mismatch: ${match.reason}`,
  };
}
