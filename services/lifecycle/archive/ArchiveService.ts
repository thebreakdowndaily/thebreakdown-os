import { NormalizedDocument } from '../providers/SourceProvider';
import { DiffResult } from '../change-detector/ChangeDetector';

export interface ArchiveRecord {
  id: string;
  sourceId: string;
  version: number;
  document: NormalizedDocument;
  diffFromPrevious?: DiffResult;
  archivedAt: string;
}

export class ArchiveService {
  private records: ArchiveRecord[] = [];

  archive(document: NormalizedDocument, diff?: DiffResult) {
    const existing = this.records.filter(r => r.sourceId === document.sourceId);
    const version = existing.length + 1;
    
    this.records.push({
      id: `archive-${Date.now()}`,
      sourceId: document.sourceId,
      version,
      document,
      diffFromPrevious: diff,
      archivedAt: new Date().toISOString()
    });
  }

  getHistory(sourceId: string): ArchiveRecord[] {
    return this.records.filter(r => r.sourceId === sourceId).sort((a, b) => b.version - a.version);
  }
}
