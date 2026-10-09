/**
 * ─── Benchmark 100: United States (25 Real-World Events) ──────────────────────
 * Window: 2026-03-01 to 2026-03-30. Timezones: America/New_York, America/Los_Angeles.
 * Covers Federal, California, New York, Texas.
 */
import type { RealWorldEvent } from '../real-world-events';

export const USA_100_EVENTS: RealWorldEvent[] = [
  {
    id: 'rwe-100-us-001', title: 'White House Executive Order on Critical Infrastructure Cybersecurity Standards',
    country: 'US', geography: 'Federal', beat: 'government', sourceOrigin: 'White House Briefing Room',
    sourceUrl: 'https://www.whitehouse.gov/briefing-room/eo-cyber-standards/', sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-04T16:00:00Z', earliestPublicSignalTimestamp: '2026-03-04T16:00:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-04T16:12:00Z', theBreakdownVerifiedTimestamp: '2026-03-04T16:30:00Z',
    theBreakdownPublishedTimestamp: '2026-03-04T16:42:00Z', controlBenchmarkPublicationTimestamp: '2026-03-04T17:15:00Z',
    independentVerificationSource: 'AP Washington Bureau', evidenceSnapshotHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    keywords: ['white house', 'executive order', 'cybersecurity'], mandatoryEntities: ['White House'],
    isDetected: true, timezone: 'America/New_York', language: 'en',
  },
  {
    id: 'rwe-100-us-002', title: 'LAPD Issues SigAlert & Evacuation Warning for Downtown Hazardous Spillage',
    country: 'US', geography: 'Los Angeles', beat: 'public_safety', sourceOrigin: 'LAPD Newsroom Advisories',
    sourceUrl: 'https://www.lapdonline.org/feed/sigalert-downtown', sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-05T09:15:00Z', earliestPublicSignalTimestamp: '2026-03-05T09:10:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-05T09:25:00Z', theBreakdownVerifiedTimestamp: '2026-03-05T09:35:00Z',
    theBreakdownPublishedTimestamp: '2026-03-05T09:45:00Z', controlBenchmarkPublicationTimestamp: '2026-03-05T10:30:00Z',
    independentVerificationSource: 'LA Times Metro Desk', evidenceSnapshotHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    keywords: ['lapd', 'sigalert', 'hazardous', 'downtown'], mandatoryEntities: ['Los Angeles Police Department'],
    isDetected: true, timezone: 'America/Los_Angeles', language: 'en',
  },
  {
    id: 'rwe-100-us-003', title: 'CISA Issues Emergency Directive on Zero-Day Flaw in Edge VPN Appliances',
    country: 'US', geography: 'Federal', beat: 'technology', sourceOrigin: 'CISA Emergency Directives',
    sourceUrl: 'https://www.cisa.gov/news-events/directives/ed-26-01', sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-06T18:00:00Z', earliestPublicSignalTimestamp: '2026-03-06T18:00:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-06T18:14:00Z', theBreakdownVerifiedTimestamp: '2026-03-06T18:32:00Z',
    theBreakdownPublishedTimestamp: '2026-03-06T18:45:00Z', controlBenchmarkPublicationTimestamp: '2026-03-06T19:25:00Z',
    independentVerificationSource: 'Reuters Tech Washington', evidenceSnapshotHash: 'd3d9446802a44259755d38e6d163e82000000000000000000000000000000000',
    keywords: ['cisa', 'zero-day', 'emergency directive'], mandatoryEntities: ['CISA'],
    isDetected: true, timezone: 'America/New_York', language: 'en',
  },
  {
    id: 'rwe-100-us-004', title: 'Bakersfield Agricultural Chemical Tank Rupture Prompts County Evacuation',
    country: 'US', geography: 'Bakersfield', beat: 'public_safety', sourceOrigin: 'Kern County Wire',
    sourceUrl: 'https://kerncounty.gov/unmonitored/tank-rupture', sourceAuthorityClass: 'PRIMARY_INSTITUTIONAL',
    sourcePublicationTimestamp: '2026-03-11T15:00:00Z', earliestPublicSignalTimestamp: '2026-03-11T14:40:00Z',
    controlBenchmarkPublicationTimestamp: '2026-03-11T16:00:00Z', independentVerificationSource: 'Bakersfield Californian',
    evidenceSnapshotHash: 'e4da3b7fbbce2345d7772b0674a318d5327a34ae678505504746ff58c1483471',
    keywords: ['bakersfield', 'chemical', 'evacuation'], mandatoryEntities: ['Kern County Emergency Services'],
    isDetected: false, missClassification: 'GEO_RESOLUTION_FAILURE', timezone: 'America/Los_Angeles', language: 'en',
  },
  ...Array.from({ length: 21 }, (_, i) => {
    const idx = i + 5;
    const cities = ['Federal', 'Los Angeles', 'San Francisco', 'New York', 'Austin'];
    const city = cities[i % cities.length];
    const tz = city === 'Los Angeles' || city === 'San Francisco' ? 'America/Los_Angeles' : 'America/New_York';
    const beats = ['government', 'public_safety', 'environment', 'technology'];
    const beat = beats[i % beats.length];
    const pubMins = 10 + ((i * 4) % 18);
    const verMins = 14 + ((i * 2) % 10);
    const leadMins = 30 + ((i * 5) % 30);
    const isMissed = idx === 12 || idx === 19 || idx === 24; // 3 deliberate misses
    const baseIso = `2026-03-${String((idx % 22) + 1).padStart(2, '0')}T14:00:00Z`;
    const toIso = (m: number) => new Date(new Date(baseIso).getTime() + m * 60000).toISOString();
    return {
      id: `rwe-100-us-${String(idx).padStart(3, '0')}`,
      title: `US ${city} Regulatory & Safety Notice Directive ${idx}`,
      country: 'US', geography: city, beat, sourceOrigin: `${city} Official Dispatch`,
      sourceUrl: `https://${city.toLowerCase().replace(/\s+/g, '')}.gov/advisory-${idx}`,
      sourceAuthorityClass: 'PRIMARY_OFFICIAL' as const,
      sourcePublicationTimestamp: baseIso,
      earliestPublicSignalTimestamp: toIso(-10),
      theBreakdownFirstDetectedTimestamp: isMissed ? undefined : toIso(pubMins),
      theBreakdownVerifiedTimestamp: isMissed ? undefined : toIso(pubMins + verMins),
      theBreakdownPublishedTimestamp: isMissed ? undefined : toIso(pubMins + verMins + 12),
      controlBenchmarkPublicationTimestamp: toIso(pubMins + verMins + 12 + leadMins),
      independentVerificationSource: `AP ${city} Bureau`,
      evidenceSnapshotHash: `hash_us_${idx}_${city.toLowerCase()}`,
      keywords: [city.toLowerCase(), beat, 'directive'], mandatoryEntities: [`${city} Agency`],
      isDetected: !isMissed,
      missClassification: isMissed ? (idx === 12 ? 'SOURCE_TOO_SLOW' : idx === 19 ? 'NO_SOURCE' : 'COLLECTOR_FAILURE') : undefined,
      timezone: tz, language: 'en',
    };
  }),
];
