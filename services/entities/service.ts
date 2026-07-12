import type { Entity, EntityKind, APIListParams, APIResponse, EntityBase } from '@/types/canonical';
import type { EntityService } from '../interfaces/entity';
import type { RawEntityRepository } from '../interfaces/entity';
import { KnowledgeEntityPipeline } from './pipeline';

export class KnowledgeEntityService implements EntityService {
  constructor(
    private repository: RawEntityRepository,
    private pipeline: KnowledgeEntityPipeline
  ) {}

  async getEntities(params?: APIListParams): Promise<APIResponse<EntityBase[]>> {
    const res = await this.repository.getEntities(params);
    return {
      data: res.data.map(e => this.pipeline.execute(e)),
      meta: res.meta
    };
  }

  async getEntity(id: string): Promise<EntityBase | undefined> {
    const raw = await this.repository.getEntity(id);
    return raw ? this.pipeline.execute(raw) : undefined;
  }

  async getEntityBySlug(slug: string): Promise<EntityBase | undefined> {
    const raw = await this.repository.getEntityBySlug(slug);
    return raw ? this.pipeline.execute(raw) : undefined;
  }

  async getEntitiesByType(type: EntityKind): Promise<EntityBase[]> {
    const raw = await this.repository.getEntitiesByType(type);
    return raw.map(e => this.pipeline.execute(e));
  }

  async saveEntity(entity: Entity): Promise<Entity> {
    return await this.repository.save(entity);
  }

  async deleteEntity(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}
