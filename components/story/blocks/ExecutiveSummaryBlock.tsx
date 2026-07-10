import type { ExecutiveSummaryData } from './types';

export default function ExecutiveSummaryBlock({ summary, keyPoints }: ExecutiveSummaryData) {
  return (
    <section id="executive-summary" aria-label="Executive summary" className="py-8 sm:py-10">
      <div className="rounded-lg bg-surface-secondary border border-border p-6 sm:p-8">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="text-brand-400" aria-hidden="true">&#9654;</span>
          Key Takeaways
        </h2>
        <p className="text-text-primary text-[1.125rem] font-serif leading-relaxed sm:leading-loose mb-6">{summary}</p>
        {keyPoints.length > 0 && (
          <ul className="space-y-4">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-4 text-text-secondary text-base">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" aria-hidden="true" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
