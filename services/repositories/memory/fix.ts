import type { Fix, APIListParams, APIResponse } from '@/types/canonical';
import type { FixService } from '../../interfaces/fix';

export class MemoryFixRepository implements FixService {
  private fixes: Map<string, Fix>;

  constructor(fixes: Fix[] = []) {
    this.fixes = new Map(fixes.map(f => [f.id, f]));
  }

  async getFixes(params?: APIListParams): Promise<APIResponse<Fix[]>> {
    let list = Array.from(this.fixes.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(f => f.headline.toLowerCase().includes(q) || f.problem.content.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  async getFix(id: string) {
    return this.fixes.get(id);
  }

  async getFixBySlug(slug: string) {
    return Array.from(this.fixes.values()).find(f => f.slug === slug);
  }

  async saveFix(fix: Fix) {
    this.fixes.set(fix.id, { ...fix, updatedAt: new Date().toISOString() });
    return this.fixes.get(fix.id)!;
  }

  async deleteFix(id: string) {
    this.fixes.delete(id);
  }

  async count() {
    return this.fixes.size;
  }
}
