/**
 * ─── Radar Collector Security & SSRF Guard ───────────────────────────────────
 *
 * Governing document: AGENTS.md (Security & System Defenses)
 *
 * Protects against Server-Side Request Forgery (SSRF), private network scanning,
 * cloud metadata service access (169.254.169.254), loopback attacks, IPv6 bypasses,
 * DNS rebinding, and unsafe redirects.
 */

import * as net from 'node:net';
import * as dns from 'node:dns';
import * as http from 'node:http';
import * as https from 'node:https';
import { Readable } from 'node:stream';

export type DnsResolver = (hostname: string) => Promise<Array<{ address: string; family: number }>>;

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254', // AWS/GCP/Azure link-local metadata
  'instance-data',
]);

const BLOCKED_DOMAIN_SUFFIXES = [
  '.local',
  '.internal',
  '.onion',
  '.localhost',
  '.lan',
  '.home',
  '.corp',
];

/**
 * Validates an IPv4 address string against prohibited/private/loopback/link-local ranges.
 */
function isSafeIpv4(ip: string): { safe: boolean; reason?: string } {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return { safe: false, reason: `Invalid IPv4 format: ${ip}` };
  }

  const [o1, o2, o3] = parts;

  // 0.0.0.0/8 — Current network ("this host")
  if (o1 === 0) {
    return { safe: false, reason: 'Zero/current network IP space (0.0.0.0/8)' };
  }

  // 10.0.0.0/8 — Private network
  if (o1 === 10) {
    return { safe: false, reason: 'Private IP space (10.0.0.0/8)' };
  }

  // 100.64.0.0/10 — Carrier-grade NAT / shared space (100.64.0.0 to 100.127.255.255)
  if (o1 === 100 && o2 >= 64 && o2 <= 127) {
    return { safe: false, reason: 'Shared/CGNAT IP space (100.64.0.0/10)' };
  }

  // 127.0.0.0/8 — Loopback
  if (o1 === 127) {
    return { safe: false, reason: 'Loopback IP space (127.0.0.0/8)' };
  }

  // 169.254.0.0/16 — Link-local / Cloud metadata
  if (o1 === 169 && o2 === 254) {
    return { safe: false, reason: 'Link-local/metadata IP space (169.254.0.0/16)' };
  }

  // 172.16.0.0/12 — Private network (172.16.0.0 to 172.31.255.255)
  if (o1 === 172 && o2 >= 16 && o2 <= 31) {
    return { safe: false, reason: 'Private IP space (172.16.0.0/12)' };
  }

  // 192.0.0.0/24 — IETF protocol assignments
  if (o1 === 192 && o2 === 0 && o3 === 0) {
    return { safe: false, reason: 'IETF protocol assignments (192.0.0.0/24)' };
  }

  // 192.0.2.0/24 — TEST-NET-1
  if (o1 === 192 && o2 === 0 && o3 === 2) {
    return { safe: false, reason: 'TEST-NET-1 (192.0.2.0/24)' };
  }

  // 192.88.99.0/24 — 6to4 relay anycast
  if (o1 === 192 && o2 === 88 && o3 === 99) {
    return { safe: false, reason: '6to4 relay anycast (192.88.99.0/24)' };
  }

  // 192.168.0.0/16 — Private network
  if (o1 === 192 && o2 === 168) {
    return { safe: false, reason: 'Private IP space (192.168.0.0/16)' };
  }

  // 198.18.0.0/15 — Network benchmark testing (198.18.0.0 to 198.19.255.255)
  if (o1 === 198 && (o2 === 18 || o2 === 19)) {
    return { safe: false, reason: 'Network benchmark testing (198.18.0.0/15)' };
  }

  // 198.51.100.0/24 — TEST-NET-2
  if (o1 === 198 && o2 === 51 && o3 === 100) {
    return { safe: false, reason: 'TEST-NET-2 (198.51.100.0/24)' };
  }

  // 203.0.113.0/24 — TEST-NET-3
  if (o1 === 203 && o2 === 0 && o3 === 113) {
    return { safe: false, reason: 'TEST-NET-3 (203.0.113.0/24)' };
  }

  // 224.0.0.0/4 — Multicast (224.0.0.0 to 239.255.255.255)
  if (o1 >= 224 && o1 <= 239) {
    return { safe: false, reason: 'Multicast IP space (224.0.0.0/4)' };
  }

  // 240.0.0.0/4 — Reserved / Broadcast (240.0.0.0 to 255.255.255.255)
  if (o1 >= 240) {
    return { safe: false, reason: 'Reserved/broadcast IP space (240.0.0.0/4)' };
  }

  return { safe: true };
}

/**
 * Validates an IPv6 address string against prohibited/loopback/link-local/unique-local ranges.
 */
