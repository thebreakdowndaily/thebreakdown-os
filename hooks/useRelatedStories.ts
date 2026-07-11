'use client';

import { useState, useEffect } from 'react';
import type { Story } from '../types/canonical';

interface UseRelatedStoriesResult {
  stories: Story[];
  loading: boolean;
  error: string | null;
}

export function useRelatedStories(storyId: string, limit?: number): UseRelatedStoriesResult {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) return;

    let cancelled = false;

    const searchParams = new URLSearchParams();
    searchParams.set('storyId', storyId);
    if (limit) searchParams.set('limit', String(limit));

    fetch(`/api/stories/related?${searchParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch related stories');
        return res.json() as Promise<{ stories?: Story[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setStories(data.stories ?? []);
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
  }, [storyId, limit]);

  if (!storyId) {
    return { stories: [], loading: false, error: 'No story ID provided' };
  }

  return { stories, loading, error };
}

interface UseEntityStoriesResult {
  stories: Story[];
  loading: boolean;
}

export function useEntityStories(entitySlug: string, limit?: number): UseEntityStoriesResult {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entitySlug) return;

    let cancelled = false;

    const searchParams = new URLSearchParams();
    searchParams.set('slug', entitySlug);
    if (limit) searchParams.set('limit', String(limit));

    fetch(`/api/entity/stories?${searchParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch entity stories');
        return res.json() as Promise<{ stories?: Story[] }>;
      })
      .then((data) => {
        if (!cancelled) {
          setStories(data.stories ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStories([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [entitySlug, limit]);

  if (!entitySlug) {
    return { stories: [], loading: false };
  }

  return { stories, loading };
}
