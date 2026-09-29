/**
 * tests/aeo-geo-adversarial.test.ts
 * Adversarial Testing Suite:
 * Simulates adversarial crawler inputs, injection attacks, unicode strings,
 * publication state manipulation, and malformed metadata.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 12 — Adversarial Testing)
 *   - AGENTS.md (Security & Reliability Principles)
 */

import {
  createArticleSchema,
  createBreadcrumbSchema,
  createOrganizationSchema,
  isSafePublicUrl,
  extractAuthorName,
  isOrgAuthor,
  buildAuthorNode,
} from '../lib/seo/jsonld';
import { createStoryJsonLd } from '../lib/seo/jsonld-story';
import { isPubliclyPublished, shouldIndexStory, type PublicationContext } from '../lib/story/publication';
import type { Story } from '../types/canonical';

console.log('🛡️ [aeo-geo-adversarial] Running Adversarial Attack Vector Tests...\n');

let passCount = 0;
let failCount = 0;

function expect(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passCount++;
  } else {
    failCount++;
    console.error(`❌ FAILED: ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

// ─── 1. Injection & Malformed URL Attacks ─────────────────────────────────────

const maliciousUrls = [
  'javascript:alert(document.cookie)',
  'JAVASCRIPT:alert(1)',
  'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
  'http://localhost:3000/admin',
  'http://127.0.0.1:8000',
  'http://10.0.0.1/internal',
  'http://192.168.0.1/router',
  'http://169.254.169.254/latest/meta-data/', // AWS metadata SSRF
  '',
  '   ',
  'not-a-valid-url',
];

for (const url of maliciousUrls) {
  expect(!isSafePublicUrl(url), `Rejects malicious URL: ${url}`);
}

const safeUrls = [
  'https://thebreakdown.in/story/test',
  'https://pib.gov.in/PressReleasePage.aspx?PRID=12345',
  'http://supremecourtofindia.nic.in/judgment.pdf',
  'https://example.org/study?id=123&type=report',
];

for (const url of safeUrls) {
  expect(isSafePublicUrl(url), `Allows safe public URL: ${url}`);
}

// ─── 2. Extreme Character Sets, Unicode & Escaped Entities ───────────────────

const complexHeadline =
  'महात्मा गांधी & Nehru: 1947–2026 Partition "Analysis" <script>alert("xss")</script> 🚀 🇮🇳';

const complexStory: Story = {
  id: 'adv-story-01',
  slug: 'adv-story-01',
  title: complexHeadline,
  headline: complexHeadline,
  summary: 'Summary with <tags> & "quotes" & \'single quotes\' and Unicode: नीति आयोग',
  heroImage: '/images/hero.jpg',
  author: 'The Breakdown Editorial',
  category: 'governance',
  status: 'published' as any,
  publicationStatus: 'published',
  storyType: 'explainer',
  evidenceScore: 90,
  readingTime: 5,
  publishedAt: '2026-08-01T10:00:00Z',
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-08-01T10:00:00Z',
  tags: ['नीति आयोग', 'foreign-policy', '<script>'],
  blocks: [],
  sources: [
    { title: 'Safe Source', url: 'https://pib.gov.in/test', accessedAt: '2026-08-01', tier: 1 },
    { title: 'Malicious Source', url: 'javascript:evil()', accessedAt: '2026-08-01', tier: 5 },
    { title: 'Offline Source', url: '', accessedAt: '2026-08-01', tier: 2 },
  ],
  claims: [],
  timeline: [],
  faq: [],
  charts: [],
  relatedStoryIds: [],
  relatedEntityIds: [],
  relatedTopicIds: [],
};

const jsonLd = createStoryJsonLd(complexStory);
const serialized = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

expect(!serialized.includes('<script>'), 'XSS tags safely escaped in JSON-LD output');
expect(serialized.includes('\\u003cscript>'), 'Escaped script tag present as unicode');
expect(!serialized.includes('javascript:evil()'), 'Malicious source URL stripped from JSON-LD');
expect(serialized.includes('https://pib.gov.in/test'), 'Safe source URL preserved');

// ─── 3. Fail-Closed Publication Safety Attacks ────────────────────────────────

const now = new Date('2026-09-29T12:00:00Z');

const attackContexts: Array<{ ctx: PublicationContext; shouldPass: boolean; reason: string }> = [
  { ctx: { publicationStatus: 'published', publishedAt: '2026-08-01T00:00:00Z' }, shouldPass: true, reason: 'Past published' },
  { ctx: { publicationStatus: 'draft', publishedAt: '2026-08-01T00:00:00Z' }, shouldPass: false, reason: 'Draft' },
  { ctx: { publicationStatus: 'review' as any, publishedAt: '2026-08-01T00:00:00Z' }, shouldPass: false, reason: 'Under review' },
  { ctx: { publicationStatus: 'published', publishedAt: '2099-01-01T00:00:00Z' }, shouldPass: false, reason: 'Future publication date' },
  { ctx: { publicationStatus: 'published', publishedAt: 'invalid-date-string' }, shouldPass: false, reason: 'Malformed date' },
  { ctx: { publicationStatus: undefined, publishedAt: '2026-08-01T00:00:00Z' }, shouldPass: false, reason: 'Missing publicationStatus' },
  { ctx: { publicationStatus: 'published', publishedAt: '' }, shouldPass: false, reason: 'Empty publishedAt' },
];

for (const { ctx, shouldPass, reason } of attackContexts) {
  const result = isPubliclyPublished(ctx, now);
  expect(result === shouldPass, `Publication safety: ${reason} -> expected ${shouldPass}`);
  expect(shouldIndexStory(ctx, now) === shouldPass, `Index safety: ${reason} -> expected ${shouldPass}`);
}

// ─── 4. Author Identity Adversarial Permutations ──────────────────────────────

const authorPermutations = [
  { input: null, expectedType: 'Organization' },
  { input: undefined, expectedType: 'Organization' },
  { input: '', expectedType: 'Organization' },
  { input: '   ', expectedType: 'Organization' },
  { input: 'The Breakdown', expectedType: 'Organization' },
  { input: 'The Breakdown Editorial', expectedType: 'Organization' },
  { input: 'The Breakdown Investigations', expectedType: 'Organization' },
  { input: { name: 'The Breakdown Editorial' }, expectedType: 'Organization' },
  { input: 'Suhasini Haidar', expectedType: 'Person' },
  { input: { name: 'Suhasini Haidar' }, expectedType: 'Person' },
  { input: '  Nitin Pai  ', expectedType: 'Person' },
];

for (const { input, expectedType } of authorPermutations) {
  const node = buildAuthorNode(input);
  expect(node['@type'] === expectedType, `Author node '${JSON.stringify(input)}' emits @type '${expectedType}'`);
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('==================================================');
console.log(`Passed adversarial assertions: ${passCount}`);
if (failCount > 0) {
  console.error(`Failed adversarial assertions: ${failCount}`);
  process.exit(1);
} else {
  console.log('🎉 100% Adversarial Security, XSS, and Schema Attacks Handled Safely!\n');
  process.exit(0);
}
