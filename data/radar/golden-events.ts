import type { RawArtifact, RadarSourceDefinition } from '@/services/radar/types';
import { createHash } from 'node:crypto';

function hash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export interface GoldenEvent {
  id: string;
  description: string;
  scenario: GoldenScenario;
  source: Partial<RadarSourceDefinition>;
  artifacts: RawArtifact[];
  expectedBehavior: {
    changeType: 'new' | 'changed' | 'unchanged';
    shouldCreateCluster: boolean;
    shouldMergeWithExisting: boolean;
    expectedEntities: string[];
    expectedGeo: string[];
  };
}

export type GoldenScenario =
  | 'new_event'
  | 'changed_page'
  | 'duplicate_event'
  | 'multi_source_same_event'
  | 'false_signal'
  | 'contradictory_sources'
  | 'malformed_source'
  | 'source_outage';

export const GOLDEN_EVENTS: GoldenEvent[] = [
  {
    id: 'ge-001',
    description: 'MP Government announces new road project in Rewa',
    scenario: 'new_event',
    source: { id: 'radar-mpinfo-html', authorityClass: 'PRIMARY', primarySource: true },
    artifacts: [
      {
        sourceId: 'radar-mpinfo-html',
        url: 'https://mpinfo.org/rewa-highway',
        retrievedAt: '2026-09-29T10:00:00.000Z',
        title: 'New Highway Project Approved for Rewa',
        content: 'The MP Government today approved a 50km highway project connecting Rewa and Sidhi.',
        contentHash: hash('The MP Government today approved a 50km highway project connecting Rewa and Sidhi.'),
        contentLength: 84,
        metadata: {},
      },
    ],
    expectedBehavior: {
      changeType: 'new',
      shouldCreateCluster: true,
      shouldMergeWithExisting: false,
      expectedEntities: ['Government of Madhya Pradesh'],
      expectedGeo: ['rewa-district', 'mp', 'india'],
    },
  },
  {
    id: 'ge-002',
    description: 'Rewa district notices page updated with new order',
    scenario: 'changed_page',
    source: { id: 'radar-rewa-nic', authorityClass: 'PRIMARY', primarySource: true },
    artifacts: [
      {
        sourceId: 'radar-rewa-nic',
        url: 'https://rewa.nic.in/notices',
        retrievedAt: '2026-09-29T10:05:00.000Z',
        title: 'District Orders',
        content: 'Collector Rewa imposes Section 144 in Rewa city due to upcoming elections.',
        contentHash: hash('Collector Rewa imposes Section 144 in Rewa city due to upcoming elections.'),
        contentLength: 75,
        metadata: {},
      },
    ],
    expectedBehavior: {
      changeType: 'changed',
      shouldCreateCluster: true,
      shouldMergeWithExisting: false,
      expectedEntities: ['Collector Rewa'],
      expectedGeo: ['rewa-city', 'rewa-district', 'mp', 'india'],
    },
  },
  {
    id: 'ge-003',
    description: 'Same government announcement from two sources',
    scenario: 'duplicate_event',
    source: { id: 'radar-pib-national', authorityClass: 'PRIMARY', primarySource: true },
    artifacts: [
      {
        sourceId: 'radar-pib-national',
        url: 'https://pib.gov.in/rewa-highway',
        retrievedAt: '2026-09-29T10:10:00.000Z',
        title: 'New Highway Project Approved for Rewa',
        content: 'The MP Government today approved a 50km highway project connecting Rewa and Sidhi.',
        contentHash: hash('The MP Government today approved a 50km highway project connecting Rewa and Sidhi.'),
        contentLength: 84,
        metadata: {},
      },
    ],
    expectedBehavior: {
      changeType: 'new',
      shouldCreateCluster: false,
      shouldMergeWithExisting: true,
      expectedEntities: ['Government of Madhya Pradesh'],
      expectedGeo: ['rewa-district', 'mp', 'india'],
    },
  },
  {
    id: 'ge-004',
    description: 'Road project covered by PIB, Nai Dunia, and Bhaskar',
    scenario: 'multi_source_same_event',
    source: { id: 'radar-bhaskar-mp-rss', authorityClass: 'GENERAL_MEDIA', primarySource: false },
    artifacts: [
      {
        sourceId: 'radar-bhaskar-mp-rss',
        url: 'https://bhaskar.com/rewa-highway',
        retrievedAt: '2026-09-29T10:15:00.000Z',
        title: 'Rewa-Sidhi highway gets green signal',
        content: 'In a major boost to infrastructure, the Rewa-Sidhi highway has been approved.',
        contentHash: hash('In a major boost to infrastructure, the Rewa-Sidhi highway has been approved.'),
        contentLength: 77,
        metadata: {},
      },
    ],
    expectedBehavior: {
      changeType: 'new',
      shouldCreateCluster: false,
      shouldMergeWithExisting: true,
      expectedEntities: [],
      expectedGeo: ['rewa-district'],
    },
  },
  {
    id: 'ge-005',
    description: 'Non-event content change (website footer updated)',
    scenario: 'false_signal',
    source: { id: 'radar-mphc-html', authorityClass: 'JUDICIAL', primarySource: true },
    artifacts: [
      {
        sourceId: 'radar-mphc-html',
        url: 'https://mphc.gov.in/',
        retrievedAt: '2026-09-29T10:20:00.000Z',
        title: 'Home Page',
        content: 'Copyright 2026 MP High Court. All rights reserved.',
        contentHash: hash('Copyright 2026 MP High Court. All rights reserved.'),
        contentLength: 50,
        metadata: {},
      },
    ],
    expectedBehavior: {
      changeType: 'unchanged',
      shouldCreateCluster: false,
      shouldMergeWithExisting: false,
      expectedEntities: ['MP High Court'],
      expectedGeo: ['mp'],
    },
  },
  {
    id: 'ge-006',
    description: 'Source A says bridge approved, Source B says bridge rejected',
    scenario: 'contradictory_sources',
    source: { id: 'radar-naidunia-rss', authorityClass: 'GENERAL_MEDIA', primarySource: false },
    artifacts: [
      {
        sourceId: 'radar-naidunia-rss',
        url: 'https://naidunia.com/rewa-bridge-rejected',
        retrievedAt: '2026-09-29T10:25:00.000Z',
        title: 'Rewa Bridge Project Rejected',
        content: 'The controversial bridge project in Rewa has been rejected by MP Police and authorities.',
        contentHash: hash('The controversial bridge project in Rewa has been rejected by MP Police and authorities.'),
        contentLength: 88,
        metadata: {},
      },
    ],
    expectedBehavior: {
      changeType: 'new',
      shouldCreateCluster: false,
      shouldMergeWithExisting: true,
      expectedEntities: ['MP Police'],
      expectedGeo: ['rewa-district'],
    },
  },
  {
    id: 'ge-007',
    description: 'Malformed HTML with script injection attempt',
    scenario: 'malformed_source',
    source: { id: 'radar-rewa-nic', authorityClass: 'PRIMARY', primarySource: true },
    artifacts: [
      {
        sourceId: 'radar-rewa-nic',
        url: 'https://rewa.nic.in/notices',
        retrievedAt: '2026-09-29T10:30:00.000Z',
        title: 'Notices',
        content: '<script>alert(1)</script><h2>New Notice from Rewa Municipal Corporation</h2>',
        contentHash: hash('<script>alert(1)</script><h2>New Notice from Rewa Municipal Corporation</h2>'),
        contentLength: 76,
        metadata: {},
      },
    ],
    expectedBehavior: {
      changeType: 'unchanged',
      shouldCreateCluster: false,
      shouldMergeWithExisting: false,
      expectedEntities: ['Rewa Municipal Corporation'],
      expectedGeo: ['rewa-district'],
    },
  },
  {
    id: 'ge-008',
    description: 'Source returns 503 outage',
    scenario: 'source_outage',
    source: { id: 'radar-mpinfo-html', authorityClass: 'PRIMARY', primarySource: true },
    artifacts: [],
    expectedBehavior: {
      changeType: 'unchanged',
      shouldCreateCluster: false,
      shouldMergeWithExisting: false,
      expectedEntities: [],
      expectedGeo: [],
    },
  },
];
