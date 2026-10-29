import type { Topic, Entity } from '@/types/canonical';
import { findImage, getPlaceholder, type ImageCandidate, type ImagePriority } from './registry';
import { getManifestEntry, isAssetAuthorizedForStory, type VerifiedImageRecord } from './manifest';

export interface ImageIntelligenceResult {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority: ImagePriority;
  type: 'official' | 'editorial' | 'creative-commons' | 'ai-illustration' | 'branded-placeholder';
  caption?: string;
  credit?: string;
  agency?: string;
  license?: string;
  sourceUrl?: string;
  blurHash?: string;
  isFallback: boolean;
}

export interface ResolvedStoryImage {
  hero: ImageIntelligenceResult;
  og: ImageIntelligenceResult;
  thumbnail: ImageIntelligenceResult;
}

const DEFAULT_HERO_WIDTH = 1200;
const DEFAULT_HERO_HEIGHT = 630;
const DEFAULT_THUMB_WIDTH = 400;
const DEFAULT_THUMB_HEIGHT = 225;

function toResult(
  src: string,
  alt: string,
  priority: ImagePriority,
  type: ImageIntelligenceResult['type'],
  width: number,
  height: number,
  isFallback: boolean,
  extra?: Partial<ImageIntelligenceResult>
): ImageIntelligenceResult {
  return { src, alt, priority, type, width, height, isFallback, ...extra };
}

function fromCandidate(c: ImageCandidate, isFallback: boolean, w = DEFAULT_HERO_WIDTH, h = DEFAULT_HERO_HEIGHT): ImageIntelligenceResult {
  return toResult(c.src, c.alt, c.priority, c.type, c.width || w, c.height || h, isFallback, {
    credit: c.credit, agency: c.agency, license: c.license, sourceUrl: c.sourceUrl,
  });
}

export interface StoryHeroImageInput {
  slug: string;
  headline?: string;
  title?: string;
  category?: string | null;
  heroImage?: string | null;
  storyType?: string;
  tags?: string[];
  relatedEntityIds?: string[];
}
const SHA256_DIGEST = /^sha256:[a-f0-9]{64}$/i;

function hasPublicHeroApproval(record: VerifiedImageRecord, slug: string): boolean {
  return record.approvalStatus === 'approved'
    && record.assetType !== 'branded-placeholder'
    && record.license !== 'BRANDED_VECTOR'
    && isAssetAuthorizedForStory(record, slug)
    && Boolean(record.approvalTimestamp && !Number.isNaN(Date.parse(record.approvalTimestamp)))
    && Boolean(record.approvedDigest && SHA256_DIGEST.test(record.approvedDigest))
    && (!record.expectedDigest || (
      SHA256_DIGEST.test(record.expectedDigest) && record.approvedDigest === record.expectedDigest
    ))
    && Boolean(record.rightsBasis?.trim())
    && Boolean((record.creator || record.provenance)?.trim())
    && Boolean(record.sourceUrl?.trim())
    && Boolean(record.relevanceRationale?.trim())
    && Boolean((record.altText || record.description)?.trim());
}
function storyPlaceholder(category?: string | null): string {
  const normalized = (category || 'story').trim().toLowerCase();
  const aliases: Record<string, string> = {
    geopolitics: 'policy', politics: 'policy', governance: 'policy',
    'health policy': 'health', 'public policy': 'policy',
  };
  return getPlaceholder(aliases[normalized] || normalized);
}

export function resolveStoryHeroImage(story: StoryHeroImageInput): ResolvedStoryImage {
  const headline = story.headline || story.title || story.slug || 'this story';
  const manifest = getManifestEntry(story.slug);
  // File name, semantic match, tags and checksum alone cannot prove relevance,
  // rights, story authorization or human approval.
  if (manifest && hasPublicHeroApproval(manifest, story.slug)) {
    const type: ImageIntelligenceResult['type'] =
      manifest.assetType === 'official-document' || manifest.assetType === 'authentic-map'
        ? 'official'
        : manifest.assetType === 'illustrative-image'
          ? 'ai-illustration'
          : manifest.license === 'CREATIVE_COMMONS'
            ? 'creative-commons'
            : 'editorial';
    const hero = toResult(
      manifest.approvedImage, manifest.altText || manifest.description, 1, type,
      manifest.width || DEFAULT_HERO_WIDTH, manifest.height || DEFAULT_HERO_HEIGHT, false,
      { caption: manifest.caption, credit: manifest.creator || manifest.provenance,
        agency: manifest.provenance, license: manifest.license, sourceUrl: manifest.sourceUrl }
    );
    return { hero, og: hero, thumbnail: { ...hero, width: DEFAULT_THUMB_WIDTH, height: DEFAULT_THUMB_HEIGHT } };
  }
  // Unknown, legacy, pending, rejected, incomplete or unauthorized entries
  // never expose raw database paths; use a clear placeholder until review.
  const fallback = toResult(
    storyPlaceholder(story.category),
    `Editorial placeholder: the hero image for “${headline}” has not been verified for publication.`,
    4, 'branded-placeholder', DEFAULT_HERO_WIDTH, DEFAULT_HERO_HEIGHT, true,
    { license: 'BRANDED_VECTOR' }
  );
  return { hero: fallback, og: fallback, thumbnail: { ...fallback, width: DEFAULT_THUMB_WIDTH, height: DEFAULT_THUMB_HEIGHT } };
}

export function resolveEntityImage(entity: Entity): ImageIntelligenceResult {
  if (entity.image) {
    return toResult(entity.image, entity.name, 1, 'official', DEFAULT_HERO_WIDTH, DEFAULT_HERO_HEIGHT, false);
  }

  const found = findImage(entity.slug) || findImage(entity.id);
  if (found) return fromCandidate(found, false);

  const typePlaceholder = getPlaceholder(entity.type);
  return toResult(typePlaceholder, entity.name, 4, 'branded-placeholder', DEFAULT_HERO_WIDTH, DEFAULT_HERO_HEIGHT, true);
}

export function resolveTopicImage(topic: Topic): ImageIntelligenceResult {
  if (topic.image) {
    return toResult(topic.image, topic.name, 1, 'editorial', DEFAULT_HERO_WIDTH, DEFAULT_HERO_HEIGHT, false);
  }

  const found = findImage(topic.slug);
  if (found) return fromCandidate(found, false);

  const placeholder = getPlaceholder(topic.slug);
  return toResult(placeholder, topic.name, 4, 'branded-placeholder', DEFAULT_HERO_WIDTH, DEFAULT_HERO_HEIGHT, true);
}

export function resolveSearchThumbnail(title: string, type: string): ImageIntelligenceResult {
  const found = findImage(title.toLowerCase().replace(/\s+/g, '-'));
  if (found) {
    return fromCandidate(found, false, DEFAULT_THUMB_WIDTH, DEFAULT_THUMB_HEIGHT);
  }
  const placeholder = getPlaceholder(type);
  return toResult(placeholder, title, 4, 'branded-placeholder', DEFAULT_THUMB_WIDTH, DEFAULT_THUMB_HEIGHT, true);
}
