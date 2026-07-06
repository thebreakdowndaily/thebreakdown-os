import type { ExecutiveSummaryData } from './types';

export default function ExecutiveSummaryBlock({ summary, keyPoints }: ExecutiveSummaryData) {
  return (
    <section id="executive-summary" aria-label="Executive summary" className="py-8 sm:py-10">
      <div className="rounded-2xl bg-[#151515] border border-[#2A2A2A] p-6 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
          <span className="text-[#D4A843] text-xl" aria-hidden="true">&#9654;</span>
          Key Takeaways
        </h2>
        <p className="text-[#A1A1AA] text-base sm:text-lg leading-relaxed mb-6">{summary}</p>
        {keyPoints.length > 0 && (
          <ul className="space-y-3">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-[#A1A1AA]">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#D4A843] shrink-0" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
