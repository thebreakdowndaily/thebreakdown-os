import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { CalloutBlockData } from '@/types/canonical';

const variants = {
  info: 'bg-blue-50 border-blue-300 text-blue-800',
  warning: 'bg-amber-50 border-amber-300 text-amber-800',
  question: 'bg-purple-50 border-purple-300 text-purple-800',
  definition: 'bg-green-50 border-green-300 text-green-800',
};

export const CalloutBlock: FC<BlockComponentProps> = ({ data }) => {
  const { variant, text } = data as unknown as CalloutBlockData;
  return (
    <div className={`border-l-4 rounded-r-lg p-4 my-4 ${variants[variant] || variants.info}`}>
      <p className="text-sm font-semibold uppercase mb-1">{variant}</p>
      <p>{text}</p>
    </div>
  );
};
