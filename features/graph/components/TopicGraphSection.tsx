'use client';

import React, { useState, useEffect } from 'react';
import { GraphPreview } from './GraphPreview';
import { buildTopicGraphPreview } from '@/features/graph/view-model';
import { bootstrapServices } from '@/lib/bootstrap';
import { getServices } from '@/services/registry';

interface TopicGraphSectionProps {
  topicSlug: string;
}

export function TopicGraphSection({ topicSlug }: TopicGraphSectionProps) {
  bootstrapServices();
  const services = getServices();
  const [vm, setVm] = useState<any>(null);

  useEffect(() => {
    buildTopicGraphPreview(services, topicSlug).then(setVm);
  }, [services, topicSlug]);

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
