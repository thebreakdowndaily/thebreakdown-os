import type { Block, HeroBlockData } from '@/utils/cms-data';

export interface CMSHeroStoryFields {
  id: string;
  title: string;
  headline?: string;
  summary?: string;
  heroImage?: string;
  heroImageAlt?: string;
  heroImageIsDecorative?: boolean;
  category?: string;
  author?: string;
  publishedAt?: string;
}

export interface CMSHeroMetadata {
  heroImageAlt: string;
  heroImageIsDecorative: boolean;
}

/**
 * The canonical model stores hero data on Story fields, while the CMS editor
 * exposes it as a hero block. Synthesize that block for legacy stories and
 * hydrate missing accessibility fields from the canonical record.
 */
export function withCMSHeroBlock(blocks: Block[], story: CMSHeroStoryFields): Block[] {
  const existingHero = blocks.find((block) => block.type === 'hero');
  if (existingHero) {
    const existingData = existingHero.data as HeroBlockData;
    const data: HeroBlockData = {
      ...existingData,
      heroImageAlt: typeof existingData.heroImageAlt === 'string'
        ? existingData.heroImageAlt
        : (story.heroImageAlt || ''),
      heroImageIsDecorative: typeof existingData.heroImageIsDecorative === 'boolean'
        ? existingData.heroImageIsDecorative
        : (story.heroImageIsDecorative ?? false),
    };
    return blocks.map((block) => block.id === existingHero.id ? { ...block, data } : block);
  }

  const data: HeroBlockData = {
    headline: story.headline || story.title,
    summary: story.summary || '',
    heroImage: story.heroImage || '',
    category: story.category || '',
    author: story.author || '',
    publishedAt: story.publishedAt || '',
    heroImageAlt: story.heroImageAlt || '',
    heroImageIsDecorative: story.heroImageIsDecorative ?? false,
  };

  return [
    { id: `cms-hero-${story.id}`, type: 'hero', data, collapsed: false },
    ...blocks,
  ];
}

/**
 * Resolve the canonical reader-facing hero image from the CMS hero block.
 * A story without a hero block keeps the image already stored on its record.
 */
export function resolveCMSHeroImage(blocks: Block[], existingHeroImage = ''): string {
  const heroBlock = blocks.find((block) => block.type === 'hero');
  if (!heroBlock) return existingHeroImage;

  const candidate = (heroBlock.data as Partial<HeroBlockData>).heroImage;
  return typeof candidate === 'string' ? candidate.trim() : '';
}

/**
 * Preserve legacy metadata only when the editor block has no metadata field.
 * An explicit empty alt string therefore clears a stale description. Decorative
 * images do not keep an informative alt string in the canonical record.
 */
export function resolveCMSHeroMetadata(
  blocks: Block[],
  existingHeroImageAlt = '',
  existingHeroImageIsDecorative = false,
): CMSHeroMetadata {
  const heroBlock = blocks.find((block) => block.type === 'hero');
  if (!heroBlock) {
    return {
      heroImageAlt: existingHeroImageIsDecorative ? '' : existingHeroImageAlt.trim(),
      heroImageIsDecorative: existingHeroImageIsDecorative,
    };
  }

  const data = heroBlock.data as Partial<HeroBlockData>;
  const isDecorative = typeof data.heroImageIsDecorative === 'boolean'
    ? data.heroImageIsDecorative
    : existingHeroImageIsDecorative;
  const altText = typeof data.heroImageAlt === 'string'
    ? data.heroImageAlt.trim()
    : existingHeroImageAlt.trim();

  return {
    heroImageAlt: isDecorative ? '' : altText,
    heroImageIsDecorative: isDecorative,
  };
}
