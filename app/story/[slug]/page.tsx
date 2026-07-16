import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildStoryPage } from '@/features/story/view-model';
import type { Story, StoryBlock } from '@/types/canonical';
import StoryLayout from '@/layouts/StoryLayout';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BlockRenderer } from '@/components/story/blocks/registry';
import SourcesList from '@/components/story/SourcesList';
import KnowledgeLayer from '@/components/story/KnowledgeLayer';
import NextExploration from '@/components/story/NextExploration';
import TierSelector from '@/components/story/TierSelector';
import type { Tier } from '@/components/story/TierSelector';
import { StoryShell } from '@/components/rxs/StoryShell';
import { seedAll, enrichClaimLazy, getKnowledgeCore } from '@/lib/knowledge/knowledge-core';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

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
    sources: story.sources?.map((s: any) => ({
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

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const services = bootstrapServices();
  const storySlugs = (await services.stories.getStories()).data.map((s) => ({ slug: s.slug }));
  const chapterSlugs: { slug: string }[] = [];
  try {
    seedAll();
    const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
    const library = await repo.getLibrary('india-and-the-world');
    if (library) {
      for (const c of library.collections) {
        for (const v of c.volumes) {
          for (const ch of v.chapters) {
            chapterSlugs.push({ slug: ch.slug });
          }
        }
      }
    }
  } catch {}
  return [...storySlugs, ...chapterSlugs];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const chapterData = await tryLoadChapter(slug);
  if (chapterData) {
    const { chapter } = chapterData;
    const versionStr = `${chapter.version.major}.${chapter.version.minor}.${chapter.version.patch}`;
    return {
      title: `${chapter.title} — The Breakdown Knowledge Library`,
      description: chapter.summary,
      alternates: { canonical: `https://thebreakdown.in/story/${slug}` },
      openGraph: {
        title: chapter.title,
        description: chapter.summary,
        url: `https://thebreakdown.in/story/${slug}`,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: chapter.title,
        description: chapter.summary,
      },
      other: {
        'article:version': versionStr,
      },
    };
  }

  const services = bootstrapServices();
  const vm = await buildStoryPage(services, slug);
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

async function tryLoadChapter(slug: string) {
  try {
    seedAll();
    const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
    const library = await repo.getLibrary('india-and-the-world');
    if (!library) return null;
    for (const c of library.collections) {
      for (const v of c.volumes) {
        const ch = v.chapters.find(ch => ch.slug === slug);
        if (ch) {
          // Resolve next chapter: look for recommendedNext match in the same volume, fallback to order + 1
          let nextChapter = null;
          if (ch.recommendedNext && ch.recommendedNext.length > 0) {
            nextChapter = v.chapters.find(item =>
              ch.recommendedNext.includes(item.slug) ||
              ch.recommendedNext.includes(item.title)
            );
          }
          if (!nextChapter) {
            nextChapter = v.chapters.find(item => item.order === ch.order + 1);
          }

          // Resolve related investigation if a canonical relationship exists in the registry
          const services = bootstrapServices();
          const { data: investigations } = await services.investigations.getInvestigations();
          const relatedInvestigation = investigations.find(inv =>
            inv.chapters.some(ich => ich.storySlug === slug)
          ) || null;

          return {
            chapter: ch,
            collectionSlug: c.slug,
            volumeSlug: v.slug,
            nextChapter: nextChapter ? { title: nextChapter.title, slug: nextChapter.slug } : null,
            relatedInvestigation: relatedInvestigation ? { title: relatedInvestigation.title, slug: relatedInvestigation.slug } : null,
          };
        }
      }
    }
  } catch {}
  return null;
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

  const chapterData = await tryLoadChapter(slug);
  if (chapterData) {
    const { chapter, collectionSlug, volumeSlug, nextChapter, relatedInvestigation } = chapterData;
    const core = getKnowledgeCore();
    const chapterClaimIds = chapter.relatedConceptIds?.flatMap(
      cid => core.claims.byConcept(cid)
    ).map(c => c.id) || [];
    const enrichedClaims = chapterClaimIds
      .map(id => enrichClaimLazy(id))
      .filter(Boolean) as NonNullable<ReturnType<typeof enrichClaimLazy>>[];

    const claimCount = chapter.content.filter(b => b.type === 'claim').length;
    const evidenceCount = chapter.content.filter(b => b.type === 'evidence-summary').length;
    const thinkerCount = chapter.content.filter(b => b.type === 'thinker').length;
    const documentCount = chapter.content.filter(b => b.type === 'document').length;

    return (
      <StoryShell
        chapter={chapter}
        collectionSlug={collectionSlug}
        volumeSlug={volumeSlug}
        enrichedClaims={enrichedClaims}
        claimCount={claimCount}
        evidenceCount={evidenceCount}
        thinkerCount={thinkerCount}
        documentCount={documentCount}
        nextChapter={nextChapter}
        relatedInvestigation={relatedInvestigation}
      />
    );
  }
  const mode = (resolvedSearchParams?.mode as string) || 'standard';
  const services = bootstrapServices();
  const vm = await buildStoryPage(services, slug);
  if (!vm) notFound();
  
  const { story, relatedStories, relatedEntities, quickView, deepView, visualAssets, unifiedTimeline, qualityScore } = vm as any;
  const heroImage = visualAssets?.hero?.resolvedAsset?.optimization.cdnUrl || story.heroImage;

  const currentTier: Tier = (mode === 'quick' || mode === 'deep') ? mode : 'standard';
  const quickTime = quickView?.readingTime || 2;
  const standardTime = story.readingTime || 5;
  const deepTime = deepView?.readingTime || 10;

  return (
    <>
      {createJsonLd(story).map((ld, i) => (
        <Script key={`sc-${i}`} id={`schema-${i}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(ld)}
        </Script>
      ))}

      <Breadcrumbs items={vm.breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Article Column */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
          
          {/* Hero Section */}
          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              {story.headline}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-neutral-400 flex-wrap">
              <span className="text-emerald-400 font-mono">{story.author}</span>
              <span>•</span>
              <time dateTime={story.publishedAt}>
                {new Date(story.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {qualityScore.score}% Quality Score
              </span>
              
              {story.freshness && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Verified {story.freshness.lastVerified}
                  </span>
                  <span>•</span>
                  <span className="text-neutral-500 font-mono text-xs">Primary Sources: {story.freshness.primarySourcesCount}</span>
                </>
              )}
            </div>

            {heroImage && (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-neutral-800 my-6 relative">
                <img src={heroImage} alt={story.headline} className="w-full h-full object-cover" />
              </div>
            )}
            
            <p className="text-xl text-neutral-300 leading-relaxed font-medium">
              {story.summary}
            </p>
          </header>

          {/* Tier Selector */}
          <Suspense fallback={<div className="h-12" />}>
            <TierSelector
              currentTier={currentTier}
              quickTime={quickTime}
              standardTime={standardTime}
              deepTime={deepTime}
            />
          </Suspense>

          {/* Article Content */}
          <article className="prose prose-invert prose-lg max-w-none prose-a:text-emerald-400 hover:prose-a:text-emerald-300">
            {mode === 'quick' && quickView?.keyPoints && (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-8">
                <h3 className="text-emerald-400 font-mono text-sm tracking-widest uppercase mb-4 mt-0">Executive Brief</h3>
                <ul className="space-y-2 mb-0">
                  {quickView.keyPoints.map((point: string, i: number) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render traditional blocks for standard/deep modes */}
            {mode !== 'quick' && (
              <BlocksRenderer blocks={story.blocks?.filter((b: any) => !b.region || b.region === 'main')} />
            )}

            {mode === 'deep' && deepView && (
              <div className="mt-12 pt-8 border-t border-neutral-800">
                <h3 className="text-xl font-bold mb-4">Research Methodology</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{deepView.methodology}</p>
              </div>
            )}

            {/* Visual Intelligence Gallery */}
            {visualAssets?.gallery && visualAssets.gallery.length > 0 && (
              <div className="mt-12 pt-8 border-t border-neutral-800">
                <h3 className="text-xl font-bold mb-6">Visual Evidence & Context</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {visualAssets.gallery.map((ref: any, i: number) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-neutral-800 relative group bg-neutral-900">
                      <img src={ref.resolvedAsset?.optimization.cdnUrl} alt={ref.resolvedAsset?.altText} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                         <span className="text-xs text-white font-medium line-clamp-2 mb-1">{ref.resolvedAsset?.attribution.caption || ref.resolvedAsset?.title}</span>
                         <span className="text-[9px] text-emerald-400 uppercase tracking-widest">{ref.resolvedAsset?.attribution.credit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Knowledge Terminal Sidebar */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="sticky top-6 space-y-6">
            
            {/* Unified Timeline */}
            {unifiedTimeline.length > 0 && (
              <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 shadow-2xl">
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Unified Timeline</h3>
                <div className="space-y-4">
                  {unifiedTimeline.slice(0, 5).map((event: any, i: number) => (
                    <div key={i} className="pl-4 border-l border-neutral-800 relative">
                      <div className="absolute w-2 h-2 rounded-full bg-emerald-500 -left-[4.5px] top-1.5" />
                      <time className="text-[10px] text-emerald-500 font-mono mb-1 block">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                      <p className="text-sm text-neutral-300 leading-snug">{event.title || event.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Entities */}
            {relatedEntities.length > 0 && (
              <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 shadow-2xl">
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Entities</h3>
                <div className="flex flex-wrap gap-2">
                  {relatedEntities.map((entity: any, i: number) => (
                    <a key={i} href={`/entity/${entity.slug}`} className="text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-md border border-emerald-500/20 transition-colors">
                      {entity.name}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Visual Intelligence Sidebar */}
            {visualAssets && (visualAssets.portraits?.length > 0 || visualAssets.logos?.length > 0) && (
              <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 shadow-2xl">
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Visual Intelligence
                </h3>
                
                <div className="space-y-5">
                  {visualAssets.portraits.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase text-neutral-600 font-medium mb-3">Key Figures</h4>
                      <div className="flex flex-wrap gap-3">
                        {visualAssets.portraits.map((ref: any, i: number) => (
                          <div key={i} className="group relative">
                            <img src={ref.resolvedAsset?.optimization.cdnUrl} alt={ref.resolvedAsset?.altText} className="w-12 h-12 rounded-full object-cover border-2 border-neutral-800 group-hover:border-emerald-500 transition-colors" />
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                              {ref.resolvedAsset?.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {visualAssets.logos.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase text-neutral-600 font-medium mb-3">Organizations</h4>
                      <div className="flex flex-wrap gap-3">
                        {visualAssets.logos.map((ref: any, i: number) => (
                          <div key={i} className="group relative">
                            <div className="w-12 h-12 bg-white rounded-lg p-1.5 border-2 border-neutral-800 group-hover:border-emerald-500 transition-colors flex items-center justify-center">
                              <img src={ref.resolvedAsset?.optimization.cdnUrl} alt={ref.resolvedAsset?.altText} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                              {ref.resolvedAsset?.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Sources & Evidence Summary */}
            <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 shadow-2xl">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-4">Evidence & Sources</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-neutral-900 rounded p-3 text-center border border-neutral-800">
                  <span className="block text-2xl font-mono text-white mb-1">{story.sources?.length || 0}</span>
                  <span className="block text-[10px] uppercase tracking-widest text-neutral-500">Sources</span>
                </div>
                <div className="bg-neutral-900 rounded p-3 text-center border border-neutral-800">
                  <span className="block text-2xl font-mono text-emerald-400 mb-1">{story.claims?.length || 0}</span>
                  <span className="block text-[10px] uppercase tracking-widest text-neutral-500">Claims</span>
                </div>
              </div>
              <SourcesList sources={story.sources?.map((s: any) => ({ name: s.title, url: s.url, type: 'News', tier: s.tier })) || []} />
            </section>

          </div>
        </div>

      </div>

      {relatedStories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
          <NextExploration stories={relatedStories} />
        </div>
      )}
    </>
  );
}
