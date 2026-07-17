import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChapterPageShell } from '@/components/knowledge-library/ChapterPage';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import { seedAll, getKnowledgeCore } from '@/lib/knowledge/knowledge-core';
import { buildChapterGraph } from '@/lib/knowledge/knowledge-graph';
import { getEntityIndex } from '@/utils/data-layer/entity-index';
import { enrichClaimLazy } from '@/lib/knowledge/knowledge-core';
import type { CanonicalClaim } from '@/types/canonical';
import Script from 'next/script';
import { createArticleSchema, createBreadcrumbSchema } from '@/lib/seo/jsonld';

export const revalidate = 3600;

export async function generateStaticParams() {
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const libraries = await repo.getAllLibraries();
  const params = [];
  
  for (const lib of libraries) {
    for (const col of lib.collections) {
      for (const vol of col.volumes) {
        for (const chap of vol.chapters) {
          if (chap.status === 'published' || chap.status === 'verified') {
            params.push({
              collectionSlug: col.slug,
              volumeSlug: vol.slug,
              chapterSlug: chap.slug
            });
          }
        }
      }
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ collectionSlug: string; volumeSlug: string; chapterSlug: string }> }): Promise<Metadata> {
  const { collectionSlug, volumeSlug, chapterSlug } = await params;
  seedAll();
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const chapter = await repo.getChapter('india-and-the-world', collectionSlug, volumeSlug, chapterSlug);
  if (!chapter) return { title: 'Chapter Not Found' };
  const versionStr = `${chapter.version.major}.${chapter.version.minor}.${chapter.version.patch}`;
  return {
    title: `${chapter.title} — The Breakdown Knowledge Library`,
    description: chapter.summary,
    openGraph: {
      title: `${chapter.title} — The Breakdown`,
      description: chapter.summary,
      url: `https://thebreakdown.in/series/${collectionSlug}/volume/${volumeSlug}/chapter/${chapterSlug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${chapter.title} — The Breakdown`,
      description: chapter.summary,
    },
    alternates: {
      canonical: `https://thebreakdown.in/series/${collectionSlug}/volume/${volumeSlug}/chapter/${chapterSlug}`,
    },
    other: {
      'article:published_time': chapter.createdAt,
      'article:version': versionStr,
    },
  };
}

export default async function ChapterRoute({ params }: { params: Promise<{ collectionSlug: string; volumeSlug: string; chapterSlug: string }> }) {
  const { collectionSlug, volumeSlug, chapterSlug } = await params;
  seedAll();
  const core = getKnowledgeCore();
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const library = await repo.getLibrary('india-and-the-world');
  if (!library) notFound();

  const chapter = await repo.getChapter('india-and-the-world', collectionSlug, volumeSlug, chapterSlug);
  if (!chapter) notFound();

  const allChapters = library.collections.flatMap(c =>
    c.volumes.flatMap(v => v.chapters)
  );
  const allEntities = getEntityIndex();
  const graph = buildChapterGraph(chapter, allChapters, allEntities);

  const chapterClaimIds = chapter.relatedConceptIds?.flatMap(
    cid => core.claims.byConcept(cid)
  ).map(c => c.id) || [];
  const enrichedClaims = chapterClaimIds
    .map(id => enrichClaimLazy(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof enrichClaimLazy>>[];

  const collection = library.collections.find(c => c.slug === collectionSlug);
  const volume = collection?.volumes.find(v => v.slug === volumeSlug);

  const jsonLd = [
    createArticleSchema({
      headline: chapter.title,
      summary: chapter.summary,
      url: `https://thebreakdown.in/series/${collectionSlug}/volume/${volumeSlug}/chapter/${chapterSlug}`,
      publishedAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      wordCount: chapter.content?.reduce((sum, b) => sum + (JSON.stringify(b).length / 5), 0) || 0,
      tags: chapter.relatedConceptIds,
      isNews: false, // Canonical chapters are long-form Articles
    }),
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Library', url: '/series' },
      ...(collection ? [{ name: collection.title, url: `/series/${collection.slug}` }] : []),
      ...(volume ? [{ name: volume.title, url: `/series/${collectionSlug}/volume/${volume.slug}` }] : []),
      { name: chapter.title.slice(0, 60), url: `/series/${collectionSlug}/volume/${volumeSlug}/chapter/${chapterSlug}` },
    ]),
  ];

  return (
    <>
      {jsonLd.map((schema, idx) => (
        <Script key={`schema-${idx}`} id={`schema-chapter-${idx}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(schema)}
        </Script>
      ))}
      <ChapterPageShell
        chapter={chapter}
        collectionSlug={collectionSlug}
        volumeSlug={volumeSlug}
        graph={graph}
        enrichedClaims={enrichedClaims}
      />
    </>
  );
}
