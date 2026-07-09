import { GraphPreview } from './GraphPreview';
import { buildEntityGraphPreview } from '@/features/graph/view-model';
import { bootstrapServices } from '@/lib/bootstrap';
import { getServices } from '@/services/registry';

interface EntityGraphSectionProps {
  entitySlug: string;
}

export function EntityGraphSection({ entitySlug }: EntityGraphSectionProps) {
  bootstrapServices();
  const vm = buildEntityGraphPreview(getServices(), entitySlug);

  if (!vm) return null;

  return (
    <GraphPreview
      centerNode={vm.centerNode}
      connections={vm.connections}
      allNodes={vm.allNodes}
      allEdges={vm.allEdges}
      height={350}
      title="Knowledge Graph"
    />
  );
}
