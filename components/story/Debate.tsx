import React from 'react';

interface DebateProps {
  sides?: Array<{
    position: string;
    arguments: Array<{ claim: string; source: string }>;
  }>;
}

const Debate: React.FC<DebateProps> = ({ sides }) => {
  if (!sides || sides.length === 0) return null;

  const gridCols = sides.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';

  return (
    <section aria-label="Debate" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">The Debate</h2>
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {sides.map((side, i) => (
          <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h3 className="font-semibold text-gray-100 text-lg mb-4 pb-3 border-b border-gray-700">
              {side.position}
            </h3>
            <ul className="space-y-4">
              {side.arguments.map((arg, j) => (
                <li key={j}>
                  <p className="text-sm text-gray-300 mb-1">&ldquo;{arg.claim}&rdquo;</p>
                  <a
                    href={arg.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Source &rarr;
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Debate;
