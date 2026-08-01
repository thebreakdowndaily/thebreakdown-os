'use client';

import TimelineRenderer from '@/components/timeline/TimelineRenderer';
import type { TimelineData } from './types';

export default function TimelineBlock({ events }: TimelineData) {
  if (events.length === 0) return null;

  const spec = {
    cardId: 'story-timeline',
    type: 'timeline' as const,
    purpose: 'Chronology',
    events: events.map((e) => ({
      date: e.date,
      title: e.title,
      description: e.description || '',
    })),
    orientation: 'vertical' as const,
    interactive: false,
  };

  return <TimelineRenderer timeline={spec} />;
}
