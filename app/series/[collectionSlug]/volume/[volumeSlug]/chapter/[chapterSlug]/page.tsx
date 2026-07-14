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

export const dynamic = 'force-dynamic';

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

  return (
    <ChapterPageShell
      chapter={chapter}
      collectionSlug={collectionSlug}
      volumeSlug={volumeSlug}
      graph={graph}
      enrichedClaims={enrichedClaims}
    />
  );
}
