import React from 'react';

interface SourceItem {
  name: string;
  url: string;
  type: string;
  tier: number;
}

interface SourcesListProps {
  sources: SourceItem[];
}

const tierColors: Record<number, string> = {
  1: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  2: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  3: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  4: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  5: 'text-neutral-400 border-neutral-400/30 bg-neutral-400/10',
};

const typeLabels: Record<string, string> = {
  government: 'Government',
  research: 'Research',
  news: 'News',
  primary: 'Primary',
};

export default function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) return null;

  const grouped: Record<string, SourceItem[]> = {};
  for (const src of sources) {
    const key = src.type || 'other';
    (grouped[key] ??= []).push(src);
  }

  return (
    <section id="sources" aria-label="Sources" className="max-w-[720px] mx-auto px-4 sm:px-6 mb-16 pt-8">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-amber-400/80 mb-8">
        Primary Sources
      </h2>

      <div className="space-y-8">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4 pb-2 border-b border-neutral-800">
              {typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <div className="space-y-1">
              {items.map((src, i) => {
                const tierClass = tierColors[src.tier] || tierColors[5];
                return (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-900 transition-colors duration-150 group"
                  >
                    <span className="text-[15px] font-medium text-neutral-300 group-hover:text-amber-400 transition-colors">
                      {src.name}
                    </span>
                    <span className={`shrink-0 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${tierClass}`}>
                      Tier {src.tier}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
