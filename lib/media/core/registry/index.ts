import {
  ResolverStrategy,
  MetadataExtractor,
  DuplicateDetector,
  OptimizationProvider,
  CacheProvider
} from '../types';

export class MediaRegistry {
  private static instance: MediaRegistry;

  private resolvers: Map<string, ResolverStrategy> = new Map();
  private metadataExtractors: Map<string, MetadataExtractor> = new Map();
  private duplicateDetectors: Map<string, DuplicateDetector> = new Map();
  private optimizationProviders: Map<string, OptimizationProvider> = new Map();
  private cacheProviders: Map<string, CacheProvider> = new Map();

  private constructor() {}

  public static getInstance(): MediaRegistry {
    if (!MediaRegistry.instance) {
      MediaRegistry.instance = new MediaRegistry();
    }
    return MediaRegistry.instance;
  }

  // Resolvers
  public registerResolver(name: string, strategy: ResolverStrategy) {
    this.resolvers.set(name, strategy);
  }
  public getResolvers(): ResolverStrategy[] {
    return Array.from(this.resolvers.values());
  }

  // Metadata Extractors
  public registerMetadataExtractor(name: string, extractor: MetadataExtractor) {
    this.metadataExtractors.set(name, extractor);
  }
  public getMetadataExtractors(): MetadataExtractor[] {
    return Array.from(this.metadataExtractors.values());
  }

  // Duplicate Detectors
  public registerDuplicateDetector(name: string, detector: DuplicateDetector) {
    this.duplicateDetectors.set(name, detector);
  }
  public getDuplicateDetectors(): DuplicateDetector[] {
    return Array.from(this.duplicateDetectors.values());
  }

  // Cache
  public registerCacheProvider(name: string, provider: CacheProvider) {
    this.cacheProviders.set(name, provider);
  }
  public getCacheProvider(name: string): CacheProvider | undefined {
    return this.cacheProviders.get(name);
  }
}
