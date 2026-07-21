# Grid & Layout

## Container

`.container-page` (defined in `globals.css`) centers content with responsive padding and a max width
of 1280px (`2xl`). Use it as the outer wrapper for every page section.

## Breakpoints

| Name  | Min width | Target                 |
| ----- | --------- | ---------------------- |
| `sm`  | 640px     | Large phones           |
| `md`  | 768px     | Tablets                |
| `lg`  | 1024px    | Laptops                |
| `xl`  | 1280px    | Desktops               |
| `2xl` | 1536px    | Large desktops         |

## Product grids

| Viewport | Columns |
| -------- | ------- |
| mobile   | 2       |
| `sm`     | 2–3     |
| `lg`     | 3–4     |
| `xl`     | 4–5     |

Implemented with `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6`.

## Page structure

```
StoreLayout
 ├─ AnnouncementBar
 ├─ Navbar (+ MegaMenu)
 ├─ <main> … page sections in .container-page …
 └─ Footer
```

Content sections alternate `surface` / `surface-subtle` backgrounds for visual rhythm.
