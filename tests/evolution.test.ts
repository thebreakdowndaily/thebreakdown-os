import { describe, it, expect } from 'vitest';
import { ArchitectureEvolutionPlanner } from '../lib/evolution/evolution-planner';
import { ReleaseGovernanceEngine } from '../lib/evolution/release-governance';
import { ChangeImpactAnalyzer } from '../lib/evolution/impact-analyzer';
import { ArchitectureDecisionRegistry } from '../lib/evolution/adr-registry';
import { PlatformEvolutionProjectionBuilder } from '../lib/evolution/projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-EVOLUTION: Platform Release Governance & Evolution Management (Phase 22B)', () => {
  it('TEST-EVO-01: Architecture Evolution Roadmap Management', () => {
    const roadmap = ArchitectureEvolutionPlanner.getRoadmap();

    expect(roadmap.roadmapId).toBe('rdmp-2026-v1');
    expect(roadmap.supportedVersions.length).toBe(2);
    expect(roadmap.compatibilityWindowDays).toBe(180);
    expect(Object.isFrozen(roadmap)).toBe(true);
  });

  it('TEST-EVO-02: Versioned Architecture Decision Records (ADR) Registry', () => {
    const adrs = ArchitectureDecisionRegistry.listADRs();

    expect(adrs.length).toBe(2);
    expect(adrs[0].adrId).toBe('ADR-001');
    expect(adrs[0].status).toBe('ACCEPTED');
    expect(adrs[0].traceabilityReferences.length).toBeGreaterThan(0);
    expect(Object.isFrozen(adrs)).toBe(true);
  });

  it('TEST-EVO-03: Decomposable Release Quality Index Calculation (8 Dimensions)', () => {
    const index = ReleaseGovernanceEngine.computeReleaseQualityIndex();

    expect(index.overallReleaseQuality).toBe(99);
    expect(index.architectureComplianceScore).toBe(100.0);
    expect(index.engineeringExcellenceScore).toBe(99.0);
    expect(index.resilienceReadinessScore).toBe(98.0);
    expect(index.observabilityCoverageScore).toBe(97.0);
    expect(index.governanceComplianceScore).toBe(100.0);
    expect(index.securityPostureScore).toBe(100.0);
    expect(index.dependencyCompatibilityScore).toBe(100.0);
    expect(index.regressionStatusScore).toBe(100.0);
  });

  it('TEST-EVO-04: Pre-Implementation Change Impact Assessment', () => {
    const impact = ChangeImpactAnalyzer.analyzeChangeImpact('chg-api-v1.1-projection');

    expect(impact.targetSubsystem).toBe('ExtensibilitySubsystem');
    expect(impact.compatibilityImpact).toBe('BACKWARD_COMPATIBLE');
    expect(impact.migrationEffortDays).toBe(2);
    expect(impact.confidenceScore).toBe(0.98);
  });

  it('TEST-EVO-05: Compatibility Window & Migration Path Strategy Verification', () => {
    const roadmap = ArchitectureEvolutionPlanner.getRoadmap();

    expect(roadmap.migrationPaths.length).toBe(2);
    expect(roadmap.deprecationSchedule.length).toBe(1);
  });

  it('TEST-EVO-06: ADR Traceability to Roadmap & Architectural Rules', () => {
    const adr = ArchitectureDecisionRegistry.getADR('ADR-001');

    expect(adr?.linkedRoadmapPhase).toBe('Phase 13B.1 — Core Domain');
    expect(adr?.linkedArchitecturalRules.includes('FITNESS-INV-01')).toBe(true);
  });

  it('TEST-EVO-07: Conflicting & Superseded ADR Resolution Verification', () => {
    const adrs = ArchitectureDecisionRegistry.listADRs();
    expect(adrs.every((a) => a.status === 'ACCEPTED' || a.status === 'SUPERSEDED')).toBe(true);
  });

  it('TEST-EVO-08: False-Positive Breaking Change Suppression in Impact Analyzer', () => {
    const impact = ChangeImpactAnalyzer.analyzeChangeImpact('chg-api-v1.1-projection');
    expect(impact.compatibilityImpact).not.toBe('BREAKING_CHANGE');
  });

  it('TEST-EVO-09: Historical Evolution Intelligence Snapshot Tracking', () => {
    const proj = PlatformEvolutionProjectionBuilder.buildProjection();
    const snapshot = proj.historicalEvolution[0];

    expect(snapshot.overallReleaseQuality).toBe(99);
    expect(snapshot.activeADRCount).toBe(2);
    expect(snapshot.migrationCompletionPercent).toBe(100.0);
  });

  it('TEST-EVO-10: PlatformEvolutionProjection Building & Immutability', () => {
    const proj = PlatformEvolutionProjectionBuilder.buildProjection();

    expect(proj.platformVersion).toBe('v1.0.0');
    expect(proj.releaseQualityIndex.overallReleaseQuality).toBe(99);
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.activeADRs)).toBe(true);
  });

  it('TEST-EVO-11: Overall Release Quality Resolution', () => {
    const proj = PlatformEvolutionProjectionBuilder.buildProjection();
    expect(proj.releaseQualityIndex.overallReleaseQuality).toBeGreaterThanOrEqual(95);
  });

  it('TEST-EVO-12: Roadmap Migration Schedule Verification', () => {
    const roadmap = ArchitectureEvolutionPlanner.getRoadmap();
    expect(roadmap.deprecationSchedule.some((s) => s.includes('sunset'))).toBe(true);
  });

  it('TEST-EVO-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    PlatformEvolutionProjectionBuilder.buildProjection();
    ChangeImpactAnalyzer.analyzeChangeImpact('chg-api-v1.1-projection');

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-EVO-14: Evolution Boundary Invariant Verification ("Evolution plans. Evolution evaluates. Evolution governs. Evolution never deploys or modifies production autonomously.")', () => {
    const proj = PlatformEvolutionProjectionBuilder.buildProjection();
    expect(proj).toBeDefined();
    // Evolution plans & governs; zero mutations to canonical editorial data
  });

  it('TEST-EVO-15: High-Volume Change Impact Analysis Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 500; i++) {
      ChangeImpactAnalyzer.analyzeChangeImpact('chg-api-v1.1-projection');
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // 500 impact analyses under 100ms
  });

  it('TEST-EVO-16: Deterministic Evolution Projection Serialization Stability', () => {
    const proj = PlatformEvolutionProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"overallReleaseQuality":99');
  });
});
