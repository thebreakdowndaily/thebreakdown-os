# Self-hosted typography

The site uses three typefaces, kept consistent with the existing typographic system:

- **Inter** — interface and sans-serif text.
- **Playfair Display** — display headings.
- **Source Serif 4** — long-form reading text.

The Latin WOFF2 assets under `app/fonts/` are vendored from the respective family directories in [Fontsource's font-files repository](https://github.com/fontsource/font-files/tree/2ffd3aa25908df6ed1c864de40ce53e2ae1076d1/fonts/google). They are used without modification. Source files and full SIL Open Font License 1.1 notices are included in `public/fonts/licenses/`.

| Family | Upstream source | Faces included |
|---|---|---|
| Inter | [fontsource/font-files/fonts/google/inter](https://github.com/fontsource/font-files/tree/2ffd3aa25908df6ed1c864de40ce53e2ae1076d1/fonts/google/inter) | Weights 100–900 normal; 400 and 700 italic |
| Playfair Display | [fontsource/font-files/fonts/google/playfair-display](https://github.com/fontsource/font-files/tree/2ffd3aa25908df6ed1c864de40ce53e2ae1076d1/fonts/google/playfair-display) | Weights 400, 500, 600, 700, 800 normal; 400 and 700 italic |
| Source Serif 4 | [fontsource/font-files/fonts/google/source-serif-4](https://github.com/fontsource/font-files/tree/2ffd3aa25908df6ed1c864de40ce53e2ae1076d1/fonts/google/source-serif-4) | Weights 300, 400, 600, 700 normal; 400 and 700 italic |

## Build and performance contract

The layout uses `next/font/local`, not `next/font/google`. This removes external Google Fonts CSS and binary requests from the production build, ensuring builds do not depend on a CDN response shape or availability. The fonts remain self-hosted under Next.js's static media output.

Preloading is disabled for the arrays of static faces because preloading every weight/style would add unnecessary requests. The browser fetches the faces referenced by the actual text/style on the page; `font-display: swap` preserves readable fallback text while files load.

Do not replace these files with remote CSS imports as a workaround for build failures. Changes to the typefaces should preserve the typography tokens and update this document and the corresponding license notices.
