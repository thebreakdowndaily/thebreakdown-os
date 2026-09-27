import fs from 'node:fs';
import path from 'node:path';
import { getPublicStories } from '../utils/data-layer/store';
import { buildStoryPresentationModel } from '../lib/story/presentation-model';
import { applyReadingModePolicy } from '../lib/story/reading-mode-policy';

interface TocAuditRow {
  story_slug: string;
  mode: string;
  toc_item_id: string;
  toc_label: string;
  target_exists: boolean;
  duplicate_id: boolean;
  notes: string;
}

const stories = getPublicStories({ pageSize: 1000 }).data;
const modes = ['standard', 'quick', 'deep'] as const;

const results: TocAuditRow[] = [];

for (const story of stories) {
  for (const mode of modes) {
    const model = buildStoryPresentationModel(story);
    const visible = applyReadingModePolicy(model, mode);

    const validIds = new Set<string>();
    if (mode === 'quick') {
      if (visible.quickBrief) {
        validIds.add('quick-brief');
        if (visible.quickBrief.keyFindings) validIds.add('key-findings');
        if (visible.quickBrief.essentialSources) validIds.add('essential-sources');
      }
    } else {
      if (visible.orientation) {
        const o = visible.orientation;
        if (o.centralFinding || (o.keyTakeaways && o.keyTakeaways.length > 0) || (o.keyNumbers && o.keyNumbers.length > 0) || o.whyItMatters) {
          validIds.add('orientation');
        }
      }
      for (const ch of visible.chapters) {
        validIds.add(ch.id);
      }
      const hasInlineTimeline = visible.chapters.some((ch) =>
        ch.blocks.some((b: any) => b.type === 'timeline')
      );
      if (visible.showTimeline && !hasInlineTimeline && visible.timeline && visible.timeline.events.length > 0) {
        validIds.add('timeline');
      }
      if (visible.showResearchAppendix && visible.research) {
        const r = visible.research;
        if ((r.claims && r.claims.length > 0) || (r.sources && r.sources.length > 0) || (r.faq && r.faq.length > 0)) {
          validIds.add('research-appendix');
        }
      }
      if (visible.showRelatedStories && visible.relatedStories && visible.relatedStories.length > 0) {
        validIds.add('continue-exploring');
      }
    }

    const seenIds = new Set<string>();
    for (const item of visible.toc) {
      const isDup = seenIds.has(item.id);
      seenIds.add(item.id);
      const exists = validIds.has(item.id);
      results.push({
        story_slug: story.slug,
        mode,
        toc_item_id: item.id,
        toc_label: item.label,
        target_exists: exists,
        duplicate_id: isDup,
        notes: !exists ? `Target #${item.id} not rendered in DOM` : (isDup ? 'Duplicate ID in TOC' : 'OK')
      });
    }
  }
}

const csvHeader = 'story_slug,mode,toc_item_id,toc_label,target_exists,duplicate_id,notes\n';
const csvRows = results.map(r => `"${r.story_slug}","${r.mode}","${r.toc_item_id}","${r.toc_label.replace(/"/g, '""')}",${r.target_exists},${r.duplicate_id},"${r.notes}"`).join('\n');

fs.writeFileSync(path.join(process.cwd(), 'LOOP_TOC_INTEGRITY.csv'), csvHeader + csvRows);

const failures = results.filter(r => !r.target_exists || r.duplicate_id);
console.log(`TOC Audit complete. Total items: ${results.length}, Failures: ${failures.length}`);
if (failures.length > 0) {
  console.log('Sample failures:', failures.slice(0, 5));
}
