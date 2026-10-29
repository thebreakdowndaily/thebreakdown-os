import type { Story } from '@/types/canonical';
import {
  getManifestEntry,
  findRegisteredAssetForStory,
  isAssetAuthorizedForStory,
  IMAGE_INTELLIGENCE_MANIFEST,
} from './manifest';
import { validateLocalAssetDetailed } from './asset-validator';
import { EDITORIAL_RELEASE_HOLDS } from '@/lib/editorial/release-holds';

export const FEATURE_STORY_TYPES = new Set(['feature', 'explainer', 'analysis', 'investigation_chapter']);

export const EDITORIAL_RELEASE_HOLD_SLUGS = Object.keys(EDITORIAL_RELEASE_HOLDS);

export interface MediaValidationOptions {
  requireDigestLock?: boolean;
}

export interface HeroMediaValidation {
  required: boolean;
  passed: boolean;
  assetId?: string;
  assetType?: string;
  violations: string[];
}

/**
 * Validates hero media against authoritative editorial eligibility,
 * story authorization, local disk integrity, dimensions, and cryptographic digest locking.
 */
export function validateStoryHeroMedia(
  story: Pick<Story, 'slug' | 'storyType' | 'heroImage'> & Partial<Pick<Story, 'heroImageAlt'>>,
  options?: MediaValidationOptions
): HeroMediaValidation {
  const isFeature =
    FEATURE_STORY_TYPES.has(story.storyType) ||
    Boolean((story as any).isFeatureStory) ||
    EDITORIAL_RELEASE_HOLD_SLUGS.includes(story.slug || '');

  if (!isFeature) return { required: false, passed: true, violations: [] };

  const record = getManifestEntry(story.slug);
  const violations: string[] = [];

  if (!record) {
    violations.push(
      `No story-specific manifest record exists for "${story.slug}"; arbitrary entity/tag fallback is not acceptable for a feature hero.`
    );
    return { required: true, passed: false, violations };
  }

  // 1. Explicit Story Authorization Check
  if (!isAssetAuthorizedForStory(record, story.slug)) {
    violations.push(`Hero image asset "${record.approvedImage}" is not authorized for use in story "${story.slug}".`);
  }

  // 2. Semantic and Manifest Invariants
  if (record.assetType === 'branded-placeholder') {
    violations.push('A generic branded placeholder cannot satisfy a feature hero requirement.');
  }
  if (record.assetType === 'illustrative-image') {
    violations.push('Illustrative imagery must be explicitly labelled and is not documentary evidence.');
  }
  if (!record.assetId) violations.push('Missing stable asset ID.');
  if (!record.creator && !record.provenance) violations.push('Missing creator/publisher provenance.');
  if (!record.sourceUrl) violations.push('Missing source URL or repository asset path.');
  if (!record.license || !record.rightsBasis) violations.push('Missing licence or documented rights basis.');
  if (!record.altText && !story.heroImageAlt) violations.push('Missing informative alt text.');
  if (!record.relevanceRationale) violations.push('Missing story-specific relevance rationale.');
  if (!record.format || record.format === 'unknown') violations.push('Missing or unknown file format.');

  if (story.heroImage && record.approvedImage !== story.heroImage) {
    violations.push(`The story hero URL ("${story.heroImage}") differs from the story-specific manifest asset ("${record.approvedImage}").`);
  }

  // 3. Underlying Disk & File Validation (do not trust declared dimensions alone)
  const heroPath = story.heroImage || record.approvedImage;
  const localFile = validateLocalAssetDetailed(heroPath);

  if (!localFile.isPathContained) {
    violations.push(`Hero asset path "${heroPath}" attempts directory traversal outside public directory.`);
  } else if (!localFile.isValid) {
    violations.push(`Underlying hero media file is invalid or corrupt: ${localFile.error}.`);
  } else {
    // Usable dimensions check on actual file
    if (!(localFile.width && localFile.height && localFile.width >= 600 && localFile.height >= 315)) {
      violations.push(
        `Underlying hero media file dimensions (${localFile.width || 0}×${localFile.height || 0}) are below minimum usable dimensions (600×315).`
      );
    }
    // Manifest dimension parity
    if (record.width && record.height && (record.width !== localFile.width || record.height !== localFile.height)) {
      violations.push(
        `Manifest declared dimensions (${record.width}×${record.height}) do not match actual underlying file dimensions (${localFile.width}×${localFile.height}).`
      );
    }

    // Expected digest check (cryptographic integrity)
    if (record.expectedDigest) {
      if (!/^sha256:[a-f0-9]{64}$/i.test(record.expectedDigest)) {
        violations.push(`Hero media manifest expectedDigest "${record.expectedDigest}" is malformed (must match "sha256:<64-hex>").`);
      } else if (localFile.digest && record.expectedDigest !== localFile.digest) {
        violations.push(
          `Hero media file integrity check failed: manifest expectedDigest "${record.expectedDigest}" does not match actual on-disk digest "${localFile.digest}".`
        );
      }
    } else if (story.slug === 'bcci-domestic-mandate-ranji-economics' || record.storySlug === 'bcci-domestic-mandate-ranji-economics') {
      violations.push('Hero media asset covered by pilot contract is missing mandatory expectedDigest.');
    }
  }

  // 4. Editorial Graphic Evidence and Data Provenance
  if (record.assetType === 'original-editorial-graphic') {
    if (!record.evidenceSourceUrls || record.evidenceSourceUrls.length === 0) {
      violations.push('An original data-informed graphic must identify its supporting evidence sources.');
    }
    if (!record.sourceDataProvenance) {
      violations.push('An original editorial graphic must record its underlying source-data provenance.');
    }
  }

  // 5. Human Approval and Cryptographic Content Digest Binding
  if (record.approvalStatus === 'pending') {
    violations.push('Human editorial media approval and a valid approval timestamp are required.');
  } else if (record.approvalStatus === 'rejected') {
    violations.push('Hero media asset was rejected during editorial review.');
  } else if (record.approvalStatus !== 'approved') {
    violations.push('Hero media asset is not approved for publication.');
  } else {
    if (!record.approvalTimestamp || Number.isNaN(Date.parse(record.approvalTimestamp))) {
      violations.push('Approved media requires a valid ISO-8601 approval timestamp.');
    }

    if (record.approvedDigest) {
      if (!/^sha256:[a-f0-9]{64}$/i.test(record.approvedDigest)) {
        violations.push(`Hero media approvedDigest "${record.approvedDigest}" is malformed.`);
      } else if (localFile.digest && localFile.digest !== record.approvedDigest) {
        violations.push(
          `Media approval is stale: asset content on disk has changed since human approval (approved digest: "${record.approvedDigest}", current file digest: "${localFile.digest}"). Re-review and explicit approval required.`
        );
      }
    } else if (options?.requireDigestLock) {
      violations.push('Approved hero media requires an explicit approved content digest (approvedDigest).');
    }

    if (record.reviewedBy && (!record.reviewerRole || !record.reviewerRole.trim())) {
      violations.push('Approved hero media requires an authorized reviewer role (reviewerRole).');
    }
  }

  return {
    required: true,
    passed: violations.length === 0,
    assetId: record.assetId,
    assetType: record.assetType,
    violations,
  };
}

