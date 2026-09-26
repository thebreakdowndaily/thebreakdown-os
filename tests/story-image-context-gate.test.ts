import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { getStories } from '../utils/data-layer/store';
import { validateImageFile } from '../lib/image-intelligence/asset-validator';
import { matchImageToStoryContext } from '../lib/image-intelligence/context-matcher';
import { getManifestEntry, VERIFIED_STORY_IMAGE_MANIFEST } from '../lib/image-intelligence/manifest';
import { resolveStoryHeroImage } from '../lib/image-intelligence/service';

describe('Story-Image Verification and Context Alignment Subsystem', () => {
  it('validates binary magic bytes and flags invalid or HTML error files', () => {
    // 1. Valid SVG
    const svgResult = validateImageFile('/images/placeholders/story-placeholder.svg');
    expect(svgResult.valid).toBe(true);
    expect(svgResult.format).toBe('svg');

    // 2. Valid JPEG
    const jpgResult = validateImageFile('/images/stories/mgnrega-20.jpg');
    expect(jpgResult.valid).toBe(true);
    expect(jpgResult.format).toBe('jpeg');

    // 3. Simulated HTML 403 error page pretending to be .jpg
    const tempErrorFile = path.join(process.cwd(), 'public', 'images', 'stories', 'temp-fake-error.jpg');
    try {
      fs.writeFileSync(tempErrorFile, '<!DOCTYPE html>\n<html><title>Wikimedia Error</title><body>403 Forbidden</body></html>');
      const fakeResult = validateImageFile('/images/stories/temp-fake-error.jpg');
      expect(fakeResult.valid).toBe(false);
      expect(fakeResult.isHtmlError).toBe(true);
      expect(fakeResult.error).toContain('HTML text error');
    } finally {
      if (fs.existsSync(tempErrorFile)) {
        fs.unlinkSync(tempErrorFile);
      }
    }
  });

  it('correctly matches stories to their approved manifest images and catches mismatches', () => {
    // Verified story from manifest
    const mgnregaMatch = matchImageToStoryContext(
      '/images/stories/mgnrega-20.jpg',
      { slug: 'mgnrega-reform', category: 'economy', tags: ['rural', 'employment'] },
      getManifestEntry
    );
    expect(mgnregaMatch.aligned).toBe(true);
    expect(mgnregaMatch.matchType).toBe('EXACT_MANIFEST');

    // Category placeholder match
    const placeholderMatch = matchImageToStoryContext(
      '/images/placeholders/economy-placeholder.svg',
      { slug: 'sample-economy-story', category: 'economy', tags: [] },
      getManifestEntry
    );
    expect(placeholderMatch.aligned).toBe(true);
    expect(placeholderMatch.matchType).toBe('CATEGORY_PLACEHOLDER_MATCH');

    // Cross-wired mismatch detection (e.g. education graphic on military/geopolitical conflict story)
    const mismatched = matchImageToStoryContext(
      '/images/placeholders/education-placeholder.svg',
      { slug: 'us-iran-war-strait-of-hormuz', category: 'geopolitics', tags: ['military', 'war'] },
      getManifestEntry
    );
    expect(mismatched.aligned).toBe(false);
    expect(mismatched.matchType).toBe('MISMATCH');
  });

  it('guarantees all 55 stories in the story registry have valid on-disk and context-aligned images', () => {
    const stories = getStories({ pageSize: 1000 }).data;
    expect(stories.length).toBeGreaterThanOrEqual(55);

    const failures: string[] = [];

    for (const story of stories) {
      const heroImage = story.heroImage;
      if (!heroImage) {
        failures.push(`Story [${story.slug}] has no heroImage defined`);
        continue;
      }

      // Check on-disk existence and binary format
      const fileValidation = validateImageFile(heroImage);
      if (!fileValidation.valid) {
        failures.push(`Story [${story.slug}] image file invalid: ${heroImage} (${fileValidation.error})`);
        continue;
      }

      // Check context alignment
      const contextMatch = matchImageToStoryContext(
        heroImage,
        {
          slug: story.slug,
          category: story.category,
          tags: story.tags || [],
          headline: story.headline,
        },
        getManifestEntry
      );

      if (!contextMatch.aligned) {
        failures.push(
          `Story [${story.slug}] image is NOT aligned with context: ${heroImage} (${contextMatch.reason})`
        );
      }
    }

    expect(failures).toEqual([]);
  });

  it('ensures resolveStoryHeroImage serves high-integrity verified images with appropriate provenance', () => {
    const stories = getStories({ pageSize: 1000 }).data;
    const manifestSlugs = Object.keys(VERIFIED_STORY_IMAGE_MANIFEST);

    for (const slug of manifestSlugs.slice(0, 5)) {
      const story = stories.find((s) => s.slug === slug);
      if (!story) continue;

      const resolved = resolveStoryHeroImage(story);
      expect(resolved.hero.src).toBe(VERIFIED_STORY_IMAGE_MANIFEST[slug].approvedImage);
      expect(resolved.hero.credit).toBe(VERIFIED_STORY_IMAGE_MANIFEST[slug].provenance);
      expect(resolved.hero.license).toBe(VERIFIED_STORY_IMAGE_MANIFEST[slug].license);
    }
  });
});
