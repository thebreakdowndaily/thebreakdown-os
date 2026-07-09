import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildTopicPage } from '@/features/topic/view-model';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import StoryCard from '@/components/ui/StoryCard';
import EntityCard from '@/components/ui/EntityCard';
import Divider from '@/components/ui/Divider';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import InteractiveTimelineBlock from '@/components/story/blocks/InteractiveTimelineBlock';
import FAQ from '@/components/story/FAQ';
import { TopicGraphSection } from '@/features/graph/components/TopicGraphSection';

function createJsonLd(topic: { name: string; description: string; slug: string }) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: topic.name,
      description: topic.description,
      url: `https://thebreakdown.in/topic/${topic.slug}`,
      publisher: { '@type': 'Organization', name: 'The Breakdown' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thebreakdown.in/' },
        { '@type': 'ListItem', position: 2, name: 'Topics', item: 'https://thebreakdown.in/topics' },
        { '@type': 'ListItem', position: 3, name: topic.name, item: `https://thebreakdown.in/topic/${topic.slug}` },
      ],
    },
  ];
}

const entityTypeLabel: Record<string, string> = {
  person: 'People',
  organization: 'Organizations',
  policy: 'Policies',
  scheme: 'Schemes',
  budget: 'Budgets',
  report: 'Reports',
  country: 'Countries',
};

export function generateStaticParams() {
  const services = bootstrapServices();
  return services.topics.getTopics({ pageSize: 100 }).data.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const services = bootstrapServices();
  const vm = buildTopicPage(services, slug);
  if (!vm) return { title: 'Topic Not Found — The Breakdown' };
  const { topic } = vm;
  return {
    title: topic.name,
    description: topic.description,
    alternates: { canonical: `https://thebreakdown.in/topic/${topic.slug}` },
    openGraph: {
      title: topic.name,
      description: topic.description,
      type: 'website',
      url: `https://thebreakdown.in/topic/${topic.slug}`,
      images: topic.image ? [{ url: topic.image, width: 1200, height: 630, alt: topic.name }] : [],
    },
    twitter: { card: 'summary_large_image', title: topic.name, description: topic.description },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = bootstrapServices();
  const vm = buildTopicPage(services, slug);
  if (!vm) notFound();
  const { topic, stories, entities } = vm;

  const featuredStories = stories.length > 0 ? stories.slice(0, Math.min(3, stories.length)) : [];
  const remainingStories = stories.slice(featuredStories.length);

  const entityGroups: Record<string, typeof entities> = {};
  entities.forEach((e) => {
    const key = entityTypeLabel[e.type] || e.type;
    if (!entityGroups[key]) entityGroups[key] = [];
    entityGroups[key].push(e);
  });

  return (
    <>
      {createJsonLd(topic).map((ld, i) => (
        <Script key={`sc-${i}`} id={`schema-${i}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(ld)}
        </Script>
      ))}

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Topics', href: '/topics' },
          { label: topic.name, href: `/topic/${topic.slug}` },
        ]}
      />

      <main className="flex-1 w-full" role="main">
        {/* ── Hero Section ── */}
        <section aria-label={`Topic: ${topic.name}`} className="relative w-full min-h-[35vh] flex items-center bg-[#0A0A0A] overflow-hidden">
          {topic.image && (
            <div className="absolute inset-0">
              <img src={topic.image} alt="" className="w-full h-full object-cover" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]/60" />
            </div>
          )}
          <Container className="relative z-10 py-12">
            {!topic.image && <div className="w-16 h-1 bg-[#D4A843] rounded-full mb-6" aria-hidden="true" />}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] leading-tight mb-4">
              {topic.name}
            </h1>
            <p className="text-lg sm:text-xl text-[#A1A1AA] max-w-3xl leading-relaxed mb-6">
              {topic.description}
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {[
                { label: 'Stories', count: stories.length },
                { label: 'Entities', count: entities.length },
                ...(topic.statistics || []).slice(0, 3).map((s) => ({ label: s.label, count: s.value })),
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-1.5">
                  <span className="text-[#D4A843] font-bold text-lg">{stat.count}</span>
                  <span className="text-[#A1A1AA]">{stat.label}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Featured Stories Grid ── */}
        {featuredStories.length > 0 && (
          <Container as="section" className="py-12">
            <SectionHeader
              eyebrow="Coverage"
              title="Featured Stories"
              description={topic.overview || undefined}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStories.slice(0, 1).map((s) => (
                <div key={s.slug} className="sm:col-span-2 lg:col-span-2">
                  <StoryCard story={s} variant="featured" />
                </div>
              ))}
              {featuredStories.slice(1, 3).map((s) => (
                <StoryCard key={s.slug} story={s} variant="default" />
              ))}
            </div>
            {remainingStories.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {remainingStories.map((s) => (
                  <StoryCard key={s.slug} story={s} variant="compact" />
                ))}
                {stories.length > 6 && (
                  <a
                    href={`/search?q=${encodeURIComponent(topic.name)}&type=story`}
                    className="flex items-center justify-center p-4 rounded-2xl bg-[#151515] border border-[#2A2A2A] hover:border-[#D4A843] transition-colors text-sm text-[#A1A1AA] hover:text-[#D4A843]"
                  >
                    View all {stories.length} stories &rarr;
                  </a>
                )}
              </div>
            )}
          </Container>
        )}

        <Divider />

        {/* ── Entity Clusters ── */}
        {entities.length > 0 && Object.entries(entityGroups).length > 0 && (
          <Container as="section" className="py-12">
            <SectionHeader
              eyebrow="Intelligence"
              title="Key Entities"
              description={`${entities.length} entities tracked under this topic`}
            />
            <div className="space-y-10">
              {Object.entries(entityGroups).map(([groupLabel, groupEntities]) => (
                <div key={groupLabel}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#D4A843] mb-4">{groupLabel}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupEntities.slice(0, 6).map((e) => (
                      <EntityCard key={e.slug} entity={e} size="sm" />
                    ))}
                    {groupEntities.length > 6 && (
                      <a
                        href={`/search?q=${encodeURIComponent(topic.name)}&type=entity`}
                        className="flex items-center justify-center p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] hover:border-[#D4A843] transition-colors text-xs text-[#A1A1AA] hover:text-[#D4A843]"
                      >
                        +{groupEntities.length - 6} more
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        )}

        <Divider />

        {/* ── Timeline ── */}
        {topic.timeline && topic.timeline.length > 0 && (
          <Container as="section" className="py-12">
            <SectionHeader
              eyebrow="History"
              title="Timeline"
              description="Key events across this topic"
            />
            <InteractiveTimelineBlock events={topic.timeline} />
          </Container>
        )}

        {/* ── Knowledge Graph ── */}
        <Container as="section" className="py-12">
          <SectionHeader
            eyebrow="Connections"
            title="Knowledge Graph"
            description="Explore relationships between stories, entities, and topics"
          />
          <div className="bg-[#151515] rounded-2xl border border-[#2A2A2A] p-4 min-h-[320px]">
            <TopicGraphSection topicSlug={slug} />
          </div>
        </Container>

        {/* ── FAQ ── */}
        {topic.faq && topic.faq.length > 0 && (
          <Container as="section" className="py-12">
            <SectionHeader
              eyebrow="Explainer"
              title="Frequently Asked Questions"
            />
            <FAQ questions={topic.faq} />
          </Container>
        )}
      </main>
    </>
  );
}
