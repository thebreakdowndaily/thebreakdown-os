import { describe, it, expect } from 'vitest';
import { Fix } from '../types/canonical';
import { FixMetadataService } from '../services/fixes/fix-metadata.service';

describe('TEST-META: Fix Canonical Metadata Service (Phase 13B.4 Gate D)', () => {
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
    lastVerified: '2026-07-25T00:00:00Z',
    version: '1.0.0',
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

  it('TEST-META-01: Projects valid Canonical URL', () => {
    const url = FixMetadataService.toCanonicalUrl(validMockFix);
    expect(url).toBe('https://thebreakdown.gov/fix/digital-procurement-audit-trail');
  });

  it('TEST-META-02: Generates Schema.org JSON-LD graph structure', () => {
    const jsonLd = FixMetadataService.toJSONLD(validMockFix);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Legislation');
    expect(jsonLd.name).toBe('Mandatory Real Time E Procurement Auditing');
    expect(jsonLd.url).toBe('https://thebreakdown.gov/fix/digital-procurement-audit-trail');
    expect(jsonLd.citation?.length).toBe(1);
    expect(jsonLd.citation?.[0].name).toBe('Gazette Notification No. 402/2025');
  });

  it('TEST-META-03: Generates OpenGraph Protocol and Twitter Card tags', () => {
    const og = FixMetadataService.toOpenGraph(validMockFix);
    expect(og['og:type']).toBe('article');
    expect(og['og:title']).toContain('Mandatory Real Time E Procurement Auditing');
    expect(og['twitter:card']).toBe('summary_large_image');
    expect(og['twitter:description']).toContain('Evidence Grade: High');
    expect(og.canonicalUrl).toBe('https://thebreakdown.gov/fix/digital-procurement-audit-trail');
  });

  it('TEST-META-04: Generates RIS Bibliographic Citation for EndNote/Zotero', () => {
    const ris = FixMetadataService.toRISCitation(validMockFix);
    expect(ris).toContain('TY  - GOVT');
    expect(ris).toContain('TI  - Mandatory Real Time E Procurement Auditing');
    expect(ris).toContain('UR  - https://thebreakdown.gov/fix/digital-procurement-audit-trail');
    expect(ris).toContain('ER  -');
  });
});
