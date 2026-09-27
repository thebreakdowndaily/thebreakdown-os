import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { getPublicStories } from './utils/data-layer/store';
import { VERIFIED_STORY_IMAGE_MANIFEST } from './lib/image-intelligence/manifest';

function walk(dir: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

export async function runVisualValidationTests() {
  console.log('========================================================================');
  console.log('THE BREAKDOWN — SITE-WIDE VISUAL VALIDATION TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  FAIL: ${name}`);
      console.error(`        ${err.message}`);
      failed++;
    }
  }

  const publicFiles = walk('public');
  const imageFiles = publicFiles.filter((f) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f));

  // 1. Zero 0-byte image files
  test('Zero 0-byte image files in public directory', () => {
    for (const f of imageFiles) {
      const size = fs.statSync(f).size;
      assert.ok(size > 0, `File ${f} must not be 0 bytes`);
    }
  });

  // 2. No HTML error files disguised as images
  test('No HTML error documents disguised as images', () => {
    for (const f of imageFiles) {
      const buf = fs.readFileSync(f);
      const head = buf.slice(0, 30).toString('utf8');
      assert.ok(!head.includes('<!DOCTYPE') && !head.includes('<html'), `File ${f} must not be an HTML document`);
    }
  });

  // 3. JPEG magic bytes match extension
  test('All JPEG files start with valid JPEG magic bytes (FF D8)', () => {
    const jpegs = imageFiles.filter((f) => /\.(jpg|jpeg)$/i.test(f));
    for (const f of jpegs) {
      const buf = fs.readFileSync(f);
      assert.strictEqual(buf[0], 0xff, `File ${f} byte 0 must be 0xFF`);
      assert.strictEqual(buf[1], 0xd8, `File ${f} byte 1 must be 0xD8`);
    }
  });

  // 4. PNG magic bytes match extension
  test('All PNG files start with valid PNG magic bytes (89 50 4E 47)', () => {
    const pngs = imageFiles.filter((f) => /\.png$/i.test(f));
    for (const f of pngs) {
      const buf = fs.readFileSync(f);
      assert.strictEqual(buf.slice(0, 4).toString('hex'), '89504e47', `File ${f} must have PNG header`);
    }
  });

  // 5. WebP magic bytes match extension
  test('All WebP files start with valid WebP magic bytes (RIFF...WEBP)', () => {
    const webps = imageFiles.filter((f) => /\.webp$/i.test(f));
    for (const f of webps) {
      const buf = fs.readFileSync(f);
      assert.strictEqual(buf.slice(0, 4).toString('utf8'), 'RIFF', `File ${f} must start with RIFF`);
      assert.strictEqual(buf.slice(8, 12).toString('utf8'), 'WEBP', `File ${f} must contain WEBP marker`);
    }
  });

  // 6. SVG security: Zero <script> tags or executable payloads
  test('All SVG files are secure: zero <script> tags and zero external HTTP refs', () => {
    const svgs = imageFiles.filter((f) => /\.svg$/i.test(f));
    for (const f of svgs) {
      const txt = fs.readFileSync(f, 'utf8');
      assert.ok(!/<script/i.test(txt), `SVG ${f} must not contain <script> tags`);
      assert.ok(!/href=["']https?:\/\//i.test(txt), `SVG ${f} must not link to external HTTP resources`);
    }
  });

  // 7. Public story hero image integrity
  test('Every public story hero image exists on disk and is non-empty', () => {
    const stories = getPublicStories({ pageSize: 1000 }).data;
    for (const story of stories) {
      assert.ok(story.heroImage, `Story ${story.slug} must have a defined heroImage`);
      const heroImg = story.heroImage as string;
      const p = path.join(process.cwd(), 'public', heroImg.startsWith('/') ? heroImg.slice(1) : heroImg);
      assert.ok(fs.existsSync(p), `Hero image for ${story.slug} must exist at ${p}`);
      assert.ok(fs.statSync(p).size > 0, `Hero image for ${story.slug} must not be 0 bytes`);
    }
  });

  // 8. Verified Image Manifest Conformance
  test('All manifest entries point to valid files on disk', () => {
    for (const [slug, record] of Object.entries(VERIFIED_STORY_IMAGE_MANIFEST)) {
      const p = path.join(process.cwd(), 'public', record.approvedImage.startsWith('/') ? record.approvedImage.slice(1) : record.approvedImage);
      assert.ok(fs.existsSync(p), `Manifest image for ${slug} must exist at ${p}`);
      assert.ok(fs.statSync(p).size > 0, `Manifest image for ${slug} must not be 0 bytes`);
    }
  });

  // 9. Historical Maps Integrity
  test('All 7 historical chapter-1 maps exist, have valid viewBox, and are non-empty', () => {
    const mapNames = [
      'map-british-india-1939.svg',
      'map-cabinet-mission-1946.svg',
      'map-demography-1941.svg',
      'map-kashmir-1947.svg',
      'map-migration-flows-1947.svg',
      'map-princely-states.svg',
      'map-radcliffe-line.svg',
    ];
    for (const name of mapNames) {
      const p = path.join(process.cwd(), 'public/images/library/chapter-1/maps', name);
      assert.ok(fs.existsSync(p), `Map ${name} must exist`);
      const txt = fs.readFileSync(p, 'utf8');
      assert.ok(/viewBox=["'][^"']+["']/i.test(txt), `Map ${name} must have a viewBox`);
    }
  });

  // 10. Performance budget: No image exceeds 500KB
  test('All images conform to maximum file size performance budget (<500KB)', () => {
    for (const f of imageFiles) {
      const size = fs.statSync(f).size;
      assert.ok(size < 500 * 1024, `Image ${f} exceeds 500KB budget: ${size} bytes`);
    }
  });

  console.log(`\nSite-Wide Visual Validation Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    throw new Error(`${failed} visual validation test(s) failed`);
  }
}

if (require.main === module || process.argv[1]?.endsWith('LOOP_VISUAL_VALIDATION.test.ts')) {
  runVisualValidationTests().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
