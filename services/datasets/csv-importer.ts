import type { Observation, DatasetVersion, Series } from '@/types/canonical';
import { DatasetValidator, type ValidationResult } from './validator';

export interface CsvImportResult {
  success: boolean;
  observations: Observation[];
  series: Series[];
  version: DatasetVersion;
  errors: string[];
  warnings: string[];
  rowCount: number;
  skippedCount: number;
}

export class DatasetCsvImporter {
  private validator = new DatasetValidator();

  parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
    const headers = this.parseLine(lines[0]);
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = this.parseLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
      rows.push(row);
    }
    return { headers, rows };
  }

  parseJson(json: string): { headers: string[]; rows: Record<string, string>[] } {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) throw new Error('JSON must be an array');
    const rows = data.map((item: Record<string, unknown>) => {
      const row: Record<string, string> = {};
      for (const [k, v] of Object.entries(item)) {
        row[k] = String(v ?? '');
      }
      return row;
    });
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { headers, rows };
  }

  importCsv(text: string, metricId: string, seriesId?: string): CsvImportResult {
    const parsed = this.parseCsv(text);
    return this.processImport(parsed.headers, parsed.rows, metricId, seriesId);
  }

  importJson(json: string, metricId: string, seriesId?: string): CsvImportResult {
    const parsed = this.parseJson(json);
    return this.processImport(parsed.headers, parsed.rows, metricId, seriesId);
  }

  private processImport(headers: string[], rows: Record<string, string>[], metricId: string, seriesId?: string): CsvImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validation: ValidationResult = this.validator.validateCsvImport(headers, rows);
    errors.push(...validation.errors.map(e => e.message));
    warnings.push(...validation.warnings.map(e => e.message));

    const observations: Observation[] = [];
    let skippedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const value = parseFloat(row.value);
      if (isNaN(value)) {
        skippedCount++;
        continue;
      }
      observations.push({
        period: row.period,
        value,
        annotation: row.annotation || row.notes || row.note || undefined,
      });
    }

    const sid = seriesId || `series-${Date.now()}`;
    const series: Series[] = [{
      id: sid,
      metricId,
      dimensionFilters: {},
      observations,
    }];

    const version: DatasetVersion = {
      id: `v-${Date.now()}`,
      version: '1.0',
      publishedAt: new Date().toISOString(),
      notes: `Imported ${observations.length} observations${errors.length > 0 ? ' with warnings' : ''}`,
      series,
      metadata: { importType: 'csv', importedAt: new Date().toISOString() },
    };

    return {
      success: errors.length === 0,
      observations,
      series,
      version,
      errors,
      warnings,
      rowCount: rows.length,
      skippedCount,
    };
  }

  importExcel(buffer: ArrayBuffer, metricId: string, seriesId?: string): CsvImportResult {
    const errors: string[] = ['Excel import requires the xlsx library to be installed'];
    const observations: Observation[] = [];
    const series: Series[] = [{ id: seriesId || 'series-import', metricId, dimensionFilters: {}, observations: [] }];
    return {
      success: false,
      observations,
      series,
      version: { id: 'v-import', version: '0.0', publishedAt: '', notes: 'Excel import failed', series, metadata: {} },
      errors,
      warnings: [],
      rowCount: 0,
      skippedCount: 0,
    };
  }

  private parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
}
