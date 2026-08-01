import { loadData } from '@/lib/up403/loader';
import { buildConstituencyGraph } from '@/lib/up403/graph';
import { okResponse, notFoundResponse } from '@/lib/up403/response';

export async function GET(
  _request: Request,
  context: { params: Promise<{ canonical_id: string }> }
) {
  await loadData();
  const { canonical_id } = await context.params;

  const graph = buildConstituencyGraph(canonical_id);

  if (graph.nodes.length === 0) {
    return notFoundResponse(`Constituency '${canonical_id}' not found`);
  }

  return okResponse(graph, {
    node_count: graph.nodes.length,
    edge_count: graph.edges.length,
    root: canonical_id,
  });
}
