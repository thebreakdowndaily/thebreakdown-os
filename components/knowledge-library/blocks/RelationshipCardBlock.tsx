'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { RelationshipCardData } from '@/types/canonical';
import { useState, useCallback } from 'react';

const relationshipColors: Record<string, string> = {
  influenced: 'bg-blue-50 border-blue-200 text-blue-700',
  opposed: 'bg-red-50 border-red-200 text-red-700',
  succeeded: 'bg-green-50 border-green-200 text-green-700',
  preceded: 'bg-amber-50 border-amber-200 text-amber-700',
  allied: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  allied_with: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  conflicted: 'bg-orange-50 border-orange-200 text-orange-700',
  negotiated: 'bg-purple-50 border-purple-200 text-purple-700',
  negotiated_with: 'bg-purple-50 border-purple-200 text-purple-700',
  founded: 'bg-teal-50 border-teal-200 text-teal-700',
  mentored_by: 'bg-blue-50 border-blue-200 text-blue-700',
  collaborated_with: 'bg-green-50 border-green-200 text-green-700',
  disputed_territory: 'bg-orange-50 border-orange-200 text-orange-700',
  root_cause: 'bg-amber-50 border-amber-200 text-amber-700',
  mediator: 'bg-purple-50 border-purple-200 text-purple-700',
  deputized: 'bg-teal-50 border-teal-200 text-teal-700',
};

function formatType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const RelationshipCardBlock: FC<BlockComponentProps> = ({ data }) => {
  const { mainEntity, mainEntitySlug, relationships } = data as unknown as RelationshipCardData;
  const [filter, setFilter] = useState<string>('');

  const relationshipTypes = Array.from(new Set(relationships.map(r => r.relationshipType)));
  const filtered = filter
    ? relationships.filter(r => r.relationshipType === filter)
    : relationships;

  const handleKeyDown = useCallback((e: React.KeyboardEvent, type: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFilter(filter === type ? '' : type);
    }
  }, [filter]);

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden my-6" role="region" aria-label={`Relationship explorer for ${mainEntity}`} data-visual-block="relationship">
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Knowledge Graph</span>
          <span className="text-xs text-gray-400">— Related to</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          {mainEntitySlug ? (
            <a
              href={`/entity/${mainEntitySlug}`}
              className="hover:text-blue-700 transition-colors"
            >
              {mainEntity}
            </a>
          ) : (
            mainEntity
          )}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Key relationships and their nature — each connection represents a documented historical interaction
        </p>
      </div>

      {relationshipTypes.length > 1 && (
        <div className="px-5 py-2 flex flex-wrap gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('')}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              !filter ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-pressed={!filter}
            aria-label="Show all relationships"
          >
            All ({relationships.length})
          </button>
          {relationshipTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(filter === type ? '' : type)}
              onKeyDown={(e) => handleKeyDown(e, type)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                filter === type ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-pressed={filter === type}
              aria-label={`Filter by ${formatType(type)}`}
            >
              {formatType(type)} ({relationships.filter(r => r.relationshipType === type).length})
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
              role="article"
              aria-label={`${rel.entity} — ${formatType(rel.relationshipType)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <a
                  href={`/entity/${rel.entitySlug}`}
                  className="font-semibold hover:underline"
                >
                  {rel.entity}
                </a>
                <span className={`px-1.5 py-0.5 text-xs rounded-full whitespace-nowrap ${
                  relationshipColors[rel.relationshipType] || 'bg-gray-200 text-gray-600'
                }`}>
                  {formatType(rel.relationshipType)}
                </span>
              </div>
              <p className="text-xs opacity-80">{rel.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-200">
        <details className="group">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 select-none">
            Relationship types
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {relationshipTypes.map(type => (
              <span
                key={type}
                className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${
                  relationshipColors[type] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {formatType(type)}
              </span>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};
