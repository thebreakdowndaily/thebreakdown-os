import { EntityLinker } from '../core/types';
import { KnowledgeEntity } from '@/types/canonical';
import { EntityRegistry } from '../core/registry';
import { EntityResolver } from '../resolver';

export class EntityLinkerService implements EntityLinker {
  private resolver: EntityResolver;

  constructor() {
    // In a real DI system, this would be injected.
    // For now, we instantiate the orchestrator using the registered strategies.
    const strategies = EntityRegistry.getInstance().getResolvers();
    this.resolver = new EntityResolver(strategies);
  }

  /**
   * Scans unstructured text (like a Story body), extracts potential entities,
   * resolves them via the Resolver Pipeline, and returns the canonical KnowledgeEntities.
   */
  async link(text: string): Promise<KnowledgeEntity[]> {
    if (!text || text.trim() === '') return [];

    // Stub: Extremely basic regex-based chunking for demonstration.
    // A production system would use an NLP/NER service here to extract entity candidates.
    const candidates = this.extractCandidates(text);
    const resolvedEntities: KnowledgeEntity[] = [];

    for (const candidate of candidates) {
      try {
        const result = await this.resolver.resolve({
          rawText: candidate,
          sourceType: 'nlp_extraction',
          confidenceThreshold: 0.85
        });

        if (result && result.entity) {
          // Avoid duplicates
          if (!resolvedEntities.find(e => e.id === result.entity.id)) {
            resolvedEntities.push(result.entity);
          }
        }
      } catch (error) {
        // Candidate resolution failed (e.g., just a common noun, or low confidence)
        // We safely ignore it and continue.
      }
    }

    return resolvedEntities;
  }

  private extractCandidates(text: string): string[] {
    // Stub: Simulates Named Entity Recognition (NER)
    // Matches capitalized words that are not at the start of a sentence.
    const regex = /(?<!\.\s)[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g;
    const matches = text.match(regex);
    return matches ? Array.from(new Set(matches)) : [];
  }
}
