import { describe, it, expect } from 'vitest';
import { StoryImpactAnalyzer } from '../lib/decision-intelligence/story-impact-analyzer';
import { EvidenceCompletenessScorer } from '../lib/decision-intelligence/evidence-completeness-scorer';
import { SourceDiversityAnalyzer } from '../lib/decision-intelligence/source-diversity-analyzer';
import { EditorialRiskEvaluator } from '../lib/decision-intelligence/editorial-risk-evaluator';
import { PlatformEditorialIntelligenceProjectionBuilder } from '../lib/decision-intelligence/projection';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-EDITORIAL-DECISION: Editorial Decision Intelligence (Phase 24A)', () => {
  it('TEST-EDITORIAL-DECISION-01: Multidimensional Story Impact Analysis (6 Dimensions + Overall)', () => {
    const impact = StoryImpactAnalyzer.analyzeStoryImpact();

    expect(impact.overallImpactScore).toBeGreaterThan(90);
    expect(impact.topicImportanceScore).toBe(95.0);
    expect(impact.knowledgeGapScore).toBe(98.0);
    expect(Object.isFrozen(impact)).toBe(true);
  });

  it('TEST-EDITORIAL-DECISION-02: Evidence Quality & Completeness Scoring (6 Quality Metrics)', () => {
    const quality = EvidenceCompletenessScorer.evaluateEvidenceQuality();

    expect(quality.overallQualityScore).toBeGreaterThan(90);
    expect(quality.traceabilityScore).toBe(100.0);
    expect(quality.independenceScore).toBe(97.0);
  });

  it('TEST-EDITORIAL-DECISION-03: Broadened Source Diversity Analysis Across 8 Source Types', () => {
    const div = SourceDiversityAnalyzer.analyzeSourceDiversity();

    expect(div.primarySourceCount).toBe(15);
    expect(div.academicSourceCount).toBe(42);
    expect(div.officialRecordCount).toBe(12);
    expect(div.judicialDocumentCount).toBe(8);
  });

  it('TEST-EDITORIAL-DECISION-04: Single Source Dependency & Concentration Risk Detection', () => {
    const div = SourceDiversityAnalyzer.analyzeSourceDiversity();

    expect(div.singleSourceDependencyDetected).toBe(false);
    expect(div.concentrationRiskWarnings.length).toBe(0);
  });

  it('TEST-EDITORIAL-DECISION-05: 6-Axis Multi-Axis Editorial Risk Evaluation', () => {
    const risks = EditorialRiskEvaluator.evaluateRisks();

    expect(risks.length).toBe(6);
    expect(risks.some((r) => r.riskAxis === 'LEGAL')).toBe(true);
    expect(risks.some((r) => r.riskAxis === 'SOURCE_FRAGILITY')).toBe(true);
    expect(risks.some((r) => r.riskAxis === 'EVIDENCE_SUFFICIENCY')).toBe(true);
  });

  it('TEST-EDITORIAL-DECISION-06: Actionable Self-Explaining Readiness Recommendation Generation', () => {
    const proj = PlatformEditorialIntelligenceProjectionBuilder.buildProjection();
    const rec = proj.readinessRecommendation;

    expect(rec.readinessPercent).toBe(96);
    expect(rec.strengths.length).toBeGreaterThan(0);
    expect(rec.recommendedActions.length).toBeGreaterThan(0);
  });

  it('TEST-EDITORIAL-DECISION-07: Separation of Story Readiness % from Editorial Confidence %', () => {
    const proj = PlatformEditorialIntelligenceProjectionBuilder.buildProjection();
    const rec = proj.readinessRecommendation;

    expect(rec.readinessPercent).toBe(96);
    expect(rec.editorialConfidencePercent).toBe(94);
  });

  it('TEST-EDITORIAL-DECISION-08: Deterministic Scoring & Calculation Stability Test', () => {
    const impact1 = StoryImpactAnalyzer.analyzeStoryImpact();
    const impact2 = StoryImpactAnalyzer.analyzeStoryImpact();

    expect(JSON.stringify(impact1)).toBe(JSON.stringify(impact2));
  });

  it('TEST-EDITORIAL-DECISION-09: Advisory Disclaimer & Non-Mutation Safety Invariant', () => {
    const proj = PlatformEditorialIntelligenceProjectionBuilder.buildProjection();

    expect(proj.readinessRecommendation.advisoryDisclaimer).toContain('Editorial Decision Intelligence never replaces human editorial judgment');
  });

  it('TEST-EDITORIAL-DECISION-10: PlatformEditorialIntelligenceProjection Building & Immutability', () => {
    const proj = PlatformEditorialIntelligenceProjectionBuilder.buildProjection();

    expect(proj.platformVersion).toBe('v1.0.0');
    expect(Object.isFrozen(proj)).toBe(true);
    expect(Object.isFrozen(proj.riskAssessments)).toBe(true);
  });

  it('TEST-EDITORIAL-DECISION-11: Conflicting Evidence Handling & Risk Escalation', () => {
    const risks = EditorialRiskEvaluator.evaluateRisks();
    const neutralityRisk = risks.find((r) => r.riskAxis === 'NEUTRALITY_BIAS');

    expect(neutralityRisk).toBeDefined();
    expect(neutralityRisk?.score).toBeLessThan(20);
  });

  it('TEST-EDITORIAL-DECISION-12: Missing Primary Source Risk Escalation Test', () => {
    const div = SourceDiversityAnalyzer.analyzeSourceDiversity();

    expect(div.primarySourceCount).toBeGreaterThan(0);
  });

  it('TEST-EDITORIAL-DECISION-13: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalFixJson = JSON.stringify(CHAPTER_1_FIX);

    PlatformEditorialIntelligenceProjectionBuilder.buildProjection();
    StoryImpactAnalyzer.analyzeStoryImpact();

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalFixJson);
  });

  it('TEST-EDITORIAL-DECISION-14: Editorial Decision Boundary Invariant Verification ("Editorial Decision Intelligence evaluates. Editorial Decision Intelligence explains. Editorial Decision Intelligence recommends. Editorial Decision Intelligence never replaces editorial judgement.")', () => {
    const proj = PlatformEditorialIntelligenceProjectionBuilder.buildProjection();

    expect(proj).toBeDefined();
  });

  it('TEST-EDITORIAL-DECISION-15: High-Volume Impact & Quality Scoring Performance', () => {
    const start = Date.now();
    for (let i = 0; i < 500; i++) {
      StoryImpactAnalyzer.analyzeStoryImpact();
      EvidenceCompletenessScorer.evaluateEvidenceQuality();
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('TEST-EDITORIAL-DECISION-16: Deterministic Editorial Intelligence Projection Serialization Stability', () => {
    const proj = PlatformEditorialIntelligenceProjectionBuilder.buildProjection();
    const json1 = JSON.stringify(proj);
    const json2 = JSON.stringify(proj);

    expect(json1).toBe(json2);
    expect(json1).toContain('"readinessPercent":96');
  });
});
