import { describe, it, expect } from 'vitest';
import { FixDomainService } from '../services/fixes/fix-domain.service';
import { CreateFixDTO } from '../services/fixes/fix-domain.types';
import { WorkflowActor } from '../services/fixes/fix-workflow.service';

describe('TEST-INT: System Integration & Release Candidate Verification (Phase 13B.5 RC Gate)', () => {
  const service = new FixDomainService();

  const authorActor: WorkflowActor = {
    actorId: 'usr-author-001',
    actorName: 'Lead Researcher',
    role: 'researcher',
  };

  const editorActor: WorkflowActor = {
    actorId: 'usr-eic-001',
    actorName: 'Editor-in-Chief',
    role: 'editor_in_chief',
  };

  const createPayload: CreateFixDTO = {
    title: 'Mandatory Real Time E Procurement Auditing',
    summary: 'Systemic administrative reform mandating automated gazette logging and public API audit trails.',
    primaryCategory: 'administrative',
    secondaryCategories: ['technological'],
    maturityStatus: 'proposed',
    problemStatement: 'Lack of transparency in municipal tender allocations leads to fiscal leakage.',
    rootCauses: [{ title: 'Opaque Bidding', content: 'Bids filed in physical format without public API access.' }],
    recommendedActions: [{ title: 'Deploy Open API Audit', description: 'Require real time gazette publication.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Finance'] }],
    responsibleActorIds: ['org-min-finance-001'],
    beneficiaryGroups: ['Taxpayers', 'Urban Contractors'],
    disadvantagedGroups: ['Informal Bidders'],
    fiscalCost: { amount: '1000000', currency: 'INR', timeframe: '1 Year', fundingMechanism: 'Budget Allocation', category: 'CapEx' },
    timeToImpact: 'short-term',
    tradeOffs: [{ dimension: 'Transparency vs Speed', advantage: 'Reduces corruption', disadvantage: 'Increases initial vetting time', affectedParties: ['Contractors'] }],
    risksAndFailures: [{ risk: 'System Downtime', impact: 'medium', mitigation: 'Redundant regional servers' }],
    evidenceGrade: 'High',
    unknownsAndGaps: [{ category: 'missing_data', description: 'No baseline data on sub-district tenders.', mitigationOrGap: 'Pilot in 2 districts.' }],
    successMetrics: [{ name: 'Audit Compliance Rate', currentValue: '15%', targetValue: '95%', dataSource: 'CAG Report', updateFrequency: 'Quarterly' }],
    sourceIds: ['src-gazette-402-2025'],
  };

  it('TEST-INT-01: End-to-End Composition: Create -> Validate -> Workflow -> Graph -> Metadata -> Search', async () => {
    // 1. Create Fix
    const createdFix = await service.createFix(createPayload, authorActor.actorId);
    expect(createdFix.id).toBeDefined();
    expect(createdFix.publicationStatus).toBe('draft');

    // 2. Validate Fix
    const validationReport = service.validateFix(createdFix);
    expect(validationReport.isValid).toBe(true);

    // 3. Workflow State Transitions
    await service.transitionWorkflowState(createdFix.id, 'research', authorActor);
    await service.transitionWorkflowState(createdFix.id, 'editorial_review', authorActor);
    await service.transitionWorkflowState(createdFix.id, 'fact_check', authorActor);
    await service.transitionWorkflowState(createdFix.id, 'expert_review', authorActor);

    // Approval requires Gold Standard Audit
    const { updatedFix: approvedFix } = await service.transitionWorkflowState(
      createdFix.id,
      'approved',
      editorActor,
      { goldStandardAudited: true, rationale: 'Approved after 7-phase audit.' }
    );
    expect(approvedFix.publicationStatus).toBe('review');

    // Publication
    const { updatedFix: publishedFix, auditEvent } = await service.transitionWorkflowState(
      createdFix.id,
      'published',
      editorActor,
      { goldStandardAudited: true, signature: 'sig-eic-2026-07-25-001' }
    );
    expect(publishedFix.publicationStatus).toBe('published');
    expect(auditEvent.signature).toBe('sig-eic-2026-07-25-001');

    // 4. Generate Knowledge Graph Edges
    const edges = service.getGraphEdges(publishedFix);
    expect(edges.length).toBeGreaterThan(0);
    expect(edges.some((e) => e.edgeType === 'cites_source' && e.targetId === 'src-gazette-402-2025')).toBe(true);

    // 5. Project Metadata
    const jsonLd = service.getJSONLDMetadata(publishedFix);
    expect(jsonLd['@type']).toBe('Legislation');
    expect(jsonLd.name).toBe(createPayload.title);

    const og = service.getOpenGraphMetadata(publishedFix);
    expect(og['og:title']).toContain(createPayload.title);

    const ris = service.getRISCitation(publishedFix);
    expect(ris).toContain('TY  - GOVT');

    // 6. Search Index Query & Score
    const searchResults = await service.searchFixes(
      { searchQuery: 'Procurement Auditing', primaryCategory: 'administrative' },
      { publicOnly: true }
    );

    expect(searchResults.total).toBe(1);
    expect(searchResults.hits[0].item.title).toBe(createPayload.title);
    expect(searchResults.hits[0].score).toBeGreaterThan(10.0);
    expect(searchResults.facets.primaryCategory['administrative']).toBe(1);
  });
});
