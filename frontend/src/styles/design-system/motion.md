# Motion

Animation is powered by **Framer Motion**, with shared presets in
[`lib/motion.js`](../../lib/motion.js). Motion is subtle, purposeful, and always respects
`prefers-reduced-motion`.

## Durations & easing

| Token        | Value                          | Use                     |
| ------------ | ------------------------------ | ----------------------- |
| fast         | 0.15s                          | Hovers, taps            |
| base         | 0.25–0.35s                     | Enter/exit, fades       |
| slow         | 0.5s                           | Hero / large reveals    |
| easing       | `cubic-bezier(0.22,1,0.36,1)`  | Premium ease-out        |

## Presets (from `lib/motion.js`)

| Preset        | Effect                                    |
| ------------- | ----------------------------------------- |
| `fadeIn`      | Opacity 0 → 1                             |
| `slideUp`     | Fade + translate-y                        |
| `scaleIn`     | Fade + scale from 0.96                    |
| `stagger`     | Container that staggers children          |
| `pageTransition` | Route enter/exit                      |
| `drawer` / `modal` | Panel & overlay transitions          |

## Rules

- Animate `transform` and `opacity` only (GPU-friendly); avoid animating layout props.
- Entrances animate once on scroll into view (`whileInView`, `viewport={{ once: true }}`).
- Hover lifts are small (`-4px`) and quick.
- Never block interaction behind an animation; content is usable immediately.
- All presets collapse to near-instant when reduced motion is requested (handled globally in CSS
  and via Framer's reduced-motion support).
