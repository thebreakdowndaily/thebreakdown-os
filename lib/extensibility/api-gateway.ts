// ── Public API Gateway & Contract Adapter (Phase 19B Recommendation 1) ─────────

import { PublicAPIEndpoint } from '../../types/extensibility';
import { CHAPTER_1_FIX } from '../editorial/chapter-1-data';

export const PUBLIC_ENDPOINTS: PublicAPIEndpoint[] = [
  {
    endpointId: 'ep-fixes-v1',
    path: '/api/v1/public/fixes',
    method: 'GET',
    version: 'v1.0',
    projectionContract: 'FixPublicProjection',
    rateLimitReqPerMin: 120,
  },
  {
    endpointId: 'ep-claims-v1',
    path: '/api/v1/public/claims',
    method: 'GET',
    version: 'v1.0',
    projectionContract: 'ClaimPublicProjection',
    rateLimitReqPerMin: 240,
  },
  {
    endpointId: 'ep-topics-v1',
    path: '/api/v1/public/topics',
    method: 'GET',
    version: 'v1.0',
    projectionContract: 'TopicPublicProjection',
    rateLimitReqPerMin: 300,
  },
];

export class PublicAPIGateway {
  public static listEndpoints(): readonly PublicAPIEndpoint[] {
    return Object.freeze(PUBLIC_ENDPOINTS.map((e) => Object.freeze({ ...e })));
  }

  /**
   * Serves public API projection response over contract layer without exposing internal domain entities.
   */
  public static getFixesProjection(version = 'v1.0'): Record<string, unknown> {
    if (version !== 'v1.0' && version !== 'v1.1-preview') {
      throw new Error(`Unsupported API version: ${version}`);
    }

    const claimsList = (CHAPTER_1_FIX as any).claims || (CHAPTER_1_FIX as any).evidenceSpine || [];

    return Object.freeze({
      apiVersion: version,
      data: Object.freeze([
        Object.freeze({
          fixId: CHAPTER_1_FIX.id,
          slug: CHAPTER_1_FIX.slug,
          title: CHAPTER_1_FIX.title,
          headline: CHAPTER_1_FIX.headline,
          claimsCount: Array.isArray(claimsList) ? claimsList.length : 0,
          status: CHAPTER_1_FIX.publicationStatus,
        }),
      ]),
    });
  }
}
