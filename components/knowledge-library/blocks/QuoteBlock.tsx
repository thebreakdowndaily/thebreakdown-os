import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { QuoteBlockData } from '@/types/canonical';

export const QuoteBlock: FC<BlockComponentProps> = ({ data, depth }) => {
  const { text, attribution, source } = data as unknown as QuoteBlockData;
  if (depth === 'explorer') {
    return (
      <blockquote className="italic border-l-4 border-gray-300 pl-4 my-4 text-gray-600">
        &ldquo;{text}&rdquo; &mdash; {attribution}
      </blockquote>
    );
  }
  return (
    <blockquote className="italic border-l-4 border-gray-300 pl-4 my-4">
      <p className="text-gray-800">&ldquo;{text}&rdquo;</p>
      <footer className="text-sm text-gray-500 mt-2">
        &mdash; {attribution}
        {source && <span>, <a href={source} className="underline">Source</a></span>}
      </footer>
    </blockquote>
  );
};
