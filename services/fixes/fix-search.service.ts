// ── Fix Search Projection & Scoring Engine (AR-13A.0 Specification) ─────────

import { Fix } from '../../types/canonical';
import { FixFilterParams, PublicFixViewModel } from './fix-domain.types';
import { FixProjectionService } from './fix-projection.service';

export interface FixSearchDocument {
  id: string;
  slug: string;
  title: string;
  summary: string;
  problemStatement: string;
  primaryCategory: string;
  publicationStatus: string;
  maturityStatus: string;
  evidenceGrade: string;
  responsibleActorIds: string[];
  sourceIds: string[];
  lastVerified: string;
  textTokens: string;
  model: PublicFixViewModel;
}

export interface SearchHit<T> {
  item: T;
  score: number;
  evidenceMultiplier: number;
  maturityMultiplier: number;
}

export interface SearchFacetCounts {
  primaryCategory: Record<string, number>;
  maturityStatus: Record<string, number>;
  evidenceGrade: Record<string, number>;
  publicationStatus: Record<string, number>;
}

export class FixSearchEngine {
  /**
   * Projects a canonical Fix into a weighted search document.
   */
  public static projectToSearchDocument(fix: Fix): FixSearchDocument {
    const rootCausesArray = Array.isArray(fix.rootCauses)
      ? fix.rootCauses
      : fix.rootCauses
      ? [fix.rootCauses]
      : [];
    const rootCausesText = rootCausesArray.map((r) => `${r.title} ${r.content}`).join(' ');
    const actionsText = (fix.recommendedActions || []).map((a) => `${a.title} ${a.description}`).join(' ');

    const title = fix.title || fix.headline || '';
    const summary = fix.summary || '';
    const problemStatement = fix.problemStatement || '';

    const textTokens = `${title} ${fix.slug} ${summary} ${problemStatement} ${rootCausesText} ${actionsText}`.toLowerCase();

    return {
      id: fix.id,
      slug: fix.slug,
      title,
      summary,
      problemStatement,
      primaryCategory: fix.primaryCategory || 'administrative',
      publicationStatus: fix.publicationStatus || 'draft',
      maturityStatus: fix.maturityStatus || 'proposed',
      evidenceGrade: fix.evidenceGrade || 'Moderate',
      responsibleActorIds: fix.responsibleActorIds || [],
      sourceIds: fix.sourceIds || [],
      lastVerified: fix.lastVerified || new Date().toISOString(),
      textTokens,
      model: FixProjectionService.toPublicView(fix),
    };
  }

  /**
   * Computes evidence grade multiplier E(F).
   */
  public static getEvidenceMultiplier(evidenceGrade?: string): number {
    switch (evidenceGrade) {
      case 'High':
        return 1.3;
      case 'Moderate':
        return 1.1;
      case 'Experimental':
      case 'Low':
        return 1.0;
      case 'Contested':
        return 0.9;
      default:
        return 1.0;
    }
  }

  /**
   * Computes maturity multiplier M(F).
   */
  public static getMaturityMultiplier(maturityStatus?: string): number {
    switch (maturityStatus) {
      case 'Measured':
      case 'Implemented':
        return 1.2;
      case 'Pilot':
        return 1.1;
      case 'Proposed':
      case 'Idea':
        return 1.0;
      case 'Archived':
        return 0.3;
      default:
        return 1.0;
    }
  }

  /**
   * Scores a Fix search document against a query string.
   */
  public static scoreDocument(doc: FixSearchDocument, query?: string): SearchHit<PublicFixViewModel> {
    let baseScore = 1.0;

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      const terms = q.split(/\s+/);

      for (const term of terms) {
        if (doc.title.toLowerCase().includes(term)) {
          baseScore += 10.0;
        }
        if (doc.slug.toLowerCase().includes(term)) {
          baseScore += 8.0;
        }
        if (doc.summary.toLowerCase().includes(term)) {
          baseScore += 6.0;
        }
        if (doc.problemStatement.toLowerCase().includes(term)) {
          baseScore += 5.0;
        }
        if (doc.textTokens.includes(term)) {
          baseScore += 3.0;
        }
      }
    }

    const evidenceMultiplier = this.getEvidenceMultiplier(doc.evidenceGrade);
    const maturityMultiplier = this.getMaturityMultiplier(doc.maturityStatus);
    const supersessionPenalty = doc.publicationStatus === 'superseded' ? 0.1 : 1.0;

    const finalScore = baseScore * evidenceMultiplier * maturityMultiplier * supersessionPenalty;

    return {
      item: doc.model,
      score: finalScore,
      evidenceMultiplier,
      maturityMultiplier,
    };
  }

  /**
   * Executes faceted search over an array of Fix objects.
   */
  public static search(
    fixes: Fix[],
    filter?: FixFilterParams,
    options?: { publicOnly?: boolean }
  ): { hits: SearchHit<PublicFixViewModel>[]; facets: SearchFacetCounts; total: number } {
    let filtered = fixes;

    // Public Draft Exclusion Invariant
    if (options?.publicOnly) {
      filtered = filtered.filter((f) => f.publicationStatus === 'published');
    }

    if (filter) {
      if (filter.publicationStatus) {
        filtered = filtered.filter((f) => f.publicationStatus === filter.publicationStatus);
      }
      if (filter.primaryCategory) {
        filtered = filtered.filter((f) => f.primaryCategory === filter.primaryCategory);
      }
      if (filter.maturityStatus) {
        filtered = filtered.filter((f) => f.maturityStatus === filter.maturityStatus);
      }
      if (filter.evidenceGrade) {
        filtered = filtered.filter((f) => f.evidenceGrade === filter.evidenceGrade);
      }
      if (filter.responsibleActorId) {
        filtered = filtered.filter((f) => f.responsibleActorIds?.includes(filter.responsibleActorId!));
      }
      if (filter.sourceId) {
        filtered = filtered.filter((f) => f.sourceIds?.includes(filter.sourceId!));
      }
    }

    // Build Facet Counts
    const facets: SearchFacetCounts = {
      primaryCategory: {},
      maturityStatus: {},
      evidenceGrade: {},
      publicationStatus: {},
    };

    for (const f of filtered) {
      const cat = f.primaryCategory || 'administrative';
      facets.primaryCategory[cat] = (facets.primaryCategory[cat] || 0) + 1;

      const mat = f.maturityStatus || 'proposed';
      facets.maturityStatus[mat] = (facets.maturityStatus[mat] || 0) + 1;

      const evd = f.evidenceGrade || 'Moderate';
      facets.evidenceGrade[evd] = (facets.evidenceGrade[evd] || 0) + 1;

      const pub = f.publicationStatus || 'draft';
      facets.publicationStatus[pub] = (facets.publicationStatus[pub] || 0) + 1;
    }

    // Score & Rank Hits
    const docs = filtered.map((f) => this.projectToSearchDocument(f));
    const hits = docs
      .map((d) => this.scoreDocument(d, filter?.searchQuery))
      .sort((a, b) => b.score - a.score);

    return {
      hits,
      facets,
      total: hits.length,
    };
  }
}
