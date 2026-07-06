import type { Dataset, DatasetVersion, Series, Observation, Metric, Visualization } from '@/types/canonical';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class DatasetValidator {
  validateDataset(dataset: Partial<Dataset>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!dataset.title || dataset.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required' });
    }
    if (!dataset.slug || dataset.slug.trim().length === 0) {
      errors.push({ field: 'slug', message: 'Slug is required' });
    }
    if (!dataset.slug || !/^[a-z0-9-]+$/.test(dataset.slug!)) {
      errors.push({ field: 'slug', message: 'Slug must contain only lowercase letters, numbers, and hyphens' });
    }
    if (!dataset.description || dataset.description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Description is required' });
    }
    if (!dataset.category) {
      errors.push({ field: 'category', message: 'Category is required' });
    }
    if (!dataset.source || dataset.source.trim().length === 0) {
      errors.push({ field: 'source', message: 'Source is required' });
    }

    if (dataset.metrics) {
      const metricErrors = this.validateMetrics(dataset.metrics);
      errors.push(...metricErrors);
    }

    if (dataset.versions) {
      dataset.versions.forEach((version, i) => {
        const versionErrors = this.validateVersion(version);
        versionErrors.forEach(e => errors.push({ field: `versions[${i}].${e.field}`, message: e.message }));
      });
    }

    if (dataset.visualizations) {
      dataset.visualizations.forEach((viz, i) => {
        const vizErrors = this.validateVisualization(viz);
        vizErrors.forEach(e => errors.push({ field: `visualizations[${i}].${e.field}`, message: e.message }));
      });
    }

    if (!dataset.metrics || dataset.metrics.length === 0) {
      warnings.push({ field: 'metrics', message: 'Dataset should have at least one metric' });
    }
    if (!dataset.versions || dataset.versions.length === 0) {
      warnings.push({ field: 'versions', message: 'Dataset should have at least one version' });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateMetrics(metrics: Metric[]): ValidationError[] {
    const errors: ValidationError[] = [];
    metrics.forEach((metric, i) => {
      if (!metric.id) errors.push({ field: `metrics[${i}].id`, message: 'Metric id is required' });
      if (!metric.name) errors.push({ field: `metrics[${i}].name`, message: 'Metric name is required' });
      if (!metric.label) errors.push({ field: `metrics[${i}].label`, message: 'Metric label is required' });
      if (!metric.dataType) errors.push({ field: `metrics[${i}].dataType`, message: 'Metric data type is required' });
    });
    const ids = metrics.map(m => m.id);
    const dupes = ids.filter((id, i) => id && ids.indexOf(id) !== i);
    dupes.forEach(id => errors.push({ field: `metrics`, message: `Duplicate metric id: ${id}` }));
    return errors;
  }

  validateVersion(version: DatasetVersion): ValidationError[] {
    const errors: ValidationError[] = [];
    if (!version.id) errors.push({ field: 'id', message: 'Version id is required' });
    if (!version.version || !/^\d+\.\d+$/.test(version.version)) {
      errors.push({ field: 'version', message: 'Version must be in semver format (e.g., 1.0)' });
    }

    if (version.series) {
      version.series.forEach((series, i) => {
        const seriesErrors = this.validateSeries(series);
        seriesErrors.forEach(e => errors.push({ field: `series[${i}].${e.field}`, message: e.message }));
      });
    }
    return errors;
  }

  validateSeries(series: Series): ValidationError[] {
    const errors: ValidationError[] = [];
    if (!series.id) errors.push({ field: 'id', message: 'Series id is required' });
    if (!series.metricId) errors.push({ field: 'metricId', message: 'Series metricId is required' });
    if (series.observations) {
      series.observations.forEach((obs, i) => {
        if (!obs.period) {
          errors.push({ field: `observations[${i}].period`, message: 'Observation period is required' });
        }
      });
    }
    return errors;
  }

  validateVisualization(viz: Visualization): ValidationError[] {
    const errors: ValidationError[] = [];
    if (!viz.id) errors.push({ field: 'id', message: 'Visualization id is required' });
    if (!viz.title) errors.push({ field: 'title', message: 'Visualization title is required' });
    if (!viz.type) errors.push({ field: 'type', message: 'Visualization type is required' });
    if (!viz.metricIds || viz.metricIds.length === 0) {
      errors.push({ field: 'metricIds', message: 'At least one metricId is required' });
    }
    return errors;
  }

  validateCsvImport(headers: string[], rows: Record<string, string>[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const requiredHeaders = ['period', 'value'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      errors.push({ field: 'headers', message: `Missing required columns: ${missingHeaders.join(', ')}` });
    }
    const datePattern = /^\d{4}(-\d{2})?(-\d{2})?$/;
    rows.forEach((row, i) => {
      if (row.period && !datePattern.test(row.period)) {
        warnings.push({ field: `rows[${i}].period`, message: `Row ${i + 1}: period "${row.period}" may not be a valid date format` });
      }
      if (row.value !== undefined && isNaN(Number(row.value))) {
        errors.push({ field: `rows[${i}].value`, message: `Row ${i + 1}: value "${row.value}" is not a valid number` });
      }
    });
    return { valid: errors.length === 0, errors, warnings };
  }

  validateJsonImport(data: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    if (!Array.isArray(data)) {
      errors.push({ field: 'root', message: 'JSON import must be an array of observations' });
      return { valid: false, errors, warnings: [] };
    }
    return this.validateCsvImport(
      data.length > 0 ? Object.keys(data[0]) : [],
      data.map((item: Record<string, unknown>) => {
        const row: Record<string, string> = {};
        for (const [k, v] of Object.entries(item)) {
          row[k] = String(v ?? '');
        }
        return row;
      })
    );
  }
}
