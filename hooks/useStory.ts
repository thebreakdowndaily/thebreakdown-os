'use client';

import { useState, useEffect } from 'react';
import type { StoryJSON } from '../utils/types';

interface UseStoryResult {
  story: StoryJSON | null;
  loading: boolean;
  error: string | null;
}

export function useStory(slug: string): UseStoryResult {
  const [story, setStory] = useState<StoryJSON | null>(null);
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

    fetch(`/api/story?slug=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch story: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setStory(data);
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

  return { story, loading, error };
}

interface UseStoriesParams {
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

interface UseStoriesResult {
  stories: StoryJSON[];
  loading: boolean;
  error: string | null;
  total: number;
}

export function useStories(params: UseStoriesParams = {}): UseStoriesResult {
  const [stories, setStories] = useState<StoryJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const { category, tag, page = 1, limit = 20 } = params;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const searchParams = new URLSearchParams();
    if (category) searchParams.set('category', category);
    if (tag) searchParams.set('tag', tag);
    if (page) searchParams.set('page', String(page));
    if (limit) searchParams.set('limit', String(limit));

    fetch(`/api/stories?${searchParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch stories: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setStories(data.stories || data);
          setTotal(data.total || data.length || 0);
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
  }, [category, tag, page, limit]);

  return { stories, loading, error, total };
}
