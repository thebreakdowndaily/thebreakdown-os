import { AssetBase, AssetReference, EntityBase } from '@/types/canonical';
import { getServices } from '@/services/registry';

export interface ResolverContext {
  storySlug: string;
  primaryEntities: EntityBase[];
  supportingEntities: EntityBase[];
  topics: any[]; // Topic interface
}

export interface ResolverResult {
  hero?: AssetReference;
  primary: AssetReference[];
  supporting: AssetReference[];
  gallery: AssetReference[];
  logos: AssetReference[];
  portraits: AssetReference[];
  maps: AssetReference[];
  charts: AssetReference[];
  documents: AssetReference[];
}

export class AssetResolverChain {
  async resolve(context: ResolverContext): Promise<ResolverResult> {
    const result: ResolverResult = {
      primary: [],
      supporting: [],
      gallery: [],
      logos: [],
      portraits: [],
      maps: [],
      charts: [],
      documents: []
    };

    // 1. Resolve Primary Entities
    for (const entity of context.primaryEntities) {
      const asset = await this.resolveEntityAsset(entity, 'primary');
      if (asset) {
        const ref = this.createReference(asset, 'primary');
        result.primary.push(ref);
        this.categorizeAsset(ref, entity, result);
        
        // The first primary asset is a good candidate for Hero if none exists
        if (!result.hero) {
            result.hero = { ...ref, role: 'hero', priority: 'hero' };
        }
      }
    }

    // 2. Resolve Supporting Entities
    for (const entity of context.supportingEntities) {
      const asset = await this.resolveEntityAsset(entity, 'supporting');
      if (asset) {
        const ref = this.createReference(asset, 'supporting');
        result.supporting.push(ref);
        this.categorizeAsset(ref, entity, result);
      }
    }

    // 3. Deduplicate
    this.deduplicate(result);

    // 4. Build Gallery
    result.gallery = [
        ...(result.hero ? [result.hero] : []),
        ...result.primary,
        ...result.supporting
    ];
    // Deduplicate gallery again just in case
    result.gallery = this.deduplicateList(result.gallery);

    return result;
  }

  private async resolveEntityAsset(entity: EntityBase, role: string): Promise<AssetBase | null> {
    // Check if we have an intelligence service
    const intelligence = getServices().intelligence;
    
    // Convert entity to a query. We use the name or slug.
    const query = entity.name || entity.slug;
    
    // Here we'd call the ranking engine. For now, we fallback to fetchOfficialImage.
    // fetchOfficialImage currently returns MediaItem. Let's adapt it or assume it returns MediaItem that we map to AssetBase.
    const mediaItem = await intelligence.fetchOfficialImage(query);
    if (!mediaItem) return null;

    // Map MediaItem to AssetBase
    const asset: AssetBase = {
      id: mediaItem.id,
      slug: mediaItem.id,
      type: entity.type === 'organization' ? 'logo' : (entity.type === 'person' ? 'image' : 'image'),
      title: mediaItem.caption || entity.name,
      altText: mediaItem.alt || entity.name,
      metadata: {
        mimeType: 'image/jpeg',
        aiGenerated: mediaItem.isAiGenerated || false,
        width: mediaItem.width,
        height: mediaItem.height
      },
      attribution: {
        license: mediaItem.licenseType || 'editorial',
        credit: mediaItem.credit || 'Unknown',
        caption: mediaItem.caption
      },
      optimization: {
        cdnUrl: mediaItem.src
      },
      relationships: { entities: [{ id: entity.id, role }], topics: [], stories: [], collections: [] },
      currentVersion: 1,
      versions: [],
      usageGraph: { stories: [], topics: [], entities: [], homepages: [], newsletters: [], collections: [] },
      priority: 'editorial',
      confidence: 1,
      usageCount: 1,
      verificationStatus: 'verified',
      uploadedAt: new Date().toISOString()
    };

    return asset;
  }

  private createReference(asset: AssetBase, role: string): AssetReference {
    return {
      assetId: asset.id,
      role: role,
      resolvedAsset: asset,
      priority: 'editorial'
    };
  }

  private categorizeAsset(ref: AssetReference, entity: EntityBase, result: ResolverResult) {
    if (entity.type === 'organization') {
      result.logos.push(ref);
    } else if (entity.type === 'person') {
      result.portraits.push(ref);
    } else if (entity.type === 'country') {
      result.maps.push(ref); // Naive mapping for now
    }
  }

  private deduplicate(result: ResolverResult) {
    result.primary = this.deduplicateList(result.primary);
    result.supporting = this.deduplicateList(result.supporting);
    result.logos = this.deduplicateList(result.logos);
    result.portraits = this.deduplicateList(result.portraits);
    result.maps = this.deduplicateList(result.maps);
  }

  private deduplicateList(list: AssetReference[]): AssetReference[] {
    const seen = new Set<string>();
    return list.filter(ref => {
      const url = ref.resolvedAsset?.optimization.cdnUrl;
      if (!url) return false;
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }
}
