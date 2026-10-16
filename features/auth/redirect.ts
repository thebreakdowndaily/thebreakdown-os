/**
 * Accept only same-origin, root-relative destinations for post-auth redirects.
 * Never pass user-provided absolute URLs to NextResponse.redirect or router.push.
 */
function hasControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

export function safeRedirectPath(
  destination: string | null | undefined,
  fallback = '/newsroom'
): string {
  if (
    !destination ||
    !destination.startsWith('/') ||
    destination.startsWith('//') ||
    destination.includes('\\') ||
    hasControlCharacters(destination)
  ) {
    return fallback;
  }

  try {
    const resolved = new URL(destination, 'https://thebreakdown.invalid');
    if (resolved.origin !== 'https://thebreakdown.invalid') return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
