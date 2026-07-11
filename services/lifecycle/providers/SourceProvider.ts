import { RegisteredSource } from '@/types/canonical';

export interface SourceSnapshot {
  id: string;
  sourceId: string;
  fetchedAt: string;
  rawContent: unknown;
  hash: string;
}

export interface NormalizedDocument {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  claims: Array<{ text: string; context?: string }>;
  entities: string[];
  publishedAt: string;
  url: string;
}

export interface SourceProvider {
  id: string;
  supports(source: RegisteredSource): boolean;
  fetchLatest(source: RegisteredSource): Promise<SourceSnapshot>;
  validate(snapshot: SourceSnapshot): Promise<boolean>;
  normalize(snapshot: SourceSnapshot): Promise<NormalizedDocument>;
}
