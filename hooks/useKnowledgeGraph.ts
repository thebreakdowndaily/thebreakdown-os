'use client';

import { useState, useEffect } from 'react';
import type { RelatedEntity } from '../utils/types';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  weight?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  weight?: number;
}

interface UseKnowledgeGraphResult {
  related: { nodes: GraphNode[]; edges: GraphEdge[] };
  loading: boolean;
  error: string | null;
}

export function useKnowledgeGraph(): UseKnowledgeGraphResult {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/knowledge-graph')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch knowledge graph');
        return res.json() as Promise<{ nodes?: GraphNode[]; edges?: GraphEdge[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setNodes(data.nodes ?? []);
          setEdges(data.edges ?? []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { related: { nodes, edges }, loading, error };
}

interface UseRelatedEntitiesResult {
  entities: RelatedEntity[];
  loading: boolean;
}

export function useRelatedEntities(entityId: string, depth: number = 1): UseRelatedEntitiesResult {
  const [entities, setEntities] = useState<RelatedEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;

    let cancelled = false;

    fetch(`/api/knowledge-graph/related?entityId=${encodeURIComponent(entityId)}&depth=${String(depth)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch related entities');
        return res.json() as Promise<{ entities?: RelatedEntity[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setEntities(data.entities ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntities([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [entityId, depth]);

  if (!entityId) {
    return { entities: [], loading: false };
  }

  return { entities, loading };
}
