# Cards & Surfaces

Base primitive: [`Card`](../../components/ui/Card.jsx).

## Elevation

| Shadow          | Use                                  |
| --------------- | ------------------------------------ |
| `shadow-soft`   | Resting cards, inputs                |
| `shadow-card`   | Product cards, panels                |
| `shadow-elevated` | Modals, popovers, hover state      |
| `shadow-glass`  | Frosted overlays                     |

## Radius

- Cards: `rounded-2xl`
- Inputs / buttons: `rounded-xl`
- Chips / badges: `rounded-full`

## Product card

- Square image area with `object-contain` on a subtle surface, brand tint on hover.
- Wishlist button top-right; badges (e.g. "Bestseller", discount %) top-left.
- Title (1–2 lines, truncated), brand, rating, price + strikethrough MRP + discount.
- Entire card is a link; secondary actions (wishlist, quick add) are separate buttons with
  `stopPropagation` so they don't trigger navigation.
- Hover: `-translate-y-1` lift + `shadow-elevated`, image zoom `scale-105`.

## Do / Don't

- **Do** keep padding consistent (`p-4`) and align content to the grid.
- **Don't** stack more than one elevated shadow — it muddies hierarchy.
