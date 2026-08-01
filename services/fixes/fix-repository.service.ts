// ── IFixRepository Implementation (AR-13A.0 Specification) ──────────────────

import { Fix, Story, Entity, Source } from '../../types/canonical';
import {
  CreateFixDTO,
  UpdateFixDTO,
  FixFilterParams,
  PaginatedResult,
} from './fix-domain.types';
import { FixInvariantsService } from './fix-invariants.service';
import { FixIdentityService } from './fix-identity.service';

export interface AuditLogEntry {
  id: string;
  fixId: string;
  action: 'create' | 'update' | 'archive' | 'supersede' | 'merge' | 'split';
  actorId: string;
  timestamp: string; // ISO-8601
  diffPayload?: Record<string, unknown>;
  rationale?: string;
}

export class ProhibitedOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProhibitedOperationError';
  }
}

export class FixNotFoundError extends Error {
  constructor(idOrSlug: string) {
    super(`Fix Knowledge Object not found: ${idOrSlug}`);
    this.name = 'FixNotFoundError';
  }
}

export class CircularSupersessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircularSupersessionError';
  }
}

export interface IFixRepository {
  getById(id: string): Promise<Fix | null>;
  getBySlug(slug: string): Promise<Fix | null>;
  list(filter?: FixFilterParams, page?: number, pageSize?: number): Promise<PaginatedResult<Fix>>;
  create(payload: CreateFixDTO, authorId: string): Promise<Fix>;
  update(id: string, payload: UpdateFixDTO, editorId: string): Promise<Fix>;
  archive(id: string, reason: string, editorId: string): Promise<Fix>;
  supersede(id: string, supersededByFixId: string, rationale: string, editorId: string): Promise<Fix>;
  merge(sourceFixIds: string[], targetPayload: CreateFixDTO, editorId: string): Promise<Fix>;
  split(sourceFixId: string, targetPayloads: CreateFixDTO[], editorId: string): Promise<Fix[]>;
  delete(id: string): Promise<never>;
  getAuditLog(fixId: string): Promise<AuditLogEntry[]>;
}

export class MemoryFixRepository implements IFixRepository {
  private fixes: Map<string, Fix> = new Map();
  private auditLog: AuditLogEntry[] = [];

  /**
   * Resets in-memory storage (used by test suites).
   */
  public clear(): void {
    this.fixes.clear();
    this.auditLog = [];
  }

  public async getById(id: string): Promise<Fix | null> {
    const fix = this.fixes.get(id);
    return fix ? { ...fix } : null;
  }

  public async getBySlug(slug: string): Promise<Fix | null> {
    for (const fix of this.fixes.values()) {
      if (fix.slug === slug) {
        return { ...fix };
      }
    }
    return null;
  }

