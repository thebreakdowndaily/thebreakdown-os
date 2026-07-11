'use client';

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
  1: 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10',
  2: 'text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10',
  3: 'text-[#D4A843] border-[#D4A843]/30 bg-[#D4A843]/10',
  4: 'text-[#F97316] border-[#F97316]/30 bg-[#F97316]/10',
  5: 'text-[#A1A1AA] border-[#A1A1AA]/30 bg-[#A1A1AA]/10',
};

const tierLabels: Record<number, string> = {
  1: 'Tier 1: Government / Primary',
  2: 'Tier 2: Academic / Research',
  3: 'Tier 3: Established Media',
  4: 'Tier 4: Secondary / Analysis',
  5: 'Tier 5: Unverified / Social',
};

export default function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null;

  const grouped: Record<number, { src: SourceItem; index: number }[]> = {};
  sources.forEach((src, index) => {
    const key = src.tier || 5;
    (grouped[key] ??= []).push({ src, index: index + 1 });
  });

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sources, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "bibliography.json");
    dlAnchorElem.click();
  };

  const tiers = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <section id="sources" aria-label="Sources" className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">Sources</h2>
        <button 
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#F5F5F5] bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download bibliography
        </button>
      </div>

      {tiers.map((tier) => (
        <div key={tier} className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-4">
            {tierLabels[tier] || `Tier ${String(tier)}`}
          </h3>
          <div className="space-y-2">
            {grouped[tier].map(({ src, index }) => {
              const tierClass = tierColors[src.tier] || tierColors[5];
              return (
                <a
                  key={index}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#151515] border border-[#2A2A2A] hover:border-[#D4A843]/30 transition-colors duration-200 group"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-[#A1A1AA] text-xs font-mono mt-0.5 sm:mt-0 w-6">[{index}]</span>
                    <span className="text-sm font-medium text-[#A1A1AA] group-hover:text-[#F5F5F5] transition-colors line-clamp-2 sm:line-clamp-1">
                      {src.name}
                    </span>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierClass}`}>
                    T{String(src.tier)}
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
