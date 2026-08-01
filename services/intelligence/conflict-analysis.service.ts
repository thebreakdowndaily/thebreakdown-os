// ── Workstream 4: Conflict Analysis Service (Phase 14B Pure Derivation) ───────

import { Fix } from '../../types/canonical';
import { ConflictReport, ConflictItem } from './intelligence-types';

export class ConflictAnalysisService {
  /**
   * Analyzes an array of canonical Fix objects and generates a derived ConflictReport.
   * Pure function: 0 database mutation, 0 state persistence.
   */
  public static analyzeConflicts(fixes: Fix[]): ConflictReport {
    const conflicts: ConflictItem[] = [];

    // 1. Superseded Pointer Conflict Detection
    const fixMap = new Map<string, Fix>();
    for (const f of fixes) {
      fixMap.set(f.id, f);
    }

    for (const f of fixes) {
      if (f.publicationStatus === 'superseded') {
        if (!f.supersededByFixId || !fixMap.has(f.supersededByFixId)) {
          conflicts.push({
            id: `cnf-superseded-missing-${f.id}`,
            conflictType: 'SUPERSEDED_LEGISLATION',
            severity: 'CRITICAL',
            description: `Fix "${f.title || f.headline}" is marked superseded but supersededByFixId pointer "${f.supersededByFixId || 'null'}" cannot be resolved.`,
            objectIdA: f.id,
            objectIdB: f.supersededByFixId || 'null',
            supportingReferences: [{ targetId: f.id, targetType: 'FIX', label: f.title || f.headline }],
          });
        }
      }
    }

    // 2. Grade Incompatibility Conflict
    for (const f of fixes) {
      const sourceCount = (f.sources?.length || 0) + (f.sourceIds?.length || 0);
      if (f.evidenceGrade === 'High' && sourceCount === 0) {
        conflicts.push({
          id: `cnf-grade-incompatible-${f.id}`,
          conflictType: 'GRADE_INCOMPATIBILITY',
          severity: 'HIGH',
          description: `Fix "${f.title || f.headline}" asserts High Evidence Grade despite having zero source citations.`,
          objectIdA: f.id,
          objectIdB: f.id,
          supportingReferences: [{ targetId: f.id, targetType: 'FIX', label: f.title || f.headline }],
        });
      }
    }

    // 3. Competing Recommendations / Duplicate Slugs
    const slugMap = new Map<string, string[]>();
    for (const f of fixes) {
      if (f.slug) {
        const list = slugMap.get(f.slug) || [];
        list.push(f.id);
        slugMap.set(f.slug, list);
      }
    }

    for (const [slug, ids] of slugMap.entries()) {
      if (ids.length > 1) {
        conflicts.push({
          id: `cnf-duplicate-slug-${slug}`,
          conflictType: 'COMPETING_RECOMMENDATION',
          severity: 'CRITICAL',
          description: `Duplicate slug collision detected across Fix objects: "${slug}".`,
          objectIdA: ids[0],
          objectIdB: ids[1],
          supportingReferences: ids.map((id) => ({ targetId: id, targetType: 'FIX', label: slug })),
        });
      }
    }

    const criticalCount = conflicts.filter((c) => c.severity === 'CRITICAL').length;

    return {
      generatedAt: new Date().toISOString(),
      conflictsCount: conflicts.length,
      criticalConflictsCount: criticalCount,
      conflicts,
    };
  }
}
