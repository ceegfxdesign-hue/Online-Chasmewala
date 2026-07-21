# Colors

The palette is intentionally small: one brand family, a neutral navy family, and semantic states.

## Brand

| Token         | Hex       | Use                                             |
| ------------- | --------- | ----------------------------------------------- |
| `brand-500`   | `#00A6A6` | Primary actions, links, active states           |
| `brand-600`   | `#008585` | Primary hover                                   |
| `brand-50/100`| light     | Tints, subtle backgrounds, badges               |
| `accent-500`  | `#00D4D4` | Highlights, gradients, promotional accents      |

## Neutrals (navy)

| Token       | Hex       | Use                              |
| ----------- | --------- | -------------------------------- |
| `navy-900`  | `#0F172A` | Headings, dark surfaces, footer  |
| `navy-800`  | `#131F34` | Body text                        |
| `navy-500`  | `#475569` | Secondary text                   |
| `navy-300`  | `#94A3B8` | Muted text, placeholders         |
| `navy-100`  | `#E2E8F0` | Borders, dividers                |

## Surfaces

| Token            | Hex       | Use                     |
| ---------------- | --------- | ----------------------- |
| `surface`        | `#FFFFFF` | Cards, sheets           |
| `surface-muted`  | `#F8FAFC` | Page background         |
| `surface-subtle` | `#F1F5F9` | Section alternates      |

## Semantic

| Token      | Use                          |
| ---------- | ---------------------------- |
| `success`  | Confirmations, in-stock      |
| `error`    | Errors, destructive actions  |
| `warning`  | Cautions, low stock          |

## Contrast pairings (WCAG AA)

- Text on `surface`: `navy-800`/`navy-900` (≥ 12:1).
- Text on `brand-500`: `#FFFFFF` (≥ 4.5:1) — used on primary buttons.
- Muted text (`navy-500`) only on light surfaces, never on brand fills.
- Never place `accent-500` text on white (insufficient contrast) — use it for fills/borders only.
