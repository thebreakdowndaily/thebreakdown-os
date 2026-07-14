export interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function extractTocItems(blocks: { type: string; data: Record<string, unknown> }[]): TocItem[] {
  const seen = new Map<string, number>();
  const items: TocItem[] = [];

  for (const block of blocks) {
    if (block.type !== 'heading') continue;
    const { text, level } = block.data as unknown as { text: string; level: 1 | 2 | 3 };
    let id = slugifyHeading(text);

    const base = id;
    const count = seen.get(base) || 0;
    if (count > 0) {
      id = `${id}-${count}`;
    }
    seen.set(base, count + 1);

    items.push({ id, text, level });
  }

  return items;
}
