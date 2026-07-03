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
    <div className="space-y-3 pt-3 border-t border-gray-800">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-blue-400 mb-1">Global Example</h3>
        <div className="flex items-start gap-2">
          <span className="text-xs font-bold text-gray-200 mt-0.5 shrink-0">{globalExample.country}</span>
          <p className="text-sm text-gray-400 leading-relaxed">{globalExample.outcome}</p>
        </div>
      </div>
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-green-400 mb-1">Recommendation</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{recommendation.title} — {recommendation.description}</p>
      </div>
    </div>
  );
}
