import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { SupabaseStoryRepository } from '../services/repositories/supabase/story';
import { isPubliclyPublished, storyPublicationContext } from '../lib/story/publication';

// Bootstrap environment
const envPath = path.resolve(process.cwd(), '.env.local');
let dbUrl = '';
let supabaseUrl = '';
let supabaseAnonKey = '';
let supabaseServiceKey = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
      if (key === 'DATABASE_URL') dbUrl = val;
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseAnonKey = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceKey = val;
    }
  }
}

describe.skip('Migration 022 — Test Artifact Quarantine & Public Read Isolation', () => {
  let pgClient: Client;
  const knownQuarantinedSlug = 'vs1-lifecycle-1790003039396';
  const knownQuarantinedId = '0ad9ea5d-5994-4bc5-9eb5-fce7390b67c0';
  const draftTestSlug = 'story-no-approval-p0-test-1790143943499';

  beforeAll(async () => {
    pgClient = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    await pgClient.connect();

    // Ensure the quarantined fixture exists for the test lifecycle
    await pgClient.query(`
      INSERT INTO public.stories (id, slug, title, summary, status, is_test_artifact, version, published_at, created_at, updated_at)
      VALUES ($1, $2, 'Quarantine Test Story', 'Summary', 'published', true, 3, NOW(), NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET is_test_artifact = true, version = 3, status = 'published';
    `, [knownQuarantinedId, knownQuarantinedSlug]);
  });

  afterAll(async () => {
    await pgClient.query(`DELETE FROM public.stories WHERE id = $1;`, [knownQuarantinedId]).catch(() => {});
    await pgClient.end();
  });

  it('Test A: Normal published story (non-artifact) is eligible for public reading', () => {
    const mockPublicStory: any = {
      id: 'mock-pub-1',
      slug: 'mock-published-story',
      status: 'published',
      publicationStatus: 'published',
      publishedAt: '2026-01-01T00:00:00.000Z',
      isTestArtifact: false,
    };
    expect(isPubliclyPublished(storyPublicationContext(mockPublicStory))).toBe(true);
  });

  it('Test B: Published test artifact is NOT returned through public reader methods', async () => {
    const storyRepo = new SupabaseStoryRepository();
    const publicStories = await storyRepo.getPublicStories();

    // Verify none of the 17 quarantined artifacts are present
    const hasQuarantined = publicStories.data.some(s => s.isTestArtifact === true || s.slug === knownQuarantinedSlug);
    expect(hasQuarantined).toBe(false);
    // Post-reconciliation: Exactly 41 canonical public stories returned, 0 quarantined
    expect(publicStories.data.length).toBe(41);

    // Also verify via isPubliclyPublished
    const mockArtifactStory: any = {
      id: knownQuarantinedId,
      slug: knownQuarantinedSlug,
      status: 'published',
      publicationStatus: 'published',
      publishedAt: '2026-01-01T00:00:00.000Z',
      isTestArtifact: true,
    };
    expect(isPubliclyPublished(storyPublicationContext(mockArtifactStory))).toBe(false);
  });

  it('Test C: Draft test artifact is NOT returned through public reader methods', async () => {
    const storyRepo = new SupabaseStoryRepository();
    const publicStory = await storyRepo.getPublicStoryBySlug(draftTestSlug);
    expect(publicStory).toBeUndefined();

    // Verify direct anon client is blocked by RLS
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await anonClient.from('stories').select('id, slug').eq('slug', draftTestSlug).single();
    expect(data).toBeNull();
    expect(error?.code).toBe('PGRST116');
  });

  it('Test D: Privileged / internal lookup can still retrieve the artifact where intended', async () => {
    // 1. Direct database read can see the quarantined record intact
    const dbRes = await pgClient.query(`
      SELECT id, slug, status, is_test_artifact, version
      FROM public.stories
      WHERE id = $1;
    `, [knownQuarantinedId]);

    expect(dbRes.rows.length).toBe(1);
    expect(dbRes.rows[0].slug).toBe(knownQuarantinedSlug);
    expect(dbRes.rows[0].status).toBe('published');
    expect(dbRes.rows[0].is_test_artifact).toBe(true);
    expect(dbRes.rows[0].version).toBe(3); // Historical version preserved

    // 2. Service role client if available can also query it
    if (supabaseServiceKey) {
      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data } = await serviceClient.from('stories').select('id, slug, is_test_artifact').eq('id', knownQuarantinedId).single();
      expect(data).not.toBeNull();
      expect(data?.is_test_artifact).toBe(true);
    }
  });

  it('Test E: getStoryBySlug(test-slug) and getPublicStoryBySlug cannot accidentally bypass quarantine', async () => {
    const storyRepo = new SupabaseStoryRepository();

    // 1. getPublicStoryBySlug explicitly rejects quarantined artifact
    const publicStory = await storyRepo.getPublicStoryBySlug(knownQuarantinedSlug);
    expect(publicStory).toBeUndefined();

    // 2. getStoryBySlug executed via anon client is blocked by database RLS
    const rawStory = await storyRepo.getStoryBySlug(knownQuarantinedSlug);
    expect(rawStory).toBeUndefined();
  });
});
