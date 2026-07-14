import type { FC } from 'react';

interface EvidenceBadgeProps {
  confidence: 'established' | 'debated' | 'contested';
  evidenceCount: number;
}

export const EvidenceBadge: FC<EvidenceBadgeProps> = ({ confidence, evidenceCount }) => {
  const color = confidence === 'established' ? 'green' : confidence === 'debated' ? 'amber' : 'red';
  const label = confidence === 'established' ? 'Established' : confidence === 'debated' ? 'Debated' : 'Contested';
  return (
    <div className="flex items-center gap-2 mt-2 text-xs">
      <span className={`px-2 py-0.5 rounded-full bg-${color}-100 text-${color}-700 font-medium`}>
        {label}
      </span>
      <span className="text-gray-400">{evidenceCount} evidence source{evidenceCount !== 1 ? 's' : ''}</span>
    </div>
  );
};
