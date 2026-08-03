'use client';

import React, { useState } from 'react';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)
// Client-only export actions: copy/download Markdown and JSON, and print-to-PDF.
// The strings are serialised on the server from the toolkit model — nothing generated here.

const BUTTON_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  background: 'var(--color-bg-primary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--text-xs)',
  fontWeight: 500,
  cursor: 'pointer',
};

export function ReporterBriefExport({ markdown, json }: { markdown: string; json: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const flash = (which: string) => {
    setCopied(which);
    window.setTimeout(() => { setCopied(null); }, 1600);
  };

  const copyText = async (text: string, which: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(which);
    } catch {
      flash('error');
    }
  };

  const download = (text: string, filename: string, mime: string) => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div role="toolbar" aria-label="Reporter brief export actions" style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" style={BUTTON_STYLE} onClick={() => { download(markdown, 'reporter-brief.md', 'text/markdown'); }}>
        ⬇ Download Markdown
      </button>
      <button type="button" style={BUTTON_STYLE} onClick={() => { void copyText(markdown, 'md'); }}>
        {copied === 'md' ? '✓ Copied' : 'Copy Markdown'}
      </button>
      <button type="button" style={BUTTON_STYLE} onClick={() => { void copyText(json, 'json'); }}>
        {copied === 'json' ? '✓ Copied' : 'Copy JSON'}
      </button>
      <button type="button" style={BUTTON_STYLE} onClick={() => { window.print(); }}>
        🖨 Print / PDF
      </button>
      <span role="status" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-brand-400)' }}>
        {copied === 'error' ? 'Clipboard unavailable — use download instead.' : ''}
      </span>
    </div>
  );
}
