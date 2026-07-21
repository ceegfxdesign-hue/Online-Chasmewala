import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiX, FiBarChart2 } from 'react-icons/fi';
import { selectCompare, removeFromCompare, clearCompare } from '@/features/compare/compareSlice';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { RatingStars } from '@/components/ui/RatingStars';
import { formatPrice, titleCase } from '@/lib/format';
import { ROUTES } from '@/constants/routes';

const ROWS = [
  { label: 'Price', render: (p) => formatPrice(p.price) },
  { label: 'Rating', render: (p) => <RatingStars value={p.rating} size={13} /> },
  { label: 'Brand', render: (p) => p.brand?.name || '—' },
  { label: 'Frame shape', render: (p) => (p.frameShape ? titleCase(p.frameShape) : '—') },
  { label: 'Frame type', render: (p) => (p.frameType ? titleCase(p.frameType) : '—') },
  { label: 'Material', render: (p) => (p.frameMaterial ? titleCase(p.frameMaterial) : '—') },
  { label: 'Lens type', render: (p) => (p.lensType ? titleCase(p.lensType) : '—') },
  { label: 'Warranty', render: (p) => (p.warrantyMonths ? `${p.warrantyMonths} months` : '—') },
];

export default function ComparePage() {
  const dispatch = useDispatch();
  const items = useSelector(selectCompare);

  return (
    <>
      <Helmet>
        <title>Compare Products · Online Chasmewala</title>
      </Helmet>

      <div className="container-page py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-h2 text-navy-900">Compare</h1>
          {items.length > 0 && (
            <Button variant="ghost" onClick={() => dispatch(clearCompare())}>
              Clear all
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<FiBarChart2 />}
            title="Nothing to compare yet"
            description="Add products to compare their specs side by side."
            action={<Button as={Link} to={ROUTES.products}>Browse products</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-32 p-3 text-left align-bottom" />
                  {items.map((p) => (
                    <th key={p._id} className="p-3 align-top">
                      <div className="relative rounded-2xl bg-surface p-3 shadow-card">
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCompare(p._id))}
                          aria-label={`Remove ${p.name}`}
                          className="absolute right-2 top-2 rounded-full p-1 text-navy-400 hover:bg-navy-100 hover:text-error"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                        <Link to={ROUTES.product(p.slug)}>
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            className="mx-auto h-28 w-28 rounded-xl object-cover"
                          />
                          <p className="mt-2 line-clamp-2 text-sm font-medium text-navy-900">{p.name}</p>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 ? 'bg-surface-muted' : ''}>
                    <td className="p-3 text-sm font-semibold text-navy-700">{row.label}</td>
                    {items.map((p) => (
                      <td key={p._id} className="p-3 text-center text-sm text-navy-700">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-3" />
                  {items.map((p) => (
                    <td key={p._id} className="p-3 text-center">
                      <Button as={Link} to={ROUTES.product(p.slug)} size="sm">
                        View
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
