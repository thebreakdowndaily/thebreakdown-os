'use client';

import type { TrendingTopic } from '@/utils/dashboard-data';

interface TrendingPanelProps {
  topics: TrendingTopic[];
}

const directionIcons: Record<string, string> = {
  up: '▲',
  down: '▼',
  stable: '◆',
};

const directionColors: Record<string, string> = {
  up: 'var(--color-emerald-500)',
  down: 'var(--color-rose-500)',
  stable: 'var(--color-text-tertiary)',
};

export default function TrendingPanel({ topics }: TrendingPanelProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          Trending Topics
        </h3>
      </div>

      <div style={{ padding: '8px 0' }}>
        {topics.map((topic, i) => (
          <div
            key={topic.topic}
            style={{
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Rank */}
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-tertiary)',
                fontFamily: 'var(--font-mono)',
                width: '20px',
                textAlign: 'right',
                flexShrink: 0,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* Topic info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                }}
              >
                {topic.topic}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  marginTop: '2px',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{topic.category}</span>
                <span>·</span>
                <span>{topic.relatedStories} stories</span>
              </div>
            </div>

            {/* Volume bar */}
            <div style={{ width: '80px', flexShrink: 0 }}>
              <div
                style={{
                  height: '6px',
                  background: 'var(--color-surface-secondary)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${String(topic.volume)}%`,
                    background:
                      topic.direction === 'up'
                        ? 'var(--color-emerald-500)'
                        : topic.direction === 'down'
                        ? 'var(--color-rose-500)'
                        : 'var(--color-text-tertiary)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            {/* Change */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: directionColors[topic.direction],
                fontFamily: 'var(--font-mono)',
                width: '64px',
                justifyContent: 'flex-end',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '10px' }}>{directionIcons[topic.direction]}</span>
              <span>{topic.change > 0 ? '+' : ''}{topic.change}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
