import type { Dataset, DatasetVersion } from '@/types/canonical';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

export class DatasetCache {
  private datasets = new Map<string, CacheEntry<Dataset>>();
  private datasetsBySlug = new Map<string, CacheEntry<Dataset>>();
  private versions = new Map<string, CacheEntry<DatasetVersion[]>>();
  private series = new Map<string, CacheEntry<DatasetVersion['series']>>();
  private sharedList: CacheEntry<Dataset[]> | null = null;
  private defaultTtlMs = 5 * 60 * 1000;

  setDefaultTtl(ms: number): void { this.defaultTtlMs = ms; }

  private isValid<T>(entry?: CacheEntry<T>): boolean {
    if (!entry) return false;
    return Date.now() - entry.timestamp < entry.ttlMs;
  }

  getDataset(id: string): Dataset | undefined {
    const entry = this.datasets.get(id);
    return this.isValid(entry) ? entry!.data : undefined;
  }

  setDataset(dataset: Dataset, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    this.datasets.set(dataset.id, { data: dataset, timestamp: Date.now(), ttlMs: ttl });
    this.datasetsBySlug.set(dataset.slug, { data: dataset, timestamp: Date.now(), ttlMs: ttl });
  }

  getDatasetBySlug(slug: string): Dataset | undefined {
    const entry = this.datasetsBySlug.get(slug);
    return this.isValid(entry) ? entry!.data : undefined;
  }

  getVersions(datasetId: string): DatasetVersion[] | undefined {
    const entry = this.versions.get(datasetId);
    return this.isValid(entry) ? entry!.data : undefined;
  }

  setVersions(datasetId: string, versions: DatasetVersion[], ttlMs?: number): void {
    this.versions.set(datasetId, { data: versions, timestamp: Date.now(), ttlMs: ttlMs ?? this.defaultTtlMs });
  }

  getSeries(datasetSlug: string): DatasetVersion['series'] | undefined {
    const entry = this.series.get(datasetSlug);
    return this.isValid(entry) ? entry!.data : undefined;
  }

  setSeries(datasetSlug: string, series: DatasetVersion['series'], ttlMs?: number): void {
    this.series.set(datasetSlug, { data: series, timestamp: Date.now(), ttlMs: ttlMs ?? this.defaultTtlMs });
  }

  getAll(): Dataset[] | undefined {
    if (!this.sharedList) return undefined;
    return this.isValid(this.sharedList) ? this.sharedList.data : undefined;
  }

  setAll(datasets: Dataset[], ttlMs?: number): void {
    this.sharedList = { data: datasets, timestamp: Date.now(), ttlMs: ttlMs ?? this.defaultTtlMs };
  }

  invalidate(datasetId?: string): void {
    if (datasetId) {
      this.datasets.delete(datasetId);
      this.versions.delete(datasetId);
      const entry = this.datasets.get(datasetId);
      if (entry) this.datasetsBySlug.delete(entry.data.slug);
    } else {
      this.datasets.clear();
      this.datasetsBySlug.clear();
      this.versions.clear();
      this.series.clear();
      this.sharedList = null;
    }
  }

  invalidateAll(): void { this.invalidate(); }
}
