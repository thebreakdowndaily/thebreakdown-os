'use client';

import { useState, useEffect } from 'react';
import type { RelatedStory } from '../utils/types';

interface UseRelatedStoriesResult {
  stories: RelatedStory[];
  loading: boolean;
  error: string | null;
}

export function useRelatedStories(storyId: string, limit?: number): UseRelatedStoriesResult {
  const [stories, setStories] = useState<RelatedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) {
      setLoading(false);
      setError('No story ID provided');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const searchParams = new URLSearchParams();
    searchParams.set('storyId', storyId);
    if (limit) searchParams.set('limit', String(limit));

    fetch(`/api/stories/related?${searchParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch related stories');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setStories(data.stories || data || []);
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
  }, [storyId, limit]);

  return { stories, loading, error };
}

interface UseEntityStoriesResult {
  stories: RelatedStory[];
  loading: boolean;
}

export function useEntityStories(entitySlug: string, limit?: number): UseEntityStoriesResult {
  const [stories, setStories] = useState<RelatedStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entitySlug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const searchParams = new URLSearchParams();
    searchParams.set('slug', entitySlug);
    if (limit) searchParams.set('limit', String(limit));

    fetch(`/api/entity/stories?${searchParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch entity stories');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setStories(data.stories || data || []);
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

  return { stories, loading };
}
