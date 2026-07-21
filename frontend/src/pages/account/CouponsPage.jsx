import { Helmet } from 'react-helmet-async';
import { FiTag, FiCopy } from 'react-icons/fi';
import { useGetActiveCouponsQuery } from '@/features/cart/cartApi';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, formatDate } from '@/lib/format';

export default function CouponsPage() {
  const toast = useToast();
  const { data: coupons = [], isLoading } = useGetActiveCouponsQuery();

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`${code} copied — apply it at checkout`);
    } catch {
      toast.info(`Use code ${code} at checkout`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Coupons · Online Chasmewala</title>
      </Helmet>

      <h2 className="mb-4 text-h4 text-navy-900">Available Coupons</h2>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState icon={<FiTag />} title="No coupons right now" description="Check back soon for fresh offers." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="relative flex overflow-hidden rounded-2xl border border-dashed border-brand-300 bg-brand-50/50"
            >
              <div className="flex w-14 shrink-0 items-center justify-center bg-brand-500 text-white [writing-mode:vertical-rl] rotate-180 text-xs font-bold uppercase tracking-widest">
                {c.type === 'percentage' ? `${c.value}% OFF` : `${formatPrice(c.value)} OFF`}
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-lg font-bold text-navy-900">{c.code}</p>
                  <button
                    type="button"
                    onClick={() => copy(c.code)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100"
                  >
                    <FiCopy className="h-3.5 w-3.5" /> Copy
                  </button>
                </div>
                <p className="mt-1 text-sm text-navy-600">{c.description}</p>
                <p className="mt-2 text-xs text-navy-400">
                  {c.minOrderValue > 0 && `Min order ${formatPrice(c.minOrderValue)} · `}
                  {c.maxDiscount && `Max discount ${formatPrice(c.maxDiscount)} · `}
                  Valid till {formatDate(c.expiresAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
