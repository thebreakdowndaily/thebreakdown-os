import type { Fix, APIListParams, APIResponse } from '@/types/canonical';

export interface FixService {
  getFixes(params?: APIListParams): APIResponse<Fix[]>;
  getFix(id: string): Fix | undefined;
  getFixBySlug(slug: string): Fix | undefined;
  saveFix(fix: Fix): Fix;
  deleteFix(id: string): void;
}

export class MemoryFixService implements FixService {
  private fixes: Map<string, Fix>;

  constructor(fixes: Fix[]) {
    this.fixes = new Map(fixes.map(f => [f.id, f]));
  }

  getFixes(params?: APIListParams): APIResponse<Fix[]> {
    let list = Array.from(this.fixes.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(f => f.title.toLowerCase().includes(q) || f.problem.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  getFix(id: string) {
    return this.fixes.get(id);
  }

  getFixBySlug(slug: string) {
    return Array.from(this.fixes.values()).find(f => f.slug === slug);
  }

  saveFix(fix: Fix) {
    this.fixes.set(fix.id, { ...fix, updatedAt: new Date().toISOString() });
    return this.fixes.get(fix.id)!;
  }

  deleteFix(id: string) {
    this.fixes.delete(id);
  }
}
