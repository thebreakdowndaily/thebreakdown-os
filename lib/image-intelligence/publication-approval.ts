import { getManifestEntry, type VerifiedImageRecord } from './manifest';

export interface HeroImageApprovalStory {
  slug: string;
  heroImage?: string | null;
}

export interface HeroImageApprovalCheck {
  name: 'hero_image_approved';
  passed: boolean;
  reason: string;
  details?: string;
}

export type HeroImageManifestLookup = (slug: string) => VerifiedImageRecord | null;

function isVerifiedHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

/**
 * The live publication gate requires explicit, per-story image approval.
 *
 * Asset existence, category matching, semantic token overlap, and a runtime
 * fallback do not constitute editorial approval. The manifest must name the
 * exact image stored on the story, identify its source and licensing status,
 * and not mark a generic placeholder as an approved hero.
 *
 * No legacy bypass is implicit. An older story lacking these fields must be
 * reviewed and updated before it can enter a new publication transition.
 */
export function validateStoryHeroImageApproval(
  story: HeroImageApprovalStory | null | undefined,
  lookup: HeroImageManifestLookup = getManifestEntry,
): HeroImageApprovalCheck {
  const fail = (reason: string, details?: string): HeroImageApprovalCheck => ({
    name: 'hero_image_approved',
    passed: false,
    reason,
    ...(details ? { details } : {}),
  });

  if (!story || !story.slug?.trim()) {
    return fail('Story image approval cannot be checked because the story or slug is missing.');
  }

  const entry = lookup(story.slug);
  if (!entry) {
    return fail(
      'No individually approved hero-image manifest entry exists for this story.',
      `storySlug=${story.slug}`,
    );
  }

  if (entry.storySlug !== story.slug) {
    return fail(
      'Hero-image manifest record is assigned to a different story.',
      `expectedStorySlug=${story.slug}; manifestStorySlug=${entry.storySlug}`,
    );
  }

  if (!story.heroImage?.trim()) {
    return fail('Story has no hero image assigned.');
  }

  if (entry.approvedImage !== story.heroImage) {
    return fail(
      'Story hero image does not exactly match its approved manifest asset.',
      `storyHero=${story.heroImage}; approvedHero=${entry.approvedImage}`,
    );
  }

  if (
    entry.assetType === 'branded-placeholder' ||
    entry.approvedImage.includes('/images/placeholders/')
  ) {
    return fail(
      'Generic placeholder imagery cannot satisfy the live publication image-approval gate.',
      `asset=${entry.approvedImage}`,
    );
  }

  if (!entry.provenance?.trim() || !entry.description?.trim() || !entry.license?.trim()) {
    return fail(
      'Hero-image manifest is missing provenance, description, or licensing status.',
      `asset=${entry.approvedImage}`,
    );
  }

  if (!isVerifiedHttpsUrl(entry.sourceUrl)) {
    return fail(
      'Hero-image manifest must include an HTTPS source URL for the original asset or authoritative licensing/source page.',
      `asset=${entry.approvedImage}; sourceUrl=${entry.sourceUrl || '(missing)'}`,
    );
  }

  return {
    name: 'hero_image_approved',
    passed: true,
    reason: 'Story hero matches its individually approved manifest asset with provenance, licensing status, and HTTPS source evidence.',
    details: `asset=${entry.approvedImage}; license=${entry.license}; sourceUrl=${entry.sourceUrl}`,
  };
}
