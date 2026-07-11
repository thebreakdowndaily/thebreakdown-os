'use client';

import GraphMini from './GraphMini';
import type { GraphNode, GraphEdge, NodeType } from '@/lib/graph/graphTypes';
import type { ConnectedNode } from '@/lib/graph/graphQueries';
import type { Story, Entity } from '@/types/canonical';

interface StoryGraphMiniProps {
  story: Story;
  relatedEntities: Entity[];
}

export default function StoryGraphMini({ story, relatedEntities }: StoryGraphMiniProps) {
  const centerNode: GraphNode = {
    id: `story-${story.slug}`,
    title: story.headline.length > 30 ? story.headline.substring(0, 27) + '...' : story.headline,
    type: 'story',
    slug: story.slug,
  };

  const connections: ConnectedNode[] = relatedEntities.map((entity) => {
    let nType: NodeType = 'topic';
    if (entity.type === 'person') nType = 'person';
    else if (entity.type === 'organization') nType = 'organization';
    else if (entity.type === 'policy') nType = 'policy';

    const targetNode: GraphNode = {
      id: `entity-${entity.slug}`,
      title: entity.name,
      type: nType,
      slug: entity.slug,
    };

    const edge: GraphEdge = {
      from: centerNode.id,
      to: targetNode.id,
      relation: 'related_to',
      confidence: 100,
    };

    return { node: targetNode, edge };
  });

  if (connections.length === 0) return null;

  return <GraphMini title="Knowledge Connections" connections={connections} centerNode={centerNode} />;
}
