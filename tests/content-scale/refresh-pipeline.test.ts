/**
 * THE BREAKDOWN — Content Refresh Pipeline Tests
 */

import { ContentRefreshPipeline } from '../../lib/content-scale/refresh-pipeline';
import type { APIStory } from '../../utils/data-layer/types';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  console.log('Content Refresh Pipeline Tests:');

  const pipeline = new ContentRefreshPipeline();

  // Test 1: Story with all current updates
  const currentStory: APIStory = {
    id: 'current-story',
    slug: 'current-story',
    headline: 'Current Test Story',
    summary: 'A current test story.',
    publishedAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    lastVerified: '2026-08-25T00:00:00Z', // Recent
    readingTime: 5,
    author: { name: 'Author' },
    evidenceScore: 90, // High evidence density
    category: 'economy',
    tags: ['test'],
    keyPoints: [],
    timeline: [],
    facts: [],
    claims: [{ claim: 'Standard claim', source: 'Source', verification: 'true', explanation: 'Yes', confidence: 1.0 }],
    sources: [{ name: 'Primary Source', url: 'https://test.com', type: 'government', tier: 1 }],
    charts: [],
    faq: [],
    relatedStories: [],
    relatedEntities: [],
  };

  const result1 = pipeline.analyzeStory(currentStory);
  assert(result1.status === 'CURRENT', 'Story status should be CURRENT');
  assert(result1.severity === 'NONE', 'Story severity should be NONE');

  // Test 2: Outdated tags trigger Outdated status and P1 severity
  const outdatedStory = {
    ...currentStory,
    tags: ['outdated'],
  };
  const result2 = pipeline.analyzeStory(outdatedStory);
  assert(result2.status === 'OUTDATED', 'Outdated tag triggers OUTDATED status');
  assert(result2.severity === 'P1', 'Outdated tag triggers P1 severity');

  // Test 3: Repealed claims trigger Outdated status and P1 severity
  const repealedStory = {
    ...currentStory,
    claims: [{ claim: 'This act is repealed', source: 'Source', verification: 'true', explanation: 'Yes', confidence: 1.0 }],
  };
  const result3 = pipeline.analyzeStory(repealedStory);
  assert(result3.status === 'OUTDATED', 'Repealed claim triggers OUTDATED status');
  assert(result3.severity === 'P1', 'Repealed claim triggers P1 severity');

  // Test 4: Stale lastVerified (> 180 days) triggers NEEDS_UPDATE and P2 severity
  const staleStory = {
    ...currentStory,
    lastVerified: '2025-12-01T00:00:00Z', // More than 180 days before August 30, 2026
  };
  const result4 = pipeline.analyzeStory(staleStory);
  assert(result4.status === 'NEEDS_UPDATE', 'Old lastVerified triggers NEEDS_UPDATE status');
  assert(result4.severity === 'P2', 'Old lastVerified triggers P2 severity');

  // Test 5: Missing sources triggers NEEDS_UPDATE and P1 severity
  const missingSourcesStory = {
    ...currentStory,
    sources: [],
  };
  const result5 = pipeline.analyzeStory(missingSourcesStory);
  assert(result5.status === 'NEEDS_UPDATE', 'Missing sources triggers NEEDS_UPDATE status');
  assert(result5.severity === 'P1', 'Missing sources triggers P1 severity');

  // Test 6: Low evidence density triggers P2 severity
  const lowEvidenceStory = {
    ...currentStory,
    evidenceScore: 75,
  };
  const result6 = pipeline.analyzeStory(lowEvidenceStory);
  assert(result6.severity === 'P2', 'Low evidence score triggers P2 severity');

  console.log(`\nContent Refresh Pipeline Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
