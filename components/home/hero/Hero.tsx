'use client';

import type { APIStory } from '@/utils/data-layer/types';
import Container from '@/components/ui/Container';
import HeroContent from './HeroContent';
import HeroVisual from './HeroVisual';
import HeroStats from './HeroStats';

interface HeroProps {
  story: APIStory;
}

export default function Hero({ story }: HeroProps) {
  return (
    <section
      className="relative w-full min-h-[80vh] lg:min-h-[85vh] flex items-center bg-[#0A0A0A] overflow-hidden"
      aria-labelledby="hero-headline"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4A843]/[0.03] via-transparent to-transparent pointer-events-none animate-ambient-gradient" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-[#D4A843]/[0.02] blur-3xl pointer-events-none animate-float-particle" style={{ animationDelay: '0s' }} aria-hidden="true" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-[#D4A843]/[0.015] blur-3xl pointer-events-none animate-float-particle" style={{ animationDelay: '2s' }} aria-hidden="true" />

      <Container as="div" className="relative z-10 py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-8">
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

            <HeroStats
              evidenceScore={story.evidenceScore}
              sourcesCount={story.sources.length}
              keyPointsCount={story.keyPoints.length}
              readingTime={story.readingTime}
            />
          </div>

          <div className="lg:row-span-2">
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

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" aria-hidden="true" />
    </section>
  );
}