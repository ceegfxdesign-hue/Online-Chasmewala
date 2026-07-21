import { useEffect } from 'react';

/**
 * Invoke a handler when a click/touch occurs outside the referenced element.
 * @param {React.RefObject<HTMLElement>} ref
 * @param {(e: Event) => void} handler
 * @param {boolean} [enabled=true]
 */
export function useOnClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const listener = (event) => {
      const el = ref.current;
      if (!el || el.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

export default useOnClickOutside;
