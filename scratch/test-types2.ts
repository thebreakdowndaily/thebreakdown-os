import { createClient } from '@supabase/supabase-js';

// Representing the simple Database interface from schema.ts
interface RawStoryRow {
  Row: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    content: unknown;
    status: string;
    author_id: string;
    category: string;
    tags: string[];
    published_at: string | null;
    created_at: string;
    updated_at: string;
    hero_image: string | null;
    related_story_ids: string[] | null;
    related_entity_ids: string[] | null;
    related_topic_ids: string[] | null;
  };
  Insert: {
    id?: string;
    slug: string;
    title: string;
    summary: string;
    content: unknown;
    status?: string;
    author_id: string;
    category?: string;
    tags?: string[];
    published_at?: string | null;
    created_at?: string;
    updated_at?: string;
    hero_image?: string | null;
    related_story_ids?: string[] | null;
    related_entity_ids?: string[] | null;
    related_topic_ids?: string[] | null;
  };
  Update: {
    id?: string;
    slug?: string;
    title?: string;
    summary?: string;
    content?: unknown;
    status?: string;
    author_id?: string;
    category?: string;
    tags?: string[];
    published_at?: string | null;
    created_at?: string;
    updated_at?: string;
    hero_image?: string | null;
    related_story_ids?: string[] | null;
    related_entity_ids?: string[] | null;
    related_topic_ids?: string[] | null;
  };
}

interface RawDatabase {
  public: {
    Tables: {
      stories: RawStoryRow;
    };
  };
}

// Our beautiful mapping helper
type AddRelationships<T> = {
  [K in keyof T]: T[K] & { Relationships: [] }
}

type Database = {
  public: {
    Tables: AddRelationships<RawDatabase['public']['Tables']>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

const client = createClient<Database>('https://example.supabase.co', 'key');
const storiesTable = client.from('stories');

type TableType = typeof storiesTable;
type InsertType = Parameters<TableType['insert']>[0];

const mockInsert: InsertType = {
  slug: 'test-slug',
  title: 'test-title',
  summary: 'test-summary',
  author_id: 'test-author',
  content: {},
};

console.log(mockInsert);
