import type { APIStory } from '@/utils/data-layer/types';
import Container from '@/components/ui/Container';
import HeroContent from './HeroContent';
import HeroVisual from './HeroVisual';

interface HeroProps {
  story: APIStory;
}

export default function Hero({ story }: HeroProps) {
  return (
    <section className="relative w-full min-h-[80vh] lg:min-h-[85vh] flex items-center bg-[#0A0A0A] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4A843]/[0.03] via-transparent to-transparent pointer-events-none" />

      <Container as="div" className="relative z-10 py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
    </section>
  );
}
