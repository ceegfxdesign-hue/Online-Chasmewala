# Spacing

Spacing uses Tailwind's 4px base scale. Consistent rhythm creates a premium feel.

## Scale (common steps)

| Step | px   | Typical use                          |
| ---- | ---- | ------------------------------------ |
| 1    | 4    | Icon ↔ text gaps                     |
| 2    | 8    | Tight control padding                |
| 3    | 12   | Chip / badge padding                 |
| 4    | 16   | Default component padding            |
| 6    | 24   | Card padding                         |
| 8    | 32   | Between related blocks               |
| 12   | 48   | Between sub-sections                 |
| 16   | 64   | Between page sections (`--space-section`) |

## Section rhythm

- Page sections are separated by `py-12` (mobile) → `py-16`/`py-20` (desktop).
- Cards use `p-4` (compact) or `p-6` (comfortable).
- Grid gaps: `gap-4` (dense product grids) to `gap-6`/`gap-8` (feature sections).

## Do / Don't

- **Do** align to the scale — avoid arbitrary values like `p-[13px]`.
- **Do** increase spacing with viewport width for breathing room.
- **Don't** mix inconsistent gaps within the same grid.
