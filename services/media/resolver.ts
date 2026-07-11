import { EntityBase, Entity, AssetReference, ImageAsset } from '@/types/canonical';
import { EntityBuilder } from '../entities/pipeline';

/**
 * AssetResolver Strategy Chain
 * 
 * Maps raw legacy images to rich ImageAsset references.
 */
export class AssetResolver implements EntityBuilder {
  build(base: EntityBase, rawContext: Entity): EntityBase {
    const assets: AssetReference[] = [];

    // Fallback logic for legacy `entity.image`
    if (rawContext.image) {
      assets.push({
        assetId: `img-${base.slug}-hero`,
        role: 'hero',
        resolvedAsset: this.buildImageAsset(`img-${base.slug}-hero`, rawContext.image, 'Hero Image')
      });
      assets.push({
        assetId: `img-${base.slug}-social`,
        role: 'social',
        resolvedAsset: this.buildImageAsset(`img-${base.slug}-social`, rawContext.image, 'Social Image')
      });
      assets.push({
        assetId: `img-${base.slug}-gallery-1`,
        role: 'gallery',
        resolvedAsset: this.buildImageAsset(`img-${base.slug}-gallery-1`, rawContext.image, 'Gallery Image 1')
      });
    }

    return {
      ...base,
      assets: [...(base.assets || []), ...assets]
    };
  }

  private buildImageAsset(id: string, url: string, title: string): ImageAsset {
    return {
      id,
      slug: id,
      type: 'image',
      title,
      altText: title,
      metadata: {
        width: 1200,
        height: 800,
        mimeType: 'image/jpeg',
        aiGenerated: false
      },
      attribution: {
        license: 'editorial',
        credit: 'The Breakdown Archives'
      },
      optimization: {
        cdnUrl: url,
      },
      relationships: { entities: [], topics: [], stories: [], collections: [] },
      currentVersion: 1,
      versions: [],
      priority: 'editorial',
      confidence: 1,
      usageCount: 1,
      verificationStatus: 'verified',
      uploadedAt: new Date().toISOString(),
      usageGraph: { stories: [], topics: [], entities: [], homepages: [], newsletters: [], collections: [] }
    };
  }
}
