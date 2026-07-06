'use client';

import { useState, useEffect } from 'react';
import { GraphPreview } from './GraphPreview';
import { buildTopicGraphPreview } from '@/features/graph/view-model';
import { bootstrapServices } from '@/lib/bootstrap';
import { getServices } from '@/services/registry';

interface TopicGraphSectionProps {
  topicSlug: string;
}

export function TopicGraphSection({ topicSlug }: TopicGraphSectionProps) {
  const [vm, setVm] = useState<ReturnType<typeof buildTopicGraphPreview>>(null);

  useEffect(() => {
    bootstrapServices();
    const result = buildTopicGraphPreview(getServices(), topicSlug);
    const timer = setTimeout(() => { setVm(result); }, 0);
    return () => { clearTimeout(timer); };
  }, [topicSlug]);

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
