import type { StoryJSON, TopicJSON, EntityJSON } from '@/utils/types';
import type { GraphNode, NodeType } from './graphTypes';

function slugToId(slug: string, prefix: string): string {
  return `${prefix}:${slug}`;
}

export function extractStoryNodes(story: StoryJSON): GraphNode[] {
  const nodes: GraphNode[] = [];

  nodes.push({
    id: slugToId(story.slug, 'story'),
    type: 'story',
    title: story.headline,
    slug: story.slug,
    image: story.heroImage,
  });

  if (story.author) {
    nodes.push({
      id: slugToId(story.author.name.toLowerCase().replace(/\s+/g, '-'), 'person'),
      type: 'person',
      title: story.author.name,
      slug: story.author.name.toLowerCase().replace(/\s+/g, '-'),
    });
  }

  for (const tag of story.tags) {
    nodes.push({
      id: slugToId(tag.toLowerCase().replace(/\s+/g, '-'), 'topic'),
      type: 'topic',
      title: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
    });
  }

  for (const s of story.relatedStories) {
    nodes.push({
      id: slugToId(s.slug, 'story'),
      type: 'story',
      title: s.headline,
      slug: s.slug,
    });
  }

  for (const e of story.relatedEntities) {
    const nodeType = mapEntityType(e.type);
    nodes.push({
      id: slugToId(e.slug, nodeType),
      type: nodeType,
      title: e.name,
      slug: e.slug,
    });
  }

  for (const s of story.sources) {
    nodes.push({
      id: slugToId(s.name.toLowerCase().replace(/\s+/g, '-'), 'source'),
      type: 'source',
      title: s.name,
      slug: s.name.toLowerCase().replace(/\s+/g, '-'),
    });
  }

  return nodes;
}

export function extractTopicNodes(topic: TopicJSON): GraphNode[] {
  const nodes: GraphNode[] = [];

  nodes.push({
    id: slugToId(topic.slug, 'topic'),
    type: 'topic',
    title: topic.name,
    slug: topic.slug,
    image: topic.image,
  });

  for (const s of topic.stories) {
    nodes.push({
      id: slugToId(s.slug, 'story'),
      type: 'story',
      title: s.headline,
      slug: s.slug,
    });
  }

  const entityGroups = [
    { items: topic.people, type: 'person' as const },
    { items: topic.organizations, type: 'organization' as const },
    { items: topic.policies, type: 'policy' as const },
    { items: topic.budgets, type: 'budget' as const },
    { items: topic.reports, type: 'report' as const },
  ];

  for (const group of entityGroups) {
    for (const item of group.items) {
      nodes.push({
        id: slugToId(item.slug, group.type),
        type: group.type,
        title: item.name,
        slug: item.slug,
      });
    }
  }

  return nodes;
}

export function extractEntityNodes(entity: EntityJSON): GraphNode[] {
  const nodes: GraphNode[] = [];

  const nodeType = mapEntityType(entity.type);
  nodes.push({
    id: slugToId(entity.slug, nodeType),
    type: nodeType,
    title: entity.name,
    slug: entity.slug,
    image: entity.image,
  });

  if (entity.relatedStories) {
    for (const s of entity.relatedStories) {
      nodes.push({
        id: slugToId(s.slug, 'story'),
        type: 'story',
        title: s.headline,
        slug: s.slug,
      });
    }
  }

  for (const s of entity.sources) {
    nodes.push({
      id: slugToId(s.name.toLowerCase().replace(/\s+/g, '-'), 'source'),
      type: 'source',
      title: s.name,
      slug: s.name.toLowerCase().replace(/\s+/g, '-'),
    });
  }

  return nodes;
}

function mapEntityType(type: string): NodeType {
  const map: Record<string, NodeType> = {
    person: 'person',
    organization: 'organization',
    country: 'country',
    policy: 'policy',
    scheme: 'scheme',
    budget: 'budget',
    event: 'event',
    report: 'report',
    dataset: 'dataset',
    topic: 'topic',
  };
  return map[type] || 'entity';
}


