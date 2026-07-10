export interface Database {
  public: {
    Tables: {
      stories: StoryRow;
      topics: TopicRow;
      entities: EntityRow;
      timelines: TimelineRow;
      fixes: FixRow;
      media_items: MediaItemRow;
      datasets: DatasetRow;
      dataset_versions: DatasetVersionRow;
      dataset_metrics: DatasetMetricRow;
      dataset_dimensions: DatasetDimensionRow;
      dataset_series: DatasetSeriesRow;
      dataset_observations: DatasetObservationRow;
      dataset_visualizations: DatasetVisualizationRow;
      users: UserRow;
      bookmarks: BookmarkRow;
    };
  };
}

export interface StoryRow {
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

export interface TopicRow {
  Row: {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    related_entity_ids: string[];
    related_story_ids: string[];
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    slug: string;
    name: string;
    description: string;
    category?: string;
    tags?: string[];
    related_entity_ids?: string[];
    related_story_ids?: string[];
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    slug?: string;
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    related_entity_ids?: string[];
    related_story_ids?: string[];
    created_at?: string;
    updated_at?: string;
  };
}

export interface EntityRow {
  Row: {
    id: string;
    slug: string;
    name: string;
    description: string;
    type: string;
    aliases: string[];
    tags: string[];
    created_at: string;
    updated_at: string;
    image: string | null;
    story_count: number | null;
    evidence_score: number | null;
    related_entity_ids: string[] | null;
    related_story_ids: string[] | null;
    related_topic_ids: string[] | null;
    statistics: unknown | null;
    timeline: unknown | null;
    faq: unknown | null;
  };
  Insert: {
    id?: string;
    slug: string;
    name: string;
    description: string;
    type: string;
    aliases?: string[];
    tags?: string[];
    created_at?: string;
    updated_at?: string;
    image?: string | null;
    story_count?: number | null;
    evidence_score?: number | null;
    related_entity_ids?: string[] | null;
    related_story_ids?: string[] | null;
    related_topic_ids?: string[] | null;
    statistics?: unknown | null;
    timeline?: unknown | null;
    faq?: unknown | null;
  };
  Update: {
    id?: string;
    slug?: string;
    name?: string;
    description?: string;
    type?: string;
    aliases?: string[];
    tags?: string[];
    created_at?: string;
    updated_at?: string;
    image?: string | null;
    story_count?: number | null;
    evidence_score?: number | null;
    related_entity_ids?: string[] | null;
    related_story_ids?: string[] | null;
    related_topic_ids?: string[] | null;
    statistics?: unknown | null;
    timeline?: unknown | null;
    faq?: unknown | null;
  };
}

export interface TimelineRow {
  Row: {
    id: string;
    title: string;
    description: string;
    events: unknown;
    category: string;
    tags: string[];
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    title: string;
    description: string;
    events?: unknown;
    category?: string;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    title?: string;
    description?: string;
    events?: unknown;
    category?: string;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
  };
}

export interface FixRow {
  Row: {
    id: string;
    slug: string;
    title: string;
    problem: string;
    root_causes: string[];
    existing_solutions: string[];
    global_examples: string[];
    recommended_actions: string[];
    citizen_actions: string[];
    government_actions: string[];
    metrics: unknown;
    category: string;
    tags: string[];
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    slug: string;
    title: string;
    problem: string;
    root_causes?: string[];
    existing_solutions?: string[];
    global_examples?: string[];
    recommended_actions?: string[];
    citizen_actions?: string[];
    government_actions?: string[];
    metrics?: unknown;
    category?: string;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    slug?: string;
    title?: string;
    problem?: string;
    root_causes?: string[];
    existing_solutions?: string[];
    global_examples?: string[];
    recommended_actions?: string[];
    citizen_actions?: string[];
    government_actions?: string[];
    metrics?: unknown;
    category?: string;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
  };
}

export interface MediaItemRow {
  Row: {
    id: string;
    title: string;
    type: string;
    url: string;
    alt: string;
    width: number;
    height: number;
    file_size: number;
    tags: string[];
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    title: string;
    type: string;
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    file_size?: number;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    title?: string;
    type?: string;
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
    file_size?: number;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
  };
}

export interface DatasetRow {
  Row: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    frequency: string;
    unit_label: string;
    source: string;
    source_url: string;
    methodology: string;
    tags: string[];
    related_entity_ids: string[];
    related_story_ids: string[];
    related_topic_ids: string[];
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    slug: string;
    title: string;
    description: string;
    category?: string;
    frequency?: string;
    unit_label?: string;
    source?: string;
    source_url?: string;
    methodology?: string;
    tags?: string[];
    related_entity_ids?: string[];
    related_story_ids?: string[];
    related_topic_ids?: string[];
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    slug?: string;
    title?: string;
    description?: string;
    category?: string;
    frequency?: string;
    unit_label?: string;
    source?: string;
    source_url?: string;
    methodology?: string;
    tags?: string[];
    related_entity_ids?: string[];
    related_story_ids?: string[];
    related_topic_ids?: string[];
    created_at?: string;
    updated_at?: string;
  };
}

