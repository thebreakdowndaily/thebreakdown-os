import type { StoryJSON, TopicJSON, EntityJSON } from '@/utils/types';
import { buildGraph, getNodeBySlug, getNodesByType } from './buildGraph';
import { getConnectedNodes, getRelatedStories, getTrendingConnections, getPathBetween } from './graphQueries';
import type { Graph, GraphNode, GraphEdge } from './graphTypes';
import { setGraph } from './graphCache';

const mockStories: StoryJSON[] = [
  {
    id: 'mgnrega-reform', slug: 'mgnrega-reform',
    headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment',
    summary: 'Two decades of India\'s flagship rural employment guarantee scheme.',
    heroImage: '/images/stories/mgnrega-20.jpg',
    publishedAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z',
    readingTime: 12, wordCount: 4200, verificationScore: 92,
    author: { name: 'Anjali Sharma', avatar: '/images/authors/anjali-sharma.jpg', bio: 'Senior Investigative Journalist covering rural development and policy.' },
    evidenceScore: 92, category: 'economy',
    tags: ['MGNREGA', 'rural employment', 'policy analysis', 'social schemes'],
    keyPoints: [], timeline: [], facts: [], claims: [], sources: [],
    datasets: [], charts: [], faq: [], primarySources: [],
    relatedStories: [{ slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: '', publishedAt: '', readingTime: 0, evidenceScore: 88, category: 'technology' }],
    relatedEntities: [
      { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' },
      { id: 'mgnrega', slug: 'mgnrega', name: 'MGNREGA', type: 'policy' },
    ],
  },
  {
    id: 'digital-payments-boom', slug: 'digital-payments-boom',
    headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution',
    summary: 'How UPI transformed rural financial inclusion.',
    heroImage: '/images/stories/digital-payments.jpg',
    publishedAt: '2026-06-12T08:00:00Z', updatedAt: '2026-06-12T08:00:00Z',
    readingTime: 8, wordCount: 2800, verificationScore: 88,
    author: { name: 'Vikram Patel' },
    evidenceScore: 88, category: 'technology',
    tags: ['UPI', 'digital payments', 'rural India', 'fintech'],
    keyPoints: [], timeline: [], facts: [], claims: [], sources: [],
    datasets: [], charts: [], faq: [], primarySources: [],
    relatedStories: [], relatedEntities: [],
  },
  {
    id: 'pm-fasal-bima-claims', slug: 'pm-fasal-bima-claims',
    headline: 'PM Fasal Bima Yojana: The Claims That Never Reached Farmers',
    summary: 'Investigation into delayed crop insurance claims.',
    heroImage: '/images/stories/fasal-bima.jpg',
    publishedAt: '2026-06-05T06:00:00Z', updatedAt: '2026-06-05T06:00:00Z',
    readingTime: 15, wordCount: 5200, verificationScore: 97,
    author: { name: 'Anjali Sharma' },
    evidenceScore: 97, category: 'policy',
    tags: ['crop insurance', 'agriculture', 'PMFBY', 'farmer welfare'],
    keyPoints: [], timeline: [], facts: [], claims: [], sources: [],
    datasets: [], charts: [], faq: [], primarySources: [],
    relatedStories: [], relatedEntities: [],
  },
];

const mockTopics: TopicJSON[] = [
  {
    id: 'agriculture', slug: 'agriculture',
    name: 'Agriculture',
    description: 'Stories, data, and analysis on Indian agriculture.',
    image: '/images/topics/agriculture.jpg',
    storyCount: 156, entityCount: 48, updatedAt: '2026-06-20T10:00:00Z',
    stories: [{ slug: 'pm-fasal-bima-claims', headline: 'PM Fasal Bima Yojana', summary: '', publishedAt: '', readingTime: 0, evidenceScore: 97, category: 'policy' }],
    people: [], organizations: [{ id: 'ministry-of-agriculture', slug: 'ministry-of-agriculture', name: 'Ministry of Agriculture', type: 'organization' }],
    policies: [{ id: 'pm-fasal-bima', slug: 'pm-fasal-bima', name: 'PM Fasal Bima Yojana', type: 'policy' }],
    budgets: [], reports: [], charts: [], countries: [{ id: 'india', slug: 'india', name: 'India', type: 'country' }],
  },
  {
    id: 'employment', slug: 'employment',
    name: 'Employment',
    description: 'Coverage of India\'s employment landscape.',
    image: '/images/topics/employment.jpg',
    storyCount: 112, entityCount: 35, updatedAt: '2026-06-18T09:00:00Z',
    stories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: '', publishedAt: '', readingTime: 0, evidenceScore: 92, category: 'economy' }],
    people: [], organizations: [], policies: [], budgets: [], reports: [], charts: [],
  },
];

