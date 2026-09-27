import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getPublicStories } from '../utils/data-layer/store';
import { VERIFIED_STORY_IMAGE_MANIFEST } from '../lib/image-intelligence/manifest';

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

describe('Loop 04 Site-Wide Visual Validation Test Suite', () => {
  const publicFiles = walk(path.join(process.cwd(), 'public'));
  const imageFiles = publicFiles.filter((f) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f));

  it('ensures zero 0-byte image files exist in public directory', () => {
    for (const f of imageFiles) {
      const size = fs.statSync(f).size;
      expect(size, `File ${f} must not be 0 bytes`).toBeGreaterThan(0);
    }
  });

  it('ensures no HTML error documents are disguised as image files', () => {
    for (const f of imageFiles) {
      const buf = fs.readFileSync(f);
      const head = buf.slice(0, 30).toString('utf8');
      expect(head.includes('<!DOCTYPE') || head.includes('<html'), `File ${f} must not be an HTML document`).toBe(false);
    }
  });

  it('ensures all JPEG files start with valid JPEG magic bytes (FF D8)', () => {
    const jpegs = imageFiles.filter((f) => /\.(jpg|jpeg)$/i.test(f));
    for (const f of jpegs) {
      const buf = fs.readFileSync(f);
      expect(buf[0], `File ${f} byte 0 must be 0xFF`).toBe(0xff);
      expect(buf[1], `File ${f} byte 1 must be 0xD8`).toBe(0xd8);
    }
  });

  it('ensures all PNG files start with valid PNG magic bytes (89 50 4E 47)', () => {
    const pngs = imageFiles.filter((f) => /\.png$/i.test(f));
    for (const f of pngs) {
      const buf = fs.readFileSync(f);
      expect(buf.slice(0, 4).toString('hex'), `File ${f} must have PNG header`).toBe('89504e47');
    }
  });

  it('ensures all WebP files start with valid WebP magic bytes (RIFF...WEBP)', () => {
    const webps = imageFiles.filter((f) => /\.webp$/i.test(f));
    for (const f of webps) {
      const buf = fs.readFileSync(f);
      expect(buf.slice(0, 4).toString('utf8'), `File ${f} must start with RIFF`).toBe('RIFF');
      expect(buf.slice(8, 12).toString('utf8'), `File ${f} must contain WEBP marker`).toBe('WEBP');
    }
  });

  it('ensures all SVG files are secure: zero <script> tags and zero external HTTP refs', () => {
    const svgs = imageFiles.filter((f) => /\.svg$/i.test(f));
    for (const f of svgs) {
      const txt = fs.readFileSync(f, 'utf8');
      expect(/<script/i.test(txt), `SVG ${f} must not contain <script> tags`).toBe(false);
      expect(/href=["']https?:\/\//i.test(txt), `SVG ${f} must not link to external HTTP resources`).toBe(false);
    }
  });

  it('ensures every public story hero image exists on disk and is non-empty', () => {
    const stories = getPublicStories({ pageSize: 1000 }).data;
    for (const story of stories) {
      expect(story.heroImage, `Story ${story.slug} must have a defined heroImage`).toBeDefined();
      const heroImg = story.heroImage as string;
      const p = path.join(process.cwd(), 'public', heroImg.startsWith('/') ? heroImg.slice(1) : heroImg);
      expect(fs.existsSync(p), `Hero image for ${story.slug} must exist at ${p}`).toBe(true);
      expect(fs.statSync(p).size, `Hero image for ${story.slug} must not be 0 bytes`).toBeGreaterThan(0);
    }
  });

  it('ensures all manifest entries point to valid files on disk', () => {
    for (const [slug, record] of Object.entries(VERIFIED_STORY_IMAGE_MANIFEST)) {
      const p = path.join(process.cwd(), 'public', record.approvedImage.startsWith('/') ? record.approvedImage.slice(1) : record.approvedImage);
      expect(fs.existsSync(p), `Manifest image for ${slug} must exist at ${p}`).toBe(true);
      expect(fs.statSync(p).size, `Manifest image for ${slug} must not be 0 bytes`).toBeGreaterThan(0);
    }
  });

  it('ensures all 7 historical chapter-1 maps exist, have valid viewBox, and are non-empty', () => {
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
      expect(fs.existsSync(p), `Map ${name} must exist`).toBe(true);
      const txt = fs.readFileSync(p, 'utf8');
      expect(/viewBox=["'][^"']+["']/i.test(txt), `Map ${name} must have a viewBox`).toBe(true);
    }
  });

  it('ensures all images conform to maximum file size performance budget (<500KB)', () => {
    for (const f of imageFiles) {
      const size = fs.statSync(f).size;
      expect(size, `Image ${f} exceeds 500KB budget: ${size} bytes`).toBeLessThan(500 * 1024);
    }
  });
});
