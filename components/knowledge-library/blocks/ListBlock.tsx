import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { ListBlockData } from '@/types/canonical';

export const ListBlock: FC<BlockComponentProps> = ({ data }) => {
  const { items, ordered } = data as unknown as ListBlockData;
  if (ordered) {
    return (
      <ol className="list-decimal pl-6 space-y-1 text-gray-800">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ol>
    );
  }
  return (
    <ul className="list-disc pl-6 space-y-1 text-gray-800">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
};
