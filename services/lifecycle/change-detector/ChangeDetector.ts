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
        claimChanges: (newDoc.claims || []).map(c => ({ oldText: '', newText: c.text, type: 'added' as const })),
        metadataChanges: {
          title: { old: null, new: newDoc.title },
          url: { old: null, new: newDoc.url },
          publishedAt: { old: null, new: newDoc.publishedAt },
        },
        mediaChanges: [],
        relationshipChanges: [],
        timelineChanges: []
      };
    }

    const claimChanges: Array<{ oldText: string; newText: string; type: 'added' | 'removed' | 'modified' }> = [];
    const oldClaims = oldDoc.claims || [];
    const newClaims = newDoc.claims || [];

    // Track matched claims between versions
    const matchedOldIndices = new Set<number>();
    const matchedNewIndices = new Set<number>();

    // 1. Exact text matches
    for (let ni = 0; ni < newClaims.length; ni++) {
      const nc = newClaims[ni];
      for (let oi = 0; oi < oldClaims.length; oi++) {
        if (!matchedOldIndices.has(oi) && oldClaims[oi].text.trim() === nc.text.trim()) {
          matchedOldIndices.add(oi);
          matchedNewIndices.add(ni);
          break;
        }
      }
    }

    // 2. Contextual / Substantial modification matches
    for (let ni = 0; ni < newClaims.length; ni++) {
      if (matchedNewIndices.has(ni)) continue;
      const nc = newClaims[ni];

      for (let oi = 0; oi < oldClaims.length; oi++) {
        if (matchedOldIndices.has(oi)) continue;
        const oc = oldClaims[oi];

        const shareContext = nc.context && oc.context && nc.context === oc.context;
        const normalizedOld = oc.text.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedNew = nc.text.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isSubstring = normalizedOld.includes(normalizedNew) || normalizedNew.includes(normalizedOld);

        if (shareContext || (isSubstring && normalizedOld.length > 10 && normalizedNew.length > 10)) {
          matchedOldIndices.add(oi);
          matchedNewIndices.add(ni);
          claimChanges.push({
            oldText: oc.text,
            newText: nc.text,
            type: 'modified'
          });
          break;
        }
      }
    }

    // 3. Unmatched in new => added
    for (let ni = 0; ni < newClaims.length; ni++) {
      if (!matchedNewIndices.has(ni)) {
        claimChanges.push({
          oldText: '',
          newText: newClaims[ni].text,
          type: 'added'
        });
      }
    }

    // 4. Unmatched in old => removed
    for (let oi = 0; oi < oldClaims.length; oi++) {
      if (!matchedOldIndices.has(oi)) {
        claimChanges.push({
          oldText: oldClaims[oi].text,
          newText: '',
          type: 'removed'
        });
      }
    }

    // 5. Metadata changes
    const metadataChanges: Record<string, { old: unknown; new: unknown }> = {};
    if (oldDoc.title !== newDoc.title) {
      metadataChanges.title = { old: oldDoc.title, new: newDoc.title };
    }
    if (oldDoc.url !== newDoc.url) {
      metadataChanges.url = { old: oldDoc.url, new: newDoc.url };
    }
    if (oldDoc.publishedAt !== newDoc.publishedAt) {
      metadataChanges.publishedAt = { old: oldDoc.publishedAt, new: newDoc.publishedAt };
    }

    // Compare entities
    const oldEntities = new Set(oldDoc.entities || []);
    const newEntities = new Set(newDoc.entities || []);
    const addedEntities = Array.from(newEntities).filter(e => !oldEntities.has(e));
    const removedEntities = Array.from(oldEntities).filter(e => !newEntities.has(e));
    if (addedEntities.length > 0 || removedEntities.length > 0) {
      metadataChanges.entities = { old: Array.from(oldEntities), new: Array.from(newEntities) };
    }

    const contentChanged = oldDoc.content.trim() !== newDoc.content.trim();
    const hasChanges = claimChanges.length > 0 || Object.keys(metadataChanges).length > 0 || contentChanged;

    return {
      sourceId: newDoc.sourceId,
      hasChanges,
      claimChanges,
      metadataChanges,
      mediaChanges: [],
      relationshipChanges: [],
      timelineChanges: []
    };
  }
}
