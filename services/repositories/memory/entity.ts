import type { Entity, EntityKind, APIListParams, APIResponse } from '@/types/canonical';
import type { RawEntityRepository } from '../../interfaces/entity';

export class MemoryEntityRepository implements RawEntityRepository {
  private entities: Map<string, Entity>;

  constructor(entities: Entity[] = []) {
    this.entities = new Map(entities.map(e => [e.id, e]));
  }

  async getEntities(params?: APIListParams): Promise<APIResponse<Entity[]>> {
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

  async getEntity(id: string) {
    return this.entities.get(id);
  }

  async getEntityBySlug(slug: string) {
    return Array.from(this.entities.values()).find(e => e.slug === slug);
  }

  async getEntitiesByType(type: EntityKind) {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }

  async save(entity: Entity) {
    this.entities.set(entity.id, { ...entity, updatedAt: new Date().toISOString() });
    return this.entities.get(entity.id)!;
  }

  async delete(id: string) {
    this.entities.delete(id);
  }

  async count() {
    return this.entities.size;
  }
}
