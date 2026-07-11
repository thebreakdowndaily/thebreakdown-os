'use client';

import type { HeroBlockData } from './types';
import Hero from '@/components/story/Hero';
import type { Story } from '@/types/canonical';

export default function HeroBlock(props: HeroBlockData) {
  const storyMock = {
    ...props,
  } as unknown as Story;
  
  return <Hero story={storyMock} />;
}
