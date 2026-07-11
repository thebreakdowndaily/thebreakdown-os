'use client';

import { useState, useEffect } from 'react';
import type { Entity, TimelineEvent } from '@/types/canonical';

interface UseEntityResult {
  entity: Entity | null;
  loading: boolean;
  error: string | null;
}

export function useEntity(slug: string): UseEntityResult {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    fetch(`/api/entity?slug=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch entity: ${res.statusText}`);
        return res.json() as Promise<Entity>;
      })
      .then((data) => {
        if (!cancelled) {
          setEntity(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) {
    return { entity: null, loading: false, error: 'No slug provided' };
  }

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
    if (!entitySlug) return;

    let cancelled = false;

    fetch(`/api/entity/timeline?slug=${encodeURIComponent(entitySlug)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch timeline');
        return res.json() as Promise<{ events?: TimelineEvent[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setEvents(data.events ?? []);
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

  if (!entitySlug) {
    return { events: [], loading: false };
  }

  return { events, loading };
}
