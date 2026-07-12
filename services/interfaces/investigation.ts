import type { Investigation, APIListParams, APIResponse } from '@/types/canonical';

export interface InvestigationService {
  getInvestigations(params?: APIListParams): Promise<APIResponse<Investigation[]>>;
  getInvestigation(id: string): Promise<Investigation | undefined>;
  getInvestigationBySlug(slug: string): Promise<Investigation | undefined>;
  saveInvestigation(inv: Investigation): Promise<Investigation>;
  deleteInvestigation(id: string): Promise<void>;
  count(): Promise<number>;
}
