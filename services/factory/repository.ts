import type { StoryService } from '../interfaces/story';
import type { TopicService } from '../interfaces/topic';
import type { RawEntityRepository } from '../interfaces/entity';
import type { TimelineService } from '../interfaces/timeline';
import type { FixService } from '../interfaces/fix';
import type { MediaService } from '../interfaces/media';
import type { DatasetService } from '../interfaces/dataset';
import type { InvestigationService } from '../interfaces/investigation';
import { MemoryStoryService } from '../repositories/memory/story';
import { SupabaseStoryRepository } from '../repositories/supabase/story';
import { MemoryTopicRepository } from '../repositories/memory/topic';
import { SupabaseTopicRepository } from '../repositories/supabase/topic';
import { MemoryEntityRepository } from '../repositories/memory/entity';
import { SupabaseEntityRepository } from '../repositories/supabase/entity';
import { MemoryTimelineRepository } from '../repositories/memory/timeline';
import { SupabaseTimelineRepository } from '../repositories/supabase/timeline';
import { MemoryFixRepository } from '../repositories/memory/fix';
import { SupabaseFixRepository } from '../repositories/supabase/fix';
import { MemoryMediaRepository } from '../repositories/memory/media';
import { SupabaseMediaRepository } from '../repositories/supabase/media';
import { MemoryDatasetRepository } from '../repositories/memory/dataset';
import { SupabaseDatasetRepository } from '../repositories/supabase/dataset';
import { MemoryInvestigationRepository } from '../repositories/memory/investigation';

function getProvider(): 'memory' | 'supabase' {
  const provider = (process.env.DATA_PROVIDER || 'memory').toLowerCase();
  return provider === 'supabase' ? 'supabase' : 'memory';
}

export class RepositoryFactory {
  static getStoryRepository(initialData: any[] = []): StoryService {
    const provider = getProvider();
    if (provider === 'supabase') return new SupabaseStoryRepository();
    return new MemoryStoryService(initialData);
  }

  static getTopicRepository(initialData: any[] = []): TopicService {
    const provider = getProvider();
    if (provider === 'supabase') return new SupabaseTopicRepository();
    return new MemoryTopicRepository(initialData);
  }

  static getEntityRepository(initialData: any[] = []): RawEntityRepository {
    const provider = getProvider();
    if (provider === 'supabase') return new SupabaseEntityRepository();
    return new MemoryEntityRepository(initialData);
  }

  static getTimelineRepository(initialData: any[] = []): TimelineService {
    const provider = getProvider();
    if (provider === 'supabase') return new SupabaseTimelineRepository();
    return new MemoryTimelineRepository(initialData);
  }

  static getFixRepository(initialData: any[] = []): FixService {
    const provider = getProvider();
    if (provider === 'supabase') return new SupabaseFixRepository();
    return new MemoryFixRepository(initialData);
  }

  static getMediaRepository(initialData: any[] = []): MediaService {
    const provider = getProvider();
    if (provider === 'supabase') return new SupabaseMediaRepository();
    return new MemoryMediaRepository(initialData);
  }

  static getDatasetRepository(initialData: any[] = []): DatasetService {
    const provider = getProvider();
    if (provider === 'supabase') return new SupabaseDatasetRepository();
    return new MemoryDatasetRepository(initialData);
  }

  static getInvestigationRepository(initialData: any[] = []): InvestigationService {
    return new MemoryInvestigationRepository(initialData as any[]);
  }

  static getDataProvider(): 'memory' | 'supabase' {
    return getProvider();
  }
}
