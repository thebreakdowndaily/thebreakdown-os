// ── TEST-DOM: Fix Domain & Invariants Test Suite (AR-13A.0 Specification) ─

import { describe, it, expect } from 'vitest';
import { FixInvariantsService, FixInvariantError } from '../services/fixes/fix-invariants.service';
import { FixIdentityService } from '../services/fixes/fix-identity.service';
import { FixProjectionService } from '../services/fixes/fix-projection.service';
import { CreateFixDTO } from '../services/fixes/fix-domain.types';
import { Fix } from '../types/canonical';

describe('TEST-DOM: Fix Domain & Invariants', () => {
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
    rootCauses: Object.assign([{ title: 'Opaque Bidding', content: 'Bids filed in physical format without public API access.' }], { title: 'Opaque Bidding', content: 'Bids filed in physical format without public API access.' }),
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
    lastVerified: '2026-07-25T00:00:00Z',
    version: '1.0.0',

    // Legacy fields
    storySlug: 'digital-procurement-investigation',
    publishedAt: '2026-07-25T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z',
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

  it('TEST-DOM-01 (INV-FIX-001): Validates UUIDv4 format requirement', () => {
    const invalidFix = { ...validMockFix, id: 'invalid-id-123' };
    expect(() => FixInvariantsService.assertValid(invalidFix)).toThrow(FixInvariantError);
  });

  it('TEST-DOM-02 (INV-FIX-002): Validates Kebab-case slug requirement', () => {
    const invalidSlugFix = { ...validMockFix, slug: 'Invalid_Slug_With_Caps!' };
    expect(() => FixInvariantsService.assertValid(invalidSlugFix)).toThrow(FixInvariantError);
  });

  it('TEST-DOM-03 (INV-FIX-003): Enforces mandatory source attestation for published status', () => {
    const unsourcedPublishedFix = { ...validMockFix, publicationStatus: 'published' as const, sourceIds: [] };
    expect(() => FixInvariantsService.assertValid(unsourcedPublishedFix)).toThrow(FixInvariantError);
  });

  it('TEST-DOM-04 (INV-FIX-004): Single Parent Claim Ownership rejects empty claim ID linkage', () => {
    const invalidClaimFix = { ...validMockFix, claimIds: [''] };
    expect(() => FixInvariantsService.assertValid(invalidClaimFix)).toThrow(FixInvariantError);
  });

  it('TEST-DOM-05 (INV-FIX-005): Enforces supersession pointer integrity', () => {
    const invalidSupersededFix = { ...validMockFix, publicationStatus: 'superseded' as const, supersededByFixId: undefined };
    expect(() => FixInvariantsService.assertValid(invalidSupersededFix)).toThrow(FixInvariantError);
  });

  it('TEST-DOM-06 (INV-FIX-005): Rejects self-referential supersession pointers', () => {
    const selfSupersededFix = { ...validMockFix, publicationStatus: 'superseded' as const, supersededByFixId: validMockFix.id };
    expect(() => FixInvariantsService.assertValid(selfSupersededFix)).toThrow(FixInvariantError);
  });

  it('TEST-DOM-07 (INV-FIX-006): Rejects Fix missing assigned lifecycle status', () => {
    const noStatusFix = { ...validMockFix, editorialStatus: undefined as any };
    expect(() => FixInvariantsService.assertValid(noStatusFix)).toThrow(FixInvariantError);
  });

  it('TEST-DOM-08 (INV-FIX-007): Rejects Fix with empty responsible actors', () => {
    const noActorFix = { ...validMockFix, responsibleActorIds: [] };
    expect(() => FixInvariantsService.assertValid(noActorFix)).toThrow(FixInvariantError);
  });

  it('TEST-DOM-09 (INV-FIX-008): Neutrality Linter detects prohibited certainty words', () => {
    const biasedFix = { ...validMockFix, summary: 'This reform is obviously the single best solution.' };
    expect(() => FixInvariantsService.assertValid(biasedFix)).toThrow(FixInvariantError);
  });

  it('TEST-DOM-08: FixIdentityService slug generation produces clean kebab-case', () => {
    const slug = FixIdentityService.generateSlug('Mandatory E-Procurement Auditing for Public Works! 2026');
    expect(slug).toBe('mandatory-e-procurement-auditing-for-public-works-2026');
    expect(FixIdentityService.isValidSlug(slug)).toBe(true);
  });

  it('TEST-DOM-09: FixProjectionService separates internal vs public views correctly', () => {
    const internalView = FixProjectionService.toInternalView(validMockFix, { totalEdits: 4, lastEditorId: 'editor-007' });
    expect(internalView.auditTrailSummary.totalEdits).toBe(4);

    const publicView = FixProjectionService.toPublicView(validMockFix);
    expect(publicView.id).toBe(validMockFix.id);
    expect(publicView.slug).toBe(validMockFix.slug);
    expect((publicView as any).auditTrailSummary).toBeUndefined();
  });
});
