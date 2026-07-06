interface GlobalExample {
  country: string;
  outcome: string;
}

interface FixAction {
  title: string;
  description: string;
}

interface SolutionBlockProps {
  globalExample: GlobalExample;
  recommendation: FixAction;
}

export default function SolutionBlock({ globalExample, recommendation }: SolutionBlockProps) {
  return (
    <div className="space-y-3 pt-3 border-t border-[#2A2A2A]">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#3B82F6] mb-1">Global Example</h3>
        <div className="flex items-start gap-2">
          <span className="text-xs font-bold text-[#A1A1AA] mt-0.5 shrink-0">{globalExample.country}</span>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{globalExample.outcome}</p>
        </div>
      </div>
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#22C55E] mb-1">Recommendation</h3>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">{recommendation.title} — {recommendation.description}</p>
      </div>
    </div>
  );
}
