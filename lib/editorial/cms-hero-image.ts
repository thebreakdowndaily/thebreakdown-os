import type { Block, HeroBlockData } from '@/utils/cms-data';

export interface CMSHeroStoryFields {
  id: string;
  title: string;
  headline?: string;
  summary?: string;
  heroImage?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
}

/**
 * The canonical model stores the hero image on Story.heroImage, while the CMS
 * editor exposes it as a hero block. Synthesize that editor block for legacy
 * stories so editors can actually change the field which the public reader uses.
 */
export function withCMSHeroBlock(blocks: Block[], story: CMSHeroStoryFields): Block[] {
  if (blocks.some((block) => block.type === 'hero')) return blocks;

  const data: HeroBlockData = {
    headline: story.headline || story.title,
    summary: story.summary || '',
    heroImage: story.heroImage || '',
    category: story.category || '',
    author: story.author || '',
    publishedAt: story.publishedAt || '',
  };

  return [
    { id: `cms-hero-${story.id}`, type: 'hero', data, collapsed: false },
    ...blocks,
  ];
}


/**
 * Resolve the canonical reader-facing hero image from the CMS hero block.
 *
 * If a hero block exists, its image field is authoritative. Stories created
 * before the hero-block contract existed keep their persisted canonical image
 * when no hero block is present.
 */
export function resolveCMSHeroImage(blocks: Block[], existingHeroImage = ''): string {
  const heroBlock = blocks.find((block) => block.type === 'hero');
  if (!heroBlock) return existingHeroImage;

  const candidate = (heroBlock.data as Partial<HeroBlockData>).heroImage;
  return typeof candidate === 'string' ? candidate.trim() : '';
}
