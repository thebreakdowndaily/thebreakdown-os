// ── Public Publication Domain Service (Phase 17A Domain Security Rule) ─────────
// Enforces strict public-only filtering at the service layer.
// Guarantees zero leakage of draft, review, or unpublished objects to public surfaces.

import { Fix } from '../../types/canonical';
import { VolumeRegistryService } from '../../lib/editorial/volume-1-chapters';
import { ChapterPackage } from '../../lib/editorial/chapter-factory';
import { FixSearchEngine, SearchHit } from '../fixes/fix-search.service';
import { PublicFixViewModel } from '../fixes/fix-domain.types';

export class PublicPublicationService {
  /**
   * Filters and returns strictly published Chapter packages for public surfaces.
   */
  public static getPublicChapters(): ChapterPackage[] {
    return VolumeRegistryService.getPublishedChapters().filter(
      (c) => c.status === 'published'
    );
  }

  /**
   * Resolves a single published chapter by slug. Fails (returns null) for unpublished/drafts.
   */
  public static getPublicChapterBySlug(slug: string): ChapterPackage | null {
    const pkg = VolumeRegistryService.getChapterBySlug(slug);
    if (!pkg || pkg.status !== 'published') {
      return null;
    }
    return pkg;
  }

  /**
   * Executes public BM25 search enforcing public-only draft exclusion invariants.
   */
  public static searchPublicKnowledge(
    fixes: Fix[],
    query: string
  ): { hits: SearchHit<PublicFixViewModel>[]; total: number } {
    // 1. Domain security guard: Filter out any non-published items before search
    const publicFixes = fixes.filter((f) => f.publicationStatus === 'published');
    const searchRes = FixSearchEngine.search(publicFixes, undefined, { publicOnly: true });
    
    // Filter hits by query string if present
    let filteredHits = searchRes.hits;
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      filteredHits = searchRes.hits.filter(
        (h) =>
          h.item.title.toLowerCase().includes(q) ||
          h.item.summary.toLowerCase().includes(q) ||
          h.item.slug.toLowerCase().includes(q)
      );
    }

    return {
      hits: filteredHits,
      total: filteredHits.length,
    };
  }
}
