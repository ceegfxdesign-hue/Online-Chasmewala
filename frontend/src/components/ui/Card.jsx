import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const ELEVATIONS = {
  flat: 'shadow-none border border-navy-100',
  soft: 'shadow-soft',
  card: 'shadow-card',
  elevated: 'shadow-elevated',
};

/**
 * Surface container. `hoverable` adds a lift on hover for interactive cards.
 */
export const Card = forwardRef(function Card(
  { as: Component = 'div', elevation = 'card', hoverable = false, className, children, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={cn(
        'rounded-2xl bg-surface',
        ELEVATIONS[elevation],
        hoverable &&
          'transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-elevated',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export const CardBody = ({ className, ...props }) => (
  <div className={cn('p-5 sm:p-6', className)} {...props} />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('border-b border-navy-100 p-5 sm:p-6', className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={cn('border-t border-navy-100 p-5 sm:p-6', className)} {...props} />
);

export default Card;
