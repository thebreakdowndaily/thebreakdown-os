import React from 'react';
import type { Source } from '@/types/canonical';

interface EntitySourcesProps {
  sources: Source[];
}

const typeColors: Record<string, string> = {
  government: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  research: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  news: 'bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/30',
  primary: 'bg-green-500/10 text-green-400 border-green-500/30',
  expert: 'bg-red-500/10 text-red-400 border-red-500/30',
  default: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

export default function EntitySources({ sources }: EntitySourcesProps) {
  if (sources.length === 0) return null;
  return (
    <section aria-label="Sources" className="py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Sources</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sources.map((source, i) => {
          const tc = typeColors[source.tier] || typeColors.default;
          return (
            <article key={i} className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#D4A843]/50 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-semibold text-[#F5F5F5]">{source.title}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${tc}`}>
                  {source.tier}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">{source.accessedAt}</p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#D4A843] hover:text-[#D4A843]/80 transition-colors font-medium"
              >
                Open Source &rarr;
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
