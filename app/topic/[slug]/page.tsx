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
import Image from 'next/image';
import TopicHero from '@/components/topic/TopicHero';
import TopicStats from '@/components/topic/TopicStats';

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

export async function generateStaticParams() {
  const services = bootstrapServices();
  return (await services.topics.getTopics({ pageSize: 100 })).data.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const services = bootstrapServices();
  const vm = await buildTopicPage(services, slug);
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
  const vm = await buildTopicPage(services, slug);
  if (!vm) notFound();
  
  const { topic, storyGroups, rankedEntities, unifiedTimeline, statistics, qualityScore } = vm;

  return (
    <>
      {createJsonLd(topic).map((ld, i) => (
        <Script key={`sc-${i}`} id={`schema-${i}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(ld)}
        </Script>
      ))}

      <Breadcrumbs items={vm.breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Column */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
          
          {/* Header */}
          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              {topic.name}
            </h1>
            
            <p className="text-xl text-neutral-300 leading-relaxed font-medium">
              {topic.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400 border-t border-b border-neutral-800 py-3">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {qualityScore.score}% Coverage Score
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {statistics.averageConfidence} Avg Confidence
              </span>
              <span>•</span>
              <span>{statistics.totalEntities} Entities Tracked</span>

              {topic.freshness && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Verified {topic.freshness.lastVerified}
                  </span>
                </>
              )}
            </div>
          </header>

          {/* Stories Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2">Latest Intelligence</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {storyGroups.latest.slice(0, 4).map((s) => (
                <StoryCard key={s.slug} story={s} variant="compact" />
              ))}
            </div>
          </section>

          {/* Timeline Section */}
          {unifiedTimeline.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-neutral-800 pb-2">Unified Timeline</h2>
              <InteractiveTimelineBlock events={unifiedTimeline} />
            </section>
          )}

        </div>

        {/* Knowledge Terminal Sidebar */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="sticky top-6 space-y-6">
            
            {/* Statistics */}
            <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 shadow-2xl">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Topic Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 rounded p-3 text-center border border-neutral-800">
                  <span className="block text-2xl font-mono text-emerald-400 mb-1">{storyGroups.latest.length}</span>
                  <span className="block text-[10px] uppercase tracking-widest text-neutral-500">Stories</span>
                </div>
                <div className="bg-neutral-900 rounded p-3 text-center border border-neutral-800">
                  <span className="block text-2xl font-mono text-emerald-400 mb-1">{statistics.totalClaims}</span>
                  <span className="block text-[10px] uppercase tracking-widest text-neutral-500">Claims</span>
                </div>
                <div className="bg-neutral-900 rounded p-3 text-center border border-neutral-800">
                  <span className="block text-2xl font-mono text-emerald-400 mb-1">{statistics.totalOrganizations}</span>
                  <span className="block text-[10px] uppercase tracking-widest text-neutral-500">Orgs</span>
                </div>
                <div className="bg-neutral-900 rounded p-3 text-center border border-neutral-800">
                  <span className="block text-2xl font-mono text-emerald-400 mb-1">{statistics.totalCountries}</span>
                  <span className="block text-[10px] uppercase tracking-widest text-neutral-500">Countries</span>
                </div>
              </div>
            </section>

            {/* Key Entities */}
            {rankedEntities.length > 0 && (
              <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 shadow-2xl">
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Top Entities</h3>
                <div className="space-y-3">
                  {rankedEntities.slice(0, 5).map((re, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <a href={`/entity/${re.entity.slug}`} className="text-sm font-medium text-emerald-400 hover:underline">
                        {re.entity.name}
                      </a>
                      <span className="text-xs text-neutral-500 border border-neutral-700 px-2 py-0.5 rounded">
                        {re.importance}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Knowledge Graph */}
            <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 shadow-2xl">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Knowledge Graph</h3>
              <div className="bg-neutral-900 rounded border border-neutral-800 h-48 overflow-hidden relative">
                 <TopicGraphSection topicSlug={slug} />
                 {/* Overlay to disable interactivity in small sidebar and prompt full view */}
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button className="text-xs bg-neutral-800 text-white px-3 py-1.5 rounded border border-neutral-700 hover:bg-neutral-700">
                      Expand Graph
                    </button>
                 </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </>
  );
}
