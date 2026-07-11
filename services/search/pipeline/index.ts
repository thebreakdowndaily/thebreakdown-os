import type { KnowledgeSearch, SearchBuilder } from './builder';

export class KnowledgeSearchPipeline {
  private builders: SearchBuilder[] = [];

  add(builder: SearchBuilder): KnowledgeSearchPipeline {
    this.builders.push(builder);
    return this;
  }

  async execute(query: string, rawResults: any[]): Promise<KnowledgeSearch> {
    let search: KnowledgeSearch = { query, rawResults };
    
    // CTO Note: Search builders can run sequentially because they depend on each other.
    // e.g., IntentResolver -> KnowledgeSpotlight -> Grouping -> Suggestions
    for (const builder of this.builders) {
      search = await builder.build(search);
    }

    return search;
  }
}
