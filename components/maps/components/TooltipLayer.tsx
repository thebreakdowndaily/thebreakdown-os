interface TooltipLayerProps {
  x: number;
  y: number;
  visible: boolean;
  content: string;
}

export default function TooltipLayer({ x, y, visible, content }: TooltipLayerProps) {
  if (!visible) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: `${String(x)}px`,
        top: `${String(y)}px`,
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-2) var(--spacing-3)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-primary)',
        pointerEvents: 'none',
        zIndex: 100,
        whiteSpace: 'nowrap',
        boxShadow: 'var(--shadow-md)',
      }}
      aria-hidden="true"
    >
      {content}
    </div>
  );
}
