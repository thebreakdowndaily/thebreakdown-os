import type { Dataset, APIListParams, APIResponse, DatasetVersion, Series } from '@/types/canonical';
import { MemoryDatasetRepository } from './repository';
import { DatasetCache } from './cache';
import { DatasetValidator, type ValidationResult } from './validator';
import { DatasetCsvImporter } from './csv-importer';

export interface DatasetService {
  getDatasets(params?: APIListParams): APIResponse<Dataset[]>;
  getDataset(id: string): Dataset | undefined;
  getDatasetBySlug(slug: string): Dataset | undefined;
  saveDataset(dataset: Dataset): Dataset;
  updateDataset(id: string, updates: Partial<Dataset>): Dataset;
  deleteDataset(id: string): boolean;
  count(): number;
  validate(dataset: Partial<Dataset>): ValidationResult;
  createVersion(datasetId: string, version: DatasetVersion): DatasetVersion;
  importCsv(datasetSlug: string, csvContent: string, metricId: string): { success: boolean; imported: number; errors: string[] };
  importJson(datasetSlug: string, jsonContent: string): { success: boolean; imported: number; errors: string[] };
  getSeries(datasetSlug: string, metricId: string): Series[] | undefined;
  getChartData(datasetSlug: string, vizId: string): { labels: string[]; values: number[] };
  getHistory(datasetSlug: string): DatasetVersion[];
  getVersions(datasetSlug: string): DatasetVersion[] | undefined;
}

export class MemoryDatasetService implements DatasetService {
  private repository: MemoryDatasetRepository;
  private cache: DatasetCache;
  private validator: DatasetValidator;
  private importer: DatasetCsvImporter;

  constructor(datasets?: Dataset[]) {
    this.repository = new MemoryDatasetRepository(datasets);
    this.cache = new DatasetCache();
    this.validator = new DatasetValidator();
    this.importer = new DatasetCsvImporter();
  }

  getDatasets(params?: APIListParams): APIResponse<Dataset[]> {
    const cached = this.cache.getAll();
    if (cached && !params) return { data: cached, meta: { total: cached.length, page: 1, pageSize: cached.length } };
    const result = this.repository.findAll(params);
    if (!params) this.cache.setAll(result.data);
    return result;
  }

  getDataset(id: string) { return this.repository.findById(id); }
  getDatasetBySlug(slug: string) { return this.repository.findBySlug(slug); }
  saveDataset(dataset: Dataset) { const d = this.repository.save(dataset); this.cache.invalidateAll(); return d; }
  updateDataset(id: string, updates: Partial<Dataset>) { const d = this.repository.update(id, updates); this.cache.invalidateAll(); return d; }
  deleteDataset(id: string) { const r = this.repository.delete(id); this.cache.invalidateAll(); return r; }
  count() { return this.repository.count(); }

  validate(dataset: Partial<Dataset>): ValidationResult { return this.validator.validateDataset(dataset); }

  createVersion(datasetId: string, version: DatasetVersion) {
    const dataset = this.repository.findById(datasetId);
    if (!dataset) throw new Error(`Dataset ${datasetId} not found`);
    const updated = {
      ...dataset,
      versions: [...dataset.versions, { ...version, id: `v${dataset.versions.length + 1}`, publishedAt: new Date().toISOString() }]
    };
    this.repository.update(datasetId, { versions: updated.versions });
    this.cache.invalidateAll();
    return updated.versions[updated.versions.length - 1];
  }

  importCsv(datasetSlug: string, csvContent: string, metricId: string) {
    const dataset = this.repository.findBySlug(datasetSlug);
    if (!dataset) return { success: false, imported: 0, errors: ['Dataset not found'] };
    let result: { headers: string[]; rows: Record<string, string>[] };
    try {
      result = this.importer.parseCsv(csvContent);
    } catch (e) {
      return { success: false, imported: 0, errors: [(e as Error).message] };
    }
    const validation = this.validator.validateCsvImport(result.headers, result.rows);
    if (!validation.valid) return { success: false, imported: 0, errors: validation.errors.map(e => e.message) };
    const currentVersion = dataset.versions[dataset.versions.length - 1];
    if (!currentVersion) return { success: false, imported: 0, errors: ['No version found'] };
    const metric = dataset.metrics.find(m => m.id === metricId);
    if (!metric) return { success: false, imported: 0, errors: [`Metric ${metricId} not found`] };
    const existingPeriods = new Set(currentVersion.series.filter(s => s.metricId === metricId).flatMap(s => s.observations.map(o => o.period)));
    const newObservations = result.rows.filter(row => !existingPeriods.has(row.period));
    if (newObservations.length === 0) return { success: true, imported: 0, errors: [] };
    const updatedSeries = currentVersion.series.map(s => {
      if (s.metricId !== metricId) return s;
      return { ...s, observations: [...s.observations, ...newObservations.map(row => ({ period: row.period, value: parseFloat(row.value) }))] };
    });
    this.repository.update(dataset.id, {
      versions: dataset.versions.map((v, i) => i === dataset.versions.length - 1 ? { ...v, series: updatedSeries } : v)
    });
    this.cache.invalidateAll();
    return { success: true, imported: newObservations.length, errors: [] };
  }

  importJson(datasetSlug: string, jsonContent: string) {
    const dataset = this.repository.findBySlug(datasetSlug);
    if (!dataset) return { success: false, imported: 0, errors: ['Dataset not found'] };
    let result: { headers: string[]; rows: Record<string, string>[] };
    try {
      result = this.importer.parseJson(jsonContent);
    } catch (e) {
      return { success: false, imported: 0, errors: [(e as Error).message] };
    }
    return { success: true, imported: result.rows.length, errors: [] };
  }

  getSeries(datasetSlug: string, metricId: string) {
    const dataset = this.repository.findBySlug(datasetSlug);
    if (!dataset) return;
    const currentVersion = dataset.versions[dataset.versions.length - 1];
    if (!currentVersion) return;
    return currentVersion.series.filter(s => s.metricId === metricId);
  }

  getChartData(datasetSlug: string, vizId: string) {
    const dataset = this.repository.findBySlug(datasetSlug);
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

  getHistory(datasetSlug: string) {
    const dataset = this.repository.findBySlug(datasetSlug);
    return dataset ? [...dataset.versions].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()) : [];
  }

  getVersions(datasetSlug: string) {
    const dataset = this.repository.findBySlug(datasetSlug);
    return dataset ? dataset.versions : undefined;
  }
}
