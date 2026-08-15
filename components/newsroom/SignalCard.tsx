import { EditorialPriority, EditorialQueueItem } from '@/types/newsroom-intelligence';

interface SignalCardProps {
  item: EditorialQueueItem;
  onAction?: (action: string, signalId: string) => void | Promise<void>;
}

export function SignalCard({ item, onAction }: SignalCardProps) {
  const priorityBadgeStyle: Record<EditorialPriority, { bg: string; text: string; label: string }> = {
    P0: { bg: '#fee2e2', text: '#991b1b', label: 'P0 — CRITICAL' },
    P1: { bg: '#ffedd5', text: '#9a3412', label: 'P1 — IMPORTANT' },
    P2: { bg: '#fef9c3', text: '#854d0e', label: 'P2 — SIGNIFICANT' },
    P3: { bg: '#f1f5f9', text: '#475569', label: 'P3 — WATCH' },
  };

  const badge = priorityBadgeStyle[item.priority];

  return (
    <article
      aria-label={`Signal ${item.title}`}
      tabIndex={0}
      style={{
        padding: 'var(--spacing-4)',
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-subtle)',
        marginBottom: 'var(--spacing-3)',
        outline: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: badge.bg,
            color: badge.text,
            letterSpacing: '0.05em',
          }}
        >
          {badge.label}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Velocity: <strong>{item.velocityLevel.toUpperCase()}</strong> · Sources: <strong>{item.independentSourceCount}</strong> · Primary: <strong>{item.primarySourceCount}</strong>
        </span>
      </div>

      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
        {item.title}
      </h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>
        {item.summary}
      </p>

      <div style={{ padding: 'var(--spacing-2)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        <strong>Why it matters:</strong> {item.whyItMatters}
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => { if (onAction) void onAction('VERIFY', item.signalId); }}
          style={{
            padding: '4px 10px',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            background: 'var(--color-brand-600)',
            color: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Verify
        </button>
        <button
          type="button"
          onClick={() => { if (onAction) void onAction('ASSIGN', item.signalId); }}
          style={{
            padding: '4px 10px',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
            cursor: 'pointer',
          }}
        >
          Assign
        </button>
        <button
          type="button"
          onClick={() => { if (onAction) void onAction('FOLLOW', item.signalId); }}
          style={{
            padding: '4px 10px',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
            cursor: 'pointer',
          }}
        >
          Follow
        </button>
        <button
          type="button"
          onClick={() => { if (onAction) void onAction('RESOLVE', item.signalId); }}
          style={{
            padding: '4px 10px',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
            cursor: 'pointer',
          }}
        >
          Resolve
        </button>
      </div>
    </article>
  );
}
