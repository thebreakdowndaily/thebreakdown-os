import type { FutureOutlookData } from './types';

export default function FutureOutlookBlock({ headline, scenarios, uncertainty, confidence }: FutureOutlookData) {
  const confidenceColor = confidence === 'High' ? 'text-[#22C55E]' : confidence === 'Medium' ? 'text-[#F59E0B]' : 'text-[#EF4444]';

  return (
    <section id="future" aria-label="Future Outlook" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-2">{headline}</h2>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">Confidence</span>
        <span className={`text-sm font-bold ${confidenceColor}`}>{confidence}</span>
      </div>
      <div className="space-y-4">
        {scenarios.map((scenario, i) => (
          <div key={i} className="rounded-xl bg-[#151515] border border-[#2A2A2A] p-5">
            <h3 className="text-base font-semibold text-[#F5F5F5] mb-2">{scenario.label}</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">{scenario.description}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {scenario.probability && (
                <span className="bg-[#2A2A2A] text-[#D4A843] px-2 py-1 rounded">Probability: {scenario.probability}</span>
              )}
              {scenario.source && (
                <span className="bg-[#2A2A2A] text-[#A1A1AA] px-2 py-1 rounded">Source: {scenario.source}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {uncertainty && (
        <div className="mt-6 p-4 rounded-xl bg-[#151515] border border-[#2A2A2A]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4A843] mb-2">Uncertainty Disclosure</h4>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{uncertainty}</p>
        </div>
      )}
    </section>
  );
}