export interface SupportingMediaValidation {
  required: boolean;
  passed: boolean;
  assetIds: string[];
  violations: string[];
}

/**
 * Validate all authored image blocks in feature stories.
 * Enforces explicit story authorization, local file binary verification,
 * dimension checks, cryptographic SHA-256 integrity, and human approval binding.
 */
export function validateStorySupportingMedia(
  story: Pick<Story, 'slug' | 'storyType' | 'blocks'>,
  options?: MediaValidationOptions
): SupportingMediaValidation {
  const isFeature =
    FEATURE_STORY_TYPES.has(story.storyType) ||
    Boolean((story as any).isFeatureStory) ||
    EDITORIAL_RELEASE_HOLD_SLUGS.includes(story.slug || '');

  if (!isFeature) return { required: false, passed: true, assetIds: [], violations: [] };

  const imageBlocks = (story.blocks || []).filter((block: any) => block.type === 'image');
  const violations: string[] = [];
  const assetIds: string[] = [];

  // Minimum visual package invariant for feature / investigation stories
  if (imageBlocks.length === 0) {
    violations.push(
      `Feature story "${story.slug}" does not satisfy the agreed visual-package minimum: at least one verified supporting image or graphic block is required.`
    );
    return { required: true, passed: false, assetIds: [], violations };
  }

  for (const [index, block] of imageBlocks.entries()) {
    const data = (block as any).data || {};
    const src = typeof data.src === 'string' ? data.src : '';
    if (!src) {
      violations.push(`Supporting image ${index + 1} is missing a source URL.`);
      continue;
    }

    // 1. Explicit Story-to-Asset Authorization Lookup
    const { record, isAuthorized } = findRegisteredAssetForStory(src, story.slug);
    if (!record) {
      violations.push(`Supporting image ${index + 1} (${src}) has no registered media manifest record.`);
      continue;
    }

    if (!isAuthorized) {
      violations.push(
        `Supporting image ${index + 1} (${src}) is not authorized for use in story "${story.slug}". Cross-story reuse requires explicit authorization in the manifest.`
      );
      continue;
    }

    // 2. Metadata and Editorial Invariants
    if (record.assetType === 'branded-placeholder') {
      violations.push(`Supporting image ${index + 1} is a generic placeholder.`);
    }
    if (!record.assetId) {
      violations.push(`Supporting image ${index + 1} is missing a stable asset ID.`);
    }
    if (!record.provenance || !record.sourceUrl) {
      violations.push(`Supporting image ${index + 1} is missing provenance or a source URL.`);
    }
    if (!record.license || !record.rightsBasis) {
      violations.push(`Supporting image ${index + 1} is missing a license or rights basis.`);
    }
    if (!(typeof data.alt === 'string' && data.alt.trim()) || !record.altText) {
      violations.push(`Supporting image ${index + 1} is missing informative alt text.`);
    }
    if (!(typeof data.caption === 'string' && data.caption.trim()) || !record.caption) {
      violations.push(`Supporting image ${index + 1} is missing a visible caption.`);
    }
    if (!record.relevanceRationale) {
      violations.push(`Supporting image ${index + 1} is missing a story-specific relevance rationale.`);
    }
    if (!record.format || record.format === 'unknown') {
      violations.push(`Supporting image ${index + 1} has no known file format.`);
    }

    // 3. Underlying File and Intrinsic Dimensions Check
    const localFile = validateLocalAssetDetailed(src);
    if (!localFile.isPathContained) {
      violations.push(`Supporting image ${index + 1} path "${src}" attempts directory traversal outside public directory.`);
    } else if (!localFile.isValid) {
      violations.push(`Supporting image ${index + 1} underlying file is invalid or corrupt: ${localFile.error}.`);
    } else {
      if (!(localFile.width && localFile.height && localFile.width >= 600 && localFile.height >= 315)) {
        violations.push(
          `Supporting image ${index + 1} underlying file dimensions (${localFile.width || 0}×${localFile.height || 0}) are below minimum usable dimensions (600×315).`
        );
      }
      if (record.width && record.height && (record.width !== localFile.width || record.height !== localFile.height)) {
        violations.push(
          `Supporting image ${index + 1} manifest declared dimensions (${record.width}×${record.height}) do not match actual underlying file dimensions (${localFile.width}×${localFile.height}).`
        );
      }

      // Expected digest check
      if (record.expectedDigest) {
        if (!/^sha256:[a-f0-9]{64}$/i.test(record.expectedDigest)) {
          violations.push(`Supporting image ${index + 1} expectedDigest "${record.expectedDigest}" is malformed (must match "sha256:<64-hex>").`);
        } else if (localFile.digest && record.expectedDigest !== localFile.digest) {
          violations.push(
            `Supporting image ${index + 1} file integrity check failed: manifest expectedDigest "${record.expectedDigest}" does not match actual on-disk digest "${localFile.digest}".`
          );
        }
      } else if (story.slug === 'bcci-domestic-mandate-ranji-economics' || record.storySlug === 'bcci-domestic-mandate-ranji-economics') {
        violations.push(`Supporting image ${index + 1} covered by pilot contract is missing mandatory expectedDigest.`);
      }
    }

    // 4. Original Editorial Graphic Requirements
    if (record.assetType === 'original-editorial-graphic') {
      if (!record.evidenceSourceUrls || record.evidenceSourceUrls.length === 0) {
        violations.push(`Supporting image ${index + 1} lacks links to its supporting evidence.`);
      }
      if (!record.sourceDataProvenance) {
        violations.push(`Supporting image ${index + 1} lacks underlying source-data provenance.`);
      }
    }

    // 5. Human Approval & Cryptographic Content Digest Binding
    if (record.approvalStatus === 'pending') {
      violations.push(`Supporting image ${index + 1} requires explicit human media approval after the latest revision.`);
    } else if (record.approvalStatus === 'rejected') {
      violations.push(`Supporting image ${index + 1} was rejected during editorial review.`);
    } else if (record.approvalStatus !== 'approved') {
      violations.push(`Supporting image ${index + 1} is not approved for publication.`);
    } else {
      if (!record.approvalTimestamp || Number.isNaN(Date.parse(record.approvalTimestamp))) {
        violations.push(`Supporting image ${index + 1} requires a valid ISO-8601 approval timestamp.`);
      }

      if (record.approvedDigest) {
        if (!/^sha256:[a-f0-9]{64}$/i.test(record.approvedDigest)) {
          violations.push(`Supporting image ${index + 1} approvedDigest "${record.approvedDigest}" is malformed.`);
        } else if (localFile.digest && localFile.digest !== record.approvedDigest) {
          violations.push(
            `Supporting image ${index + 1} approval is stale: asset content on disk has changed since human approval (approved digest: "${record.approvedDigest}", current file digest: "${localFile.digest}"). Re-review and explicit approval required.`
          );
        }
      } else if (options?.requireDigestLock) {
        violations.push(`Supporting image ${index + 1} requires an approved content digest (approvedDigest).`);
      }

      if (record.reviewedBy && (!record.reviewerRole || !record.reviewerRole.trim())) {
        violations.push(`Supporting image ${index + 1} requires an authorized reviewer role (reviewerRole).`);
      }
    }

    if (record.assetId) assetIds.push(record.assetId);
  }

  return { required: true, passed: violations.length === 0, assetIds, violations };
}
