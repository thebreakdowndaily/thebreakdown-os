'use client';

import type { MonitoringAlert } from '@/utils/dashboard-data';

interface MonitoringFeedProps {
  alerts: MonitoringAlert[];
}

const severityConfig = {
  critical: { label: 'CRITICAL', color: 'var(--color-rose-500)', bg: 'color-mix(in srgb, var(--color-rose-500) 12%, transparent)' },
  major: { label: 'MAJOR', color: 'var(--color-orange-500)', bg: 'color-mix(in srgb, var(--color-orange-500) 12%, transparent)' },
  minor: { label: 'MINOR', color: 'var(--color-blue-500)', bg: 'color-mix(in srgb, var(--color-blue-500) 10%, transparent)' },
  informational: { label: 'INFO', color: 'var(--color-text-tertiary)', bg: 'transparent' },
};

const sourceIcons: Record<string, string> = {
  'supreme-court': '⚖️',
  pib: '📢',
  parliament: '🏛️',
  rbi: '🏦',
  who: '🦠',
  'election-commission': '🗳️',
  oecd: '📊',
  imf: '🌍',
  'world-bank': '💰',
  un: '🇺🇳',
  cag: '📋',
  'press-releases': '📄',
  'state-govts': '🏗️',
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${String(diff)}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${String(h)}h ago`;
  const d = Math.floor(h / 24);
  return `${String(d)}d ago`;
}

export default function MonitoringFeed({ alerts }: MonitoringFeedProps) {
  const unacknowledged = alerts.filter((a) => !a.acknowledged);

  return (
    <div
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Monitoring Alerts
          </h3>
          {unacknowledged.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-rose-500)',
                background: 'color-mix(in srgb, var(--color-rose-500) 15%, transparent)',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              {unacknowledged.length} new
            </span>
          )}
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
          {alerts.filter((a) => a.acknowledged).length}/{alerts.length} acknowledged
        </span>
      </div>

      {/* Feed */}
      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {alerts.map((alert) => {
          const sv = severityConfig[alert.severity];
          return (
            <div
              key={alert.id}
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--color-border-subtle)',
                background: alert.acknowledged ? 'transparent' : sv.bg,
                opacity: alert.acknowledged ? 0.6 : 1,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!alert.acknowledged) e.currentTarget.style.background = `color-mix(in srgb, ${sv.color} 18%, transparent)`;
              }}
              onMouseLeave={(e) => {
                if (!alert.acknowledged) e.currentTarget.style.background = sv.bg;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                {/* Source icon */}
                <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>
                  {sourceIcons[alert.source] || '🔔'}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: sv.color,
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {sv.label}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {alert.title}
                    </span>
                  </div>

                  {/* Summary */}
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      margin: '4px 0',
                      lineHeight: 1.4,
                    }}
                  >
                    {alert.summary}
                  </p>

                  {/* Meta */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-tertiary)',
                      display: 'flex',
                      gap: '12px',
                      marginTop: '6px',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ textTransform: 'capitalize' }}>{alert.source.replace('-', ' ')}</span>
                    <span>•</span>
                    <span>{timeAgo(alert.detectedAt)}</span>
                    {alert.affectedStories > 0 && (
                      <>
                        <span>•</span>
                        <span style={{ color: sv.color }}>
                          {alert.affectedStories} {alert.affectedStories === 1 ? 'story' : 'stories'} affected
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action badge */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--color-surface-secondary)',
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {alert.action === 'update_and_republish'
                    ? '↻ REPUB'
                    : alert.action === 'update_only'
                    ? '✎ EDIT'
                    : alert.action === 'log_only'
                    ? '📝 LOG'
                    : '✕'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
