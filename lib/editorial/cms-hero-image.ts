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

export interface CMSHeroContentFields {
  headline: string;
  summary: string;
  category: string;
  author: string;
}

/**
 * The canonical model stores hero data on Story fields, while the CMS editor
 * exposes it as a hero block. Synthesize that block for legacy stories and
 * hydrate accessibility metadata only when it belongs to the same image.
 */
export function withCMSHeroBlock(blocks: Block[], story: CMSHeroStoryFields): Block[] {
  const existingHero = blocks.find((block) => block.type === 'hero');
  if (existingHero) {
    const existingData = existingHero.data as HeroBlockData;
    const blockImage = typeof existingData.heroImage === 'string' ? existingData.heroImage.trim() : '';
    const canonicalImage = (story.heroImage || '').trim();
    // Older CMS blocks sometimes have an empty image field even though the
    // canonical Story still has one. Hydrate that legacy gap; once a clear is
    // saved, both fields are empty and the image remains cleared.
    const effectiveImage = blockImage || canonicalImage;
    const canonicalMetadataMatches = effectiveImage === canonicalImage;
    const data: HeroBlockData = {
      ...existingData,
      heroImage: effectiveImage,
      // If the URL disagrees with the canonical record, never attach its old
      // image description/decorative state to the selected asset.
      heroImageAlt: canonicalMetadataMatches
        ? (typeof existingData.heroImageAlt === 'string' ? existingData.heroImageAlt : (story.heroImageAlt || ''))
        : '',
      heroImageIsDecorative: canonicalMetadataMatches
        ? (typeof existingData.heroImageIsDecorative === 'boolean' ? existingData.heroImageIsDecorative : (story.heroImageIsDecorative ?? false))
        : false,
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

/** The hero block is authoritative when present; legacy records retain their canonical image. */
export function resolveCMSHeroImage(blocks: Block[], existingHeroImage = ''): string {
  const heroBlock = blocks.find((block) => block.type === 'hero');
  if (!heroBlock) return existingHeroImage;

  const candidate = (heroBlock.data as Partial<HeroBlockData>).heroImage;
  return typeof candidate === 'string' ? candidate.trim() : '';
}

/** Resolve the content fields exposed by HeroBlock into canonical Story fields. */
export function resolveCMSHeroContent(
  blocks: Block[],
  fallback: CMSHeroContentFields,
): CMSHeroContentFields {
  const heroBlock = blocks.find((block) => block.type === 'hero');
  if (!heroBlock) return fallback;

  const data = heroBlock.data as Partial<HeroBlockData>;
  return {
    headline: typeof data.headline === 'string' && data.headline.trim()
      ? data.headline.trim()
      : fallback.headline,
    // An explicit empty summary/category is allowed so an editor can clear a field.
    summary: typeof data.summary === 'string' ? data.summary.trim() : fallback.summary,
    category: typeof data.category === 'string' ? data.category.trim() : fallback.category,
    author: typeof data.author === 'string' && data.author.trim()
      ? data.author.trim()
      : fallback.author,
  };
}

/**
 * Preserve metadata only when the image is unchanged. If the URL changes, old
 * alt text/decorative status are invalidated unless a distinct new description
 * is supplied explicitly by the editor. Decorative images always use empty alt.
 */
export function resolveCMSHeroMetadata(
  blocks: Block[],
  existingHeroImageAlt = '',
  existingHeroImageIsDecorative = false,
  existingHeroImage = '',
): CMSHeroMetadata {
  const heroBlock = blocks.find((block) => block.type === 'hero');
  if (!heroBlock) {
    return {
      heroImageAlt: existingHeroImageIsDecorative ? '' : existingHeroImageAlt.trim(),
      heroImageIsDecorative: existingHeroImageIsDecorative,
    };
  }

  const data = heroBlock.data as Partial<HeroBlockData>;
  const oldImage = existingHeroImage.trim();
  const newImage = typeof data.heroImage === 'string' ? data.heroImage.trim() : '';
  const imageChanged = Boolean(oldImage) && oldImage !== newImage;
  const oldAlt = existingHeroImageAlt.trim();
  const providedAlt = typeof data.heroImageAlt === 'string' ? data.heroImageAlt.trim() : undefined;

  // The editor clears metadata when its image URL changes. Any non-undefined
  // value here is therefore the editor's explicit current choice—even if it
  // intentionally reuses the same alt description for a different crop/asset.
  const candidateAlt = imageChanged ? (providedAlt ?? '') : (providedAlt ?? oldAlt);
  const decorative = typeof data.heroImageIsDecorative === 'boolean'
    ? data.heroImageIsDecorative
    : (imageChanged ? false : existingHeroImageIsDecorative);

  return {
    heroImageAlt: decorative ? '' : candidateAlt,
    heroImageIsDecorative: decorative,
  };
}
