import { describe, it, expect } from 'vitest';
import { SourceLineageGraph } from '../coverage/source-lineage';
import type { StoryCluster } from '@/types/newsroom-intelligence';
import type { RadarSourceDefinition } from '../types';

describe('SourceLineageGraph', () => {
  const graph = new SourceLineageGraph();

  // Register nodes
  graph.registerNode({
    sourceId: 'src_hc',
    name: 'MP High Court Official',
    nodeType: 'primary_institution',
  });

  graph.registerNode({
    sourceId: 'src_pti',
    name: 'PTI Wire MP Desk',
    nodeType: 'wire_service',
  });

  graph.registerNode({
    sourceId: 'src_regional_1',
    name: 'Regional Daily A',
    nodeType: 'regional_press',
    syndicatedFrom: 'wire:pti',
  });

  graph.registerNode({
    sourceId: 'src_regional_2',
    name: 'Regional Daily B',
    nodeType: 'regional_press',
    syndicatedFrom: 'wire:pti',
  });

  graph.registerNode({
    sourceId: 'src_independent_investigative',
    name: 'Bhopal Independent Reporter',
    nodeType: 'regional_press',
  });

  const sourceDefs: RadarSourceDefinition[] = [
    {
      id: 'src_hc',
      name: 'MP High Court Official',
      publisher: 'MP High Court',
      sourceType: 'COURTS',
      adapter: 'rss',
      url: 'https://mphc.gov.in/feed',
      canonicalDomain: 'mphc.gov.in',
      officialStatus: 'official_primary',
      country: 'IN',
      beat: 'courts',
      pollIntervalMinutes: 30,
      collectorType: 'rss',
      enabled: true,
      authorityClass: 'PRIMARY',
      primarySource: true,
      topics: ['judiciary'],
      geographies: ['MP'],
      priority: 'P0',
      refreshPolicy: 'HOURLY',
      approvalStatus: 'ACTIVE',
    },
    {
      id: 'src_regional_1',
      name: 'Regional Daily A',
      publisher: 'Daily A',
      sourceType: 'NEWS',
      adapter: 'rss',
      url: 'https://dailya.com/feed',
      canonicalDomain: 'dailya.com',
      officialStatus: 'media',
      syndicatedFrom: 'wire:pti',
      country: 'IN',
      beat: 'courts',
      pollIntervalMinutes: 30,
      collectorType: 'rss',
      enabled: true,
      authorityClass: 'HIGH_QUALITY_SECONDARY',
      primarySource: false,
      topics: ['general'],
      geographies: ['MP'],
      priority: 'P1',
      refreshPolicy: 'HOURLY',
      approvalStatus: 'ACTIVE',
    },
    {
      id: 'src_regional_2',
      name: 'Regional Daily B',
      publisher: 'Daily B',
      sourceType: 'NEWS',
      adapter: 'rss',
      url: 'https://dailyb.com/feed',
      canonicalDomain: 'dailyb.com',
      officialStatus: 'media',
      syndicatedFrom: 'wire:pti',
      country: 'IN',
      beat: 'courts',
      pollIntervalMinutes: 30,
      collectorType: 'rss',
      enabled: true,
      authorityClass: 'HIGH_QUALITY_SECONDARY',
      primarySource: false,
      topics: ['general'],
      geographies: ['MP'],
      priority: 'P1',
      refreshPolicy: 'HOURLY',
      approvalStatus: 'ACTIVE',
    },
    {
      id: 'src_independent_investigative',
      name: 'Bhopal Independent Reporter',
      publisher: 'Independent',
      sourceType: 'NEWS',
      adapter: 'rss',
      url: 'https://bhopalreporter.in/feed',
      canonicalDomain: 'bhopalreporter.in',
      officialStatus: 'media',
      country: 'IN',
      beat: 'courts',
      pollIntervalMinutes: 30,
      collectorType: 'rss',
      enabled: true,
      authorityClass: 'HIGH_QUALITY_SECONDARY',
      primarySource: false,
      topics: ['investigative'],
      geographies: ['BHOPAL'],
      priority: 'P1',
      refreshPolicy: 'HOURLY',
      approvalStatus: 'ACTIVE',
    },
  ];

  it('detects duplicate wire syndication and avoids false multi-source corroboration', () => {
    // Cluster reported only by two regional papers syndicating the same PTI wire
    const clusterOnlyWireEchoes: StoryCluster = {
      id: 'cl_wire_echo',
      title: 'PTI Syndicate Echo',
      summary: '',
      status: 'active',
      firstDetectedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      geographicSpread: ['Bhopal'],
      sourceIds: ['src_regional_1', 'src_regional_2'],
      observationIds: ['obs_1', 'obs_2'],
      claimIds: [],
      entities: [],
      primarySourceCount: 0,
      independentSourceCount: 1,
    };

    const analysis = graph.analyzeClusterCorroboration(clusterOnlyWireEchoes, sourceDefs);

    expect(analysis.totalObservations).toBe(2);
    // Even though 2 newspapers reported it, both syndicated wire:pti -> only 1 independent source
    expect(analysis.independentSourceCount).toBe(1);
    expect(analysis.syndicatedSourceCount).toBe(1);
    expect(analysis.isGenuinelyCorroborated).toBe(false);
    expect(analysis.duplicateChains).toHaveLength(1);
    expect(analysis.duplicateChains[0].wireOrOrigin).toBe('wire:pti');
  });

  it('recognizes genuine corroboration when origin or independent sources are present', () => {
    // Cluster reported by High Court (origin) + Regional Daily A (wire)
    const clusterWithOrigin: StoryCluster = {
      id: 'cl_origin_corroborated',
      title: 'Court Order Corroborated',
      summary: '',
      status: 'active',
      firstDetectedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      geographicSpread: ['Bhopal'],
      sourceIds: ['src_hc', 'src_regional_1'],
      observationIds: ['obs_3', 'obs_4'],
      claimIds: [],
      entities: [],
      primarySourceCount: 1,
      independentSourceCount: 2,
    };

    const analysis = graph.analyzeClusterCorroboration(clusterWithOrigin, sourceDefs);
    expect(analysis.originSourcePresent).toBe(true);
    expect(analysis.isGenuinelyCorroborated).toBe(true);
  });

  it('correctly tests pair independence', () => {
    // Two newspapers syndicating wire:pti are NOT independent
    expect(graph.isIndependentPair('src_regional_1', 'src_regional_2')).toBe(false);

    // Independent journalist and wire-syndicated newspaper ARE independent
    expect(graph.isIndependentPair('src_regional_1', 'src_independent_investigative')).toBe(true);
  });
});
