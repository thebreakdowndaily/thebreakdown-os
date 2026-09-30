import { XMLParser } from 'fast-xml-parser';
import { createHash } from 'node:crypto';
import { RadarCollector, sanitizeHtml } from './interface';
import { RadarSourceDefinition, CollectorResult, RawArtifact, CollectorConfig, DEFAULT_COLLECTOR_CONFIG } from '../types';
import { isSafeExternalUrl } from './security';

export class RssCollector implements RadarCollector {
  readonly type = 'rss';
  
  constructor(private config: CollectorConfig = DEFAULT_COLLECTOR_CONFIG) {}

  async collect(source: RadarSourceDefinition): Promise<CollectorResult> {
    const startTime = Date.now();
    const result: CollectorResult = {
      artifacts: [],
      errors: [],
      fetchDurationMs: 0
    };

    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), this.config.timeoutMs);

      if (!this.config.allowPrivateIps) {
        const check = isSafeExternalUrl(source.url);
        if (!check.safe) {
          throw new Error(`SSRF blocked: ${check.reason}`);
        }
      }

      const response = await fetch(source.url, {
        signal: abortController.signal,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
        }
      });

      clearTimeout(timeoutId);
      result.httpStatus = response.status;
      result.fetchDurationMs = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      // Check content length header as early warning, but don't trust it
      const contentLengthHeader = response.headers.get('content-length');
      if (contentLengthHeader && parseInt(contentLengthHeader, 10) > this.config.maxResponseBytes) {
        throw new Error('Response exceeds maximum allowed size based on Content-Length header');
      }

      // Read response chunks to enforce maxResponseBytes
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      let bytesReceived = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          bytesReceived += value.length;
          if (bytesReceived > this.config.maxResponseBytes) {
            throw new Error(`Response exceeds maximum allowed size of ${this.config.maxResponseBytes} bytes`);
          }
          chunks.push(value);
        }
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const xmlContent = new TextDecoder('utf-8').decode(combined);
      
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseTagValue: true
      });
      
      const parsedXml = parser.parse(xmlContent);
      const items = this.extractItems(parsedXml);

      for (const item of items) {
        try {
          const rawTitle = item.title || item.title?.['#text'] || '';
          const rawLink = this.extractLink(item);
          const rawContent = item.description || item.content || item['content:encoded'] || '';
          const pubDate = item.pubDate || item.published || item.updated;
          
          if (!rawLink || !rawTitle) continue;

          const title = rawTitle.normalize('NFKC');
          const content = sanitizeHtml(rawContent).normalize('NFKC');
          
          // Generate hash based on normalized title + content
          const contentHash = createHash('sha256')
            .update(title + content)
            .digest('hex');

          let publishedAt: string | undefined;
          if (pubDate) {
            const parsedDate = new Date(pubDate);
            if (!isNaN(parsedDate.getTime())) {
              publishedAt = parsedDate.toISOString();
            }
          }

          result.artifacts.push({
            sourceId: source.id,
            url: rawLink,
            retrievedAt: new Date().toISOString(),
            publishedAt,
            title,
            content,
            contentHash,
            contentLength: content.length,
            metadata: {
              guid: item.guid?.['#text'] || item.guid || item.id,
              author: item.author || item['dc:creator']
            }
          });
        } catch (itemErr) {
          result.errors.push(`Error parsing item: ${itemErr instanceof Error ? itemErr.message : String(itemErr)}`);
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        result.errors.push('Request timed out');
      } else {
        result.errors.push(error instanceof Error ? error.message : String(error));
      }
      result.fetchDurationMs = Date.now() - startTime;
    }

    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractItems(parsedXml: any): any[] {
    if (parsedXml.rss && parsedXml.rss.channel && parsedXml.rss.channel.item) {
      const items = parsedXml.rss.channel.item;
      return Array.isArray(items) ? items : [items];
    }
    if (parsedXml.feed && parsedXml.feed.entry) {
      const entries = parsedXml.feed.entry;
      return Array.isArray(entries) ? entries : [entries];
    }
    if (parsedXml['rdf:RDF'] && parsedXml['rdf:RDF'].item) {
      const items = parsedXml['rdf:RDF'].item;
      return Array.isArray(items) ? items : [items];
    }
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractLink(item: any): string {
    if (typeof item.link === 'string') return item.link;
    if (item.link && item.link['@_href']) return item.link['@_href'];
    if (Array.isArray(item.link)) {
      const altLink = item.link.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel']);
      if (altLink) return altLink['@_href'] || '';
    }
    return '';
  }
}
