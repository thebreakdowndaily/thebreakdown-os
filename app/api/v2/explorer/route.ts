import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/services/bootstrap';
import { KnowledgeExplorerResultItem, ExplorerSearchResponse, DiscoveryMode, ExplorerResultType, ClaimResult, SourceResult, EvidenceResult } from '@/types/explorer';
import type { Story, Claim, Source, StoryBlock } from '@/types/canonical';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').toLowerCase();
  const mode = (url.searchParams.get('mode') || 'all') as DiscoveryMode;
  const typeFilter = (url.searchParams.get('type') || '') as ExplorerResultType | '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

  if (!q) {
    return NextResponse.json({
      data: [],
      meta: { total: 0, page, pageSize, totalPages: 0, mode, typeCounts: {} }
    } as ExplorerSearchResponse);
  }

  const services = await bootstrapServices();

  const [storiesRes, topicsRes, entitiesRes, timelinesRes] = await Promise.all([
    services.stories.getStories({ pageSize: 1000 }).catch(() => ({ data: [] })),
    services.topics.getTopics({ pageSize: 1000 }).catch(() => ({ data: [] })),
    services.entities.getEntities({ pageSize: 1000 }).catch(() => ({ data: [] })),
    services.timelines.getTimelines({ pageSize: 1000 }).catch(() => ({ data: [] }))
  ]);

  const stories = storiesRes.data || [];
  const topics = topicsRes.data || [];
  const entities = entitiesRes.data || [];
  const timelines = timelinesRes.data || [];

  let allResults: KnowledgeExplorerResultItem[] = [];

  // Match Stories
  for (const story of stories) {
    if (
      story.title.toLowerCase().includes(q) ||
      story.summary.toLowerCase().includes(q) ||
      story.blocks.some(b => JSON.stringify(b.data).toLowerCase().includes(q))
    ) {
      allResults.push({
        id: story.id,
        type: 'story',
        title: story.title,
        summary: story.summary,
        href: `/story/${story.slug}`,
        matchReasons: ['Matched story content'],
        readingTime: story.readingTime,
        verificationState: 'partially_verified' // or something from story if it exists
      });
    }

    // Match Claims
    for (const claim of story.claims || []) {
      if (
        claim.claim.toLowerCase().includes(q) ||
        (claim.data && claim.data.toLowerCase().includes(q)) ||
        claim.source.toLowerCase().includes(q)
      ) {
        allResults.push({
          id: claim.id || `claim-${Math.random()}`,
          type: 'claim',
          title: claim.claim,
          summary: claim.data || '',
          href: `/story/${story.slug}#claim-${claim.id}`,
          matchReasons: ['Matched claim content'],
          claimStatus: claim.status || 'unverified',
          storyTitle: story.title,
          evidenceCount: claim.sourceCount || 1,
        });
      }
    }

    // Match Sources
    for (const source of story.sources || []) {
      if (
        source.title.toLowerCase().includes(q) ||
        (source.publisher && source.publisher.toLowerCase().includes(q)) ||
        source.url.toLowerCase().includes(q)
      ) {
        allResults.push({
          id: source.id || `source-${Math.random()}`,
          type: 'source',
          title: source.title,
          summary: source.url,
          href: source.url,
          matchReasons: ['Matched source content'],
          publisher: source.publisher,
          url: source.url,
          tierLabel: `Tier ${source.tier}`,
          citationCount: 1,
        });
      }
    }

    // Match Evidence (from blocks or claims)
    for (const block of story.blocks || []) {
      if (block.type === 'evidence' || block.type === 'evidence_block') {
        const blockStr = JSON.stringify(block.data).toLowerCase();
        if (blockStr.includes(q)) {
          allResults.push({
            id: block.id || `evidence-${Math.random()}`,
            type: 'evidence',
            title: 'Evidence Block',
            summary: 'Matched evidence in story',
            href: `/story/${story.slug}#block-${block.id}`,
            matchReasons: ['Matched evidence content'],
            claimId: (block.data.claimId as string) || '',
          });
        }
      }
    }
    
    // Check if claims have evidence
    for (const claim of story.claims || []) {
       if (claim.evidenceTier && claim.claim.toLowerCase().includes(q)) {
           allResults.push({
               id: claim.evidenceId || `evidence-${Math.random()}`,
               type: 'evidence',
               title: `Evidence for: ${claim.claim.substring(0, 50)}`,
               summary: claim.data || '',
               href: `/story/${story.slug}#claim-${claim.id}`,
               matchReasons: ['Matched evidence claim'],
               claimId: claim.id || '',
               hierarchyTier: claim.evidenceTier as any,
               confidenceScore: claim.confidence
           });
       }
    }
  }

  // Match Topics
  for (const topic of topics) {
    if (topic.name.toLowerCase().includes(q) || topic.description.toLowerCase().includes(q)) {
      allResults.push({
        id: topic.id,
        type: 'topic',
        title: topic.name,
        summary: topic.description,
        href: `/topics/${topic.slug}`,
        matchReasons: ['Matched topic content'],
        storyCount: topic.storyIds?.length || 0
      });
    }
  }

  // Match Entities
  for (const entity of entities) {
    if (
      entity.name.toLowerCase().includes(q) ||
      entity.description.toLowerCase().includes(q) ||
      entity.aliases.some(a => a.toLowerCase().includes(q))
    ) {
      allResults.push({
        id: entity.id,
        type: 'entity',
        title: entity.name,
        summary: entity.description,
        href: `/entities/${entity.slug}`,
        matchReasons: ['Matched entity content'],
        entityType: entity.type,
        storyCount: entity.storyCount || 0
      });
    }
  }

  // Match Timelines
  for (const timeline of timelines) {
    if (timeline.title.toLowerCase().includes(q) || timeline.description.toLowerCase().includes(q)) {
      allResults.push({
        id: timeline.id,
        type: 'timeline',
        title: timeline.title,
        summary: timeline.description,
        href: `/timelines/${timeline.id}`, // or slug if it exists
        matchReasons: ['Matched timeline content'],
        eventCount: timeline.events?.length || 0
      });
    }
  }

  // Filter by type if provided
  if (typeFilter) {
    allResults = allResults.filter(r => r.type === typeFilter);
  }

  // Calculate typeCounts before pagination
  const typeCounts: Record<string, number> = {};
  for (const r of allResults) {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
  }

  const total = allResults.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paginated = allResults.slice(start, start + pageSize);

  return NextResponse.json({
    data: paginated,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
      mode,
      typeCounts
    }
  } as ExplorerSearchResponse);
}
