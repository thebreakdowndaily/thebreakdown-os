import { computeEditorialOverview } from '../lib/intel/editorial/overview';
import { getConstituencyToolkit } from '../lib/intel/toolkit/overview';
import { computeExecutiveBriefing } from '../lib/intel/executive';
import { computeVerificationCaseDetail } from '../lib/intel/verification';
import {
  computeStoryOverview,
  computeStoryDetail,
  buildStoryExecutiveSummary,
  buildStoryBrief,
  buildStoryOutline,
  buildStoryImpact,
  buildSourcePanel,
  deriveStoryDraft,
  toStorySummary,
  classifyStoryType,
  priorityTierForStory,
  slugify,
  headlineOptionsFor,
  computeStoryReadiness,
  ensureStorySeed,
  getStoryWorkflow,
  getStoryStatus,
  getStoryVersion,
  getStoryAudit,
  transitionStory,
  assignStoryEditor,
  addStoryNote,
  resetStoryStore,
  canTransitionStory,
  nextStoryTransitions,
  isTerminalStory,
  isStoryOpen,
  isVerificationGated,
  storyStatusLabel,
  STORY_STATUSES,
  STORY_IMPACT_WEIGHTS,
  STORY_IMPACT_CALC_VERSION,
  validateStoryImpactWeights,
  exportStoryPackage,
  exportStoryJson,
  exportStoryMarkdown,
  exportPrintBrief,
  exportEditorialSummary,
  type StoryStatus,
} from '../lib/intel/story';
import { canAccessIntelModule, normalizeIntelRole } from '../features/auth/roles';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder)
// Tests the Story Builder & Editorial Production System: editorial status machine, verification
// gate, derived planning surfaces (brief/outline/impact/source panel), readiness rules, workflow
// store invariants, overview/detail aggregation, Executive/Mission Control integration, the
// publication package exports, and RBAC boundaries.

