'use client';

import React from 'react';

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

interface TimelineSpec {
  cardId: string;
  type: 'timeline';
  purpose: string;
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal';
  interactive?: boolean;
  caption?: string;
  altText?: string;
}

interface TimelineRendererProps {
  timeline: TimelineSpec;
}

/**
 * TimelineRenderer — Vertical or horizontal timeline component.
 * Best for 4–8 chronological events.
 */
const TimelineRenderer: React.FC<TimelineRendererProps> = ({ timeline }) => {
  const events = timeline.events;
  const isHorizontal = timeline.orientation === 'horizontal';

  if (isHorizontal) {
    return (
      <figure
        style={{
          width: '100%',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-6)',
          overflow: 'hidden',
        }}
        role="img"
        aria-label={timeline.altText || timeline.purpose}
      >
        {timeline.purpose && (
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-6)' }}>
            {timeline.purpose}
          </p>
        )}

        {/* Horizontal timeline */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: 'var(--spacing-8) 0 var(--spacing-4)',
          }}
        >
          {/* Line */}
          <div
            style={{
              position: 'absolute',
              top: 'var(--spacing-8)',
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: 'var(--color-border-default)',
            }}
            aria-hidden="true"
          />

          {events.map((event, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                textAlign: 'center',
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: i === events.length - 1 ? 'var(--color-brand-400)' : 'var(--color-border-default)',
                  border: '2px solid var(--color-bg-secondary)',
                  zIndex: 1,
                  marginBottom: 'var(--spacing-3)',
                }}
                aria-hidden="true"
              />
              {/* Label */}
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-1)',
                }}
              >
                {event.title}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-brand-400)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {event.date}
              </div>
            </div>
          ))}
        </div>

        {timeline.caption && (
          <figcaption style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border-default)' }}>
            {timeline.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  // Vertical timeline (default)
  return (
    <figure
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-6)',
        overflow: 'hidden',
      }}
      role="img"
      aria-label={timeline.altText || timeline.purpose}
    >
      {timeline.purpose && (
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-6)' }}>
          {timeline.purpose}
        </p>
      )}

      <div style={{ position: 'relative', paddingLeft: 'var(--spacing-8)' }}>
        {/* Vertical line */}
        <div
          style={{
            position: 'absolute',
            left: 'var(--spacing-3)',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: 'var(--color-border-default)',
          }}
          aria-hidden="true"
        />

        {events.map((event, i) => (
          <div
            key={i}
            style={{
              position: 'relative',
              paddingBottom: i < events.length - 1 ? 'var(--spacing-6)' : 0,
            }}
          >
            {/* Dot */}
            <div
              style={{
                position: 'absolute',
                left: 'calc(-1 * var(--spacing-8) + var(--spacing-3) - 5px)',
                top: '4px',
                width: '12px',
                height: '12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: i === events.length - 1 ? 'var(--color-brand-400)' : 'var(--color-border-default)',
                border: '2px solid var(--color-bg-secondary)',
                zIndex: 1,
              }}
              aria-hidden="true"
            />
            {/* Content */}
            <div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-brand-400)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-1)',
                }}
              >
                {event.date}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-1)',
                }}
              >
                {event.title}
              </div>
              {event.description && (
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.5,
                  }}
                >
                  {event.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {timeline.caption && (
        <figcaption style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border-default)' }}>
          {timeline.caption}
        </figcaption>
      )}
    </figure>
  );
};

export default TimelineRenderer;
