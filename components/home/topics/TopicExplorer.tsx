import type { APITopic } from '@/utils/data-layer/types';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import TopicCard from './TopicCard';

interface TopicExplorerProps {
  topics: APITopic[];
}

export default function TopicExplorer({ topics }: TopicExplorerProps) {
  if (topics.length === 0) return null;

  return (
    <section className="w-full bg-[#0A0A0A] border-t border-[#2A2A2A]/60">
      <Container as="div" className="py-16 sm:py-20">
        <SectionHeader
          eyebrow="Knowledge Hub"
          title="Explore Topics"
          description="Follow the stories shaping India and the world."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button href="/topics" variant="secondary">
            Explore All Topics
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </div>
      </Container>
    </section>
  );
}
