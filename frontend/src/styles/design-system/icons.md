# Icons

## Library

Icons come from [`react-icons`](https://react-icons.github.io/react-icons/) — primarily the
**Feather** (`Fi`) set for a light, consistent line style. The brand mark is a custom SVG
([`Logo`](../../components/common/Logo.jsx)); category/illustrative art is original SVG.

## Sizing

| Context           | Size          |
| ----------------- | ------------- |
| Inline with text  | `1em` (inherit) |
| Buttons           | 18–20px       |
| Navigation        | 20–22px       |
| Feature blocks    | 24–32px       |

## Rules

- Use one icon family per surface for visual consistency (Feather by default).
- Decorative icons get `aria-hidden="true"`; meaningful icons get an accessible label.
- Icon-only buttons **must** have `aria-label`.
- Keep stroke weight consistent; don't mix filled and outline styles randomly.
- Color inherits `currentColor` — set color on the parent, not the icon.
