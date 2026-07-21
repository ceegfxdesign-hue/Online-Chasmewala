import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const SIDES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Lightweight tooltip shown on hover and keyboard focus.
 */
export function Tooltip({ label, side = 'top', children, className }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            id={id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-navy-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-elevated',
              SIDES[side],
              className
            )}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default Tooltip;
