
import type { ImprovementReport } from '@/utils/analytics';

export interface RecommendationCardProps {
  rec: ImprovementReport['recommendations'][0];
}

export function RecommendationCard({ rec }: RecommendationCardProps) {
  const priorityColors: Record<string, { bg: string; text: string }> = {
    high: { bg: 'var(--color-error)', text: 'white' },
    medium: { bg: 'var(--color-warning)', text: 'var(--color-bg-primary)' },
    low: { bg: 'var(--color-bg-tertiary)', text: 'var(--color-text-secondary)' },
  };

  const pc = priorityColors[rec.priority];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--spacing-3)',
      padding: 'var(--spacing-3)',
      backgroundColor: 'var(--color-bg-tertiary)',
      borderRadius: 'var(--radius-md)',
      borderLeft: `3px solid ${pc.bg}`,
    }}>
      <div style={{
        padding: '2px 6px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: pc.bg,
        color: pc.text,
        fontSize: '10px',
        fontWeight: 'var(--font-weight-bold)',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        {rec.priority}
      </div>
      <div>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
          {rec.action.replace(/_/g, ' ')} — {rec.target}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
          {rec.reason}
        </div>
      </div>
    </div>
  );
}
