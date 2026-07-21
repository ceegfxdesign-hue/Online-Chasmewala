import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { Portal } from './Portal';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { overlay, drawerRight, drawerLeft } from '@/lib/motion';
import { cn } from '@/utils/cn';

/**
 * Slide-in panel anchored to the left or right edge. Used for the cart, mobile
 * navigation and filter sidebars. Traps focus and closes on Esc / backdrop.
 */
export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
  footer,
  width = 'max-w-md',
  className,
}) {
  const panelRef = useRef(null);
  useLockBodyScroll(open);
  useFocusTrap(panelRef, open, onClose);
  const anim = side === 'right' ? drawerRight : drawerLeft;

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              {...overlay}
              className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              {...anim}
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={title || 'Panel'}
              tabIndex={-1}
              className={cn(
                'absolute top-0 flex h-full w-full flex-col bg-surface shadow-elevated focus:outline-none',
                side === 'right' ? 'right-0' : 'left-0',
                width,
                className
              )}
            >
              <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
                <h2 className="text-h4 text-navy-900">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close panel"
                  className="-mr-1 rounded-full p-2 text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-700"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{children}</div>
              {footer && <div className="border-t border-navy-100 p-5">{footer}</div>}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export default Drawer;
