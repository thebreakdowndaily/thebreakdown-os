import type { Block, HeroBlockData } from '@/utils/cms-data';

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
