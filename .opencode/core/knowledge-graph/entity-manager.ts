/**
 * THE BREAKDOWN OS — Knowledge Graph Entity Manager
 *
 * Manages nodes in the Knowledge Graph.
 * Handles CRUD, deduplication, and node-level statistics.
 *
 * Every object becomes a node:
 *   Person, Organization, Company, Country, State, District, City,
 *   Law, Policy, Scheme, Budget, Report, Committee, Court Case,
 *   Technology, Project, Event, Article, Dataset, Statistic
 */

import type { GraphNode, GraphConfig, NodeStatistics } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class EntityManager {
  private nodesPath: string;
  private typeIndex: Map<string, Set<string>> = new Map();  // type → node IDs
  private aliasIndex: Map<string, Set<string>> = new Map(); // alias → node IDs

  constructor(config: GraphConfig) {
    this.nodesPath = config.store.nodes_path;
  }

  /**
   * Create a new node. If a node with this ID exists, update it.
   * Checks aliases for duplicates before creating.
   */
  async create(node: Omit<GraphNode, 'firstSeen' | 'lastSeen' | 'storyCount' | 'active'>): Promise<GraphNode> {
    // Check for existing node by ID
    const existing = await this.get(node.id);
    if (existing) {
      return this.merge(existing, node);
    }

    // Check for duplicate by alias
    const duplicate = await this.findByAlias(node.aliases || []);
    if (duplicate) {
      return this.merge(duplicate, node);
    }

    const now = new Date().toISOString();
    const newNode: GraphNode = {
      ...node,
      firstSeen: now,
      lastSeen: now,
      storyCount: 0,
      active: true,
    };

    await this.writeNode(newNode);
    this.addToIndices(newNode);

    return newNode;
  }

  /**
   * Update an existing node. If the node doesn't exist, throw.
   */
  async update(id: string, data: Partial<GraphNode>): Promise<GraphNode> {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Node '${id}' not found`);
    }

    const updated: GraphNode = {
      ...existing,
      ...data,
      id: existing.id, // never change ID
      lastSeen: new Date().toISOString(),
    };

    // Merge aliases
    if (data.aliases) {
      updated.aliases = [...new Set([...(existing.aliases || []), ...data.aliases])];
    }

    // Merge metadata
    if (data.metadata) {
      updated.metadata = { ...(existing.metadata || {}), ...data.metadata };
    }

    await this.writeNode(updated);
    this.removeFromIndices(existing);
    this.addToIndices(updated);

    return updated;
  }

  /**
   * Soft-delete a node.
   */
  async delete(id: string): Promise<void> {
    const node = await this.get(id);
    if (!node) return;

    node.active = false;
    node.lastSeen = new Date().toISOString();
    await this.writeNode(node);
    // Keep in indices but mark inactive
  }

  /**
   * Get a node by its canonical ID.
   */
  async get(id: string): Promise<GraphNode | null> {
    const filePath = path.join(this.nodesPath, `${sanitizeId(id)}.json`);
    try {
      return JSON.parse(await fs.readFile(filePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Find nodes by entity name or alias.
   */
  async find(query: string): Promise<GraphNode[]> {
    const results: GraphNode[] = [];
    const q = query.toLowerCase();

    // Search by alias index
    for (const [alias, ids] of this.aliasIndex.entries()) {
      if (alias.includes(q) || q.includes(alias)) {
        for (const id of ids) {
          const node = await this.get(id);
          if (node && node.active) results.push(node);
        }
      }
    }

    // Search by direct file scan for label match
    const allNodes = await this.getAllNodes();
    for (const node of allNodes) {
      if (node.active && node.label.toLowerCase().includes(q)) {
        if (!results.find(r => r.id === node.id)) {
          results.push(node);
        }
      }
    }

    return results.slice(0, 50);
  }

  /**
   * Get all nodes of a specific type.
   */
  async getByType(type: string): Promise<GraphNode[]> {
    const ids = this.typeIndex.get(type);
    if (!ids) return [];

    const results: GraphNode[] = [];
    for (const id of ids) {
      const node = await this.get(id);
      if (node && node.active) results.push(node);
    }
    return results;
  }

  /**
   * Load all indices from disk.
   */
  async loadIndices(): Promise<void> {
    const nodes = await this.getAllNodes();
    for (const node of nodes) {
      this.addToIndices(node);
    }
  }

  /**
   * Get statistics about nodes.
   */
  async statistics(): Promise<NodeStatistics> {
    const nodes = await this.getAllNodes();
    const active = nodes.filter(n => n.active);

    const byType: Record<string, number> = {};
    const storyCounts: Array<{ id: string; count: number }> = [];

    for (const node of active) {
      byType[node.type] = (byType[node.type] || 0) + 1;
      storyCounts.push({ id: node.id, count: node.storyCount || 0 });
    }

    // Top 10 most connected (by story count)
    const topConnected = storyCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: active.length,
      byType,
      topConnected,
    };
  }

  /**
   * Health check.
   */
  async health(): Promise<boolean> {
    try {
      await fs.access(this.nodesPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private async writeNode(node: GraphNode): Promise<void> {
    const filePath = path.join(this.nodesPath, `${sanitizeId(node.id)}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(node, null, 2), 'utf-8');
  }

  private async getAllNodes(): Promise<GraphNode[]> {
    const nodes: GraphNode[] = [];
    try {
      const files = await fs.readdir(this.nodesPath);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
          const content = JSON.parse(await fs.readFile(path.join(this.nodesPath, file), 'utf-8'));
          nodes.push(content);
        } catch {
          continue;
        }
      }
    } catch {
      // Directory doesn't exist yet
    }
    return nodes;
  }

  private async findByAlias(aliases: string[]): Promise<GraphNode | null> {
    for (const alias of aliases) {
      const key = alias.toLowerCase().trim();
      const ids = this.aliasIndex.get(key);
      if (ids) {
        for (const id of ids) {
          const node = await this.get(id);
          if (node && node.active) return node;
        }
      }
      // Fuzzy by checking partial match
      for (const [indexAlias, indexIds] of this.aliasIndex.entries()) {
        if (indexAlias.includes(key) || key.includes(indexAlias)) {
          for (const id of indexIds) {
            const node = await this.get(id);
            if (node && node.active) return node;
          }
        }
      }
    }
    return null;
  }

  private merge(existing: GraphNode, incoming: Omit<GraphNode, 'firstSeen' | 'lastSeen' | 'storyCount' | 'active'>): GraphNode {
    const merged: GraphNode = {
      ...existing,
      label: incoming.label || existing.label,
      description: incoming.description || existing.description,
      aliases: [...new Set([...(existing.aliases || []), ...(incoming.aliases || [])])],
      metadata: { ...(existing.metadata || {}), ...(incoming.metadata || {}) },
      lastSeen: new Date().toISOString(),
      storyCount: (existing.storyCount || 0) + 1,
    };

    // Write merged node
    this.writeNode(merged);
    this.removeFromIndices(existing);
    this.addToIndices(merged);

    return merged;
  }

  private addToIndices(node: GraphNode): void {
    // Type index
    if (!this.typeIndex.has(node.type)) this.typeIndex.set(node.type, new Set());
    this.typeIndex.get(node.type)!.add(node.id);

    // Alias index
    const allNames = [node.label.toLowerCase(), ...(node.aliases || []).map(a => a.toLowerCase().trim())];
    for (const name of allNames) {
      if (!name || name.length < 2) continue;
      if (!this.aliasIndex.has(name)) this.aliasIndex.set(name, new Set());
      this.aliasIndex.get(name)!.add(node.id);
    }
  }

  private removeFromIndices(node: GraphNode): void {
    const typeSet = this.typeIndex.get(node.type);
    if (typeSet) typeSet.delete(node.id);
  }
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}
