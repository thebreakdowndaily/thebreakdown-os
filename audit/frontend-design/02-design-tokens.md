# The Breakdown Design Tokens & System Reference

Status: Living Specification
Date: 01 Sep 2026

---

## 1. Typography Hierarchy

| Token Name | Family | Size / Line-Height | Weight | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `--font-editorial` | Playfair Display, Georgia, serif | 3.25rem / 1.1 | 700 / 800 | Flagship hero headlines, major section headers |
| `--font-heading` | Playfair Display, Georgia, serif | 2.25rem / 1.25 | 700 | Chapter titles, tracker titles |
| `--font-sans` | Inter, system-ui, sans-serif | 1.125rem / 1.75 | 400 | Long-form story body reading measure |
| `--font-ui` | Inter, system-ui, sans-serif | 0.875rem / 1.4 | 500 / 600 | Navigation, search results, button labels |
| `--font-mono` | JetBrains Mono, monospace | 0.75rem / 1.3 | 500 / 700 | Timestamps, gazette citations, data labels |

---

## 2. Restrained Color Palette

| Color Role | Value (Dark Theme Canvas) | Usage | WCAG AA Contrast |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#09090B` (neutral-950) | Primary page background | 19.5:1 vs Text Primary |
| **Surface Secondary** | `#121215` / `#18181B` | Subtle card backing | 15.2:1 vs Text Primary |
| **Text Primary** | `#F4F4F5` (neutral-100) | Main reading text & headlines | Pass (AAA) |
| **Text Secondary** | `#A1A1AA` (neutral-400) | Explanatory subtext & deks | Pass (AA) |
| **Text Muted** | `#71717A` (neutral-500) | Metadata, dates, secondary labels | Pass (AA on dark) |
| **Editorial Brand Gold** | `#C9A84C` (amber/gold) | Masthead accent, category tags | Pass (AA on dark) |
| **Evidence Emerald** | `#10B981` / `#34D399` | Provenance markers, verified items | Pass (AA on dark) |
| **Border Hairline** | `#27272A` / `#3F3F46` | Subtle dividers (1px) | Structural only |

---

## 3. Disciplined Spacing Scale

```
4px   (--spacing-1)   Micro gaps between badge icons & labels
8px   (--spacing-2)   Padding inside inline buttons
16px  (--spacing-4)   Grid gaps, mobile page margins
24px  (--spacing-6)   Card internal padding, section sub-rhythm
48px  (--spacing-12)  Major editorial section rhythm
72px  (--spacing-18)  Page hero & footer breathing room
```
