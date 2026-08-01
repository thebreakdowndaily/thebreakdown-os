import { loadData, getDataById } from '@/lib/up403/loader';
import { okResponse, notFoundResponse, shouldIncludeProvenance } from '@/lib/up403/response';
import { getApiProvenance } from '@/lib/up403/provenance';

export async function GET(
  _request: Request,
  context: { params: Promise<{ canonical_id: string }> }
) {
  await loadData();
  const { canonical_id } = await context.params;
  const includeProv = shouldIncludeProvenance(new URL(_request.url));

  const byId = getDataById();
  const record = byId.get(canonical_id);

  if (!record) {
    return notFoundResponse(`Constituency '${canonical_id}' not found. Valid format: UP-AC-001`);
  }

  const data = {
    ...record,
    ...(includeProv ? { _provenance: getApiProvenance(record) } : {}),
  };

  return okResponse(data);
}
