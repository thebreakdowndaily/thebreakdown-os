import fs from 'node:fs';
import path from 'node:path';
import { getPublicStories, getStory } from '../utils/data-layer/store';
import { resolveStory } from '../lib/story/resolver';
import { isCanonicalStoryPublic } from '../lib/story/publication';

interface RelatedAuditRow {
  story_slug: string;
  category: string;
  related_slug: string;
  related_headline: string;
  is_public: boolean;
  is_self_reference: boolean;
  relevance_basis: string;
  notes: string;
}

async function auditRelatedStories() {
  const publicStories = getPublicStories({ pageSize: 1000 }).data;
  const results: RelatedAuditRow[] = [];

  for (const story of publicStories) {
    const resolution = await resolveStory(story.slug);
    const relatedList = resolution.type !== 'not_found' ? resolution.relatedStories : [];

    if (!relatedList || relatedList.length === 0) {
      results.push({
        story_slug: story.slug,
        category: story.category || 'unknown',
        related_slug: 'NONE',
        related_headline: 'N/A',
        is_public: false,
        is_self_reference: false,
        relevance_basis: 'NONE',
        notes: 'DEAD_END: No related stories recommended',
      });
      continue;
    }

    const seenSlugs = new Set<string>();
    for (const rel of relatedList) {
      const isPublic = isCanonicalStoryPublic(rel);
      const isSelf = rel.slug === story.slug;
      const isDup = seenSlugs.has(rel.slug);
      seenSlugs.add(rel.slug);

      // Determine relevance basis
      const sharedTopics = (story.relatedTopicIds || []).filter(t => (rel.relatedTopicIds || []).includes(t));
      const sharedCategory = story.category === rel.category;
      let relevance = 'GENERIC';
      if (sharedTopics.length > 0) relevance = `SHARED_TOPIC (${sharedTopics.join(';')})`;
      else if (sharedCategory) relevance = `SHARED_CATEGORY (${story.category})`;

      let notes = 'OK';
      if (!isPublic) notes = 'UNPUBLISHED_STORY';
      else if (isSelf) notes = 'CIRCULAR_SELF_REFERENCE';
      else if (isDup) notes = 'DUPLICATE_RECOMMENDATION';

      results.push({
        story_slug: story.slug,
        category: story.category || 'unknown',
        related_slug: rel.slug,
        related_headline: rel.headline || rel.title || 'Untitled',
        is_public: isPublic,
        is_self_reference: isSelf,
        relevance_basis: relevance,
        notes,
      });
    }
  }

  const csvHeader = 'story_slug,category,related_slug,related_headline,is_public,is_self_reference,relevance_basis,notes\n';
  const csvRows = results.map(r => 
    `"${r.story_slug}","${r.category}","${r.related_slug}","${r.related_headline.replace(/"/g, '""')}",${r.is_public},${r.is_self_reference},"${r.relevance_basis}","${r.notes}"`
  ).join('\n');

  fs.writeFileSync(path.join(process.cwd(), 'LOOP_RELATED_STORY_AUDIT.csv'), csvHeader + csvRows);

  console.log(`Related stories audit complete. Processed ${publicStories.length} public stories.`);
  const deadEnds = results.filter(r => r.notes.startsWith('DEAD_END'));
  const issues = results.filter(r => r.notes !== 'OK' && !r.notes.startsWith('DEAD_END'));
  console.log(`Dead ends (0 related stories): ${deadEnds.length}`);
  console.log(`Recommendation issues: ${issues.length}`);
  if (deadEnds.length > 0) {
    console.log('Sample dead end stories:', deadEnds.map(d => d.story_slug));
  }
  if (issues.length > 0) {
    console.log('Sample issues:', issues);
  }
}

auditRelatedStories().catch(console.error);
