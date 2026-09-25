'use client';

import type { FC } from 'react';
import { useSources } from '../sources/SourcesContext';

interface InlineCitationProps {
  sourceId: string;
}

export const InlineCitation: FC<InlineCitationProps> = ({ sourceId }) => {
  const getSource = useSources();
  const index = getSource(sourceId);
  if (index === -1) return <span className="text-blue-600 cursor-help">{sourceId.replace('s', '')}</span>;
  return (
    <span className="text-blue-600 cursor-help group relative inline-block">
      {index + 1}
      <span className="hidden group-hover:block group-focus-within:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[calc(100vw-2rem)] z-50 pointer-events-none">
        <span className="block bg-white border border-neutral-200 rounded-lg shadow-xl p-3 text-xs text-gray-800 text-left font-normal">
          Source {index + 1}
        </span>
      </span>
    </span>
  );
};
