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
  true: { label: 'TRUE', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  false: { label: 'FALSE', bg: 'bg-rose-500/20', text: 'text-rose-400' },
  misleading: { label: 'MISLEADING', bg: 'bg-amber-400/20', text: 'text-amber-400' },
  unverifiable: { label: 'UNVERIFIABLE', bg: 'bg-neutral-500/20', text: 'text-neutral-400' },
};

const Evidence: React.FC<EvidenceProps> = ({ claims, sources, verificationScore }) => {
  if (!claims || claims.length === 0) return null;

  return (
    <section aria-label="Evidence analysis" className="max-w-[720px] mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-amber-400/80 mb-8">
        Evidence Analysis
      </h2>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 sm:p-8 mb-8 text-center flex flex-col items-center justify-center">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-3">Overall Score</p>
        <p className="text-6xl sm:text-7xl font-bold tracking-tight text-white mb-6" style={{ fontFamily: 'var(--font-editorial)' }}>
          {verificationScore}<span className="text-4xl text-neutral-500">%</span>
        </p>
        <div className="w-full max-w-[200px] h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-layout duration-700 ease-out"
            style={{ width: `${String(verificationScore)}%` }}
            role="progressbar"
            aria-valuenow={verificationScore}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="space-y-4">
        {claims.map((item, i) => {
          const vc = verificationConfig[item.verification];
          return (
            <div key={i} className="bg-transparent border-t border-neutral-800/60 pt-5 pb-2">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="font-medium text-neutral-200 leading-snug">{item.claim}</p>
                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${vc.bg} ${vc.text}`}>
                  {vc.label}
                </span>
              </div>
              <p className="text-[15px] text-neutral-400 leading-relaxed mb-3">
                {item.explanation}
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {item.source}
                </span>
                {item.confidence > 0 && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.confidence}% confidence
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Evidence;
