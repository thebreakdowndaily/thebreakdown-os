import { NormalizedDocument } from '../providers/SourceProvider';

export interface DiffResult {
  sourceId: string;
  hasChanges: boolean;
  claimChanges: Array<{ oldText: string; newText: string; type: 'added' | 'removed' | 'modified' }>;
  metadataChanges: Record<string, { old: unknown; new: unknown }>;
  mediaChanges: Array<{ id: string; type: 'added' | 'removed' }>;
  relationshipChanges: Array<{ targetId: string; type: 'added' | 'removed' }>;
  timelineChanges: Array<{ date: string; event: string; type: 'added' | 'removed' }>;
}

export class ChangeDetector {
  async compare(oldDoc: NormalizedDocument | null, newDoc: NormalizedDocument): Promise<DiffResult> {
    if (!oldDoc) {
      return {
        sourceId: newDoc.sourceId,
        hasChanges: true,
        claimChanges: newDoc.claims.map(c => ({ oldText: '', newText: c.text, type: 'added' })),
        metadataChanges: {},
        mediaChanges: [],
        relationshipChanges: [],
        timelineChanges: []
      };
    }

    const hasChanges = oldDoc.content !== newDoc.content || oldDoc.claims.length !== newDoc.claims.length;
    
    // In a real implementation, this would run a diffing algorithm.
    // For now, we return a mock diff structure.
    return {
      sourceId: newDoc.sourceId,
      hasChanges,
      claimChanges: hasChanges ? [{ oldText: 'Old claim', newText: 'New claim', type: 'modified' }] : [],
      metadataChanges: {},
      mediaChanges: [],
      relationshipChanges: [],
      timelineChanges: []
    };
  }
}
