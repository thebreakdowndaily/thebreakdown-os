import type { Story, Topic, Entity } from '@/types/canonical';
import { findImage, getPlaceholder, type ImageCandidate, type ImagePriority } from './registry';

export interface ImageIntelligenceResult {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority: ImagePriority;
  type: 'official' | 'editorial' | 'creative-commons' | 'ai-illustration' | 'branded-placeholder';
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

export function resolveStoryHeroImage(story: Story): ResolvedStoryImage {
  if (story.heroImage && !story.heroImage.includes('placehold.co')) {
    const r = toResult(
      story.heroImage, story.headline, 1, 'editorial', DEFAULT_HERO_WIDTH, DEFAULT_HERO_HEIGHT, false,
      { credit: 'The Breakdown', agency: 'The Breakdown', license: 'EDITORIAL' }
    );
    return { hero: r, og: r, thumbnail: toResult(story.heroImage, story.headline, 1, 'editorial', DEFAULT_THUMB_WIDTH, DEFAULT_THUMB_HEIGHT, false) };
  }

  for (const entityId of story.relatedEntityIds) {
    const found = findImage(entityId);
    if (found) {
      const r = fromCandidate(found, false);
      return { hero: r, og: r, thumbnail: fromCandidate(found, false, DEFAULT_THUMB_WIDTH, DEFAULT_THUMB_HEIGHT) };
    }
  }

  for (const tag of story.tags) {
    const found = findImage(tag);
    if (found) {
      const r = fromCandidate(found, false);
      return { hero: r, og: r, thumbnail: fromCandidate(found, false, DEFAULT_THUMB_WIDTH, DEFAULT_THUMB_HEIGHT) };
    }
  }

  const categoryPlaceholder = getPlaceholder(story.category);
  const fallback: ImageIntelligenceResult = toResult(
    categoryPlaceholder, story.headline, 4, 'branded-placeholder', DEFAULT_HERO_WIDTH, DEFAULT_HERO_HEIGHT, true
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
