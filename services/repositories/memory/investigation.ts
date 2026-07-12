import type { Investigation, APIListParams, APIResponse } from '@/types/canonical';
import type { InvestigationService } from '../../interfaces/investigation';

export class MemoryInvestigationRepository implements InvestigationService {
  private investigations: Map<string, Investigation>;

  constructor(investigations: Investigation[] = []) {
    this.investigations = new Map(investigations.map(i => [i.id, i]));
  }

  async getInvestigations(params?: APIListParams): Promise<APIResponse<Investigation[]>> {
    let list = Array.from(this.investigations.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    return { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
  }

  async getInvestigation(id: string) {
    return this.investigations.get(id);
  }

  async getInvestigationBySlug(slug: string) {
    return Array.from(this.investigations.values()).find(i => i.slug === slug);
  }

  async saveInvestigation(inv: Investigation) {
    this.investigations.set(inv.id, { ...inv, updatedAt: new Date().toISOString() });
    return this.investigations.get(inv.id)!;
  }

  async deleteInvestigation(id: string) {
    this.investigations.delete(id);
  }

  async count() {
    return this.investigations.size;
  }
}
