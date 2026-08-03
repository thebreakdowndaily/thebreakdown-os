import type { VerificationWorkspace, FieldPack } from '@/lib/intel/toolkit/types';
import type { InvestigationCase } from '@/lib/intel/editorial/types';
import type { FieldVerificationPlan } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Field Verification)
// The field plan reuses the certified toolkit Field Verification assets (workspace documents,
// ground reporting, official datasets; field-pack places and people). The Verification Service
// never re-derives field intelligence — it references the toolkit engine outputs.

function unique(items: string[]): string[] {
  return items.filter((v, i, arr) => v && v.trim() !== '' && arr.indexOf(v) === i);
}

export function buildFieldVerificationPlan(
  workspace: VerificationWorkspace | null,
  fieldPack: FieldPack | null,
  investigation: InvestigationCase | null
): FieldVerificationPlan {
  const recommendedDocuments = unique([
    ...(workspace?.recommendedDocuments ?? []),
    ...(fieldPack?.documentsToCollect ?? []),
  ]);

  const groundReporting = unique([
    ...(workspace?.groundReporting ?? []),
    ...(fieldPack?.groundVerificationChecklist ?? []),
  ]);

  const officialDatasets = workspace?.officialDatasets ?? [];
  const placesToVisit = fieldPack?.placesToVisit ?? [];
  const peopleToInterview = fieldPack?.peopleToInterview ?? [];

  // Editorial recommendations supplement the field plan when present.
  const recommendationTasks = (investigation?.recommendations ?? [])
    .map((r) => r.action)
    .filter((a) => a && a.trim() !== '');
  if (recommendationTasks.length > 0) {
    groundReporting.push(...unique(recommendationTasks));
  }

  const taskCount =
    recommendedDocuments.length + groundReporting.length + officialDatasets.length + placesToVisit.length + peopleToInterview.length;

  return {
    recommendedDocuments,
    groundReporting,
    officialDatasets,
    placesToVisit,
    peopleToInterview,
    taskCount,
  };
}
