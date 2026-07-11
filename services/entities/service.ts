import type { Entity, EntityKind, APIListParams, APIResponse, KnowledgeEntity, EntityBase } from '@/types/canonical';
import { LegacyEntityAdapter } from './legacy-adapter';
import { KnowledgeEntityPipeline } from './pipeline';

// The Repository Interface (Fetch only)
export interface EntityRepository {
  getEntities(params?: APIListParams): APIResponse<Entity[]>;
  getEntity(id: string): Entity | undefined;
  getEntityBySlug(slug: string): Entity | undefined;
  getEntitiesByType(type: EntityKind): Entity[];
  findByAlias(alias: string): Entity | undefined;
}

// The raw in-memory store
export class MemoryEntityRepository implements EntityRepository {
  private entities: Map<string, Entity>;

  constructor(entities: Entity[]) {
    this.entities = new Map(entities.map(e => [e.id, e]));
  }

  getEntities(params?: APIListParams): APIResponse<Entity[]> {
    let list = Array.from(this.entities.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  getEntity(id: string) { return this.entities.get(id); }
  getEntityBySlug(slug: string) { return Array.from(this.entities.values()).find(e => e.slug === slug); }
  getEntitiesByType(type: EntityKind) { return Array.from(this.entities.values()).filter(e => e.type === type); }
  findByAlias(alias: string) { return Array.from(this.entities.values()).find(e => e.aliases.some(a => a.toLowerCase() === alias.toLowerCase())); }
}

// The core Service that exposes the Pipeline to the rest of the application
export interface EntityService {
  getEntities(params?: APIListParams): APIResponse<EntityBase[]>;
  getEntity(id: string): EntityBase | undefined;
  getEntityBySlug(slug: string): EntityBase | undefined;
  getEntitiesByType(type: EntityKind): EntityBase[];
  findByAlias(alias: string): EntityBase | undefined;
}

export class KnowledgeEntityService implements EntityService {
  constructor(
    private repository: EntityRepository,
    private pipeline: KnowledgeEntityPipeline
  ) {}

  getEntities(params?: APIListParams): APIResponse<EntityBase[]> {
    const res = this.repository.getEntities(params);
    return {
      data: res.data.map(e => this.pipeline.execute(e)),
      meta: res.meta
    };
  }

  getEntity(id: string): EntityBase | undefined {
    const raw = this.repository.getEntity(id);
    return raw ? this.pipeline.execute(raw) : undefined;
  }

  getEntityBySlug(slug: string): EntityBase | undefined {
    const raw = this.repository.getEntityBySlug(slug);
    return raw ? this.pipeline.execute(raw) : undefined;
  }

  getEntitiesByType(type: EntityKind): EntityBase[] {
    return this.repository.getEntitiesByType(type).map(e => this.pipeline.execute(e));
  }

  findByAlias(alias: string): EntityBase | undefined {
    const raw = this.repository.findByAlias(alias);
    return raw ? this.pipeline.execute(raw) : undefined;
  }
}
