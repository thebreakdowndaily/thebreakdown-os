import type { Story } from '@/types/canonical';
import { matchImageToStoryContext } from './context-matcher';
import { getManifestEntry } from './manifest';
import { validateImageFile } from './asset-validator';

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
  'slug' | 'title' | 'headline' | 'category' | 'tags' | 'heroImage' | 'heroImageAlt' | 'heroImageIsDecorative' | 'primaryEntityId' | 'relatedEntityIds'
>): HeroImageContextValidation {
  const image = typeof story.heroImage === 'string' ? story.heroImage.trim() : '';
  if (!image) {
    return { passed: true, skipped: true, reason: 'No hero image assigned; image-context check skipped.' };
  }

  const altText = typeof story.heroImageAlt === 'string' ? story.heroImageAlt.trim() : '';
  const isDecorative = story.heroImageIsDecorative === true;
  const genericAlt = /^(?:image|photo|picture|hero image|mock alt text|placeholder)(?:\s+\d+)?[.!]?$/i.test(altText);

  if (isDecorative && altText) {
    return {
      passed: false,
      skipped: false,
      reason: 'Decorative hero images must use empty alt text.',
    };
  }
  if (!isDecorative && (altText.length < 12 || genericAlt)) {
    return {
      passed: false,
      skipped: false,
      reason: 'Informative hero images require descriptive alt text of at least 12 characters; mark the image decorative only when it conveys no additional information.',
    };
  }

  // Local public paths must resolve to a real, decodable image. This catches
  // stale URLs that would otherwise publish a broken image and broken fallback.
  // Remote URLs are not fetched at publication time; they still require context match.
  if (image.startsWith('/')) {
    const asset = validateImageFile(image);
    if (!asset.isValid) {
      return {
        passed: false,
        skipped: false,
        reason: `Hero image asset invalid: ${asset.error || 'unrecognized image asset'}`,
      };
    }
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
      ? `Hero image passed asset and story-context checks (${match.matchType}): ${match.reason}`
      : `Hero image context mismatch: ${match.reason}`,
  };
}
