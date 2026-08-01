import { describe, it, expect } from 'vitest';
import { Fix } from '../types/canonical';
import { FixGraphEngine, InvalidGraphEdgeError } from '../services/fixes/fix-graph.service';

describe('TEST-GRPH: Fix Knowledge Graph & Taxonomy (Phase 13B.4 Gate D)', () => {
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

  it('TEST-GRPH-01: Generates canonical graph edges from Fix object', () => {
    const edges = FixGraphEngine.generateEdges(validMockFix);
    expect(edges.length).toBeGreaterThan(0);
    expect(edges.some((e) => e.edgeType === 'addresses_problem' && e.targetType === 'STORY')).toBe(true);
    expect(edges.some((e) => e.edgeType === 'cites_source' && e.targetType === 'SOURCE')).toBe(true);
    expect(edges.some((e) => e.edgeType === 'requires_action_by' && e.targetType === 'ENTITY')).toBe(true);
  });

  it('TEST-GRPH-02: Rejects forbidden edge FIX - [addresses_problem] -> FIX', () => {
    expect(() =>
      FixGraphEngine.validateEdge({
        sourceId: 'fix-1',
        sourceType: 'FIX',
        targetId: 'fix-2',
        targetType: 'FIX',
        edgeType: 'addresses_problem',
        direction: 'outgoing',
      })
    ).toThrow(InvalidGraphEdgeError);
  });

  it('TEST-GRPH-03: Rejects forbidden edge FIX - [cites_source] -> STORY', () => {
    expect(() =>
      FixGraphEngine.validateEdge({
        sourceId: 'fix-1',
        sourceType: 'FIX',
        targetId: 'story-1',
        targetType: 'STORY',
        edgeType: 'cites_source',
        direction: 'outgoing',
      })
    ).toThrow(InvalidGraphEdgeError);
  });

  it('TEST-GRPH-04: Rejects circular supersession loop (FixA -> FixA)', () => {
    expect(() =>
      FixGraphEngine.validateEdge({
        sourceId: 'fix-1',
        sourceType: 'FIX',
        targetId: 'fix-1',
        targetType: 'FIX',
        edgeType: 'superseded_by',
        direction: 'outgoing',
      })
    ).toThrow(InvalidGraphEdgeError);
  });

  it('TEST-GRPH-05: Asserts Graph Invariants (Attestation and No Orphan Actions)', () => {
    expect(() => FixGraphEngine.assertGraphInvariants(validMockFix)).not.toThrow();

    const orphanActionFix = { ...validMockFix, responsibleActorIds: [] };
    expect(() => FixGraphEngine.assertGraphInvariants(orphanActionFix)).toThrow(/No Orphan Actions/);
  });
});