  public async list(filter?: FixFilterParams, page = 1, pageSize = 20): Promise<PaginatedResult<Fix>> {
    let results = Array.from(this.fixes.values());

    if (filter) {
      if (filter.publicationStatus) {
        results = results.filter((f) => f.publicationStatus === filter.publicationStatus);
      }
      if (filter.primaryCategory) {
        results = results.filter((f) => f.primaryCategory === filter.primaryCategory);
      }
      if (filter.maturityStatus) {
        results = results.filter((f) => f.maturityStatus === filter.maturityStatus);
      }
      if (filter.evidenceGrade) {
        results = results.filter((f) => f.evidenceGrade === filter.evidenceGrade);
      }
      if (filter.responsibleActorId) {
        results = results.filter((f) => f.responsibleActorIds?.includes(filter.responsibleActorId!));
      }
      if (filter.sourceId) {
        results = results.filter((f) => f.sourceIds?.includes(filter.sourceId!));
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        results = results.filter(
          (f) =>
            (f.title || f.headline || '').toLowerCase().includes(query) ||
            (f.summary || '').toLowerCase().includes(query) ||
            (f.problemStatement || '').toLowerCase().includes(query)
        );
      }
    }

    const total = results.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedData = results.slice(startIndex, startIndex + pageSize).map((f) => ({ ...f }));

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  public async create(payload: CreateFixDTO, authorId: string): Promise<Fix> {
    const id = FixIdentityService.generateId();
    const slug = payload.slug || FixIdentityService.generateSlug(payload.title);

    // Check slug uniqueness
    const existing = await this.getBySlug(slug);
    if (existing) {
      throw new Error(`Duplicate slug violation: Fix with slug "${slug}" already exists.`);
    }

    const nowIso = new Date().toISOString();
    const newFix: Fix = {
      id,
      slug,
      title: payload.title,
      headline: payload.title,
      summary: payload.summary,
      primaryCategory: payload.primaryCategory,
      secondaryCategories: payload.secondaryCategories || [],
      editorialStatus: 'draft',
      publicationStatus: 'draft',
      maturityStatus: payload.maturityStatus,
      problemStatement: payload.problemStatement,
      rootCauses: Object.assign(payload.rootCauses || [], payload.rootCauses?.[0] || { title: 'Root Cause', content: payload.problemStatement }),
      recommendedActions: payload.recommendedActions || [],
      responsibleActorIds: payload.responsibleActorIds || [],
      beneficiaryGroups: payload.beneficiaryGroups || [],
      disadvantagedGroups: payload.disadvantagedGroups || [],
      fiscalCost: payload.fiscalCost,
      timeToImpact: payload.timeToImpact,
      globalPrecedents: payload.globalPrecedents || [],
      tradeOffs: payload.tradeOffs || [],
      risksAndFailures: payload.risksAndFailures || [],
      constitutionalBasis: payload.constitutionalBasis,
      evidenceGrade: payload.evidenceGrade,
      unknownsAndGaps: payload.unknownsAndGaps || [],
      successMetrics: payload.successMetrics || [],
      sourceIds: payload.sourceIds || [],
      lastVerified: payload.lastVerified || nowIso,
      version: payload.version || '1.0.0',

      // Legacy fallback fields for backwards compatibility
      storySlug: slug,
      publishedAt: nowIso,
      updatedAt: nowIso,
      readingTime: 5,
      author: { name: 'Editorial Bureau', role: 'Research Analyst' },
      evidenceScore: 85,
      tags: [payload.primaryCategory],
      problem: { title: 'Problem Statement', content: payload.problemStatement },
      whoIsAffected: { title: 'Affected Groups', content: payload.beneficiaryGroups?.join(', ') || 'Citizens' },
      evidence: { title: 'Evidentiary Basis', content: 'Verified level 1-3 primary source citations.' },
      stakeholders: [],
      existingSolutions: [],
      globalExamples: payload.globalPrecedents || [],
      citizenActions: [],
      governmentActions: payload.recommendedActions || [],
      metricsToTrack: payload.successMetrics || [],
    };

    // Assert Domain Invariants
    FixInvariantsService.assertValid(newFix);

    // Save and log audit
    this.fixes.set(id, newFix);
    this.logAudit(id, 'create', authorId, { payload });

    return { ...newFix };
  }

  public async update(id: string, payload: UpdateFixDTO, editorId: string): Promise<Fix> {
    const existing = this.fixes.get(id);
    if (!existing) {
      throw new FixNotFoundError(id);
    }

    if (existing.publicationStatus === 'archived') {
      throw new ProhibitedOperationError(`Cannot update archived Fix object ${id}. Prohibited by AR-13A.0.`);
    }

    // Prepare updated fix object
    const updatedFix: Fix = {
      ...existing,
      ...payload,
      id: existing.id, // Immutable ID
      slug: payload.slug ? payload.slug : existing.slug,
      version: existing.publicationStatus === 'published'
        ? FixIdentityService.incrementVersion(existing.version || '1.0.0', 'patch')
        : (existing.version || '1.0.0'),
    };

    // Check invariant validity
    FixInvariantsService.assertValid(updatedFix);

    // Save state atomically
    this.fixes.set(id, updatedFix);
    this.logAudit(id, 'update', editorId, { payload });

    return { ...updatedFix };
  }

  public async archive(id: string, reason: string, editorId: string): Promise<Fix> {
    const existing = this.fixes.get(id);
    if (!existing) {
      throw new FixNotFoundError(id);
    }

    const archivedFix: Fix = {
      ...existing,
      publicationStatus: 'archived',
      maturityStatus: 'archived',
    };

    FixInvariantsService.assertValid(archivedFix);
    this.fixes.set(id, archivedFix);
    this.logAudit(id, 'archive', editorId, { reason });

    return { ...archivedFix };
  }

  public async supersede(id: string, supersededByFixId: string, rationale: string, editorId: string): Promise<Fix> {
    const existing = this.fixes.get(id);
    if (!existing) {
      throw new FixNotFoundError(id);
    }

    if (id === supersededByFixId) {
      throw new CircularSupersessionError(`Fix ${id} cannot supersede itself.`);
    }

    const replacement = this.fixes.get(supersededByFixId);
    if (!replacement) {
      throw new FixNotFoundError(`Replacement Fix ${supersededByFixId} does not exist.`);
    }

    // Check circular supersession (A -> B -> A)
    if (replacement.supersededByFixId === id) {
      throw new CircularSupersessionError(`Circular supersession detected between Fix ${id} and Fix ${supersededByFixId}.`);
    }

    const supersededFix: Fix = {
      ...existing,
      publicationStatus: 'superseded',
      supersededByFixId,
    };

    FixInvariantsService.assertValid(supersededFix);
    this.fixes.set(id, supersededFix);
    this.logAudit(id, 'supersede', editorId, { supersededByFixId, rationale });

    return { ...supersededFix };
  }

  public async merge(sourceFixIds: string[], targetPayload: CreateFixDTO, editorId: string): Promise<Fix> {
    if (!sourceFixIds || sourceFixIds.length < 2) {
      throw new Error('Merge requires at least two source Fix IDs.');
    }

    // Verify all source Fixes exist
    for (const sourceId of sourceFixIds) {
      const sourceFix = this.fixes.get(sourceId);
      if (!sourceFix) {
        throw new FixNotFoundError(sourceId);
      }
    }

    // 1. Create target merged Fix
    const mergedFix = await this.create(targetPayload, editorId);

    // 2. Mark sources as superseded pointing to merged Fix
    for (const sourceId of sourceFixIds) {
      await this.supersede(sourceId, mergedFix.id, `Merged into target Fix ${mergedFix.id}`, editorId);
    }

    this.logAudit(mergedFix.id, 'merge', editorId, { sourceFixIds });
    return mergedFix;
  }

  public async split(sourceFixId: string, targetPayloads: CreateFixDTO[], editorId: string): Promise<Fix[]> {
    if (!targetPayloads || targetPayloads.length < 2) {
      throw new Error('Split requires at least two target payload DTOs.');
    }

    const sourceFix = this.fixes.get(sourceFixId);
    if (!sourceFix) {
      throw new FixNotFoundError(sourceFixId);
    }

    // 1. Create split Fixes
    const createdSplits: Fix[] = [];
    for (const payload of targetPayloads) {
      const splitFix = await this.create(payload, editorId);
      createdSplits.push(splitFix);
    }

    // 2. Archive original source Fix with split rationale
    await this.archive(
      sourceFixId,
      `Split into ${createdSplits.length} Fixes: [${createdSplits.map((f) => f.id).join(', ')}]`,
      editorId
    );

    this.logAudit(sourceFixId, 'split', editorId, { splitFixIds: createdSplits.map((f) => f.id) });
    return createdSplits;
  }

  /**
   * Deletion Ban: Physical deletion is strictly prohibited by AR-13A.0.
   */
  public async delete(id: string): Promise<never> {
    throw new ProhibitedOperationError(
      `Physical deletion of Fix object ${id} is prohibited by AR-13A.0 deletion ban. Use archive() or supersede().`
    );
  }

  public async getAuditLog(fixId: string): Promise<AuditLogEntry[]> {
    return this.auditLog.filter((log) => log.fixId === fixId);
  }

  private logAudit(fixId: string, action: AuditLogEntry['action'], actorId: string, extra?: Record<string, unknown>): void {
    this.auditLog.push({
      id: FixIdentityService.generateId(),
      fixId,
      action,
      actorId,
      timestamp: new Date().toISOString(),
      diffPayload: extra?.payload as Record<string, unknown> | undefined,
      rationale: extra?.rationale as string | undefined,
    });
  }
}
