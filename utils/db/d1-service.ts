// ─── D1 Database Service — CMS Content Layer ─────────────────────────
// Full CRUD mirroring CMS Store interface. Auto-detects D1 binding at runtime.
// Falls back gracefully when D1 is unavailable (SSG build time).

/// <reference types="@cloudflare/workers-types" />

function getDB(): D1Database | null {
  try {
    if (typeof (globalThis as any).env?.DB !== 'undefined') return (globalThis as any).env.DB;
    if (typeof (process as any).env?.DB !== 'undefined') return (process as any).env.DB;
    return null;
  } catch {
    return null;
  }
}

export function hasDB(): boolean {
  return getDB() !== null;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function json(val: unknown): string {
  return JSON.stringify(val);
}

function parse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ─── Stories ──────────────────────────────────────────────────────────

export async function getStories(db?: D1Database) {
  const d = db || getDB();
  if (!d) return [];
  const result = await d.prepare('SELECT * FROM cms_stories ORDER BY updated_at DESC').all<any>();
  return (result.results || []).map(mapStory);
}

export async function getStory(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const row = await d.prepare('SELECT * FROM cms_stories WHERE id = ?').bind(id).first<any>();
  return row ? mapStory(row) : null;
}

export async function getStoryBySlug(slug: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const row = await d.prepare('SELECT * FROM cms_stories WHERE slug = ?').bind(slug).first<any>();
  return row ? mapStory(row) : null;
}

export async function saveStory(story: {
  id?: string; title: string; slug: string; excerpt?: string; status?: string;
  category?: string; author?: string; heroImage?: string; tags?: string[];
  blocks?: any[]; publishedAt?: string;
}, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const existing = story.id ? await getStory(story.id, d) : null;
  const now = new Date().toISOString();
  const id = story.id || `story-${Date.now().toString(36)}`;
  if (existing) {
    await d.prepare(`UPDATE cms_stories SET title=?,slug=?,excerpt=?,status=?,category=?,author=?,hero_image=?,tags=?,blocks_json=?,updated_at=? WHERE id=?`)
      .bind(story.title, story.slug, story.excerpt || '', story.status || 'draft',
        story.category || '', story.author || '', story.heroImage || '',
        json(story.tags || []), json(story.blocks || []), now, id).run();
    return id;
  }
  await d.prepare(`INSERT INTO cms_stories (id,title,slug,excerpt,status,category,author,hero_image,tags,blocks_json,created_at,updated_at,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id, story.title, story.slug, story.excerpt || '', story.status || 'draft',
      story.category || '', story.author || '', story.heroImage || '',
      json(story.tags || []), json(story.blocks || []), now, now, story.publishedAt || now).run();
  return id;
}

export async function deleteStory(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return;
  await d.prepare('DELETE FROM cms_revisions WHERE story_id = ?').bind(id).run();
  await d.prepare('DELETE FROM cms_stories WHERE id = ?').bind(id).run();
}

function mapStory(row: any) {
  return {
    ...row,
    tags: parse(row.tags, []),
    blocks_json: parse(row.blocks_json, []),
    blocks: parse(row.blocks_json, []),
  };
}

// ─── Topics ────────────────────────────────────────────────────────────

export async function getTopics(db?: D1Database) {
  const d = db || getDB();
  if (!d) return [];
  const result = await d.prepare('SELECT * FROM cms_topics ORDER BY name').all<any>();
  return (result.results || []).map(mapTopic);
}

export async function getTopic(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const row = await d.prepare('SELECT * FROM cms_topics WHERE id = ?').bind(id).first<any>();
  return row ? mapTopic(row) : null;
}

export async function saveTopic(topic: {
  id?: string; name: string; slug: string; description?: string; overview?: string;
  image?: string; storyIds?: string[]; relatedEntityIds?: string[];
  featuredStoryIds?: string[]; countries?: string[]; faq?: any[];
  timeline?: any[]; statistics?: any[];
}, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const existing = topic.id ? await getTopic(topic.id, d) : null;
  const now = new Date().toISOString();
  const id = topic.id || `topic-${Date.now().toString(36)}`;
  const row = {
    id, name: topic.name, slug: topic.slug,
    description: topic.description || '', overview: topic.overview || '',
    image: topic.image || '',
    story_ids: json(topic.storyIds || []),
    related_entity_ids: json(topic.relatedEntityIds || []),
    featured_story_ids: json(topic.featuredStoryIds || []),
    countries: json(topic.countries || []),
    faq: json(topic.faq || []),
    timeline: json(topic.timeline || []),
    statistics: json(topic.statistics || []),
    updated_at: now,
  };
  if (existing) {
    await d.prepare(`UPDATE cms_topics SET name=?,slug=?,description=?,overview=?,image=?,story_ids=?,related_entity_ids=?,featured_story_ids=?,countries=?,faq=?,timeline=?,statistics=?,updated_at=? WHERE id=?`)
      .bind(row.name, row.slug, row.description, row.overview, row.image,
        row.story_ids, row.related_entity_ids, row.featured_story_ids,
        row.countries, row.faq, row.timeline, row.statistics, row.updated_at, id).run();
  } else {
    await d.prepare(`INSERT INTO cms_topics (id,name,slug,description,overview,image,story_ids,related_entity_ids,featured_story_ids,countries,faq,timeline,statistics,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(row.id, row.name, row.slug, row.description, row.overview, row.image,
        row.story_ids, row.related_entity_ids, row.featured_story_ids,
        row.countries, row.faq, row.timeline, row.statistics, now, now).run();
  }
  return id;
}

export async function deleteTopic(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return;
  await d.prepare('DELETE FROM cms_topics WHERE id = ?').bind(id).run();
}

function mapTopic(row: any) {
  return {
    ...row,
    storyIds: parse(row.story_ids, []),
    relatedEntityIds: parse(row.related_entity_ids, []),
    featuredStoryIds: parse(row.featured_story_ids, []),
    countries: parse(row.countries, []),
    faq: parse(row.faq, []),
    timeline: parse(row.timeline, []),
    statistics: parse(row.statistics, []),
  };
}

// ─── Entities ──────────────────────────────────────────────────────────

export async function getEntities(db?: D1Database) {
  const d = db || getDB();
  if (!d) return [];
  const result = await d.prepare('SELECT * FROM cms_entities ORDER BY name').all<any>();
  return (result.results || []).map(mapEntity);
}

export async function getEntity(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const row = await d.prepare('SELECT * FROM cms_entities WHERE id = ?').bind(id).first<any>();
  return row ? mapEntity(row) : null;
}

export async function saveEntity(entity: {
  id?: string; type: string; name: string; slug: string; description?: string;
  aliases?: string[]; image?: string; relatedEntityIds?: string[];
  relatedStoryIds?: string[]; relatedTopicIds?: string[]; statistics?: any[];
  timeline?: any[]; faq?: any[];
}, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const existing = entity.id ? await getEntity(entity.id, d) : null;
  const now = new Date().toISOString();
  const id = entity.id || `entity-${Date.now().toString(36)}`;
  const row = {
    id, type: entity.type, name: entity.name, slug: entity.slug,
    description: entity.description || '',
    aliases: json(entity.aliases || []),
    image: entity.image || '',
    related_entity_ids: json(entity.relatedEntityIds || []),
    related_story_ids: json(entity.relatedStoryIds || []),
    related_topic_ids: json(entity.relatedTopicIds || []),
    statistics: json(entity.statistics || []),
    timeline: json(entity.timeline || []),
    faq: json(entity.faq || []),
    updated_at: now,
  };
  if (existing) {
    await d.prepare(`UPDATE cms_entities SET type=?,name=?,slug=?,description=?,aliases=?,image=?,related_entity_ids=?,related_story_ids=?,related_topic_ids=?,statistics=?,timeline=?,faq=?,updated_at=? WHERE id=?`)
      .bind(row.type, row.name, row.slug, row.description, row.aliases, row.image,
        row.related_entity_ids, row.related_story_ids, row.related_topic_ids,
        row.statistics, row.timeline, row.faq, row.updated_at, id).run();
  } else {
    await d.prepare(`INSERT INTO cms_entities (id,type,name,slug,description,aliases,image,related_entity_ids,related_story_ids,related_topic_ids,statistics,timeline,faq,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(row.id, row.type, row.name, row.slug, row.description, row.aliases,
        row.image, row.related_entity_ids, row.related_story_ids, row.related_topic_ids,
        row.statistics, row.timeline, row.faq, now, now).run();
  }
  return id;
}

export async function deleteEntity(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return;
  await d.prepare('DELETE FROM cms_entities WHERE id = ?').bind(id).run();
}

function mapEntity(row: any) {
  return {
    ...row,
    aliases: parse(row.aliases, []),
    relatedEntityIds: parse(row.related_entity_ids, []),
    relatedStoryIds: parse(row.related_story_ids, []),
    relatedTopicIds: parse(row.related_topic_ids, []),
    statistics: parse(row.statistics, []),
    timeline: parse(row.timeline, []),
    faq: parse(row.faq, []),
  };
}

// ─── Timelines ─────────────────────────────────────────────────────────

export async function getTimelines(db?: D1Database) {
  const d = db || getDB();
  if (!d) return [];
  const result = await d.prepare('SELECT * FROM cms_timelines ORDER BY created_at DESC').all<any>();
  return (result.results || []).map(mapTimeline);
}

export async function getTimeline(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const row = await d.prepare('SELECT * FROM cms_timelines WHERE id = ?').bind(id).first<any>();
  return row ? mapTimeline(row) : null;
}

export async function saveTimeline(tl: {
  id?: string; title: string; description?: string; category?: string;
  storyIds?: string[]; entityIds?: string[]; topicIds?: string[]; events?: any[];
}, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const existing = tl.id ? await getTimeline(tl.id, d) : null;
  const now = new Date().toISOString();
  const id = tl.id || `timeline-${Date.now().toString(36)}`;
  const row = {
    id, title: tl.title, description: tl.description || '',
    category: tl.category || '', story_ids: json(tl.storyIds || []),
    entity_ids: json(tl.entityIds || []), topic_ids: json(tl.topicIds || []),
    events: json(tl.events || []), updated_at: now,
  };
  if (existing) {
    await d.prepare(`UPDATE cms_timelines SET title=?,description=?,category=?,story_ids=?,entity_ids=?,topic_ids=?,events=?,updated_at=? WHERE id=?`)
      .bind(row.title, row.description, row.category, row.story_ids,
        row.entity_ids, row.topic_ids, row.events, row.updated_at, id).run();
  } else {
    await d.prepare(`INSERT INTO cms_timelines (id,title,description,category,story_ids,entity_ids,topic_ids,events,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .bind(row.id, row.title, row.description, row.category, row.story_ids,
        row.entity_ids, row.topic_ids, row.events, now, now).run();
  }
  return id;
}

export async function deleteTimeline(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return;
  await d.prepare('DELETE FROM cms_timelines WHERE id = ?').bind(id).run();
}

function mapTimeline(row: any) {
  return {
    ...row,
    storyIds: parse(row.story_ids, []),
    entityIds: parse(row.entity_ids, []),
    topicIds: parse(row.topic_ids, []),
    events: parse(row.events, []),
  };
}

// ─── Fixes ─────────────────────────────────────────────────────────────

export async function getFixes(db?: D1Database) {
  const d = db || getDB();
  if (!d) return [];
  const result = await d.prepare('SELECT * FROM cms_fixes ORDER BY updated_at DESC').all<any>();
  return (result.results || []).map(mapFix);
}

export async function getFix(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const row = await d.prepare('SELECT * FROM cms_fixes WHERE id = ?').bind(id).first<any>();
  return row ? mapFix(row) : null;
}

export async function saveFix(fix: {
  id?: string; title: string; slug: string; problem?: string;
  rootCauses?: string[]; existingSolutions?: any[]; globalExamples?: any[];
  recommendedActions?: any[]; citizenActions?: string[]; governmentActions?: string[];
  metrics?: any[]; status?: string;
}, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const existing = fix.id ? await getFix(fix.id, d) : null;
  const now = new Date().toISOString();
  const id = fix.id || `fix-${Date.now().toString(36)}`;
  const row = {
    id, title: fix.title, slug: fix.slug, problem: fix.problem || '',
    root_causes: json(fix.rootCauses || []),
    existing_solutions: json(fix.existingSolutions || []),
    global_examples: json(fix.globalExamples || []),
    recommended_actions: json(fix.recommendedActions || []),
    citizen_actions: json(fix.citizenActions || []),
    government_actions: json(fix.governmentActions || []),
    metrics: json(fix.metrics || []), status: fix.status || 'draft',
    updated_at: now,
  };
  if (existing) {
    await d.prepare(`UPDATE cms_fixes SET title=?,slug=?,problem=?,root_causes=?,existing_solutions=?,global_examples=?,recommended_actions=?,citizen_actions=?,government_actions=?,metrics=?,status=?,updated_at=? WHERE id=?`)
      .bind(row.title, row.slug, row.problem, row.root_causes, row.existing_solutions,
        row.global_examples, row.recommended_actions, row.citizen_actions,
        row.government_actions, row.metrics, row.status, row.updated_at, id).run();
  } else {
    await d.prepare(`INSERT INTO cms_fixes (id,title,slug,problem,root_causes,existing_solutions,global_examples,recommended_actions,citizen_actions,government_actions,metrics,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(row.id, row.title, row.slug, row.problem, row.root_causes,
        row.existing_solutions, row.global_examples, row.recommended_actions,
        row.citizen_actions, row.government_actions, row.metrics, row.status, now, now).run();
  }
  return id;
}

export async function deleteFix(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return;
  await d.prepare('DELETE FROM cms_fixes WHERE id = ?').bind(id).run();
}

function mapFix(row: any) {
  return {
    ...row,
    rootCauses: parse(row.root_causes, []),
    existingSolutions: parse(row.existing_solutions, []),
    globalExamples: parse(row.global_examples, []),
    recommendedActions: parse(row.recommended_actions, []),
    citizenActions: parse(row.citizen_actions, []),
    governmentActions: parse(row.government_actions, []),
    metrics: parse(row.metrics, []),
  };
}

// ─── Media ─────────────────────────────────────────────────────────────

export async function getMedia(db?: D1Database) {
  const d = db || getDB();
  if (!d) return [];
  const result = await d.prepare('SELECT * FROM cms_media ORDER BY updated_at DESC').all<any>();
  return (result.results || []).map(mapMedia);
}

export async function getMediaItem(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const row = await d.prepare('SELECT * FROM cms_media WHERE id = ?').bind(id).first<any>();
  return row ? mapMedia(row) : null;
}

export async function saveMediaItem(item: {
  id?: string; type: string; src: string; alt?: string; caption?: string;
  tags?: string[]; credit?: string; width?: number; height?: number; fileSize?: number;
}, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const existing = item.id ? await getMediaItem(item.id, d) : null;
  const now = new Date().toISOString();
  const id = item.id || `media-${Date.now().toString(36)}`;
  const version = existing ? (existing as any).version + 1 : 1;
  const row = {
    id, type: item.type, src: item.src, alt: item.alt || '',
    caption: item.caption || '', tags: json(item.tags || []),
    credit: item.credit || '', version, updated_at: now,
    width: item.width || null, height: item.height || null,
    file_size: item.fileSize || null,
  };
  if (existing) {
    await d.prepare(`UPDATE cms_media SET type=?,src=?,alt=?,caption=?,tags=?,credit=?,width=?,height=?,file_size=?,version=?,updated_at=? WHERE id=?`)
      .bind(row.type, row.src, row.alt, row.caption, row.tags, row.credit,
        row.width, row.height, row.file_size, row.version, row.updated_at, id).run();
  } else {
    await d.prepare(`INSERT INTO cms_media (id,type,src,alt,caption,tags,credit,width,height,file_size,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(row.id, row.type, row.src, row.alt, row.caption, row.tags, row.credit,
        row.width, row.height, row.file_size, row.version, now, now).run();
  }
  return id;
}

export async function deleteMedia(id: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return;
  await d.prepare('DELETE FROM cms_media WHERE id = ?').bind(id).run();
}

function mapMedia(row: any) {
  return {
    ...row,
    tags: parse(row.tags, []),
    fileSize: row.file_size,
  };
}

// ─── Activity ──────────────────────────────────────────────────────────

export async function getActivity(limit = 20, db?: D1Database) {
  const d = db || getDB();
  if (!d) return [];
  const result = await d.prepare('SELECT * FROM cms_activity ORDER BY timestamp DESC LIMIT ?').bind(limit).all<any>();
  return result.results || [];
}

export async function addActivity(entry: {
  type: string; label: string; userId?: string; link?: string;
}, db?: D1Database) {
  const d = db || getDB();
  if (!d) return;
  const id = `act-${Date.now().toString(36)}`;
  await d.prepare('INSERT INTO cms_activity (id,type,label,timestamp,user_id,link) VALUES (?,?,?,?,?,?)')
    .bind(id, entry.type, entry.label, new Date().toISOString(), entry.userId || null, entry.link || null).run();
}

// ─── Revisions ─────────────────────────────────────────────────────────

export async function getRevisions(storyId: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return [];
  const result = await d.prepare('SELECT * FROM cms_revisions WHERE story_id = ? ORDER BY version DESC').bind(storyId).all<any>();
  return result.results || [];
}

export async function addRevision(storyId: string, snapshot: any, message?: string, userId?: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return;
  const id = `rev-${Date.now().toString(36)}`;
  const existing = await getRevisions(storyId, d);
  const version = existing.length + 1;
  await d.prepare('INSERT INTO cms_revisions (id,story_id,version,snapshot,created_at,user_id,message) VALUES (?,?,?,?,?,?,?)')
    .bind(id, storyId, version, json(snapshot), new Date().toISOString(), userId || null, message || `Version ${version}`).run();
}

export async function restoreRevision(storyId: string, revisionId: string, db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const rev = await d.prepare('SELECT * FROM cms_revisions WHERE id = ?').bind(revisionId).first<any>();
  if (!rev) return null;
  const snapshot: any = parse(rev.snapshot, null);
  if (!snapshot) return null;
  await d.prepare(`UPDATE cms_stories SET blocks_json=?,title=?,slug=?,excerpt=?,status=?,category=?,author=?,hero_image=?,tags=?,updated_at=? WHERE id=?`)
    .bind(json(snapshot.blocks || snapshot.blocks_json || []),
      snapshot.title || '', snapshot.slug || '', snapshot.excerpt || '',
      snapshot.status || 'draft', snapshot.category || '', snapshot.author || '',
      snapshot.heroImage || '', json(snapshot.tags || []),
      new Date().toISOString(), storyId).run();
  return snapshot;
}

// ─── Dashboard Stats ───────────────────────────────────────────────────

export async function getDashboardStats(db?: D1Database) {
  const d = db || getDB();
  if (!d) return null;
  const storyCounts = await d.prepare(`
    SELECT status, COUNT(*) as cnt FROM cms_stories GROUP BY status
  `).all<any>();
  const topicCount = (await d.prepare('SELECT COUNT(*) as cnt FROM cms_topics').first<any>())?.cnt || 0;
  const entityCount = (await d.prepare('SELECT COUNT(*) as cnt FROM cms_entities').first<any>())?.cnt || 0;
  const timelineCount = (await d.prepare('SELECT COUNT(*) as cnt FROM cms_timelines').first<any>())?.cnt || 0;
  const fixCount = (await d.prepare('SELECT COUNT(*) as cnt FROM cms_fixes').first<any>())?.cnt || 0;
  const mediaCount = (await d.prepare('SELECT COUNT(*) as cnt FROM cms_media').first<any>())?.cnt || 0;
  let drafts = 0; let review = 0; let published = 0;
  const rows = storyCounts.results || [];
  rows.forEach((r: any) => {
    if (r.status === 'draft') drafts = r.cnt;
    else if (r.status === 'review') review = r.cnt;
    else if (r.status === 'published') published = r.cnt;
  });
  return {
    totalStories: drafts + review + published,
    drafts, review, published, scheduled: 0,
    totalTopics: topicCount, totalEntities: entityCount,
    totalTimelines: timelineCount, totalFixes: fixCount, totalMedia: mediaCount,
  };
}
