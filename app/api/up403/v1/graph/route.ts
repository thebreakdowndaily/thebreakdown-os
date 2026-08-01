import { loadData } from '@/lib/up403/loader';
import { buildFullGraph } from '@/lib/up403/graph';
import { okResponse } from '@/lib/up403/response';

export async function GET() {
  await loadData();
  const graph = buildFullGraph();
  return okResponse(graph, {
    node_count: graph.nodes.length,
    edge_count: graph.edges.length,
  });
}
