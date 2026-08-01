// scripts/audit/editorial/reportGenerator.ts
// Formats and serializes master reports and per-story audit artifacts into audit_reports/editorial/

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  EnumerationSummary,
  RiskRankingReport,
  Batch1StoryAuditReport,
  QualityTier
} from './types';

export function determineEditorialTier(
  techIntegrity: boolean,
  p0Count: number,
  p1Count: number,
  missingClaimsCount: number,
  unsupportedClaimsCount: number
): QualityTier {
  if (!techIntegrity || p0Count > 0) {
    return 'Tier D — Unacceptable / P0 Risk';
  }
  if (p1Count > 2 || missingClaimsCount > 5 || unsupportedClaimsCount > 3) {
    return 'Tier C — Substantial Editorial Debt';
  }
  if (p1Count > 0 || missingClaimsCount > 0 || unsupportedClaimsCount > 0) {
    return 'Tier B — Solid with Minor Gaps';
  }
  return 'Tier A — Defensible';
}

export function saveAuditArtifacts(
  enumeration: EnumerationSummary,
  riskRanking: RiskRankingReport,
  batch1Reports: Batch1StoryAuditReport[],
  customOutputDir?: string
) {
  const baseDir = customOutputDir || join(process.cwd(), 'audit_reports', 'editorial');
  const batch1Dir = join(baseDir, 'batch1');

  if (!existsSync(baseDir)) mkdirSync(baseDir, { recursive: true });
  if (!existsSync(batch1Dir)) mkdirSync(batch1Dir, { recursive: true });

  // 1. Master Enumeration JSON
  writeFileSync(
    join(baseDir, 'master_enumeration.json'),
    JSON.stringify(enumeration, null, 2),
    'utf-8'
  );

  // 2. Risk Ranking Reports
  writeFileSync(
    join(baseDir, 'risk_ranking_report.json'),
    JSON.stringify(riskRanking, null, 2),
    'utf-8'
  );

  let riskMarkdown = `# Phase 2 Editorial Audit — Content Risk Ranking Report\n\n`;
  riskMarkdown += `**Generated At**: ${riskRanking.generatedAt}\n`;
  riskMarkdown += `**Total Public Items Scanned**: ${riskRanking.totalPublicAudited}\n\n`;
  riskMarkdown += `### Triage Methodology\n${riskRanking.methodology}\n\n`;
  riskMarkdown += `## Batch 1 Selected Stories (Top 5 Priority)\n\n`;

  riskRanking.batch1Selected.forEach(p => {
    riskMarkdown += `### #${p.rank}. ${p.title} (\`${p.slug}\`)\n`;
    riskMarkdown += `- **Source Type**: ${p.sourceType}\n`;
    riskMarkdown += `- **Composite Risk Score (Triage Only)**: ${p.compositeRiskScore}\n`;
    riskMarkdown += `- **Selection Rationale**: ${p.selectionRationale}\n`;
    riskMarkdown += `- **Factor Breakdown**:\n`;
    Object.values(p.factors).forEach(f => {
      riskMarkdown += `  - **${f.name}**: ${f.score}/10 (${f.indicatorType}) — *${f.rationale}*\n`;
    });
    riskMarkdown += `\n`;
  });

  riskMarkdown += `## Complete Public Set Priority Queue\n\n`;
  riskMarkdown += `| Rank | Title | Slug | Source Type | Triage Risk Score | Category |\n`;
  riskMarkdown += `|---|---|---|---|---|---|\n`;
  riskRanking.fullRanking.forEach(p => {
    riskMarkdown += `| #${p.rank} | ${p.title} | \`${p.slug}\` | ${p.sourceType} | ${p.compositeRiskScore} | ${p.selectionCategory} |\n`;
  });

  writeFileSync(join(baseDir, 'risk_ranking_report.md'), riskMarkdown, 'utf-8');

  // 3. Batch 1 Master Matrix
  writeFileSync(
    join(baseDir, 'batch1_master_matrix.json'),
    JSON.stringify(batch1Reports, null, 2),
    'utf-8'
  );

  let matrixMarkdown = `# Phase 2 Editorial Audit — Batch 1 Master Audit Matrix\n\n`;
  matrixMarkdown += `**Generated At**: ${new Date().toISOString()}\n`;
  matrixMarkdown += `**Audited Stories Count**: ${batch1Reports.length}\n\n`;

  matrixMarkdown += `## Audit Summary Table\n\n`;
  matrixMarkdown += `| Story Title | Slug | Tier | Tech Pass | Material Claims | Reg Claims | Missing Reg | Source Concerns | Issues (P0/P1/P2) | Ext Verification |\n`;
  matrixMarkdown += `|---|---|---|---|---|---|---|---|---|---|\n`;

  batch1Reports.forEach(r => {
    const p0 = r.issues.filter(i => i.severity === 'P0').length;
    const p1 = r.issues.filter(i => i.severity === 'P1').length;
    const p2 = r.issues.filter(i => i.severity === 'P2').length;
    const extStatus = r.externalVerifications.every(v => v.conclusion === 'SUPPORTED') ? 'FULL' : 'PARTIAL';

    matrixMarkdown += `| ${r.storyTitle} | \`${r.storySlug}\` | **${r.editorialTier}** | ${r.technicalIntegrity.passed ? '✅' : '❌'} | ${r.claimCoverage.confirmedMaterialClaims} | ${r.claimCoverage.registeredCanonicalClaims} | ${r.claimCoverage.materialClaimsMissingFromRegistry} | ${r.sourcesAudit.filter(s => s.authorityScore === 'LOW').length} | ${p0}/${p1}/${p2} | ${extStatus} |\n`;
  });

  matrixMarkdown += `\n## Per-Story Detailed Audit Breakdown\n\n`;

  batch1Reports.forEach(r => {
    matrixMarkdown += `### ${r.storyTitle} (\`${r.storySlug}\`)\n`;
    matrixMarkdown += `- **Editorial Verdict**: **${r.editorialTier}**\n`;
    matrixMarkdown += `- **Verdict Rationale**: ${r.verdictRationale}\n`;
    matrixMarkdown += `- **Technical Integrity Smoke Test**: ${r.technicalIntegrity.passed ? 'PASSED' : 'FAILED'}\n`;
    matrixMarkdown += `- **Claim Coverage**: ${r.claimCoverage.confirmedMaterialClaims} material claims extracted, ${r.claimCoverage.registeredCanonicalClaims} registered in canonical database, ${r.claimCoverage.materialClaimsMissingFromRegistry} missing from registry.\n`;
    matrixMarkdown += `- **Source & Evidence**: ${r.sourcesAudit.length} sources audited. ${r.sourcesAudit.filter(s => s.authorityScore === 'HIGH').length} Tier 1 / High Authority.\n`;
    matrixMarkdown += `- **Financial Audits**: ${r.financialAudit.length} monetary/numeric statements inspected.\n`;
    matrixMarkdown += `- **Causal Claims**: ${r.causalAudit.length} causal statements evaluated.\n`;
    matrixMarkdown += `- **Issues Identified**: ${r.issues.length} total issues (${r.issues.filter(i => i.severity === 'P0').length} P0, ${r.issues.filter(i => i.severity === 'P1').length} P1, ${r.issues.filter(i => i.severity === 'P2').length} P2).\n\n`;

    // Write individual story JSON & Markdown reports
    writeFileSync(
      join(batch1Dir, `${r.storySlug}_report.json`),
      JSON.stringify(r, null, 2),
      'utf-8'
    );

    let storyMarkdown = `# Editorial & Evidence Audit Report — ${r.storyTitle}\n\n`;
    storyMarkdown += `**Slug**: \`${r.storySlug}\`  \n`;
    storyMarkdown += `**Source Type**: ${r.sourceType}  \n`;
    storyMarkdown += `**Audit Date**: ${r.auditedAt}  \n`;
    storyMarkdown += `**Editorial Classification**: **${r.editorialTier}**  \n\n`;
    storyMarkdown += `> **Verdict Rationale**: ${r.verdictRationale}\n\n`;

    storyMarkdown += `## 1. Technical Integrity Smoke Test\n`;
    storyMarkdown += `- Quick Mode: ${r.technicalIntegrity.quickModePass ? 'PASS' : 'FAIL'}\n`;
    storyMarkdown += `- Standard Mode: ${r.technicalIntegrity.standardModePass ? 'PASS' : 'FAIL'}\n`;
    storyMarkdown += `- Deep Mode: ${r.technicalIntegrity.deepModePass ? 'PASS' : 'FAIL'}\n\n`;

    storyMarkdown += `## 2. Claim Inventory & Registry Reconciliation\n`;
    storyMarkdown += `- Confirmed Material Claims Extracted: ${r.claimCoverage.confirmedMaterialClaims}\n`;
    storyMarkdown += `- Registered Canonical Claims: ${r.claimCoverage.registeredCanonicalClaims}\n`;
    storyMarkdown += `- Evidence-Linked Registered Claims: ${r.claimCoverage.registeredAndEvidenceLinked}\n`;
    storyMarkdown += `- Material Claims Missing From Registry: ${r.claimCoverage.materialClaimsMissingFromRegistry}\n\n`;

    storyMarkdown += `### Extracted Material Claims Detail\n`;
    r.claims.forEach(c => {
      storyMarkdown += `- **[${c.id}]** (\`${c.surface}\`) *${c.claimText}*\n`;
      storyMarkdown += `  - Type: ${c.claimType} | Registered Match: ${c.canonicalClaimId ? c.canonicalClaimId : 'None (Unregistered)'} | Support: ${c.supportStrength}\n`;
    });
    storyMarkdown += `\n`;

    storyMarkdown += `## 3. Authoritative External Verification\n`;
    r.externalVerifications.forEach(v => {
      storyMarkdown += `- **Claim**: *${v.claimText}*\n`;
      storyMarkdown += `  - Cited Source: ${v.citedSource}\n`;
      storyMarkdown += `  - Authoritative Benchmark Source: ${v.authoritativeVerificationSource} (Tier ${v.sourceHierarchyTier})\n`;
      storyMarkdown += `  - Conclusion: **${v.conclusion}**\n`;
      storyMarkdown += `  - Comparison Detail: ${v.comparisonDetails}\n\n`;
    });

    storyMarkdown += `## 4. Issues & Action Items\n`;
    if (r.issues.length === 0) {
      storyMarkdown += `*No actionable editorial issues detected.*\n\n`;
    } else {
      r.issues.forEach(i => {
        storyMarkdown += `- **[${i.severity}] ${i.category}**: ${i.summary}\n`;
        storyMarkdown += `  - *Details*: ${i.details}\n`;
        storyMarkdown += `  - *Recommendation*: ${i.recommendation}\n\n`;
      });
    }

    writeFileSync(join(batch1Dir, `${r.storySlug}_report.md`), storyMarkdown, 'utf-8');
  });

  writeFileSync(join(baseDir, 'batch1_master_matrix.md'), matrixMarkdown, 'utf-8');

  console.log(`\nAudit artifacts successfully written to: ${baseDir}`);
}
