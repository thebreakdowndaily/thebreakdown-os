import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getPublicStories } from '../utils/data-layer/store';
import { VERIFIED_STORY_IMAGE_MANIFEST } from '../lib/image-intelligence/manifest';
import { resolveStoryHeroImage } from '../lib/image-intelligence/service';

interface HeroAuditRecord {
  story: string;
  current_hero: string;
  role: string;
  source: string;
  provenance: string;
  relevance: string;
  mobile: string;
  og: string;
  performance: string;
  recommendation: 'KEEP' | 'REPLACE' | 'OPTIMIZE' | 'INVESTIGATE' | 'REMOVE';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

async function main() {
  const publicStories = getPublicStories({ pageSize: 1000 }).data;
  const records: HeroAuditRecord[] = [];

  for (const story of publicStories) {
    const heroPath = story.heroImage;
    const fullPath = path.join(process.cwd(), 'public', heroPath.startsWith('/') ? heroPath.slice(1) : heroPath);
    const exists = fs.existsSync(fullPath);
    
    let fileSize = 0;
    let width = 0;
    let height = 0;
    let format = 'unknown';

    if (exists) {
      fileSize = fs.statSync(fullPath).size;
      const ext = path.extname(fullPath).toLowerCase();
      if (ext === '.svg') {
        format = 'svg';
        width = 1200;
        height = 630;
      } else {
        try {
          const meta = await sharp(fullPath).metadata();
          width = meta.width || 0;
          height = meta.height || 0;
          format = meta.format || ext.replace('.', '');
        } catch {
          format = 'corrupt';
        }
      }
    }

    const manifestEntry = VERIFIED_STORY_IMAGE_MANIFEST[story.slug];
    const isPlaceholder = heroPath.includes('/placeholders/');
    const resolved = resolveStoryHeroImage(story as any);

    // Evaluate relevance
    let relevance = 'ESSENTIAL';
    let role = 'HERO';
    let source = manifestEntry ? manifestEntry.provenance : 'The Breakdown Editorial Library';
    let provenance = manifestEntry ? manifestEntry.description : 'Standard editorial image';
    let recommendation: HeroAuditRecord['recommendation'] = 'KEEP';
    let priority: HeroAuditRecord['priority'] = 'P3';

    if (isPlaceholder) {
      relevance = 'PLACEHOLDER';
      role = 'PLACEHOLDER';
      recommendation = 'KEEP'; // Standard branded placeholder when authentic photo not yet commissioned
      priority = 'P3';
    } else if (story.slug === 'accountability-in-india') {
      relevance = 'ESSENTIAL';
      role = 'HERO';
      source = 'The Breakdown Editorial Graphics';
      provenance = 'Bespoke accountability hero package (Anamika Singh, 27 Sept 2026)';
      recommendation = 'KEEP';
      priority = 'P3';
    } else if (heroPath.includes('/topics/')) {
      relevance = 'USEFUL';
      role = 'EXPLANATORY';
      recommendation = 'OPTIMIZE'; // Uses generic topic photo, could be upgraded to story-specific in future
      priority = 'P3';
    }

    // Mobile & Performance
    const mobileStatus = width >= 768 || format === 'svg' ? 'RESPONSIVE_PASS' : 'SUBOPTIMAL';
    const ogStatus = heroPath.endsWith('.jpg') || heroPath.endsWith('.png') ? 'OG_COMPATIBLE' : 'SVG_FALLBACK';
    const perfStatus = fileSize < 200000 ? 'OPTIMAL' : 'OVERSIZED';

    records.push({
      story: story.slug,
      current_hero: heroPath,
      role,
      source,
      provenance,
      relevance,
      mobile: mobileStatus,
      og: ogStatus,
      performance: `${Math.round(fileSize / 1024)}KB (${perfStatus})`,
      recommendation,
      priority,
    });
  }

  // Convert to CSV
  const headers = [
    'story', 'current_hero', 'role', 'source', 'provenance',
    'relevance', 'mobile', 'og', 'performance', 'recommendation', 'priority'
  ];

  const escapeCsv = (val: any) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csvRows = [headers.join(',')];
  for (const r of records) {
    const row = headers.map(h => escapeCsv((r as any)[h]));
    csvRows.push(row.join(','));
  }

  fs.writeFileSync('LOOP_HERO_AUDIT.csv', csvRows.join('\n'));
  console.log(`Generated LOOP_HERO_AUDIT.csv with ${records.length} story hero records.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
