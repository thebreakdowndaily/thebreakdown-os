import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  bootstrapServices: vi.fn(),
  search: vi.fn(),
  searchByType: vi.fn(),
  getDatasets: vi.fn(),
}));

vi.mock('@/lib/bootstrap', () => ({
  bootstrapServices: mocks.bootstrapServices,
}));

vi.mock('@/services/repositories/supabase/dataset', () => ({
  SupabaseDatasetRepository: class {
    getDatasets = mocks.getDatasets;
  },
}));

import { GET as searchGET } from '@/app/api/v1/search/route';
import { GET as datasetsGET } from '@/app/api/v1/datasets/route';

describe('v1 route cold-start initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.search.mockReturnValue({ data: [], meta: { total: 0, page: 2, pageSize: 10 } });
    mocks.searchByType.mockReturnValue({ data: [], meta: { total: 0, page: 2, pageSize: 10 } });
    mocks.bootstrapServices.mockReturnValue({
      search: {
        search: mocks.search,
        searchByType: mocks.searchByType,
      },
    });
    mocks.getDatasets.mockResolvedValue({ data: [], meta: { total: 0, page: 1, pageSize: 0 } });
  });

  it('initializes public services in the search handler instead of relying on prior module state', async () => {
    const request = new NextRequest('http://localhost/api/v1/search?q=budget&page=2&pageSize=10');
    const response = await searchGET(request);

    expect(response.status).toBe(200);
    expect(mocks.bootstrapServices).toHaveBeenCalledWith({ publicOnly: true });
    expect(mocks.search).toHaveBeenCalledWith('budget', { page: 2, pageSize: 10 });
    expect(await response.json()).toMatchObject({ data: [] });
  });

  it('uses the repository contract for datasets on a fresh handler invocation', async () => {
    const request = new NextRequest('http://localhost/api/v1/datasets?page=1&pageSize=10');
    const response = await datasetsGET(request);

    expect(response.status).toBe(200);
    expect(mocks.getDatasets).toHaveBeenCalledWith({ page: 1, pageSize: 10, search: undefined });
    expect(await response.json()).toMatchObject({ data: [] });
  });
});
