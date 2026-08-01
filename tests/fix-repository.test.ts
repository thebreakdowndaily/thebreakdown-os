// ── TEST-REP: Fix Repository & Lifecycle Test Suite (AR-13A.0 Specification)

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryFixRepository, ProhibitedOperationError, CircularSupersessionError } from '../services/fixes/fix-repository.service';
import { CreateFixDTO } from '../services/fixes/fix-domain.types';

describe('TEST-REP: Fix Repository & Lifecycle Contracts', () => {
  let repo: MemoryFixRepository;

  const validPayload: CreateFixDTO = {
    slug: 'e-procurement-audit',
    title: 'Mandatory Real Time E Procurement Auditing',
    summary: 'Systemic administrative reform mandating automated gazette logging.',
    primaryCategory: 'administrative',
    secondaryCategories: ['technological'],
    maturityStatus: 'proposed',
    problemStatement: 'Lack of transparency in municipal tender allocations.',
    rootCauses: [{ title: 'Opaque Bidding', content: 'Physical filing without public API access.' }],
    recommendedActions: [{ title: 'Deploy Open API Audit', description: 'Real time gazette logging.', priority: 'high', timeframe: 'short-term', actors: ['Ministry of Finance'] }],
    responsibleActorIds: ['org-min-finance-001'],
    beneficiaryGroups: ['Taxpayers'],
    disadvantagedGroups: ['Informal Bidders'],
    fiscalCost: { amount: '1000000', currency: 'INR', timeframe: '1 Year', fundingMechanism: 'Budget Allocation', category: 'CapEx' },
    timeToImpact: 'short-term',
    tradeOffs: [{ dimension: 'Transparency vs Speed', advantage: 'Reduces corruption', disadvantage: 'Increases initial vetting time', affectedParties: ['Contractors'] }],
    risksAndFailures: [{ risk: 'System Downtime', impact: 'medium', mitigation: 'Redundant servers' }],
    evidenceGrade: 'High',
    unknownsAndGaps: [{ category: 'missing_data', description: 'No baseline data on sub-district tenders.', mitigationOrGap: 'Pilot in 2 districts.' }],
    successMetrics: [{ name: 'Audit Compliance Rate', currentValue: '15%', targetValue: '95%', dataSource: 'CAG Report', updateFrequency: 'Quarterly' }],
    sourceIds: ['src-gazette-402-2025'],
  };

  beforeEach(() => {
    repo = new MemoryFixRepository();
  });

  it('TEST-REP-01: Creates a valid Fix and records an audit log entry', async () => {
    const fix = await repo.create(validPayload, 'author-001');
    expect(fix.id).toBeDefined();
    expect(fix.slug).toBe('e-procurement-audit');
    expect(fix.publicationStatus).toBe('draft');
    expect(fix.version).toBe('1.0.0');

    const auditLog = await repo.getAuditLog(fix.id);
    expect(auditLog.length).toBe(1);
    expect(auditLog[0].action).toBe('create');
    expect(auditLog[0].actorId).toBe('author-001');
  });

  it('TEST-REP-02: Enforces deletion ban by throwing ProhibitedOperationError on delete', async () => {
    const fix = await repo.create(validPayload, 'author-001');
    await expect(repo.delete(fix.id)).rejects.toThrow(ProhibitedOperationError);
  });

  it('TEST-REP-03: Archives a Fix and updates maturity and publication statuses', async () => {
    const fix = await repo.create(validPayload, 'author-001');
    const archived = await repo.archive(fix.id, 'Superceded by statutory act', 'editor-001');

    expect(archived.publicationStatus).toBe('archived');
    expect(archived.maturityStatus).toBe('archived');
  });

  it('TEST-REP-04: Supersedes a Fix and points to valid replacement Fix ID', async () => {
    const fixA = await repo.create(validPayload, 'author-001');
    const fixB = await repo.create({ ...validPayload, slug: 'e-procurement-audit-v2' }, 'author-001');

    const superseded = await repo.supersede(fixA.id, fixB.id, 'Upgraded policy mechanics', 'editor-001');
    expect(superseded.publicationStatus).toBe('superseded');
    expect(superseded.supersededByFixId).toBe(fixB.id);
  });

  it('TEST-REP-05: Prevents circular supersession pointers (A -> B -> A)', async () => {
    const fixA = await repo.create(validPayload, 'author-001');
    const fixB = await repo.create({ ...validPayload, slug: 'e-procurement-audit-v2' }, 'author-001');

    await repo.supersede(fixA.id, fixB.id, 'Upgraded policy mechanics', 'editor-001');
    await expect(repo.supersede(fixB.id, fixA.id, 'Circular link attempt', 'editor-001')).rejects.toThrow(CircularSupersessionError);
  });

  it('TEST-REP-06: Merges multiple source Fixes into a single target Fix', async () => {
    const fixA = await repo.create({ ...validPayload, slug: 'tender-audit-alpha' }, 'author-001');
    const fixB = await repo.create({ ...validPayload, slug: 'tender-audit-beta' }, 'author-001');

    const mergedPayload = { ...validPayload, slug: 'unified-tender-audit' };
    const merged = await repo.merge([fixA.id, fixB.id], mergedPayload, 'editor-001');

    expect(merged.id).toBeDefined();
    expect(merged.slug).toBe('unified-tender-audit');

    const updatedA = await repo.getById(fixA.id);
    const updatedB = await repo.getById(fixB.id);
    expect(updatedA?.publicationStatus).toBe('superseded');
    expect(updatedA?.supersededByFixId).toBe(merged.id);
    expect(updatedB?.publicationStatus).toBe('superseded');
    expect(updatedB?.supersededByFixId).toBe(merged.id);
  });

  it('TEST-REP-07: Splits a single Fix into multiple targeted Fixes', async () => {
    const source = await repo.create(validPayload, 'author-001');

    const splitPayloads = [
      { ...validPayload, slug: 'tender-audit-municipal' },
      { ...validPayload, slug: 'tender-audit-state' },
    ];

    const splits = await repo.split(source.id, splitPayloads, 'editor-001');
    expect(splits.length).toBe(2);

    const updatedSource = await repo.getById(source.id);
    expect(updatedSource?.publicationStatus).toBe('archived');
  });

  it('TEST-REP-08: Query filtering returns exact category and maturity matches', async () => {
    await repo.create({ ...validPayload, slug: 'fix-1', primaryCategory: 'administrative' }, 'author-001');
    await repo.create({ ...validPayload, slug: 'fix-2', primaryCategory: 'fiscal' }, 'author-001');

    const adminResults = await repo.list({ primaryCategory: 'administrative' });
    expect(adminResults.total).toBe(1);
    expect(adminResults.data[0].slug).toBe('fix-1');
  });
});
