import { seedAll, getKnowledgeCore } from '@/lib/knowledge/knowledge-core';
import { isPubliclyPublished } from '@/lib/story/publication';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import { RepositoryFactory } from '@/services/factory/repository';
import { bootstrapServices } from '@/lib/bootstrap';
import { getServiceClient } from '@/supabase/client';
import type { CanonicalClaim, CanonicalSource } from '@/types/canonical';

export interface TrustMetrics {
  publishedChapters?: number;
  chaptersInReview?: number;
  totalClaims?: number;
  primarySourcesCited?: number;
  sourcesInRegistry?: number;
  evidenceEntries?: number;
  documentsReproduced?: number;
  thinkersProfiled?: number;
  openScholarlyDisagreements?: number;
  counterArgumentsDocumented?: number;
  correctionsIssued?: number;
  chapterOneClaims?: number;
  chapterOneSources?: number;
  // TASK-25 Dynamic Trust metrics
  averageTrustScore?: number;
  evidenceDebt?: number;
  lastVerifiedDate: string;
}

const FOUNDING_CHAPTER_ID = 'kl-ch-1';

/** Count only claims explicitly associated with the founding chapter. */
export function countChapterOneClaims(
  claims: ReadonlyArray<Pick<CanonicalClaim, 'appearsIn'>>,
): number {
  return claims.filter((claim) =>
    claim.appearsIn.some((appearance) => appearance.contentId === FOUNDING_CHAPTER_ID),
  ).length;
}

/** Count only sources explicitly associated with the founding chapter. */
export function countChapterOneSources(
  sources: ReadonlyArray<Pick<CanonicalSource, 'chapterIds'>>,
): number {
  return sources.filter((source) => source.chapterIds.includes(FOUNDING_CHAPTER_ID)).length;
}

/**
 * Read the authoritative correction ledger. A verified zero is a number;
 * a failed/unavailable query is undefined so the UI can distinguish them.
 */
export async function getCanonicalCorrectionCount(): Promise<number | undefined> {
  try {
    const { count, error } = await getServiceClient()
      .from('corrections')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return typeof count === 'number' ? count : undefined;
  } catch (error) {
    console.error('Failed to load canonical correction count:', error);
    return undefined;
  }
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
            const pubCtx = {
              publicationStatus: (chap.status === 'published' ? 'published' : (chap as any).publicationStatus) as any,
              publishedAt: (chap as any).publishedAt || chap.createdAt,
            };
            if (chap.status === 'published' || (chap.status === 'verified' && isPubliclyPublished(pubCtx, now))) {
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
    const primarySourcesCited = allSources.filter(s => s.tier === 1 || (s as any).tier === 't1').length;

    const allEvidence = core.evidence.all();
    const evidenceEntries = allEvidence.length;

    const allDocuments = core.documents.all();
    const documentsReproduced = allDocuments.length;

    const allThinkers = core.thinkers.all();
    const thinkersProfiled = allThinkers.length;

    const claimsWithDisagreements = allClaims.filter(c => c.counterArguments && c.counterArguments.length > 0);
    const openScholarlyDisagreements = claimsWithDisagreements.length;
    const counterArgumentsDocumented = claimsWithDisagreements.reduce((acc, c) => acc + (c.counterArguments?.length || 0), 0);

    const correctionsIssued = await getCanonicalCorrectionCount();

    const chap1Claims = countChapterOneClaims(allClaims);
    const chap1Sources = countChapterOneSources(allSources);

    // 1. Average Trust Score — Restrict to canonical stories
    let averageTrustScore: number | undefined = undefined;
    try {
      const services = bootstrapServices({ publicOnly: true });
      const storiesRes = await services.stories.getStories({ pageSize: 100 });
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
      counterArgumentsDocumented,
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
      // Do not turn a failed aggregation into a wall of false zeroes.
      publishedChapters: undefined,
      chaptersInReview: undefined,
      totalClaims: undefined,
      primarySourcesCited: undefined,
      sourcesInRegistry: undefined,
      evidenceEntries: undefined,
      documentsReproduced: undefined,
      thinkersProfiled: undefined,
      openScholarlyDisagreements: undefined,
      counterArgumentsDocumented: undefined,
      correctionsIssued: undefined,
      chapterOneClaims: undefined,
      chapterOneSources: undefined,
      averageTrustScore: undefined,
      evidenceDebt: undefined,
      lastVerifiedDate: 'NOT VERIFIED',
    };
  }

}
