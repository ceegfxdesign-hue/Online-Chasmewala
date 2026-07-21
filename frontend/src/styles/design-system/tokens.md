# Design Tokens — Reference

Complete token reference. Defined in [`tailwind.config.js`](../../../tailwind.config.js); a runtime
subset is exposed as CSS variables in [`globals.css`](../globals.css).

## Color tokens

`brand-{50..900}`, `accent-{400,500,600}`, `navy-{50..900}`,
`surface`, `surface-muted`, `surface-subtle`,
`success{,-light,-dark}`, `error{,-light,-dark}`, `warning{,-light,-dark}`.

## Typography tokens

- Families: `font-sans` (Inter), `font-display` (Manrope).
- Sizes: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-h4`, `text-base`, `text-sm`, `text-caption`.

## Radius tokens

`rounded-sm` .375 · `rounded` .5 · `rounded-md` .625 · `rounded-lg` .75 · `rounded-xl` .875 ·
`rounded-2xl` 1.25 · `rounded-3xl` 1.75 (rem).

## Shadow tokens

`shadow-soft`, `shadow-card`, `shadow-elevated`, `shadow-glass`, `shadow-focus`.

## Motion tokens

- Keyframes/animations: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`, `shimmer`.
- Easing: `ease-premium` → `cubic-bezier(0.22, 1, 0.36, 1)`.

## CSS variables (runtime)

```css
--color-brand: 0 166 166;
--color-accent: 0 212 212;
--color-navy: 15 23 42;
--radius-card: 1.25rem;
--space-section: 4rem;
```

## Container

Centered, padded, max-width `1280px` at `2xl`. Access via `.container-page`.
