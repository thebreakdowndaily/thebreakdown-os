import { describe, it, expect } from 'vitest';
import { Fix } from '../types/canonical';
import { EvidenceNetworkService } from '../services/intelligence/evidence-network.service';
import { EditorialIntelligenceService } from '../services/intelligence/editorial-intelligence.service';
import { KnowledgeGapService } from '../services/intelligence/knowledge-gap.service';
import { ConflictAnalysisService } from '../services/intelligence/conflict-analysis.service';
import { EditorialDashboardProjection } from '../services/intelligence/editorial-dashboard.service';
import { ResearchSupportService } from '../services/intelligence/research-support.service';

describe('TEST-INTEL: Editorial Intelligence & Evidence Network (Phase 14B Gate 14B)', () => {
  const validMockFix: Fix = {
    id: '123e4567-e89b-42d3-a456-426614174000',
    slug: 'digital-procurement-audit-trail',
    title: 'Mandatory Real Time E Procurement Auditing',
    headline: 'Mandatory Real Time E Procurement Auditing',
    summary: 'Systemic administrative reform mandating automated gazette logging.',
    primaryCategory: 'administrative',
    secondaryCategories: ['technological'],
    editorialStatus: 'draft',
    publicationStatus: 'published',
    maturityStatus: 'proposed',
    problemStatement: 'Lack of transparency in municipal tender allocations.',
    rootCauses: [{ title: 'Opaque Bidding', content: 'Bids filed in physical format without public API access.' }],
    recommendedActions: [{ title: 'Deploy Open API Audit', description: 'Require real time gazette publication.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Finance'] }],
    responsibleActorIds: ['org-min-finance-001'],
    beneficiaryGroups: ['Urban Commuters', 'Taxpayers'],
    disadvantagedGroups: ['Informal Bidders'],
    fiscalCost: { amount: '1000000', currency: 'INR', timeframe: '1 Year', fundingMechanism: 'Budget Allocation', category: 'CapEx' },
    timeToImpact: 'short-term',
    tradeOffs: [{ dimension: 'Transparency vs Speed', advantage: 'Reduces corruption', disadvantage: 'Increases initial vetting time', affectedParties: ['Contractors'] }],
    risksAndFailures: [{ risk: 'System Downtime', impact: 'medium', mitigation: 'Redundant regional servers' }],
    evidenceGrade: 'High',
    unknownsAndGaps: [{ category: 'missing_data', description: 'No baseline data on sub-district tenders.', mitigationOrGap: 'Pilot in 2 districts.' }],
    successMetrics: [{ name: 'Audit Compliance Rate', currentValue: '15%', targetValue: '95%', dataSource: 'CAG Report', updateFrequency: 'Quarterly' }],
    sourceIds: ['src-gazette-402-2025'],
    sources: [{ id: 'src-gazette-402-2025', title: 'Gazette Notification No. 402/2025', url: 'https://data.gov.in/gazette/402-2025', accessedAt: '2026-07-25T00:00:00Z', tier: 1 }],
    lastVerified: new Date().toISOString(),
    version: '1.0.0',
    storySlug: 'digital-procurement-investigation',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readingTime: 5,
    author: { name: 'Editorial Bureau', role: 'Research Analyst' },
    evidenceScore: 92,
    tags: ['procurement', 'audit'],
    problem: { title: 'Opaque Bidding', content: 'Lack of transparency in municipal tender allocations.' },
    whoIsAffected: { title: 'Affected Groups', content: 'Taxpayers and urban contractors.' },
    evidence: { title: 'Evidentiary Basis', content: 'CAG Audit findings.' },
    stakeholders: [{ name: 'Ministry of Finance', type: 'government', role: 'Regulator', interest: 'Fiscal integrity' }],
    existingSolutions: [{ name: 'Manual Audits', description: 'Annual CAG reviews.', status: 'active', effectiveness: 'medium' }],
    globalExamples: [{ country: 'Estonia', policy: 'e-Estonia Tender Portal', description: 'Automated procurement publishing.', outcome: 'Corruption reduced by 40%' }],
    citizenActions: [{ title: 'File RTI', description: 'Request tender logs.', priority: 'medium', timeframe: 'short-term', actors: ['Citizens'] }],
    governmentActions: [{ title: 'Mandate API Gazette', description: 'Issue executive order.', priority: 'high', timeframe: 'immediate', actors: ['Ministry of Finance'] }],
    metricsToTrack: [{ name: 'Audit Compliance Rate', currentValue: '15%', targetValue: '95%', dataSource: 'CAG Report', updateFrequency: 'Quarterly' }],
  };

  const unsourcedFix: Fix = {
    ...validMockFix,
    id: '223e4567-e89b-42d3-a456-426614174001',
    slug: 'unsourced-policy-draft',
    sourceIds: [],
    sources: [],
    successMetrics: [],
    publicationStatus: 'draft',
  };

  it('TEST-INTEL-01: EvidenceNetworkService analyzes evidence chains and attestations', () => {
    const net = EvidenceNetworkService.analyzeEvidenceNetwork(validMockFix);
    expect(net.rootFixId).toBe(validMockFix.id);
    expect(net.supportingChains.length).toBeGreaterThan(0);
    expect(net.supportingChains[0].sourceTier).toBe(1);
    expect(net.supportingChains[0].chainStrength).toBe('STRONG');
  });

  it('TEST-INTEL-02: EditorialIntelligenceService generates derived EditorialInsight[]', () => {
    const insights = EditorialIntelligenceService.generateInsights(validMockFix);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.some((i) => i.category === 'COMPLETENESS')).toBe(true);
    expect(insights.some((i) => i.category === 'CONFIDENCE')).toBe(true);
  });

  it('TEST-INTEL-03: KnowledgeGapService detects gaps in un-sourced or metric-less Fixes', () => {
    const gaps = KnowledgeGapService.detectGaps([validMockFix, unsourcedFix]);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.some((g) => g.type === 'UNSUPPORTED_FIX')).toBe(true);
    expect(gaps.some((g) => g.type === 'MISSING_DATASET')).toBe(true);
  });

  it('TEST-INTEL-04: ConflictAnalysisService detects grade incompatibility and missing pointers', () => {
    const brokenPointerFix: Fix = {
      ...validMockFix,
      id: '323e4567-e89b-42d3-a456-426614174002',
      publicationStatus: 'superseded',
      supersededByFixId: 'non-existent-fix-id',
    };

    const report = ConflictAnalysisService.analyzeConflicts([validMockFix, unsourcedFix, brokenPointerFix]);
    expect(report.conflictsCount).toBeGreaterThan(0);
    expect(report.conflicts.some((c) => c.conflictType === 'SUPERSEDED_LEGISLATION')).toBe(true);
  });

  it('TEST-INTEL-05: EditorialDashboardProjection aggregates operational metrics', () => {
    const dashboard = EditorialDashboardProjection.projectDashboard([validMockFix, unsourcedFix]);
    expect(dashboard.evidenceHealthIndex).toBeDefined();
    expect(dashboard.publicationReadinessScore).toBeDefined();
    expect(dashboard.topInsights.length).toBeGreaterThan(0);
  });

  it('TEST-INTEL-06: ResearchSupportService generates assistance recommendations', () => {
    const recs = ResearchSupportService.generateRecommendations(validMockFix, [unsourcedFix]);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.some((r) => r.category === 'RELATED_READING')).toBe(true);
    expect(recs.some((r) => r.category === 'RECOMMENDED_EXPERT')).toBe(true);
  });

  it('TEST-INTEL-07: Determinism & Non-Mutation Verification', () => {
    const originalJson = JSON.stringify(validMockFix);

    // Call all intelligence services twice
    const insightsA = EditorialIntelligenceService.generateInsights(validMockFix);
    const insightsB = EditorialIntelligenceService.generateInsights(validMockFix);
    expect(insightsA).toEqual(insightsB);

    const gapsA = KnowledgeGapService.detectGaps([validMockFix]);
    const gapsB = KnowledgeGapService.detectGaps([validMockFix]);
    expect(gapsA).toEqual(gapsB);

    // Assert input Fix object remains completely untouched (zero mutation)
    expect(JSON.stringify(validMockFix)).toBe(originalJson);
  });
});
