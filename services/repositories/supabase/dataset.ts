import type { Dataset, APIListParams, APIResponse, DatasetVersion, Series, DatasetCategory, DatasetFrequency } from '@/types/canonical';
import { getSupabaseClient } from '@/supabase/client';
import type { TypedDatabase } from '@/supabase/client';
import type { DatasetService } from '../../interfaces/dataset';
import type { ValidationResult } from '../../datasets/validator';
import { DatasetValidator } from '../../datasets/validator';

type DatasetRow = TypedDatabase['public']['Tables']['datasets']['Row'];
type DatasetInsert = TypedDatabase['public']['Tables']['datasets']['Insert'];

function sb() { return getSupabaseClient().from('datasets'); }

export class SupabaseDatasetRepository implements DatasetService {
  private validator = new DatasetValidator();

  async getDatasets(params?: APIListParams): Promise<APIResponse<Dataset[]>> {
    let query = sb().select('*', { count: 'exact' });
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.page && params?.pageSize) query = query.range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);
    query = query.order('created_at', { ascending: false });
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(rowToDataset), meta: { total: count || 0, page: params?.page || 1, pageSize: params?.pageSize || (data?.length || 0) } };
  }

  async getDataset(id: string) {
    const { data, error } = await sb().select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToDataset(data) : undefined;
  }

  async getDatasetBySlug(slug: string) {
    const { data, error } = await sb().select('*').eq('slug', slug).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? rowToDataset(data) : undefined;
  }

  async saveDataset(dataset: Dataset) {
    const { data, error } = await sb().upsert(rowFromDataset(dataset)).select().single();
    if (error) throw error;
    return rowToDataset(data);
  }

  async updateDataset(id: string, updates: Partial<Dataset>) {
    const { data, error } = await sb().update({ ...rowFromDataset(updates as Dataset), updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return rowToDataset(data);
  }

  async deleteDataset(id: string) {
    const { error } = await sb().delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  async count() {
    const { count, error } = await sb().select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }

  validate(dataset: Partial<Dataset>): ValidationResult {
    return this.validator.validateDataset(dataset);
  }

  async createVersion(datasetId: string, version: DatasetVersion) {
    const dataset = await this.getDataset(datasetId);
    if (!dataset) throw new Error(`Dataset ${datasetId} not found`);
    const versions = [...dataset.versions, { ...version, id: `v${dataset.versions.length + 1}`, publishedAt: new Date().toISOString() }];
    const { error } = await sb().update({ updated_at: new Date().toISOString() } as any).eq('id', datasetId);
    if (error) throw error;
    return versions[versions.length - 1];
  }

  async importCsv(datasetSlug: string, csvContent: string, metricId: string) {
    return { success: false, imported: 0, errors: ['CSV import not supported in Supabase repository'] };
  }

  async importJson(datasetSlug: string, jsonContent: string) {
    return { success: false, imported: 0, errors: ['JSON import not supported in Supabase repository'] };
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

function rowToDataset(row: DatasetRow): Dataset {
  return {
    id: row.id, slug: row.slug, title: row.title, description: row.description,
    category: (row.category as DatasetCategory) || 'economics',
    frequency: (row.frequency as DatasetFrequency) || 'annual',
    unitLabel: row.unit_label || '', source: row.source || '', sourceUrl: row.source_url || '',
    methodology: row.methodology || '', tags: row.tags || [],
    versions: [], metrics: [], dimensions: [], visualizations: [],
    relatedEntityIds: row.related_entity_ids || [],
    relatedStoryIds: row.related_story_ids || [],
    relatedTopicIds: row.related_topic_ids || [],
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function rowFromDataset(dataset: Dataset): DatasetInsert {
  return {
    id: dataset.id,
    slug: dataset.slug,
    title: dataset.title,
    description: dataset.description,
    category: dataset.category,
    frequency: dataset.frequency,
    unit_label: dataset.unitLabel,
    source: dataset.source,
    source_url: dataset.sourceUrl,
    methodology: dataset.methodology,
    tags: dataset.tags,
    related_entity_ids: dataset.relatedEntityIds || [],
    related_story_ids: dataset.relatedStoryIds || [],
    related_topic_ids: dataset.relatedTopicIds || [],
  };
}
