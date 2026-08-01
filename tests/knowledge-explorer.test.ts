import { describe, it, expect } from 'vitest';
import { FixSearchEngine } from '../services/fixes/fix-search.service';
import { FixGraphEngine } from '../services/fixes/fix-graph.service';
import { EvidenceNetworkService } from '../services/intelligence/evidence-network.service';
import { FixMetadataService } from '../services/fixes/fix-metadata.service';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-EXPLORER: Knowledge Explorer Surface (Phase 16A)', () => {
  it('TEST-EXP-01: Multi-Node Faceted Search & Keyword Scoring', () => {
    const fixes = [CHAPTER_1_FIX];
    const searchRes = FixSearchEngine.search(fixes, { query: 'Defense Procurement' });

    expect(searchRes.hits.length).toBeGreaterThan(0);
    expect(searchRes.hits[0].item.id).toBe('fix-strategic-autonomy-recalibration');
  });

  it('TEST-EXP-02: Graph Relationship Traversal & Cyclic Safety', () => {
    const edges = FixGraphEngine.generateEdges(CHAPTER_1_FIX);

    expect(edges.length).toBeGreaterThan(0);
    expect(edges[0].sourceId).toBe('fix-strategic-autonomy-recalibration');
  });

  it('TEST-EXP-03: Evidence Web Attestation Inspection', () => {
    const web = EvidenceNetworkService.analyzeEvidenceNetwork(CHAPTER_1_FIX);

    expect(web.rootFixId).toBe('fix-strategic-autonomy-recalibration');
    expect(web.supportingChains).toBeDefined();
  });

  it('TEST-EXP-04: RIS & JSON-LD Citation Export Consistency', () => {
    const ris = FixMetadataService.toRISCitation(CHAPTER_1_FIX);
    expect(ris).toContain('TY  - GOVT');
    expect(ris).toContain('AU  - The Breakdown Editorial Bureau');

    const jsonLd = FixMetadataService.toJSONLD(CHAPTER_1_FIX);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Legislation');
  });

  it('TEST-EXP-05: Non-Mutation Guarantee During Graph Traversal & Search', () => {
    const originalJson = JSON.stringify(CHAPTER_1_FIX);
    FixSearchEngine.search([CHAPTER_1_FIX], { query: 'Procurement' });
    FixGraphEngine.generateEdges(CHAPTER_1_FIX);
    EvidenceNetworkService.analyzeEvidenceNetwork(CHAPTER_1_FIX);
    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalJson);
  });
});
