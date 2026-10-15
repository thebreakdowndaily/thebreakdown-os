import { seedAll, getKnowledgeCore } from '@/lib/knowledge/knowledge-core';
import { isChapterPubliclyPublished } from '@/lib/knowledge/chapter-publication';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import { RepositoryFactory } from '@/services/factory/repository';
import { bootstrapServices } from '@/lib/bootstrap';
import { listPublishedCorrections } from '@/services/editorial/corrections-service';
import type { CanonicalClaim, CanonicalSource } from '@/types/canonical';

export interface ChapterEvidenceCounts {
  claims: number;
  sources: number;
}

/**
 * Count chapter evidence only through explicit canonical relationships.
 * An unrelated chapter appearance, a story slug with the same name, or an ID
 * prefix is not evidence that a claim belongs to this chapter.
 */
export function getChapterEvidenceCounts(
  chapterId: string,
  claims: readonly CanonicalClaim[],
  sources: readonly CanonicalSource[],
): ChapterEvidenceCounts {
  return {
    claims: claims.filter((claim) =>
      claim.appearsIn?.some(
        (appearance) =>
          appearance.contentType === 'chapter' && appearance.contentId === chapterId,
      ),
    ).length,
    sources: sources.filter((source) => source.chapterIds?.includes(chapterId)).length,
  };
}


export interface TrustMetrics {
  publishedChapters: number;
  chaptersInReview: number;
  totalClaims: number;
  primarySourcesCited: number;
  sourcesInRegistry: number;
  evidenceEntries: number;
  documentsReproduced: number;
  thinkersProfiled: number;
  openScholarlyDisagreements: number;
  counterArgumentsDocumented: number;
  correctionsIssued: number;
  chapterOneClaims: number;
  chapterOneSources: number;
  // TASK-25 Dynamic Trust metrics
  averageTrustScore?: number;
  evidenceDebt?: number;
  lastVerifiedDate: string;
}

export async function getCanonicalTrustMetrics(now: Date = new Date()): Promise<TrustMetrics> {
  try {
    seedAll();
    const core = getKnowledgeCore();

    const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
    const libraries = await repo.getAllLibraries();

    let publishedChaptersCount = 0;
    let chaptersInReviewCount = 0;

    for (const lib of libraries) {
      for (const col of lib.collections) {
        for (const vol of col.volumes) {
          for (const chap of vol.chapters) {
            if (isChapterPubliclyPublished(chap, now)) {
              publishedChaptersCount++;
            } else if (chap.status === 'review') {
              chaptersInReviewCount++;
            }
          }
        }
      }
    }


    const allClaims = core.claims.all();
    const totalClaims = allClaims.length;

    const allSources = core.sources.all();
    const sourcesInRegistry = allSources.length;
    const primarySourcesCited = allSources.filter((source) =>
      (source.tier === 1 || (source as any).tier === 't1') &&
      Boolean(
        source.claimIds?.length ||
        source.documentIds?.length ||
        source.chapterIds?.length ||
        source.thinkerIds?.length ||
        source.storyIds?.length ||
        source.datasetIds?.length
      ),
    ).length;

    const allEvidence = core.evidence.all();
    const evidenceEntries = allEvidence.length;

    const allDocuments = core.documents.all();
    const documentsReproduced = allDocuments.length;

    const allThinkers = core.thinkers.all();
    const thinkersProfiled = allThinkers.length;

    const claimsWithDisagreements = allClaims.filter(c => c.counterArguments && c.counterArguments.length > 0);
    const openScholarlyDisagreements = claimsWithDisagreements.length;
    const counterArgumentsDocumented = claimsWithDisagreements.reduce((acc, c) => acc + (c.counterArguments?.length || 0), 0);

    const correctionsIssued = (await listPublishedCorrections()).length;

    const chapterOneEvidence = getChapterEvidenceCounts('kl-ch-1', allClaims, allSources);
    const chap1Claims = chapterOneEvidence.claims;
    const chap1Sources = chapterOneEvidence.sources;

    // 1. Average Trust Score — Restrict to canonical stories
    let averageTrustScore: number | undefined = undefined;
    try {
      const services = bootstrapServices({ publicOnly: true });
      const storiesRes = await services.stories.getPublicStories({ pageSize: 100 });
      const allStories = storiesRes.data;
      const scoreStories = allStories.filter(s => typeof s.evidenceScore === 'number' && s.evidenceScore > 0);
      if (scoreStories.length > 0) {
        averageTrustScore = Math.round(scoreStories.reduce((sum, s) => sum + (s.evidenceScore || 0), 0) / scoreStories.length);
      }
    } catch (e) {
      console.error('Failed to calculate average trust score:', e);
    }

    // 2. Evidence Debt — Filter by canonical status vocabulary
    const evidenceDebt = allClaims.filter(c => c.confidence === 'debated' || c.confidence === 'contested').length;

    // 3. Last Verified Date — Verification timestamps only
    let latestVerificationTime = 0;

    for (const lib of libraries) {
      for (const col of lib.collections) {
        for (const vol of col.volumes) {
          for (const chap of vol.chapters) {
            if (chap.lastVerifiedAt) {
              const ts = new Date(chap.lastVerifiedAt).getTime();
              if (!isNaN(ts) && ts > latestVerificationTime) {
                latestVerificationTime = ts;
              }
            }
          }
        }
      }
    }

    for (const c of allClaims) {
      if (c.lastVerifiedAt) {
        const ts = new Date(c.lastVerifiedAt).getTime();
        if (!isNaN(ts) && ts > latestVerificationTime) {
          latestVerificationTime = ts;
        }
      }
    }

    for (const ev of allEvidence) {
      if (ev.verifiedAt) {
        const ts = new Date(ev.verifiedAt).getTime();
        if (!isNaN(ts) && ts > latestVerificationTime) {
          latestVerificationTime = ts;
        }
      }
    }

    const lastVerifiedDate = latestVerificationTime > 0
      ? new Date(latestVerificationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'NOT VERIFIED';

    return {
      publishedChapters: publishedChaptersCount,
      chaptersInReview: chaptersInReviewCount,
      totalClaims,
      primarySourcesCited,
      sourcesInRegistry,
      evidenceEntries,
      documentsReproduced,
      thinkersProfiled,
      openScholarlyDisagreements,
      counterArgumentsDocumented: counterArgumentsDocumented || openScholarlyDisagreements,
      correctionsIssued,
      chapterOneClaims: chap1Claims,
      chapterOneSources: chap1Sources,
      averageTrustScore,
      evidenceDebt,
      lastVerifiedDate,
    };
  } catch (err) {
    console.error('Failed to aggregate canonical trust metrics:', err);
    return {
      publishedChapters: 0,
      chaptersInReview: 0,
      totalClaims: 0,
      primarySourcesCited: 0,
      sourcesInRegistry: 0,
      evidenceEntries: 0,
      documentsReproduced: 0,
      thinkersProfiled: 0,
      openScholarlyDisagreements: 0,
      counterArgumentsDocumented: 0,
      correctionsIssued: 0,
      chapterOneClaims: 0,
      chapterOneSources: 0,
      averageTrustScore: undefined,
      evidenceDebt: undefined,
      lastVerifiedDate: 'NOT VERIFIED',
    };
  }

}
