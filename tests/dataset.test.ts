import { MemoryDatasetService } from '../services/datasets/service';
import type { Dataset, DatasetVersion, APIListParams } from '../types/canonical';

const mockDataset: Dataset = {
  id: 'ds-test',
  slug: 'test-dataset',
  title: 'Test Dataset',
  description: 'A test dataset for unit testing.',
  category: 'economy',
  frequency: 'monthly',
  unitLabel: 'Percentage (%)',
  source: 'Test Source',
  sourceUrl: 'https://example.com',
  methodology: 'Test methodology.',
  tags: ['test', 'economy'],
  versions: [
    {
      id: 'v1',
      version: '1.0',
      publishedAt: '2026-01-01T00:00:00Z',
      notes: 'Initial version.',
      series: [
        {
          id: 's1',
          metricId: 'm1',
          dimensionFilters: {},
          observations: [
            { period: '2025-01', value: 10 },
            { period: '2025-02', value: 20 },
            { period: '2025-03', value: 30 },
          ],
        },
        {
          id: 's2',
          metricId: 'm2',
          dimensionFilters: {},
          observations: [
            { period: '2025-01', value: 100 },
            { period: '2025-02', value: 200 },
          ],
        },
      ],
      metadata: { baseYear: '2020' },
    },
  ],
  metrics: [
    { id: 'm1', name: 'metric_one', label: 'Metric One', description: 'First metric.', dataType: 'number', unit: '', decimalPlaces: 0, isPrimary: true },
    { id: 'm2', name: 'metric_two', label: 'Metric Two', description: 'Second metric.', dataType: 'number', unit: '', decimalPlaces: 0, isPrimary: false },
  ],
  dimensions: [],
  visualizations: [
    { id: 'viz1', title: 'Chart 1', type: 'line', metricIds: ['m1'], config: {} },
  ],
  relatedEntityIds: ['entity-1'],
  relatedStoryIds: ['story-1'],
  relatedTopicIds: ['topic-1'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  // ── DatasetService ──────────────────────────────────────────────────────────

  // Test 1: Constructor with datasets
  try {
    const service = new MemoryDatasetService([mockDataset]);
    assert(service.getDataset('ds-test') !== undefined, 'Constructor stores datasets');
  } catch (e) {
    console.error('  FAIL: Constructor with datasets threw exception', e);
    failed++;
  }

  // Test 2: getDatasets returns all
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const result = service.getDatasets();
    assert(result.data.length === 1, 'getDatasets returns all datasets');
    assert(result.meta!.total === 1, 'Meta total is correct');
  } catch (e) {
    console.error('  FAIL: getDatasets threw exception', e);
    failed++;
  }

  // Test 3: getDatasets with search filter
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const result = service.getDatasets({ search: 'economy' } as APIListParams);
    assert(result.data.length === 1, 'Search by tag finds dataset');
    const noResult = service.getDatasets({ search: 'nonexistent' } as APIListParams);
    assert(noResult.data.length === 0, 'Search with no match returns empty');
  } catch (e) {
    console.error('  FAIL: getDatasets search threw exception', e);
    failed++;
  }

  // Test 4: getDatasets with pagination
  try {
    const service = new MemoryDatasetService([mockDataset, { ...mockDataset, id: 'ds-2', slug: 'dataset-2', title: 'Dataset 2' }]);
    const page1 = service.getDatasets({ page: 1, pageSize: 1 } as APIListParams);
    assert(page1.data.length === 1, 'Pagination page 1 returns 1 item');
    assert(page1.meta!.total === 2, 'Pagination meta total is 2');
    const page2 = service.getDatasets({ page: 2, pageSize: 1 } as APIListParams);
    assert(page2.data.length === 1, 'Pagination page 2 returns 1 item');
  } catch (e) {
    console.error('  FAIL: getDatasets pagination threw exception', e);
    failed++;
  }

  // Test 5: getDatasetBySlug
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const found = service.getDatasetBySlug('test-dataset');
    assert(found !== undefined, 'getDatasetBySlug finds dataset');
    assert(found!.title === 'Test Dataset', 'getDatasetBySlug returns correct dataset');
    const notFound = service.getDatasetBySlug('nonexistent');
    assert(notFound === undefined, 'getDatasetBySlug returns undefined for missing');
  } catch (e) {
    console.error('  FAIL: getDatasetBySlug threw exception', e);
    failed++;
  }

  // Test 6: saveDataset
  try {
    const service = new MemoryDatasetService([]);
    const saved = service.saveDataset(mockDataset);
    assert(saved.title === 'Test Dataset', 'saveDataset returns saved dataset');
    assert(service.getDataset('ds-test') !== undefined, 'saveDataset persists dataset');
    assert(saved.updatedAt !== '2026-01-01T00:00:00Z', 'saveDataset updates updatedAt');
  } catch (e) {
    console.error('  FAIL: saveDataset threw exception', e);
    failed++;
  }

  // Test 7: deleteDataset
  try {
    const service = new MemoryDatasetService([mockDataset]);
    service.deleteDataset('ds-test');
    assert(service.getDataset('ds-test') === undefined, 'deleteDataset removes dataset');
  } catch (e) {
    console.error('  FAIL: deleteDataset threw exception', e);
    failed++;
  }

  // Test 8: getSeries
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const series = service.getSeries('test-dataset', 'm1');
    assert(series !== undefined, 'getSeries returns series for existing metric');
    assert(series!.length === 1, 'getSeries returns one series for m1');
    assert(series![0].observations.length === 3, 'getSeries returns correct observations');
    const noSeries = service.getSeries('test-dataset', 'nonexistent');
    assert(noSeries!.length === 0, 'getSeries returns empty for nonexistent metric');
    const noDataset = service.getSeries('nonexistent', 'm1');
    assert(noDataset === undefined, 'getSeries returns undefined for missing dataset');
  } catch (e) {
    console.error('  FAIL: getSeries threw exception', e);
    failed++;
  }

  // Test 9: getVersions
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const versions = service.getVersions('test-dataset');
    assert(versions !== undefined, 'getVersions returns versions');
    assert(versions!.length === 1, 'getVersions returns correct count');
    assert(versions![0].version === '1.0', 'getVersions returns correct version');
    const noVersions = service.getVersions('nonexistent');
    assert(noVersions === undefined, 'getVersions returns undefined for missing');
  } catch (e) {
    console.error('  FAIL: getVersions threw exception', e);
    failed++;
  }

  // ── View-model functions ────────────────────────────────────────────────────

  // Test 10: getLatestVersion
  try {
    const versionV1: DatasetVersion = { id: 'v1', version: '1.0', publishedAt: '2025-01-01T00:00:00Z', notes: '', series: [], metadata: {} };
    const versionV2: DatasetVersion = { id: 'v2', version: '2.0', publishedAt: '2026-01-01T00:00:00Z', notes: '', series: [], metadata: {} };
    const { getLatestVersion } = await import('../features/dataset/view-model');
    const latest = getLatestVersion({ ...mockDataset, versions: [versionV1, versionV2] });
    assert(latest?.version === '2.0', 'getLatestVersion returns most recent version');
  } catch (e) {
    console.error('  FAIL: getLatestVersion threw exception', e);
    failed++;
  }

  // Test 11: getAllObservations
  try {
    const { getAllObservations } = await import('../features/dataset/view-model');
    const obs = getAllObservations(mockDataset.versions[0], 'm1');
    assert(obs.length === 3, 'getAllObservations returns correct count for m1');
    assert(obs[0].value === 10, 'First observation value is correct');
    const obsM2 = getAllObservations(mockDataset.versions[0], 'm2');
    assert(obsM2.length === 2, 'getAllObservations returns correct count for m2');
  } catch (e) {
    console.error('  FAIL: getAllObservations threw exception', e);
    failed++;
  }

  // ── API Handlers ────────────────────────────────────────────────────────────

  // Test 12: API dataset listing
  try {
    const ds = { ...mockDataset, id: 'ds-api', slug: 'api-dataset' };
    const service = new MemoryDatasetService([ds]);
    const result = service.getDatasets();
    assert(result.data.length >= 1, 'API getDatasets returns data');
    const found = result.data.find(d => d.slug === 'api-dataset');
    assert(found !== undefined, 'API getDatasets includes seeded dataset');
  } catch (e) {
    console.error('  FAIL: API dataset listing threw exception', e);
    failed++;
  }

  // Test 13: API dataset CRUD
  try {
    const service = new MemoryDatasetService([]);
    const saved = service.saveDataset(mockDataset);
    assert(saved.id === 'ds-test', 'API saveDataset returns with ID');
    const fetched = service.getDataset('ds-test');
    assert(fetched !== undefined, 'API getDataset retrieves saved dataset');
    service.deleteDataset('ds-test');
    assert(service.getDataset('ds-test') === undefined, 'API deleteDataset removes dataset');
  } catch (e) {
    console.error('  FAIL: API dataset CRUD threw exception', e);
    failed++;
  }

  // Test 14: Dataset integration — related entities/stories/topics
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const ds = service.getDatasetBySlug('test-dataset')!;
    assert(ds.relatedEntityIds.includes('entity-1'), 'Dataset links to entities');
    assert(ds.relatedStoryIds.includes('story-1'), 'Dataset links to stories');
    assert(ds.relatedTopicIds.includes('topic-1'), 'Dataset links to topics');
  } catch (e) {
    console.error('  FAIL: Dataset integration links threw exception', e);
    failed++;
  }

  // Test 15: Dataset with multiple versions
  try {
    const multiVersion: Dataset = {
      ...mockDataset,
      id: 'ds-mv',
      slug: 'multi-version',
      versions: [
        { id: 'v1', version: '1.0', publishedAt: '2025-01-01T00:00:00Z', notes: 'First', series: [], metadata: {} },
        { id: 'v2', version: '2.0', publishedAt: '2025-06-01T00:00:00Z', notes: 'Second', series: [], metadata: {} },
        { id: 'v3', version: '3.0', publishedAt: '2026-01-01T00:00:00Z', notes: 'Third', series: [], metadata: {} },
      ],
    };
    const service = new MemoryDatasetService([multiVersion]);
    const versions = service.getVersions('multi-version');
    assert(versions!.length === 3, 'Multiple versions stored and retrieved');
  } catch (e) {
    console.error('  FAIL: Multiple versions threw exception', e);
    failed++;
  }

  // Test 16: Visualization config
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const ds = service.getDatasetBySlug('test-dataset')!;
    assert(ds.visualizations.length === 1, 'Dataset has visualizations');
    assert(ds.visualizations[0].type === 'line', 'Visualization type is correct');
    assert(ds.visualizations[0].metricIds.includes('m1'), 'Visualization links to metrics');
  } catch (e) {
    console.error('  FAIL: Visualization config threw exception', e);
    failed++;
  }

  // Test 17: Dataset metric metadata
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const ds = service.getDatasetBySlug('test-dataset')!;
    const primary = ds.metrics.find(m => m.isPrimary);
    assert(primary !== undefined, 'Dataset has primary metric');
    assert(primary!.id === 'm1', 'Primary metric is m1');
    assert(ds.metrics.length === 2, 'Dataset has correct metric count');
  } catch (e) {
    console.error('  FAIL: Dataset metric metadata threw exception', e);
    failed++;
  }

  // Test 18: Empty dataset service
  try {
    const service = new MemoryDatasetService([]);
    const result = service.getDatasets();
    assert(result.data.length === 0, 'Empty service returns empty list');
    assert(result.meta!.total === 0, 'Empty service meta total is 0');
    assert(service.getDatasetBySlug('anything') === undefined, 'Empty service returns undefined for slug');
  } catch (e) {
    console.error('  FAIL: Empty dataset service threw exception', e);
    failed++;
  }

  // Test 19: Series without matching metric returns empty
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const series = service.getSeries('test-dataset', 'nonexistent-metric');
    assert(series !== undefined, 'getSeries returns array for nonexistent metric');
    assert(series!.length === 0, 'getSeries returns empty array for nonexistent metric');
  } catch (e) {
    console.error('  FAIL: Series without matching metric threw exception', e);
    failed++;
  }

  // Test 20: saveDataset updates existing
  try {
    const service = new MemoryDatasetService([mockDataset]);
    const updated = service.saveDataset({ ...mockDataset, title: 'Updated Title' });
    assert(updated.title === 'Updated Title', 'saveDataset updates existing dataset title');
    const fetched = service.getDataset('ds-test')!;
    assert(fetched.title === 'Updated Title', 'Changes are persisted');
    assert(fetched.updatedAt !== mockDataset.updatedAt, 'updatedAt is refreshed');
  } catch (e) {
    console.error('  FAIL: saveDataset update existing threw exception', e);
    failed++;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Dataset Tests: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
