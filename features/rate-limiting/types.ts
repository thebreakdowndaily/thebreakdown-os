export type RateLimitTier =
  | 'auth'           // 10 req/min (Login, Auth, Admin Key Provisioning)
  | 'ai'             // 15 req/min (Copilot, LLM, heavy AI)
  | 'intelligence'   // 20 req/min (Image resolution, visual builder)
  | 'export'         // 10 req/min (Data download, CSV exports)
  | 'search'         // 30 req/min (Semantic search, graphs)
  | 'mutation'       // 20 req/min (Publish, delete, schedule)
  | 'checkout'       // 1 req/min (Prevent duplicate checkout charges)
  | 'standard_api'   // 120 req/min (Authenticated API keys)
  | 'public_api'     // 60 req/min (Unauthenticated public reads)
  | 'unlimited';     // Bypass (e.g. internal crons with CRON_SECRET)

export interface RateLimitPolicy {
  windowSeconds: number;
  maxRequests: number;
  failClosed: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds?: number;
}

export interface RateLimitStore {
  readonly name: string;
  increment(key: string, windowSeconds: number, maxLimit: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
  isAvailable(): Promise<boolean>;
}
