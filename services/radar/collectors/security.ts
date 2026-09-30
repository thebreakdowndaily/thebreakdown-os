/**
 * ─── Radar Collector Security & SSRF Guard ───────────────────────────────────
 *
 * Governing document: AGENTS.md (Security & System Defenses)
 *
 * Protects against Server-Side Request Forgery (SSRF), private network scanning,
 * cloud metadata service access (169.254.169.254), and loopback attacks.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254', // AWS/GCP/Azure link-local metadata
]);

export function isSafeExternalUrl(urlStr: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: `Disallowed protocol: ${parsed.protocol}` };
    }

    const hostname = parsed.hostname.toLowerCase();

    if (BLOCKED_HOSTNAMES.has(hostname)) {
      return { safe: false, reason: `Prohibited private or metadata hostname: ${hostname}` };
    }

    if (hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.onion')) {
      return { safe: false, reason: `Prohibited local/internal domain: ${hostname}` };
    }

    // IPv4 private address ranges check
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const octet1 = parseInt(ipv4Match[1], 10);
      const octet2 = parseInt(ipv4Match[2], 10);

      // 10.0.0.0/8
      if (octet1 === 10) return { safe: false, reason: 'Private IP space (10.0.0.0/8)' };
      // 127.0.0.0/8
      if (octet1 === 127) return { safe: false, reason: 'Loopback IP space (127.0.0.0/8)' };
      // 169.254.0.0/16 (Link Local / Cloud Metadata)
      if (octet1 === 169 && octet2 === 254) return { safe: false, reason: 'Link-local/metadata IP space' };
      // 172.16.0.0/12
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return { safe: false, reason: 'Private IP space (172.16.0.0/12)' };
      // 192.168.0.0/16
      if (octet1 === 192 && octet2 === 168) return { safe: false, reason: 'Private IP space (192.168.0.0/16)' };
      // 0.0.0.0
      if (octet1 === 0) return { safe: false, reason: 'Zero IP space' };
    }

    return { safe: true };
  } catch (err) {
    return { safe: false, reason: `Malformed URL: ${err instanceof Error ? err.message : String(err)}` };
  }
}
