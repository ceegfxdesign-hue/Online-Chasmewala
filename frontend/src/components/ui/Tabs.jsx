import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

/**
 * Accessible tabs.
 * @param {{items: {key:string,label:React.ReactNode,content:React.ReactNode}[], defaultKey?:string}} props
 */
export function Tabs({ items, defaultKey, className, onChange }) {
  const [active, setActive] = useState(defaultKey || items[0]?.key);
  const groupId = useId();

  const select = (key) => {
    setActive(key);
    onChange?.(key);
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label="Tabs" className="relative flex gap-1 border-b border-navy-100">
        {items.map((item) => {
          const selected = item.key === active;
          return (
            <button
              key={item.key}
              role="tab"
              id={`${groupId}-tab-${item.key}`}
              aria-selected={selected}
              aria-controls={`${groupId}-panel-${item.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.key)}
              className={cn(
                'relative px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                selected ? 'text-brand-600' : 'text-navy-500 hover:text-navy-800'
              )}
            >
              {item.label}
              {selected && (
                <motion.span
                  layoutId={`${groupId}-underline`}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-500"
                />
              )}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.key}
          role="tabpanel"
          id={`${groupId}-panel-${item.key}`}
          aria-labelledby={`${groupId}-tab-${item.key}`}
          hidden={item.key !== active}
          className="pt-5"
        >
          {item.key === active && item.content}
        </div>
      ))}
    </div>
  );
}

export default Tabs;
