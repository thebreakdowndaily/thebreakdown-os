'use client';

import type { FC } from 'react';
import type { EvidenceRef } from '@/types/canonical';
import { useState } from 'react';

interface EvidenceCardProps {
  label: string;
  items: EvidenceRef[];
  color: string;
  defaultOpen?: boolean;
}

const evColorMap: Record<string, string> = {
  green: 'bg-green-50 text-green-800 hover:bg-green-100',
  blue: 'bg-blue-50 text-blue-800 hover:bg-blue-100',
  purple: 'bg-purple-50 text-purple-800 hover:bg-purple-100',
  cyan: 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100',
  red: 'bg-red-50 text-red-800 hover:bg-red-100',
};

export const EvidenceCard: FC<EvidenceCardProps> = ({ label, items, color, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  if (items.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors ${evColorMap[color] || 'bg-gray-50 text-gray-800 hover:bg-gray-100'}`}
      >
        <span>{label} ({items.length})</span>
        <span className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-start gap-2">
                <span className={`inline-block mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  item.relevance === 'direct' ? 'bg-green-500' :
                  item.relevance === 'supporting' ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <div className="text-sm text-gray-700">{item.excerpt}</div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                <span className={`px-1.5 py-0.5 rounded ${
                  item.relevance === 'direct' ? 'bg-green-100 text-green-700' :
                  item.relevance === 'supporting' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{item.relevance}</span>
                <span>Source {item.sourceId.replace('s', '')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
