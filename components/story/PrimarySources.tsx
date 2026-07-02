import React from 'react';

interface PrimarySourcesProps {
  sources: Array<{ name: string; url: string; type: string; description: string }>;
}

const PrimarySources: React.FC<PrimarySourcesProps> = ({ sources }) => (
  <section aria-label="Primary sources" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Primary Sources</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sources.map((src, i) => (
        <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-gray-100">{src.name}</h3>
            <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full bg-gray-700 text-xs font-medium text-gray-300 capitalize">
              {src.type}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-4 flex-1">{src.description}</p>
          <a
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Open Source &rarr;
          </a>
        </div>
      ))}
    </div>
  </section>
);

export default PrimarySources;
