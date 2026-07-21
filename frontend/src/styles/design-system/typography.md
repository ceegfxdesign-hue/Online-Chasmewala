# Typography

## Families

- **Display / headings:** `Manrope` (falls back to Inter) — `font-display`.
- **Body / UI:** `Inter` — `font-sans`.

Both are loaded via Google Fonts with `display=swap` and preconnect for fast first paint.

## Type scale

| Token         | Size / line-height     | Weight | Usage                          |
| ------------- | ---------------------- | ------ | ------------------------------ |
| `text-display`| 3.5rem / 1.05          | 800    | Hero headline                  |
| `text-h1`     | 2.5rem / 1.15          | 700    | Page titles                    |
| `text-h2`     | 2rem / 1.2             | 700    | Section titles                 |
| `text-h3`     | 1.5rem / 1.3           | 600    | Sub-sections, card titles      |
| `text-h4`     | 1.25rem / 1.35         | 600    | Small headings                 |
| `text-base`   | 1rem / 1.5             | 400    | Body                           |
| `text-sm`     | 0.875rem / 1.45        | 400    | Secondary body                 |
| `text-caption`| 0.8125rem / 1.4        | 500    | Labels, metadata               |

## Rules

- One `h1` per page. Headings never skip levels (h1 → h2 → h3).
- Body copy max width ~65ch for readability.
- Buttons use `font-semibold`, `text-sm`/`text-base`, no letter-spacing tricks.
- Prices use tabular figures where alignment matters (`tabular-nums`).
