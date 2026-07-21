# Accessibility

Accessibility is built into the primitives, not bolted on. Target: **WCAG 2.1 AA**.

## Color & contrast

- Body text ≥ 4.5:1; large text/UI ≥ 3:1. Pairings documented in [colors.md](colors.md).
- Never convey information by color alone (e.g. stock status also has text/icon).

## Keyboard

- All interactive elements are reachable and operable by keyboard in a logical order.
- Visible focus ring on every focusable element (`:focus-visible` in `globals.css`).
- Modals/drawers trap focus, restore focus on close, and close on `Esc`.
- Skip-to-content link at the top of each layout.

## Screen readers & semantics

- Semantic HTML first (`<nav>`, `<main>`, `<button>`, `<ul>`…); ARIA only to fill gaps.
- Icon-only controls have `aria-label`; decorative icons are `aria-hidden`.
- Live regions announce toasts, cart updates, and async validation.
- Images have meaningful `alt`; decorative images use empty `alt=""`.

## Forms

- Labels tied to inputs; errors linked via `aria-describedby` and `aria-invalid`.

## Motion

- `prefers-reduced-motion` disables non-essential animation globally.

## Testing

- `eslint-plugin-jsx-a11y` enforces baseline rules in CI.
- Manual pass with keyboard-only navigation and a screen reader before release.
- Lighthouse Accessibility target ≥ 95.
