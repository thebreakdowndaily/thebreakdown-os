import { loadData, getTotalConstituencies, getDatasetVersion, getResearchCutoff } from '@/lib/up403/loader';
import { okResponse } from '@/lib/up403/response';

export async function GET() {
  await loadData();

  const info = {
    api_version: 'v1',
    dataset_version: getDatasetVersion(),
    research_cutoff: getResearchCutoff(),
    total_constituencies: getTotalConstituencies(),
    schema_version: '1.0.0',
    endpoints: {
      root: '/api/up403/v1',
      constituencies: {
        list: 'GET /api/up403/v1/constituencies',
        detail: 'GET /api/up403/v1/constituencies/{canonical_id}',
        params: 'page, limit, search, district, division, region, reservation, party, political_dna, competitiveness',
      },
      search: 'GET /api/up403/v1/search?q={query}',
      people: {
        list: 'GET /api/up403/v1/people',
        detail: 'GET /api/up403/v1/people/{person_id}',
      },
      elections: {
        list: 'GET /api/up403/v1/elections',
        by_year: 'GET /api/up403/v1/elections/{year}',
      },
      graph: {
        full: 'GET /api/up403/v1/graph',
        by_constituency: 'GET /api/up403/v1/graph/{canonical_id}',
      },
      timeline: 'GET /api/up403/v1/timeline/{canonical_id}',
      filter_options: 'GET /api/up403/v1/filter/options',
      compare: 'GET /api/up403/v1/compare?ids=ID1,ID2,...',
      analytics: 'GET /api/up403/v1/analytics',
    },
    common_params: {
      include: '?include=provenance (adds provenance metadata to responses)',
      page: '?page=1 (page number for pagination)',
      limit: '?limit=20 (items per page, max 100)',
    },
    version_policy: 'Future dataset upgrades will not break this API. New fields are additive.',
  };

  return okResponse(info);
}
