import { createHash } from 'node:crypto';
import { RadarCollector, sanitizeHtml } from './interface';
import { RadarSourceDefinition, CollectorResult, RawArtifact, CollectorConfig, DEFAULT_COLLECTOR_CONFIG } from '../types';
import { isSafeExternalUrl } from './security';

export class HtmlCollector implements RadarCollector {
  readonly type = 'html';
  
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
        redirect: 'manual',
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      let finalResponse = response;
      let redirectCount = 0;
      const MAX_REDIRECTS = 5;
      
      // Handle redirects manually to prevent non-HTTP(S) redirects and enforce limits
      while (
        finalResponse.status >= 300 && 
        finalResponse.status < 400 && 
        finalResponse.headers.has('location')
      ) {
        if (redirectCount >= MAX_REDIRECTS) {
          throw new Error(`Too many redirects (max ${MAX_REDIRECTS})`);
        }
        
        const location = finalResponse.headers.get('location')!;
        const redirectUrl = new URL(location, source.url);
        
        if (redirectUrl.protocol !== 'http:' && redirectUrl.protocol !== 'https:') {
          throw new Error(`Invalid redirect protocol: ${redirectUrl.protocol}`);
        }

        if (!this.config.allowPrivateIps) {
          const check = isSafeExternalUrl(redirectUrl.toString());
          if (!check.safe) {
            throw new Error(`SSRF redirect blocked: ${check.reason}`);
          }
        }
        
        finalResponse = await fetch(redirectUrl.toString(), {
          signal: abortController.signal,
          redirect: 'manual',
          headers: {
            'User-Agent': this.config.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        
        redirectCount++;
      }

      clearTimeout(timeoutId);
      result.httpStatus = finalResponse.status;
      result.fetchDurationMs = Date.now() - startTime;

      if (!finalResponse.ok) {
        throw new Error(`HTTP error ${finalResponse.status}: ${finalResponse.statusText}`);
      }

      const contentType = finalResponse.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      // Check content length header as early warning, but don't trust it
      const contentLengthHeader = finalResponse.headers.get('content-length');
      if (contentLengthHeader && parseInt(contentLengthHeader, 10) > this.config.maxResponseBytes) {
        throw new Error('Response exceeds maximum allowed size based on Content-Length header');
      }

      // Read response chunks to enforce maxResponseBytes
      const reader = finalResponse.body?.getReader();
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

      const htmlContent = new TextDecoder('utf-8').decode(combined);
      
      const sanitizedHtml = sanitizeHtml(htmlContent);
      const textContent = sanitizedHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const normalizedText = textContent.normalize('NFKC');
      
      // Extract title
      let title = source.name;
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      } else {
        const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match && h1Match[1]) {
          title = h1Match[1].trim();
        }
      }
      
      // Extract links
      const links: string[] = [];
      const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
      let linkMatch;
      while ((linkMatch = linkRegex.exec(htmlContent)) !== null) {
        try {
          const urlStr = linkMatch[1];
          if (urlStr.startsWith('javascript:') || urlStr.startsWith('data:') || urlStr.startsWith('mailto:')) {
            continue;
          }
          const absoluteUrl = new URL(urlStr, finalResponse.url).toString();
          links.push(absoluteUrl);
        } catch {
          // ignore invalid URLs
        }
      }
      
      const uniqueLinks = [...new Set(links)];
      const documentLinks = uniqueLinks.filter(l => 
        l.endsWith('.pdf') || l.endsWith('.doc') || l.endsWith('.docx') || l.includes('download')
      );

      const contentHash = createHash('sha256')
        .update(normalizedText)
        .digest('hex');

      result.artifacts.push({
        sourceId: source.id,
        url: finalResponse.url,
        retrievedAt: new Date().toISOString(),
        title: title.normalize('NFKC'),
        content: sanitizedHtml,
        contentHash,
        contentLength: normalizedText.length,
        metadata: {
          allLinks: uniqueLinks.length > 100 ? uniqueLinks.slice(0, 100) : uniqueLinks,
          documentLinks
        }
      });

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
}
