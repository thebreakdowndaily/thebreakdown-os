import type { SourcesData } from './types';

const tierStyles: Record<number, string> = {
  1: 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10',
  2: 'text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10',
  3: 'text-[#D4A843] border-[#D4A843]/30 bg-[#D4A843]/10',
  4: 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10',
  5: 'text-[#A1A1AA] border-[#A1A1AA]/30 bg-[#A1A1AA]/10',
};

const typeLabels: Record<string, string> = {
  government: 'Government',
  research: 'Research',
  news: 'News',
  primary: 'Primary',
};

export default function SourcesBlock({ sources }: SourcesData) {
  if (sources.length === 0) return null;

  const grouped: Record<string, typeof sources> = {};
  for (const src of sources) {
    const key = src.type || 'other';
    (grouped[key] ??= []).push(src);
  }

  return (
    <section id="sources" aria-label="Sources" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Sources</h2>
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="mb-6 last:mb-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">
            {typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>
          <div className="space-y-2">
            {items.map((src, i) => {
              const tierClass = tierStyles[src.tier] || tierStyles[5];
              return (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#151515] border border-[#2A2A2A] hover:border-[#D4A843]/30 transition-colors duration-200 group"
                >
                  <span className="text-sm text-[#A1A1AA] group-hover:text-[#F5F5F5] transition-colors">
                    {src.name}
                  </span>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierClass}`}>
                    T{src.tier}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
