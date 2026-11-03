export interface EditorialReleaseHold {
  slug: string;
  status: 'HOLD';
  openedAt: string;
  reason: string;
  requiredBeforeRelease: string[];
}

/**
 * Development workflow hold. This registry is intentionally separate from the
 * production content database: existing live stories remain untouched. A hold
 * can be cleared only by an explicit editorial review and code-reviewed change.
 */
export const EDITORIAL_RELEASE_HOLDS: Record<string, EditorialReleaseHold> = {
  'ai-literacy-india-students-verify-ai': {
    slug: 'ai-literacy-india-students-verify-ai',
    status: 'HOLD',
    openedAt: '2026-10-24',
    reason: 'Published feature has 311 measured narrative words, mismatched reading time, no rendered chart, and no approved story-specific hero record.',
    requiredBeforeRelease: [
      'Evidence-linked rewrite and independent claim verification',
      'Human editorial approval of the narrative and limitations',
      'Story-specific hero asset with documented rights, alt text, caption, and approval timestamp',
      'Rendered visual proof at mobile and desktop widths',
    ],
  },
  'india-semiconductor-mission-fab-reality': {
    slug: 'india-semiconductor-mission-fab-reality',
    status: 'HOLD',
    openedAt: '2026-10-24',
    reason: 'Published feature has 304 measured narrative words, outdated project totals, unsupported economics claims, and no approved story-specific hero record.',
    requiredBeforeRelease: [
      'Evidence-linked rewrite with time-stamped official project status',
      'Remove or re-verify unsubstantiated margin/value-addition figures',
      'Human editorial approval of the narrative and counterevidence',
      'Story-specific hero asset with documented rights and rendered visual proof',
    ],
  },
  'bcci-domestic-mandate-ranji-economics': {
    slug: 'bcci-domestic-mandate-ranji-economics',
    status: 'HOLD',
    openedAt: '2026-10-24',
    reason: 'Published feature has 320 measured narrative words, a Test incentive wording error, an unsupported 42% appearance claim, and no approved story-specific hero record.',
    requiredBeforeRelease: [
      'Evidence-linked rewrite distinguishing playing XI and non-playing XI incentive rates',
      'Remove the unsupported 42% appearance claim unless reproducible scorecard data is supplied',
      'Human editorial and sports-data review',
      'Story-specific hero asset with documented rights and rendered visual proof',
    ],
  },
  'delhi-green-cracker-enforcement-diwali-2026': {
    slug: 'delhi-green-cracker-enforcement-diwali-2026',
    status: 'HOLD',
    openedAt: '2026-11-03',
    reason: 'Desk-researched accountability explainer complete and verified against primary court orders and institutional records; awaiting final independent human editorial board review and explicit publication authorization.',
    requiredBeforeRelease: [
      'Independent human editorial board acceptance review (Constitution Art. XI)',
      'Final Editor-in-Chief defensibility sign-off',
      'Explicit production publication authorization by authorized principal',
    ],
  },
};

export function getEditorialReleaseHold(slug: string): EditorialReleaseHold | null {
  return EDITORIAL_RELEASE_HOLDS[slug] || null;
}
