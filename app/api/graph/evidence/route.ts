import { NextResponse } from 'next/server';
import { getStore } from '@/utils/data-layer/store';
import { buildEvidenceGraph, getClaimLineage } from '@/lib/graph/evidence-graph';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const claimId = searchParams.get('claimId');

  const store = getStore();
  const stories = Array.from(store.stories.values());

  const graph = buildEvidenceGraph(stories);

  if (claimId) {
    const lineage = getClaimLineage(graph, claimId);
    return NextResponse.json(lineage);
  }

  return NextResponse.json(graph);
}
