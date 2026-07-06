import type { StoryJSON, TopicJSON, EntityJSON } from '@/utils/types';
import type { Graph, RelationType } from './graphTypes';

function id(slug: string, prefix: string): string {
  return `${prefix}:${slug}`;
}

export function buildStoryRelationships(graph: Graph, story: StoryJSON): void {
  const storyId = id(story.slug, 'story');

  for (const tag of story.tags) {
    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
    graph.edges.push({
      from: storyId,
      to: id(tagSlug, 'topic'),
      relation: 'covers',
      confidence: 0.9,
    });
  }

  if (story.author) {
    const authorSlug = story.author.name.toLowerCase().replace(/\s+/g, '-');
    graph.edges.push({
      from: storyId,
      to: id(authorSlug, 'person'),
      relation: 'mentions',
      confidence: 1.0,
    });
  }

  for (const rs of story.relatedStories) {
    graph.edges.push({
      from: storyId,
      to: id(rs.slug, 'story'),
      relation: 'references',
      confidence: 0.85,
    });
  }

  for (const re of story.relatedEntities) {
    const rel = mapEntityRelation(re.type);
    graph.edges.push({
      from: storyId,
      to: id(re.slug, re.type),
      relation: rel,
      confidence: 0.9,
    });
  }

  for (const s of story.sources) {
    const sourceSlug = s.name.toLowerCase().replace(/\s+/g, '-');
    graph.edges.push({
      from: storyId,
      to: id(sourceSlug, 'source'),
      relation: 'references',
      confidence: 0.95,
    });
  }
}

export function buildTopicRelationships(graph: Graph, topic: TopicJSON): void {
  const topicId = id(topic.slug, 'topic');

  for (const s of topic.stories) {
    graph.edges.push({
      from: topicId,
      to: id(s.slug, 'story'),
      relation: 'covers',
      confidence: 0.95,
    });
  }

  const groups: Array<{ items: Array<{ slug: string }>; type: string }> = [
    { items: topic.people, type: 'person' },
    { items: topic.organizations, type: 'organization' },
    { items: topic.policies, type: 'policy' },
    { items: topic.budgets, type: 'budget' },
    { items: topic.reports, type: 'report' },
  ];

  for (const group of groups) {
    for (const item of group.items) {
      graph.edges.push({
        from: topicId,
        to: id(item.slug, group.type),
        relation: 'related_to',
        confidence: 0.85,
      });
    }
  }
}

export function buildEntityRelationships(graph: Graph, entity: EntityJSON): void {
  const entityId = id(entity.slug, entity.type);

  for (const s of entity.relatedStories) {
    graph.edges.push({
      from: entityId,
      to: id(s.slug, 'story'),
      relation: 'mentions',
      confidence: 0.9,
    });
  }

  for (const src of entity.sources) {
    const sourceSlug = src.name.toLowerCase().replace(/\s+/g, '-');
    graph.edges.push({
      from: entityId,
      to: id(sourceSlug, 'source'),
      relation: 'references',
      confidence: 0.85,
    });
  }
}

function mapEntityRelation(type: string): RelationType {
  const map: Record<string, RelationType> = {
    person: 'mentions',
    organization: 'mentions',
    country: 'mentions',
    policy: 'analyzes',
    scheme: 'analyzes',
    budget: 'analyzes',
    event: 'mentions',
    report: 'references',
    dataset: 'references',
  };
  return map[type] || 'related_to';
}
