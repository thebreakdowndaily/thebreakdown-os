
import { sectionStyle, valueStyle, labelStyle } from './styles';

export interface MetricCardProps {
  value: string;
  label: string;
  trend?: { dir: 'up' | 'down' | 'neutral'; pct: string };
}

export function MetricCard({ value, label, trend }: MetricCardProps) {
  return (
    <div style={sectionStyle}>
      <div style={valueStyle}>{value}</div>
      <div style={{ ...labelStyle, marginTop: 'var(--spacing-1)' }}>{label}</div>
      {trend && (
        <div style={{
          fontSize: 'var(--text-xs)',
          marginTop: 'var(--spacing-1)',
          color: trend.dir === 'up' ? 'var(--color-success)' : trend.dir === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)',
        }}>
          {trend.dir === 'up' ? '▲' : trend.dir === 'down' ? '▼' : '◆'} {trend.pct}
        </div>
      )}
    </div>
  );
}
