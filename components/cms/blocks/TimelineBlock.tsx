'use client';

import type { Block } from '@/utils/cms-data';

interface TimelineBlockProps {
  block: Block;
  onUpdate: (data: Record<string, any>) => void;
}

export default function TimelineBlock({ block, onUpdate }: TimelineBlockProps) {
  const events: Array<{ date: string; title: string; description: string }> = block.data.events || [];

  const updateEvent = (idx: number, field: string, value: string) => {
    const next = [...events];
    next[idx] = { ...next[idx], [field]: value };
    onUpdate({ ...block.data, events: next });
  };

  const addEvent = () => {
    onUpdate({
      ...block.data,
      events: [...events, { date: '', title: '', description: '' }],
    });
  };

  const removeEvent = (idx: number) => {
    onUpdate({
      ...block.data,
      events: events.filter((_, i) => i !== idx),
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.map((ev, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              background: 'var(--color-surface-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--color-border-subtle)',
              position: 'relative',
            }}
          >
            {/* Timeline line indicator */}
            <div
              style={{
                width: '2px',
                background: 'var(--color-amber-500)',
                borderRadius: '1px',
                flexShrink: 0,
                alignSelf: 'stretch',
                opacity: 0.5,
              }}
            />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                <input
                  value={ev.date}
                  onChange={(e) => updateEvent(i, 'date', e.target.value)}
                  placeholder="Date (e.g. Jul 2026)"
                  style={{
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-amber-500)',
                    background: 'var(--color-surface-primary)',
                    outline: 'none',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
                <input
                  value={ev.title}
                  onChange={(e) => updateEvent(i, 'title', e.target.value)}
                  placeholder="Event title"
                  style={{
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    background: 'var(--color-surface-primary)',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <textarea
                value={ev.description}
                onChange={(e) => updateEvent(i, 'description', e.target.value)}
                placeholder="Event description..."
                rows={2}
                style={{
                  width: '100%',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-surface-primary)',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {events.length > 1 && (
              <button
                onClick={() => removeEvent(i)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px',
                  lineHeight: 1,
                  opacity: 0.4,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose-500)'; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.opacity = '0.4'; }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addEvent}
        style={{
          marginTop: '10px',
          width: '100%',
          padding: '8px',
          border: '1px dashed var(--color-border-subtle)',
          borderRadius: '8px',
          background: 'none',
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
          fontSize: '12px',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-amber-500)'; e.currentTarget.style.color = 'var(--color-amber-500)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
      >
        + Add Event
      </button>
    </div>
  );
}
