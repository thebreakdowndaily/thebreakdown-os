'use client';

import type { TimelineEventData } from './types';
import TimelineRenderer from '@/components/timeline/TimelineRenderer';

interface TimelineProps {
  events: TimelineEventData[];
}

export default function Timeline({ events }: TimelineProps) {
  if (events.length === 0) return null;

  const spec = {
    cardId: 'home-timeline',
    type: 'timeline' as const,
    purpose: 'Major Historical Events',
    events: events.map((e) => ({
      date: e.date,
      title: e.title,
      description: e.summary || '',
    })),
    orientation: 'vertical' as const,
    interactive: true,
  };

  return <TimelineRenderer timeline={spec} />;
}
