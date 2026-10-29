import { resolveStoryHeroImage, type StoryHeroImageInput } from './service';

export interface StoryImagePresentationInput extends StoryHeroImageInput {
  heroImageIsDecorative?: boolean;
}
export interface StoryImagePresentation {
  src: string;
  alt: string;
  isFallback: boolean;
  caption?: string;
  credit?: string;
}

/** One policy-enforced image decision for every public story surface. */
export function getStoryImagePresentation(story: StoryImagePresentationInput): StoryImagePresentation {
  const resolved = resolveStoryHeroImage(story).hero;
  return {
    src: resolved.src,
    alt: story.heroImageIsDecorative ? '' : resolved.alt,
    isFallback: resolved.isFallback,
    caption: resolved.isFallback ? undefined : resolved.caption,
    credit: resolved.isFallback ? undefined : resolved.credit,
  };
}
