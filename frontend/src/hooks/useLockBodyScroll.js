import { useEffect } from 'react';

/**
 * Prevent background scrolling while an overlay (modal/drawer) is open.
 * @param {boolean} locked
 */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

export default useLockBodyScroll;
