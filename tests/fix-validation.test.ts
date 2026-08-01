import { describe, it, expect } from 'vitest';
import { Fix } from '../types/canonical';
import { FixValidationEngine } from '../services/fixes/fix-validation.service';

describe('TEST-VAL: Fix Validation Engine (Phase 13B.2 Gate B)', () => {
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

  it('TEST-VAL-01: Valid Fix returns isValid = true and zero errors', () => {
    const report = FixValidationEngine.validate(validMockFix);
    expect(report.isValid).toBe(true);
    expect(report.canPublish).toBe(true);
    expect(report.errorsCount).toBe(0);
  });

  it('TEST-VAL-02 (VAL-ID-01): Detects invalid UUID format', () => {
    const invalidFix = { ...validMockFix, id: 'invalid-id' };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-ID-01')).toBe(true);
  });

  it('TEST-VAL-03 (VAL-ID-02): Detects invalid slug format', () => {
    const invalidFix = { ...validMockFix, slug: 'Invalid_Slug!' };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-ID-02')).toBe(true);
  });

  it('TEST-VAL-04 (VAL-ID-03): Detects duplicate slug collision', () => {
    const report = FixValidationEngine.validate(validMockFix, { existingSlugs: [validMockFix.slug] });
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-ID-03')).toBe(true);
  });

  it('TEST-VAL-05 (VAL-ID-04): Rejects invalid primaryCategory enum', () => {
    const invalidFix = { ...validMockFix, primaryCategory: 'invalid_category' as any };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-ID-04')).toBe(true);
  });

  it('TEST-VAL-06 (VAL-EVD-01): Rejects published Fix with zero sources', () => {
    const invalidFix = { ...validMockFix, publicationStatus: 'published' as const, sourceIds: [] };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-EVD-01')).toBe(true);
  });

  it('TEST-VAL-07 (VAL-EVD-03): Neutral Language validator catches certainty words', () => {
    const invalidFix = { ...validMockFix, summary: 'This policy is obviously superior in every aspect.' };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-EVD-03')).toBe(true);
  });

  it('TEST-VAL-08 (VAL-EVD-04): Triggers WARNING for missing uncertainty callouts', () => {
    const fixNoUncertainty = { ...validMockFix, unknownsAndGaps: [] };
    const report = FixValidationEngine.validate(fixNoUncertainty);
    expect(report.isValid).toBe(true); // Warning is non-blocking
    expect(report.warningsCount).toBeGreaterThan(0);
    expect(report.issues.some((i) => i.validatorId === 'VAL-EVD-04')).toBe(true);
  });

  it('TEST-VAL-09 (VAL-MCH-01): Rejects Fix missing responsible actor IDs', () => {
    const invalidFix = { ...validMockFix, responsibleActorIds: [] };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-MCH-01')).toBe(true);
  });

  it('TEST-VAL-10 (VAL-MCH-02): Rejects Fix missing disadvantaged groups', () => {
    const invalidFix = { ...validMockFix, disadvantagedGroups: [] };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-MCH-02')).toBe(true);
  });

  it('TEST-VAL-11 (VAL-MCH-03): Rejects Fix with incomplete fiscalCost', () => {
    const invalidFix = { ...validMockFix, fiscalCost: { amount: '', currency: '', timeframe: '', fundingMechanism: '', category: 'CapEx' as const } };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-MCH-03')).toBe(true);
  });

  it('TEST-VAL-12 (VAL-MCH-04): Rejects Fix missing success metrics', () => {
    const invalidFix = { ...validMockFix, successMetrics: [] };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-MCH-04')).toBe(true);
  });

  it('TEST-VAL-13 (VAL-LC-01): Rejects un-audited Fix from transitioning to published', () => {
    const report = FixValidationEngine.validate(validMockFix, { goldStandardAudited: false });
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-LC-01')).toBe(true);
  });

  it('TEST-VAL-14 (VAL-LC-02): Rejects superseded Fix missing supersededByFixId pointer', () => {
    const invalidFix = { ...validMockFix, publicationStatus: 'superseded' as const, supersededByFixId: undefined };
    const report = FixValidationEngine.validate(invalidFix);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.validatorId === 'VAL-LC-02')).toBe(true);
  });

  it('TEST-VAL-15 (VAL-LC-03): Triggers WARNING for audit verification older than 180 days', () => {
    const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
    const oldFix = { ...validMockFix, lastVerified: oldDate };
    const report = FixValidationEngine.validate(oldFix);
    expect(report.isValid).toBe(true); // Non-blocking warning
    expect(report.issues.some((i) => i.validatorId === 'VAL-LC-03')).toBe(true);
  });
});