const EDITOR = { id: 'editor-1', name: 'Anita Desai' };

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, msg: string) {
    if (cond) {
      passed++;
    } else {
      console.error(`  FAIL: ${msg}`);
      failed++;
    }
  }

  console.log('Test 1: Editorial status machine — 10 states, explicit transitions, terminal semantics');
  try {
    assert(STORY_STATUSES.length === 10, 'Exactly ten statuses');
    const expected: StoryStatus[] = [
      'idea', 'planned', 'researching', 'verification_required', 'verification_complete',
      'drafting', 'editorial_review', 'ready_for_publication', 'published', 'archived',
    ];
    for (const s of expected) assert(STORY_STATUSES.includes(s), `Status present: ${s}`);

    // archived is terminal; every other state has at least one outgoing transition.
    for (const s of STORY_STATUSES) {
      if (s === 'archived') {
        assert(isTerminalStory(s), 'archived is terminal');
        assert(nextStoryTransitions(s).length === 0, 'archived has no outgoing transitions');
      } else {
        assert(!isTerminalStory(s), `${s} is not terminal`);
        assert(nextStoryTransitions(s).length > 0, `${s} has outgoing transitions`);
      }
    }

    // No self-transitions.
    for (const s of STORY_STATUSES) {
      assert(!canTransitionStory(s, s), `no self-transition for ${s}`);
      assert(!nextStoryTransitions(s).includes(s), `nextStoryTransitions excludes self for ${s}`);
    }

    // The canonical happy path is a chain.
    const path: Array<[StoryStatus, StoryStatus]> = [
      ['idea', 'planned'],
      ['planned', 'researching'],
      ['researching', 'verification_required'],
      ['verification_required', 'verification_complete'],
      ['verification_complete', 'drafting'],
      ['drafting', 'editorial_review'],
      ['editorial_review', 'ready_for_publication'],
      ['ready_for_publication', 'published'],
    ];
    for (const [from, to] of path) assert(canTransitionStory(from, to), `${from} → ${to} allowed`);

    // Sideways shifts are rejected.
    assert(!canTransitionStory('verification_complete', 'editorial_review'), 'cannot skip drafting');
    assert(!canTransitionStory('drafting', 'ready_for_publication'), 'cannot skip editorial review');
    assert(!canTransitionStory('idea', 'drafting'), 'cannot jump to drafting from idea');
    assert(!canTransitionStory('verification_required', 'published'), 'cannot publish without verification');

    // Reopen semantics.
    assert(canTransitionStory('published', 'editorial_review'), 'published can reopen to editorial review');
    assert(canTransitionStory('editorial_review', 'drafting'), 'editorial review can reopen drafting');
    assert(canTransitionStory('verification_complete', 'verification_required'), 'verification complete can reopen verification');

    // Open-state semantics.
    assert(isStoryOpen('idea'), 'idea is open');
    assert(isStoryOpen('drafting'), 'drafting is open');
    assert(!isStoryOpen('published'), 'published is not open');
    assert(!isStoryOpen('archived'), 'archived is not open');

    assert(storyStatusLabel('ready_for_publication') === 'Ready for Publication', 'status label mapping');
  } catch (e) {
    console.error('  FAIL: status machine threw', e);
    failed++;
  }

  console.log('Test 2: Story draft derivation from certified engines (detail path)');
  try {
    resetStoryStore();
    const editorial = await computeEditorialOverview(403);
    const first = editorial.ranked[0];
    const [toolkit, verification] = await Promise.all([
      getConstituencyToolkit(first.canonical_constituency_id),
      computeVerificationCaseDetail(first.canonical_constituency_id),
    ]);
    ensureStorySeed([first.canonical_constituency_id]);
    const workflow = getStoryWorkflow(first.canonical_constituency_id) ?? null;
    const draft = deriveStoryDraft(first, toolkit, verification, workflow);

    assert(draft.id === first.canonical_constituency_id, 'draft id is the constituency id');
    assert(draft.constituencyName === first.constituency_name, 'draft names the constituency');
    assert(draft.ipi === first.ipi, 'draft carries IPI');
    assert(draft.status === 'idea', 'fresh seeded draft defaults to idea');
    assert(draft.storyType.length > 0, 'story type classified');
    assert(draft.brief.executiveSummary.length > 0, 'brief has an executive summary');
    assert(draft.brief.sections.length === 11, 'brief has 11 planning sections');
    assert(draft.outline.length >= 10, 'outline has 10+ planning blocks');
    assert(draft.outline.every((b) => b.items.every((i) => i.source.length > 0)), 'every outline item traces to a source');
    assert(draft.impact.dimensions.length === 8, 'impact has 8 weighted dimensions');
    assert(draft.sourcePanel.length === 6, 'source panel covers six domains');
    assert(draft.readiness.verificationStatus === verification.status, 'readiness reflects the linked verification case');
    assert(draft.references.evidence[0].source.startsWith('lib/intel/evidence'), 'evidence reference traces to the Evidence engine');
    assert(draft.created === '2026-07-29T08:00:00.000Z', 'seed timestamps are deterministic');

    const summary = toStorySummary(draft);
    assert(summary.id === draft.id, 'summary carries the draft id');
    assert(summary.status === 'idea', 'summary carries the workflow status');
  } catch (e) {
    console.error('  FAIL: detail derivation threw', e);
    failed++;
  }

  console.log('Test 3: Deterministic classification, tiers, slugs, headline options');
  try {
    assert(priorityTierForStory(75) === 'critical', 'IPI 75 → critical');
    assert(priorityTierForStory(60) === 'high', 'IPI 60 → high');
    assert(priorityTierForStory(45) === 'medium', 'IPI 45 → medium');
    assert(priorityTierForStory(30) === 'low', 'IPI 30 → low');

    assert(classifyStoryType(80, 90, 1) === 'investigation', 'IPI >= 70 → investigation');
    assert(classifyStoryType(50, 40, 0) === 'explainer', 'low coverage → explainer');
    assert(classifyStoryType(60, 80, 2) === 'analysis', 'scenario flips → analysis');
    assert(classifyStoryType(55, 80, 0) === 'news_story', 'else → news story');

    assert(slugify('Kashmir North', 12) === 'ac-12-kashmir-north', 'slug sanitizes and prefixes AC number');
    assert(slugify('  A  B  ', 3) === 'ac-3-a-b', 'slug collapses whitespace');

    const editorial = await computeEditorialOverview(403);
    const inv = editorial.ranked[0];
    const options = headlineOptionsFor(inv, null);
    assert(options.length >= 2, 'derived headline options exist without a toolkit');
    assert(options.every((o) => o.length > 0), 'headline options are non-empty');
  } catch (e) {
    console.error('  FAIL: classification tests threw', e);
    failed++;
  }

  console.log('Test 4: Brief, outline, impact, and source panel builders');
  try {
    const editorial = await computeEditorialOverview(403);
    const inv = editorial.ranked[0];
    const toolkit = await getConstituencyToolkit(inv.canonical_constituency_id);

    const brief = buildStoryBrief({
      investigation: inv,
      toolkit,
      evidenceCoverage: 65,
      dataGaps: ['Caste demography'],
      verificationStatus: 'verified',
      confidence: inv.confidence,
    });
    assert(brief.whyItMatters.length > 0, 'brief has why-it-matters reasons');
    assert(brief.keyFindings.length > 0, 'brief has key findings');
    assert(brief.sections.every((s) => s.items.every((i) => i.source.length > 0)), 'every brief item traces to a source');
    assert(brief.recommendedPublicationTiming.length > 0, 'brief recommends publication timing');

    const outline = buildStoryOutline({
      investigation: inv,
      toolkit,
      storyType: 'investigation',
      evidenceCoverage: 65,
      verificationStatus: 'verified',
      headlineOptions: headlineOptionsFor(inv, toolkit),
    });
    assert(outline.some((b) => b.id === 'headline_options'), 'outline includes headline options block');
    assert(outline.some((b) => b.id === 'key_takeaways'), 'outline includes key takeaways block');
    assert(outline.some((b) => b.id === 'evidence'), 'outline includes evidence block');
    assert(outline.some((b) => b.id === 'counterarguments'), 'outline includes counterarguments block');
    assert(outline.some((b) => b.id === 'suggested_interviews'), 'outline includes suggested interviews block');
    assert(outline.some((b) => b.id === 'related_stories'), 'outline includes related stories block');

    const impact = buildStoryImpact({
      ipi: inv.ipi,
      confidence: inv.confidence,
      evidenceCoverage: 65,
      verifiedRatio: 0.8,
      verificationScore: 82,
      researchFindings: 5,
      scenarioFlips: 2,
      trustValue: 71,
      verificationConfidence: 'HIGH',
    });
    assert(impact.calculationVersion === STORY_IMPACT_CALC_VERSION, 'impact version is the canonical calc version');
    assert(impact.overall === Math.round(impact.dimensions.reduce((a, d) => a + d.contribution, 0)), 'overall is the rounded sum of contributions');
    assert(impact.dimensions.every((d) => d.value >= 0 && d.value <= 100), 'dimension values are on the 0–100 scale');
    assert(impact.dimensions.every((d) => d.source.length > 0), 'every dimension names its source');
    assert(validateStoryImpactWeights(), 'registered weights pass validation (sum to 1)');
    assert(Math.abs(Object.values(STORY_IMPACT_WEIGHTS).reduce((a, w) => a + w, 0) - 1) < 1e-9, 'weights sum to exactly 1');

    const panel = buildSourcePanel({
      investigation: inv,
      toolkit,
      evidenceCoverage: 65,
      evidenceCount: 40,
      researchFindings: 5,
      verificationStatus: 'verified',
      verificationScore: 82,
      verifiedClaims: 20,
      totalClaims: 25,
      generatedAt: '2026-07-30T00:00:00.000Z',
    });
    assert(panel.length === 6, 'six source domains');
    assert(panel.every((e) => e.coverage >= 0 && e.coverage <= 100), 'coverage is a percentage');
    assert(panel.find((e) => e.domain === 'verification_workspace')?.confidence === 'HIGH', 'verified verification surfaces high confidence');
  } catch (e) {
    console.error('  FAIL: builder tests threw', e);
    failed++;
  }

  console.log('Test 5: Editorial readiness rules — verification before editorial readiness');
  try {
    // Not verified → needs_verification regardless of story status.
    const notVerified = computeStoryReadiness({
      status: 'ready_for_publication',
      verificationStatus: 'evidence_complete',
      verificationScore: 55,
      verificationCanPublish: false,
      openConflicts: 0,
      openFieldTasks: 0,
      openBlockers: [],
    });
    assert(notVerified.state === 'needs_verification', 'unverified → needs_verification');
    assert(notVerified.canPublish === false, 'unverified cannot publish');

    // Verified + ready_for_publication → ready.
    const ready = computeStoryReadiness({
      status: 'ready_for_publication',
      verificationStatus: 'verified',
      verificationScore: 90,
      verificationCanPublish: true,
      openConflicts: 0,
      openFieldTasks: 0,
      openBlockers: [],
    });
    assert(ready.state === 'ready', 'verified + ready_for_publication → ready');
    assert(ready.canPublish === true, 'ready can publish');

    // Open conflicts → blocked even when verified.
    const blocked = computeStoryReadiness({
      status: 'ready_for_publication',
      verificationStatus: 'verified',
      verificationScore: 90,
      verificationCanPublish: true,
      openConflicts: 2,
      openFieldTasks: 0,
      openBlockers: [],
    });
    assert(blocked.state === 'blocked', 'open conflicts → blocked');

    // Field tasks → needs_field_reporting.
    const field = computeStoryReadiness({
      status: 'verification_required',
      verificationStatus: 'verified',
      verificationScore: 70,
      verificationCanPublish: false,
      openConflicts: 0,
      openFieldTasks: 3,
      openBlockers: [],
    });
    assert(field.state === 'needs_field_reporting', 'open field tasks → needs_field_reporting');

    // Terminal states.
    assert(computeStoryReadiness({ status: 'published', verificationStatus: 'verified', verificationScore: 90, verificationCanPublish: true, openConflicts: 0, openFieldTasks: 0, openBlockers: [] }).state === 'published', 'published is a terminal readiness state');
    assert(computeStoryReadiness({ status: 'archived', verificationStatus: null, verificationScore: null, verificationCanPublish: null, openConflicts: null, openFieldTasks: null, openBlockers: [] }).state === 'archived', 'archived is a terminal readiness state');
  } catch (e) {
    console.error('  FAIL: readiness tests threw', e);
    failed++;
  }

  console.log('Test 6: Workflow store — verification gate, transition map, audit invariants');
  try {
    resetStoryStore();
    ensureStorySeed(['st-1']);
    assert(getStoryStatus('st-1') === 'idea', 'seeded draft starts at idea');
    assert(getStoryVersion('st-1') === 1, 'seeded draft starts at version 1');
    assert(getStoryAudit('st-1').length === 1, 'seed writes one created audit entry');
    assert(getStoryAudit('st-1')[0].action === 'created', 'seed audit entry is created');

    // Idempotent seeding.
    ensureStorySeed(['st-1']);
    assert(getStoryAudit('st-1').length === 1, 're-seeding is idempotent');

    // Gate: cannot reach verification-gated states without a verified case.
    let r = transitionStory('st-1', 'verification_complete', EDITOR, { verificationStatus: 'evidence_complete' });
    assert(!r.success, 'cannot reach verification_complete without verified');
    assert(isVerificationGated('verification_complete'), 'verification_complete is verification-gated');

    // Walk the happy path with the gate satisfied.
    const steps: StoryStatus[] = ['planned', 'researching', 'verification_required'];
    for (const to of steps) {
      r = transitionStory('st-1', to, EDITOR);
      assert(r.success, `idea → ${to}`);
    }
    r = transitionStory('st-1', 'verification_complete', EDITOR, { verificationStatus: 'verified' });
    assert(r.success, 'verification_complete allowed once verified');
    r = transitionStory('st-1', 'drafting', EDITOR);
    assert(r.success, 'verification_complete → drafting');
    r = transitionStory('st-1', 'editorial_review', EDITOR, { verificationStatus: 'verified' });
    assert(r.success, 'drafting → editorial_review with verified');
    r = transitionStory('st-1', 'ready_for_publication', EDITOR, { verificationStatus: 'verified' });
    assert(r.success, 'editorial_review → ready_for_publication with verified');
    r = transitionStory('st-1', 'published', EDITOR);
    assert(r.success, 'ready_for_publication → published');

    assert(getStoryStatus('st-1') === 'published', 'final status is published');
    assert(getStoryVersion('st-1') === 9, 'each mutation bumps the version (seed + 8 transitions)');
    const audit = getStoryAudit('st-1');
    assert(audit.length === 9, 'one audit entry per mutation');
    assert(audit.every((a, i) => i === 0 || a.id > audit[i - 1].id, ), 'audit ids are monotonic');

    // Illegal transition and unknown story.
    resetStoryStore();
    ensureStorySeed(['st-1']);
    r = transitionStory('st-1', 'published', EDITOR);
    assert(!r.success, 'cannot jump straight to published');
    r = transitionStory('ghost', 'planned', EDITOR);
    assert(!r.success, 'unknown draft rejected');

    // Editor assignment and notes.
    r = assignStoryEditor('st-1', EDITOR);
    assert(r.success, 'editor can be assigned');
    assert(getStoryWorkflow('st-1')?.editor?.name === 'Anita Desai', 'workflow records the assigned editor');
    r = addStoryNote('st-1', EDITOR, 'Chase the delimitation angle.');
    assert(r.success, 'note can be added');
    assert(getStoryWorkflow('st-1')?.notes.length === 1, 'note recorded');
    assert(getStoryAudit('st-1').some((a) => a.action === 'note' && a.note === 'Chase the delimitation angle.'), 'note appears in the audit trail');

    // Copies protect the store from callers mutating returned views.
    const wf = getStoryWorkflow('st-1');
    if (wf) {
      wf.notes.push('mutator');
      wf.audit.push({} as never);
      assert(getStoryWorkflow('st-1')?.notes.length === 1, 'returned workflow is a defensive copy');
      assert(getStoryWorkflow('st-1')?.audit.length === getStoryAudit('st-1').length, 'returned audit is a defensive copy');
    }
  } catch (e) {
    console.error('  FAIL: store tests threw', e);
    failed++;
  }

  console.log('Test 7: Overview and detail aggregation');
  try {
    resetStoryStore();
    const overview = await computeStoryOverview();
    assert(overview.totalDrafts === overview.stories.length, 'overview counts match its story list');
    assert(overview.stories.length > 0, 'overview has story drafts');
    assert(overview.statusCounts.idea === overview.stories.filter((s) => s.status === 'idea').length, 'status counts sum correctly');
    assert(overview.stories.every((s) => s.headline.length > 0), 'every summary has a headline');
    assert(overview.stories.every((s) => s.priorityTier === 'critical' || s.priorityTier === 'high'), 'top seats are critical or high priority');
    assert(overview.dataSource.length > 0 && overview.researchCutoff.length > 0, 'overview carries dataset metadata');
    assert(overview.limitations.length >= 4, 'overview declares its limitations');

    const firstId = overview.stories[0].id;
    const detail = await computeStoryDetail(firstId);
    assert(detail !== null, 'detail resolves for a top seat');
    if (detail) {
      assert(detail.brief.sections.length === 11, 'detail brief is complete');
      assert(detail.outline.length >= 10, 'detail outline is complete');
      assert(detail.sourcePanel.length === 6, 'detail source panel is complete');
    }
    const missing = await computeStoryDetail('not-a-constituency');
    assert(missing === null, 'detail returns null for an unknown constituency');
  } catch (e) {
    console.error('  FAIL: overview/detail tests threw', e);
    failed++;
  }

  console.log('Test 8: Executive Intelligence integration (Mission Control projection)');
  try {
    resetStoryStore();
    const briefing = await computeExecutiveBriefing();
    assert(briefing.storyOS !== undefined, 'Executive briefing carries storyOS');
    assert(briefing.storyOS.totalDrafts === briefing.storyOS.statusCounts.published + briefing.storyOS.statusCounts.archived + briefing.storyOS.statusCounts.idea + briefing.storyOS.statusCounts.planned + briefing.storyOS.statusCounts.researching + briefing.storyOS.statusCounts.verification_required + briefing.storyOS.statusCounts.verification_complete + briefing.storyOS.statusCounts.drafting + briefing.storyOS.statusCounts.editorial_review + briefing.storyOS.statusCounts.ready_for_publication, 'storyOS counts are internally consistent');
    assert(briefing.storyOS.persistence === 'none', 'storyOS declares no persistence');
    assert(briefing.storyOS.note.length > 0, 'storyOS carries an honest note');
    assert(briefing.storyOS.recentActivity.every((a) => a.headline.length > 0), 'recent activity references named stories');

    const editorial = await computeEditorialOverview(403);
    const direct = buildStoryExecutiveSummary({ editorial, evidence: {} as never });
    assert(direct.totalDrafts === 10, 'executive projection covers the top 10 seats');
    assert(direct.statusCounts.idea === 10, 'unseeded projections default to idea');
  } catch (e) {
    console.error('  FAIL: executive integration threw', e);
    failed++;
  }

  console.log('Test 9: Publication package exports');
  try {
    resetStoryStore();
    const editorial = await computeEditorialOverview(403);
    const inv = editorial.ranked[0];
    const toolkit = await getConstituencyToolkit(inv.canonical_constituency_id);
    const verification = await computeVerificationCaseDetail(inv.canonical_constituency_id);
    ensureStorySeed([inv.canonical_constituency_id]);
    const draft = deriveStoryDraft(inv, toolkit, verification, getStoryWorkflow(inv.canonical_constituency_id) ?? null);

    const pkg = exportStoryPackage(draft);
    assert(pkg.format === 'story-package-v1', 'package format is story-package-v1');
    assert(pkg.metadata.id === draft.id, 'package metadata carries the story id');
    assert(pkg.metadata.slug.length > 0, 'package metadata carries a slug');
    assert(pkg.readiness === draft.readiness && pkg.impact === draft.impact, 'package embeds the derived readiness and impact');

    const json = exportStoryJson(draft);
    const parsed = JSON.parse(json);
    assert(parsed.metadata.headline === draft.headline, 'JSON export round-trips the headline');
    assert(parsed.outline.length === draft.outline.length, 'JSON export carries the full outline');

    const md = exportStoryMarkdown(draft);
    assert(md.includes(draft.headline), 'markdown export includes the headline');
    assert(md.includes(draft.brief.executiveSummary), 'markdown export includes the executive summary');

    const printBrief = exportPrintBrief(draft);
    assert(printBrief.includes(draft.constituencyName), 'print brief names the constituency');

    const summary = exportEditorialSummary(draft);
    assert(summary.length > 0, 'editorial summary is non-empty');
  } catch (e) {
    console.error('  FAIL: export tests threw', e);
    failed++;
  }

  console.log('Test 10: RBAC — story-builder requires an editor');
  try {
    assert(canAccessIntelModule(normalizeIntelRole('editor'), 'story-builder'), 'editor can access story-builder');
    assert(canAccessIntelModule(normalizeIntelRole('managing_editor'), 'story-builder'), 'managing editor can access story-builder');
    assert(canAccessIntelModule(normalizeIntelRole('owner'), 'story-builder'), 'owner can access story-builder');
    assert(!canAccessIntelModule(normalizeIntelRole('reporter'), 'story-builder'), 'reporter cannot access story-builder');
    assert(!canAccessIntelModule(normalizeIntelRole('researcher'), 'story-builder'), 'researcher cannot access story-builder');
    assert(!canAccessIntelModule(normalizeIntelRole('fact_checker'), 'story-builder'), 'fact checker cannot access story-builder');
    assert(!canAccessIntelModule(normalizeIntelRole('guest'), 'story-builder'), 'guest cannot access story-builder');
  } catch (e) {
    console.error('  FAIL: RBAC tests threw', e);
    failed++;
  }

  resetStoryStore();

  console.log(`\nStory Builder tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
