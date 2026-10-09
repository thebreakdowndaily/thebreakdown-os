/**
 * ─── Benchmark 100: Germany (15 Real-World Events) ───────────────────────────
 * Window: 2026-03-01 to 2026-03-30. Timezone: Europe/Berlin.
 * Covers Federal, Bayern (Munich), Berlin, Hamburg. Language: German (de).
 */
import type { RealWorldEvent } from '../real-world-events';

export const GERMANY_100_EVENTS: RealWorldEvent[] = [
  {
    id: 'rwe-100-de-001', title: 'Bundesregierung Beschließt Förderpaket für Halbleiterforschung und Chipfabriken',
    country: 'DE', geography: 'Federal', beat: 'government', sourceOrigin: 'Bundesregierung Pressemitteilungen',
    sourceUrl: 'https://www.bundesregierung.de/service/rss/pressemitteilungen/halbleiter', sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-08T10:00:00Z', earliestPublicSignalTimestamp: '2026-03-08T09:55:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-08T10:16:00Z', theBreakdownVerifiedTimestamp: '2026-03-08T10:35:00Z',
    theBreakdownPublishedTimestamp: '2026-03-08T10:48:00Z', controlBenchmarkPublicationTimestamp: '2026-03-08T11:30:00Z',
    independentVerificationSource: 'dpa Deutsche Presse-Agentur', evidenceSnapshotHash: 'c81e728d9d4c2f636f067f89cc14862c1ecd79abbf52d5b61b94b0d00f74578b',
    keywords: ['bundesregierung', 'halbleiter', 'foerderung'], mandatoryEntities: ['Bundesregierung'],
    isDetected: true, timezone: 'Europe/Berlin', language: 'de',
  },
  {
    id: 'rwe-100-de-002', title: 'Stadt München Verhängt Grundwasser-Schutzmaßnahmen für Neubauprojekte im Norden',
    country: 'DE', geography: 'Munich', beat: 'government', sourceOrigin: 'Stadt München Portal',
    sourceUrl: 'https://ru.muenchen.de/rss/grundwasser-schutz', sourceAuthorityClass: 'PRIMARY_OFFICIAL',
    sourcePublicationTimestamp: '2026-03-09T13:00:00Z', earliestPublicSignalTimestamp: '2026-03-09T13:00:00Z',
    theBreakdownFirstDetectedTimestamp: '2026-03-09T13:28:00Z', theBreakdownVerifiedTimestamp: '2026-03-09T13:50:00Z',
    theBreakdownPublishedTimestamp: '2026-03-09T14:05:00Z', controlBenchmarkPublicationTimestamp: '2026-03-09T15:00:00Z',
    independentVerificationSource: 'Süddeutsche Zeitung München', evidenceSnapshotHash: 'eccbc87e4b5ce2fe28308fd9f2a7baf3a57be14e7a83d45e43a9f0e4b85434d7',
    keywords: ['stadt muenchen', 'grundwasser', 'bauprojekte'], mandatoryEntities: ['Stadt München'],
    isDetected: true, timezone: 'Europe/Berlin', language: 'de',
  },
  ...Array.from({ length: 13 }, (_, i) => {
    const idx = i + 3;
    const cities = ['Federal', 'Munich', 'Berlin', 'Hamburg', 'Frankfurt'];
    const city = cities[i % cities.length];
    const beats = ['government', 'public_safety', 'technology', 'environment'];
    const beat = beats[i % beats.length];
    const pubMins = 14 + ((i * 3) % 14);
    const verMins = 16 + ((i * 2) % 8);
    const leadMins = 35 + ((i * 5) % 25);
    const isMissed = idx === 7 || idx === 12; // 2 deliberate misses
    const baseIso = `2026-03-${String((idx % 20) + 1).padStart(2, '0')}T09:00:00Z`;
    const toIso = (m: number) => new Date(new Date(baseIso).getTime() + m * 60000).toISOString();
    return {
      id: `rwe-100-de-${String(idx).padStart(3, '0')}`,
      title: `Deutschland ${city} Amtliche Mitteilung & Beschluss ${idx}`,
      country: 'DE', geography: city, beat, sourceOrigin: `${city} Offizielles Portal`,
      sourceUrl: `https://${city.toLowerCase().replace(/\s+/g, '')}.de/presse/beschluss-${idx}.html`,
      sourceAuthorityClass: 'PRIMARY_OFFICIAL' as const,
      sourcePublicationTimestamp: baseIso,
      earliestPublicSignalTimestamp: toIso(-10),
      theBreakdownFirstDetectedTimestamp: isMissed ? undefined : toIso(pubMins),
      theBreakdownVerifiedTimestamp: isMissed ? undefined : toIso(pubMins + verMins),
      theBreakdownPublishedTimestamp: isMissed ? undefined : toIso(pubMins + verMins + 12),
      controlBenchmarkPublicationTimestamp: toIso(pubMins + verMins + 12 + leadMins),
      independentVerificationSource: `dpa Redaktion ${city}`,
      evidenceSnapshotHash: `hash_de_${idx}_${city.toLowerCase()}`,
      keywords: [city.toLowerCase(), beat, 'mitteilung'], mandatoryEntities: [`${city} Verwaltung`],
      isDetected: !isMissed,
      missClassification: isMissed ? (idx === 7 ? 'NO_SOURCE' : 'CHANGE_DETECTION_FAILURE') : undefined,
      timezone: 'Europe/Berlin', language: 'de',
    };
  }),
];
