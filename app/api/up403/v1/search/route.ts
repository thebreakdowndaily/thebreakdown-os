import { loadData } from '@/lib/up403/loader';
import { search } from '@/lib/up403/search';
import { okResponse, badRequestResponse, parsePagination, shouldIncludeProvenance } from '@/lib/up403/response';
import { getApiProvenance } from '@/lib/up403/provenance';

export async function GET(request: Request) {
  await loadData();
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url);
  const includeProv = shouldIncludeProvenance(url);

  const q = url.searchParams.get('q');
  if (!q || q.trim() === '') {
    return badRequestResponse('Query parameter "q" is required');
  }

  const offset = (page - 1) * limit;
  const { results, total } = search(q, limit, offset);

  const data = results.map(r => ({
    score: r.score,
    matched_fields: r.matchedFields,
    record: {
      ...r.record,
      ...(includeProv ? { _provenance: getApiProvenance(r.record) } : {}),
    },
  }));

  return okResponse(data, {
    count: data.length,
    page,
    limit,
    total,
    query: q,
  });
}
