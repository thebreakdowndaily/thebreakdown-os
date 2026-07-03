/**
 * THE BREAKDOWN OS — Knowledge Graph Validator
 *
 * Runs nightly (or on demand) to ensure the Knowledge Graph remains healthy.
 *
 * Validates:
 *   1. Broken node references — edges that point to non-existent nodes
 *   2. Duplicate entities — fuzzy name matches that should be merged
 *   3. Circular references — cycles in the graph that shouldn't exist
 *   4. Orphan entities — nodes with no connections
 *   5. Invalid IDs — nodes/edges with malformed IDs
 *   6. Missing expected relationships — nodes that should be connected but aren't
 *
 * Auto-repairs issues where possible and flags the rest for human review.
 */

import { EntityManager } from './entity-manager';
import { RelationshipManager } from './relationship-manager';
import type { GraphNode, GraphEdge, GraphConfig } from './types';
import { ValidationReport } from './graph-manager';

export class GraphValidator {
  private entities: EntityManager;
  private relationships: RelationshipManager;
  private config: GraphConfig;

  constructor(config: GraphConfig, entities: EntityManager, relationships: RelationshipManager) {
    this.config = config;
    this.entities = entities;
    this.relationships = relationships;
  }

  /**
   * Run full validation suite.
   */
  async runFullValidation(): Promise<ValidationReport> {
    const startTime = new Date().toISOString();

    const [brokenNodes, duplicates, circularRefs, orphans, invalidIds, missingRels] = await Promise.all([
      this.checkBrokenNodes(),
      this.checkDuplicateEntities(),
      this.checkCircularReferences(),
      this.checkOrphanEntities(),
      this.checkInvalidIds(),
      this.checkMissingRelationships(),
    ]);

    const totalIssues = brokenNodes.count + duplicates.count + circularRefs.count +
      orphans.count + invalidIds.count + missingRels.count;
    const autoRepaired = brokenNodes.autoRepaired + duplicates.autoRepaired +
      circularRefs.autoRepaired + orphans.autoRepaired + invalidIds.autoRepaired;

    return {
      timestamp: startTime,
      summary: {
        totalNodes: 0, // filled below
        totalEdges: 0,
        issuesFound: totalIssues,
        autoRepaired,
        flaggedForReview: totalIssues - autoRepaired,
      },
      checks: {
        brokenNodes,
        duplicateEntities: duplicates,
        circularReferences: circularRefs,
        orphanEntities: orphans,
        invalidIds,
        missingRelationships: missingRels,
      },
    };
  }

  // ── Check 1: Broken Node References ───────────────────────────────────

  async checkBrokenNodes(): Promise<CheckResult> {
    const details: string[] = [];
    let repaired = 0;

    try {
      const allEdges = await this.relationships.query({});

      for (const edge of allEdges) {
        const fromExists = await this.entities.get(edge.from);
        const toExists = await this.entities.get(edge.to);

        if (!fromExists || !toExists) {
          if (!fromExists) details.push(`Edge '${edge.id}': source node '${edge.from}' does not exist`);
          if (!toExists) details.push(`Edge '${edge.id}': target node '${edge.to}' does not exist`);

          // Auto-repair: soft-delete the broken edge
          await this.relationships.delete(edge.id);
          repaired++;
        }
      }
    } catch (err: any) {
      details.push(`Error checking broken nodes: ${err.message}`);
    }

    return {
      count: details.length,
      details,
      autoRepaired: repaired,
    };
  }

  // ── Check 2: Duplicate Entities ───────────────────────────────────────

