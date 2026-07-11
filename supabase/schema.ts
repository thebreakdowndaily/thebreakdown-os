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
      activity_log: ActivityLogRow;
      index_entries: IndexEntryRow;
      nodes: GraphNodeRow;
      edges: GraphEdgeRow;
      claims: ClaimRow;
      sources: SourceRow;
    };
  };
}

export interface StoryRow {
  Row: {
    id: string;
    legacy_id: string | null;
    slug: string;
    title: string;
    headline: string;
    summary: string;
    hero_image: string;
    author: string;
    category: string;
    status: string;
    evidence_score: number;
    reading_time: number;
    tags: string[];
    blocks: unknown;
    sources: unknown;
    claims: unknown;
    timeline: unknown;
    faq: unknown;
    charts: unknown;
    related_story_ids: string[];
    related_entity_ids: string[];
    related_topic_ids: string[];
    notes: string | null;
    version: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    updated_by: string | null;
  };
  Insert: {
    id?: string;
    legacy_id?: string | null;
    slug: string;
    title: string;
    headline?: string;
    summary?: string;
    hero_image?: string;
    author?: string;
    category?: string;
    status?: string;
    evidence_score?: number;
    reading_time?: number;
    tags?: string[];
    blocks?: unknown;
    sources?: unknown;
    claims?: unknown;
    timeline?: unknown;
    faq?: unknown;
    charts?: unknown;
    related_story_ids?: string[];
    related_entity_ids?: string[];
    related_topic_ids?: string[];
    notes?: string | null;
    version?: number;
    published_at?: string | null;
    created_at?: string;
    updated_at?: string;
    updated_by?: string | null;
  };
  Update: {
    id?: string;
    legacy_id?: string | null;
    slug?: string;
    title?: string;
    headline?: string;
    summary?: string;
    hero_image?: string;
    author?: string;
    category?: string;
    status?: string;
    evidence_score?: number;
    reading_time?: number;
    tags?: string[];
    blocks?: unknown;
    sources?: unknown;
    claims?: unknown;
    timeline?: unknown;
    faq?: unknown;
    charts?: unknown;
    related_story_ids?: string[];
    related_entity_ids?: string[];
    related_topic_ids?: string[];
    notes?: string | null;
    version?: number;
    published_at?: string | null;
    created_at?: string;
    updated_at?: string;
    updated_by?: string | null;
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
    story_ids: string[] | null;
    featured_story_ids: string[] | null;
    countries: string[] | null;
    faq: unknown | null;
    timeline: unknown | null;
    statistics: unknown | null;
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
    story_ids?: string[] | null;
    featured_story_ids?: string[] | null;
    countries?: string[] | null;
    faq?: unknown | null;
    timeline?: unknown | null;
    statistics?: unknown | null;
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
    story_ids?: string[] | null;
    featured_story_ids?: string[] | null;
    countries?: string[] | null;
    faq?: unknown | null;
    timeline?: unknown | null;
    statistics?: unknown | null;
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
    story_ids: string[] | null;
    entity_ids: string[] | null;
    topic_ids: string[] | null;
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
    story_ids?: string[] | null;
    entity_ids?: string[] | null;
    topic_ids?: string[] | null;
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
    story_ids?: string[] | null;
    entity_ids?: string[] | null;
    topic_ids?: string[] | null;
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
    status: string | null;
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
    status?: string | null;
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
    status?: string | null;
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
    src: string | null;
    caption: string | null;
    credit: string | null;
    version: number | null;
    agency: string | null;
    copyright_owner: string | null;
    photographer: string | null;
    captured_at: string | null;
    source_url: string | null;
    license_type: string | null;
    image_category: string | null;
    editorial_priority: string | null;
    long_description: string | null;
    sha256_hash: string | null;
    blur_hash: string | null;
    focus_point_x: number | null;
    focus_point_y: number | null;
    dominant_color: string | null;
    verification_status: string | null;
    is_ai_generated: boolean | null;
    ai_model: string | null;
    ai_prompt: string | null;
    ai_provider: string | null;
    generated_at: string | null;
    orientation: string | null;
    camera: string | null;
    lens: string | null;
    iso: string | null;
    gps: string | null;
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
    src?: string | null;
    caption?: string | null;
    credit?: string | null;
    version?: number | null;
    agency?: string | null;
    copyright_owner?: string | null;
    photographer?: string | null;
    captured_at?: string | null;
    source_url?: string | null;
    license_type?: string | null;
    image_category?: string | null;
    editorial_priority?: string | null;
    long_description?: string | null;
    sha256_hash?: string | null;
    blur_hash?: string | null;
    focus_point_x?: number | null;
    focus_point_y?: number | null;
    dominant_color?: string | null;
    verification_status?: string | null;
    is_ai_generated?: boolean | null;
    ai_model?: string | null;
    ai_prompt?: string | null;
    ai_provider?: string | null;
    generated_at?: string | null;
    orientation?: string | null;
    camera?: string | null;
    lens?: string | null;
    iso?: string | null;
    gps?: string | null;
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
    src?: string | null;
    caption?: string | null;
    credit?: string | null;
    version?: number | null;
    agency?: string | null;
    copyright_owner?: string | null;
    photographer?: string | null;
    captured_at?: string | null;
    source_url?: string | null;
    license_type?: string | null;
    image_category?: string | null;
    editorial_priority?: string | null;
    long_description?: string | null;
    sha256_hash?: string | null;
    blur_hash?: string | null;
    focus_point_x?: number | null;
    focus_point_y?: number | null;
    dominant_color?: string | null;
    verification_status?: string | null;
    is_ai_generated?: boolean | null;
    ai_model?: string | null;
    ai_prompt?: string | null;
    ai_provider?: string | null;
    generated_at?: string | null;
    orientation?: string | null;
    camera?: string | null;
    lens?: string | null;
    iso?: string | null;
    gps?: string | null;
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

export interface ActivityLogRow {
  Row: {
    id: string;
    event_type: string;
    entity_type: string;
    entity_id: string;
    entity_slug: string | null;
    user_id: string | null;
    metadata: unknown | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    event_type: string;
    entity_type: string;
    entity_id: string;
    entity_slug?: string | null;
    user_id?: string | null;
    metadata?: unknown | null;
    created_at?: string;
  };
  Update: {
    id?: string;
    event_type?: string;
    entity_type?: string;
    entity_id?: string;
    entity_slug?: string | null;
    user_id?: string | null;
    metadata?: unknown | null;
    created_at?: string;
  };
}

export interface GraphNodeRow {
  Row: { id: string; slug: string; ref_type: string; ref_id: string; [key: string]: unknown };
  Insert: { id?: string; slug?: string; ref_type?: string; ref_id?: string; [key: string]: unknown };
  Update: { id?: string; slug?: string; ref_type?: string; ref_id?: string; [key: string]: unknown };
}
export interface GraphEdgeRow {
  Row: { source_id: string; target_id: string; relation: string; [key: string]: unknown };
  Insert: { source_id?: string; target_id?: string; relation?: string; [key: string]: unknown };
  Update: { source_id?: string; target_id?: string; relation?: string; [key: string]: unknown };
}
export interface ClaimRow {
  Row: { id: string; status: string; confidence: number; [key: string]: unknown };
  Insert: { id?: string; status?: string; confidence?: number; [key: string]: unknown };
  Update: { id?: string; status?: string; confidence?: number; [key: string]: unknown };
}
export interface SourceRow {
  Row: { id: string; tier: string; title: string; [key: string]: unknown };
  Insert: { id?: string; tier?: string; title?: string; [key: string]: unknown };
  Update: { id?: string; tier?: string; title?: string; [key: string]: unknown };
}

export interface IndexEntryRow {
  Row: {
    ref_id: string;
    ref_type: string;
    ref_slug: string;
    title: string;
    description: string | null;
    content: string | null;
    tags: string[] | null;
    score: number | null;
    updated_at: string;
  };
  Insert: {
    ref_id: string;
    ref_type: string;
    ref_slug: string;
    title: string;
    description?: string | null;
    content?: string | null;
    tags?: string[] | null;
    score?: number | null;
    updated_at?: string;
  };
  Update: {
    ref_id?: string;
    ref_type?: string;
    ref_slug?: string;
    title?: string;
    description?: string | null;
    content?: string | null;
    tags?: string[] | null;
    score?: number | null;
    updated_at?: string;
  };
}

