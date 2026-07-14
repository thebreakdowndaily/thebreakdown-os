'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { RelationshipCardData } from '@/types/canonical';
import { useState } from 'react';

const relationshipColors: Record<string, string> = {
  'influenced': 'bg-blue-50 border-blue-200 text-blue-700',
  'opposed': 'bg-red-50 border-red-200 text-red-700',
  'succeeded': 'bg-green-50 border-green-200 text-green-700',
  'preceded': 'bg-amber-50 border-amber-200 text-amber-700',
  'allied': 'bg-indigo-50 border-indigo-200 text-indigo-700',
  'conflicted': 'bg-orange-50 border-orange-200 text-orange-700',
  'negotiated': 'bg-purple-50 border-purple-200 text-purple-700',
  'founded': 'bg-teal-50 border-teal-200 text-teal-700',
};

export const RelationshipCardBlock: FC<BlockComponentProps> = ({ data }) => {
  const { mainEntity, relationships } = data as unknown as RelationshipCardData;
  const [filter, setFilter] = useState<string>('');

  const relationshipTypes = Array.from(new Set(relationships.map(r => r.relationshipType)));
  const filtered = filter
    ? relationships.filter(r => r.relationshipType === filter)
    : relationships;

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden my-6">
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Knowledge Graph</span>
          <span className="text-xs text-gray-400">— Related to</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">{mainEntity}</h3>
      </div>

      {relationshipTypes.length > 1 && (
        <div className="px-5 py-2 flex flex-wrap gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('')}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              !filter ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({relationships.length})
          </button>
          {relationshipTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                filter === type ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type} ({relationships.filter(r => r.relationshipType === type).length})
            </button>
          ))}
        </div>
      )}

      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((rel, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-sm transition-shadow hover:shadow-md ${
                relationshipColors[rel.relationshipType] || 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{rel.entity}</span>
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  relationshipColors[rel.relationshipType] || 'bg-gray-200 text-gray-600'
                }`}>
                  {rel.relationshipType}
                </span>
              </div>
              <p className="text-xs opacity-80">{rel.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
