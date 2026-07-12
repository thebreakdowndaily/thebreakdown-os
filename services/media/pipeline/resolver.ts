import { AssetBase, AssetReference, EntityBase, Story } from '@/types/canonical';
import { getServices } from '@/services/registry';

export interface ResolverContext {
  storySlug: string;
  primaryEntities: EntityBase[];
  supportingEntities: EntityBase[];
  topics: any[];
  story?: Story;
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
    const primaryRefs: AssetReference[] = [];
    for (const entity of context.primaryEntities) {
      const asset = await this.resolveEntityAsset(entity, 'primary');
      if (asset) {
        const ref = this.createReference(asset, 'primary');
        primaryRefs.push(ref);
        this.categorizeAsset(ref, entity, result);
      }
    }

    // 2. Hero selection from primary entities
    if (primaryRefs.length > 0) {
      result.hero = { ...primaryRefs[0], role: 'hero', priority: 'hero' };
      result.primary = primaryRefs;
    }

    // 3. If no hero from primary, try supporting entities
    if (!result.hero) {
      const supportingRefs: AssetReference[] = [];
      for (const entity of context.supportingEntities) {
        const asset = await this.resolveEntityAsset(entity, 'supporting');
        if (asset) {
          const ref = this.createReference(asset, 'supporting');
          supportingRefs.push(ref);
          this.categorizeAsset(ref, entity, result);
        }
      }
      result.supporting = supportingRefs;
      if (supportingRefs.length > 0) {
        result.hero = { ...supportingRefs[0], role: 'hero', priority: 'hero' };
      }
    } else {
      // Still resolve supporting entities for gallery
      for (const entity of context.supportingEntities) {
        const asset = await this.resolveEntityAsset(entity, 'supporting');
        if (asset) {
          const ref = this.createReference(asset, 'supporting');
          result.supporting.push(ref);
          this.categorizeAsset(ref, entity, result);
        }
      }
    }

    // 4. Story-level fallback if no hero from entities
    if (!result.hero && context.story) {
      const intelligence = getServices().intelligence;
      const mediaItem = await intelligence.resolveImageForStory(context.story);
      if (mediaItem) {
        const asset = this.mediaItemToAsset(mediaItem, 'story-fallback', 'hero');
        const ref = this.createReference(asset, 'hero');
        result.hero = { ...ref, role: 'hero', priority: 'hero' };
      }
    }

    // 5. Deduplicate
    this.deduplicate(result);

    // 6. Build Gallery — hero excluded to avoid double injection
    result.gallery = [
        ...result.primary,
        ...result.supporting
    ];
    result.gallery = this.deduplicateList(result.gallery);

    return result;
  }

  private async resolveEntityAsset(entity: EntityBase, role: string): Promise<AssetBase | null> {
    const intelligence = getServices().intelligence;
    const query = entity.name || entity.slug;
    const mediaItem = await intelligence.fetchOfficialImage(query);
    if (!mediaItem) return null;
    return this.mediaItemToAsset(mediaItem, entity.id, role);
  }

  private mediaItemToAsset(mediaItem: import('@/types/canonical').MediaItem, entityId: string, role: string): AssetBase {
    const type = role === 'hero' ? 'image' : 'image';
    return {
      id: `${entityId}-${role}`,
      slug: `${entityId}-${role}`,
      type,
      title: mediaItem.caption || entityId,
      altText: mediaItem.alt || entityId,
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
      relationships: { entities: [{ id: entityId, role }], topics: [], stories: [], collections: [] },
      currentVersion: 1,
      versions: [],
      usageGraph: { stories: [], topics: [], entities: [], homepages: [], newsletters: [], collections: [] },
      priority: 'editorial',
      confidence: 1,
      usageCount: 1,
      verificationStatus: 'verified',
      uploadedAt: new Date().toISOString()
    };
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
      result.maps.push(ref);
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
      if (!url) return true;
      const key = `${ref.role}:${url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
