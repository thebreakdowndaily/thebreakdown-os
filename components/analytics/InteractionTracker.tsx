'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureEvent } from '@/lib/analytics/capture';

const SEARCH_QUERY_KEY = 'tbd_last_search_query';

/**
 * InteractionTracker — delegated, minimal click measurement.
 *
 * ONE document-level listener captures:
 *   - related_story_clicked   (a[data-analytics="related_story"])
 *   - topic_link_clicked      (a[data-analytics="topic"])
 *   - entity_link_clicked     (a[data-analytics="entity"])
 *   - source_opened           (a[data-analytics="source"])
 *   - document_opened         (a[data-analytics="document"])
 *   - search_result_clicked   (any content link on /search after a search)
 */
export function InteractionTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      const anchor = target.closest('a');
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;

      const track = anchor.getAttribute('data-analytics') || '';
      const href = anchor.getAttribute('href') || '';
      const globalSource = pathname || '/';

      if (track) {
        switch (track) {
          case 'related_story':
            captureEvent('related_story_clicked', {
              source_id: anchor.getAttribute('data-source') || globalSource,
              target_id: anchor.getAttribute('data-content-id') || href,
              position: Number(anchor.getAttribute('data-position') || 0) || 0,
            });
            break;
          case 'topic':
            captureEvent('topic_link_clicked', {
              source_id: globalSource,
              topic_id: anchor.getAttribute('data-topic-id') || href,
            });
            break;
          case 'entity':
            captureEvent('entity_link_clicked', {
              source_id: globalSource,
              entity_id: anchor.getAttribute('data-entity-id') || href,
            });
            break;
          case 'source':
            captureEvent('source_opened', {
              content_id: anchor.getAttribute('data-content-id') || globalSource,
              source_title: anchor.getAttribute('data-source-title') || href,
              source_domain: anchor.getAttribute('data-source-domain') || '',
            });
            break;
          case 'document':
            captureEvent('document_opened', {
              content_id: anchor.getAttribute('data-content-id') || globalSource,
              document_title: anchor.getAttribute('data-document-title') || href,
              document_domain: anchor.getAttribute('data-document-domain') || '',
            });
            break;
          default:
            break;
        }
        return;
      }

      if (pathname === '/search') {
        let query = '';
        try {
          query = sessionStorage.getItem(SEARCH_QUERY_KEY) || '';
        } catch {
          query = '';
        }
        if (query) {
          const result = inferSearchResult(href);
          if (result) {
            const position = collectionPosition(anchor);
            captureEvent('search_result_clicked', {
              search_query: query,
              result_type: result.type,
              result_id: result.id,
              result_position: position,
            });
          }
        }
      }
    };

    document.addEventListener('click', onDocumentClick);
    return () => {
      document.removeEventListener('click', onDocumentClick);
    };
  }, [pathname]);

  return null;
}

function inferSearchResult(href: string): { type: string; id: string } | null {
  try {
    const url = new URL(href, window.location.origin);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return null;
    if (parts[0] === 'story' && parts[1]) return { type: 'story', id: parts[1] };
    if (parts[0] === 'topic' && parts[1]) return { type: 'topic', id: parts[1] };
    if (parts[0] === 'entity' && parts[1]) return { type: 'entity', id: parts[1] };
    if (parts[0] === 'fix' && parts[1]) return { type: 'fix', id: parts[1] };
    if (parts[0] === 'problems' && parts[1]) return { type: 'problem', id: parts[1] };
    if (parts[0] === 'data' && parts[1]) return { type: 'dataset', id: parts[1] };
    if (parts[0] === 'series' && parts[1]) {
      if (parts[2] === 'volume' && parts[4]) return { type: 'chapter', id: parts[4] };
      return { type: 'collection', id: parts[1] };
    }
    return null;
  } catch {
    return null;
  }
}

function collectionPosition(anchor: HTMLAnchorElement): number {
  const links = Array.from(document.querySelectorAll('main a[href]'));
  const found = links.indexOf(anchor);
  return found >= 0 ? found + 1 : 0;
}