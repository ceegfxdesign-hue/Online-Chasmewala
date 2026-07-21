# Online Chasmewala — Design System

An original, premium design language for the Online Chasmewala eyewear platform. Every screen is
composed from the same tokens and primitives so the product feels like one cohesive system.

> **Source of truth:** design tokens live in [`tailwind.config.js`](../../../tailwind.config.js) and
> [`globals.css`](../globals.css). These documents explain intent and usage; the code enforces it.

## Documents

| Doc                                  | Covers                                             |
| ------------------------------------ | -------------------------------------------------- |
| [colors.md](colors.md)               | Palette, semantics, contrast pairings              |
| [typography.md](typography.md)       | Font families, type scale, weights, usage          |
| [spacing.md](spacing.md)             | Spacing scale, section rhythm                       |
| [grid.md](grid.md)                   | Container, breakpoints, responsive grid            |
| [buttons.md](buttons.md)             | Button variants, sizes, states                     |
| [forms.md](forms.md)                 | Inputs, selects, checkboxes, validation states     |
| [cards.md](cards.md)                 | Card surfaces, elevation, product cards            |
| [icons.md](icons.md)                 | Icon library, sizing, usage                        |
| [motion.md](motion.md)               | Animation presets, durations, easing               |
| [accessibility.md](accessibility.md) | Contrast, focus, keyboard, ARIA, reduced motion    |
| [tokens.md](tokens.md)               | The complete token reference                       |

## Principles

1. **Clarity over decoration** — generous whitespace, strong hierarchy, restrained color.
2. **One system** — reuse primitives (`components/ui`); never hand-roll one-off styles.
3. **Accessible by default** — focus states, contrast and keyboard support are built into primitives.
4. **Motion with meaning** — animation guides attention; it is subtle and respects reduced-motion.
5. **Responsive first** — every component works from 320px to widescreen.

## Brand personality

Trustworthy, modern, and effortless. Teal signals clarity and vision; deep navy grounds it with
premium confidence; cyan adds an energetic highlight for calls to action.
