import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildStoryPage } from '@/features/story/view-model';
import type { Story, StoryBlock } from '@/types/canonical';
import StoryLayout from '@/layouts/StoryLayout';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BlockRenderer } from '@/components/story/blocks/registry';
import SourcesList from '@/components/story/SourcesList';
import KnowledgeLayer from '@/components/story/KnowledgeLayer';
import NextExploration from '@/components/story/NextExploration';

function BlocksRenderer({ blocks }: { blocks?: StoryBlock[] }) {
  if (!blocks) return null;
  return blocks.map((block) => <BlockRenderer key={block.id} block={block as any} />);
}

function createJsonLd(story: Story): Record<string, unknown>[] {
  const breadcrumbs = story.slug.split('-').slice(0, 2).join(' ').toUpperCase();
  const ld: Record<string, unknown>[] = [
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

  const faqBlocks = story.blocks?.filter((b) => b.type === 'faq') || [];
  if (faqBlocks.length > 0) {
    const mainEntity: Record<string, unknown>[] = [];
    faqBlocks.forEach((block) => {
      const data = block.data as any;
      if (data.questions && Array.isArray(data.questions)) {
        data.questions.forEach((q: any) => {
          mainEntity.push({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer,
            },
          });
        });
      }
    });

    if (mainEntity.length > 0) {
      ld.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity,
      });
    }
  }

  ld.push({
    '@context': 'https://thebreakdown.in/schema',
    '@type': 'TheBreakdownKnowledgeStory',
    headline: story.headline,
    summary: story.summary,
    entities: story.tags || [],
    topics: story.category ? [story.category] : [],
    claims: story.claims?.map(c => ({
      claim: c.claim,
      source: c.source,
      verification: c.status,
      confidence: c.confidence
    })) || [],
    sources: story.sources?.map(s => ({
      title: s.title,
      url: s.url,
      tier: s.tier
    })) || [],
    timeline: story.timeline?.map(t => ({
      date: t.date,
      title: t.title,
      description: t.description
    })) || [],
    relationships: story.stakeholderNames || [],
  });

  return ld;
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

  const heroBlocks = story.blocks?.filter(b => b.region === 'hero') || [];
  const footerBlocks = story.blocks?.filter(b => b.region === 'footer') || [];
  let mainBlocks = story.blocks?.filter(b => !b.region || b.region === 'main') || [];
  let sidebarBlocks = story.blocks?.filter(b => b.region === 'sidebar') || [];

  if (mode === 'data') {
    mainBlocks = story.blocks?.filter(b => b.type === 'chart' || b.type === 'key-numbers' || b.type === 'dataset-reference') || [];
    sidebarBlocks = [];
  } else if (mode === 'timeline') {
    mainBlocks = story.blocks?.filter(b => b.type === 'timeline') || [];
    sidebarBlocks = [];
  } else if (mode === 'quick') {
    mainBlocks = mainBlocks.filter(b => b.type === 'executive-summary' || b.type === 'key-numbers');
  }

  return (
    <>
      {createJsonLd(story).map((ld, i) => (
        <Script key={`sc-${i}`} id={`schema-${i}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(ld)}
        </Script>
      ))}

      <Breadcrumbs items={vm.breadcrumbs} />
      <BlocksRenderer blocks={heroBlocks} />

      <StoryLayout story={story} tableOfContents={vm.tableOfContents} sidebarBlocks={sidebarBlocks}>
        {/* Mobile Sidebar/Snapshot (hidden on large screens) */}
        <div className="lg:hidden mt-8 mb-8">
          <BlocksRenderer blocks={sidebarBlocks} />
        </div>
        
        <BlocksRenderer blocks={mainBlocks} />

        {mode === 'deep' && (
          <SourcesList sources={story.sources.map(s => ({ name: s.title, url: s.url, type: 'News', tier: s.tier }))} />
        )}
      </StoryLayout>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <BlocksRenderer blocks={footerBlocks} />
      </div>

      <KnowledgeLayer story={story} relatedEntities={relatedEntities} />
      
      {relatedStories.length > 0 && (
        <NextExploration stories={relatedStories} />
      )}
    </>
  );
}