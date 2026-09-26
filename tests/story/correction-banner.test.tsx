import * as assert from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import CorrectionNoticeBanner from '../../components/story/CorrectionNoticeBanner';
import type { PublishedCorrection } from '../../types/corrections';

function runTests() {
  console.log('Running Correction Notice Banner Tests...\n');
  let passed = 0;
  let failed = 0;

  function runTest(name: string, testFn: () => void) {
    try {
      testFn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   ${e.message}`);
      failed++;
    }
  }

  runTest('1. Renders null / empty string when corrections list is empty or undefined', () => {
    const htmlEmpty = renderToString(<CorrectionNoticeBanner corrections={[]} />);
    assert.strictEqual(htmlEmpty, '', 'Empty corrections must render empty string');

    const htmlNull = renderToString(<CorrectionNoticeBanner corrections={undefined as any} />);
    assert.strictEqual(htmlNull, '', 'Undefined corrections must render empty string');
  });

  runTest('2. Renders accessible semantic region with aria-label', () => {
    const sample: PublishedCorrection[] = [
      {
        id: 'corr-01',
        storyId: 'mgnrega-reform',
        storySlug: 'mgnrega-reform',
        category: 'factual',
        previousWording: '100 days statutory guarantee',
        correctedWording: '125 days statutory guarantee under Act 18 of 2025',
        explanation: 'Updated to reflect the commencement of VB-G RAM G Act, 2025.',
        createdAt: '2026-07-24T10:00:00.000Z',
        updatedAt: '2026-07-24T10:00:00.000Z',
      },
    ];

    const html = renderToString(<CorrectionNoticeBanner corrections={sample} />);
    assert.ok(html.includes('role="region"'), 'Must have role="region"');
    assert.ok(html.includes('aria-label="Editorial Correction Notice"'), 'Must have aria-label');
    assert.ok(html.includes('Editorial Correction'), 'Must render title');
  });

  runTest('3. Renders explanation, previous text diff, and corrected text diff', () => {
    const sample: PublishedCorrection[] = [
      {
        id: 'corr-02',
        storyId: 'rbi-repo-rate',
        storySlug: 'rbi-repo-rate',
        category: 'factual',
        previousWording: 'repo rate at 6.50%',
        correctedWording: 'repo rate eased to 6.25%',
        explanation: 'MPC resolution lowered repo rate.',
        createdAt: '2026-07-25T12:00:00.000Z',
        updatedAt: '2026-07-25T12:00:00.000Z',
      },
    ];

    const html = renderToString(<CorrectionNoticeBanner corrections={sample} />);
    assert.ok(html.includes('MPC resolution lowered repo rate.'), 'Must include explanation');
    assert.ok(html.includes('repo rate at 6.50%'), 'Must include previous wording');
    assert.ok(html.includes('repo rate eased to 6.25%'), 'Must include corrected wording');
    assert.ok(html.includes('line-through'), 'Must render line-through style on previous wording');
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
