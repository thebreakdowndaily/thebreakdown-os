/**
 * THE BREAKDOWN — Plugin SDK Types
 *
 * Every plugin in the system conforms to these types.
 * The SDK enforces structure at load time via JSON Schema validation.
 */

// ── Manifest ───────────────────────────────────────────────────────────────

export interface PluginSource {
  url: string;
  type: 'rss' | 'api' | 'scrape' | 'file' | 'websocket';
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  auth?: 'none' | 'api-key' | 'oauth' | 'basic';
  authConfig?: {
    apiKeyHeader?: string;
    apiKeyEnv?: string;
    oauthEndpoint?: string;
    oauthClientIdEnv?: string;
    oauthClientSecretEnv?: string;
  };
  rateLimit?: {
    requestsPerMinute: number;
    burstSize?: number;
  };
}

export type TrustTier = 1 | 2 | 3 | 4 | 5;
export type PluginType = 'data-source' | 'processor' | 'analyzer' | 'transformer';
export type PluginStatus = 'active' | 'inactive' | 'error' | 'deprecated';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  trust_tier: TrustTier;
  status: PluginStatus;
  schedule: string;
  sources: PluginSource[];
  output_schema?: string;
  config: Record<string, unknown>;
  tags: string[];
  documentation?: string;
  dependencies?: string[];
}

// ── Plugin Output ──────────────────────────────────────────────────────────

export type FetchStatus = 'success' | 'partial' | 'error' | 'no_data';

export interface PluginMetadata {
  totalItems: number;
  source: string;
  status: FetchStatus;
  error?: string;
  durationMs: number;
  rateLimitRemaining?: number;
}

export interface PluginItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  trust_tier?: TrustTier;
}

export interface PluginOutput {
  pluginId: string;
  manifestVersion: string;
  fetchedAt: string;
  items: PluginItem[];
  metadata: PluginMetadata;
}

// ── Plugin Implementation ──────────────────────────────────────────────────

export interface PluginImplementation {
  manifest: PluginManifest;
  fetch(options?: Record<string, unknown>): Promise<PluginOutput>;
  validate?(output: PluginOutput): boolean;
  transform?(items: PluginItem[]): PluginItem[];
}

// ── Plugin Registry ────────────────────────────────────────────────────────

export interface PluginRegistryEntry {
  manifest: PluginManifest;
  lastRun?: string;
  lastStatus?: FetchStatus;
  lastOutput?: PluginOutput;
  errorCount: number;
  totalRuns: number;
  averageDurationMs: number;
}

export interface PluginRegistry {
  version: string;
  updatedAt: string;
  plugins: PluginRegistryEntry[];
}

// ── Plugin API Response ────────────────────────────────────────────────────

export interface PluginListResponse {
  count: number;
  plugins: (PluginManifest & {
    lastRun?: string;
    lastStatus?: FetchStatus;
    running: boolean;
  })[];
}

export interface PluginDataResponse {
  pluginId: string;
  manifest: PluginManifest;
  data: PluginOutput | null;
  cached: boolean;
  fetchedAt: string;
}

// ── Plugin Error ───────────────────────────────────────────────────────────

export class PluginError extends Error {
  constructor(
    message: string,
    public pluginId: string,
    public code: 'FETCH_ERROR' | 'VALIDATION_ERROR' | 'PARSE_ERROR' | 'TIMEOUT' | 'RATE_LIMIT' | 'AUTH_ERROR' | 'CONFIG_ERROR',
    public retryable: boolean = true
  ) {
    super(`[${pluginId}] ${code}: ${message}`);
    this.name = 'PluginError';
  }
}

// ── Source-Specific Extraction Types ──────────────────────────────────────

// PIB-specific metadata
export interface PIBMetadata {
  ministry?: string;
  pressId?: string;
  releaseType?: 'press-release' | 'statement' | 'notification' | 'circular';
  language?: string;
  locations?: string[];
}

// Parliament-specific metadata
export interface ParliamentMetadata {
  house: 'lok-sabha' | 'rajya-sabha' | 'joint';
  session?: string;
  billNumber?: string;
  billType?: 'government' | 'private-member';
  status?: 'introduced' | 'passed-ls' | 'passed-rs' | 'assented' | 'lapsed';
  debateDate?: string;
  committee?: string;
  mpName?: string;
  constituency?: string;
  party?: string;
  questionType?: 'starred' | 'unstarred' | 'short-notice';
  ministry?: string;
}

// RBI-specific metadata
export interface RBIMetadata {
  circularType?: 'master-circular' | 'notification' | 'circular' | 'press-release' | 'speech';
  department?: string;
  rbiReference?: string;
  relatedAct?: string;
  applicableTo?: string[];
  effectiveDate?: string;
}

// World Bank-specific metadata
export interface WorldBankMetadata {
  projectId?: string;
  region?: string;
  country?: string;
  sector?: string[];
  commitmentAmount?: number;
  status?: 'active' | 'closed' | 'pipeline';
  approvalDate?: string;
  environmentalCategory?: string;
  borrower?: string;
  implementingAgency?: string[];
}

// ECI-specific metadata
export interface ECIMetadata {
  electionType?: 'general' | 'state-assembly' | 'by-election' | 'local-body';
  state?: string;
  constituency?: string;
  phase?: number;
  totalPhases?: number;
  scheduleDate?: string;
  pollingDate?: string;
  resultDate?: string;
  notificationType?: 'schedule' | 'result' | 'model-code' | 'voter-list' | 'notification';
  party?: string;
  candidate?: string;
}

// Supreme Court-specific metadata
export interface SupremeCourtMetadata {
  caseNumber?: string;
  bench?: string;
  judges?: string[];
  petitioner?: string;
  respondent?: string;
  causeTitle?: string;
  courtType?: 'supreme-court' | 'high-court' | 'tribunal';
  judgmentDate?: string;
  acts?: string[];
  outcome?: 'allowed' | 'dismissed' | 'partially-allowed' | 'pending' | 'referred';
  civilAppealNumber?: string;
  criminalAppealNumber?: string;
  writPetitionNumber?: string;
}

// Weather-specific metadata
export interface WeatherMetadata {
  stationId?: string;
  city?: string;
  state?: string;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  windSpeed?: number;
  airQualityIndex?: number;
  forecastDay?: string;
  forecastType?: 'current' | 'forecast' | 'historical' | 'alert';
  alertType?: 'cyclone' | 'heatwave' | 'heavy-rainfall' | 'drought' | 'cold-wave';
  severity?: 'normal' | 'alert' | 'warning' | 'emergency';
}

// Trade-specific metadata
export interface TradeMetadata {
  tradeType?: 'export' | 'import' | 'balance';
  commodity?: string;
  commodityCode?: string;
  hsCode?: string;
  value?: number;
  volume?: number;
  unit?: string;
  country?: string;
  port?: string;
  period?: string;
  fiscalYear?: string;
  month?: string;
  direction?: 'export' | 'import';
  tradePartner?: string;
}
