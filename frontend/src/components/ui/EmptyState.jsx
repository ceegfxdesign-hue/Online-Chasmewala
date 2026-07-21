import { cn } from '@/utils/cn';

/**
 * Friendly empty/zero-result state with optional icon and action.
 */
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl text-brand-500">
          {icon}
        </div>
      )}
      {title && <h3 className="text-h4 text-navy-900">{title}</h3>}
      {description && <p className="mt-2 max-w-sm text-sm text-navy-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
