'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { ParagraphBlockData } from '@/types/canonical';
import { InlineCitation } from '../citations/InlineCitation';

export const ParagraphBlock: FC<BlockComponentProps> = ({ data }) => {
  const { text, citations } = data as unknown as ParagraphBlockData;
  return (
    <p className="text-gray-800 leading-relaxed">
      {text}
      {citations.length > 0 && (
        <sup className="ml-1">
          {citations.map((cid, i) => (
            <span key={cid}>
              <InlineCitation sourceId={cid} />
              {i < citations.length - 1 ? ', ' : ''}
            </span>
          ))}
        </sup>
      )}
    </p>
  );
};
