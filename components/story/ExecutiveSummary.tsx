import React from 'react';

interface ExecutiveSummaryProps {
  summary: string;
  keyPoints: string[];
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary, keyPoints }) => {
  if (!summary && (!keyPoints || keyPoints.length === 0)) return null;

  return (
    <section aria-label="Executive summary" className="max-w-[720px] mx-auto px-4 sm:px-6 mb-16 pt-8">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-amber-400/80 mb-4">
          30-Second Summary
        </h2>
        {summary && (
          <p className="text-lg text-neutral-300 leading-relaxed mb-6 font-medium">
            {summary}
          </p>
        )}
        {keyPoints && keyPoints.length > 0 && (
          <ul className="space-y-4 pt-4 border-t border-neutral-800">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-4 text-neutral-400">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400/50 flex-shrink-0" aria-hidden="true" />
                <span className="leading-relaxed text-[15px]">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ExecutiveSummary;
