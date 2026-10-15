/**
 * Canonical publication predicate for knowledge-library chapters.
 *
 * The legacy Chapter model uses `status: verified` for publicly rendered
 * chapters. Preserve that established mapping, but centralize it so routes,
 * metadata, sitemaps and trust metrics cannot drift independently.
 */
import type { Chapter } from '@/types/canonical';
import { isPubliclyPublished, type PublicationContext } from '@/lib/story/publication';

type ChapterPublicationFields = Chapter & {
  publicationStatus?: PublicationContext['publicationStatus'];
  publishedAt?: string;
  isTestArtifact?: boolean;
};

export function isChapterPubliclyPublished(
  chapter: Chapter,
  now: Date = new Date(),
): boolean {
  const value = chapter as ChapterPublicationFields;
  const statusIsPublic = chapter.status === 'published' || chapter.status === 'verified';
  const publicationStatus = value.publicationStatus ?? (statusIsPublic ? 'published' : 'draft');
  const publishedAt = value.publishedAt || chapter.createdAt;

  return isPubliclyPublished({
    publicationStatus,
    publishedAt,
    isTestArtifact: value.isTestArtifact,
  }, now);
}
