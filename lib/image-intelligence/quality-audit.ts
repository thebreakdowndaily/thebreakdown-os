export type ImageQualityIssueKind =
  | 'missing-manifest'
  | 'manifest-mismatch'
  | 'incomplete-manifest'
  | 'placeholder'
  | 'duplicate-path'
  | 'duplicate-content';

export interface ImageQualityRecord {
  slug: string;
  assetPath: string;
  sha256: string;
  publicationStatus?: string;
  manifestProvenance?: string;
  manifestLicense?: string;
  manifestSourceUrl?: string;
  resolutionType?: string;
  isFallback?: boolean;
  hasManifest: boolean;
  manifestMatchesResolvedAsset: boolean;
  manifestComplete: boolean;
  isPlaceholder: boolean;
}

export interface ImageQualityIssue {
  kind: ImageQualityIssueKind;
  slugs: string[];
  assets: string[];
}

export interface ImageQualityException extends ImageQualityIssue {
  id: string;
  reason: string;
  owner: string;
  evidence: string;
  expiresAt: string;
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function groupIssue(
  kind: ImageQualityIssueKind,
  records: ImageQualityRecord[],
  assets: string[],
): ImageQualityIssue {
  return {
    kind,
    slugs: sortedUnique(records.map((record) => record.slug)),
    assets: sortedUnique(assets),
  };
}

/**
 * Reports editorial-quality defects in the actual resolved hero assets for
 * publicly visible stories. This is separate from basic file-format checks.
 *
 * A manifest entry is an explicit editorial approval record. Token overlap or
 * category matching is not itself approval. Legacy exceptions are applied by
 * the caller and must match the exact issue, asset(s), and story slug(s).
 */
export function detectImageQualityIssues(
  records: ImageQualityRecord[],
): ImageQualityIssue[] {
  const issues: ImageQualityIssue[] = [];

  for (const record of records) {
    if (!record.hasManifest) {
      issues.push(groupIssue('missing-manifest', [record], [record.assetPath]));
    } else if (!record.manifestMatchesResolvedAsset) {
      issues.push(groupIssue('manifest-mismatch', [record], [record.assetPath]));
    } else if (!record.manifestComplete) {
      issues.push(groupIssue('incomplete-manifest', [record], [record.assetPath]));
    }

    if (record.isPlaceholder) {
      issues.push(groupIssue('placeholder', [record], [record.assetPath]));
    }
  }

  const pathGroups = new Map<string, ImageQualityRecord[]>();
  const contentGroups = new Map<string, ImageQualityRecord[]>();

  for (const record of records) {
    const pathGroup = pathGroups.get(record.assetPath) || [];
    pathGroup.push(record);
    pathGroups.set(record.assetPath, pathGroup);

    if (record.sha256) {
      const contentGroup = contentGroups.get(record.sha256) || [];
      contentGroup.push(record);
      contentGroups.set(record.sha256, contentGroup);
    }
  }

  for (const [assetPath, group] of pathGroups) {
    if (group.length > 1) {
      issues.push(groupIssue('duplicate-path', group, [assetPath]));
    }
  }

  for (const group of contentGroups.values()) {
    const paths = sortedUnique(group.map((record) => record.assetPath));
    if (paths.length > 1) {
      issues.push(groupIssue('duplicate-content', group, paths));
    }
  }

  return issues.sort((a, b) => {
    const byKind = a.kind.localeCompare(b.kind);
    if (byKind !== 0) return byKind;
    return JSON.stringify(a).localeCompare(JSON.stringify(b));
  });
}

export function imageQualityIssueKey(issue: ImageQualityIssue): string {
  return JSON.stringify({
    kind: issue.kind,
    slugs: sortedUnique(issue.slugs),
    assets: sortedUnique(issue.assets),
  });
}

export function validateImageQualityBaseline(
  issues: ImageQualityIssue[],
  exceptions: ImageQualityException[],
  today: string,
): {
  approvedLegacy: Array<{ issue: ImageQualityIssue; exception: ImageQualityException }>;
  unapproved: ImageQualityIssue[];
  expired: ImageQualityException[];
  stale: ImageQualityException[];
  invalidExceptions: ImageQualityException[];
} {
  const activeExceptions = exceptions.filter((exception) => exception.expiresAt >= today);
  const expired = exceptions.filter((exception) => exception.expiresAt < today);
  const invalidExceptions = exceptions.filter((exception) =>
    !exception.id.trim() ||
    !exception.reason.trim() ||
    !exception.owner.trim() ||
    !exception.evidence.trim() ||
    !/^\\d{4}-\\d{2}-\\d{2}$/.test(exception.expiresAt) ||
    !Number.isFinite(Date.parse(`${exception.expiresAt}T00:00:00Z`))
  );
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  for (const exception of exceptions) {
    const key = imageQualityIssueKey(exception);
    if (seenIds.has(exception.id) || seenKeys.has(key)) {
      if (!invalidExceptions.includes(exception)) invalidExceptions.push(exception);
    }
    seenIds.add(exception.id);
    seenKeys.add(key);
  }
  const approvedLegacy: Array<{ issue: ImageQualityIssue; exception: ImageQualityException }> = [];
  const unapproved: ImageQualityIssue[] = [];
  const consumed = new Set<string>();

  for (const issue of issues) {
    const key = imageQualityIssueKey(issue);
    const exception = activeExceptions.find((candidate) => imageQualityIssueKey(candidate) === key);
    if (exception) {
      approvedLegacy.push({ issue, exception });
      consumed.add(exception.id);
    } else {
      unapproved.push(issue);
    }
  }

  const stale = activeExceptions.filter((exception) => !consumed.has(exception.id));
  return { approvedLegacy, unapproved, expired, stale, invalidExceptions };
}