function isSafeIpv6(rawIp: string): { safe: boolean; reason?: string } {
  let ip = rawIp.toLowerCase().trim();
  if (ip.startsWith('[') && ip.endsWith(']')) {
    ip = ip.slice(1, -1);
  }

  // Check IPv4-mapped IPv6 (::ffff:192.0.2.128 or ::ffff:7f00:1)
  const mappedDotted = ip.match(/(?:^|:)ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i);
  if (mappedDotted) {
    return isSafeIpv4(mappedDotted[1]);
  }

  // Hex notation for IPv4-mapped: ::ffff:xxxx:xxxx or ::ffff:x:x (e.g. ::ffff:7f00:1)
  const mappedHex = ip.match(/(?:^|:)ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    const o1 = (hi >> 8) & 0xff;
    const o2 = hi & 0xff;
    const o3 = (lo >> 8) & 0xff;
    const o4 = lo & 0xff;
    return isSafeIpv4(`${o1}.${o2}.${o3}.${o4}`);
  }

  // Check deprecated IPv4-compatible IPv6 (::192.0.2.128 or ::7f00:1)
  const compatDotted = ip.match(/^::(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (compatDotted) {
    return isSafeIpv4(compatDotted[1]);
  }
  const compatHex = ip.match(/^::([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (compatHex && compatHex[1].toLowerCase() !== '0') {
    const hi = parseInt(compatHex[1], 16);
    const lo = parseInt(compatHex[2], 16);
    const o1 = (hi >> 8) & 0xff;
    const o2 = hi & 0xff;
    const o3 = (lo >> 8) & 0xff;
    const o4 = lo & 0xff;
    return isSafeIpv4(`${o1}.${o2}.${o3}.${o4}`);
  }

  // Loopback (::1)
  if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') {
    return { safe: false, reason: 'Loopback IPv6 (::1)' };
  }

  // Unspecified (::)
  if (ip === '::' || ip === '0:0:0:0:0:0:0:0') {
    return { safe: false, reason: 'Unspecified IPv6 (::)' };
  }

  // Unique-Local / ULA (fc00::/7 -> starts with fc or fd)
  if (ip.startsWith('fc') || ip.startsWith('fd')) {
    return { safe: false, reason: 'Unique-local IPv6 (fc00::/7)' };
  }

  // Link-Local unicast (fe80::/10 -> starts with fe8, fe9, fea, feb)
  if (/^fe[89ab]/i.test(ip)) {
    return { safe: false, reason: 'Link-local IPv6 (fe80::/10)' };
  }

  // Site-Local unicast deprecated (fec0::/10 -> starts with fec, fed, fee, fef)
  if (/^fe[c-f]/i.test(ip)) {
    return { safe: false, reason: 'Site-local IPv6 (fec0::/10)' };
  }

  // Multicast (ff00::/8 -> starts with ff)
  if (ip.startsWith('ff')) {
    return { safe: false, reason: 'Multicast IPv6 (ff00::/8)' };
  }

  // Documentation (2001:db8::/32)
  if (ip.startsWith('2001:db8:') || ip.startsWith('2001:0db8:')) {
    return { safe: false, reason: 'Documentation IPv6 (2001:db8::/32)' };
  }

  // IPv4/IPv6 translation (64:ff9b::/96)
  if (ip.startsWith('64:ff9b:')) {
    return { safe: false, reason: 'IPv4/IPv6 translation (64:ff9b::/96)' };
  }

  return { safe: true };
}

/**
 * Checks whether an IP address (v4 or v6) is safe and not in a prohibited/internal range.
 */
export function isSafeIp(ip: string): { safe: boolean; reason?: string } {
  let cleanIp = ip.trim();
  if (cleanIp.startsWith('[') && cleanIp.endsWith(']')) {
    cleanIp = cleanIp.slice(1, -1);
  }

  const family = net.isIP(cleanIp);
  if (family === 4) {
    return isSafeIpv4(cleanIp);
  }
  if (family === 6) {
    return isSafeIpv6(cleanIp);
  }

  return { safe: false, reason: `Unrecognized IP address format: ${ip}` };
}

/**
 * Validates an untrusted external URL string prior to network resolution.
 * Checks protocol, prohibited hostnames, domain suffixes, and literal IPs.
 */
export function isSafeExternalUrl(urlStr: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlStr);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: `Disallowed protocol: ${parsed.protocol}` };
    }

    let hostname = parsed.hostname.toLowerCase().trim();
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      hostname = hostname.slice(1, -1);
    }

    if (BLOCKED_HOSTNAMES.has(hostname)) {
      return { safe: false, reason: `Prohibited private or metadata hostname: ${hostname}` };
    }

    for (const suffix of BLOCKED_DOMAIN_SUFFIXES) {
      if (hostname.endsWith(suffix) || hostname === suffix.slice(1)) {
        return { safe: false, reason: `Prohibited local/internal domain: ${hostname}` };
      }
    }

    // If hostname is an IP address literal, check it immediately
    const ipFamily = net.isIP(hostname);
    if (ipFamily !== 0) {
      return isSafeIp(hostname);
    }

    // Check for integer/hex IP representations (e.g. 2130706433 or 0x7f000001)
    if (/^\d+$/.test(hostname)) {
      const num = parseInt(hostname, 10);
      if (!isNaN(num) && num >= 0 && num <= 0xffffffff) {
        const o1 = (num >>> 24) & 0xff;
        const o2 = (num >>> 16) & 0xff;
        const o3 = (num >>> 8) & 0xff;
        const o4 = num & 0xff;
        return isSafeIpv4(`${o1}.${o2}.${o3}.${o4}`);
      }
    }

    return { safe: true };
  } catch (err) {
    return { safe: false, reason: `Malformed URL: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Validates an array of DNS lookup answers. Fails closed if ANY address is prohibited
 * or if no answers are returned.
 */
export function validateDnsAnswers(
  addresses: Array<{ address: string; family: number }>
): { safe: boolean; reason?: string } {
  if (!addresses || addresses.length === 0) {
    return { safe: false, reason: 'DNS lookup returned no addresses' };
  }

  for (const record of addresses) {
    const check = isSafeIp(record.address);
    if (!check.safe) {
      return {
        safe: false,
        reason: `Prohibited DNS answer [${record.address}]: ${check.reason}`,
      };
    }
  }

  return { safe: true };
}

/**
 * Resolves a hostname safely, inspecting every returned address to protect against DNS rebinding.
 */
export async function resolveDnsSafe(
  hostname: string,
  customResolver?: DnsResolver
): Promise<{ safe: boolean; reason?: string; addresses?: Array<{ address: string; family: number }> }> {
  let cleanHost = hostname.trim();
  if (cleanHost.startsWith('[') && cleanHost.endsWith(']')) {
    cleanHost = cleanHost.slice(1, -1);
  }

  // If already an IP address, validate directly without DNS
  const ipFamily = net.isIP(cleanHost);
  if (ipFamily !== 0) {
    const check = isSafeIp(cleanHost);
    if (!check.safe) return check;
    return { safe: true, addresses: [{ address: cleanHost, family: ipFamily }] };
  }

  try {
    const addresses = customResolver
      ? await customResolver(cleanHost)
      : await dns.promises.lookup(cleanHost, { all: true });

    const check = validateDnsAnswers(addresses);
    if (!check.safe) {
      return check;
    }

    return { safe: true, addresses };
  } catch (err) {
    return {
      safe: false,
      reason: `DNS lookup failed for ${cleanHost}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}


/**
 * Build a resolver which pins Node's outbound socket lookup to the addresses
 * already checked by resolveDnsSafe. This closes the gap where a second DNS
 * lookup inside fetch() could resolve to a private/metadata address.
 */
export function createPinnedDnsLookup(
  hostname: string,
  approvedAddresses: Array<{ address: string; family: number }>
): typeof dns.lookup {
  const expectedHost = hostname.replace(/^\\[|\\]$/g, '').toLowerCase();
  const safeAddresses = approvedAddresses.filter((entry) => isSafeIp(entry.address).safe);
  if (safeAddresses.length === 0) {
    throw new Error('SSRF blocked: no validated address available for pinned connection');
  }

  const lookup = ((
    requestedHost: string,
    options: unknown,
    callback: (...args: any[]) => void
  ) => {
    const normalizedHost = requestedHost.replace(/^\\[|\\]$/g, '').toLowerCase();
    if (normalizedHost !== expectedHost) {
      callback(new Error('Pinned DNS lookup hostname mismatch'));
      return;
    }

    const allRequested =
      typeof options === 'object' &&
      options !== null &&
      'all' in options &&
      (options as { all?: boolean }).all === true;

    if (allRequested) {
      callback(null, safeAddresses.map(({ address, family }) => ({ address, family })));
      return;
    }

    const requestedFamily =
      typeof options === 'number'
        ? options
        : typeof options === 'object' && options !== null && 'family' in options
          ? Number((options as { family?: number }).family) || 0
          : 0;
    const chosen =
      safeAddresses.find((entry) => requestedFamily === 0 || entry.family === requestedFamily) ??
      safeAddresses[0];
    callback(null, chosen.address, chosen.family);
  }) as unknown as typeof dns.lookup;

  return lookup;
}

async function requestWithPinnedDns(
  url: URL,
  init: SafeFetchOptions,
  approvedAddresses: Array<{ address: string; family: number }>
): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  // The URL authority is canonical; a caller-supplied Host header must not override it.
  headers.delete('host');

  const nodeHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    nodeHeaders[key] = value;
  });
  const lookup = createPinnedDnsLookup(url.hostname, approvedAddresses);

  return await new Promise<Response>((resolve, reject) => {
    let settled = false;
    const finishWithError = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const onResponse = (incoming: http.IncomingMessage) => {
      const responseHeaders = new Headers();
      for (const [name, value] of Object.entries(incoming.headers)) {
        if (typeof value === 'string') {
          responseHeaders.append(name, value);
        } else if (Array.isArray(value)) {
          for (const item of value) responseHeaders.append(name, item);
        }
      }

      const status = incoming.statusCode ?? 502;
      const body =
        method === 'HEAD' || status === 204 || status === 304
          ? null
          : (Readable.toWeb(incoming) as ReadableStream<Uint8Array>);
      const response = new Response(body, {
        status: status >= 200 && status <= 599 ? status : 502,
        statusText: incoming.statusMessage,
        headers: responseHeaders,
      });
      settled = true;
      resolve(response);
    };

    const options: http.RequestOptions = {
      method,
      headers: nodeHeaders,
      agent: false,
      lookup,
      signal: init.signal ?? undefined,
      timeout: 15_000,
      maxHeaderSize: 16 * 1024,
    };
    const req =
      url.protocol === 'https:'
        ? https.request(url, options, onResponse)
        : http.request(url, options, onResponse);

    req.on('error', finishWithError);
    req.on('timeout', () => req.destroy(new Error('Radar outbound request timed out')));

    if (init.body != null) {
      const body = init.body;
      if (typeof body === 'string' || Buffer.isBuffer(body) || body instanceof Uint8Array) {
        req.write(body);
      } else if (body instanceof URLSearchParams) {
        req.write(body.toString());
      } else {
        req.destroy(new Error('Pinned Radar requests do not support streaming request bodies'));
        return;
      }
    }

    req.end();
  });
}

