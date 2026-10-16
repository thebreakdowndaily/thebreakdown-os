export type AppPermission =
  // Content & Editorial
  | 'story.read'
  | 'story.create'
  | 'story.update'
  | 'story.publish'
  | 'story.delete'
  | 'topic.create'
  | 'topic.update'
  | 'topic.delete'
  | 'entity.create'
  | 'entity.update'
  | 'entity.delete'
  | 'fix.create'
  | 'fix.update'
  | 'fix.delete'
  | 'timeline.create'
  | 'timeline.update'
  | 'timeline.delete'
  | 'media.create'
  | 'dataset.create'
  | 'dataset.update'
  | 'dataset.delete'
  | 'investigation.read'
  | 'investigation.write'
  | 'citation.create'
  | 'citation.modify'
  | 'editorial.schedule'
  // Intelligence Bureau
  | 'intel.dashboard'
  | 'intel.watchlist'
  | 'intel.predictions'
  | 'intel.scenarios'
  | 'intel.candidates'
  | 'intel.media'
  | 'intel.research'
  | 'intel.toolkit'
  | 'intel.editorial'
  | 'intel.story_builder'
  | 'intel.verification'
  | 'intel.rti'
  | 'intel.tasks'
  | 'intel.newsroom'
  | 'intel.demand'
  // Resource-intensive Radar ingestion controls
  | 'radar.poll'
  | 'radar.poll.force'
  // Administrative & Security
  | 'api_key.read'
  | 'api_key.create'
  | 'api_key.revoke'
  | 'user.role.grant'
  | 'user.role.revoke'
  | 'audit.read'
  | 'system.config';

/**
 * Canonical runtime allowlist for permission values accepted from request bodies
 * and persistent API-key records. Keep this synchronized with AppPermission.
 */
export const APP_PERMISSIONS = [
  'story.read',
  'story.create',
  'story.update',
  'story.publish',
  'story.delete',
  'topic.create',
  'topic.update',
  'topic.delete',
  'entity.create',
  'entity.update',
  'entity.delete',
  'fix.create',
  'fix.update',
  'fix.delete',
  'timeline.create',
  'timeline.update',
  'timeline.delete',
  'media.create',
  'dataset.create',
  'dataset.update',
  'dataset.delete',
  'investigation.read',
  'investigation.write',
  'citation.create',
  'citation.modify',
  'editorial.schedule',
  'intel.dashboard',
  'intel.watchlist',
  'intel.predictions',
  'intel.scenarios',
  'intel.candidates',
  'intel.media',
  'intel.research',
  'intel.toolkit',
  'intel.editorial',
  'intel.story_builder',
  'intel.verification',
  'intel.rti',
  'intel.tasks',
  'intel.newsroom',
  'intel.demand',
  'radar.poll',
  'radar.poll.force',
  'api_key.read',
  'api_key.create',
  'api_key.revoke',
  'user.role.grant',
  'user.role.revoke',
  'audit.read',
  'system.config',
] as const satisfies readonly AppPermission[];

const APP_PERMISSION_SET: ReadonlySet<string> = new Set(APP_PERMISSIONS);

export function isAppPermission(value: unknown): value is AppPermission {
  return typeof value === 'string' && APP_PERMISSION_SET.has(value);
}
