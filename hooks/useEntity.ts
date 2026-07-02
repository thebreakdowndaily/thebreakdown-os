'use client';

import { useState, useEffect } from 'react';
import type { EntityJSON, TimelineEvent } from '../utils/types';

interface UseEntityResult {
  entity: EntityJSON | null;
  loading: boolean;
  error: string | null;
}

export function useEntity(slug: string): UseEntityResult {
  const [entity, setEntity] = useState<EntityJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError('No slug provided');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/entity?slug=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch entity: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setEntity(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'An error occurred');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { entity, loading, error };
}

interface UseEntityTimelineResult {
  events: TimelineEvent[];
  loading: boolean;
}

export function useEntityTimeline(entitySlug: string): UseEntityTimelineResult {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entitySlug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/entity/timeline?slug=${encodeURIComponent(entitySlug)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch timeline');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setEvents(data.events || data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvents([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [entitySlug]);

  return { events, loading };
}
