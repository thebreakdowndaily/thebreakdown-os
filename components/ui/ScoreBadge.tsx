import React from 'react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const scoreColor = (score: number): { bg: string; text: string; ring: string } => {
  if (score >= 90) return { bg: 'var(--color-emerald-500)', text: '#ffffff', ring: 'var(--color-emerald-400)' };
  if (score >= 75) return { bg: 'var(--color-brand-500)', text: '#ffffff', ring: 'var(--color-brand-400)' };
  if (score >= 50) return { bg: 'var(--color-orange-500)', text: '#ffffff', ring: 'var(--color-orange-400)' };
  return { bg: 'var(--color-red-500)', text: '#ffffff', ring: 'var(--color-red-400)' };
};

const sizeConfig = {
  sm: { padding: '2px 6px', fontSize: 'var(--text-xs)', circleSize: '1.25rem', circleFont: '9px' },
  md: { padding: '4px 10px', fontSize: 'var(--text-xs)', circleSize: '1.75rem', circleFont: 'var(--text-xs)' },
  lg: { padding: '6px 14px', fontSize: 'var(--text-sm)', circleSize: '2.25rem', circleFont: 'var(--text-sm)' },
};

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md', showLabel = false }) => {
  const color = scoreColor(score);
  const cfg = sizeConfig[size];
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-1)',
        borderRadius: 'var(--radius-full)',
        fontWeight: 'var(--font-weight-semibold)',
        backgroundColor: color.bg,
        color: color.text,
        padding: cfg.padding,
        fontSize: cfg.fontSize,
        boxShadow: `0 0 0 1px ${color.ring}`,
      }}
      title={`Evidence score: ${clampedScore}%`}
      aria-label={`Evidence score: ${clampedScore}%`}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-full)',
          backgroundColor: color.bg,
          width: cfg.circleSize,
          height: cfg.circleSize,
          fontSize: cfg.circleFont,
          fontWeight: 'var(--font-weight-bold)',
          color: color.text,
        }}
      >
        {clampedScore}
      </span>
      {showLabel && <span>Evidence</span>}
    </span>
  );
};

export default ScoreBadge;
