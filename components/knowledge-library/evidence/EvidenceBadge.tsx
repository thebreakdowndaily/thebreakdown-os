import type { FC } from 'react';

interface EvidenceBadgeProps {
  confidence: 'established' | 'debated' | 'contested';
  evidenceCount: number;
}

export const EvidenceBadge: FC<EvidenceBadgeProps> = ({ confidence, evidenceCount }) => {
  const badgeStyle = confidence === 'established' ? 'bg-green-100 text-green-700' : confidence === 'debated' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  const label = confidence === 'established' ? 'Established' : confidence === 'debated' ? 'Debated' : 'Contested';
  return (
    <div className="flex items-center gap-2 mt-2 text-xs">
      <span className={`px-2 py-0.5 rounded-full font-medium ${badgeStyle}`}>
        {label}
      </span>
      <span className="text-gray-400">{evidenceCount} evidence source{evidenceCount !== 1 ? 's' : ''}</span>
    </div>
  );
};
