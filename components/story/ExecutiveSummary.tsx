import React from 'react';

interface ExecutiveSummaryProps {
  summary: string;
  keyPoints: string[];
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary, keyPoints }) => (
  <section aria-label="Executive summary" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        <span className="text-amber-400 text-2xl" aria-hidden="true">&#9654;</span>
        Key Takeaways
      </h2>
      <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6">{summary}</p>
      {keyPoints.length > 0 && (
        <ul className="space-y-3">
          {keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
);

export default ExecutiveSummary;
