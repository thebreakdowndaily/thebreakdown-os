'use client';

import type { FC } from 'react';

interface GlossaryHoverProps {
  term: string;
  definition: string;
}

export const GlossaryHover: FC<GlossaryHoverProps> = ({ term, definition }) => {
  return (
    <span className="relative group cursor-help border-b border-dotted border-gray-400">
      {term}
      <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 z-50">
        <span className="block bg-gray-900 text-white rounded-lg shadow-xl p-3 text-xs text-left">
          <strong className="block mb-1">{term}</strong>
          {definition}
        </span>
      </span>
    </span>
  );
};
