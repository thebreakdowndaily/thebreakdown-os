import type { Entity, EntityKind, EntityBase, APIListParams, APIResponse } from '@/types/canonical';

export interface RawEntityRepository {
  getEntities(params?: APIListParams): Promise<APIResponse<Entity[]>>;
  getEntity(id: string): Promise<Entity | undefined>;
  getEntityBySlug(slug: string): Promise<Entity | undefined>;
  getEntitiesByType(type: EntityKind): Promise<Entity[]>;
  save(entity: Entity): Promise<Entity>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

export interface EntityService {
  getEntities(params?: APIListParams): Promise<APIResponse<EntityBase[]>>;
  getEntity(id: string): Promise<EntityBase | undefined>;
  getEntityBySlug(slug: string): Promise<EntityBase | undefined>;
  getEntitiesByType(type: EntityKind): Promise<EntityBase[]>;
  saveEntity(entity: Entity): Promise<Entity>;
  deleteEntity(id: string): Promise<void>;
  count(): Promise<number>;
}
