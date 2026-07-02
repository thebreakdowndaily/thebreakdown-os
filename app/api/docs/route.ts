import { NextResponse } from 'next/server';

const openApiDoc = {
  openapi: '3.1.0',
  info: {
    title: 'The Breakdown API',
    version: '1.0.0',
    description: 'REST API for The Breakdown editorial intelligence platform. Access stories, entities, topics, timelines, countries, organizations, knowledge graphs, fixes, and semantic search. Authenticate via x-api-key header. Public endpoints: /docs, /feed.',
    contact: { name: 'The Breakdown Team', url: 'https://thebreakdown.ai' },
  },
  servers: [{ url: '/api', description: 'Production API' }],
  security: [{ apiKeyAuth: [] }],
  paths: {
    '/stories': {
      get: {
        summary: 'List stories',
        description: 'Returns paginated list of stories with optional filtering by category, tag, author, and search.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search headline, summary, and tags.' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category.' },
          { name: 'tag', in: 'query', schema: { type: 'string' }, description: 'Filter by tag.' },
          { name: 'author', in: 'query', schema: { type: 'string' }, description: 'Filter by author name.' },
          { name: 'sort', in: 'query', schema: { type: 'string' }, description: 'Sort field.' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          '200': { description: 'Paginated list of stories.' },
          '401': { description: 'Missing or invalid API key.' },
          '429': { description: 'Rate limit exceeded.' },
        },
      },
    },
    '/stories/{slug}': {
      get: {
        summary: 'Get story by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Full story object.' }, '404': { description: 'Story not found.' } },
      },
    },
    '/entities': {
      get: {
        summary: 'List entities',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Filter by entity type.' },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: { '200': { description: 'Paginated list of entities.' } },
      },
    },
    '/entities/{slug}': {
      get: {
        summary: 'Get entity by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Full entity object.' }, '404': { description: 'Entity not found.' } },
      },
    },
    '/topics': {
      get: {
        summary: 'List topics',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: { '200': { description: 'Paginated list of topics.' } },
      },
    },
    '/topics/{slug}': {
      get: {
        summary: 'Get topic by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Full topic object.' }, '404': { description: 'Topic not found.' } },
      },
    },
    '/timelines': {
      get: {
        summary: 'List timelines',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: { '200': { description: 'Paginated list of timelines.' } },
      },
    },
    '/timelines/{id}': {
      get: {
        summary: 'Get timeline by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Full timeline object.' }, '404': { description: 'Timeline not found.' } },
      },
    },
    '/countries': {
      get: {
        summary: 'List countries',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: { '200': { description: 'Paginated list of countries.' } },
      },
    },
    '/countries/{slug}': {
      get: {
        summary: 'Get country by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Full country object.' }, '404': { description: 'Country not found.' } },
      },
    },
    '/organizations': {
      get: {
        summary: 'List organizations',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: { '200': { description: 'Paginated list of organizations.' } },
      },
    },
    '/organizations/{slug}': {
      get: {
        summary: 'Get organization by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Full organization object.' }, '404': { description: 'Organization not found.' } },
      },
    },
    '/graphs': {
      get: {
        summary: 'Knowledge graph query',
        description: 'Returns nodes and edges for the knowledge graph.',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Filter nodes by entity type.' },
          { name: 'entity', in: 'query', schema: { type: 'string' }, description: 'Get subgraph for a specific entity (slug).' },
        ],
        responses: { '200': { description: 'Graph with nodes and links.' } },
      },
    },
    '/statistics': {
      get: {
        summary: 'Platform statistics',
        description: 'Aggregate platform statistics.',
        responses: { '200': { description: 'Platform statistics object.' } },
      },
    },
    '/search': {
      get: {
        summary: 'Semantic search',
        description: 'Concept-aware semantic search across stories, entities, and topics.',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query.' },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['story', 'entity', 'topic'] } },
          { name: 'depth', in: 'query', schema: { type: 'integer', default: 2, maximum: 4 } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
        ],
        responses: { '200': { description: 'Semantic search results with concept trail.' } },
      },
    },
    '/fixes': {
      get: {
        summary: 'List fixes',
        description: 'Returns paginated list of The Fix frameworks.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: { '200': { description: 'Paginated list of fix frameworks.' } },
      },
    },
    '/fixes/{slug}': {
      get: {
        summary: 'Get fix by slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Full fix framework object.' }, '404': { description: 'Fix not found.' } },
      },
    },
    '/auth/keys': {
      get: {
        summary: 'List API keys (admin)',
        description: 'Returns all API keys with masked secrets. Requires admin privileges.',
        responses: { '200': { description: 'List of API keys.' }, '403': { description: 'Forbidden — admin only.' } },
      },
      post: {
        summary: 'Create API key (admin)',
        description: 'Creates a new API key with specified name and role. Requires admin privileges.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Mobile App' },
                  role: { type: 'string', enum: ['admin', 'editor', 'reader'], default: 'reader' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'New API key created.' }, '403': { description: 'Forbidden — admin only.' } },
      },
    },
    '/auth/keys/{keyId}': {
      delete: {
        summary: 'Revoke API key (admin)',
        description: 'Permanently revokes and deletes an API key. Requires admin privileges.',
        parameters: [{ name: 'keyId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Key deleted.' }, '403': { description: 'Forbidden — admin only.' } },
      },
    },
  },
  components: {
    securitySchemes: {
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for authentication. Obtain from /api/auth/keys (admin). Default dev key: dev-key-0000-0000-0000-000000000000',
      },
    },
    schemas: {
      StoryList: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Story' } },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              pageSize: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      Story: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: { type: 'string' },
          headline: { type: 'string' },
          summary: { type: 'string' },
          publishedAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          readingTime: { type: 'integer' },
          evidenceScore: { type: 'number' },
          category: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          author: {
            type: 'object',
            properties: { name: { type: 'string' }, bio: { type: 'string' } },
          },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(openApiDoc);
}
