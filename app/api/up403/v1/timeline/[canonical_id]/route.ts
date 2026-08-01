import { loadData, getDataById } from '@/lib/up403/loader';
import { buildTimeline } from '@/lib/up403/timeline';
import { okResponse, notFoundResponse } from '@/lib/up403/response';

export async function GET(
  _request: Request,
  context: { params: Promise<{ canonical_id: string }> }
) {
  await loadData();
  const { canonical_id } = await context.params;

  const byId = getDataById();
  const rec = byId.get(canonical_id);

  if (!rec) {
    return notFoundResponse(`Constituency '${canonical_id}' not found`);
  }

  const events = buildTimeline(rec);

  return okResponse(events, {
    constituency: canonical_id,
    constituency_name: rec.constituency_name,
    event_count: events.length,
  });
}
