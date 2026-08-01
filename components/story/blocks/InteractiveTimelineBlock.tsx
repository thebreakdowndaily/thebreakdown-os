'use client';

import TimelineRenderer from '@/components/timeline/TimelineRenderer';
import type { TimelineData } from './types';

export default function InteractiveTimelineBlock({ events }: TimelineData) {
  if (events.length === 0) return null;

  const spec = {
    cardId: 'interactive-timeline',
    type: 'timeline' as const,
    purpose: 'Interactive Chronology',
    events: events.map((e) => ({
      date: e.date,
      title: e.title,
      description: e.description || '',
    })),
    orientation: 'vertical' as const,
    interactive: true,
  };

  return <TimelineRenderer timeline={spec} />;
}
