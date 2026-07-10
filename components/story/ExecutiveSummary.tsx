import React from 'react';

interface ExecutiveSummaryProps {
  summary: string;
  keyPoints: string[];
  takeaway?: string;
  whoIsAffected?: string;
  impactLevel?: string;
}

const impactStyles: Record<string, string> = {
  low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  summary,
  keyPoints,
  takeaway,
  whoIsAffected,
  impactLevel,
}) => (
  <section id="executive-brief" aria-label="Executive summary" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-[#151515] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
          Executive Brief
        </h2>
        {impactLevel && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-widest ${impactStyles[impactLevel] || impactStyles.low}`}>
            {impactLevel} Impact
          </span>
        )}
      </div>

      {takeaway && (
        <p className="text-base sm:text-lg font-bold text-text-primary leading-relaxed mb-5 border-l-2 border-brand-400 pl-4 py-1">
          {takeaway}
        </p>
      )}

      <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-5">
        {summary}
      </p>

      {keyPoints.length > 0 && (
        <ul className="space-y-3">
          {keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-text-secondary">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {whoIsAffected && (
        <p className="mt-5 pt-4 border-t border-[#2A2A2A] text-sm text-text-muted">
          <span className="font-semibold text-text-primary uppercase tracking-widest text-xs">Who is affected: </span>
          {whoIsAffected}
        </p>
      )}
    </div>
  </section>
);

export default ExecutiveSummary;