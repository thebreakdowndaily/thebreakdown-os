import { NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildEvidenceGraph, getClaimLineage } from '@/lib/graph/evidence-graph';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const claimId = searchParams.get('claimId');

  const services = bootstrapServices({ publicOnly: true });
  const { data: stories } = await services.stories.getPublicStories({ pageSize: 1000 });

  // Defense in depth: a quarantined test artifact must never enter a public graph,
  // even if a repository adapter has a legacy-slug visibility fallback.
  const publicStories = stories.filter(
    (story) => (story as typeof story & { isTestArtifact?: boolean }).isTestArtifact !== true,
  );
  const graph = buildEvidenceGraph(publicStories);

  if (claimId) {
    const lineage = getClaimLineage(graph, claimId);
    return NextResponse.json(lineage);
  }

  return NextResponse.json(graph);
}
