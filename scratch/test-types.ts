import { getSupabaseClient } from '../supabase/client';

const client = getSupabaseClient();
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
