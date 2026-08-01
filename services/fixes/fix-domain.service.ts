// ── Fix Canonical Domain Service (AR-13A.0 Master Integration Facade) ─────────

import { Fix } from '../../types/canonical';
import { CreateFixDTO, FixFilterParams, InternalFixViewModel, PublicFixViewModel, UpdateFixDTO } from './fix-domain.types';
import { IFixRepository, MemoryFixRepository } from './fix-repository.service';
import { FixInvariantsService } from './fix-invariants.service';
import { FixValidationEngine, FixValidationReport } from './fix-validation.service';
import { EditorialWorkflowState, FixWorkflowEngine, WorkflowActor } from './fix-workflow.service';
import { FixGraphEngine, FixGraphEdge } from './fix-graph.service';
import { FixMetadataService, SchemaOrgLegislationJSONLD, OpenGraphMetadata } from './fix-metadata.service';
import { FixSearchEngine, SearchHit, SearchFacetCounts } from './fix-search.service';

export class FixDomainService {
  constructor(private repo: IFixRepository = new MemoryFixRepository()) {}

  // ── Repository Layer Operations ──────────────────────────────────────────
  public async getFixById(id: string): Promise<Fix | null> {
    return this.repo.getById(id);
  }

  public async getFixBySlug(slug: string): Promise<Fix | null> {
    return this.repo.getBySlug(slug);
  }

  public async createFix(payload: CreateFixDTO, authorId: string): Promise<Fix> {
    return this.repo.create(payload, authorId);
  }

  public async updateFix(id: string, payload: UpdateFixDTO, editorId: string): Promise<Fix> {
    return this.repo.update(id, payload, editorId);
  }

  // ── Validation Layer Operations ──────────────────────────────────────────
  public validateFix(fix: Partial<Fix>, options?: Parameters<typeof FixValidationEngine.validate>[1]): FixValidationReport {
    return FixValidationEngine.validate(fix, options);
  }

  // ── Workflow & Audit Operations ──────────────────────────────────────────
  public async transitionWorkflowState(
    id: string,
    targetState: EditorialWorkflowState,
    actor: WorkflowActor,
    options?: { rationale?: string; goldStandardAudited?: boolean; signature?: string }
  ): Promise<{ updatedFix: Fix; auditEvent: any }> {
    const existing = await this.repo.getById(id);
    if (!existing) {
      throw new Error(`Fix not found for id: ${id}`);
    }

    const { updatedFix, auditEvent } = FixWorkflowEngine.executeTransition(existing, targetState, actor, options);
    
    // Save state update atomically
    await this.repo.update(id, {
      editorialStatus: updatedFix.editorialStatus,
      publicationStatus: updatedFix.publicationStatus,
    }, actor.actorId);

    return { updatedFix, auditEvent };
  }

  // ── Knowledge Infrastructure Operations (Graph & Metadata) ───────────────
  public getGraphEdges(fix: Fix): FixGraphEdge[] {
    return FixGraphEngine.generateEdges(fix);
  }

  public getJSONLDMetadata(fix: Fix, baseUrl?: string): SchemaOrgLegislationJSONLD {
    return FixMetadataService.toJSONLD(fix, baseUrl);
  }

  public getOpenGraphMetadata(fix: Fix, baseUrl?: string): OpenGraphMetadata {
    return FixMetadataService.toOpenGraph(fix, baseUrl);
  }

  public getRISCitation(fix: Fix, baseUrl?: string): string {
    return FixMetadataService.toRISCitation(fix, baseUrl);
  }

  // ── Search & Projection Operations ───────────────────────────────────────
  public async searchFixes(
    filter?: FixFilterParams,
    options?: { publicOnly?: boolean }
  ): Promise<{ hits: SearchHit<PublicFixViewModel>[]; facets: SearchFacetCounts; total: number }> {
    const allFixes = (await this.repo.list(undefined, 1, 1000)).data;
    return FixSearchEngine.search(allFixes, filter, options);
  }
}