export interface SafeFetchOptions extends RequestInit {
  maxRedirects?: number;
  dnsResolver?: DnsResolver;
  fetchFn?: typeof fetch;
}

/**
 * Hardened HTTP client for news radar collectors.
 *
 * Guarantees:
 * 1. Pre-validation of URL syntax and literal IP ranges.
 * 2. DNS resolution check ensuring NO returned answer is in a prohibited range.
 * 3. Step-by-step redirect validation: every redirect destination is validated before following.
 * 4. Redirect limit enforcement (default: max 5 redirects).
 * 5. Full support for dependency-injected DNS resolvers and custom fetch functions for deterministic testing.
 */
export async function safeFetch(
  input: string | URL,
  init?: SafeFetchOptions
): Promise<Response> {
  const maxRedirects = init?.maxRedirects ?? 5;
  const dnsResolver = init?.dnsResolver;
  const customFetch = init?.fetchFn;

  let currentUrl = new URL(typeof input === 'string' ? input : input.toString());
  let redirectCount = 0;

  while (true) {
    // 1. Static URL & Literal Hostname Check
    const urlCheck = isSafeExternalUrl(currentUrl.toString());
    if (!urlCheck.safe) {
      throw new Error(`SSRF blocked: ${urlCheck.reason}`);
    }

    // 2. DNS Resolution & All-Address Check (Protects against DNS Rebinding & nip.io)
    const dnsCheck = await resolveDnsSafe(currentUrl.hostname, dnsResolver);
    if (!dnsCheck.safe) {
      throw new Error(`SSRF blocked: ${dnsCheck.reason}`);
    }

    // 3. Pin the production socket to one of the validated DNS answers.
    // Custom fetch functions are explicit test/dependency-injection seams; the
    // default production transport never performs a second uncontrolled lookup.
    const response = customFetch
      ? await customFetch(currentUrl.toString(), {
          ...init,
          redirect: 'manual',
        })
      : await requestWithPinnedDns(currentUrl, init ?? {}, dnsCheck.addresses ?? []);

    // 4. Handle Redirects
    if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
      if (redirectCount >= maxRedirects) {
        throw new Error(`Too many redirects (max ${maxRedirects})`);
      }

      const location = response.headers.get('location')!;
      let nextUrl: URL;
      try {
        nextUrl = new URL(location, currentUrl);
      } catch {
        throw new Error(`Invalid redirect URL: ${location}`);
      }

      if (nextUrl.protocol !== 'http:' && nextUrl.protocol !== 'https:') {
        throw new Error(`Invalid redirect protocol: ${nextUrl.protocol}`);
      }

      currentUrl = nextUrl;
      redirectCount++;
      continue;
    }

    return response;
  }
}
