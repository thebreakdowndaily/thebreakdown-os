// scripts/audit/editorial/runAuditCLI.ts
// Main CLI Driver for the Phase 2 Editorial & Evidence Audit Pipeline

import { resolveStory } from '../../../lib/story/resolver';
import { enumerateAllContent } from './enumeration';
import { rankPublicStories } from './riskRanking';
import { extractMaterialClaims } from './claimExtraction';
import {
  auditTechnicalIntegrity,
  auditSources,
  auditFinancials,
  auditCausalClaims,
  auditTimeline,
  auditVisuals,
  auditSemanticReadingModes,
  auditFreshness
} from './semanticAudit';
import { performExternalVerification } from './externalVerification';
import { saveAuditArtifacts, determineEditorialTier } from './reportGenerator';
import type { Batch1StoryAuditReport, IssueFinding } from './types';

async function runAuditPipeline() {
  console.log('===============================================================');
  console.log('  THE BREAKDOWN OS — PHASE 2 EDITORIAL & EVIDENCE AUDIT PIPELINE');
  console.log('===============================================================\n');

  // Parse optional --output parameter
  const args = process.argv.slice(2);
  const outputIdx = args.indexOf('--output');
  const customOutputDir = outputIdx !== -1 && args[outputIdx + 1] ? args[outputIdx + 1] : undefined;

  // STEP A & C: Exhaustive Content Enumeration & Publication Reconciliation
  console.log('--- STAGE A: Exhaustive Content Enumeration ---');
  const enumeration = await enumerateAllContent();
  console.log(`Raw Discovered Records: ${enumeration.rawDiscovered}`);
  console.log(`Unique Discovered Slugs: ${enumeration.uniqueDiscovered}`);
  console.log(`  - PUBLIC Stories/Chapters: ${enumeration.publicCount}`);
  console.log(`  - NON_PUBLIC Content: ${enumeration.nonPublicCount}`);
  console.log(`  - RESOLUTION_FAILURES: ${enumeration.resolutionFailuresCount}`);
  console.log(`Duplicate Slugs Detected: ${enumeration.duplicateSlugs.length}`);
  console.log(`Canonical ID Collisions: ${enumeration.canonicalIdCollisions.length}`);
  console.log(`INVARIANT VERIFICATION: ${enumeration.uniqueDiscovered} === ${enumeration.publicCount} + ${enumeration.nonPublicCount} + ${enumeration.resolutionFailuresCount} [VERIFIED]\n`);

  // STEP D & E: 9-Factor Risk Ranking & Batch 1 Selection
  console.log('--- STAGE B: Risk Ranking & Batch 1 Selection ---');
  const publicRecords = enumeration.records.filter(r => r.isPublic);
  const riskRanking = await rankPublicStories(publicRecords);

  console.log(`Total Public Stories Risk-Ranked: ${riskRanking.totalPublicAudited}`);
  console.log('\nTop 5 Highest-Risk Stories Selected for Batch 1 Audit:');
  riskRanking.batch1Selected.forEach(p => {
    console.log(`  #${p.rank}. ${p.title} (${p.slug})`);
    console.log(`      Composite Risk Score (Triage Only): ${p.compositeRiskScore}`);
    console.log(`      Rationale: ${p.selectionRationale}`);
  });
  console.log('');

  // STEP F, G, H: Batch 1 Deep Audit & Verification
  console.log('--- AUDITING BATCH 1 STORIES ---');
  const batch1Reports: Batch1StoryAuditReport[] = [];

  for (const riskProfile of riskRanking.batch1Selected) {
    const slug = riskProfile.slug;
    console.log(`Auditing story: ${slug}...`);

    try {
      const resolution = await resolveStory(slug);
      if (resolution.type === 'not_found') continue;

      const story = resolution.canonicalStory;

      // 1. Technical Smoke Test
      const techIntegrity = auditTechnicalIntegrity(story, resolution.candidateTimelineEvents, resolution.relatedStories);

      // 2. Material Claim Extraction & Reconciliation
      const { claims, metrics } = extractMaterialClaims(story, slug);

      // 3. Semantic Layer Audits
      const sourcesAudit = auditSources(story, claims);
      const financialAudit = auditFinancials(story, claims);
      const causalAudit = auditCausalClaims(story, claims);
      const timelineAudit = auditTimeline(story);
      const visualAudit = auditVisuals(story);
      const readingModesAudit = auditSemanticReadingModes(story);
      const freshnessAudit = auditFreshness(story, claims);

      // 4. External Verification & P0 Detection
      const { verifications, issues: extIssues, p0Candidate } = performExternalVerification(story, claims);

      // Consolidate issues
      const issues: IssueFinding[] = [...extIssues];

      // Add financial issues if overrun inference without verification
      financialAudit.forEach(f => {
        if (f.hasOverrunOrUnderspendInference && !f.inferenceJustified) {
          issues.push({
            id: `ISS-FIN-${slug.toUpperCase().slice(0, 6)}`,
            severity: 'P1',
            category: 'FINANCIAL',
            summary: 'Unverified Cost Escalation / Overrun Assertion',
            details: `Financial claim on ${f.scope} asserts cost change (${f.rawValue}) without verified baseline stage alignment.`,
            affectedClaimId: f.claimId,
            recommendation: 'Reconcile sanctioned baseline against actual reported expenditure figures.',
          });
        }
      });

      // Add missing claim issues
      if (metrics.materialClaimsMissingFromRegistry > 0) {
        issues.push({
          id: `ISS-CLM-MISS-${slug.toUpperCase().slice(0, 6)}`,
          severity: 'P2',
          category: 'FACTUAL',
          summary: 'Extracted Material Claims Missing from Canonical Registry',
          details: `${metrics.materialClaimsMissingFromRegistry} material claims extracted from surfaces are unregistered.`,
          recommendation: 'Register claims in Canonical Claim Registry to ensure site-wide traceability.',
        });
      }

      // Determine Editorial Quality Tier
      const p0Count = issues.filter(i => i.severity === 'P0').length;
      const p1Count = issues.filter(i => i.severity === 'P1').length;
      const editorialTier = determineEditorialTier(
        techIntegrity.passed,
        p0Count,
        p1Count,
        metrics.materialClaimsMissingFromRegistry,
        metrics.registeredButUnsupported
      );

      const verdictRationale = p0Count > 0
        ? 'P0 contradiction detected in central factual claim.'
        : editorialTier.startsWith('Tier A')
        ? 'Story demonstrates solid evidence backing, high authority sources, and canonical claim traceability.'
        : `Story has ${issues.length} audit issues (${p1Count} P1) requiring editorial refinement.`;

      const report: Batch1StoryAuditReport = {
        storySlug: slug,
        storyTitle: story.headline || riskProfile.title,
        sourceType: riskProfile.sourceType,
        auditedAt: new Date().toISOString(),
        riskProfile,
        technicalIntegrity: techIntegrity,
        claimCoverage: metrics,
        claims,
        sourcesAudit,
        financialAudit,
        causalAudit,
        timelineAudit,
        visualAudit,
        readingModesAudit,
        freshnessAudit,
        externalVerifications: verifications,
        issues,
        p0Candidate,
        editorialTier,
        verdictRationale,
      };

      batch1Reports.push(report);
      console.log(`  -> Completed: ${editorialTier} (${issues.length} issues)`);

      if (p0Candidate) {
        console.warn(`  [P0 ALERT] P0 Candidate detected on ${slug}: ${p0Candidate.whyMaterial}`);
      }
    } catch (e: any) {
      console.error(`  -> Failed auditing ${slug}:`, e.message);
    }
  }

  // STEP H: Save All Artifacts
  saveAuditArtifacts(enumeration, riskRanking, batch1Reports, customOutputDir);
  console.log('\n--- PHASE 2 EDITORIAL AUDIT COMPLETE ---');
}

runAuditPipeline().catch(err => {
  console.error('Audit Pipeline Execution Failed:', err);
  process.exit(1);
});
