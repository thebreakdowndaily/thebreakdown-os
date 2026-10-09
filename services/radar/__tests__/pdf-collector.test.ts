import { describe, it, expect } from 'vitest';
import { parsePdfBuffer } from '../collectors/pdf-parser';
import { PdfCollector } from '../collectors/pdf';
import { deflateSync } from 'node:zlib';

describe('PDF Collector & Document Version Detection', () => {
  it('extracts plain text and metadata from uncompressed PDF streams', () => {
    const rawPdf = `%PDF-1.7
1 0 obj
<< /Title (MP Gazette Notification) /CreationDate (D:20260929) >>
endobj
2 0 obj
<< /Length 120 >>
stream
BT
/F1 12 Tf
(Order No. F-14/2026/Rules Bhopal) Tj
[(Amendment ) -10 (to Public Service Delivery)] TJ
ET
endstream
endobj
%%EOF`;

    const buffer = Buffer.from(rawPdf, 'utf-8');
    const result = parsePdfBuffer(buffer);

    expect(result.pdfVersion).toBe('1.7');
    expect(result.title).toBe('MP Gazette Notification');
    expect(result.normalizedText).toContain('Order No. F-14/2026/Rules Bhopal');
    expect(result.normalizedText).toContain('Amendment to Public Service Delivery');
    expect(result.orderNumber).toBe('F-14/2026/Rules');
    expect(result.isAmendment).toBe(true);
  });

  it('decompresses and extracts text from FlateDecode compressed PDF streams', () => {
    const streamText = `BT (Corrigendum: Order No. HC-991/2026 Jabalpur High Court) Tj ET`;
    const compressedStream = deflateSync(Buffer.from(streamText, 'utf-8'));

    const header = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Filter /FlateDecode /Length ${compressedStream.length} >>\nstream\n`, 'binary');
    const footer = Buffer.from(`\nendstream\nendobj\n%%EOF`, 'binary');
    const fullBuffer = Buffer.concat([header, compressedStream, footer]);

    const result = parsePdfBuffer(fullBuffer);
    expect(result.normalizedText).toContain('Corrigendum: Order No. HC-991/2026 Jabalpur High Court');
    expect(result.isCorrigendum).toBe(true);
    expect(result.orderNumber).toBe('HC-991/2026');
  });

  it('rejects SSRF attempts in PdfCollector', async () => {
    const collector = new PdfCollector();
    const result = await collector.collect({
      id: 'ssrf-test',
      name: 'Localhost PDF',
      publisher: 'Test',
      sourceType: 'GOVERNMENT',
      adapter: 'radar-pdf',
      url: 'http://127.0.0.1/orders.pdf',
      canonicalDomain: '127.0.0.1',
      authorityClass: 'PRIMARY',
      primarySource: true,
      enabled: true,
      topics: [],
      geographies: ['INDIA'],
      priority: 'P0',
      refreshPolicy: 'HOURLY',
      approvalStatus: 'PROPOSED',
      country: 'india',
      state: 'mp',
      beat: 'government',
      officialStatus: 'official_primary',
      pollIntervalMinutes: 30,
      collectorType: 'pdf',
    });

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('SSRF blocked');
    expect(result.artifacts.length).toBe(0);
  });
});
