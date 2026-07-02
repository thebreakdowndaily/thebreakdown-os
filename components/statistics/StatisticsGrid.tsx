'use client';

import React from 'react';

interface StatItem {
  value: string;
  label: string;
  change?: string;
  subtitle?: string;
}

interface StatisticsGridProps {
  stats: StatItem[];
  columns?: number;
  title?: string;
  caption?: string;
}

/**
 * StatisticsGrid — Displays key statistics in a responsive grid.
 * Best for: highlight boxes with key numbers at the top of a story.
 */
const StatisticsGrid: React.FC<StatisticsGridProps> = ({ stats, columns = 3, title, caption }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <figure
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-6)',
      }}
      role="group"
      aria-label={title || 'Key statistics'}
    >
      {title && (
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
          {title}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(columns, stats.length)}, 1fr)`,
          gap: 'var(--spacing-3)',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              padding: 'var(--spacing-4)',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(var(--text-2xl), 3vw, var(--text-4xl))',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-brand-400)',
                lineHeight: 1.1,
                marginBottom: 'var(--spacing-1)',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {stat.label}
            </div>
            {stat.change && (
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: stat.change.startsWith('+') ? 'var(--color-success)' : stat.change.startsWith('-') ? 'var(--color-error)' : 'var(--color-text-muted)',
                  marginTop: 'var(--spacing-1)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                {stat.change}
              </div>
            )}
            {stat.subtitle && (
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  marginTop: 'var(--spacing-1)',
                  opacity: 0.7,
                }}
              >
                {stat.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>

      {caption && (
        <figcaption
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--spacing-3)',
            paddingTop: 'var(--spacing-3)',
            borderTop: '1px solid var(--color-border-default)',
            lineHeight: 1.5,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default StatisticsGrid;
