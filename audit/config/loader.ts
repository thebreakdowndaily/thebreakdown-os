// audit/config/loader.ts
export interface Config {
  [key: string]: unknown;
}

export function loadConfig(_path: string): Config {
  // Placeholder – return empty config for now
  return {};
}
