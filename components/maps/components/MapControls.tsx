import type { MapSpec } from '@/utils/types';

interface MapControlsProps {
  interaction?: MapSpec['interaction'];
}

export default function MapControls({ interaction }: MapControlsProps) {
  if (!interaction) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 'var(--spacing-2) var(--spacing-6)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
        backgroundColor: 'rgba(var(--color-bg-primary-rgb), 0.8)',
        backdropFilter: 'blur(4px)',
        borderTop: '1px solid var(--color-border-default)',
        display: 'flex',
        gap: 'var(--spacing-4)',
        zIndex: 10,
      }}
    >
      {interaction.hover && <span>Hover: {interaction.hover}</span>}
      {interaction.click && <span>Click: {interaction.click}</span>}
    </div>
  );
}