export interface DatasetVersionRow {
  Row: {
    id: string;
    dataset_id: string;
    version: string;
    notes: string;
    published_at: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    dataset_id: string;
    version: string;
    notes?: string;
    published_at?: string;
    created_at?: string;
  };
  Update: {
    id?: string;
    dataset_id?: string;
    version?: string;
    notes?: string;
    published_at?: string;
    created_at?: string;
  };
}

export interface DatasetMetricRow {
  Row: {
    id: string;
    dataset_id: string;
    name: string;
    label: string;
    description: string;
    data_type: string;
    unit: string;
    decimal_places: number;
    is_primary: boolean;
  };
  Insert: {
    id?: string;
    dataset_id: string;
    name: string;
    label: string;
    description?: string;
    data_type?: string;
    unit?: string;
    decimal_places?: number;
    is_primary?: boolean;
  };
  Update: {
    id?: string;
    dataset_id?: string;
    name?: string;
    label?: string;
    description?: string;
    data_type?: string;
    unit?: string;
    decimal_places?: number;
    is_primary?: boolean;
  };
}

export interface DatasetDimensionRow {
  Row: {
    id: string;
    dataset_id: string;
    name: string;
    label: string;
    values: string[];
  };
  Insert: {
    id?: string;
    dataset_id: string;
    name: string;
    label: string;
    values?: string[];
  };
  Update: {
    id?: string;
    dataset_id?: string;
    name?: string;
    label?: string;
    values?: string[];
  };
}

export interface DatasetSeriesRow {
  Row: {
    id: string;
    version_id: string;
    metric_id: string;
    dimension_filters: Record<string, string>;
  };
  Insert: {
    id?: string;
    version_id: string;
    metric_id: string;
    dimension_filters?: Record<string, string>;
  };
  Update: {
    id?: string;
    version_id?: string;
    metric_id?: string;
    dimension_filters?: Record<string, string>;
  };
}

export interface DatasetObservationRow {
  Row: {
    id: string;
    series_id: string;
    period: string;
    value: number | null;
    annotation: string | null;
  };
  Insert: {
    id?: string;
    series_id: string;
    period: string;
    value?: number | null;
    annotation?: string | null;
  };
  Update: {
    id?: string;
    series_id?: string;
    period?: string;
    value?: number | null;
    annotation?: string | null;
  };
}

export interface DatasetVisualizationRow {
  Row: {
    id: string;
    dataset_id: string;
    title: string;
    type: string;
    metric_ids: string[];
    dimension_filter: Record<string, string> | null;
    config: Record<string, unknown>;
  };
  Insert: {
    id?: string;
    dataset_id: string;
    title: string;
    type: string;
    metric_ids: string[];
    dimension_filter?: Record<string, string> | null;
    config?: Record<string, unknown>;
  };
  Update: {
    id?: string;
    dataset_id?: string;
    title?: string;
    type?: string;
    metric_ids?: string[];
    dimension_filter?: Record<string, string> | null;
    config?: Record<string, unknown>;
  };
}

export interface UserRow {
  Row: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    email: string;
    name: string;
    role?: string;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

export interface BookmarkRow {
  Row: {
    id: string;
    user_id: string;
    story_id: string;
    story_slug: string;
    story_title: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    story_id: string;
    story_slug: string;
    story_title: string;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    story_id?: string;
    story_slug?: string;
    story_title?: string;
    created_at?: string;
  };
}
