export interface StoryNode {
  id: string;
  type: 'story';
  label: string;
}

export interface ClaimNode {
  id: string;
  type: 'claim';
  label: string;
  status: string;
}

export interface EvidenceNode {
  id: string;
  type: 'evidence';
  label: string;
}

export interface SourceNode {
  id: string;
  type: 'source';
  label: string;
  url?: string;
}

export interface CitationNode {
  id: string;
  type: 'citation';
  label: string;
  url?: string;
}

export type EvidenceGraphNode = StoryNode | ClaimNode | EvidenceNode | SourceNode | CitationNode;

export interface EvidenceGraphEdge {
  source: string;
  target: string;
  type: 'cites' | 'verifies' | 'refutes' | 'references';
}

export interface EvidenceGraph {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
}

export function buildEvidenceGraph(stories: any[]): EvidenceGraph {
  const nodes = new Map<string, EvidenceGraphNode>();
  const edges: EvidenceGraphEdge[] = [];

  const addNode = (node: EvidenceGraphNode) => {
    if (!nodes.has(node.id)) {
      nodes.set(node.id, node);
    }
  };

  const addEdge = (source: string, target: string, type: EvidenceGraphEdge['type']) => {
    if (!edges.some(e => e.source === source && e.target === target && e.type === type)) {
      edges.push({ source, target, type });
    }
  };

  const hashText = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return `hash-${Math.abs(hash)}`;
  };

  for (const story of stories) {
    const storyId = story.id || story.slug;
    addNode({ id: storyId, type: 'story', label: story.headline || story.title || 'Untitled Story' });

    const sources = story.sources || [];
    for (const src of sources) {
      const srcId = src.id || src.url || hashText(src.name);
      addNode({ id: srcId, type: 'source', label: src.name, url: src.url });
      addEdge(storyId, srcId, 'references');
    }

    const citations = story.citations || [];
    for (const cite of citations) {
      const citeId = cite.id || cite.url || hashText(cite.title);
      addNode({ id: citeId, type: 'citation', label: cite.title, url: cite.url });
      addEdge(storyId, citeId, 'references');
    }

    const claims = story.claims || [];
    claims.forEach((claim: any, index: number) => {
      const claimId = String(claim.id || `${storyId}-claim-${index}`);
      addNode({ id: claimId, type: 'claim', label: String(claim.claim), status: String(claim.verification || claim.status || 'unverified') });
      addEdge(storyId, claimId, 'references');

      let evId: string = '';
      let isNegative = false;
      if (claim.explanation || claim.evidence || claim.supportingEvidence) {
        const evText = String(claim.explanation || claim.evidence || claim.supportingEvidence);
        evId = claim.evidenceId ? String(claim.evidenceId) : hashText(evText);
        addNode({ id: evId, type: 'evidence', label: evText });
        
        isNegative = claim.verification === 'false' || claim.verification === 'misleading' || claim.status === 'refuted';
        addEdge(evId, claimId, isNegative ? 'refutes' : 'verifies');
      }

      if (claim.source) {
        const srcId = hashText(String(claim.source));
        addNode({ id: srcId, type: 'source', label: String(claim.source) });
        if (evId !== '') {
          addEdge(evId, srcId, 'cites');
        } else {
          addEdge(claimId, srcId, 'cites');
        }
      }
    });
  }

  return { nodes: Array.from(nodes.values()), edges };
}

export function getClaimLineage(graph: EvidenceGraph, claimId: string): EvidenceGraph {
  const nodes = new Map<string, EvidenceGraphNode>();
  const edges: EvidenceGraphEdge[] = [];

  const addNode = (id: string) => {
    const node = graph.nodes.find(n => n.id === id);
    if (node) nodes.set(id, node);
  };

  const addEdge = (edge: EvidenceGraphEdge) => {
    edges.push(edge);
    addNode(edge.source);
    addNode(edge.target);
  };

  addNode(claimId);

  graph.edges.forEach(edge => {
    if (edge.target === claimId && edge.type === 'references') {
      // Story -> Claim
      addEdge(edge);
    }
    if (edge.target === claimId && (edge.type === 'verifies' || edge.type === 'refutes')) {
      // Evidence -> Claim
      addEdge(edge);
      // Evidence -> Source
      graph.edges.forEach(subEdge => {
        if (subEdge.source === edge.source && subEdge.type === 'cites') {
          addEdge(subEdge);
        }
      });
    }
    if (edge.source === claimId && edge.type === 'cites') {
      // Claim -> Source
      addEdge(edge);
    }
  });

  const uniqueEdges = edges.filter((e, idx, self) => 
    self.findIndex(t => t.source === e.source && t.target === e.target && t.type === e.type) === idx
  );

  return {
    nodes: Array.from(nodes.values()),
    edges: uniqueEdges
  };
}
