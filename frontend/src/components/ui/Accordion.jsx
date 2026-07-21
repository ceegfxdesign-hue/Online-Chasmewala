import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { cn } from '@/utils/cn';

/**
 * Accessible accordion. `items` = `{ key, title, content }[]`.
 * `allowMultiple` lets several panels stay open.
 */
export function Accordion({ items, allowMultiple = false, defaultOpen = [], className }) {
  const [openKeys, setOpenKeys] = useState(new Set(defaultOpen));
  const baseId = useId();

  const toggle = (key) => {
    setOpenKeys((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className={cn('divide-y divide-navy-100 rounded-2xl border border-navy-100', className)}>
      {items.map((item) => {
        const isOpen = openKeys.has(item.key);
        return (
          <div key={item.key}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${baseId}-${item.key}`}
                onClick={() => toggle(item.key)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy-800 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {item.title}
                <FiChevronDown
                  className={cn('h-5 w-5 shrink-0 text-navy-400 transition-transform', isOpen && 'rotate-180')}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${baseId}-${item.key}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0 text-sm leading-relaxed text-navy-600">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
