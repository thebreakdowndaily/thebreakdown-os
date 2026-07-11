import { RegisteredSource } from '@/types/canonical';

export class SourceRegistry {
  private sources: Map<string, RegisteredSource> = new Map();

  register(source: RegisteredSource) {
    this.sources.set(source.id, source);
  }

  get(id: string): RegisteredSource | undefined {
    return this.sources.get(id);
  }

  getAll(): RegisteredSource[] {
    return Array.from(this.sources.values());
  }

  getActive(): RegisteredSource[] {
    return this.getAll().filter(s => s.status === 'active' && s.enabled);
  }
}