const mockEntities: EntityJSON[] = [
  {
    id: 'mgnrega', slug: 'mgnrega',
    name: 'MGNREGA', type: 'policy',
    description: 'India\'s flagship rural employment guarantee programme.',
    aliases: ['MGNREGA', 'NREGA', 'Rural Employment Scheme'],
    storyCount: 42, evidenceScore: 94, updatedAt: '2026-06-20T10:00:00Z',
    timeline: [], datasets: [], statistics: {}, sources: [], faq: [],
    relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: '', publishedAt: '', readingTime: 0, evidenceScore: 92, category: 'economy' }],
    relatedEntities: [{ id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' }],
  },
  {
    id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development',
    name: 'Ministry of Rural Development', type: 'organization',
    description: 'Nodal ministry for rural development programs.',
    aliases: ['MoRD'],
    storyCount: 56, evidenceScore: 91, updatedAt: '2026-06-18T08:00:00Z',
    timeline: [], datasets: [], statistics: {}, sources: [], faq: [],
    relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: '', publishedAt: '', readingTime: 0, evidenceScore: 92, category: 'economy' }],
    relatedEntities: [
      { id: 'mgnrega', slug: 'mgnrega', name: 'MGNREGA', type: 'policy' },
      { id: 'pmgsy', slug: 'pmgsy', name: 'PM Gram Sadak Yojana', type: 'scheme' },
    ],
  },
  {
    id: 'india', slug: 'india',
    name: 'India', type: 'country',
    description: 'Republic of India.',
    storyCount: 450, updatedAt: '2026-06-20T10:00:00Z',
    timeline: [], datasets: [], statistics: {}, sources: [], faq: [],
    relatedStories: [{ slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: '', publishedAt: '', readingTime: 0, evidenceScore: 92, category: 'economy' }],
  },
  {
    id: 'rbi', slug: 'rbi',
    name: 'Reserve Bank of India', type: 'organization',
    description: 'India\'s central banking institution.',
    aliases: ['RBI', 'Central Bank of India'],
    storyCount: 89, evidenceScore: 96, updatedAt: '2026-06-18T14:00:00Z',
    timeline: [], datasets: [], statistics: {}, sources: [], faq: [],
    relatedStories: [{ slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: '', publishedAt: '', readingTime: 0, evidenceScore: 88, category: 'technology' }],
  },
];

export type { GraphNode, GraphEdge } from './graphTypes';
export type { ConnectedNode } from './graphQueries';

let _graph: Graph | null = null;

function getGraph(): Graph {
  if (!_graph) {
    _graph = buildGraph({ stories: mockStories, topics: mockTopics, entities: mockEntities });
    setGraph(_graph);
  }
  return _graph;
}

export function findNode(slug: string, prefix?: string) {
  return getNodeBySlug(getGraph(), slug, prefix);
}

export function nodesByType(type: string) {
  return getNodesByType(getGraph(), type);
}

export function connections(nodeId: string, options?: { maxDepth?: number; relation?: string; type?: string }) {
  return getConnectedNodes(getGraph(), nodeId, options as any);
}

export function relatedStories(nodeId: string, limit = 4) {
  return getRelatedStories(getGraph(), nodeId, limit);
}

export function trending(limit = 5) {
  return getTrendingConnections(getGraph(), limit);
}

export function path(fromId: string, toId: string) {
  return getPathBetween(getGraph(), fromId, toId);
}

export function storyNodeId(slug: string) { return `story:${slug}`; }
export function topicNodeId(slug: string) { return `topic:${slug}`; }
export function entityNodeId(slug: string, type: string) { return `${type}:${slug}`; }

export function getFullGraph(): Graph {
  return getGraph();
}

export function getGraphNodes(): GraphNode[] {
  return Array.from(getGraph().nodes.values());
}

export function getGraphEdges(): GraphEdge[] {
  return getGraph().edges;
}
