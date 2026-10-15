/**
 * Conservative rich-text HTML allowlist sanitizer for story and CMS blocks.
 * Rebuilds allowed tags and attributes; scripts, embedded content, event
 * handlers, inline styles, and arbitrary attributes are not retained.
 */
const SAFE_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'cite', 'code', 'del', 'div', 'em',
  'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'li', 'mark', 'ol', 'p', 'pre',
  's', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
  'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
]);
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const DROP_CONTENT = new Set(['applet', 'audio', 'button', 'canvas', 'embed', 'form', 'frame', 'frameset', 'head', 'iframe', 'math', 'meta', 'noscript', 'object', 'option', 'script', 'select', 'style', 'svg', 'template', 'textarea', 'title', 'video']);
const ENTITY = /&(?:#(?:x[0-9a-f]{1,8}|\d{1,8})|amp|lt|gt|quot|apos|nbsp|mdash|ndash|hellip|rsquo|lsquo|ldquo|rdquo|bull|copy|reg|trade|euro|pound|times|divide);/i;
const ATTR = /([a-z_:][a-z0-9_:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/gi;

function escapeText(value: string): string {
  return value
    .replace(/&(?!(?:#(?:x[0-9a-f]{1,8}|\d{1,8})|amp|lt|gt|quot|apos|nbsp|mdash|ndash|hellip|rsquo|lsquo|ldquo|rdquo|bull|copy|reg|trade|euro|pound|times|divide);)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(?:x([0-9a-f]{1,8})|([0-9]{1,8}));?/gi, (entity, hex: string | undefined, decimal: string | undefined) => {
      const point = Number.parseInt(hex ?? decimal ?? '', hex !== undefined ? 16 : 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity;
    })
    .replace(/&colon;/gi, ':').replace(/&tab;/gi, '\t').replace(/&newline;/gi, '\n')
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"').replace(/&apos;/gi, "'");
}

function safeHref(input: string): string | null {
  const value = decodeEntities(input).trim();
  const normalized = value.replace(/[\u0000-\u0020\u007f-\u009f]/g, '').toLowerCase();
  if (!normalized || /^(?:javascript|vbscript|data|file|blob):/.test(normalized)) return null;
  if (normalized.startsWith('//') || normalized.includes('\\')) return null;
  const scheme = normalized.match(/^([a-z][a-z0-9+.-]*):/);
  if (scheme && !['http', 'https', 'mailto'].includes(scheme[1])) return null;
  return value;
}

function allowedAttribute(tag: string, name: string): boolean {
  return ['class', 'title', 'aria-label'].includes(name)
    || (tag === 'a' && name === 'href')
    || (tag === 'cite' && name === 'data-ref')
    || ((tag === 'td' || tag === 'th') && (name === 'colspan' || name === 'rowspan'))
    || (tag === 'th' && name === 'scope')
    || (tag === 'ol' && name === 'start');
}

function safeAttributes(tag: string, token: string): string {
  const tagMatch = token.match(/^<\s*[a-z][a-z0-9:-]*/i);
  const source = tagMatch ? token.slice(tagMatch[0].length, -1).replace(/\/\s*$/, '') : '';
  const seen = new Set<string>();
  const output: string[] = [];
  const pattern = new RegExp(ATTR.source, 'gi');

  for (const match of source.matchAll(pattern)) {
    const name = match[1].toLowerCase();
    if (seen.has(name)) continue;
    seen.add(name);
    if (!allowedAttribute(tag, name)) continue;

    const raw = match[2] ?? match[3] ?? match[4] ?? '';
    const decoded = decodeEntities(raw);
    if (name === 'href') {
      const href = safeHref(raw);
      if (href !== null) output.push('href="' + escapeHtmlText(href) + '"');
      continue;
    }
    if (['colspan', 'rowspan', 'start'].includes(name)) {
      if (!/^\d{1,3}$/.test(decoded) || Number(decoded) < 1 || Number(decoded) > 100) continue;
      output.push(name + '="' + Number(decoded) + '"');
      continue;
    }
    if (name === 'scope' && !['row', 'col', 'rowgroup', 'colgroup'].includes(decoded.toLowerCase())) continue;
    if (decoded.length > 2048 || /[\u0000-\u001f]/.test(decoded)) continue;
    output.push(name + '="' + escapeHtmlText(decoded) + '"');
  }
  return output.length ? ' ' + output.join(' ') : '';
}

export function sanitizeRichHtml(input: string | null | undefined): string {
  if (typeof input !== 'string' || !input) return '';
  const tokens = input.replace(/<!--[\s\S]*?-->/g, '').split(/(<\/?[a-z][a-z0-9:-]*(?:\s[^<>]*?)?\s*\/?>)/gi);
  let output = '';
  let suppressed: { tag: string; depth: number } | null = null;

  for (const token of tokens) {
    if (!token) continue;
    if (!token.startsWith('<')) {
      if (!suppressed) output += escapeText(token);
      continue;
    }

    const parsed = token.match(/^<\s*(\/?)\s*([a-z][a-z0-9:-]*)([\s\S]*?)\/?\s*>$/i);
    if (!parsed) {
      if (!suppressed) output += escapeText(token);
      continue;
    }

    const closing = parsed[1] === '/';
    const tag = parsed[2].toLowerCase();
    const selfClosing = /\/\s*>$/.test(token);

    if (suppressed) {
      if (tag === suppressed.tag) {
        if (closing) {
          suppressed.depth -= 1;
          if (!suppressed.depth) suppressed = null;
        } else if (!selfClosing && !VOID_TAGS.has(tag)) {
          suppressed.depth += 1;
        }
      }
      continue;
    }

    if (DROP_CONTENT.has(tag)) {
      if (!closing && !selfClosing && !VOID_TAGS.has(tag)) suppressed = { tag, depth: 1 };
      continue;
    }
    if (!SAFE_TAGS.has(tag)) continue;
    if (closing) {
      if (!VOID_TAGS.has(tag)) output += '</' + tag + '>';
    } else if (VOID_TAGS.has(tag)) {
      if (tag === 'br' || tag === 'hr') output += '<' + tag + ' />';
    } else {
      output += '<' + tag + safeAttributes(tag, token) + '>';
    }
  }

  return output;
}
