import type { NextRequest } from 'next/server';
import { db, ok, serverError } from '@/lib/api-v2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeSlug = searchParams.get('node') || '';
    const depth = parseInt(searchParams.get('depth') || '2', 10);
    const relation = searchParams.get('relation') || '';

    if (!nodeSlug) {
      // Return full graph (limited)
      const { data: nodes, error: nodeErr } = await db().from('nodes').select('*').limit(100);
      if (nodeErr) throw nodeErr;
      const { data: edges, error: edgeErr } = await db().from('edges').select('*').limit(200);
      if (edgeErr) throw edgeErr;
      return ok({ nodes: nodes || [], edges: edges || [] });
    }

    // BFS traversal from a specific node
    const { data: startNodes } = await db().from('nodes')
      .select('id, ref_type, ref_id')
      .eq('slug', nodeSlug);

    if (!startNodes || startNodes.length === 0) {
      return ok({ nodes: [], edges: [] });
    }

    const startId = startNodes[0].id;
    const visited = new Set<string>();
    const resultNodes: import('@/supabase/schema').Database['public']['Tables']['nodes']['Row'][] = [];
    const resultEdges: import('@/supabase/schema').Database['public']['Tables']['edges']['Row'][] = [];
    let queue = [{ id: startId, level: 0 }];

    while (queue.length > 0) {
      const { id: currentId, level } = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const { data: node } = await db().from('nodes').select('*').eq('id', currentId).single();
      if (node) resultNodes.push(node);

      if (level < depth) {
        let edgeQuery = db().from('edges').select('*').or(`source_id.eq.${currentId},target_id.eq.${currentId}`);
        if (relation) edgeQuery = edgeQuery.eq('relation', relation);

        const { data: edges } = await edgeQuery;
        if (edges) {
          for (const edge of edges) {
            resultEdges.push(edge);
            const neighborId = edge.source_id === currentId ? edge.target_id : edge.source_id;
            if (!visited.has(neighborId)) {
              queue.push({ id: neighborId, level: level + 1 });
            }
          }
        }
      }
    }

    return ok({ nodes: resultNodes, edges: resultEdges });
  } catch (e) { return serverError(e); }
}
