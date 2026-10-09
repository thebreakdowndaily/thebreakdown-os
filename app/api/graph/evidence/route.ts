import { NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildEvidenceGraph, getClaimLineage } from '@/lib/graph/evidence-graph';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const claimId = searchParams.get('claimId');

  const services = bootstrapServices();
  const { data: stories } = await services.stories.getStories({ pageSize: 1000 });

  const graph = buildEvidenceGraph(stories);

  if (claimId) {
    const lineage = getClaimLineage(graph, claimId);
    return NextResponse.json(lineage);
  }

  return NextResponse.json(graph);
}
