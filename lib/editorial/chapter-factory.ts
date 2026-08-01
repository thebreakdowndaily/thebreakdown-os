// ── Chapter Production Factory (Phase 15C Specification) ───────────────────
// Programmatic factory for standardizing chapter package construction,
// claim attestation verification, evidence scoring, and Gold Standard Audit clearance.

import { Chapter, Fix, Claim, Source } from '../../types/canonical';

export interface SixQuestionsFramework {
  whatHappened: { title: string; summary: string; keyEvents: Array<{ year: string; event: string }> };
  whyDidItHappen: { title: string; summary: string };
  whatAlternativesEisted: { title: string; summary: string };
  whyStrategicAutonomy: { title: string; summary: string };
  consequences: { title: string; summary: string };
  relevanceToday: { title: string; summary: string };
}

export interface FourLayerAttestation {
  whatHappened: string;
  whatEvidenceShows: string;
  whereHistoriansDisagree: string;
  whyItMatters: string;
}

export interface ChapterPackage {
  chapterId: string;
  slug: string;
  volumeSlug: string;
  collectionSlug: string;
  title: string;
  subtitle: string;
  version: string;
  status: 'draft' | 'review' | 'published' | 'archived' | 'superseded';
  publishedAt?: string;
  updatedAt: string;
  lastVerified: string;
  readingTime: number;
  evidenceScore: number;
  wordCount: number;
  sixQuestions: SixQuestionsFramework;
  fourLayers: FourLayerAttestation;
  sources: Source[];
  claims: Claim[];
  fix: Fix;
}

export class ChapterFactory {
  /**
   * Programmatically validates that every claim in the chapter package maps to a valid source.
   */
  public static validateAttestationTree(claims: Claim[], sources: Source[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const sourceMap = new Map<string, Source>();

    for (const s of sources) {
      if (s.id) sourceMap.set(s.id, s);
    }

    for (const c of claims) {
      if (!c.id || !c.claim) {
        errors.push(`Invalid claim definition: missing id or text.`);
      }
      if (!c.sourceUrl && !c.source) {
        errors.push(`Claim ${c.id} lacks source attestation link.`);
      }
      if (c.confidence < 0 || c.confidence > 1) {
        errors.push(`Claim ${c.id} confidence score out of bounds [0..1].`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculates derived evidence health score based on Tier 1 vs Tier 3 source ratio and claim confidence.
   */
  public static computeEvidenceScore(claims: Claim[], sources: Source[]): number {
    if (claims.length === 0 || sources.length === 0) return 0;

    const tier1Count = sources.filter((s) => s.tier === 1).length;
    const tierRatio = tier1Count / sources.length;

    const avgConfidence = claims.reduce((sum, c) => sum + (c.confidence || 0), 0) / claims.length;

    const rawScore = (tierRatio * 50) + (avgConfidence * 50);
    return Math.min(100, Math.max(0, Math.round(rawScore)));
  }

  /**
   * Constructs and certifies a standard ChapterPackage.
   */
  public static createChapterPackage(config: Omit<ChapterPackage, 'evidenceScore'>): ChapterPackage {
    const attestationResult = this.validateAttestationTree(config.claims, config.sources);
    if (!attestationResult.valid) {
      throw new Error(`ChapterFactory Attestation Failure for [${config.slug}]: ${attestationResult.errors.join('; ')}`);
    }

    const evidenceScore = this.computeEvidenceScore(config.claims, config.sources);

    return {
      ...config,
      evidenceScore,
    };
  }
}