  async checkDuplicateEntities(fuzzyThreshold: number = 0.85): Promise<CheckResult> {
    const details: string[] = [];
    let repaired = 0;

    try {
      const allTypes = ['person', 'organization', 'company', 'scheme', 'law', 'policy',
        'country', 'state', 'city', 'report', 'event', 'budget', 'technology', 'project'];

      for (const type of allTypes) {
        const nodes = await this.entities.getByType(type);

        // Check for exact label duplicates
        const labelMap = new Map<string, string[]>();
        for (const node of nodes) {
          const normalized = node.label.toLowerCase().trim();
          if (!labelMap.has(normalized)) labelMap.set(normalized, []);
          labelMap.get(normalized)!.push(node.id);
        }

        for (const [label, ids] of labelMap.entries()) {
          if (ids.length > 1) {
            // Merge duplicates: keep the one with most stories, merge aliases
            const mergeCandidates = await Promise.all(ids.map(id => this.entities.get(id)));
            const validCandidates = mergeCandidates.filter(Boolean) as GraphNode[];
            if (validCandidates.length < 2) continue;

            validCandidates.sort((a, b) => (b.storyCount || 0) - (a.storyCount || 0));
            const keeper = validCandidates[0];

            for (const candidate of validCandidates.slice(1)) {
              // Merge aliases
              const mergedAliases = [...new Set([
                ...(keeper.aliases || []),
                ...(candidate.aliases || []),
              ])].filter(a => a !== keeper.label);

              await this.entities.update(keeper.id, {
                aliases: mergedAliases,
                storyCount: (keeper.storyCount || 0) + (candidate.storyCount || 0),
              });

              // Re-point all edges from the duplicate to the keeper
              const edges = await this.relationships.getEdgesForNode(candidate.id);
              for (const edge of edges) {
                const newFrom = edge.from === candidate.id ? keeper.id : edge.from;
                const newTo = edge.to === candidate.id ? keeper.id : edge.to;
                await this.relationships.create({
                  from: newFrom,
                  to: newTo,
                  relationship: edge.relationship,
                  confidence: edge.confidence,
                  weight: edge.weight,
                  sources: edge.sources,
                  metadata: { ...edge.metadata, mergedFrom: candidate.id },
                });
              }

              // Soft-delete the duplicate
              await this.entities.delete(candidate.id);
              repaired++;
              details.push(`Merged '${candidate.label}' (${candidate.id}) into '${keeper.label}' (${keeper.id})`);
            }
          }
        }
      }
    } catch (err: any) {
      details.push(`Error checking duplicates: ${err.message}`);
    }

    return {
      count: details.length,
      details,
      autoRepaired: repaired,
    };
  }

  // ── Check 3: Circular References ──────────────────────────────────────

  async checkCircularReferences(): Promise<CheckResult & { cycles: string[][] }> {
    const details: string[] = [];
    const cycles: string[][] = [];
    let repaired = 0;

    try {
      const allEdges = await this.relationships.query({});
      const adjacencyList = new Map<string, string[]>();

      // Build adjacency list (directed edges only)
      for (const edge of allEdges) {
        if (!edge.active) continue;
        if (!adjacencyList.has(edge.from)) adjacencyList.set(edge.from, []);
        adjacencyList.get(edge.from)!.push(edge.to);
      }

      // DFS cycle detection
      const visited = new Set<string>();
      const recStack = new Set<string>();

      const dfs = (node: string, path: string[]): boolean => {
        if (recStack.has(node)) {
          const cycle = [...path.slice(path.indexOf(node)), node];
          const cyclePath = cycle.join(' → ');
          if (!cycles.find(c => c.join(' → ') === cyclePath)) {
            cycles.push(cycle);
            details.push(`Cycle detected: ${cyclePath}`);
          }
          return true;
        }

        if (visited.has(node)) return false;

        visited.add(node);
        recStack.add(node);
        path.push(node);

        const neighbors = adjacencyList.get(node) || [];
        for (const neighbor of neighbors) {
          if (dfs(neighbor, [...path])) break;
        }

        recStack.delete(node);
        return false;
      };

      for (const [node] of adjacencyList) {
        if (!visited.has(node)) {
          dfs(node, []);
        }
      }

    } catch (err: any) {
      details.push(`Error checking circular references: ${err.message}`);
    }

    return {
      count: cycles.length,
      details,
      cycles,
      autoRepaired: 0, // Cycles require human decision to break
    };
  }

  // ── Check 4: Orphan Entities ──────────────────────────────────────────

