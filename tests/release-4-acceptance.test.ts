/**
 * THE BREAKDOWN OS — RELEASE-4 Acceptance Tests (Module 15)
 *
 * End-to-end verification of the Editorial Operating System (EOS):
 *   1. Canonical dataset integrity — the frozen UP403 dataset is never mutated.
 *   2. Data-locality doctrine — EOS server pages consume services directly;
 *      no EOS module imports API routes; no dataset writes.
 *   3. E2E newsroom workflow — story from discovery opportunity through
 *      research → writing → fact_check → editor approval → editorial_review
 *      → published → correction, with the publication gate enforced.
 *   4. Packet provenance integrity — every story packet fact/section carries
 *      canonical provenance from lib/up403/provenance.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import {
  ensureEosSeed,
  getEosStories,
  getEosStory,
  getEosDossiers,
  getEosActivities,
  getEosOpportunities,
  getEosCollections,
  getEosMetrics,
  getEosGovernanceGap,
  eosTransition,
  eosVerifyStory,
  eosReviewClaim,
  eosIssueCorrection,
  eosCreateStoryFromOpportunity,
  getEosBlockers,
} from '../lib/editorial/eos/eos-store';
import { loadData } from '../lib/up403/loader';

const DATASET_PATH = path.join(
  process.cwd(),
  'data',
  'master-dataset-v1',
  'v1.1.0',
  'up403-master-dataset-v1.json'
);

async function fileHash(filePath: string): Promise<string> {
  const raw = await fs.readFile(filePath, 'utf-8');
  return createHash('sha256').update(raw).digest('hex');
}

async function runRelease4AcceptanceTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  console.log('--- RUNNING RELEASE-4 ACCEPTANCE TESTS (MODULE 15) ---');

  // ── Phase 0: frozen dataset integrity (baseline hash) ─────────────────────
  let baselineHash = '';
  try {
    baselineHash = await fileHash(DATASET_PATH);
    assert(baselineHash.length === 64, 'Dataset file readable; baseline hash captured');
  } catch (err) {
    console.error('  ✗ FAIL: cannot read frozen dataset', err);
    failed++;
    baselineHash = '';
  }

  // ── Phase 1: data-locality & no-API-route doctrine (structural) ───────────
  try {
    const eosDir = path.join(process.cwd(), 'lib', 'editorial', 'eos');
    const editorDir = path.join(process.cwd(), 'app', 'editor');
    const eosFiles = (await fs.readdir(eosDir)).map(f => path.join(eosDir, f));
    const routeEntries = (await fs.readdir(editorDir, { recursive: true })).map(f => path.join(editorDir, f as string));
    const files = [...eosFiles, ...routeEntries];
    let apiImports = 0;
    for (const file of files) {
      const stat = await fs.stat(file);
      if (!stat.isFile()) continue;
      const content = await fs.readFile(file, 'utf-8');
      if (/app\/api/.test(content) && /from\s+['"]/.test(content)) {
        apiImports++;
      }
    }
    assert(apiImports === 0, 'No EOS module or /editor route imports an API route (data-locality)');
  } catch (err) {
    console.error('  ✗ FAIL: data-locality scan threw exception', err);
    failed++;
  }

  // ── Phase 2: E2E newsroom workflow ─────────────────────────────────────────
  try {
    await ensureEosSeed();
    const records = await loadData();
    assert(records.length === 403, `Canonical dataset holds 403 seats (got ${records.length})`);

    const opps = getEosOpportunities();
    assert(opps.length > 0, `Discovery report surfaced ${opps.length} opportunities`);
    const opp = opps.find(o => o.category === 'electoral') ?? opps[0];
    assert(opp !== undefined, 'An opportunity is available to drive the E2E flow');
    if (!opp) throw new Error('No discovery opportunity available');

    const created = await eosCreateStoryFromOpportunity(opp.id, ['reporter-tara', 'editor-anita'], ['test-e2e']);
    assert(created !== undefined, 'Story created from discovery opportunity');
    if (!created) throw new Error('Story creation failed');

    assert(created.stage === 'assigned', 'Story starts at assigned stage');
    assert(created.dossierId !== undefined, 'Story links to a research dossier');
    assert(created.packet !== undefined && created.packet.facts.length >= 14, 'Story packet assembled with 14+ facts');
    assert(
      created.packet !== undefined && created.packet.sections.every(s => s.canonicalFields.length > 0),
      'Every packet section declares its canonical fields'
    );
    assert(
      created.packet !== undefined && created.packet.facts.every(f => f.provenance.source.length > 0),
      'Every packet fact carries provenance'
    );

    // Publication gate is closed at assignment (claims unresolved).
    const earlyBlockers = getEosBlockers(created);
    assert(earlyBlockers.length > 0, 'Publication gate blocked at assignment (claims unresolved)');
    const earlyPublish = eosTransition(created.id, 'editorial_review', 'editor-anita');
    assert(earlyPublish.success === false, 'Direct assigned → editorial_review is blocked by the gate');

    // research → writing → fact_check
    assert(eosTransition(created.id, 'research', 'reporter-tara').success === true, 'assigned → research');
    assert(eosTransition(created.id, 'writing', 'reporter-tara').success === true, 'research → writing');
    assert(eosTransition(created.id, 'fact_check', 'reporter-tara').success === true, 'writing → fact_check');

    // fact check: 8 of 9 claims verify; development coverage claim cannot.
    const report = eosVerifyStory(created.id, 'checker-sameer');
    assert(report !== undefined, 'Fact check report generated');
    const after = getEosStory(created.id);
    if (!after) throw new Error('Story missing after fact check');
    const verifiedCount = after.claims.filter(c => c.status === 'Verified').length;
    assert(verifiedCount === 8, `8 claims verified deterministically (got ${verifiedCount})`);
    const devClaim = after.claims.find(c => c.canonicalField === 'development_coverage_status');
    assert(devClaim !== undefined && devClaim.status === 'Needs Verification', 'Development-coverage claim flagged Needs Verification (dataset gap)');
    assert(devClaim !== undefined && devClaim.blocking === true, 'Development-coverage claim blocks publication');

    // gate still closed after fact check
    const blockedReview = eosTransition(created.id, 'editorial_review', 'editor-anita');
    assert(blockedReview.success === false, 'editorial_review still blocked while a claim is unresolved');

    // editor approves the unresolved claim (Partially Verified, with note)
    if (devClaim) {
      const afterApproval = eosReviewClaim(created.id, devClaim.id, 'Partially Verified', 'editor-anita', 'ECI gazette reconciled; treated as verified per editorial judgement.');
      assert(afterApproval !== undefined, 'Editor approval recorded');
      const approved = getEosStory(created.id);
      const reapproved = approved?.claims.find(c => c.id === devClaim.id);
      assert(reapproved !== undefined && reapproved.blocking === false, 'Approved claim no longer blocks');
      assert(reapproved !== undefined && reapproved.checkedBy === 'editor-anita', 'Approval audit trail records reviewer');
    }

    // gate opens → editorial_review → published
    assert(eosTransition(created.id, 'editorial_review', 'editor-anita').success === true, 'fact_check → editorial_review after gate opens');
    assert(eosTransition(created.id, 'published', 'editor-anita').success === true, 'editorial_review → published');
    const publishedStory = getEosStory(created.id);
    assert(publishedStory !== undefined && publishedStory.stage === 'published' && publishedStory.publishedAt !== undefined, 'Story published with timestamp');
    if (!publishedStory) throw new Error('Story missing after publication');
    assert(getEosBlockers(publishedStory).length === 0, 'Published story has zero blockers');

    const knowledge = getEosMetrics();
    assert(knowledge.totalStories > 0, 'Metrics computed after publication');

    // correction bumps version and is logged
    const corrected = eosIssueCorrection(
      created.id,
      'Amended the vote-share percentage following ECI gazette reconciliation.',
      'Verification Bureau reconciliation',
      'checker-sameer'
    );
    assert(corrected !== undefined && corrected.version === 2, 'Correction bumps version to 2');
    assert(corrected !== undefined && corrected.corrections.length === 1, 'Correction logged on the story');
    const activities = getEosActivities().filter(a => a.storyId === created.id);
    assert(
      activities.some(a => a.type === 'correction' && a.body.includes('Verification Bureau')),
      'Correction captured in the collaboration timeline'
    );

    // published → archived is allowed without re-running the gate
    assert(eosTransition(created.id, 'archived', 'editor-anita').success === true, 'published → archived allowed (archive is not publication)');

    // ── Phase 3: dataset immutability (post-run hash) ────────────────────────
    const afterHash = await fileHash(DATASET_PATH);
    assert(afterHash === baselineHash, 'Frozen UP403 dataset byte-identical after full E2E workflow');

    // ── Phase 4: seeded store sanity ─────────────────────────────────────────
    assert(getEosStories().length >= 4, 'Seeded store holds 4+ stories across stages');
    assert(getEosDossiers().length >= 4, 'Seeded store holds 4+ research dossiers');
    assert(getEosCollections().length === 10, 'Seeded store holds 10 rule-based collections');
    assert(getEosGovernanceGap() === true, 'Governance data-gap surfaced honestly (no auto-governance stories)');
    const realigned = getEosStories().filter(s => s.discoverySignal === 'party-realignment');
    assert(realigned.length > 0, 'Party-realignment signal represented in seeded stories');
    const published = getEosStories().filter(s => s.stage === 'published');
    assert(published.length >= 1, 'At least one seeded story is published');
  } catch (err) {
    console.error('  ✗ FAIL: E2E workflow threw exception', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runRelease4AcceptanceTests();
