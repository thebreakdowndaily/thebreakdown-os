import { chapterToCanonicalAdapter } from '../../lib/story/adapters';
import { getKnowledgeCore } from '../../utils/data-layer/store';
import { test, expect, describe } from 'vitest';

describe('Evidence Summary Contract', () => {
  test('chapterToCanonicalAdapter correctly maps evidence-summary to EvidencePanelData', () => {
    const core = getKnowledgeCore();
    const chapter = core.chapters.find(c => c.slug === 'indias-inheritance');
    expect(chapter).toBeDefined();
    
    if (!chapter) return;
    
    const story = chapterToCanonicalAdapter(chapter);
    
    const evidenceBlocks = story.blocks.filter(b => b.type === 'evidence');
    expect(evidenceBlocks.length).toBeGreaterThan(0);
    
    for (const block of evidenceBlocks) {
      const data = block.data as any; // Block data mapped to EvidencePanelData
      
      // Verify EvidencePanelData contract expected by EvidenceEngine
      expect(data).toHaveProperty('overallScore');
      expect(typeof data.overallScore).toBe('number');
      
      expect(data).toHaveProperty('verifiedClaims');
      expect(typeof data.verifiedClaims).toBe('number');
      
      expect(data).toHaveProperty('primarySources');
      expect(typeof data.primarySources).toBe('number');
      
      expect(data).toHaveProperty('claims');
      expect(Array.isArray(data.claims)).toBe(true);
      expect(data.claims.length).toBeGreaterThan(0);
      
      const firstClaim = data.claims[0];
      expect(firstClaim).toHaveProperty('id');
      expect(firstClaim).toHaveProperty('text');
      expect(firstClaim).toHaveProperty('confidence');
      expect(firstClaim).toHaveProperty('status');
      
      // Sources array is expected
      expect(firstClaim).toHaveProperty('sources');
      expect(Array.isArray(firstClaim.sources)).toBe(true);
      
      // SupportingEvidence array is expected
      expect(firstClaim).toHaveProperty('supportingEvidence');
      expect(Array.isArray(firstClaim.supportingEvidence)).toBe(true);
    }
  });
});
