'use client';

import { useState, useMemo } from 'react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import type { TimelineEventData } from './types';
import TimelineFilters from './TimelineFilters';
import Timeline from './Timeline';

interface TimelineSectionProps {
  events: TimelineEventData[];
}

export default function TimelineSection({ events }: TimelineSectionProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(events.map((e) => e.category));
    return Array.from(cats);
  }, [events]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter((e) => e.category === activeFilter);
  }, [events, activeFilter]);

  if (events.length === 0) return null;

  return (
    <section className="w-full bg-[#0A0A0A] border-t border-[#2A2A2A]/60">
      <Container as="div" className="py-16 sm:py-20">
        <SectionHeader
          eyebrow="History"
          title="Timeline"
          description="Explore major events over time."
        />

        <TimelineFilters
          categories={categories}
          active={activeFilter}
          onSelect={setActiveFilter}
        />

        <Timeline events={filtered} />

        <div className="mt-10 text-center">
          <Button href="/timeline" variant="secondary">
            Explore Full Timeline
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </div>
      </Container>
    </section>
  );
}
