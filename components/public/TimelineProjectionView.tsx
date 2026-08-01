/**
 * ─── Public Presentation Component: TimelineProjectionView ───────────────────
 * Consumes strictly TimelineNodeViewModel[].
 * Displays projected chronological events.
 */

import React from 'react';
import type { TimelineNodeViewModel } from '@/lib/projections/story/StoryViewModel';

export interface TimelineProjectionViewProps {
  timelineNodes: TimelineNodeViewModel[];
}

export function TimelineProjectionView({ timelineNodes }: TimelineProjectionViewProps) {
  if (!timelineNodes || timelineNodes.length === 0) {
    return null; // Graceful degradation
  }

  return (
    <div
      role="region"
      aria-label="Historical Timeline Context"
      style={{
        margin: '2.5rem 0',
        padding: '1.5rem',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
      }}
    >
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#171717', marginBottom: '1.25rem' }}>
        Interactive Historical Timeline (1947–1962)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid #0284c7', paddingLeft: '1.25rem' }}>
        {timelineNodes.map((node, idx) => (
          <div key={node.id || idx} style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '-1.625rem',
                top: '0.25rem',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                border: '2px solid #ffffff',
              }}
            />
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0369a1' }}>
              {node.date}
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#171717', margin: '0.125rem 0' }}>
              {node.title}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#525252', lineHeight: '1.5' }}>
              {node.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
