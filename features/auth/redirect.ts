/**
 * Accept only same-origin, root-relative destinations for post-auth redirects.
 * Never pass user-provided absolute URLs to NextResponse.redirect or router.push.
 */
export function safeRedirectPath(
  destination: string | null | undefined,
  fallback = '/newsroom'
): string {
  if (
    !destination ||
    !destination.startsWith('/') ||
    destination.startsWith('//') ||
    destination.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(destination)
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
