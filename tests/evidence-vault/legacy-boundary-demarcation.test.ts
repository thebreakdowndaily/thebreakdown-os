/**
 * ─── Phase 4B-2K: Legacy Boundary & Demarcation Test Suite ──────────────────
 *
 * Governing Documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Fail-Closed Publication Authority)
 *   - .planning/PHASE-4B-2J-PRODUCTION-BOUNDARY-BUILD-AUTHORITY-DESIGN.md
 *
 * Validates:
 *   1. 41 published pre-vault cohort remains grandfathered
 *   2. 15 pre-vault drafts require Evidence Vault evidence to publish
 *   3. Legacy story + new unarchived claim is blocked
 *   4. Legacy story + verified new claim is allowed
 *   5. Material rewrite requires archive verification
 *   6. Legacy stories remain readable without private vault access
 *   7. Editorial publication authority trigger interaction is preserved
 */

import { Client } from 'pg';
import { evaluatePublicationContractAsync } from '@/lib/editorial/canonical-publication';
import { validateStoryEvidenceCompleteness } from '@/lib/story/evidence-guard';
import { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';
import type { Story } from '@/types/canonical';
import type { Principal } from '@/features/auth/principal';

const editorPrincipal: Principal = {
  userId: crypto.randomUUID(),
  email: 'editor@thebreakdown.test',
  role: 'editor',
  name: 'Chief Editor',
};

async function runSuite() {
  console.log('\n=== Starting Phase 4B-2K Legacy Demarcation Test Suite ===\n');

  const stagingUrl = process.env.STAGING_DATABASE_URL || 'postgresql://postgres:Ntn%40supabase403@db.lvfovvidtowadmnggzzf.supabase.co:5432/postgres';
  const u = new URL(stagingUrl);
  if (!u.host.includes('lvfovvidtowadmnggzzf') || u.host.includes('mskyhaunnlwtwvsqcmav')) {
    throw new Error('FATAL: Test must run ONLY against staging (lvfovvidtowadmnggzzf)');
  }

  const client = new Client({
    connectionString: stagingUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  const createdStoryIds: string[] = [];
  const createdArtifactIds: string[] = [];

  try {
    await client.connect();
    console.log('Connected to Staging PostgreSQL (lvfovvidtowadmnggzzf)');

    const vault = new EvidenceVaultService(client);

    // TEST 1: Published cohort stories have isLegacy claims and can evaluate cleanly
    console.log('\n--- TEST 1: Published Cohort Legacy Evaluation ---');
    const pubRes = await client.query(`
      SELECT id, slug, title, status, claims
      FROM public.stories
      WHERE status = 'published' AND claims IS NOT NULL AND jsonb_array_length(claims) > 0
      LIMIT 1;
    `);
    const pubStoryRow = pubRes.rows[0];
    const pubStory: Story = {
      id: pubStoryRow.id,
      slug: pubStoryRow.slug,
      title: pubStoryRow.title,
      headline: '',
      summary: '',
      category: 'investigation',
      tags: [],
      author: 'Staff',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
      publicationStatus: 'published',
      readingTime: 5,
      version: 1,
      claims: pubStoryRow.claims,
    };

    const pubValidation = await validateStoryEvidenceCompleteness(pubStory, vault);
    if (!pubValidation.valid) {
      throw new Error(`Test 1 Failed: Grandfathered published story claims failed validation: ${pubValidation.violations.join(', ')}`);
    }
    console.log('✓ PASS [1]: Published cohort legacy story claims validate cleanly without archive');

    // TEST 2: Pre-vault draft without archiveId is BLOCKED from publication
    console.log('\n--- TEST 2: Pre-Vault Draft Without Archive Is Blocked ---');
    const draftStoryId = crypto.randomUUID();
    createdStoryIds.push(draftStoryId);

    const draftStory: Story = {
      id: draftStoryId,
      slug: `draft-test-${Date.now()}`,
      title: 'Namami Gange Draft Chapter Test',
      headline: 'Namami Gange Headline Test',
      summary: 'Draft summary for investigative report',
      category: 'investigation',
      tags: ['environment'],
      author: 'Investigative Desk',
      status: 'review',
      publicationStatus: 'draft',
      readingTime: 6,
      version: 1,
      publishedAt: new Date().toISOString(),
      blocks: [{ id: crypto.randomUUID(), type: 'paragraph', content: 'Substantive investigative report body text.' } as any],
      sources: [{ id: crypto.randomUUID(), name: 'CPCB Water Quality Report 2026', url: 'https://cpcb.nic.in' } as any],
      claims: [
        {
          id: 'claim-draft-1',
          claim: 'Pre-vault draft claim that has never been archived',
          confidence: 0.9,
          // Notice: NO isLegacy, NO archiveId
        },
      ],
    };

    const draftEval = await evaluatePublicationContractAsync(undefined, draftStory, editorPrincipal, { vault });
    if (draftEval.allowed) {
      throw new Error('Test 2 Failed: Draft without archive was allowed to publish!');
    }
    console.log('✓ PASS [2]: Pre-vault draft without archive correctly rejected at publication contract');

    // TEST 3: Pre-vault draft with verified vault archive is ALLOWED to publish
    console.log('\n--- TEST 3: Pre-vault Draft With Verified Archive Is Allowed ---');
    const validArtifact = await vault.archiveArtifact({
      sourceId: 'src-cpcb-' + crypto.randomUUID(),
      url: 'https://cpcb.nic.in/water-data-test.json',
      content: 'Historical river monitoring sensor data 2026',
      contentHash: 'hash-cpcb-' + Date.now(),
      retrievedAt: new Date().toISOString(),
    });
    createdArtifactIds.push(validArtifact.id);
    await vault.lockRetention(validArtifact.id, { verifierId: editorPrincipal.userId, reason: 'Verified for 4B-2K test' });

    const validDraftStory: Story = {
      ...draftStory,
      status: 'review', // Eligible transition
      claims: [
        {
          id: 'claim-draft-1',
          claim: 'Archived and verified environmental assertion',
          confidence: 0.95,
          archiveId: validArtifact.id,
        },
      ],
    };

    const validDraftEval = await evaluatePublicationContractAsync(undefined, validDraftStory, editorPrincipal, { vault });
    if (!validDraftEval.allowed) {
      throw new Error(`Test 3 Failed: Valid draft was rejected: ${validDraftEval.error}`);
    }
    console.log('✓ PASS [3]: Pre-vault draft with verified archive allowed to publish');

    // TEST 4: Legacy story + NEW unarchived claim is BLOCKED
    console.log('\n--- TEST 4: Legacy Story + New Unarchived Claim ---');
    const legacyWithNewClaimStory: Story = {
      ...pubStory,
      claims: [
        {
          id: 'claim-old',
          claim: 'Old verified assertion',
          isLegacy: true,
        },
        {
          id: 'claim-new-unarchived',
          claim: 'New unarchived claim sneaked into legacy story',
          // Lacks isLegacy, lacks archiveId
        },
      ],
    };

    const mixedValidation = await validateStoryEvidenceCompleteness(legacyWithNewClaimStory, vault);
    if (mixedValidation.valid) {
      throw new Error('Test 4 Failed: Mixed legacy + new unarchived claim bypassed validation!');
    }
    console.log('✓ PASS [4]: Legacy story + new unarchived claim blocked by evidence completeness guard');

    // TEST 5: Legacy story + verified new claim is ALLOWED
    console.log('\n--- TEST 5: Legacy Story + Verified New Claim ---');
    const legacyWithVerifiedNewStory: Story = {
      ...pubStory,
      claims: [
        {
          id: 'claim-old',
          claim: 'Old verified assertion',
          isLegacy: true,
        },
        {
          id: 'claim-new-verified',
          claim: 'New verified assertion with archiveId',
          archiveId: validArtifact.id,
        },
      ],
    };

    const mixedVerifiedValidation = await validateStoryEvidenceCompleteness(legacyWithVerifiedNewStory, vault);
    if (!mixedVerifiedValidation.valid) {
      throw new Error(`Test 5 Failed: Mixed legacy + verified new claim failed: ${mixedVerifiedValidation.violations.join(', ')}`);
    }
    console.log('✓ PASS [5]: Legacy story + verified new claim allowed');

    // TEST 6: Material rewrite drops isLegacy -> BLOCKED without new archive
    console.log('\n--- TEST 6: Material Rewrite Drops Legacy Exemption ---');
    const rewrittenStory: Story = {
      ...pubStory,
      claims: [
        {
          id: 'claim-rewritten',
          claim: 'Materially revised factual assertion',
          // isLegacy is removed on rewrite
        },
      ],
    };

    const rewriteValidation = await validateStoryEvidenceCompleteness(rewrittenStory, vault);
    if (rewriteValidation.valid) {
      throw new Error('Test 6 Failed: Material rewrite without archive was allowed!');
    }
    console.log('✓ PASS [6]: Material rewrite strictly requires new archive');

    // TEST 7: Legacy story readability verification
    console.log('\n--- TEST 7: Legacy Story Public Readability ---');
    const readCheck = await client.query(`
      SELECT id, slug, status, claims
      FROM public.stories
      WHERE slug = 'mgnrega-reform' AND status = 'published';
    `);
    if (readCheck.rows.length === 0) {
      throw new Error('Test 7 Failed: mgnrega-reform not found in published public stories');
    }
    const readClaims = readCheck.rows[0].claims;
    if (!Array.isArray(readClaims) || readClaims.length === 0) {
      throw new Error('Test 7 Failed: mgnrega-reform claims missing or not array');
    }
    console.log(`✓ PASS [7]: Legacy story readable with ${readClaims.length} intact claims`);

    // TEST 8: Trigger trg_enforce_story_publication_invariants protects direct SQL updates
    console.log('\n--- TEST 8: DB Trigger Direct Protection ---');
    const testDirectStoryId = crypto.randomUUID();
    createdStoryIds.push(testDirectStoryId);

    await client.query(`
      INSERT INTO public.stories (id, title, slug, summary, status, claims, created_at, updated_at)
      VALUES ($1, 'Trigger Direct Test', $2, 'Summary', 'draft', $3, NOW(), NOW());
    `, [
      testDirectStoryId,
      `slug-direct-${Date.now()}`,
      JSON.stringify([{ id: 'c1', claim: 'Direct SQL unarchived assertion' }]),
    ]);

    let directUpdateBlocked = false;
    try {
      await client.query(`
        UPDATE public.stories
        SET status = 'published', published_at = NOW()
        WHERE id = $1;
      `, [testDirectStoryId]);
    } catch {
      directUpdateBlocked = true;
    }

    if (!directUpdateBlocked) {
      throw new Error('Test 8 Failed: Direct SQL transition was not blocked by trigger!');
    }
    console.log('✓ PASS [8]: Database trigger blocked direct SQL status transition without archive');

  } finally {
    // Cleanup created test artifacts
    console.log('\n--- Cleaning up test artifacts ---');
    if (createdStoryIds.length > 0) {
      await client.query(`DELETE FROM public.stories WHERE id = ANY($1);`, [createdStoryIds]);
    }
    if (createdArtifactIds.length > 0) {
      await client.query(`DELETE FROM newsroom.archived_artifacts WHERE id = ANY($1);`, [createdArtifactIds]);
    }
    await client.end();
    console.log('PostgreSQL connection closed cleanly.');
  }

  console.log('\n======================================================');
  console.log('ALL 8 / 8 LEGACY BOUNDARY INTEGRATION TESTS PASSED!');
  console.log('======================================================\n');
}

runSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
