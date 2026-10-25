import type { Story } from '@/types/canonical';
import { getManifestEntry, IMAGE_INTELLIGENCE_MANIFEST } from './manifest';

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


export interface SupportingMediaValidation {
  required: boolean;
  passed: boolean;
  assetIds: string[];
  violations: string[];
}

/**
 * Validate all authored image blocks in feature stories. A chart or infographic
 * is not publication-ready merely because its URL exists or its SVG renders.
 */
export function validateStorySupportingMedia(
  story: Pick<Story, 'slug' | 'storyType' | 'blocks'>
): SupportingMediaValidation {
  const required = FEATURE_STORY_TYPES.has(story.storyType);
  if (!required) return { required, passed: true, assetIds: [], violations: [] };

  const imageBlocks = (story.blocks || []).filter((block: any) => block.type === 'image');
  const violations: string[] = [];
  const assetIds: string[] = [];

  for (const [index, block] of imageBlocks.entries()) {
    const data = (block as any).data || {};
    const src = typeof data.src === 'string' ? data.src : '';
    if (!src) {
      violations.push(`Supporting image ${index + 1} is missing a source URL.`);
      continue;
    }

    const record = Object.values(IMAGE_INTELLIGENCE_MANIFEST).find((candidate) => candidate.approvedImage === src);
    if (!record) {
      violations.push(`Supporting image ${index + 1} (${src}) has no registered media manifest record.`);
      continue;
    }
    if (record.assetType === 'branded-placeholder') violations.push(`Supporting image ${index + 1} is a generic placeholder.`);
    if (!record.assetId) violations.push(`Supporting image ${index + 1} is missing a stable asset ID.`);
    if (!record.provenance || !record.sourceUrl) violations.push(`Supporting image ${index + 1} is missing provenance or a source URL.`);
    if (!record.license || !record.rightsBasis) violations.push(`Supporting image ${index + 1} is missing a license or rights basis.`);
    if (!(typeof data.alt === 'string' && data.alt.trim()) || !record.altText) violations.push(`Supporting image ${index + 1} is missing informative alt text.`);
    if (!(typeof data.caption === 'string' && data.caption.trim()) || !record.caption) violations.push(`Supporting image ${index + 1} is missing a visible caption.`);
    if (!record.relevanceRationale) violations.push(`Supporting image ${index + 1} is missing a story-specific relevance rationale.`);
    if (!(record.width && record.height && record.width >= 600 && record.height >= 315)) violations.push(`Supporting image ${index + 1} is missing usable dimensions (minimum 600×315).`);
    if (!record.format || record.format === 'unknown') violations.push(`Supporting image ${index + 1} has no known file format.`);
    if (record.assetType === 'original-editorial-graphic' && (!record.evidenceSourceUrls || record.evidenceSourceUrls.length === 0)) {
      violations.push(`Supporting image ${index + 1} lacks links to its supporting evidence.`);
    }
    if (record.approvalStatus !== 'approved' || !record.approvalTimestamp || Number.isNaN(Date.parse(record.approvalTimestamp))) {
      violations.push(`Supporting image ${index + 1} requires explicit human media approval after the latest revision.`);
    }
    if (record.assetId) assetIds.push(record.assetId);
  }

  return { required, passed: violations.length === 0, assetIds, violations };
}
