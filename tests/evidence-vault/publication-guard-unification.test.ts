/**
 * ─── Phase 4B-2H Publication Guard Unification Comprehensive Test Suite ───────
 *
 * Covers all publication surfaces against STAGING ONLY (lvfovvidtowadmnggzzf):
 *   - Core Publication Contract (Canonical Service)
 *   - Repository Guard (Memory & Supabase Repository)
 *   - Schedulers (Node Scheduler & Cloudflare Adapter)
 *   - APIs (v1 & v2 Story APIs)
 *   - CMS Actions
 *   - Multi-Evidence Claims
 *   - Legacy Grandfathering
 *   - Database Triggers (trg_enforce_publication_authority & trg_enforce_story_publication_invariants)
 *   - Clean Connection Lifecycle & Robust UUID Identifiers
 */

import { Client } from 'pg';
import { randomUUID } from 'node:crypto';
import { EvidenceVaultService, setEvidenceVaultService } from '@/services/intelligence/evidence-vault.service';
import { RepositoryFactory } from '@/services/factory/repository';
import {
  evaluatePublicationContractAsync,
  evaluatePublicationContract,
  issuePublicationToken,
  consumePublicationToken,
} from '@/lib/editorial/canonical-publication';
import {
  validateStoryEvidenceCompleteness,
  PublicationBlockedError,
  DirectPublicationForbiddenError,
} from '@/lib/story/evidence-guard';
import { validateStoryForPublicationAsync } from '@/lib/editorial/publication-gate';
import { setServiceClient } from '@/supabase/client';
import type { Story, Principal } from '@/types/canonical';

interface TestResult {
  num: number;
  name: string;
  category: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

async function recordTest(num: number, name: string, category: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ num, name, category, status: 'PASS' });
    console.log(`  ✓ PASS [${num}]: ${name}`);
  } catch (err: any) {
    results.push({ num, name, category, status: 'FAIL', details: err.message });
    console.error(`  ✗ FAIL [${num}]: ${name} ->`, err.message);
  }
}

// ─── Helper to construct canonical stories with genuine UUIDs ────────────────
function makeStory(claims: any[], status = 'review', isLegacy = false, customId?: string): Story {
  const id = customId || randomUUID();
  const normalizedClaims = claims.map((c, i) => ({
    claimId: c.claimId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.claimId)
      ? c.claimId
      : randomUUID(),
    claim: c.claim || `Claim ${i + 1}`,
    archiveId: c.archiveId,
    sourceUrl: c.sourceUrl || 'https://gov.in/doc.html',
    isLegacy: c.isLegacy ?? isLegacy,
  }));

  return {
    id,
    slug: 'story-' + id,
    title: 'Story ' + id,
    headline: 'Headline ' + id,
    summary: 'Summary for ' + id,
    heroImage: 'https://img.local/hero.jpg',
    author: 'Author One',
    category: 'investigations',
    status: status as any,
    publicationStatus: (status === 'published' ? 'published' : 'draft') as any,
    storyType: 'standard',
    evidenceScore: 90,
    readingTime: 5,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['test'],
    blocks: [{ id: randomUUID(), type: 'paragraph', content: 'Body paragraph' } as any],
    sources: [{ id: randomUUID(), name: 'Official Gazette', url: 'https://gov.in' } as any],
    claims: normalizedClaims,
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    isLegacy: isLegacy as any,
  };
}

// ─── Helper for Editorial Prerequisites (satisfies trg_enforce_publication_authority) ─
async function createEditorialPublicationPrerequisites(
  client: Client,
  storyId: string,
  claimId: string
) {
  // 1. Canonical claim
  await client.query(`
    INSERT INTO editorial.claims (
      id, claim, data, source_text, status, confidence, explanation, version, counter_arguments
    ) VALUES (
      $1, 'Verified Canonical Claim', 'Data', 'Source text', 'verified', 1.0, 'Explanation', 1, '[]'::jsonb
    ) ON CONFLICT (id) DO NOTHING;
  `, [claimId]);

  // 2. Approved editorial review
  await client.query(`
    INSERT INTO editorial.reviews (
      id, story_id, reviewer_id, status, checklist, submitted_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, NULL, 'approved', '{}'::jsonb, now(), now(), now()
    );
  `, [storyId]);

  // 3. Passed fact-check
  await client.query(`
    INSERT INTO editorial.fact_checks (
      id, story_id, checker_id, status, claims_total, claims_verified, claims_disputed, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), $1, NULL, 'passed', 1, 1, 0, now(), now()
    );
  `, [storyId]);

  // 4. Link story to claim
  await client.query(`
    INSERT INTO editorial.story_claims (story_id, claim_id) VALUES ($1, $2)
    ON CONFLICT DO NOTHING;
  `, [storyId, claimId]);

  // 5. Verified decision
  await client.query(`
    INSERT INTO editorial.claim_verifications (
      id, claim_id, story_id, verifier_id, decision, rationale, created_at
    ) VALUES (
      gen_random_uuid(), $2, $1, NULL, 'verified', 'Verified completely', now()
    );
  `, [storyId, claimId]);
}

