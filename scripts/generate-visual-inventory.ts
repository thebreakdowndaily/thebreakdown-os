import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getStories, getTopics, getEntities } from '../utils/data-layer/store';
import { VERIFIED_STORY_IMAGE_MANIFEST } from '../lib/image-intelligence/manifest';
import { getAllTrackers } from '../lib/trackers/registry';

interface AssetRecord {
  asset_id: string;
  path: string;
  asset_type: string;
  referenced_by: string;
  route: string;
  section: string;
  width: number | string;
  height: number | string;
  aspect_ratio: string;
  format: string;
  file_size: number;
  source: string;
  provenance: string;
  license_status: string;
  editorial_role: 'DOCUMENTARY' | 'EXPLANATORY' | 'DATA' | 'MAP' | 'TIMELINE' | 'DIAGRAM' | 'DECORATIVE' | 'HERO' | 'SOCIAL' | 'PLACEHOLDER';
  placeholder: boolean;
  responsive_variant: boolean;
  og_usage: boolean;
  status: string;
}

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

function parseSvgDimensions(content: string): { width: number; height: number } {
  const vbMatch = content.match(/viewBox=["']([0-9.\s-]+)["']/i);
  if (vbMatch) {
    const parts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: Math.round(parts[2]), height: Math.round(parts[3]) };
    }
  }
  const wMatch = content.match(/width=["']([0-9.]+)(px)?["']/i);
  const hMatch = content.match(/height=["']([0-9.]+)(px)?["']/i);
  if (wMatch && hMatch) {
    return { width: Math.round(Number(wMatch[1])), height: Math.round(Number(hMatch[1])) };
  }
  return { width: 0, height: 0 };
}

async function main() {
  const allStories = getStories({ pageSize: 1000 }).data;
  const allTopics = getTopics({ pageSize: 1000 }).data;
  const allEntities = getEntities({ pageSize: 1000 }).data;
  const allTrackers = getAllTrackers();

  const publicFiles = walk('public').filter(f => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f));
  const records: AssetRecord[] = [];

  for (const filepath of publicFiles) {
    const relPath = '/' + path.relative('public', filepath).replace(/\\/g, '/');
    const assetId = path.basename(filepath, path.extname(filepath));
    const stat = fs.statSync(filepath);
    const fileSize = stat.size;
    const ext = path.extname(filepath).toLowerCase().replace('.', '');

    let width = 0;
    let height = 0;
    let format = ext;

    if (ext === 'svg') {
      const content = fs.readFileSync(filepath, 'utf8');
      const dims = parseSvgDimensions(content);
      width = dims.width;
      height = dims.height;
    } else {
      try {
        const meta = await sharp(filepath).metadata();
        width = meta.width || 0;
        height = meta.height || 0;
        format = meta.format || ext;
      } catch (err) {
        width = 0;
        height = 0;
      }
    }

    const aspect = (width > 0 && height > 0) ? (width / height).toFixed(2) : 'vector';

    // Check usage across system
    const refByList: string[] = [];
    const routeList: string[] = [];
    const sectionList: string[] = [];
    let isOg = false;

    // Check stories
    for (const story of allStories) {
      if (story.heroImage === relPath) {
        refByList.push(`story:${story.slug}`);
        routeList.push(`/story/${story.slug}`);
        sectionList.push('hero');
        isOg = true;
      }
    }

    // Check topics
    for (const topic of allTopics) {
      if (topic.image === relPath) {
        refByList.push(`topic:${topic.slug}`);
        routeList.push(`/topic/${topic.slug}`);
        sectionList.push('topic_header');
      }
    }

    // Check entities
    for (const ent of allEntities) {
      if (ent.image === relPath) {
        refByList.push(`entity:${ent.slug}`);
        routeList.push(`/entity/${ent.slug}`);
        sectionList.push('entity_avatar');
      }
    }

    // Check manifest
    for (const [mSlug, mRecord] of Object.entries(VERIFIED_STORY_IMAGE_MANIFEST)) {
      if (mRecord.approvedImage === relPath) {
        if (!refByList.includes(`manifest:${mSlug}`)) {
          refByList.push(`manifest:${mSlug}`);
        }
      }
    }

    // Check site-wide OG
    if (relPath.includes('og-')) {
      isOg = true;
      refByList.push('metadata:site_og');
      routeList.push('site-wide');
      sectionList.push('social_meta');
    }

    // Check logo
    if (relPath === '/logo.svg') {
      refByList.push('layout:Header', 'layout:Footer');
      routeList.push('site-wide');
      sectionList.push('masthead');
    }

    // Editorial Role Classification
    let role: AssetRecord['editorial_role'] = 'DECORATIVE';
    const isPlaceholder = relPath.includes('/placeholders/');
    const isResponsive = relPath.includes('-mobile') || relPath.includes('-og') || relPath.endsWith('.webp');

    if (isPlaceholder) {
      role = 'PLACEHOLDER';
    } else if (relPath.includes('/maps/')) {
      role = 'MAP';
    } else if (relPath.includes('/charts/')) {
      role = 'DATA';
    } else if (relPath.includes('/diagrams/') || relPath.includes('/flows/')) {
      role = 'DIAGRAM';
    } else if (relPath.includes('/documents/') || relPath.includes('/photos/') || relPath.includes('/supplementary/')) {
      role = 'DOCUMENTARY';
    } else if (relPath.includes('og-') || relPath.includes('-og.')) {
      role = 'SOCIAL';
    } else if (relPath.includes('/stories/')) {
      role = 'HERO';
    } else if (relPath.includes('/topics/')) {
      role = 'EXPLANATORY';
    } else if (relPath.includes('/entities/')) {
      role = 'DOCUMENTARY';
    } else if (relPath === '/logo.svg') {
      role = 'DECORATIVE';
    }

    // Provenance & License
    let source = 'The Breakdown Platform';
    let provenance = 'The Breakdown Institutional Assets';
    let license = 'INTERNAL_BRAND';
    let status = 'VERIFIED';

    if (isPlaceholder) {
      source = 'The Breakdown Design System';
      provenance = 'Editorial vector design language';
      license = 'BRANDED_VECTOR';
    } else if (relPath.includes('accountability-in-india')) {
      source = 'The Breakdown Editorial Graphics';
      provenance = 'Bespoke accountability hero package (Anamika Singh, 27 Sept 2026)';
      license = 'EDITORIAL';
    } else if (relPath.includes('/maps/')) {
      source = 'Historical Cartography / Survey of India Archives';
      provenance = 'Vector digitized from boundary treaties and 1947 partition records';
      license = 'PUBLIC_DOMAIN';
    } else if (relPath.includes('/entities/')) {
      source = 'Institutional Archive / Official Seal';
      provenance = 'Official government agency identity / statutory body press release';
      license = 'PUBLIC_DOMAIN';
    } else if (relPath.includes('/topics/')) {
      source = 'National Archives / Ministry Portals';
      provenance = 'Editorial theme photography from public domain archives';
      license = 'EDITORIAL';
    } else if (relPath.includes('/stories/')) {
      source = 'Official Departmental Records & Verified Editorial Archives';
      provenance = 'Verified newsroom and primary statutory sources';
      license = 'EDITORIAL';
    }

    // Determine Asset Type
    let assetType = 'raster';
    if (ext === 'svg') assetType = 'vector_svg';
    else if (ext === 'webp') assetType = 'raster_webp';
    else if (ext === 'jpg' || ext === 'jpeg') assetType = 'raster_jpeg';
    else if (ext === 'png') assetType = 'raster_png';

    records.push({
      asset_id: assetId,
      path: relPath,
      asset_type: assetType,
      referenced_by: refByList.length > 0 ? refByList.join(';') : 'unreferenced_static_asset',
      route: routeList.length > 0 ? routeList.join(';') : 'none',
      section: sectionList.length > 0 ? sectionList.join(';') : 'static_directory',
      width,
      height,
      aspect_ratio: aspect,
      format,
      file_size: fileSize,
      source,
      provenance,
      license_status: license,
      editorial_role: role,
      placeholder: isPlaceholder,
      responsive_variant: isResponsive,
      og_usage: isOg,
      status,
    });
  }

  // Convert to CSV
  const headers = [
    'asset_id', 'path', 'asset_type', 'referenced_by', 'route', 'section',
    'width', 'height', 'aspect_ratio', 'format', 'file_size', 'source',
    'provenance', 'license_status', 'editorial_role', 'placeholder',
    'responsive_variant', 'og_usage', 'status'
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

  fs.writeFileSync('LOOP_VISUAL_INVENTORY.csv', csvRows.join('\n'));
  console.log(`Successfully generated LOOP_VISUAL_INVENTORY.csv with ${records.length} records.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
