'use client';

import { useState, useEffect, useCallback } from 'react';
import { KnowledgeGraph } from '@/features/graph/components/KnowledgeGraph';
import { buildGraphPage } from '@/features/graph/view-model';
import { getServices } from '@/services/registry';
import { bootstrapServices } from '@/lib/bootstrap';
import type { GraphPageViewModel } from '@/features/graph/view-model';

export default function GraphExplorerPage() {
  const [vm, setVm] = useState<GraphPageViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(() => {
    bootstrapServices();
    return buildGraphPage(getServices());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setVm(init());
      } catch (e) {
        console.error('GraphPage init error:', e);
        setError(e instanceof Error ? e.message : String(e));
      }
    }, 0);
    return () => { clearTimeout(timer); };
  }, [init]);

  if (error) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          Knowledge Graph
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: '#EF4444', marginTop: 'var(--spacing-1)' }}>
          Failed to load: {error}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          Knowledge Graph
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
          {vm ? `${String(vm.nodeCount)} nodes · ${String(vm.edgeCount)} connections` : 'Loading...'}
        </p>
      </div>
      <div style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
        {vm && (
          <KnowledgeGraph
            nodes={vm.allNodes}
            edges={vm.allEdges}
            width={1100}
            height={700}
          />
        )}
      </div>
    </div>
  );
}
