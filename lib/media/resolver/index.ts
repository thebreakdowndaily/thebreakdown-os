import { ResolverStrategy, ResolverContext, ResolverResult } from '../core/types';
import { KnowledgeAsset } from '@/types/canonical';

export class AssetResolver implements ResolverStrategy {
  private strategies: ResolverStrategy[];

  constructor(strategies: ResolverStrategy[]) {
    this.strategies = strategies;
  }

  async resolve(context: ResolverContext): Promise<ResolverResult> {
    for (const strategy of this.strategies) {
      try {
        const result = await strategy.resolve(context);
        if (result && result.asset) {
          return result;
        }
      } catch (error) {
        // Log strategy failure and continue to the next fallback
        console.warn(`Resolver strategy failed for context:`, context, error);
      }
    }
    throw new Error('All resolver strategies failed to return an asset.');
  }
}

// ─── Concrete Strategies ────────────────────────────────────────────────────────

export class OfficialResolver implements ResolverStrategy {
  async resolve(context: ResolverContext): Promise<ResolverResult> {
    // Stub: Query official verified datasets first
    throw new Error('OfficialResolver not implemented');
  }
}

export class EditorialResolver implements ResolverStrategy {
  async resolve(context: ResolverContext): Promise<ResolverResult> {
    // Stub: Query editorially curated assets
    throw new Error('EditorialResolver not implemented');
  }
}

export class CommonsResolver implements ResolverStrategy {
  async resolve(context: ResolverContext): Promise<ResolverResult> {
    // Stub: Query Wikimedia/Commons API
    throw new Error('CommonsResolver not implemented');
  }
}

export class AIResolver implements ResolverStrategy {
  async resolve(context: ResolverContext): Promise<ResolverResult> {
    // Stub: Generate via AI pipeline if everything else fails and context allows it
    throw new Error('AIResolver not implemented');
  }
}

export class PlaceholderResolver implements ResolverStrategy {
  async resolve(context: ResolverContext): Promise<ResolverResult> {
    // Stub: Generate a dynamic SVG or blurred gradient placeholder
    throw new Error('PlaceholderResolver not implemented');
  }
}
