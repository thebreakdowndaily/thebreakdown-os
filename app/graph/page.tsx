'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { KnowledgeGraph } from '@/features/graph/components/KnowledgeGraph';
import { buildGraphPage } from '@/features/graph/view-model';
import { getServices } from '@/services/registry';
import { bootstrapServices } from '@/lib/bootstrap';
import type { GraphPageViewModel } from '@/features/graph/view-model';

export default function GraphExplorerPage() {
  const [vm, setVm] = useState<GraphPageViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const init = useCallback(() => {
    bootstrapServices({ publicOnly: true });
    buildGraphPage(getServices()).then((result) => {
      setVm(result);
      setReady(true);
    }).catch((e) => {
      console.error('GraphPage build error:', e);
      setError(e instanceof Error ? e.message : String(e));
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        init();
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
        <p style={{ marginTop: 'var(--spacing-4)' }}>
          <a href="/" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>← Back to Home</a>
          <span style={{ margin: '0 8px', color: 'var(--color-text-muted)' }}>·</span>
          <a href="/series" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Browse the Library</a>
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
      <div style={{ marginTop: 'var(--spacing-4)', textAlign: 'center' }}>
        <a href="/series" style={{ color: 'var(--color-accent)', textDecoration: 'underline', fontSize: 'var(--text-sm)' }}>
          ← Browse the Knowledge Library
        </a>
      </div>
    </div>
  );
}
