import React from 'react';
import InteractiveTimelineBlock from '@/components/story/blocks/InteractiveTimelineBlock';
import type { TimelineEvent } from '@/types/canonical';

interface EntityTimelineProps {
  events: TimelineEvent[];
}

export default function EntityTimeline({ events }: EntityTimelineProps) {
  if (events.length === 0) return null;
  return (
    <section aria-label="Timeline" className="py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Timeline</h2>
      <InteractiveTimelineBlock events={events} />
    </section>
  );
}
