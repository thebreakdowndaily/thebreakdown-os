/**
 * ─── Deterministic Evidence Guard & Publication Gate Fail-Closed Test Suite ───
 *
 * Verifies that the publication gate and evidence guard operate strictly fail-closed:
 * 1. Missing vault with non-legacy claim having syntactically valid archiveId -> fails closed.
 * 2. Vault initialization failure (vaultInitError) -> fails closed with auditable error message.
 * 3. evaluatePublicationContractAsync with unconfigured/missing vault -> returns HTTP 422 with Gate 13 failed.
 * 4. validateStoryForPublicationAsync with vaultInitError -> fails Gate 13 with init error in details.
 * 5. Unknown archive ID (mock returns null) -> fails closed with artifact not found.
 * 6. Staged/unverified retention state -> fails closed (must be 'verified').
 * 7. Missing or empty preserved bytes (byteLength <= 0 or preservationState: 'missing') -> fails closed.
 * 8. Cryptographic integrity failure -> fails closed.
 * 9. Vault query exception / database disconnected -> fails closed defensively.
 * 10. Valid verified & intact claim -> passes with 0 violations.
 * 11. Grandfathered legacy claim (isLegacy: true) -> passes without vault (preserves legacy boundary).
 * 12. Direct saveStory(status: 'published') without token -> throws DirectPublicationForbiddenError.
 *
 * All tests run deterministically with in-memory mocks without touching staging or production databases.
 */

import type { Story, Claim } from '../../types/canonical';
import type { Principal } from '../../features/auth/principal';
import {
  validateStoryEvidenceCompleteness,
  DirectPublicationForbiddenError,
} from '../../lib/story/evidence-guard';
import { validateStoryForPublicationAsync } from '../../lib/editorial/publication-gate';
import { evaluatePublicationContractAsync } from '../../lib/editorial/canonical-publication';
import { MemoryStoryService } from '../../services/repositories/memory/story';
import { issuePublicationToken } from '../../lib/editorial/publication-token';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

const editorPrincipal: Principal = {
  userId: '00000000-0000-0000-0000-000000000001',
  email: 'editor@thebreakdown.in',
  name: 'Senior Editor',
  role: 'editor',
  isSuperAdmin: false,
  status: 'active',
  organizationId: null,
};

