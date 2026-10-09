import { RadarSourceDefinition, CollectorResult, CollectorConfig, DEFAULT_COLLECTOR_CONFIG } from '../types';

export interface RadarCollector {
  readonly type: string;
  collect(source: RadarSourceDefinition): Promise<CollectorResult>;
}

/**
 * Strips scripts, styles, event handlers, data URIs, and other dangerous content.
 * CRITICAL for security - all external HTML must be sanitized before any processing.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  let sanitized = html;
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove inline event handlers (on...)
  sanitized = sanitized.replace(/(\bon[a-z]+\s*=\s*)(['"]?)(.*?)\2/gi, '');
  
  // Remove javascript: and data: URIs
  sanitized = sanitized.replace(/href\s*=\s*(['"]?)\s*(javascript|data):.*?\1/gi, 'href=""');
  sanitized = sanitized.replace(/src\s*=\s*(['"]?)\s*(javascript|data):.*?\1/gi, 'src=""');
  
  // Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<(iframe|object|embed|applet)\b[^>]*>(?:.*?<\/\1>)?/gi, '');
  
  return sanitized;
}
