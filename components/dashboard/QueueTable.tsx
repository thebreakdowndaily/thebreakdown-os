'use client';

import type { QueueItem } from '@/utils/dashboard-data';

interface QueueTableProps {
  items: QueueItem[];
  type: QueueItem['type'];
  title: string;
}

const priorityColors: Record<string, string> = {
  critical: 'var(--color-rose-500)',
  high: 'var(--color-orange-500)',
  medium: 'var(--color-blue-500)',
  low: 'var(--color-text-tertiary)',
};

const statusColors: Record<string, string> = {
  pending: 'var(--color-text-tertiary)',
  'in-progress': 'var(--color-amber-500)',
  overdue: 'var(--color-rose-500)',
};

const typeLabels: Record<string, string> = {
  research: 'RQ',
  'editorial-review': 'ER',
  publishing: 'PQ',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function QueueTable({ items, type, title }: QueueTableProps) {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          {title}
        </h3>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-secondary)',
            padding: '2px 10px',
            borderRadius: '999px',
          }}
        >
          {items.length}
        </span>
      </div>

      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
              fontSize: '14px',
            }}
          >
            No items in queue
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Type badge */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: `color-mix(in srgb, ${priorityColors[item.priority]} 15%, transparent)`,
                  color: priorityColors[item.priority],
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {typeLabels[type]}-{item.storyId.split('-')[1]}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.3,
                  }}
                >
                  {item.headline}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-tertiary)',
                    marginTop: '4px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  {item.assignedTo && <span>👤 {item.assignedTo}</span>}
                  <span>🕐 {timeAgo(item.submittedAt)}</span>
                  {item.deadline && (
                    <span
                      style={{
                        color:
                          new Date(item.deadline) < new Date()
                            ? 'var(--color-rose-500)'
                            : 'var(--color-text-tertiary)',
                      }}
                    >
                      ⏰ {timeAgo(item.deadline)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status dot */}
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: statusColors[item.status],
                  flexShrink: 0,
                  marginTop: '6px',
                }}
                title={item.status}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
