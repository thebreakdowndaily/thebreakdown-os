import { GraphPreview } from './GraphPreview';
import { buildTopicGraphPreview } from '@/features/graph/view-model';
import { bootstrapServices } from '@/lib/bootstrap';
import { getServices } from '@/services/registry';

interface TopicGraphSectionProps {
  topicSlug: string;
}

export function TopicGraphSection({ topicSlug }: TopicGraphSectionProps) {
  bootstrapServices();
  const vm = buildTopicGraphPreview(getServices(), topicSlug);

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
