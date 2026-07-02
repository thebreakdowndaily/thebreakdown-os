import React from 'react';

interface SourceBadgeProps {
  tier: 1 | 2 | 3 | 4 | 5;
  size?: 'sm' | 'md';
}

const tierConfig: Record<number, { label: string; color: string; description: string }> = {
  1: { label: 'T1', color: 'bg-green-500/20 text-green-400 border-green-500/30', description: 'Official source' },
  2: { label: 'T2', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', description: 'Research source' },
  3: { label: 'T3', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', description: 'News source' },
  4: { label: 'T4', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', description: 'Social media source' },
  5: { label: 'T5', color: 'bg-red-500/20 text-red-400 border-red-500/30', description: 'Unverified source' },
};

const sizeConfig = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
};

const SourceBadge: React.FC<SourceBadgeProps> = ({ tier, size = 'md' }) => {
  const config = tierConfig[tier];

  return (
    <span
      className={`inline-flex items-center rounded border font-medium ${config.color} ${sizeConfig[size]} cursor-default`}
      title={config.description}
      aria-label={`Tier ${String(tier)}: ${config.description}`}
    >
      {config.label}
    </span>
  );
};

export default SourceBadge;
