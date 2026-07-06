import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { TopicJSON, Section } from '@/utils/types';
import { buildTopic } from '@/utils/website-builder';
import TopicLayout from '@/layouts/TopicLayout';
import TopicHeader from '@/components/topic/TopicHeader';
import TopicCollections from '@/components/topic/TopicCollections';
import TopicCharts from '@/components/topic/TopicCharts';
import RelatedStories from '@/components/story/RelatedStories';
import { TopicGraphSection } from '@/features/graph/components/TopicGraphSection';

const sectionComponents: Record<string, React.ElementType | undefined> = {
  'topic-header': TopicHeader,
  'topic-collections': TopicCollections,
  'topic-charts': TopicCharts,
  'related-stories': RelatedStories,
  'topic-graph': TopicGraphSection,
};

function SectionRenderer({ sections, slug }: { sections: Section[]; slug: string }) {
  return (
    <>
      {sections.map((section) => {
        const Component = sectionComponents[section.id];
        if (!Component) return null;
        if (section.id === 'topic-graph') return <Component key={section.id} topicSlug={slug} />;
        return <Component key={section.id} {...section.props} />;
      })}
    </>
  );
}

const mockTopics: TopicJSON[] = [
  {
    id: 'agriculture',
    slug: 'agriculture',
    name: 'Agriculture',
    description: 'Stories, data, and analysis on Indian agriculture — including farm policy, crop patterns, MSP, farmer incomes, and agri-tech.',
    image: '/images/topics/agriculture.jpg',
    storyCount: 156,
    entityCount: 48,
    updatedAt: '2026-06-20T10:00:00Z',
    stories: [
      { slug: 'pm-fasal-bima-claims', headline: 'PM Fasal Bima Yojana: The Claims That Never Reached Farmers', summary: 'Investigation into delayed crop insurance claims.', publishedAt: '2026-06-05T06:00:00Z', readingTime: 15, evidenceScore: 97, category: 'policy' },
    ],
    people: [],
    organizations: [{ id: 'ministry-of-agriculture', slug: 'ministry-of-agriculture', name: 'Ministry of Agriculture and Farmers Welfare', type: 'organization' }],
    policies: [{ id: 'pm-fasal-bima', slug: 'pm-fasal-bima', name: 'PM Fasal Bima Yojana', type: 'policy' }],
    budgets: [],
    reports: [],
    charts: [
      { type: 'line', title: 'Agricultural GDP Growth (2015-2026)', data: [{ year: '2015-16', growth: 0.4 }, { year: '2019-20', growth: 3.0 }, { year: '2022-23', growth: 4.0 }, { year: '2025-26', growth: 3.8 }], xKey: 'year', yKey: 'growth' },
    ],
  },
  {
    id: 'employment',
    slug: 'employment',
    name: 'Employment',
    description: 'Coverage of India\'s employment landscape — job creation, unemployment rates, skill development, labour force participation, and employment schemes.',
    image: '/images/topics/employment.jpg',
    storyCount: 112,
    entityCount: 35,
    updatedAt: '2026-06-18T09:00:00Z',
    stories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
    ],
    people: [],
    organizations: [{ id: 'ministry-of-labour', slug: 'ministry-of-labour', name: 'Ministry of Labour and Employment', type: 'organization' }],
    policies: [],
    budgets: [],
    reports: [],
    charts: [],
  },
];

const topicMap = new Map(mockTopics.map((t) => [t.slug, t]));

export function generateStaticParams() {
  return mockTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = topicMap.get(slug);
  if (!data) return { title: 'Topic Not Found' };
  const pageSpec = buildTopic(data);
  return {
    title: pageSpec.seo.title,
    description: pageSpec.seo.description,
    openGraph: {
      title: pageSpec.seo.title,
      description: pageSpec.seo.description,
      type: 'website',
      url: `https://thebreakdown.in/topic/${data.slug}`,
    },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = topicMap.get(slug);
  if (!data) notFound();

  const pageSpec = buildTopic(data);

  return (
    <TopicLayout seo={pageSpec.seo} breadcrumbs={pageSpec.breadcrumbs}>
      <SectionRenderer sections={pageSpec.sections} slug={slug} />
    </TopicLayout>
  );
}
