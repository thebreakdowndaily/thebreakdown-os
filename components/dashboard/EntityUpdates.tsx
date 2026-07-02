'use client';

import type { EntityUpdate } from '@/utils/dashboard-data';

interface EntityUpdatesProps {
  updates: EntityUpdate[];
}

const typeIcons: Record<string, string> = {
  person: '👤',
  organization: '🏢',
  policy: '📋',
  law: '⚖️',
  location: '📍',
  event: '📅',
  report: '📄',
};

const changeIcons: Record<string, string> = {
  new: '✨',
  status_change: '🔄',
  value_change: '📊',
  personnel_change: '🪑',
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function EntityUpdates({ updates }: EntityUpdatesProps) {
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
          Entity Updates
        </h3>
      </div>

      <div>
        {updates.map((update) => (
          <div
            key={update.id}
            style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>
              {changeIcons[update.changeType]}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {update.entityName}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    color: 'var(--color-text-tertiary)',
                    background: 'var(--color-surface-secondary)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {typeIcons[update.entityType]} {update.entityType}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0', lineHeight: 1.4 }}>
                {update.summary}
              </p>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  display: 'flex',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{update.source.replace('-', ' ')}</span>
                <span>·</span>
                <span>{timeAgo(update.detectedAt)}</span>
                {update.storyId && (
                  <>
                    <span>·</span>
                    <span style={{ color: 'var(--color-amber-500)' }}>→ linked to story</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