function makeTestStory(
  claims: Claim[],
  status: 'draft' | 'review' | 'scheduled' | 'published' = 'review'
): Story {
  return {
    id: 'story-fail-closed-unit-01',
    slug: 'story-fail-closed-unit-test',
    title: 'Deterministic Test Story on AI Literacy',
    summary: 'A deterministic test summary that meets minimal publication gate standards.',
    status,
    publicationStatus: status,
    publishedAt: new Date().toISOString(),
    author: 'Test Author',
    blocks: [
      {
        id: 'block-01',
        type: 'paragraph',
        content: 'Content block for fail-closed verification.',
      } as any,
    ],
    sources: [
      {
        id: 'src-01',
        title: 'Central Square Foundation BaSE 2025',
        url: 'https://thebreakdown.in/sources/csf-base-2025',
        verificationStatus: 'verified',
      } as any,
    ],
    claims,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function runDeterministicFailClosedSuite() {
  console.log('\n=== Starting Deterministic Evidence Guard Fail-Closed Test Suite ===\n');

  const validUUID = 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d';
  const nonLegacyClaim: Claim = {
    id: 'claim-non-legacy-01',
    claim: '50% of EdTech-using children had heard of GenAI.',
    archiveId: validUUID,
    quote: 'BaSE Report finding',
    sources: ['src-01'],
    isLegacy: false,
  };

  // ── Scenario 1: Missing vault with non-legacy claim having syntactically valid archiveId
  console.log('--- Test 1: Missing vault with non-legacy claim having valid archiveId ---');
  const story1 = makeTestStory([nonLegacyClaim]);
  const res1 = await validateStoryEvidenceCompleteness(story1, undefined);
  assert(!res1.valid, 'Missing vault fails closed for non-legacy claim');
  assert(
    res1.violations.some((v) =>
      v.includes('Evidence Vault service unavailable: Cannot verify archive identity')
    ),
    'Auditable violation logged specifying vault unavailable'
  );

  // ── Scenario 2: Vault initialization failure option forwarded
  console.log('\n--- Test 2: Vault initialization failure option forwarded ---');
  const res2 = await validateStoryEvidenceCompleteness(story1, undefined, {
    vaultInitError: 'Database connection refused on port 5432',
  });
  assert(!res2.valid, 'Vault initialization failure fails closed');
  assert(
    res2.violations.some((v) =>
      v.includes(
        'Evidence Vault initialization failed (Database connection refused on port 5432): Cannot verify archive identity'
      )
    ),
    'Auditable violation captures initialization error details'
  );

  // ── Scenario 3: evaluatePublicationContractAsync with unconfigured vault
  console.log('\n--- Test 3: evaluatePublicationContractAsync with unconfigured vault ---');
  const origStaging = process.env.STAGING_DATABASE_URL;
  const origDb = process.env.DATABASE_URL;
  try {
    delete process.env.STAGING_DATABASE_URL;
    delete process.env.DATABASE_URL;

    const dec3 = await evaluatePublicationContractAsync(undefined, story1, editorPrincipal);
    assert(!dec3.allowed, 'Canonical publication denied when vault database unconfigured');
    assert(dec3.httpStatus === 422, 'Returns HTTP 422 Unprocessable Entity');
    const gate13Check = dec3.gateResult?.checks.find((c) => c.name === 'evidence_preservation_vault');
    assert(gate13Check !== undefined && !gate13Check.passed, 'Gate 13 (evidence_preservation_vault) failed');
  } finally {
    if (origStaging !== undefined) process.env.STAGING_DATABASE_URL = origStaging;
    if (origDb !== undefined) process.env.DATABASE_URL = origDb;
  }

  // ── Scenario 4: validateStoryForPublicationAsync with vaultInitError
  console.log('\n--- Test 4: validateStoryForPublicationAsync with vaultInitError ---');
  const gateRes4 = await validateStoryForPublicationAsync(
    { storyId: story1.id, scheduleId: 'sched-1', triggeredBy: 'manual' },
    story1,
    undefined,
    new Date(),
    { vaultInitError: 'Mock connection failed' }
  );
  assert(!gateRes4.passed, 'validateStoryForPublicationAsync fails when vaultInitError is provided');
  const gateCheck4 = gateRes4.checks.find((c) => c.name === 'evidence_preservation_vault');
  assert(gateCheck4 !== undefined && !gateCheck4.passed, 'Gate 13 check failed');
  assert(
    gateCheck4?.details?.includes('Evidence Vault initialization failed (Mock connection failed)'),
    'Gate 13 details contains initialization error string'
  );

  // ── Scenario 5: Unknown archive ID (mock returns null)
  console.log('\n--- Test 5: Unknown archive ID (vault returns null) ---');
  const mockVaultNotFound: any = {
    getArtifactMetadata: async () => null,
    verifyCryptographicIntegrity: async () => true,
  };
  const res5 = await validateStoryEvidenceCompleteness(story1, mockVaultNotFound);
  assert(!res5.valid, 'Unknown archive ID fails closed');
  assert(
    res5.violations.some((v) => v.includes('not found in Evidence Vault')),
    'Violation specifies artifact not found in Evidence Vault'
  );

  // ── Scenario 6: Staged / unverified retention state
  console.log('\n--- Test 6: Staged retention state ---');
  const mockVaultStaged: any = {
    getArtifactMetadata: async (id: string) => ({
      id,
      byteLength: 2048,
      preservationState: 'preserved',
      retentionState: 'staged',
    }),
    verifyCryptographicIntegrity: async () => true,
  };
  const res6 = await validateStoryEvidenceCompleteness(story1, mockVaultStaged);
  assert(!res6.valid, 'Staged retention state fails closed');
  assert(
    res6.violations.some((v) => v.includes("is in 'staged' state (must be 'verified')")),
    'Violation specifies retention state must be verified'
  );

  // ── Scenario 7: Missing or zero preserved byte length
  console.log('\n--- Test 7: Missing or zero byte length ---');
  const mockVaultZeroBytes: any = {
    getArtifactMetadata: async (id: string) => ({
      id,
      byteLength: 0,
      preservationState: 'preserved',
      retentionState: 'verified',
    }),
    verifyCryptographicIntegrity: async () => true,
  };
  const res7a = await validateStoryEvidenceCompleteness(story1, mockVaultZeroBytes);
  assert(!res7a.valid, 'Zero byte length fails closed');
  assert(
    res7a.violations.some((v) => v.includes('has missing or empty preserved bytes')),
    'Violation specifies missing or empty preserved bytes for 0 byte length'
  );

  const mockVaultMissingPreservation: any = {
    getArtifactMetadata: async (id: string) => ({
      id,
      byteLength: 1024,
      preservationState: 'missing',
      retentionState: 'verified',
    }),
    verifyCryptographicIntegrity: async () => true,
  };
  const res7b = await validateStoryEvidenceCompleteness(story1, mockVaultMissingPreservation);
  assert(!res7b.valid, 'Missing preservation state fails closed');
  assert(
    res7b.violations.some((v) => v.includes('has missing or empty preserved bytes')),
    'Violation specifies missing or empty preserved bytes for preservationState missing'
  );

  // ── Scenario 8: Cryptographic integrity failure
  console.log('\n--- Test 8: Cryptographic byte verification failure ---');
  const mockVaultTampered: any = {
    getArtifactMetadata: async (id: string) => ({
      id,
      byteLength: 2048,
      preservationState: 'preserved',
      retentionState: 'verified',
    }),
    verifyCryptographicIntegrity: async () => false,
  };
  const res8 = await validateStoryEvidenceCompleteness(story1, mockVaultTampered);
  assert(!res8.valid, 'Integrity failure fails closed');
  assert(
    res8.violations.some((v) => v.includes('failed cryptographic integrity verification')),
    'Violation specifies cryptographic integrity verification failure'
  );

  // ── Scenario 9: Vault query throws exception (defensive error handling)
  console.log('\n--- Test 9: Vault query throws exception ---');
  const mockVaultThrows: any = {
    getArtifactMetadata: async () => {
      throw new Error('Database pool connection timeout');
    },
    verifyCryptographicIntegrity: async () => true,
  };
  const res9 = await validateStoryEvidenceCompleteness(story1, mockVaultThrows);
  assert(!res9.valid, 'Vault exception fails closed defensively without throwing unhandled error');
  assert(
    res9.violations.some(
      (v) =>
        v.includes('Evidence Vault verification failed for claim') &&
        v.includes('Database pool connection timeout')
    ),
    'Violation captures internal query failure safely'
  );

  // ── Scenario 10: Valid verified & intact claim
  console.log('\n--- Test 10: Valid verified & intact claim ---');
  const mockVaultValid: any = {
    getArtifactMetadata: async (id: string) => ({
      id,
      byteLength: 2048,
      preservationState: 'preserved',
      retentionState: 'verified',
    }),
    verifyCryptographicIntegrity: async () => true,
  };
  const res10 = await validateStoryEvidenceCompleteness(story1, mockVaultValid);
  assert(res10.valid, 'Valid verified & intact claim passes evidence guard');
  assert(res10.violations.length === 0, 'Zero violations for fully verified and intact claim');

  // ── Scenario 11: Grandfathered legacy claim (isLegacy: true)
  console.log('\n--- Test 11: Grandfathered legacy claim without vault ---');
  const legacyClaim: Claim = {
    id: 'claim-legacy-01',
    claim: 'Historical baseline claim grandfathered under legacy policy.',
    sources: ['src-01'],
    isLegacy: true,
  };
  const storyLegacy = makeTestStory([legacyClaim]);
  const res11 = await validateStoryEvidenceCompleteness(storyLegacy, undefined);
  assert(res11.valid, 'Legacy claim passes without vault service (preserves legacy boundary)');
  assert(res11.violations.length === 0, 'Zero violations for grandfathered legacy claim');

  // ── Scenario 12: Direct saveStory(status: 'published') without token
  console.log('\n--- Test 12: Direct saveStory without publication token ---');
  const memService = new MemoryStoryService();
  const directPublishStory = makeTestStory([nonLegacyClaim], 'published');

  let directSaveBlocked = false;
  try {
    await memService.saveStory(directPublishStory);
  } catch (err: any) {
    if (err instanceof DirectPublicationForbiddenError || err.name === 'DirectPublicationForbiddenError') {
      directSaveBlocked = true;
    }
  }
  assert(directSaveBlocked, 'Direct saveStory(status="published") throws DirectPublicationForbiddenError');

  // And with valid publication token, save succeeds
  const validToken = issuePublicationToken(directPublishStory.id);
  await memService.saveStory(directPublishStory, { publicationToken: validToken });
  const savedStory = await memService.getStory(directPublishStory.id);
  assert(savedStory?.id === directPublishStory.id, 'saveStory with valid publication token succeeds');

  // ── Summary
  console.log(`\n======================================================`);
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runDeterministicFailClosedSuite().catch((err) => {
  console.error('Fatal error executing fail-closed test suite:', err);
  process.exit(1);
});
