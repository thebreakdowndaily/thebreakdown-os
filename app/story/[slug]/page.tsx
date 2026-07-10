import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildStoryPage } from '@/features/story/view-model';
import type { Story, StoryBlock } from '@/types/canonical';
import StoryLayout from '@/layouts/StoryLayout';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Hero from '@/components/story/Hero';
import { BlockRenderer } from '@/components/story/blocks/registry';
import RelatedStories from '@/components/story/RelatedStories';
import RelatedEntities from '@/components/story/RelatedEntities';
import AuthorBox from '@/components/story/AuthorBox';
import ExecutiveSummary from '@/components/story/ExecutiveSummary';
import Timeline from '@/components/story/Timeline';
import Evidence from '@/components/story/Evidence';
import SourcesList from '@/components/story/SourcesList';

function BlocksRenderer({ blocks }: { blocks?: StoryBlock[] }) {
  if (!blocks) return null;
  return blocks.map((block) => <BlockRenderer key={block.id} block={block as any} />);
}

function deriveKeyPoints(story: Story): string[] {
  if (story.claims && story.claims.length >= 3) {
    return story.claims.slice(0, 4).map(c => c.claim);
  }
  return [];
}

function createJsonLd(story: Story): Record<string, unknown>[] {
  const breadcrumbs = story.slug.split('-').slice(0, 2).join(' ').toUpperCase();
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: story.headline,
      description: story.summary,
      image: story.heroImage ? {
        '@type': 'ImageObject',
        url: story.heroImage,
        width: 1200,
        height: 630,
      } : undefined,
      datePublished: story.publishedAt,
      dateModified: story.updatedAt,
      author: { '@type': 'Person', name: story.author },
      publisher: {
        '@type': 'Organization',
        name: 'The Breakdown',
        logo: { '@type': 'ImageObject', url: 'https://thebreakdown.in/logo.svg' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://thebreakdown.in/story/${story.slug}` },
      wordCount: story.blocks?.reduce((sum, b) => sum + (JSON.stringify(b).length / 5), 0) || 0,
      articleSection: story.category,
      keywords: story.tags?.join(', '),
      inLanguage: 'en-IN',
      isAccessibleForFree: true,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thebreakdown.in/' },
        { '@type': 'ListItem', position: 2, name: breadcrumbs, item: 'https://thebreakdown.in/stories' },
        { '@type': 'ListItem', position: 3, name: story.headline.slice(0, 60), item: `https://thebreakdown.in/story/${story.slug}` },
      ],
    },
  ];
}

export function generateStaticParams() {
  const services = bootstrapServices();
  return services.stories.getStories().data.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const services = bootstrapServices();
  const vm = buildStoryPage(services, slug);
  if (!vm) return { title: 'Story Not Found — The Breakdown' };
  const { story } = vm;

  const desc = story.summary.length > 155 ? story.summary.slice(0, 152) + '...' : story.summary;

  return {
    title: story.headline,
    description: desc,
    keywords: story.tags.join(', '),
    alternates: { canonical: `https://thebreakdown.in/story/${story.slug}` },
    other: {
      'news_keywords': story.tags.slice(0, 10).join(', '),
    },
    openGraph: {
      title: story.headline,
      description: desc,
      type: 'article',
      publishedTime: story.publishedAt,
      modifiedTime: story.updatedAt,
      url: `https://thebreakdown.in/story/${story.slug}`,
      images: story.heroImage ? [{ url: story.heroImage, width: 1200, height: 630, alt: story.headline }] : [],
      tags: story.tags.slice(0, 6),
    },
    twitter: {
      card: 'summary_large_image',
      title: story.headline,
      description: desc,
      images: story.heroImage ? [story.heroImage] : [],
    },
  };
}

export default async function StoryPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const mode = (resolvedSearchParams?.mode as string) || 'standard';
  const services = bootstrapServices();
  const vm = buildStoryPage(services, slug);
  if (!vm) notFound();
  const { story, relatedStories, relatedEntities } = vm;

  return (
    <>
      {createJsonLd(story).map((ld, i) => (
        <Script key={`sc-${i}`} id={`schema-${i}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(ld)}
        </Script>
      ))}

      <Breadcrumbs items={vm.breadcrumbs} />
      <Hero story={story} />

      <StoryLayout story={story} tableOfContents={vm.tableOfContents}>
        {mode !== 'timeline' && mode !== 'data' && (
          <ExecutiveSummary
            summary={story.summary}
            keyPoints={deriveKeyPoints(story)}
            takeaway={story.takeaway}
            whoIsAffected={story.whoIsAffected}
            impactLevel={story.impactLevel}
          />
        )}
        {mode !== 'quick' && mode !== 'timeline' && mode !== 'data' && (
          <BlocksRenderer blocks={story.blocks} />
        )}
        {mode === 'data' && (
          <BlocksRenderer blocks={story.blocks.filter(b => b.type === 'chart' || b.type === 'key-numbers' || b.type === 'dataset-reference')} />
        )}
        {mode !== 'quick' && mode !== 'data' && (
          <Timeline events={story.timeline} />
        )}
        {mode !== 'quick' && mode !== 'timeline' && (
          <Evidence 
            claims={story.claims?.map(c => ({
              claim: c.claim,
              source: c.source,
              verification: c.status === 'verified' || c.status === 'strong' ? 'true' : c.status === 'moderate' ? 'misleading' : 'unverifiable',
              explanation: c.data,
              confidence: c.confidence
            })) || []} 
            sources={story.sources.map(s => ({ name: s.title, url: s.url, type: 'News', tier: s.tier }))} 
            verificationScore={story.evidenceScore} 
          />
        )}
        {mode !== 'quick' && mode !== 'timeline' && mode !== 'data' && (
          <SourcesList sources={story.sources.map(s => ({ name: s.title, url: s.url, type: 'News', tier: s.tier }))} />
        )}
      </StoryLayout>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {relatedStories.length > 0 && (
          <RelatedStories
            stories={relatedStories.map((s) => ({
              slug: s.slug,
              headline: s.headline,
              summary: s.summary,
              heroImage: s.heroImage,
              publishedAt: s.publishedAt,
              readingTime: s.readingTime,
              evidenceScore: s.evidenceScore,
              category: s.category,
            }))}
          />
        )}
        {relatedEntities.length > 0 && (
          <RelatedEntities
            entities={relatedEntities.map((e) => ({
              id: e.id,
              slug: e.slug,
              name: e.name,
              type: e.type,
              description: e.description,
            }))}
          />
        )}
        <AuthorBox author={{ name: story.author }} />
      </div>
    </>
  );
}