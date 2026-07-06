import type { Entity, EntityKind, APIListParams, APIResponse } from '@/types/canonical';

export interface EntityService {
  getEntities(params?: APIListParams): APIResponse<Entity[]>;
  getEntity(id: string): Entity | undefined;
  getEntityBySlug(slug: string): Entity | undefined;
  getEntitiesByType(type: EntityKind): Entity[];
  findByAlias(alias: string): Entity | undefined;
  saveEntity(entity: Entity): Entity;
  deleteEntity(id: string): void;
}

export class MemoryEntityService implements EntityService {
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

  getEntity(id: string) {
    return this.entities.get(id);
  }

  getEntityBySlug(slug: string) {
    return Array.from(this.entities.values()).find(e => e.slug === slug);
  }

  getEntitiesByType(type: EntityKind) {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }

  findByAlias(alias: string) {
    return Array.from(this.entities.values()).find(e => e.aliases.some(a => a.toLowerCase() === alias.toLowerCase()));
  }

  saveEntity(entity: Entity) {
    this.entities.set(entity.id, { ...entity, updatedAt: new Date().toISOString() });
    return this.entities.get(entity.id)!;
  }

  deleteEntity(id: string) {
    this.entities.delete(id);
  }
}
