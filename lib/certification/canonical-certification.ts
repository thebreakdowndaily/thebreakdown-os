import type { Chapter, Claim, Evidence, Source, KnowledgeLibrary } from '@/types/canonical';
import type { CanonicalEligibilityStatus } from '@/lib/feature-flags';

export interface ValidationIssue {
  layer: 'claim' | 'evidence' | 'source' | 'temporal' | 'presentation';
  severity: 'error' | 'warning';
  targetId?: string;
  message: string;
}

export interface CertificationMetrics {
  totalClaims: number;
  verifiedClaims: number;
  needsVerificationClaims: number;
  totalEvidence: number;
  totalSources: number;
  verifiedClaimRatio: number;
  evidencePerClaimRatio: number;
}

export interface CertificationResult {
  slug: string;
  title: string;
  status: CanonicalEligibilityStatus;
  isCertified: boolean;
  score: number; // 0 - 100
  metrics: CertificationMetrics;
  issues: ValidationIssue[];
}

export class CanonicalCertificationEngine {
  /**
   * Certifies a canonical chapter against the 5 Gold Standard audit dimensions:
   * 1. Claim Validation
   * 2. Evidence Validation
   * 3. Source Validation
   * 4. Temporal Validation
   * 5. Presentation Compatibility
   */
  public static certifyChapter(chapter: Chapter): CertificationResult {
    const issues: ValidationIssue[] = [];

    // 1. Claim Validation
    const claims = chapter.claims || [];
    if (claims.length === 0) {
      issues.push({
        layer: 'claim',
        severity: 'error',
        message: 'Chapter has 0 canonical claims. A minimum of 1 verified claim is required.',
      });
    }

    let verifiedCount = 0;
    let needsVerificationCount = 0;

    claims.forEach((claim, idx) => {
      if (!claim.text || claim.text.trim().length < 10) {
        issues.push({
          layer: 'claim',
          severity: 'error',
          targetId: claim.id || `claim-${idx}`,
          message: `Claim text is empty or too short (${claim.text?.length || 0} chars).`,
        });
      }

      if (typeof claim.confidence !== 'number' || claim.confidence < 0 || claim.confidence > 1) {
        issues.push({
          layer: 'claim',
          severity: 'error',
          targetId: claim.id,
          message: `Invalid confidence score: ${claim.confidence}. Must be between 0.0 and 1.0.`,
        });
      }

      if (claim.status === 'VERIFIED') {
        verifiedCount++;
      } else if (claim.status === 'NEEDS_VERIFICATION') {
        needsVerificationCount++;
        issues.push({
          layer: 'claim',
          severity: 'warning',
          targetId: claim.id,
          message: `Claim status is marked NEEDS_VERIFICATION.`,
        });
      }
    });

    // 2. Evidence Validation
    const evidenceList = chapter.evidence || [];
    claims.forEach((claim) => {
      const linkedEvidence = (claim.evidenceIds || []).map((id) => evidenceList.find((e) => e.id === id)).filter(Boolean);
      if (linkedEvidence.length === 0) {
        issues.push({
          layer: 'evidence',
          severity: 'error',
          targetId: claim.id,
          message: `Claim ${claim.id} has no linked evidence records.`,
        });
      }
    });

    evidenceList.forEach((ev, idx) => {
      if (!ev.description || ev.description.trim().length < 5) {
        issues.push({
          layer: 'evidence',
          severity: 'error',
          targetId: ev.id || `evidence-${idx}`,
          message: `Evidence description is missing or too short.`,
        });
      }
    });

    // 3. Source Validation
    const sources = chapter.sources || [];
    evidenceList.forEach((ev) => {
      if (ev.sourceId) {
        const foundSource = sources.find((s) => s.id === ev.sourceId);
        if (!foundSource) {
          issues.push({
            layer: 'source',
            severity: 'warning',
            targetId: ev.id,
            message: `Evidence points to sourceId '${ev.sourceId}' not found in chapter sources.`,
          });
        }
      }
    });

    sources.forEach((source, idx) => {
      if (!source.title || source.title.trim().length === 0) {
        issues.push({
          layer: 'source',
          severity: 'error',
          targetId: source.id || `source-${idx}`,
          message: `Source title is required.`,
        });
      }
    });

    // 4. Temporal Validation
    if (!chapter.publishedAt || isNaN(Date.parse(chapter.publishedAt))) {
      issues.push({
        layer: 'temporal',
        severity: 'warning',
        message: `Invalid or missing publishedAt date: '${chapter.publishedAt}'.`,
      });
    }

    // 5. Presentation Compatibility
    if (!chapter.title || chapter.title.trim().length === 0) {
      issues.push({
        layer: 'presentation',
        severity: 'error',
        message: `Chapter title is missing.`,
      });
    }

    if (!chapter.summary || chapter.summary.trim().length < 20) {
      issues.push({
        layer: 'presentation',
        severity: 'warning',
        message: `Chapter summary is too short for optimal presentation (< 20 chars).`,
      });
    }

    if (!chapter.blocks || chapter.blocks.length === 0) {
      issues.push({
        layer: 'presentation',
        severity: 'error',
        message: `Chapter contains 0 content blocks.`,
      });
    }

    // Determine status & score
    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');

    const totalClaims = claims.length;
    const verifiedRatio = totalClaims > 0 ? verifiedCount / totalClaims : 0;
    const evidenceRatio = totalClaims > 0 ? evidenceList.length / totalClaims : 0;

    let status: CanonicalEligibilityStatus = 'ELIGIBLE';
    if (errors.length > 0) {
      status = 'BLOCKED';
    } else if (warnings.length > 0 || verifiedRatio < 0.75) {
      status = 'NEEDS_REVIEW';
    }

    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (errors.length === 0 ? 60 : 0) +
          (verifiedRatio * 20) +
          Math.min(evidenceRatio * 10, 15) +
          Math.max(0, 5 - warnings.length)
        )
      )
    );

    return {
      slug: chapter.slug,
      title: chapter.title,
      status,
      isCertified: status === 'ELIGIBLE',
      score,
      metrics: {
        totalClaims,
        verifiedClaims: verifiedCount,
        needsVerificationClaims: needsVerificationCount,
        totalEvidence: evidenceList.length,
        totalSources: sources.length,
        verifiedClaimRatio: Number(verifiedRatio.toFixed(2)),
        evidencePerClaimRatio: Number(evidenceRatio.toFixed(2)),
      },
      issues,
    };
  }

  /**
   * Generates a derived certification matrix across all chapters in the knowledge libraries.
   */
  public static deriveCertificationRegistry(
    libraries: KnowledgeLibrary[]
  ): Record<string, CanonicalEligibilityStatus> {
    const registry: Record<string, CanonicalEligibilityStatus> = {};

    for (const lib of libraries) {
      for (const vol of lib.volumes || []) {
        for (const chap of vol.chapters || []) {
          const result = this.certifyChapter(chap);
          registry[chap.slug] = result.status;
        }
      }
    }

    return registry;
  }
}
