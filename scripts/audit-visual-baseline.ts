import fs from 'fs';
import path from 'path';
import { getPublicStories, getStories, getTopics, getEntities, getTimelines, getOrganizations } from '../utils/data-layer/store';
import { VERIFIED_STORY_IMAGE_MANIFEST } from '../lib/image-intelligence/manifest';
import { getAllTrackers } from '../lib/trackers/registry';

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

const pubFiles = walk('public');
const imgFiles = pubFiles.filter(f => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f));
const svgFiles = pubFiles.filter(f => /\.svg$/i.test(f));
const placeholderFiles = pubFiles.filter(f => f.includes('placeholder') && /\.(svg|png|jpg)$/i.test(f));
const mapFiles = pubFiles.filter(f => f.toLowerCase().includes('map'));

const allStories = getStories({ pageSize: 1000 }).data;
const publicStories = getPublicStories({ pageSize: 1000 }).data;
const topics = getTopics({ pageSize: 1000 }).data;
const entities = getEntities({ pageSize: 1000 }).data;
const timelines = getTimelines({ pageSize: 1000 }).data;
const manifestKeys = Object.keys(VERIFIED_STORY_IMAGE_MANIFEST);

const allTrackers = getAllTrackers();

// Inspect tracker time series charts
let trackerChartCount = 0;
for (const t of allTrackers) {
  if (t.timeSeries) trackerChartCount++;
}

console.log('=== VISUAL AUDIT BASELINE COUNTS ===');
console.log('Total Stories (All):', allStories.length);
console.log('Public Stories:', publicStories.length);
console.log('Quarantined Draft Stories:', allStories.length - publicStories.length);
console.log('Topics:', topics.length);
console.log('Entities:', entities.length);
console.log('Timelines:', timelines.length);
console.log('Trackers:', allTrackers.length);
console.log('Tracker Time Series Charts:', trackerChartCount);
console.log('Manifest Entries:', manifestKeys.length);
console.log('Total Static Image Assets in public/:', imgFiles.length);
console.log('Total SVGs in public/:', svgFiles.length);
console.log('Total Placeholders in public/:', placeholderFiles.length);
console.log('Total Map Files in public/:', mapFiles.length);
