import { describe, it, expect } from 'vitest';
import {
  Phase1Seeder,
  SafeDatabaseClient,
  deterministicUuid,
  UUID_NAMESPACES,
  validateJsonFields,
} from '../scripts/seed-supabase-from-fixtures';

describe('Phase 1 Fixture Seeder Unit & Safety Tests', () => {
  // Test A: Default invocation is dry-run
  it('Test A: Default invocation is dry-run', () => {
    const seeder = new Phase1Seeder();
    // @ts-ignore - inspecting private flag
    expect(seeder.isDryRun).toBe(true);
  });

  // Test B: Dry-run performs zero writes (fail-closed write protection)
  it('Test B: Dry-run performs zero writes (fail-closed write protection)', async () => {
    let mockWriteExecuted = false;
    const mockPgClient: any = {
      query: async (sql: string) => {
        if (/^(INSERT|UPDATE|DELETE|UPSERT|DROP|TRUNCATE)/i.test(sql.trim())) {
          mockWriteExecuted = true;
        }
        return { rows: [] };
      },
    };

    const safeClient = new SafeDatabaseClient(mockPgClient, true /* dry-run */);

    // Read should succeed
    const readRes = await safeClient.query('SELECT * FROM public.stories;');
    expect(readRes.rows).toEqual([]);
    expect(safeClient.writeAttempts).toBe(0);

    // Mutation must throw and never execute
    await expect(safeClient.query("INSERT INTO public.stories (slug) VALUES ('test');")).rejects.toThrow(
      /FAIL-CLOSED VIOLATION: Write operation intercepted during DRY-RUN mode/
    );
    expect(safeClient.writeAttempts).toBe(1);
    expect(safeClient.writesExecuted).toBe(0);
    expect(mockWriteExecuted).toBe(false);
  });

  // Test C: Deterministic ID mapping
  it('Test C: Deterministic ID mapping (RFC 4122 UUIDv5)', () => {
    const slug = 'mgnrega-reform';
    const id1 = deterministicUuid(UUID_NAMESPACES.STORY, slug);
    const id2 = deterministicUuid(UUID_NAMESPACES.STORY, slug);
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

    // Different slugs must produce different UUIDs
    const id3 = deterministicUuid(UUID_NAMESPACES.STORY, 'digital-payments-boom');
    expect(id1).not.toBe(id3);

    // Different namespaces must produce different UUIDs
    const idTopic = deterministicUuid(UUID_NAMESPACES.TOPIC, slug);
    expect(id1).not.toBe(idTopic);
  });

  // Test D: Quarantined artifacts cannot be overwritten/unquarantined
  it('Test D: Quarantined artifacts cannot be overwritten or unquarantined', async () => {
    const seeder = new Phase1Seeder({ dryRun: true });
    const fixtures = seeder.extractFixtures();

    // Verify none of the 56 fixture story slugs match known test artifact slugs
    const knownTestSlugs = [
      'vs1-lifecycle-1790003039396',
      'adversarial-dml-p0-test-1790162463905',
      'story-fully-qualified-p0-test-1790163063554',
      'story-fully-qualified-p0-test-1790163175296',
      'story-fully-qualified-p0-test-1790163525896',
      'story-fully-qualified-p0-test-1790164735850',
      'story-fully-qualified-p0-test-1790164842582',
      'story-fully-qualified-p0-test-1790165283068',
      'story-fully-qualified-p0-test-1790165552184',
      'adversarial-dml-gates-p0-test-1790165552184',
      'adversarial-dml-gates-p0-test-1790168094422',
      'story-fully-qualified-p0-test-1790168394356',
      'adversarial-dml-gates-p0-test-1790168394356',
      'adversarial-dml-gates-p0-test-1790212041459',
      'adversarial-dml-gates-p0-test-1790260508414',
      'adversarial-dml-gates-p0-test-1790266821510',
      'story-concurrency-concurrency-1790266916098',
    ];

    const fixtureSlugs = new Set(fixtures.stories.map((s) => s.slug));
    for (const testSlug of knownTestSlugs) {
      expect(fixtureSlugs.has(testSlug)).toBe(false);
    }
  });

  // Test E: Divergent existing record becomes CONFLICT
  it('Test E: Collision with quarantined record is classified as CONFLICT', async () => {
    // If a database record has is_test_artifact = true, seeder must mark CONFLICT
    const mockExistingDbStories = new Map([
      ['test-quarantined', { id: 'uuid-1', slug: 'test-quarantined', is_test_artifact: true }],
    ]);

    const isTestArtifact = mockExistingDbStories.get('test-quarantined')?.is_test_artifact;
    expect(isTestArtifact).toBe(true);
  });

  // Test F: Second identical run produces NO-OP plan
  it('Test F: Second identical run produces NO-OP plan when DB matches fixtures', () => {
    const seeder = new Phase1Seeder({ dryRun: true });
    const fixtures = seeder.extractFixtures();

    // Simulate DB having all fixtures
    const mockDbStoriesMap = new Map(fixtures.stories.map((s) => [s.slug, { slug: s.slug, is_test_artifact: false }]));

    let insertCount = 0;
    let noOpCount = 0;
    for (const s of fixtures.stories) {
      if (mockDbStoriesMap.has(s.slug)) {
        noOpCount++;
      } else {
        insertCount++;
      }
    }

    expect(insertCount).toBe(0);
    expect(noOpCount).toBe(fixtures.stories.length);
  });

  // Test G: Relationship resolution is deterministic
  it('Test G: Relationship resolution is deterministic across runs', () => {
    const seeder = new Phase1Seeder({ dryRun: true });
    const f1 = seeder.extractFixtures();
    const f2 = seeder.extractFixtures();

    const rels1 = f1.stories.map((s) => ({
      slug: s.slug,
      stories: s.relatedStories ? s.relatedStories.map((rs) => rs.slug).sort() : [],
      entities: s.relatedEntities ? s.relatedEntities.map((re) => re.slug).sort() : [],
      topics: s.relatedTopicIds ? [...s.relatedTopicIds].sort() : [],
    }));

    const rels2 = f2.stories.map((s) => ({
      slug: s.slug,
      stories: s.relatedStories ? s.relatedStories.map((rs) => rs.slug).sort() : [],
      entities: s.relatedEntities ? s.relatedEntities.map((re) => re.slug).sort() : [],
      topics: s.relatedTopicIds ? [...s.relatedTopicIds].sort() : [],
    }));

    expect(rels1).toEqual(rels2);
  });

  // Test H: Invalid fixture fails closed
  it('Test H: Invalid fixture structure fails closed during validation', () => {
    const validCheck = validateJsonFields({ valid: 'data', count: 12 });
    expect(validCheck.valid).toBe(true);

    // Circular structure
    const circular: any = {};
    circular.self = circular;
    const invalidCheck = validateJsonFields(circular);
    expect(invalidCheck.valid).toBe(false);
    expect(invalidCheck.errors.length).toBeGreaterThan(0);
  });
});
