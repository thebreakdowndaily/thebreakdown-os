/**
 * THE BREAKDOWN OS — End-to-End Full Platform Workflow Integration Test
 *
 * Verifies complete journey across subsystem boundaries:
 * 1. Research Subsystem (Session, Provenance SHA-256, Candidate Claim Promotion)
 * 2. Domain Subsystem (Invariant Validation)
 * 3. Editorial Subsystem (Workflow State Machine & Gold Standard Pass)
 * 4. Projection Subsystem (StoryViewModel Transformer)
 * 5. Reader Product Subsystem (Evidence Drawer Output)
 */

import {
  createResearchSession,
  addCandidateClaim,
  promoteCandidateClaimToCanonical,
} from '../lib/research/session';

import { registerDocumentProvenance, attachDependentClaim } from '../lib/research/provenance';
import { queryResearchGraph } from '../lib/research/graph-exploration';
import { validateClaim, validateEvidence } from '../lib/domain/validators';
import {
  canTransition,
  transitionEditorialState,
  EditorialStateRecord,
} from '../lib/editorial/workflow-state-machine';
import {
  createDefaultGoldStandardAudit,
  evaluateGoldStandardPass,
} from '../lib/editorial/gold-standard-review';
import { transformStoryToViewModel } from '../lib/projections/story/transformStory';
import type { Story, Source } from '../types/canonical';

function runE2EWorkflowTests() {
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

  console.log('--- RUNNING END-TO-END SUBSYSTEM WORKFLOW INTEGRATION TEST ---');

  try {
    // 1. Research Subsystem: Create Session & Candidate Claim
    let session = createResearchSession('sess_101', 'researcher_rahul', 'strategic-autonomy', 'Panchsheel Archival Analysis');
    session = addCandidateClaim(
      session,
      'Panchsheel Agreement five principles were formally articulated in April 1954.',
      'Treaty Text in Volume 299 United Nations Treaty Series.',
      'https://treaties.un.org'
    );
    assert(session.candidateClaims.length === 1, 'Step 1: Research session holds candidate claim');

    // 2. Provenance Engine: Ingest Document & Generate SHA-256 Hash
    const sourceContent = 'UNTS Volume 299 Treaty Text Panchsheel 1954';
    let provRecord = registerDocumentProvenance(
      'doc_panchsheel_1954',
      'https://treaties.un.org',
      sourceContent,
      'researcher_rahul',
      'UNTS-V299-1954'
    );
    assert(provRecord.sha256Hash.startsWith('sha256:'), 'Step 2: Provenance record assigned SHA-256 hash');

    // 3. Promote Candidate Claim to Canonical Domain Model
    const primarySource: Source = {
      id: 'src_panchsheel_1954',
      title: 'UNTS Volume 299 Panchsheel Accord',
      url: 'https://treaties.un.org',
      accessedAt: '2026-07-27',
      tier: 1,
      archiveHash: provRecord.sha256Hash,
    };

    const { canonicalClaim, canonicalEvidence } = promoteCandidateClaimToCanonical(
      session.candidateClaims[0],
      primarySource,
      'researcher_rahul'
    );
    provRecord = attachDependentClaim(provRecord, canonicalClaim.id);

    assert(canonicalClaim.status === 'verified', 'Step 3a: Promoted claim status is verified');
    assert(provRecord.dependentClaimIds.includes(canonicalClaim.id), 'Step 3b: Provenance ledger updated with dependent claim');

    // 4. Domain Invariant Validation
    const claimVal = validateClaim(canonicalClaim);
    const evVal = validateEvidence(canonicalEvidence);
    assert(claimVal.valid && evVal.valid, 'Step 4: Promoted canonical claim & evidence pass domain invariants');

    // 5. Editorial Subsystem: Workflow State Machine Transitions
    let editorialState: EditorialStateRecord = {
      storyId: 'story_foundations_1947',
      currentStage: 'draft',
      ownerId: 'editor_sarah',
      auditTrail: [],
      blockingIssues: [],
      updatedAt: '2026-07-27',
    };

    let res = transitionEditorialState(editorialState, 'research_complete', 'editor_sarah', 'editor');
    editorialState = res.record;
    res = transitionEditorialState(editorialState, 'evidence_verified', 'editor_sarah', 'editor');
    editorialState = res.record;
    res = transitionEditorialState(editorialState, 'gold_standard_review', 'editor_sarah', 'editor');
    editorialState = res.record;

    // 6. Gold Standard Review Audit Pass
    const audit = createDefaultGoldStandardAudit('story_foundations_1947');
    audit.phases.phase1ExpertReview.passed = true;
    audit.phases.phase2ReaderReview.passed = true;
    audit.phases.phase3EvidenceAudit.passed = true;
    audit.phases.phase4BiasAudit.passed = true;
    audit.phases.phase5VisualAudit.passed = true;
    audit.phases.phase6KnowledgeDensityAudit.passed = true;
    audit.phases.phase7DefensibilityAudit.passed = true;

    assert(evaluateGoldStandardPass(audit) === true, 'Step 5a: Gold Standard 7-Phase audit passes');

    res = transitionEditorialState(editorialState, 'approved', 'editor_sarah', 'editor');
    editorialState = res.record;
    assert(editorialState.currentStage === 'approved', 'Step 5b: Story approved for publication');

    // 7. Projection Engine & Reader Product Verification
    const storyModel: Story = {
      id: 'story_foundations_1947',
      title: 'Foundations of Indian Strategic Autonomy',
      slug: 'foundations-strategic-autonomy',
      headline: 'Historical analysis of Indian non-alignment',
      summary: 'Detailed examination of 1947-1962 choices.',
      heroImage: '/images/hero.jpg',
      author: 'Editorial Bureau',
      category: 'Foreign Policy',
      status: 'published',
      storyType: 'analysis',
      evidenceScore: 98,
      readingTime: 9,
      publishedAt: '2026-07-27',
      createdAt: '2026-07-01',
      updatedAt: '2026-07-27',
      tags: ['foreign-policy'],
      blocks: [],
      sources: [primarySource],
      claims: [canonicalClaim],
      timeline: [],
      faq: [],
      charts: [],
      relatedStoryIds: [],
      relatedEntityIds: [],
      relatedTopicIds: [],
    };

    const storyVM = transformStoryToViewModel(storyModel);
    assert(storyVM.evidenceDrawer.verifiedClaimsCount === 1, 'Step 6a: Reader StoryViewModel includes promoted verified claim');
    assert(storyVM.evidenceDrawer.sources[0].archiveHash === provRecord.sha256Hash, 'Step 6b: Reader StoryViewModel preserves cryptographic provenance hash');

    // 8. Research Graph Exploration Query Test
    const graphRes = queryResearchGraph('Panchsheel', [canonicalClaim], [primarySource], [provRecord]);
    assert(graphRes.totalNodeDegree === 3, 'Step 7: Research Graph query maps connected nodes across claims, sources, and provenance');
  } catch (err) {
    console.error('  ✗ FAIL: End-to-End workflow test threw exception', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runE2EWorkflowTests();
