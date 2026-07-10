import type { EvidenceInlineData } from './types';

export default function EvidenceInlineBlock({ claim, source, verification, confidence, explanation }: EvidenceInlineData) {
  const colors = {
    'true': 'text-green-500 bg-green-500/10 border-green-500/20',
    'false': 'text-red-500 bg-red-500/10 border-red-500/20',
    'misleading': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    'unverifiable': 'text-gray-400 bg-gray-500/10 border-gray-500/20'
  };

  const labels = {
    'true': 'Verified',
    'false': 'False',
    'misleading': 'Misleading',
    'unverifiable': 'Unverifiable'
  };

  return (
    <div className={`my-6 p-4 rounded-xl border ${colors[verification]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wide">{labels[verification]} • {confidence}% Confidence</span>
        <span className="text-[11px] font-medium opacity-80">{source}</span>
      </div>
      <p className="text-sm font-medium text-white mb-2">&ldquo;{claim}&rdquo;</p>
      <p className="text-sm opacity-90">{explanation}</p>
    </div>
  );
}
