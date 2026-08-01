// ── Job Registry (Phase 17D Recommendation 3) ─────────────────────────────────

import { JobDefinition, JobType } from '../../types/jobs';

export class JobRegistry {
  private static registry = new Map<JobType, JobDefinition>();

  public static register(definition: JobDefinition): void {
    if (this.registry.has(definition.type)) {
      throw new Error(`JobRegistry Duplicate Error: Job type "${definition.type}" is already registered.`);
    }
    this.registry.set(definition.type, Object.freeze({ ...definition }));
  }

  public static get(type: JobType): JobDefinition | null {
    const def = this.registry.get(type);
    return def || null;
  }

  public static listAll(): JobDefinition[] {
    return Array.from(this.registry.values());
  }

  public static clear(): void {
    this.registry.clear();
  }
}
