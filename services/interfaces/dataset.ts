import type { Dataset, APIListParams, APIResponse, DatasetVersion, Series } from '@/types/canonical';
import type { ValidationResult } from '../datasets/validator';

export interface DatasetService {
  getDatasets(params?: APIListParams): Promise<APIResponse<Dataset[]>>;
  getDataset(id: string): Promise<Dataset | undefined>;
  getDatasetBySlug(slug: string): Promise<Dataset | undefined>;
  saveDataset(dataset: Dataset): Promise<Dataset>;
  updateDataset(id: string, updates: Partial<Dataset>): Promise<Dataset>;
  deleteDataset(id: string): Promise<boolean>;
  count(): Promise<number>;
  validate(dataset: Partial<Dataset>): ValidationResult;
  createVersion(datasetId: string, version: DatasetVersion): Promise<DatasetVersion>;
  importCsv(datasetSlug: string, csvContent: string, metricId: string): Promise<{ success: boolean; imported: number; errors: string[] }>;
  importJson(datasetSlug: string, jsonContent: string): Promise<{ success: boolean; imported: number; errors: string[] }>;
  getSeries(datasetSlug: string, metricId: string): Promise<Series[] | undefined>;
  getChartData(datasetSlug: string, vizId: string): Promise<{ labels: string[]; values: number[] }>;
  getHistory(datasetSlug: string): Promise<DatasetVersion[]>;
  getVersions(datasetSlug: string): Promise<DatasetVersion[] | undefined>;
}
