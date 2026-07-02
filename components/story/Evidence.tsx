import React from 'react';

interface EvidenceProps {
  claims: Array<{
    claim: string;
    source: string;
    verification: 'true' | 'false' | 'misleading' | 'unverifiable';
    explanation: string;
    confidence: number;
  }>;
  sources: Array<{ name: string; url: string; type: string; tier: number }>;
  verificationScore: number;
}

const verificationConfig: Record<string, { label: string; bg: string; text: string }> = {
  true: { label: 'TRUE', bg: 'bg-green-500/20', text: 'text-green-400' },
  false: { label: 'FALSE', bg: 'bg-red-500/20', text: 'text-red-400' },
  misleading: { label: 'MISLEADING', bg: 'bg-amber-400/20', text: 'text-amber-400' },
  unverifiable: { label: 'UNVERIFIABLE', bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

const Evidence: React.FC<EvidenceProps> = ({ claims, sources, verificationScore }) => (
  <section aria-label="Evidence analysis" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Evidence Analysis</h2>

    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 mb-8 text-center">
      <p className="text-sm text-gray-400 mb-1">Verification Score</p>
      <p className="text-5xl sm:text-6xl font-bold text-amber-400">{verificationScore}%</p>
      <div className="mt-3 w-full max-w-xs mx-auto h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${String(verificationScore)}%` }}
          role="progressbar"
          aria-valuenow={verificationScore}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>

    <div className="space-y-4 mb-8">
      {claims.map((item, i) => {
        const vc = verificationConfig[item.verification];
        return (
          <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="font-medium text-gray-100">{item.claim}</p>
              <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${vc.bg} ${vc.text}`}>
                {vc.label}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-1">
              Source: <span className="text-gray-300">{item.source}</span>
            </p>
            <p className="text-sm text-gray-300">{item.explanation}</p>
            {item.confidence > 0 && (
              <p className="text-xs text-gray-500 mt-2">Confidence: {item.confidence}%</p>
            )}
          </div>
        );
      })}
    </div>

    <h3 className="text-lg font-semibold text-gray-100 mb-4">Sources</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sources.map((src, i) => (
        <a
          key={i}
          href={src.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 hover:border-amber-400/50 transition-colors group"
        >
          <span className="text-sm font-medium text-gray-100 group-hover:text-amber-400 transition-colors">
            {src.name}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">
            Tier {src.tier}
          </span>
        </a>
      ))}
    </div>
  </section>
);

export default Evidence;