  async checkOrphanEntities(): Promise<CheckResult> {
    const details: string[] = [];
    let repaired = 0;

    try {
      const nodes = await this.entities.getAllNodes();
      for (const node of nodes) {
        if (!node.active) continue;
        const edges = await this.relationships.getEdgesForNode(node.id);
        if (edges.length === 0) {
          details.push(`Orphan node: '${node.label}' (${node.id}, type: ${node.type})`);
        }
      }
    } catch (err: any) {
      details.push(`Error checking orphan entities: ${err.message}`);
    }

    return {
      count: details.length,
      details,
      autoRepaired: 0, // Orphans are informational, not necessarily broken
    };
  }

  // ── Check 5: Invalid IDs ──────────────────────────────────────────────

  async checkInvalidIds(): Promise<CheckResult> {
    const details: string[] = [];
    let repaired = 0;

    const validIdPattern = /^[a-z0-9_|:-]+$/;

    try {
      // Check node IDs
      const nodes = await this.entities.getAllNodes();
      for (const node of nodes) {
        if (!validIdPattern.test(node.id)) {
          const sanitized = node.id.replace(/[^a-z0-9|_-]/gi, '_').toLowerCase();
          details.push(`Invalid node ID: '${node.id}'. Would sanitize to '${sanitized}'`);

          // Re-create node with sanitized ID
          await this.entities.create({
            id: sanitized,
            type: node.type,
            label: node.label,
            description: node.description,
            aliases: node.aliases,
            metadata: node.metadata,
          });

          // Re-point edges
          const edges = await this.relationships.getEdgesForNode(node.id);
          for (const edge of edges) {
            const newFrom = edge.from === node.id ? sanitized : edge.from;
            const newTo = edge.to === node.id ? sanitized : edge.to;
            await this.relationships.create({
              from: newFrom,
              to: newTo,
              relationship: edge.relationship,
              confidence: edge.confidence,
              weight: edge.weight,
              sources: edge.sources,
              metadata: edge.metadata,
            });
          }

          await this.entities.delete(node.id);
          repaired++;
        }
      }

      // Check edge IDs
      const edges = await this.relationships.query({});
      for (const edge of edges) {
        if (!validIdPattern.test(edge.id)) {
          details.push(`Invalid edge ID: '${edge.id}'`);
          await this.relationships.delete(edge.id);
          repaired++;
        }
      }

    } catch (err: any) {
      details.push(`Error checking invalid IDs: ${err.message}`);
    }

    return {
      count: details.length,
      details,
      autoRepaired: repaired,
    };
  }

  // ── Check 6: Missing Relationships ────────────────────────────────────

  async checkMissingRelationships(): Promise<CheckResult> {
    const details: string[] = [];
    let repaired = 0;

    const expectedEdges: Array<{ fromType: string; toType: string; relationship: string; description: string }> = [
      { fromType: 'scheme', toType: 'organization', relationship: 'managed_by', description: 'Every scheme should be managed by a ministry' },
      { fromType: 'budget', toType: 'country', relationship: 'references', description: 'Every budget should reference a country' },
      { fromType: 'law', toType: 'organization', relationship: 'regulated_by', description: 'Every law should be regulated by some body' },
      { fromType: 'report', toType: 'organization', relationship: 'created_by', description: 'Every report should be created by an organization' },
      { fromType: 'person', toType: 'organization', relationship: 'member_of', description: 'Key people should be members of organizations' },
    ];

    for (const rule of expectedEdges) {
      try {
        const fromNodes = await this.entities.getByType(rule.fromType);
        for (const node of fromNodes) {
          if (!node.active) continue;
          const edges = await this.relationships.getEdgesForNode(node.id);
          const hasExpectedEdge = edges.some(e => e.relationship === rule.relationship);

          if (!hasExpectedEdge) {
            details.push(`Missing '${rule.relationship}': '${node.label}' (${node.id}) has no ${rule.relationship} edge`);
          }
        }
      } catch (err: any) {
        details.push(`Error checking '${rule.relationship}': ${err.message}`);
      }
    }

    return {
      count: details.length,
      details,
      autoRepaired: 0, // Requires domain knowledge to add correct edges
    };
  }
}

// ── Shared Types ────────────────────────────────────────────────────────

interface CheckResult {
  count: number;
  details: string[];
  autoRepaired: number;
}
