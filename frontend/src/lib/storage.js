/**
 * Safe localStorage helpers. Never throw (private mode / quota / SSR); fall back
 * to defaults instead.
 */
const PREFIX = 'oc:';

export function loadState(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore write failures */
  }
}

export function removeState(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
