import crypto from 'crypto';
import type { Chapter, Claim, Evidence, Source, KnowledgeLibrary } from '@/types/canonical';
import type { CanonicalEligibilityStatus } from '@/lib/feature-flags';
import { getKnowledgeCore, enrichClaimLazy } from '@/lib/knowledge/knowledge-core';

export type ValidationLayer =
  | 'structural'
  | 'provenance'
  | 'evidence_support'
  | 'editorial_verification'
  | 'temporal'
  | 'presentation';

export interface AuditRuleEvaluation {
  ruleId: string;
  layer: ValidationLayer;
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  targetId?: string;
}

export interface DisambiguatedMetrics {
  claimsCount: number;
  verifiedClaimsCount: number;
  needsVerificationCount: number;
  unsupportedClaimsCount: number;
  evidenceObjectsCount: number;
  uniqueSourcesCount: number;
  citationOccurrencesCount: number;
  verifiedClaimRatio: number;
  evidencePerClaimRatio: number;
}

export interface CertificationAuditTrail {
  engineVersion: string;
  certifiedAt: string;
  contentHash: string;
  evaluations: AuditRuleEvaluation[];
}

export interface CertificationResult {
  slug: string;
  title: string;
  status: CanonicalEligibilityStatus;
  isCertified: boolean;
  score: number; // 0 - 100
  contentHash: string;
  certifiedAt: string;
  engineVersion: string;
  metrics: DisambiguatedMetrics;
  auditTrail: CertificationAuditTrail;
  issues: Array<{
    layer: ValidationLayer;
    severity: 'error' | 'warning';
    targetId?: string;
    message: string;
  }>;
}

export class CanonicalCertificationEngine {
  public static readonly ENGINE_VERSION = 'canonical-certification@2.0';

  /**
   * Resolves canonical claims, evidence, and sources from either direct arrays or knowledge core.
   */
  public static resolveChapterKnowledge(chapter: Chapter): {
    claims: Array<{ id: string; text: string; status: string; confidence: number; evidenceIds: string[] }>;
    evidence: Array<{ id: string; description: string; sourceId?: string; strength?: string }>;
    sources: Array<{ id: string; title: string; url?: string; tier?: number }>;
    blocks: any[];
  } {
    const blocks = chapter.blocks || chapter.content || [];
    
    // Check if direct claims exist
    if (chapter.claims && chapter.claims.length > 0) {
      return {
        claims: chapter.claims.map((c) => ({
          id: c.id,
          text: c.text,
          status: c.status || 'VERIFIED',
          confidence: typeof c.confidence === 'number' ? c.confidence : 0.8,
          evidenceIds: c.evidenceIds || [],
        })),
        evidence: (chapter.evidence || []).map((e) => ({
          id: e.id,
          description: e.description,
          sourceId: e.sourceId,
          strength: e.strength,
        })),
        sources: (chapter.sources || []).map((s) => ({
          id: s.id,
          title: s.title,
          url: s.url,
          tier: s.tier,
        })),
        blocks,
      };
    }

    // Resolve from inline content claim blocks & Knowledge Core
    const inlineClaimIds = blocks
      .filter((b: any) => b.type === 'claim' && b.data?.claimId)
      .map((b: any) => b.data.claimId as string);

    const core = getKnowledgeCore();
    const conceptClaimIds = chapter.relatedConceptIds?.flatMap((cid) => core.claims.byConcept(cid)).map((c) => c.id) || [];
    const allClaimIds = Array.from(new Set([...conceptClaimIds, ...inlineClaimIds]));

    const enrichedClaims = allClaimIds.map((id) => enrichClaimLazy(id)).filter(Boolean) as any[];

    const claims = enrichedClaims.map((ec) => {
      const evList = ec._evidence || ec.evidence || [];
      return {
        id: ec.id,
        text: ec.statement,
        status: ec.confidence === 'established' ? 'VERIFIED' : ec.confidence === 'debated' ? 'NEEDS_VERIFICATION' : 'UNSUPPORTED',
        confidence: ec.confidence === 'established' ? 0.9 : ec.confidence === 'debated' ? 0.6 : 0.4,
        evidenceIds: evList.map((e: any) => e.id),
      };
    });

    const evidenceMap = new Map<string, any>();
    const sourcesMap = new Map<string, any>();

    enrichedClaims.forEach((ec) => {
      const evList = ec._evidence || ec.evidence || [];
      const srcList = ec._sources || ec.sources || [];

      evList.forEach((ev: any) => {
        evidenceMap.set(ev.id, {
          id: ev.id,
          description: ev.excerpt || ev.description || '',
          sourceId: ev.sourceId || srcList[0]?.id,
          strength: ev.strength,
        });
      });
      srcList.forEach((src: any) => {
        sourcesMap.set(src.id, {
          id: src.id,
          title: src.title,
          url: src.url,
          tier: src.tier,
        });
      });
    });

    return {
      claims,
      evidence: Array.from(evidenceMap.values()),
      sources: Array.from(sourcesMap.values()),
      blocks,
    };
  }

