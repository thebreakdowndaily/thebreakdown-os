/**
 * THE BREAKDOWN OS — Canonical Domain Invariants Test Suite (Phase 1)
 *
 * Verifies domain invariant validation rules for Claim, Evidence, Observation, and Story.
 */

import {
  validateClaim,
  validateEvidence,
  validateKnowledgeObservation,
  validateStoryInvariants,
} from '../lib/domain/validators';
import { Claim, Evidence, KnowledgeObservation, Story } from '../types/canonical';

function runCanonicalDomainTests() {
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

  console.log('--- RUNNING CANONICAL DOMAIN INVARIANT TESTS ---');

  // Test 1: Valid Claim
  try {
    const validClaim: Partial<Claim> = {
      id: 'claim_101',
      claim: 'India signed Panchsheel Agreement in 1954.',
      source: 'Official Accord Text',
      confidence: 95,
    };
    const res = validateClaim(validClaim);
    assert(res.valid === true && res.errors.length === 0, 'Valid claim passes invariant check');
  } catch (err) {
    console.error('  ✗ FAIL: Valid claim test threw exception', err);
    failed++;
  }

  // Test 2: Invalid Claim Missing ID and Text
  try {
    const invalidClaim: Partial<Claim> = { id: '', claim: '', confidence: 50 };
    const res = validateClaim(invalidClaim);
    assert(res.valid === false && res.errors.length === 3, 'Invalid claim correctly fails invariant check');
  } catch (err) {
    console.error('  ✗ FAIL: Invalid claim test threw exception', err);
    failed++;
  }

  // Test 3: Claim Confidence Out of Bounds
  try {
    const outOfBoundsClaim: Partial<Claim> = { id: 'cl_1', claim: 'Sample', source: 'Source', confidence: 150 };
    const res = validateClaim(outOfBoundsClaim);
    assert(res.valid === false && res.errors.includes('Claim confidence score must be a number between 0 and 100.'), 'Out of bounds confidence score caught');
  } catch (err) {
    console.error('  ✗ FAIL: Confidence out of bounds test threw exception', err);
    failed++;
  }

  // Test 4: Valid Evidence with 8-Tier Hierarchy Classification
  try {
    const validEvidence: Partial<Evidence> = {
      id: 'ev_201',
      claimId: 'claim_101',
      summary: 'Declassified diplomatic archive cables.',
      hierarchyTier: 'tier_1_primary_archival',
      confidenceScore: 98,
    };
    const res = validateEvidence(validEvidence);
    assert(res.valid === true && res.errors.length === 0, 'Valid evidence with Tier 1 Archival classification passes check');
  } catch (err) {
    console.error('  ✗ FAIL: Valid evidence test threw exception', err);
    failed++;
  }

  // Test 5: Invalid Evidence missing claimId and hierarchyTier
  try {
    const invalidEv: Partial<Evidence> = { id: 'ev_202', summary: 'Unanchored summary' };
    const res = validateEvidence(invalidEv);
    assert(res.valid === false && res.errors.length === 3, 'Invalid evidence correctly fails check');
  } catch (err) {
    console.error('  ✗ FAIL: Invalid evidence test threw exception', err);
    failed++;
  }

  // Test 6: Valid KnowledgeObservation
  try {
    const validObs: Partial<KnowledgeObservation> = {
      id: 'obs_301',
      entityId: 'ent_jawaharlal_nehru',
      description: 'Delivered speech at Bandung Conference on April 24, 1955.',
    };
    const res = validateKnowledgeObservation(validObs);
    assert(res.valid === true, 'Valid knowledge observation passes check');
  } catch (err) {
    console.error('  ✗ FAIL: Valid observation test threw exception', err);
    failed++;
  }

  // Test 7: Valid Story Invariants
  try {
    const story: Partial<Story> = {
      id: 'story_foundations_1947',
      title: 'The Foundations of Strategic Autonomy',
      slug: 'foundations-strategic-autonomy',
      summary: 'Detailed examination of foreign policy choices.',
      sources: [{ title: 'Archive Doc', url: 'https://archive.org', accessedAt: '2026-07-27', tier: 1 }],
    };
    const res = validateStoryInvariants(story);
    assert(res.valid === true, 'Valid story with source passes check');
  } catch (err) {
    console.error('  ✗ FAIL: Valid story test threw exception', err);
    failed++;
  }

  // Test 8: Invalid Bare Story without Sources or Claims
  try {
    const bareStory: Partial<Story> = {
      id: 'story_bare',
      title: 'Draft',
      slug: 'draft',
      summary: 'No citations',
      sources: [],
      claims: [],
    };
    const res = validateStoryInvariants(bareStory);
    assert(res.valid === false && res.errors.includes('Story must contain at least 1 verified source or claim.'), 'Bare story without sources/claims fails check');
  } catch (err) {
    console.error('  ✗ FAIL: Bare story test threw exception', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runCanonicalDomainTests();
