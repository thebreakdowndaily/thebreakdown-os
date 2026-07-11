'use client';

import { useState, useEffect } from 'react';
import type { Story } from '@/types/canonical';

interface UseStoryResult {
  story: Story | null;
  loading: boolean;
  error: string | null;
}

export function useStory(slug: string): UseStoryResult {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    fetch(`/api/story?slug=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch story: ${res.statusText}`);
        return res.json() as Promise<Story>;
      })
      .then((data) => {
        if (!cancelled) {
          setStory(data);
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
    return { story: null, loading: false, error: 'No slug provided' };
  }

  return { story, loading, error };
}

interface UseStoriesParams {
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

interface UseStoriesResult {
  stories: Story[];
  loading: boolean;
  error: string | null;
  total: number;
}

export function useStories(params: UseStoriesParams = {}): UseStoriesResult {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const { category, tag, page = 1, limit = 20 } = params;

  useEffect(() => {
    let cancelled = false;

    const searchParams = new URLSearchParams();
    if (category) searchParams.set('category', category);
    if (tag) searchParams.set('tag', tag);
    if (page) searchParams.set('page', String(page));
    if (limit) searchParams.set('limit', String(limit));

    fetch(`/api/stories?${searchParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch stories: ${res.statusText}`);
        return res.json() as Promise<{ stories: Story[]; total: number }>;
      })
      .then((data) => {
        if (!cancelled) {
          setStories(data.stories);
          setTotal(data.total);
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
  }, [category, tag, page, limit]);

  return { stories, loading, error, total };
}
