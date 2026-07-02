export interface ApiKey {
  key: string;
  name: string;
  role: 'admin' | 'editor' | 'reader';
  createdAt: string;
  lastUsed: string | null;
  enabled: boolean;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100;

interface RateEntry {
  counts: number[];
  timer?: ReturnType<typeof setInterval>;
}

class ApiKeyManager {
  private keys: Map<string, ApiKey> = new Map();
  private rateMap: Map<string, RateEntry> = new Map();

  constructor() {
    this.seedFromEnv();
    this.startRateReset();
  }

  private seedFromEnv() {
    const raw = process.env.API_KEYS || '';
    if (!raw) {
      this.addKeyInternal('dev-key-0000-0000-0000-000000000000', 'Development Default', 'admin');
      return;
    }
    for (const entry of raw.split(',')) {
      const parts = entry.trim().split(':');
      if (parts.length >= 2) {
        this.addKeyInternal(parts[0], parts[1], (parts[2] as ApiKey['role']) || 'reader');
      }
    }
  }

  private addKeyInternal(key: string, name: string, role: ApiKey['role']) {
    this.keys.set(key, { key, name, role, createdAt: new Date().toISOString(), lastUsed: null, enabled: true });
  }

  private startRateReset() {
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        const now = Date.now();
        for (const [k, entry] of this.rateMap) {
          entry.counts = entry.counts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
          if (entry.counts.length === 0) this.rateMap.delete(k);
        }
      }, RATE_LIMIT_WINDOW_MS);
    }
  }

  validate(key: string): ApiKey | null {
    const apiKey = this.keys.get(key);
    if (!apiKey || !apiKey.enabled) return null;
    apiKey.lastUsed = new Date().toISOString();
    return apiKey;
  }

  checkRateLimit(key: string): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    let entry = this.rateMap.get(key);
    if (!entry) {
      entry = { counts: [] };
      this.rateMap.set(key, entry);
    }
    entry.counts = entry.counts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    const resetMs = entry.counts.length > 0
      ? RATE_LIMIT_WINDOW_MS - (now - entry.counts[0])
      : RATE_LIMIT_WINDOW_MS;

    if (entry.counts.length >= RATE_LIMIT_MAX) {
      return { allowed: false, remaining: 0, resetMs };
    }

    entry.counts.push(now);
    return { allowed: true, remaining: RATE_LIMIT_MAX - entry.counts.length, resetMs };
  }

  getAllKeys(): ApiKey[] {
    return Array.from(this.keys.values());
  }

  createKey(name: string, role: ApiKey['role'] = 'reader'): ApiKey {
    const key = crypto.randomUUID();
    const entry: ApiKey = { key, name, role, createdAt: new Date().toISOString(), lastUsed: null, enabled: true };
    this.keys.set(key, entry);
    return entry;
  }

  revokeKey(key: string): boolean {
    const entry = this.keys.get(key);
    if (!entry) return false;
    entry.enabled = false;
    return true;
  }

  deleteKey(key: string): boolean {
    return this.keys.delete(key);
  }
}

export const apiKeyManager = new ApiKeyManager();

export function validateApiKey(key: string): ApiKey | null {
  return apiKeyManager.validate(key);
}

export function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetMs: number } {
  return apiKeyManager.checkRateLimit(key);
}

export function getAllApiKeys(): ApiKey[] {
  return apiKeyManager.getAllKeys();
}

export function createApiKey(name: string, role: ApiKey['role'] = 'reader'): ApiKey {
  return apiKeyManager.createKey(name, role);
}

export function revokeApiKey(key: string): boolean {
  return apiKeyManager.revokeKey(key);
}

export function deleteApiKey(key: string): boolean {
  return apiKeyManager.deleteKey(key);
}
