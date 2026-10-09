/**
 * ─── The Breakdown OS — Data Provider Parity Engine Unit Tests ───────────────
 *
 * Tests the normalization, comparison, hashing, and delta-detection algorithms
 * independently of live Supabase network connectivity.
 *
 * Required Coverage:
 *   ✓ identical records
 *   ✓ missing record
 *   ✓ extra record
 *   ✓ scalar mismatch
 *   ✓ nested-object mismatch
 *   ✓ array mismatch
 *   ✓ array order normalization
 *   ✓ null vs undefined
 *   ✓ deterministic hashing
 *   ✓ ignored-field behavior
 *   ✓ relationship mismatch
 *
 * Governing Documents: AGENTS.md, docs/editorial/editorial-constitution.md
 * Remediation Program: Phase 1, Task 1.2
 */

import {
  deepCompare,
  computeDeterministicHash,
  compareDomainRecords,
  sortObjectKeys,
  normalizeValue,
  DEFAULT_IGNORED_FIELDS,
  NormalizationOptions,
} from '../scripts/verify-data-provider-parity';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
      failed++;
    }
  }

  console.log('───────────────────────────────────────────────────────────────────');
  console.log('Running Data Provider Parity Unit Tests (Standalone Engine)');
  console.log('───────────────────────────────────────────────────────────────────\n');

  // Test 1: Identical Records
  {
    const fixture = { slug: 'test-story', title: 'Story Title', summary: 'Summary text', tags: ['economy', 'india'] };
    const dbRecord = { slug: 'test-story', title: 'Story Title', summary: 'Summary text', tags: ['economy', 'india'] };
    const mismatches = deepCompare(fixture, dbRecord);
    assert(mismatches.length === 0, '1. Identical records produce zero mismatches');
  }

  // Test 2: Missing Record in Database
  {
    const fixtures = [{ slug: 'story-1' }, { slug: 'story-2' }];
    const dbRecords = [{ slug: 'story-1' }];
    const res = compareDomainRecords('Stories', 'stories', fixtures, dbRecords, {});
    assert(res.missingInDb.length === 1 && res.missingInDb[0] === 'story-2', '2. Missing record in DB is detected');
    assert(res.status === 'DELTA', '2. Missing record transitions status to DELTA');
  }

  // Test 3: Extra Record in Database
  {
    const fixtures = [{ slug: 'story-1' }];
    const dbRecords = [{ slug: 'story-1' }, { slug: 'story-extra' }];
    const res = compareDomainRecords('Stories', 'stories', fixtures, dbRecords, {});
    assert(res.extraInDb.length === 1 && res.extraInDb[0] === 'story-extra', '3. Extra record in DB is detected');
    assert(res.status === 'DELTA', '3. Extra record transitions status to DELTA');
  }

  // Test 4: Scalar Value Mismatch
  {
    const fixture = { slug: 'test-story', evidenceScore: 94 };
    const dbRecord = { slug: 'test-story', evidenceScore: 80 };
    const mismatches = deepCompare(fixture, dbRecord);
    assert(mismatches.length === 1, '4. Scalar mismatch detected');
    assert(mismatches[0].field === 'evidenceScore', '4. Correct field reported for scalar mismatch');
    assert(mismatches[0].fixtureValue === 94 && mismatches[0].dbValue === 80, '4. Values accurately captured');
  }

  // Test 5: Nested-Object Mismatch
  {
    const fixture = {
      slug: 'test-story',
      meta: { author: { name: 'Editor A', role: 'Staff' } },
    };
    const dbRecord = {
      slug: 'test-story',
      meta: { author: { name: 'Editor B', role: 'Staff' } },
    };
    const mismatches = deepCompare(fixture, dbRecord);
    assert(mismatches.length === 1, '5. Nested-object mismatch detected');
    assert(mismatches[0].field === 'meta.author.name', '5. Deep path correctly formatted');
  }

  // Test 6: Array Length and Item Mismatch
  {
    const fixture = { slug: 'test-story', tags: ['a', 'b', 'c'] };
    const dbRecord = { slug: 'test-story', tags: ['a', 'b'] };
    const mismatches = deepCompare(fixture, dbRecord);
    assert(mismatches.length === 1, '6. Array length mismatch detected');
    assert(mismatches[0].reason.includes('length mismatch'), '6. Reason indicates array length mismatch');
  }

  // Test 7: Array Order Normalization (Unordered vs Ordered)
  {
    const fixture = { slug: 'test-story', tags: ['zebra', 'apple', 'mango'] };
    const dbRecord = { slug: 'test-story', tags: ['apple', 'mango', 'zebra'] };

    // With unorderedArrayFields configured:
    const options: NormalizationOptions = {
      unorderedArrayFields: new Set(['tags']),
    };
    const mismatchesWithNorm = deepCompare(fixture, dbRecord, options);
    assert(mismatchesWithNorm.length === 0, '7. Array order normalization treats unordered tags as equal');

    // Without unorderedArrayFields configured:
    const mismatchesRaw = deepCompare(fixture, dbRecord, {});
    assert(mismatchesRaw.length > 0, '7. Raw array comparison strictly preserves order');
  }

  // Test 8: Null vs Undefined (Strict Preservation)
  {
    const fixtureWithUndef = { slug: 'test-story', notes: undefined };
    const dbWithNull = { slug: 'test-story', notes: null };
    const mismatches = deepCompare(fixtureWithUndef, dbWithNull);
    assert(mismatches.length === 1, '8. Null vs undefined is not silently coerced');
    assert(mismatches[0].fixtureType === 'undefined' && mismatches[0].dbType === 'object', '8. Null/undefined distinction preserved');
  }

  // Test 9: Deterministic Hashing
  {
    const objA = { b: 2, a: 1, c: { y: 20, x: 10 } };
    const objB = { a: 1, c: { x: 10, y: 20 }, b: 2 };
    const hashA = computeDeterministicHash(objA);
    const hashB = computeDeterministicHash(objB);
    assert(hashA === hashB, '9. Hash is invariant to key order');
    assert(typeof hashA === 'string' && hashA.length === 64, '9. SHA-256 hash output is 64 hex characters');
  }

  // Test 10: Ignored-Field Behavior
  {
    const fixture = { slug: 'test-story', title: 'Same Title', created_at: '2026-01-01T00:00:00Z', version: 1 };
    const dbRecord = { slug: 'test-story', title: 'Same Title', created_at: '2026-09-30T12:00:00Z', version: 4 };

    const options: NormalizationOptions = {
      ignoredFields: DEFAULT_IGNORED_FIELDS,
    };
    const mismatches = deepCompare(fixture, dbRecord, options);
    assert(mismatches.length === 0, '10. Ignored fields (created_at, version) are excluded from equality');
  }

  // Test 11: Relationship Mismatch
  {
    const fixture = { slug: 'test-story', relatedStoryIds: ['story-alpha', 'story-beta'] };
    const dbRecord = { slug: 'test-story', relatedStoryIds: ['story-alpha', 'story-gamma'] };
    const options: NormalizationOptions = {
      unorderedArrayFields: new Set(['relatedStoryIds']),
    };
    const mismatches = deepCompare(fixture, dbRecord, options);
    assert(mismatches.length > 0, '11. Relationship array difference detected');
    assert(mismatches[0].field.startsWith('relatedStoryIds'), '11. Relationship mismatch field identified');
  }

  console.log('\n───────────────────────────────────────────────────────────────────');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('───────────────────────────────────────────────────────────────────\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