  /**
   * Computes a deterministic SHA-256 hash of canonical content to detect changes.
   */
  public static computeContentHash(chapter: Chapter): string {
    const { claims, evidence, sources, blocks } = this.resolveChapterKnowledge(chapter);
    const payload = {
      slug: chapter.slug,
      claims,
      evidence,
      sources,
      blocksCount: blocks.length,
    };
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
  }

  /**
   * Evaluates a chapter across all 5 verification layers:
   * Layer 1: Structural Validation
   * Layer 2: Provenance & Source Authority
   * Layer 3: Evidence Support Validation
   * Layer 4: Editorial Verification Classification
   * Layer 5: Presentation Contract
   */
  public static certifyChapter(chapter: Chapter): CertificationResult {
    const evaluations: AuditRuleEvaluation[] = [];
    const issues: CertificationResult['issues'] = [];

    const { claims, evidence: evidenceList, sources, blocks } = this.resolveChapterKnowledge(chapter);

    // --- Layer 1: Structural Validation ---
    if (claims.length === 0) {
      evaluations.push({
        ruleId: 'STRUC-001',
        layer: 'structural',
        name: 'Claim Minimum Count',
        status: 'FAIL',
        message: 'Chapter must contain at least 1 canonical claim.',
      });
      issues.push({
        layer: 'structural',
        severity: 'error',
        message: 'Chapter has 0 canonical claims.',
      });
    } else {
      evaluations.push({
        ruleId: 'STRUC-001',
        layer: 'structural',
        name: 'Claim Minimum Count',
        status: 'PASS',
        message: `Found ${claims.length} claims.`,
      });
    }

    let verifiedCount = 0;
    let needsVerificationCount = 0;
    let unsupportedCount = 0;

    claims.forEach((claim, idx) => {
      const claimId = claim.id || `claim-${idx}`;
      
      // Text validity
      if (!claim.text || claim.text.trim().length < 10) {
        evaluations.push({
          ruleId: 'STRUC-002',
          layer: 'structural',
          name: 'Claim Text Validity',
          status: 'FAIL',
          targetId: claimId,
          message: `Claim text is empty or too short (${claim.text?.length || 0} chars).`,
        });
        issues.push({
          layer: 'structural',
          severity: 'error',
          targetId: claimId,
          message: `Claim text is empty or too short.`,
        });
      }

      // Confidence score bounds
      if (typeof claim.confidence !== 'number' || claim.confidence < 0 || claim.confidence > 1) {
        evaluations.push({
          ruleId: 'STRUC-003',
          layer: 'structural',
          name: 'Claim Confidence Range',
          status: 'FAIL',
          targetId: claimId,
          message: `Confidence ${claim.confidence} out of range [0.0, 1.0].`,
        });
        issues.push({
          layer: 'structural',
          severity: 'error',
          targetId: claimId,
          message: `Confidence ${claim.confidence} is invalid.`,
        });
      }

      // Layer 4: Editorial Verification
      if (claim.status === 'VERIFIED') {
        verifiedCount++;
      } else if (claim.status === 'NEEDS_VERIFICATION') {
        needsVerificationCount++;
        evaluations.push({
          ruleId: 'EDIT-001',
          layer: 'editorial_verification',
          name: 'Claim Verification State',
          status: 'WARN',
          targetId: claimId,
          message: `Claim is pending fact-check review (NEEDS_VERIFICATION).`,
        });
        issues.push({
          layer: 'editorial_verification',
          severity: 'warning',
          targetId: claimId,
          message: `Claim ${claimId} status is NEEDS_VERIFICATION.`,
        });
      } else if (claim.status === 'UNSUPPORTED') {
        unsupportedCount++;
        evaluations.push({
          ruleId: 'EDIT-002',
          layer: 'editorial_verification',
          name: 'Unsupported Claim',
          status: 'FAIL',
          targetId: claimId,
          message: `Claim marked as UNSUPPORTED by fact-checking audit.`,
        });
        issues.push({
          layer: 'editorial_verification',
          severity: 'error',
          targetId: claimId,
          message: `Claim ${claimId} is UNSUPPORTED and cannot be published.`,
        });
      }
    });

    // --- Layer 2 & 3: Evidence Support & Provenance Validation ---
    let citationOccurrences = 0;

    claims.forEach((claim) => {
      const linkedEvidence = (claim.evidenceIds || [])
        .map((id) => evidenceList.find((e) => e.id === id))
        .filter(Boolean);

      if (linkedEvidence.length === 0) {
        evaluations.push({
          ruleId: 'EVID-001',
          layer: 'evidence_support',
          name: 'Claim Evidence Linkage',
          status: 'FAIL',
          targetId: claim.id,
          message: `Claim ${claim.id} has 0 linked evidence records.`,
        });
        issues.push({
          layer: 'evidence_support',
          severity: 'error',
          targetId: claim.id,
          message: `Claim ${claim.id} lacks supporting evidence linkage.`,
        });
      } else {
        citationOccurrences += linkedEvidence.length;
      }
    });

    evidenceList.forEach((ev, idx) => {
      const evId = ev.id || `evidence-${idx}`;
      if (!ev.description || ev.description.trim().length < 5) {
        evaluations.push({
          ruleId: 'EVID-002',
          layer: 'evidence_support',
          name: 'Evidence Content Description',
          status: 'FAIL',
          targetId: evId,
          message: `Evidence description is missing or insufficient.`,
        });
        issues.push({
          layer: 'evidence_support',
          severity: 'error',
          targetId: evId,
          message: `Evidence ${evId} description is missing or insufficient.`,
        });
      }

      // Provenance: Source Reference
      if (ev.sourceId) {
        const found = sources.find((s) => s.id === ev.sourceId);
        if (!found) {
          evaluations.push({
            ruleId: 'PROV-001',
            layer: 'provenance',
            name: 'Source Existence',
            status: 'WARN',
            targetId: evId,
            message: `Evidence references missing source '${ev.sourceId}'.`,
          });
          issues.push({
            layer: 'provenance',
            severity: 'warning',
            targetId: evId,
            message: `Evidence points to missing sourceId '${ev.sourceId}'.`,
          });
        }
      }
    });

    sources.forEach((source, idx) => {
      const srcId = source.id || `source-${idx}`;
      if (!source.title || source.title.trim().length === 0) {
        evaluations.push({
          ruleId: 'PROV-002',
          layer: 'provenance',
          name: 'Source Title Required',
          status: 'FAIL',
          targetId: srcId,
          message: `Source has no title.`,
        });
        issues.push({
          layer: 'provenance',
          severity: 'error',
          targetId: srcId,
          message: `Source ${srcId} is missing title.`,
        });
      }
    });

    // --- Layer 5: Presentation Contract & Temporal ---
    const pubDate = chapter.publishedAt || chapter.createdAt || chapter.lastVerifiedAt;
    if (!pubDate || isNaN(Date.parse(pubDate))) {
      evaluations.push({
        ruleId: 'TEMP-001',
        layer: 'temporal',
        name: 'Publication Date',
        status: 'WARN',
        message: `Missing or invalid published/created date.`,
      });
      issues.push({
        layer: 'temporal',
        severity: 'warning',
        message: `Invalid or missing published/created date.`,
      });
    }

    if (!chapter.title || chapter.title.trim().length === 0) {
      evaluations.push({
        ruleId: 'PRES-001',
        layer: 'presentation',
        name: 'Presentation Title',
        status: 'FAIL',
        message: 'Chapter title is missing.',
      });
      issues.push({
        layer: 'presentation',
        severity: 'error',
        message: 'Chapter title is missing.',
      });
    }

    if (!blocks || blocks.length === 0) {
      evaluations.push({
        ruleId: 'PRES-002',
        layer: 'presentation',
        name: 'Presentation Content Blocks',
        status: 'FAIL',
        message: 'Chapter contains 0 content blocks.',
      });
      issues.push({
        layer: 'presentation',
        severity: 'error',
        message: 'Chapter contains 0 content blocks.',
      });
    }

    // Determine status & metrics
    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');

    const totalClaims = claims.length;
    const verifiedRatio = totalClaims > 0 ? verifiedCount / totalClaims : 0;
    const evidenceRatio = totalClaims > 0 ? evidenceList.length / totalClaims : 0;

    let status: CanonicalEligibilityStatus = 'ELIGIBLE';
    if (errors.length > 0 || unsupportedCount > 0) {
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
          (verifiedRatio * 25) +
          Math.min(evidenceRatio * 10, 10) +
          Math.max(0, 5 - warnings.length)
        )
      )
    );

    const contentHash = this.computeContentHash(chapter);
    const certifiedAt = new Date().toISOString();

    return {
      slug: chapter.slug,
      title: chapter.title,
      status,
      isCertified: status === 'ELIGIBLE',
      score,
      contentHash,
      certifiedAt,
      engineVersion: this.ENGINE_VERSION,
      metrics: {
        claimsCount: totalClaims,
        verifiedClaimsCount: verifiedCount,
        needsVerificationCount,
        unsupportedClaimsCount: unsupportedCount,
        evidenceObjectsCount: evidenceList.length,
        uniqueSourcesCount: sources.length,
        citationOccurrencesCount: citationOccurrences,
        verifiedClaimRatio: Number(verifiedRatio.toFixed(2)),
        evidencePerClaimRatio: Number(evidenceRatio.toFixed(2)),
      },
      auditTrail: {
        engineVersion: this.ENGINE_VERSION,
        certifiedAt,
        contentHash,
        evaluations,
      },
      issues,
    };
  }

  /**
   * Verifies if an existing certification record remains valid against the live chapter content.
   * If any content has changed or if the engine version mismatches, returns false.
   */
  public static isCertificationValid(chapter: Chapter, previousCertification: CertificationResult): boolean {
    if (previousCertification.engineVersion !== this.ENGINE_VERSION) return false;
    const currentHash = this.computeContentHash(chapter);
    return currentHash === previousCertification.contentHash && previousCertification.status === 'ELIGIBLE';
  }

  /**
   * Generates a derived certification matrix across all chapters in the knowledge libraries.
   */
  public static deriveCertificationRegistry(
    libraries: KnowledgeLibrary[]
  ): Record<string, CanonicalEligibilityStatus> {
    const registry: Record<string, CanonicalEligibilityStatus> = {};

    for (const lib of libraries) {
      for (const col of lib.collections || []) {
        for (const vol of col.volumes || []) {
          for (const chap of vol.chapters || []) {
            const result = this.certifyChapter(chap);
            registry[chap.slug] = result.status;
          }
        }
      }
    }

    return registry;
  }
}
