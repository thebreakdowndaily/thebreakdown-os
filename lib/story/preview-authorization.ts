import { can } from '@/features/auth/policy';
import type { Principal } from '@/features/auth/principal';

/**
 * Only active editorial principals may preview unpublished stories.
 * Keep this policy shared so the server page and unit tests exercise the same rule.
 */
export function canPreviewUnpublishedStory(principal: Principal | null | undefined): boolean {
  return can(principal, 'intel.editorial');
}
