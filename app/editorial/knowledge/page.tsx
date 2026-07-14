import { buildKnowledgeDashboard, computeInstitutionalTrustIndex } from '@/features/editorial/knowledge-service';
import KnowledgeMissionControl from '@/components/editorial/KnowledgeMissionControl';

export const dynamic = 'force-dynamic';

export default async function KnowledgeEditorialPage() {
  const data = buildKnowledgeDashboard();
  const trustIndex = computeInstitutionalTrustIndex();

  return <KnowledgeMissionControl chapters={data.chapters} trustIndex={trustIndex} />;
}
