import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SourceCandidateValidator } from '../discovery/validation';
import { DISCOVERY_GOLDEN_DATASET } from '../discovery/golden-dataset';
import { MP_RADAR_SOURCES } from '@/data/radar/sources-mp';

describe('Discovery Validation & Golden Dataset Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects SSRF cloud metadata IP bypasses with ssrf_blocked', async () => {
    const validator = new SourceCandidateValidator();
    const fixture = DISCOVERY_GOLDEN_DATASET.find((f) => f.fixtureType === 'malicious_ssrf')!;

    const result = await validator.validate(fixture.candidate);
    expect(result.validationStatus).toBe('rejected');
    expect(result.rejectionReason).toBe('ssrf_blocked');
  });

  it('rejects duplicate URLs matching active monitored sources', async () => {
    const validator = new SourceCandidateValidator();
    const fixture = DISCOVERY_GOLDEN_DATASET.find((f) => f.fixtureType === 'duplicate_source')!;

    const result = await validator.validate(fixture.candidate, {
      existingSources: MP_RADAR_SOURCES,
    });

    expect(result.validationStatus).toBe('rejected');
    expect(result.rejectionReason).toBe('duplicate_source');
  });

  it('validates legitimate PDF and HTML government endpoints', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.endsWith('.pdf')) {
        return new Response('%PDF-1.5 stream', {
          status: 200,
          headers: { 'content-type': 'application/pdf' },
        });
      }
      return new Response('<html><head><title>MP Govt</title></head><body>Welcome</body></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      });
    });

    const validator = new SourceCandidateValidator();
    const officialFixture = DISCOVERY_GOLDEN_DATASET.find((f) => f.fixtureType === 'valid_official')!;
    const pdfFixture = DISCOVERY_GOLDEN_DATASET.find((f) => f.fixtureType === 'pdf_gazette')!;

    const validHtml = await validator.validate(officialFixture.candidate);
    expect(validHtml.validationStatus).toBe('validated');

    const validPdf = await validator.validate(pdfFixture.candidate);
    expect(validPdf.validationStatus).toBe('validated');
  });

  it('rejects unreachable endpoints with unreachable status', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response('Not Found', { status: 404, statusText: 'Not Found' });
    });

    const validator = new SourceCandidateValidator();
    const deadFixture = DISCOVERY_GOLDEN_DATASET.find((f) => f.fixtureType === 'dead_url')!;

    const result = await validator.validate(deadFixture.candidate);
    expect(result.validationStatus).toBe('rejected');
    expect(result.rejectionReason).toBe('unreachable');
  });
});