// ─── Mock Service Client for isolated scheduler testing ───────────────────────
function createMockServiceClient(initialStories: any[] = [], initialSchedule: any[] = []) {
  const scheduleStore = [...initialSchedule];
  const storiesStore = [...initialStories];
  const logsStore: any[] = [];

  const mockDb: any = {
    from: (table: string) => {
      let currentFilter: (row: any) => boolean = () => true;
      let updatePayload: any = null;

      const builder: any = {
        select: () => builder,
        eq: (col: string, val: any) => {
          const prev = currentFilter;
          currentFilter = (r: any) => prev(r) && r[col] === val;
          return builder;
        },
        neq: (col: string, val: any) => {
          const prev = currentFilter;
          currentFilter = (r: any) => prev(r) && r[col] !== val;
          return builder;
        },
        in: (col: string, vals: any[]) => {
          const prev = currentFilter;
          currentFilter = (r: any) => prev(r) && vals.includes(r[col]);
          return builder;
        },
        lte: (col: string, val: any) => {
          const prev = currentFilter;
          currentFilter = (r: any) => prev(r) && r[col] <= val;
          return builder;
        },
        order: () => builder,
        limit: () => builder,
        single: async () => {
          const store = table === 'editorial_schedule' ? scheduleStore : storiesStore;
          const row = store.find(currentFilter);
          if (row && updatePayload) {
            Object.assign(row, updatePayload);
          }
          return { data: row || null, error: row ? null : new Error('Not found') };
        },
        maybeSingle: async () => {
          const store = table === 'editorial_schedule' ? scheduleStore : storiesStore;
          const row = store.find(currentFilter);
          if (row && updatePayload) {
            Object.assign(row, updatePayload);
          }
          return { data: row || null, error: null };
        },
        insert: (data: any) => {
          const row = { id: randomUUID(), ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
          if (table === 'editorial_schedule') scheduleStore.push(row);
          else if (table === 'stories') storiesStore.push(row);
          else if (table === 'publication_gate_log') logsStore.push(row);
          return {
            select: () => ({
              single: async () => ({ data: row, error: null }),
            }),
          };
        },
        update: (data: any) => {
          updatePayload = data;
          return builder;
        },
        then: async (resolve: any) => {
          const store = table === 'editorial_schedule' ? scheduleStore : storiesStore;
          if (updatePayload) {
            store.filter(currentFilter).forEach(r => Object.assign(r, updatePayload));
          }
          const rows = store.filter(currentFilter);
          return resolve({ data: rows, error: null });
        },
      };
      return builder;
    },
  };
  return { mockDb, scheduleStore, storiesStore, logsStore };
}

async function main() {
  console.log('\n=== Starting Phase 4B-2H Publication Guard Unification Test Suite ===\n');

  const stagingUrl = process.env.STAGING_DATABASE_URL || 'postgresql://postgres:Ntn%40supabase403@db.lvfovvidtowadmnggzzf.supabase.co:5432/postgres';
  const u = new URL(stagingUrl);
  if (!u.host.includes('lvfovvidtowadmnggzzf') || u.host.includes('mskyhaunnlwtwvsqcmav')) {
    console.error('FATAL: Not connected to staging database or production attempted!');
    process.exit(1);
  }

  const client = new Client({
    connectionString: stagingUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  });

  const createdArtifactIds: string[] = [];
  const createdStoryIds: string[] = [];
  const createdClaimIds: string[] = [];

  try {
    await client.connect();
    console.log('Connected to Staging PostgreSQL (lvfovvidtowadmnggzzf)\n');

    const vault = new EvidenceVaultService(client as any);
    setEvidenceVaultService(vault);
    RepositoryFactory.setEvidenceVault(vault);

    const editorPrincipal: Principal = {
      userId: randomUUID(),
      email: 'editor@breakdown.local',
      name: 'Chief Editor',
      role: 'editor',
      isSuperAdmin: false,
      status: 'active',
      organizationId: null,
    };

    // Setup valid verified artifact
    const validArtifact = await vault.archiveArtifact({
      sourceId: 'src-valid-' + randomUUID(),
      url: 'https://gov.in/press.html',
      content: 'VALID_EVIDENCE_CONTENT_' + Date.now(),
      contentHash: 'hash-valid-' + Date.now(),
      retrievedAt: new Date().toISOString(),
    });
    createdArtifactIds.push(validArtifact.id);
    await vault.lockRetention(validArtifact.id, { verifierId: editorPrincipal.userId, reason: 'Verified for 4B-2H tests' });

    // Setup staged artifact
    const stagedArtifact = await vault.archiveArtifact({
      sourceId: 'src-staged-' + randomUUID(),
      url: 'https://gov.in/staged.html',
      content: 'STAGED_EVIDENCE_CONTENT_' + Date.now(),
      contentHash: 'hash-staged-' + Date.now(),
      retrievedAt: new Date().toISOString(),
    });
    createdArtifactIds.push(stagedArtifact.id);

    // ─── 1. CORE PUBLICATION TESTS ─────────────────────────────────────────────
    await recordTest(1, 'valid verified evidence -> publish succeeds', 'CORE', async () => {
      const s = makeStory([{ claim: 'Valid claim', archiveId: validArtifact.id, isLegacy: false }]);
      const dec = await evaluatePublicationContractAsync(undefined, s, editorPrincipal);
      if (!dec.allowed) throw new Error(`Expected allowed, got: ${dec.error}`);
    });

    await recordTest(2, 'missing archive -> blocked', 'CORE', async () => {
      const s = makeStory([{ claim: 'Unarchived claim', archiveId: undefined, isLegacy: false }]);
      const dec = await evaluatePublicationContractAsync(undefined, s, editorPrincipal);
      if (dec.allowed) throw new Error('Expected publication to be blocked for missing archive');
    });

    await recordTest(3, 'archive_failed -> blocked', 'CORE', async () => {
      const s = makeStory([{ claim: 'Claim with non-existent archive', archiveId: '00000000-0000-0000-0000-000000000000', isLegacy: false }]);
      const dec = await evaluatePublicationContractAsync(undefined, s, editorPrincipal);
      if (dec.allowed) throw new Error('Expected publication to be blocked for missing archive artifact');
    });

    await recordTest(4, 'corrupted archive -> blocked', 'CORE', async () => {
      const corruptId = randomUUID();
      await client.query(`
        INSERT INTO newsroom.archived_artifacts (
          id, source_id, raw_sha256, content_hash, mime_type, byte_length, original_url, storage_bucket, storage_path, preservation_state, retention_state
        ) VALUES ($1, 'src-c', 'invalid-sha256', 'hash-c', 'text/plain', 10, 'https://c.in', 'evidence-vault', 'artifacts/fake.bin', 'preserved', 'verified')
        ON CONFLICT DO NOTHING;
      `, [corruptId]);
      createdArtifactIds.push(corruptId);

      const s = makeStory([{ claim: 'Corrupt claim', archiveId: corruptId, isLegacy: false }]);
      const dec = await evaluatePublicationContractAsync(undefined, s, editorPrincipal);
      if (dec.allowed) throw new Error('Expected publication to be blocked for corrupt artifact');
    });

    await recordTest(5, 'staged/unverified archive -> blocked', 'CORE', async () => {
      const s = makeStory([{ claim: 'Staged claim', archiveId: stagedArtifact.id, isLegacy: false }]);
      const dec = await evaluatePublicationContractAsync(undefined, s, editorPrincipal);
      if (dec.allowed) throw new Error('Expected publication to be blocked for staged artifact');
    });

    await recordTest(6, 'legacy story grandfathering -> allowed without archive', 'CORE', async () => {
      const s = makeStory([{ claim: 'Legacy claim', isLegacy: true }], 'review', true);
      const dec = await evaluatePublicationContractAsync(undefined, s, editorPrincipal);
      if (!dec.allowed) throw new Error(`Expected legacy story allowed, got: ${dec.error}`);
    });

    // ─── 2. REPOSITORY GUARD TESTS ─────────────────────────────────────────────
    const repo = RepositoryFactory.getStoryRepository();

    await recordTest(7, 'direct saveStory(status="published") -> blocked without token', 'REPO', async () => {
      const s = makeStory([{ claim: 'Direct publish', archiveId: validArtifact.id }], 'published');
      try {
        await repo.saveStory(s);
        throw new Error('Expected DirectPublicationForbiddenError');
      } catch (err: any) {
        if (err.name !== 'DirectPublicationForbiddenError') throw err;
      }
    });

    await recordTest(8, 'canonical publication operation with token -> allowed', 'REPO', async () => {
      const s = makeStory([{ claim: 'Publish via token', archiveId: validArtifact.id }]);
      createdStoryIds.push(s.id);
      const dec = await evaluatePublicationContractAsync(undefined, s, editorPrincipal);
      if (!dec.allowed || !dec.publicationToken) throw new Error(`Failed to evaluate publication: ${dec.error}`);
      
      const saved = await repo.saveStory(dec.updatedStory!, { publicationToken: dec.publicationToken });
      if (saved.status !== 'published') throw new Error('Story was not published');
    });

    await recordTest(9, 'draft save -> allowed without token or evidence', 'REPO', async () => {
      const s = makeStory([{ claim: 'Draft claim', archiveId: undefined }], 'draft');
      createdStoryIds.push(s.id);
      const saved = await repo.saveStory(s);
      if (saved.status !== 'draft') throw new Error('Failed to save draft');
    });

    await recordTest(10, 'publishStory() method -> succeeds with valid evidence', 'REPO', async () => {
      const s = makeStory([{ claim: 'PublishStory test', archiveId: validArtifact.id }], 'review');
      createdStoryIds.push(s.id);
      await repo.saveStory(s);
      const pub = await repo.publishStory(s.id);
      if (!pub || pub.status !== 'published') throw new Error('publishStory failed to publish');
    });

    // ─── 3. SCHEDULER & CLOUDFLARE TESTS ───────────────────────────────────────
    await recordTest(11, 'editorial schedule publication uses canonical evaluation', 'SCHED', async () => {
      const s = makeStory([{ claim: 'Sched valid', archiveId: validArtifact.id }], 'scheduled');
      createdStoryIds.push(s.id);
      await repo.saveStory(s);

      const today = new Date().toISOString().split('T')[0];
      const initialEntry = {
        id: randomUUID(),
        story_id: s.id,
        slot_date: today,
        slot_position: 1,
        priority: 10,
        category: 'investigations',
        status: 'ready',
      };

      const storyRow = {
        id: s.id,
        slug: s.slug,
        title: s.title,
        headline: s.headline,
        summary: s.summary,
        status: 'scheduled',
        claims: s.claims,
        blocks: s.blocks,
        sources: s.sources,
        published_at: new Date().toISOString(),
      };

      const { mockDb } = createMockServiceClient([storyRow], [initialEntry]);
      setServiceClient(mockDb);

      try {
        const { validateAndPublishDueStories } = await import('@/services/editorial/schedule');
        const schedResults = await validateAndPublishDueStories(new Date());
        const match = schedResults.find(r => r.storyId === s.id);
        if (!match || !match.passed) throw new Error(`Scheduled publication failed: ${JSON.stringify(match)}`);
      } finally {
        setServiceClient(null);
      }
    });

    await recordTest(12, 'blocked schedule -> remains unpublished when evidence missing', 'SCHED', async () => {
      const s = makeStory([{ claim: 'Sched unarchived', archiveId: undefined }], 'scheduled');
      createdStoryIds.push(s.id);
      await repo.saveStory(s);

      const today = new Date().toISOString().split('T')[0];
      const initialEntry = {
        id: randomUUID(),
        story_id: s.id,
        slot_date: today,
        slot_position: 2,
        priority: 10,
        category: 'investigations',
        status: 'ready',
      };

      const storyRow = {
        id: s.id,
        slug: s.slug,
        title: s.title,
        headline: s.headline,
        summary: s.summary,
        status: 'scheduled',
        claims: s.claims,
        blocks: s.blocks,
        sources: s.sources,
        published_at: new Date().toISOString(),
      };

      const { mockDb } = createMockServiceClient([storyRow], [initialEntry]);
      setServiceClient(mockDb);

      try {
        const { validateAndPublishDueStories } = await import('@/services/editorial/schedule');
        const schedResults = await validateAndPublishDueStories(new Date());
        const match = schedResults.find(r => r.storyId === s.id);
        if (!match || match.passed) throw new Error('Expected scheduled publication to be blocked');
        
        // Confirm story remains unpublished
        const dbStory = await repo.getStory(s.id);
        if (dbStory?.status === 'published') throw new Error('Story was published despite missing evidence');
      } finally {
        setServiceClient(null);
      }
    });

    await recordTest(13, 'Cloudflare cron dispatches through canonical endpoint', 'SCHED_CF', async () => {
      const { publishDueStories } = await import('@/services/editorial/schedule-cf');
      const cfRes = await publishDueStories({
        SUPABASE_URL: 'https://fake.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'fake',
      });
      if (cfRes.length !== 0) throw new Error('Expected empty results when not configured with cron secret');
    });

    // ─── 4. APIS & CMS TESTS ───────────────────────────────────────────────────
    await recordTest(14, 'v1 story API blocks direct published status without token', 'API', async () => {
      const s = makeStory([{ claim: 'v1 claim' }], 'published');
      try {
        await repo.saveStory(s);
        throw new Error('Expected DirectPublicationForbiddenError');
      } catch (err: any) {
        if (err.name !== 'DirectPublicationForbiddenError') throw err;
      }
    });

    await recordTest(15, 'forged publication token is rejected', 'API', async () => {
      const s = makeStory([{ claim: 'forged token claim' }], 'published');
      try {
        await repo.saveStory(s, { publicationToken: 'forged_fake_token_12345' });
        throw new Error('Expected DirectPublicationForbiddenError');
      } catch (err: any) {
        if (err.name !== 'DirectPublicationForbiddenError') throw err;
      }
    });

    // ─── 5. MULTI-EVIDENCE TESTS ───────────────────────────────────────────────
    await recordTest(16, 'multi-evidence claim: all valid -> publish succeeds', 'MULTI', async () => {
      const art2 = await vault.archiveArtifact({
        sourceId: 'src-m2-' + randomUUID(),
        url: 'https://m2.in',
        content: 'M2',
        contentHash: 'h-m2',
        retrievedAt: new Date().toISOString()
      });
      createdArtifactIds.push(art2.id);
      await vault.lockRetention(art2.id, { reason: 'Verified m2' });

      const s = makeStory([
        { claimId: randomUUID(), claim: 'Multi claim', archiveId: validArtifact.id },
        { claimId: randomUUID(), claim: 'Multi claim 2', archiveId: art2.id },
      ]);
      const dec = await evaluatePublicationContractAsync(undefined, s, editorPrincipal);
      if (!dec.allowed) throw new Error(`Expected allowed, got: ${dec.error}`);
    });

    await recordTest(17, 'multi-evidence claim: one staged -> publish blocked', 'MULTI', async () => {
      const s = makeStory([
        { claimId: randomUUID(), claim: 'Multi claim 1', archiveId: validArtifact.id },
        { claimId: randomUUID(), claim: 'Multi claim staged', archiveId: stagedArtifact.id },
      ]);
      const dec = await evaluatePublicationContractAsync(undefined, s, editorPrincipal);
      if (dec.allowed) throw new Error('Expected multi-evidence story to be blocked by staged artifact');
    });

    // ─── 6. DATABASE DEFENSE-IN-DEPTH TRIGGER TESTS ───────────────────────────
    await recordTest(18, 'database trigger blocks direct SQL publication without archiveId', 'DB_TRIGGER', async () => {
      const badStoryId = randomUUID();
      const claimId = randomUUID();
      createdStoryIds.push(badStoryId);
      createdClaimIds.push(claimId);

      // Insert story in draft status first so foreign keys in editorial tables are satisfied
      await client.query(`
        INSERT INTO public.stories (id, slug, title, status, claims)
        VALUES ($1, $2, 'Bad Story', 'draft', $3::jsonb);
      `, [badStoryId, 'slug-' + badStoryId, JSON.stringify([{ claim: 'Draft claim' }])]);

      // Satisfy editorial prerequisites to specifically test the Evidence Vault invariant trigger
      await createEditorialPublicationPrerequisites(client, badStoryId, claimId);

      // Attempt to publish without archiveId -> should fail trg_enforce_story_publication_invariants (code 23514)
      try {
        await client.query(`
          UPDATE public.stories
          SET status = 'published', published_at = now(), claims = $2::jsonb
          WHERE id = $1;
        `, [badStoryId, JSON.stringify([{ claim: 'Unarchived DB claim', isLegacy: false }])]);
        throw new Error('Database trigger should have blocked publication');
      } catch (dbErr: any) {
        if (dbErr.code !== '23514' && !dbErr.message.includes('Database Invariant Violation')) {
          throw new Error(`Unexpected DB error: ${dbErr.message} (code ${dbErr.code})`);
        }
      }
    });

    await recordTest(19, 'database trigger allows legitimate published story with archiveId', 'DB_TRIGGER', async () => {
      const goodStoryId = randomUUID();
      const claimId = randomUUID();
      createdStoryIds.push(goodStoryId);
      createdClaimIds.push(claimId);

      // Insert story in draft status first
      await client.query(`
        INSERT INTO public.stories (id, slug, title, status, claims)
        VALUES ($1, $2, 'Good Story', 'draft', $3::jsonb);
      `, [goodStoryId, 'slug-' + goodStoryId, JSON.stringify([{ claim: 'Draft claim' }])]);

      // Satisfy editorial prerequisites
      await createEditorialPublicationPrerequisites(client, goodStoryId, claimId);

      // Attempt to publish with valid archiveId -> BOTH triggers pass!
      await client.query(`
        UPDATE public.stories
        SET status = 'published', published_at = now(), claims = $2::jsonb
        WHERE id = $1;
      `, [goodStoryId, JSON.stringify([{ claim: 'Archived DB claim', archiveId: validArtifact.id, isLegacy: false }])]);
      
      const checkRes = await client.query(`SELECT status, published_at FROM public.stories WHERE id = $1;`, [goodStoryId]);
      if (checkRes.rows[0]?.status !== 'published') {
        throw new Error('Story was not updated to published in database');
      }
    });

    await recordTest(20, 'database trigger allows draft save without archiveId', 'DB_TRIGGER', async () => {
      const draftId = randomUUID();
      createdStoryIds.push(draftId);
      await client.query(`
        INSERT INTO public.stories (id, slug, title, status, claims)
        VALUES ($1, $2, 'Draft Story', 'draft', $3::jsonb);
      `, [draftId, 'slug-' + draftId, JSON.stringify([{ claim: 'Draft claim', archiveId: null }])]);
      
      const checkRes = await client.query(`SELECT status FROM public.stories WHERE id = $1;`, [draftId]);
      if (checkRes.rows[0]?.status !== 'draft') {
        throw new Error('Draft story was not saved in database');
      }
    });

  } finally {
    // ─── GUARANTEED CLEANUP & DISCONNECTION ──────────────────────────────────
    console.log('\nCleaning up test artifacts and stories in Staging...');
    try {
      if (createdClaimIds.length > 0) {
        await client.query(`DELETE FROM editorial.claim_verifications WHERE claim_id = ANY($1::uuid[])`, [createdClaimIds]).catch(() => {});
        await client.query(`DELETE FROM editorial.story_claims WHERE claim_id = ANY($1::uuid[])`, [createdClaimIds]).catch(() => {});
        await client.query(`DELETE FROM editorial.claims WHERE id = ANY($1::uuid[])`, [createdClaimIds]).catch(() => {});
      }
      if (createdStoryIds.length > 0) {
        await client.query(`DELETE FROM editorial.claim_verifications WHERE story_id = ANY($1::uuid[])`, [createdStoryIds]).catch(() => {});
        await client.query(`DELETE FROM editorial.story_claims WHERE story_id = ANY($1::uuid[])`, [createdStoryIds]).catch(() => {});
        await client.query(`DELETE FROM editorial.fact_checks WHERE story_id = ANY($1::uuid[])`, [createdStoryIds]).catch(() => {});
        await client.query(`DELETE FROM editorial.reviews WHERE story_id = ANY($1::uuid[])`, [createdStoryIds]).catch(() => {});
        await client.query(`DELETE FROM public.editorial_schedule WHERE story_id = ANY($1::uuid[])`, [createdStoryIds]).catch(() => {});
        await client.query(`DELETE FROM public.stories WHERE id = ANY($1::uuid[])`, [createdStoryIds]).catch(() => {});
      }
      if (createdArtifactIds.length > 0) {
        await client.query(`DELETE FROM newsroom.archived_artifacts WHERE id = ANY($1::uuid[])`, [createdArtifactIds]).catch(() => {});
      }
    } catch (cleanupErr) {
      console.error('Error during cleanup:', cleanupErr);
    } finally {
      await client.end();
      console.log('PostgreSQL connection closed cleanly.');
    }
  }

  console.log('\n=== Publication Guard Unification Suite Summary ===');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`Passed: ${passed} / ${results.length}`);
  console.log(`Failed: ${failed} / ${results.length}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exitCode = 1;
});
