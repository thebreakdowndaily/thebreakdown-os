/**
 * THE BREAKDOWN OS — Knowledge Graph Relationship Manager
 *
 * Manages edges in the Knowledge Graph.
 * Handles CRUD, edge queries, and edge-level statistics.
 *
 * Relationships become edges:
 *   implements, created_by, approved_by, funded_by, managed_by,
 *   reports_to, member_of, located_in, criticised_by, supports,
 *   opposes, related_to, amends, replaces, references, cites,
 *   depends_on, caused_by, influenced_by, regulated_by, audited_by
 */

import type { GraphEdge, GraphConfig, EdgeQuery, EdgeStatistics } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class RelationshipManager {
  private edgesPath: string;
  private edges: Map<string, GraphEdge> = new Map(); // in-memory cache

  constructor(config: GraphConfig) {
    this.edgesPath = config.store.edges_path;
  }

  /**
   * Create a new edge. If an edge with the same from→rel→to exists, update it.
   */
  async create(edge: Omit<GraphEdge, 'id' | 'firstObserved' | 'lastObserved' | 'active'>): Promise<GraphEdge> {
    const edgeId = `${sanitizeId(edge.from)}|${edge.relationship}|${sanitizeId(edge.to)}`;

    // Check if edge already exists
    const existing = this.edges.get(edgeId);
    if (existing) {
      return this.merge(existing, edge);
    }

    const now = new Date().toISOString();
    const newEdge: GraphEdge = {
      ...edge,
      id: edgeId,
      weight: edge.weight || 1.0,
      firstObserved: now,
      lastObserved: now,
      active: true,
    };

    await this.writeEdge(newEdge);
    this.edges.set(edgeId, newEdge);

    return newEdge;
  }

  /**
   * Delete an edge.
   */
  async delete(id: string): Promise<void> {
    const edge = this.edges.get(id);
    if (!edge) return;

    edge.active = false;
    edge.lastObserved = new Date().toISOString();
    await this.writeEdge(edge);
  }

  /**
   * Query edges with optional filters.
   */
  async query(query: EdgeQuery): Promise<GraphEdge[]> {
    await this.loadEdges();

    let results = Array.from(this.edges.values()).filter(e => e.active);

    if (query.from) {
      results = results.filter(e => e.from === query.from);
    }
    if (query.relationship) {
      results = results.filter(e => e.relationship === query.relationship);
    }
    if (query.to) {
      results = results.filter(e => e.to === query.to);
    }
    if (query.minConfidence) {
      results = results.filter(e => e.confidence >= query.minConfidence!);
    }

    return results;
  }

  /**
   * Get all edges connected to a specific node.
   */
  async getEdgesForNode(nodeId: string): Promise<GraphEdge[]> {
    await this.loadEdges();

    return Array.from(this.edges.values()).filter(
      e => e.active && (e.from === nodeId || e.to === nodeId)
    );
  }

  /**
   * Remove all edges for a node (used when deleting a node).
   */
  async removeEdgesForNode(nodeId: string): Promise<void> {
    await this.loadEdges();

    for (const [id, edge] of this.edges.entries()) {
      if (edge.from === nodeId || edge.to === nodeId) {
        edge.active = false;
        edge.lastObserved = new Date().toISOString();
        await this.writeEdge(edge);
      }
    }
  }

  /**
   * Get all edges of a specific relationship type.
   */
  async getByType(relationship: string): Promise<GraphEdge[]> {
    await this.loadEdges();
    return Array.from(this.edges.values()).filter(
      e => e.active && e.relationship === relationship
    );
  }

  /**
   * Get statistics.
   */
  async statistics(): Promise<EdgeStatistics> {
    await this.loadEdges();
    const active = Array.from(this.edges.values()).filter(e => e.active);

    const byType: Record<string, number> = {};
    for (const edge of active) {
      byType[edge.relationship] = (byType[edge.relationship] || 0) + 1;
    }

    return {
      total: active.length,
      byType,
    };
  }

  /**
   * Health check.
   */
  async health(): Promise<boolean> {
    try {
      await fs.access(this.edgesPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private async writeEdge(edge: GraphEdge): Promise<void> {
    const filePath = path.join(this.edgesPath, `${sanitizeId(edge.id)}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(edge, null, 2), 'utf-8');
  }

  private async loadEdges(): Promise<void> {
    if (this.edges.size > 0) return;

    try {
      const files = await fs.readdir(this.edgesPath);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
          const edge: GraphEdge = JSON.parse(await fs.readFile(path.join(this.edgesPath, file), 'utf-8'));
          this.edges.set(edge.id, edge);
        } catch {
          continue;
        }
      }
    } catch {
      // Directory doesn't exist yet
    }
  }

  private merge(existing: GraphEdge, incoming: Omit<GraphEdge, 'id' | 'firstObserved' | 'lastObserved' | 'active'>): GraphEdge {
    const updated: GraphEdge = {
      ...existing,
      confidence: Math.max(existing.confidence, incoming.confidence),
      weight: (existing.weight || 1.0) + (incoming.weight || 1.0),
      sources: [...new Set([...(existing.sources || []), ...(incoming.sources || [])])],
      lastObserved: new Date().toISOString(),
    };

    this.writeEdge(updated);
    this.edges.set(updated.id, updated);

    return updated;
  }
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-z0-9|_-]/gi, '_').toLowerCase();
}
