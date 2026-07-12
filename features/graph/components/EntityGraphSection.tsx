'use client';

import React, { useState, useEffect } from 'react';
import { GraphPreview } from './GraphPreview';
import { buildEntityGraphPreview } from '@/features/graph/view-model';
import { bootstrapServices } from '@/lib/bootstrap';
import { getServices } from '@/services/registry';

interface EntityGraphSectionProps {
  entitySlug: string;
}

export function EntityGraphSection({ entitySlug }: EntityGraphSectionProps) {
  bootstrapServices();
  const services = getServices();
  const [vm, setVm] = useState<any>(null);

  useEffect(() => {
    buildEntityGraphPreview(services, entitySlug).then(setVm);
  }, [services, entitySlug]);

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
