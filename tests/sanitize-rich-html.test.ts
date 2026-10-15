import { describe, expect, it } from 'vitest';
import { escapeHtmlText, sanitizeRichHtml } from '../lib/security/sanitize-rich-html';

describe('sanitizeRichHtml', () => {
  it('preserves allowed formatting, citation markers, and common entities', () => {
    const input = '<p class="story-copy">A &amp; B <strong>bold</strong><cite data-ref="gov-report">[1]</cite><a href="/sources/report?a=1&amp;b=2">source</a></p>';
    expect(sanitizeRichHtml(input)).toBe(
      '<p class="story-copy">A &amp; B <strong>bold</strong><cite data-ref="gov-report">[1]</cite><a href="/sources/report?a=1&amp;b=2">source</a></p>',
    );
  });

  it('removes active elements and event-handler attributes', () => {
    const scriptOpen = '<scr' + 'ipt>';
    const scriptClose = '</scr' + 'ipt>';
    const input = scriptOpen + 'not-rendered' + scriptClose
      + '<p onclick' + '="blocked()">Safe text</p>'
      + '<img src="missing" on' + 'error="blocked()">';
    expect(sanitizeRichHtml(input)).toBe('<p>Safe text</p>');
  });

  it('blocks unsafe URL schemes, including encoded scheme characters', () => {
    const unsafeScheme = 'java' + 'script:blocked()';
    const input = '<a href="' + unsafeScheme + '">one</a>'
      + '<a href="java&#x73;cript:blocked()">two</a>'
      + '<a href="https://news.example/source">safe</a>';
    expect(sanitizeRichHtml(input)).toBe(
      '<a>one</a><a>two</a><a href="https://news.example/source">safe</a>',
    );
  });

  it('drops embedded SVG and frame content, including nested active elements', () => {
    const input = '<svg onload="blocked()"><script>not-rendered</script><text>bad</text></svg>'
      + '<p>good</p><iframe src="https://evil.example">frame payload</iframe>';
    expect(sanitizeRichHtml(input)).toBe('<p>good</p>');
  });

  it('strips style and unapproved attributes but preserves approved classes', () => {
    expect(sanitizeRichHtml('<p class="text-lg" style="ignored" id="ignored" data-x="ignored">text</p>'))
      .toBe('<p class="text-lg">text</p>');
  });

  it('escapes malformed text rather than emitting it as HTML', () => {
    const result = sanitizeRichHtml('2 < 3 and <img src=x on' + 'error="blocked()">');
    expect(result).toContain('2 &lt; 3 and ');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('<img');
  });

  it('escapes literal text for the editor clipboard fallback', () => {
    expect(escapeHtmlText('<tag> & "text"')).toBe('&lt;tag&gt; &amp; &quot;text&quot;');
  });

  it('removes clipboard comments and handles missing content', () => {
    expect(sanitizeRichHtml('<!--StartFragment--><p>text</p><!--EndFragment-->')).toBe('<p>text</p>');
    expect(sanitizeRichHtml(undefined)).toBe('');
  });
});
