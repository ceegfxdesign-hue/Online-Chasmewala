import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind-aware conflict resolution.
 * @param {...any} inputs clsx-compatible class values
 * @returns {string}
 */
export const cn = (...inputs) => twMerge(clsx(inputs));

export default cn;
