'use client';

import type { APIStory } from '@/utils/data-layer/types';
import Container from '@/components/ui/Container';
import HeroContent from './HeroContent';
import HeroVisual from './HeroVisual';

interface HeroProps {
  story: APIStory;
}

export default function Hero({ story }: HeroProps) {
  return (
    <section
      className="relative w-full min-h-[88vh] flex items-center bg-neutral-950 overflow-hidden"
      aria-labelledby="hero-headline"
    >
      {/* Single, very subtle ambient light — not animated, not distracting */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-500/[0.025] blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <Container as="div" className="relative z-10 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Text column */}
          <div className="space-y-8 max-w-2xl">
            <HeroContent
              headline={story.headline}
              summary={story.summary}
              evidenceScore={story.evidenceScore}
              sourcesCount={story.sources.length}
              updatedAt={story.updatedAt}
              readingTime={story.readingTime}
              category={story.category}
              storySlug={story.slug}
              keyPoints={story.keyPoints}
            />
          </div>

          {/* Visual column */}
          <div className="relative">
            <HeroVisual
              heroImage={story.heroImage}
              headline={story.headline}
              timeline={story.timeline}
              charts={story.charts}
              geoData={story.geoData}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}