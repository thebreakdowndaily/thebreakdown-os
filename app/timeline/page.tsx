import type { Metadata } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import Container from '@/components/ui/Container';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KnowledgeStoryPipeline } from '@/services/stories/pipeline';
import { EntityBuilder } from '@/services/stories/pipeline/entities';
import { GlobalTimelineExplorer } from '@/components/timeline/GlobalTimelineExplorer';

export const metadata: Metadata = {
  title: 'Timeline — The Breakdown',
  description: 'Explore all major events across stories, policies, and entities on The Breakdown.',
  openGraph: {
    title: 'Timeline — The Breakdown',
    description: 'Explore all major events across stories, policies, and entities.',
    url: 'https://thebreakdown.in/timeline',
  },
};

export default async function TimelinePage() {
  const services = bootstrapServices({ publicOnly: true });

  const allStories = (await services.stories.getPublicStories({ pageSize: 100 })).data;
  
  // Use pipeline instead of view models for proper server-side execution
  const pipeline = new KnowledgeStoryPipeline()
    .add(new EntityBuilder());
    
  const knowledgeStories = await Promise.all(allStories.map((s: any) => pipeline.execute(s)));
  const allTimelines = (await services.timelines.getTimelines({ pageSize: 50 })).data;
  const allTopics = (await services.topics.getTopics({ pageSize: 100 })).data;

  const storyEvents = knowledgeStories.flatMap((s) =>
    (s.unifiedTimeline || []).map((e: any) => ({
      ...e,
      source: s.raw.title,
      sourceSlug: `/story/${s.raw.slug}`,
      category: 'story',
    }))
  );

  const timelineEvents = allTimelines.flatMap((t) =>
    t.events.map((e) => ({
      ...e,
      source: t.title,
      sourceSlug: null as string | null,
      category: 'timeline',
    }))
  );

  const topicEvents = allTopics.flatMap((t) =>
    (t.timeline || []).map((e) => ({
      ...e,
      source: t.name,
      sourceSlug: `/topic/${t.slug}`,
      category: 'topic',
    }))
  );

  const allEvents = [...storyEvents, ...timelineEvents, ...topicEvents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Timeline', href: '/timeline' },
        ]}
      />

      <main className="flex-1 w-full" role="main">
        <Container className="py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-2">Timeline</h1>
          <p className="text-lg text-[#A1A1AA] mb-8">
            All major events across stories, policies, and entities.
          </p>

          <GlobalTimelineExplorer events={allEvents} />
        </Container>
      </main>
    </>
  );
}
