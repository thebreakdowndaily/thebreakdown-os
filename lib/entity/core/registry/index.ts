import {
  EntityResolverStrategy,
  EntityLinker,
  KnowledgeGraphTraverser
} from '../types';

export class EntityRegistry {
  private static instance: EntityRegistry;

  private resolvers: Map<string, EntityResolverStrategy> = new Map();
  private linkers: Map<string, EntityLinker> = new Map();
  private graphTraversers: Map<string, KnowledgeGraphTraverser> = new Map();

  private constructor() {}

  public static getInstance(): EntityRegistry {
    if (!EntityRegistry.instance) {
      EntityRegistry.instance = new EntityRegistry();
    }
    return EntityRegistry.instance;
  }

  // Resolvers
  public registerResolver(name: string, strategy: EntityResolverStrategy) {
    this.resolvers.set(name, strategy);
  }
  public getResolvers(): EntityResolverStrategy[] {
    return Array.from(this.resolvers.values());
  }

  // Linkers
  public registerLinker(name: string, linker: EntityLinker) {
    this.linkers.set(name, linker);
  }
  public getLinker(name: string): EntityLinker | undefined {
    return this.linkers.get(name);
  }

  // Graph
  public registerGraphTraverser(name: string, traverser: KnowledgeGraphTraverser) {
    this.graphTraversers.set(name, traverser);
  }
  public getGraphTraverser(name: string): KnowledgeGraphTraverser | undefined {
    return this.graphTraversers.get(name);
  }
}
