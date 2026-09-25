'use client';

import type { FC } from 'react';

interface GlossaryHoverProps {
  term: string;
  definition: string;
}

export const GlossaryHover: FC<GlossaryHoverProps> = ({ term, definition }) => {
  return (
    <span className="relative group cursor-help border-b border-dotted border-gray-400 inline-block">
      {term}
      <span className="hidden group-hover:block group-focus-within:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[calc(100vw-2rem)] z-50 pointer-events-none">
        <span className="block bg-gray-900 text-white rounded-lg shadow-xl p-3 text-xs text-left">
          <strong className="block mb-1">{term}</strong>
          {definition}
        </span>
      </span>
    </span>
  );
};
