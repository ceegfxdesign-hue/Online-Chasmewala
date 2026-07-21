import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Trap keyboard focus within a container while `active`, restoring focus to the
 * previously-focused element on deactivation. Used by Modal and Drawer.
 * @param {React.RefObject<HTMLElement>} ref
 * @param {boolean} active
 * @param {() => void} [onEscape]
 */
export function useFocusTrap(ref, active, onEscape) {
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const node = ref.current;
    const previouslyFocused = document.activeElement;

    const focusables = () => Array.from(node.querySelectorAll(FOCUSABLE));
    // Focus the first focusable element (or the container itself).
    const first = focusables()[0];
    (first || node).focus?.();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [ref, active, onEscape]);
}

export default useFocusTrap;
