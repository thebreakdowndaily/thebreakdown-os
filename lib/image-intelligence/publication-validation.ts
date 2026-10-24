import type { Story } from '@/types/canonical';
import { getManifestEntry } from './manifest';

export const FEATURE_STORY_TYPES = new Set(['explainer', 'analysis', 'investigation_chapter']);

export interface HeroMediaValidation {
  required: boolean;
  passed: boolean;
  assetId?: string;
  assetType?: string;
  violations: string[];
}

/**
 * This gate verifies editorial eligibility, not merely that an image URL exists.
 * The independent browser check must still verify HTTP load, dimensions and visible rendering.
 */
export function validateStoryHeroMedia(story: Pick<Story, 'slug' | 'storyType' | 'heroImage'> & Partial<Pick<Story, 'heroImageAlt'>>): HeroMediaValidation {
  const required = FEATURE_STORY_TYPES.has(story.storyType);
  if (!required) return { required, passed: true, violations: [] };

  const record = getManifestEntry(story.slug);
  const violations: string[] = [];
  if (!record) {
    violations.push('No story-specific manifest record exists; arbitrary entity/tag fallback is not acceptable for a feature hero.');
  } else {
    if (record.assetType === 'branded-placeholder') violations.push('A generic branded placeholder cannot satisfy a feature hero requirement.');
    if (record.assetType === 'illustrative-image') violations.push('Illustrative imagery must be explicitly labelled and is not documentary evidence.');
    if (!record.assetId) violations.push('Missing stable asset ID.');
    if (!record.creator && !record.provenance) violations.push('Missing creator/publisher provenance.');
    if (!record.sourceUrl) violations.push('Missing source URL or repository asset path.');
    if (!record.license || !record.rightsBasis) violations.push('Missing licence or documented rights basis.');
    if (!record.altText && !story.heroImageAlt) violations.push('Missing informative alt text.');
    if (!record.relevanceRationale) violations.push('Missing story-specific relevance rationale.');
    if (!(record.width && record.height && record.width >= 600 && record.height >= 315)) violations.push('Missing usable media dimensions (minimum 600×315).');
    if (!record.format || record.format === 'unknown') violations.push('Missing or unknown file format.');
    if (record.approvalStatus !== 'approved' || !record.approvalTimestamp || Number.isNaN(Date.parse(record.approvalTimestamp))) {
      violations.push('Human editorial media approval and a valid approval timestamp are required.');
    }
    if (record.assetType === 'original-editorial-graphic' && (!record.evidenceSourceUrls || record.evidenceSourceUrls.length === 0)) {
      violations.push('An original data-informed graphic must identify its supporting evidence sources.');
    }
  }

  if (story.heroImage && record && record.approvedImage !== story.heroImage) {
    violations.push('The story hero URL differs from the story-specific manifest asset.');
  }
  return { required, passed: violations.length === 0, assetId: record?.assetId, assetType: record?.assetType, violations };
}
