'use client';

import { useState, useEffect } from 'react';
import { GraphPreview } from './GraphPreview';
import { buildEntityGraphPreview } from '@/features/graph/view-model';
import { bootstrapServices } from '@/lib/bootstrap';
import { getServices } from '@/services/registry';

interface EntityGraphSectionProps {
  entitySlug: string;
}

export function EntityGraphSection({ entitySlug }: EntityGraphSectionProps) {
  const [vm, setVm] = useState<ReturnType<typeof buildEntityGraphPreview>>(null);

  useEffect(() => {
    bootstrapServices();
    const result = buildEntityGraphPreview(getServices(), entitySlug);
    const timer = setTimeout(() => { setVm(result); }, 0);
    return () => { clearTimeout(timer); };
  }, [entitySlug]);

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
