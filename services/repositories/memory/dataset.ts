import type { Dataset, APIListParams, APIResponse, DatasetVersion, Series } from '@/types/canonical';
import type { DatasetService } from '../../interfaces/dataset';
import type { ValidationResult } from '../../datasets/validator';
import { DatasetCache } from '../../datasets/cache';
import { DatasetValidator } from '../../datasets/validator';
import { DatasetCsvImporter } from '../../datasets/csv-importer';

export class MemoryDatasetRepository implements DatasetService {
  private store = new Map<string, Dataset>();
  private cache = new DatasetCache();
  private validator = new DatasetValidator();
  private importer = new DatasetCsvImporter();

  constructor(datasets: Dataset[] = []) {
    datasets.forEach(d => this.store.set(d.id, d));
  }

  async getDatasets(params?: APIListParams): Promise<APIResponse<Dataset[]>> {
    const cached = this.cache.getAll();
    if (cached && !params) return { data: cached, meta: { total: cached.length, page: 1, pageSize: cached.length } };
    let list = Array.from(this.store.values());
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(d => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.tags?.some(t => t.toLowerCase().includes(q)));
    }
    const total = list.length;
    if (params?.page && params?.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }
    const result = { data: list, meta: { total, page: params?.page || 1, pageSize: params?.pageSize || list.length } };
    if (!params) this.cache.setAll(result.data);
    return result;
  }

  async getDataset(id: string) { return this.store.get(id); }

  async getDatasetBySlug(slug: string) {
    return Array.from(this.store.values()).find(d => d.slug === slug);
  }

  async saveDataset(dataset: Dataset) {
    const now = new Date().toISOString();
    const d = { ...dataset, updatedAt: now, createdAt: dataset.createdAt || now };
    this.store.set(d.id, d);
    this.cache.invalidateAll();
    return d;
  }

  async updateDataset(id: string, updates: Partial<Dataset>) {
    const existing = this.store.get(id);
    if (!existing) throw new Error(`Dataset ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.store.set(id, updated);
    this.cache.invalidateAll();
    return updated;
  }

  async deleteDataset(id: string) {
    const r = this.store.delete(id);
    this.cache.invalidateAll();
    return r;
  }

  async count() { return this.store.size; }

  validate(dataset: Partial<Dataset>): ValidationResult {
    return this.validator.validateDataset(dataset);
  }

  async createVersion(datasetId: string, version: DatasetVersion) {
    const dataset = this.store.get(datasetId);
    if (!dataset) throw new Error(`Dataset ${datasetId} not found`);
    const updated = {
      ...dataset,
      versions: [...dataset.versions, { ...version, id: `v${dataset.versions.length + 1}`, publishedAt: new Date().toISOString() }]
    };
    this.store.set(datasetId, { ...updated, versions: updated.versions });
    this.cache.invalidateAll();
    return updated.versions[updated.versions.length - 1];
  }

  async importCsv(datasetSlug: string, csvContent: string, metricId: string) {
    const dataset = await this.getDatasetBySlug(datasetSlug);
    if (!dataset) return { success: false, imported: 0, errors: ['Dataset not found'] };
    let parsed: { headers: string[]; rows: Record<string, string>[] };
    try {
      parsed = this.importer.parseCsv(csvContent);
    } catch (e) {
      return { success: false, imported: 0, errors: [(e as Error).message] };
    }
    const validation = this.validator.validateCsvImport(parsed.headers, parsed.rows);
    if (!validation.valid) return { success: false, imported: 0, errors: validation.errors.map(e => e.message) };
    const currentVersion = dataset.versions[dataset.versions.length - 1];
    if (!currentVersion) return { success: false, imported: 0, errors: ['No version found'] };
    const existingPeriods = new Set(currentVersion.series.filter(s => s.metricId === metricId).flatMap(s => s.observations.map(o => o.period)));
    const newObservations = parsed.rows.filter(row => !existingPeriods.has(row.period));
    if (newObservations.length === 0) return { success: true, imported: 0, errors: [] };
    const updatedSeries = currentVersion.series.map(s => {
      if (s.metricId !== metricId) return s;
      return { ...s, observations: [...s.observations, ...newObservations.map(row => ({ period: row.period, value: parseFloat(row.value) }))] };
    });
    this.store.set(dataset.id, {
      ...dataset,
      versions: dataset.versions.map((v, i) => i === dataset.versions.length - 1 ? { ...v, series: updatedSeries } : v),
    });
    this.cache.invalidateAll();
    return { success: true, imported: newObservations.length, errors: [] };
  }

  async importJson(datasetSlug: string, jsonContent: string) {
    const dataset = await this.getDatasetBySlug(datasetSlug);
    if (!dataset) return { success: false, imported: 0, errors: ['Dataset not found'] };
    try {
      this.importer.parseJson(jsonContent);
    } catch (e) {
      return { success: false, imported: 0, errors: [(e as Error).message] };
    }
    return { success: true, imported: 0, errors: [] };
  }

  async getSeries(datasetSlug: string, metricId: string) {
    const dataset = await this.getDatasetBySlug(datasetSlug);
    if (!dataset) return undefined;
    const currentVersion = dataset.versions[dataset.versions.length - 1];
    if (!currentVersion) return undefined;
    return currentVersion.series.filter(s => s.metricId === metricId);
  }

  async getChartData(datasetSlug: string, vizId: string) {
    const dataset = await this.getDatasetBySlug(datasetSlug);
    if (!dataset) return { labels: [], values: [] };
    const currentVersion = dataset.versions[dataset.versions.length - 1];
    if (!currentVersion) return { labels: [], values: [] };
    const viz = dataset.visualizations?.find(v => v.id === vizId);
    if (!viz) return { labels: [], values: [] };
    const metricId = viz.metricIds[0];
    if (!metricId) return { labels: [], values: [] };
    const series = currentVersion.series.find(s => s.metricId === metricId);
    if (!series) return { labels: [], values: [] };
    return { labels: series.observations.map(o => o.period), values: series.observations.map(o => o.value ?? 0) };
  }

  async getHistory(datasetSlug: string) {
    const dataset = await this.getDatasetBySlug(datasetSlug);
    if (!dataset) return [];
    return [...dataset.versions].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async getVersions(datasetSlug: string) {
    const dataset = await this.getDatasetBySlug(datasetSlug);
    return dataset ? dataset.versions : undefined;
  }
}
