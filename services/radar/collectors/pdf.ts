import { createHash } from 'node:crypto';
import { RadarCollector } from './interface';
import { RadarSourceDefinition, CollectorResult, CollectorConfig, DEFAULT_COLLECTOR_CONFIG } from '../types';
import { isSafeExternalUrl } from './security';
import { parsePdfBuffer } from './pdf-parser';

export const DEFAULT_PDF_MAX_BYTES = 10 * 1024 * 1024; // 10MB limit

export class PdfCollector implements RadarCollector {
  readonly type = 'pdf';

  constructor(
    private config: CollectorConfig = {
      ...DEFAULT_COLLECTOR_CONFIG,
      maxResponseBytes: DEFAULT_PDF_MAX_BYTES,
    }
  ) {}

  async collect(source: RadarSourceDefinition): Promise<CollectorResult> {
    const startTime = Date.now();
    const result: CollectorResult = {
      artifacts: [],
      errors: [],
      fetchDurationMs: 0,
    };

    try {
      if (!this.config.allowPrivateIps) {
        const check = isSafeExternalUrl(source.url);
        if (!check.safe) {
          throw new Error(`SSRF blocked: ${check.reason}`);
        }
      }

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), this.config.timeoutMs);

      const response = await fetch(source.url, {
        signal: abortController.signal,
        headers: {
          'User-Agent': this.config.userAgent,
          Accept: 'application/pdf,application/octet-stream,*/*',
        },
      });

      clearTimeout(timeoutId);
      result.httpStatus = response.status;
      result.fetchDurationMs = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const isPdfMime =
        contentType.includes('application/pdf') ||
        contentType.includes('application/x-pdf') ||
        contentType.includes('application/octet-stream') ||
        source.url.toLowerCase().endsWith('.pdf');

      if (!isPdfMime) {
        throw new Error(`Unsupported content-type for PDF collector: ${contentType}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('PDF response body is null');
      }

      let bytesReceived = 0;
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          bytesReceived += value.length;
          if (bytesReceived > this.config.maxResponseBytes) {
            throw new Error(`PDF exceeds limit of ${this.config.maxResponseBytes} bytes`);
          }
          chunks.push(value);
        }
      }

      const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const pdfBuffer = Buffer.from(combined);
      if (!pdfBuffer.subarray(0, 1024).toString('binary').includes('%PDF-')) {
        throw new Error('Invalid PDF format: missing %PDF- header');
      }

      const parsed = parsePdfBuffer(pdfBuffer);
      const contentHash = createHash('sha256').update(parsed.normalizedText || pdfBuffer).digest('hex');

      const rawSha256 = createHash('sha256').update(pdfBuffer).digest('hex');

      result.artifacts.push({
        sourceId: source.id,
        url: response.url || source.url,
        retrievedAt: new Date().toISOString(),
        title: (parsed.title || source.name).normalize('NFKC'),
        content: parsed.normalizedText,
        contentHash,
        contentLength: parsed.normalizedText.length,
        rawPayload: pdfBuffer,
        rawSha256,
        mimeType: 'application/pdf',
        metadata: {
          isPdf: true,
          pdfVersion: parsed.pdfVersion,
          orderNumber: parsed.orderNumber,
          isAmendment: parsed.isAmendment,
          isCorrigendum: parsed.isCorrigendum,
          versionMarker: parsed.versionMarker,
          creationDate: parsed.creationDate,
          modDate: parsed.modDate,
          byteSize: bytesReceived,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        result.errors.push('PDF request timed out');
      } else {
        result.errors.push(err instanceof Error ? err.message : String(err));
      }
      result.fetchDurationMs = Date.now() - startTime;
    }

    return result;
  }
}
