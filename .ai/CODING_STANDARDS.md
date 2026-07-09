# Coding Standards

## TypeScript
- Strict mode is enforced. No `any`, no `@ts-ignore` without explicit comments.
- Types must map to domain primitives in `types/canonical.ts`.

## React & Next.js
- **Default to RSC**: All components are React Server Components unless interacting with the browser.
- **Props Only**: Pages and components should receive typed props. Data fetching occurs in view-models.

## CSS & Styling
- **Tailwind CSS**: Use utility classes.
- **Design Tokens**: Never hardcode hex values. Use tokens:
  - `background`: `#0A0A0A`
  - `surface`: `#151515`
  - `gold`: `#D4A843`
  - `green`: `#22C55E`
  - `text`: `#F5F5F5`
  - `secondary`: `#A1A1AA`
  - `border`: `#2A2A2A`

## Component Structure
- Favor composition.
- Use the **Block System** for story components (`components/story/blocks/registry.tsx`).
- Document complex logic and respect existing docstrings.
