
import { fmtTime } from './formatters';

export interface SectionEngagementBarProps {
  sectionId: string;
  engagement: { avgTime: number; totalEntries: number; dropoffRate: number };
}

export function SectionEngagementBar({ sectionId, engagement }: SectionEngagementBarProps) {
  const barWidth = Math.max(4, (1 - engagement.dropoffRate) * 100);
  const isLow = engagement.dropoffRate > 0.12;
  const isGood = engagement.dropoffRate < 0.05 && engagement.avgTime > 30000;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-3)',
      padding: 'var(--spacing-2) 0',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      {/* Section label */}
      <div style={{
        width: '140px',
        flexShrink: 0,
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-primary)',
        fontWeight: isLow ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
      }}>
        {sectionId.replace(/-/g, ' ')}
        {isLow && <span style={{ color: 'var(--color-error)', marginLeft: 'var(--spacing-1)' }}>⚠</span>}
        {isGood && <span style={{ color: 'var(--color-success)', marginLeft: 'var(--spacing-1)' }}>✓</span>}
      </div>

      {/* Engagement bar */}
      <div style={{
        flex: 1,
        height: '20px',
        backgroundColor: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${String(barWidth)}%`,
          height: '100%',
          backgroundColor: isLow ? 'var(--color-error)' : isGood ? 'var(--color-success)' : 'var(--color-brand-400)',
          borderRadius: 'var(--radius-sm)',
          opacity: 0.7,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Stats */}
      <div style={{ width: '100px', textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        <div>{fmtTime(engagement.avgTime)} avg</div>
        <div>{engagement.totalEntries} entries</div>
      </div>
    </div>
  );
}
