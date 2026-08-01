'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { TimelineBlockData } from '@/types/canonical';
import TimelineRenderer from '@/components/timeline/TimelineRenderer';

export const TimelineBlock: FC<BlockComponentProps> = ({ data }) => {
  const { title, description, events } = data as unknown as TimelineBlockData;
  if (!events || events.length === 0) return null;

  const spec = {
    cardId: 'kl-timeline',
    type: 'timeline' as const,
    purpose: title || 'Timeline',
    events: events.map((e) => ({
      date: e.date,
      title: e.title,
      description: e.description || '',
    })),
    orientation: 'vertical' as const,
    interactive: true,
    caption: description,
  };

  return <TimelineRenderer timeline={spec} />;
};
