import { describe, it, expect } from 'vitest';
import { Fix } from '../types/canonical';
import {
  FixWorkflowEngine,
  FixWorkflowTransitionError,
  WorkflowActor,
} from '../services/fixes/fix-workflow.service';

describe('TEST-WFL: Fix Workflow & Audit Engine (Phase 13B.3 Gate C)', () => {
  const mockActor: WorkflowActor = {
    actorId: 'usr-editor-001',
    actorName: 'Lead Editor',
    role: 'editor',
  };

  const validMockFix: Fix = {
    id: '123e4567-e89b-42d3-a456-426614174000',
    slug: 'digital-procurement-audit-trail',
    title: 'Mandatory Real Time E Procurement Auditing',
    headline: 'Mandatory Real Time E Procurement Auditing',
    summary: 'Systemic administrative reform mandating automated gazette logging.',
    primaryCategory: 'administrative',
    secondaryCategories: ['technological'],
    editorialStatus: 'draft',
    publicationStatus: 'draft',
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

  it('TEST-WFL-01: Validates legal transition matrix steps', () => {
    expect(FixWorkflowEngine.isTransitionAllowed('draft', 'research')).toBe(true);
    expect(FixWorkflowEngine.isTransitionAllowed('research', 'editorial_review')).toBe(true);
    expect(FixWorkflowEngine.isTransitionAllowed('editorial_review', 'fact_check')).toBe(true);
    expect(FixWorkflowEngine.isTransitionAllowed('fact_check', 'expert_review')).toBe(true);
    expect(FixWorkflowEngine.isTransitionAllowed('expert_review', 'approved')).toBe(true);
    expect(FixWorkflowEngine.isTransitionAllowed('approved', 'published')).toBe(true);
  });

  it('TEST-WFL-02: Rejects illegal state jumps (e.g., draft directly to published)', () => {
    expect(FixWorkflowEngine.isTransitionAllowed('draft', 'published')).toBe(false);
    expect(() =>
      FixWorkflowEngine.executeTransition(validMockFix, 'published', mockActor)
    ).toThrow(FixWorkflowTransitionError);
  });

  it('TEST-WFL-03: Executes legal transition from draft to research', () => {
    const { auditEvent } = FixWorkflowEngine.executeTransition(validMockFix, 'research', mockActor);
    expect(auditEvent.previousState).toBe('draft');
    expect(auditEvent.newState).toBe('research');
    expect(auditEvent.actor.actorId).toBe('usr-editor-001');
  });

  it('TEST-WFL-04: Enforces Gold Standard Audit requirement before transitioning to approved', () => {
    const expertFix: Fix = { ...validMockFix, editorialStatus: 'fact_check' };
    const { updatedFix: inExpertReview } = FixWorkflowEngine.executeTransition(expertFix, 'expert_review', mockActor);
    expect(() =>
      FixWorkflowEngine.executeTransition(inExpertReview, 'approved', mockActor, { goldStandardAudited: false })
    ).toThrow(FixWorkflowTransitionError);
  });

  it('TEST-WFL-05: Executes transition to approved when Gold Standard Audit passes', () => {
    const inExpertReview: Fix = { ...validMockFix, editorialStatus: 'fact_check' };
    const { updatedFix: expertFix } = FixWorkflowEngine.executeTransition(inExpertReview, 'expert_review', mockActor);

    const { updatedFix, auditEvent } = FixWorkflowEngine.executeTransition(expertFix, 'approved', mockActor, {
      goldStandardAudited: true,
      rationale: 'Passed 7-phase Gold Standard audit by 2 external economists.',
    });
    expect(updatedFix.publicationStatus).toBe('review');
    expect(auditEvent.newState).toBe('approved');
    expect(auditEvent.rationale).toContain('Gold Standard audit');
  });

  it('TEST-WFL-06: Blocks approved/published transition if validation engine returns ERROR issues', () => {
    const unsourcedFix: Fix = {
      ...validMockFix,
      editorialStatus: 'fact_check',
      sourceIds: [], // Causes VAL-EVD-01 ERROR
    };
    const { updatedFix: inExpert } = FixWorkflowEngine.executeTransition(unsourcedFix, 'expert_review', mockActor);

    expect(() =>
      FixWorkflowEngine.executeTransition(inExpert, 'approved', mockActor, { goldStandardAudited: true })
    ).toThrow(FixWorkflowTransitionError);
  });

  it('TEST-WFL-07: Emits complete audit transition event with validation report', () => {
    const readyFix: Fix = { ...validMockFix, editorialStatus: 'fact_check' };
    const { updatedFix: inExpert } = FixWorkflowEngine.executeTransition(readyFix, 'expert_review', mockActor);
    const { updatedFix: approvedFix } = FixWorkflowEngine.executeTransition(inExpert, 'approved', mockActor, { goldStandardAudited: true });

    const { updatedFix, auditEvent } = FixWorkflowEngine.executeTransition(approvedFix, 'published', mockActor, {
      goldStandardAudited: true,
      signature: 'sig-eic-2026-07-25-001',
    });

    expect(updatedFix.publicationStatus).toBe('published');
    expect(auditEvent.eventId).toMatch(/^evt-wfl-/);
    expect(auditEvent.signature).toBe('sig-eic-2026-07-25-001');
    expect(auditEvent.validationReport.canPublish).toBe(true);
  });
});
