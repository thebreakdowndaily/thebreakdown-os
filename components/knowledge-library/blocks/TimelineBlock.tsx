'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { TimelineBlockData, KLEvent } from '@/types/canonical';
import { useState } from 'react';

const categoryColors: Record<string, string> = {
  'diplomatic': 'bg-blue-100 text-blue-700',
  'military': 'bg-red-100 text-red-700',
  'economic': 'bg-green-100 text-green-700',
  'political': 'bg-purple-100 text-purple-700',
  'social': 'bg-amber-100 text-amber-700',
  'treaty': 'bg-indigo-100 text-indigo-700',
  'conflict': 'bg-orange-100 text-orange-700',
};

function getDecade(year: string): string {
  const y = parseInt(year);
  if (isNaN(y)) return 'Unknown';
  return `${Math.floor(y / 10) * 10}s`;
}

function groupByDecade(events: KLEvent[]): [string, KLEvent[]][] {
  const groups = new Map<string, KLEvent[]>();
  for (const event of events) {
    const decade = getDecade(event.date);
    if (!groups.has(decade)) groups.set(decade, []);
    groups.get(decade)!.push(event);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export const TimelineBlock: FC<BlockComponentProps> = ({ data, depth }) => {
  const { title, description, events } = data as unknown as TimelineBlockData;
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const allCategories = Array.from(new Set(events.flatMap(e => e.categories)));
  const filteredEvents = activeCategories.size === 0
    ? events
    : events.filter(e => e.categories.some(c => activeCategories.has(c)));

  const decadeGroups = groupByDecade(filteredEvents);

  const toggleCategory = (cat: string) => {
    const next = new Set(activeCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setActiveCategories(next);
  };

  const significanceWidth = (sig: number) => `${Math.max(20, sig * 20)}%`;

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden my-6">
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Timeline</span>
        <h3 className="text-lg font-semibold text-gray-900 mt-1">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>

      {allCategories.length > 0 && (
        <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-gray-200">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                activeCategories.has(cat)
                  ? 'ring-2 ring-offset-1 ring-blue-400 ' + (categoryColors[cat] || 'bg-gray-200 text-gray-700')
                  : categoryColors[cat] || 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="px-5 py-4 space-y-8">
        {decadeGroups.map(([decade, decadeEvents]) => (
          <div key={decade}>
            <div className="sticky top-0 bg-white z-10 pb-2">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{decade}</span>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {decadeEvents.map((event, i) => (
                  <div key={event.id} className="relative pl-10">
                    <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                      event.significance >= 4 ? 'bg-red-500' :
                      event.significance >= 3 ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`} />
                    <button
                      onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">{event.date}</span>
                        <h4 className="text-sm font-semibold text-gray-800">{event.title}</h4>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-gray-100 flex-1 max-w-[200px]">
                          <div className={`h-full rounded-full ${
                            event.significance >= 4 ? 'bg-red-400' :
                            event.significance >= 3 ? 'bg-amber-400' :
                            'bg-blue-400'
                          }`} style={{ width: significanceWidth(event.significance) }} />
                        </div>
                        <span className="text-xs text-gray-400">
                          Significance: {event.significance}/5
                        </span>
                      </div>
                    </button>

                    {expandedEvent === event.id && depth !== 'explorer' && (
                      <div className="mt-2 ml-0 p-3 bg-gray-50 rounded-lg space-y-2">
                        <p className="text-sm text-gray-700">{event.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {event.categories.map(cat => (
                            <span key={cat} className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[cat] || 'bg-gray-200 text-gray-600'}`}>
                              {cat}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {event.sources.length > 0 && (
                            <span className="text-blue-600">
                              Sources: {event.sources.map(s => s.replace('s', '')).join(', ')}
                            </span>
                          )}
                          {event.entities.length > 0 && (
                            <span className="text-purple-600">Entities: {event.entities.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
