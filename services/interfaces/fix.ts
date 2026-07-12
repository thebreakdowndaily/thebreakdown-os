import type { Fix, APIListParams, APIResponse } from '@/types/canonical';

export interface FixService {
  getFixes(params?: APIListParams): Promise<APIResponse<Fix[]>>;
  getFix(id: string): Promise<Fix | undefined>;
  getFixBySlug(slug: string): Promise<Fix | undefined>;
  saveFix(fix: Fix): Promise<Fix>;
  deleteFix(id: string): Promise<void>;
  count(): Promise<number>;
}
