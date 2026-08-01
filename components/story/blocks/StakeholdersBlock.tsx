import type { StakeholdersData } from './types';

export default function StakeholdersBlock({ headline, stakeholders, summary }: StakeholdersData) {
  return (
    <section id="stakeholders" aria-label="Stakeholders" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-2">{headline}</h2>
      {summary && (
        <p className="text-sm text-[#A1A1AA] mb-6">{summary}</p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stakeholders.map((s, i) => (
          <div
            key={i}
            className="rounded-xl bg-[#151515] border border-[#2A2A2A] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-[#F5F5F5]">{s.name}</h3>
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-[#2A2A2A] text-[#A1A1AA]">
                {s.type}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#D4A843] mb-1">Position</div>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{s.position}</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#D4A843] mb-1">Interest</div>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{s.interest}</p>
              </div>
              <div className="pt-2 border-t border-[#2A2A2A]">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  s.stance === 'support' ? 'text-[#22C55E]' :
                  s.stance === 'oppose' ? 'text-[#EF4444]' :
                  s.stance === 'conditional' ? 'text-[#F59E0B]' :
                  'text-[#A1A1AA]'
                }`}>
                  {s.stance}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}