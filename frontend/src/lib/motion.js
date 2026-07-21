/**
 * Shared Framer Motion presets. Centralized so animation feels consistent across
 * the app and can be tuned in one place. Framer automatically softens these when
 * the user prefers reduced motion (combined with the global CSS override).
 */
const easePremium = [0.22, 1, 0.36, 1];

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: easePremium },
};

export const slideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.35, ease: easePremium },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2, ease: easePremium },
};

export const staggerContainer = (stagger = 0.06, delayChildren = 0) => ({
  animate: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easePremium } },
};

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: easePremium },
};

export const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const drawerRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { type: 'tween', duration: 0.3, ease: easePremium },
};

export const drawerLeft = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
  transition: { type: 'tween', duration: 0.3, ease: easePremium },
};

export const modalPop = {
  initial: { opacity: 0, scale: 0.95, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: 8 },
  transition: { duration: 0.22, ease: easePremium },
};

export const hoverLift = {
  whileHover: { y: -4 },
  transition: { duration: 0.2, ease: easePremium },
};

export { easePremium };
