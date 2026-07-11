import { KnowledgeAsset, AssetAttribution } from '@/types/canonical';

/**
 * ─── Resolver Strategies ────────────────────────────────────────────────────────
 */
export interface ResolverStrategy {
  resolve(context: ResolverContext): Promise<ResolverResult>;
}

export interface ResolverContext {
  entityId?: string;
  topicId?: string;
  storyId?: string;
  tags?: string[];
  role: 'hero' | 'thumbnail' | 'portrait' | 'logo' | 'cover';
}

export interface ResolverResult {
  asset: KnowledgeAsset;
  confidence: number;
  reason: string;
  source: string;
  priority: 'hero' | 'editorial' | 'commons' | 'ai' | 'placeholder';
}

/**
 * ─── Metadata Extraction Strategies ─────────────────────────────────────────────
 */
export interface MetadataExtractor {
  extract(buffer: Buffer, mimeType: string): Promise<Partial<KnowledgeAsset['metadata']>>;
}

export interface EXIFExtractor extends MetadataExtractor {}
export interface OCRExtractor extends MetadataExtractor {}
export interface ColorExtractor extends MetadataExtractor {}
export interface EntityExtractor extends MetadataExtractor {}

export interface CaptionGenerator {
  generate(asset: KnowledgeAsset, context: ResolverContext): Promise<string>;
}
export interface AltGenerator {
  generate(asset: KnowledgeAsset): Promise<string>;
}

/**
 * ─── Duplicate Detection Strategies ─────────────────────────────────────────────
 */
export interface DuplicateDetector {
  detect(asset: KnowledgeAsset): Promise<DuplicateResult>;
}

export interface DuplicateResult {
  isDuplicate: boolean;
  similarityScore: number;
  existingAssetId?: string;
  matchType: 'exact' | 'near' | 'visual' | 'none';
}

export interface ExactDuplicateDetector extends DuplicateDetector {}
export interface NearDuplicateDetector extends DuplicateDetector {}
export interface VisualSimilarityDetector extends DuplicateDetector {}

/**
 * ─── Optimization & Cache Providers ─────────────────────────────────────────────
 */
export interface OptimizationProvider {
  optimize(asset: KnowledgeAsset): Promise<KnowledgeAsset['optimization']>;
}

export interface CacheProvider {
  get(key: string): Promise<KnowledgeAsset | null>;
  set(key: string, asset: KnowledgeAsset, ttl?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}

/**
 * ─── Attribution Engine ─────────────────────────────────────────────────────────
 */
export interface AttributionGenerator {
  generate(asset: KnowledgeAsset): AssetAttribution;
}
