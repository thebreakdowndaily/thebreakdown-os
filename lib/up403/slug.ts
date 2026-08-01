export function toSlug(id: string): string {
  return id.toLowerCase();
}

export function fromSlug(slug: string): string {
  return slug.toUpperCase();
}
