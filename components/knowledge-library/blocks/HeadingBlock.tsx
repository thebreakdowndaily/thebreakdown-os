import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { HeadingBlockData } from '@/types/canonical';
import { slugifyHeading } from '@/lib/toc';

export const HeadingBlock: FC<BlockComponentProps> = ({ data }) => {
  const { text, level } = data as unknown as HeadingBlockData;
  const id = slugifyHeading(text);
  switch (level) {
    case 1: return <h2 id={id} className="text-2xl font-semibold mt-8 mb-4">{text}</h2>;
    case 2: return <h3 id={id} className="text-xl font-semibold mt-6 mb-3">{text}</h3>;
    case 3: return <h4 id={id} className="text-lg font-medium mt-4 mb-2">{text}</h4>;
  }
};
