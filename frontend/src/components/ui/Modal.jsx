import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { Portal } from './Portal';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { overlay, modalPop } from '@/lib/motion';
import { cn } from '@/utils/cn';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Accessible, animated modal dialog. Traps focus, closes on Esc / backdrop
 * click, and locks body scroll while open.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', className }) {
  const panelRef = useRef(null);
  useLockBodyScroll(open);
  useFocusTrap(panelRef, open, onClose);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              {...overlay}
              className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              {...modalPop}
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={title || 'Dialog'}
              tabIndex={-1}
              className={cn(
                'relative z-10 w-full overflow-hidden rounded-2xl bg-surface shadow-elevated focus:outline-none',
                SIZES[size],
                className
              )}
            >
              {(title || onClose) && (
                <div className="flex items-start justify-between gap-4 border-b border-navy-100 p-5">
                  <div>
                    {title && <h2 className="text-h4 text-navy-900">{title}</h2>}
                    {description && <p className="mt-1 text-sm text-navy-400">{description}</p>}
                  </div>
                  {onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close dialog"
                      className="-mr-1 rounded-full p-2 text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-700"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
              {footer && <div className="border-t border-navy-100 p-5">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export default Modal;
