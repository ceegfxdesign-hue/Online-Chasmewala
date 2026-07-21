import { useEffect, useState } from 'react';

/**
 * Debounce a rapidly-changing value.
 * @template T
 * @param {T} value
 * @param {number} delay ms
 * @returns {T}
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
