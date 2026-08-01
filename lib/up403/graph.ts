import type { KnowledgeGraph, GraphNode, GraphEdge } from './types';
import { getDataById } from './loader';

export function buildConstituencyGraph(canonicalId: string): KnowledgeGraph {
  const byId = getDataById();
  const rec = byId.get(canonicalId);
  if (!rec) return { nodes: [], edges: [] };

  const nodes: Map<string, GraphNode> = new Map();
  const edges: GraphEdge[] = [];

  nodes.set(rec.canonical_constituency_id, {
    id: rec.canonical_constituency_id,
    type: 'constituency',
    label: rec.constituency_name,
  });

  if (rec.district) {
    const dId = `district:${rec.district}`;
    nodes.set(dId, { id: dId, type: 'district', label: rec.district });
    edges.push({ source: rec.canonical_constituency_id, target: dId, relationship: 'belongs_to_district' });
  }

  if (rec.division) {
    const divId = `division:${rec.division}`;
    nodes.set(divId, { id: divId, type: 'division', label: rec.division });
    edges.push({ source: rec.canonical_constituency_id, target: divId, relationship: 'belongs_to_division' });
  }

  if (rec.pc_name) {
    const pcId = `pc:${rec.pc_name}`;
    nodes.set(pcId, { id: pcId, type: 'pc', label: rec.pc_name });
    edges.push({ source: rec.canonical_constituency_id, target: pcId, relationship: 'belongs_to_pc' });
  }

  const persons: Array<{ id: string; name: string; role: 'MLA' | 'MP'; party: string }> = [];
  if (rec.current_mla_name) {
    persons.push({ id: `person:${rec.current_mla_name}`, name: rec.current_mla_name, role: 'MLA', party: rec.current_mla_party });
  }
  if (rec.current_mp_name) {
    persons.push({ id: `person:${rec.current_mp_name}`, name: rec.current_mp_name, role: 'MP', party: rec.current_mp_party });
  }

  for (const person of persons) {
    nodes.set(person.id, { id: person.id, type: 'person', label: `${person.name} (${person.role})` });
    edges.push({ source: rec.canonical_constituency_id, target: person.id, relationship: `has_${person.role.toLowerCase()}` });

    if (person.party) {
      const partyId = `party:${person.party}`;
      nodes.set(partyId, { id: partyId, type: 'party', label: person.party });
      edges.push({ source: person.id, target: partyId, relationship: 'belongs_to_party' });
    }
  }

  return {
    nodes: [...nodes.values()],
    edges,
  };
}

export function buildFullGraph(): KnowledgeGraph {
  const byId = getDataById();
  const allNodes: Map<string, GraphNode> = new Map();
  const allEdges: GraphEdge[] = [];

  for (const [id] of byId) {
    const g = buildConstituencyGraph(id);
    for (const node of g.nodes) {
      if (!allNodes.has(node.id)) {
        allNodes.set(node.id, node);
      }
    }
    allEdges.push(...g.edges);
  }

  return {
    nodes: [...allNodes.values()],
    edges: allEdges,
  };
}
