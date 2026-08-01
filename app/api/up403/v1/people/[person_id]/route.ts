import { loadData } from '@/lib/up403/loader';
import { buildPersonRecord } from '@/lib/up403/compare';
import { okResponse, notFoundResponse } from '@/lib/up403/response';

export async function GET(
  _request: Request,
  context: { params: Promise<{ person_id: string }> }
) {
  await loadData();
  const { person_id } = await context.params;
  const name = person_id.replace(/^person:/, '').replace(/_/g, ' ').trim();

  const record = buildPersonRecord(name);

  if (!record) {
    return notFoundResponse(`Person '${name}' not found`);
  }

  return okResponse(record);
}
