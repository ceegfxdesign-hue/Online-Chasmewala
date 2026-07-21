# Buttons

Implemented by [`components/ui/Button.jsx`](../../components/ui/Button.jsx).

## Variants

| Variant     | Appearance                                  | Use                            |
| ----------- | ------------------------------------------- | ------------------------------ |
| `primary`   | Brand fill, white text                      | Main action (Add to Cart)      |
| `secondary` | Navy fill, white text                       | Alternate strong action        |
| `outline`   | Transparent, brand border + text            | Secondary action               |
| `ghost`     | Transparent, hover tint                     | Toolbars, low-emphasis         |
| `subtle`    | Light brand tint fill                       | Chips-like actions             |
| `danger`    | Error fill                                  | Destructive (Remove, Delete)   |
| `link`      | Text-only, underline on hover               | Inline navigation              |

## Sizes

`sm` (h-9), `md` (h-11, default), `lg` (h-12), `icon` (square).

## States

- **Hover:** darker shade + subtle lift.
- **Active:** slight scale-down (`active:scale-[0.98]`).
- **Focus:** visible brand focus ring (keyboard).
- **Disabled:** reduced opacity, `cursor-not-allowed`, no pointer events.
- **Loading:** spinner replaces leading icon; button is disabled and announces `aria-busy`.

## Usage

```jsx
<Button variant="primary" size="lg" leftIcon={<FiShoppingBag />}>Add to Cart</Button>
<Button variant="outline" loading>Processing…</Button>
```

Always give icon-only buttons an `aria-label`.
