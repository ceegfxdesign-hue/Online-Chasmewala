import { useMemo, useState } from 'react';
import { FiEdit2, FiPackage, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { ProductEditorModal } from '@/components/admin/ProductEditorModal';
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetAdminProductsQuery,
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useUpdateProductMutation,
} from '@/features/products/productApi';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/lib/format';

const FILTERS = [
  ['all', 'All contact products'],
  ['clear', 'Clear contacts'],
  ['color', 'Colour contacts'],
  ['solution', 'Solutions'],
  ['accessory', 'Accessories'],
];

export default function AdminContactLensesPage() {
  const { data, isLoading } = useGetAdminProductsQuery({ page: 1, limit: 60 });
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const [create] = useCreateProductMutation();
  const [update] = useUpdateProductMutation();
  const [remove] = useDeleteProductMutation();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  const contactCategory = categories.find((category) => category.slug === 'contact-lenses');
  const products = useMemo(() => (data?.items || []).filter((product) => {
    const categoryId = product.category?._id || product.category;
    return product.category?.slug === 'contact-lenses' || (contactCategory && String(categoryId) === String(contactCategory._id));
  }), [contactCategory, data?.items]);
  const filtered = filter === 'all' ? products : products.filter((product) => product.contactLens?.kind === filter);

  const save = async (body) => {
    setSaving(true);
    try {
      if (editing?._id) await update({ id: editing._id, ...body }).unwrap();
      else await create(body).unwrap();
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (product) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    try {
      await remove(product._id).unwrap();
      toast.success('Contact-lens product deleted');
    } catch (error) {
      toast.error(error?.message || 'Unable to delete this product');
    }
  };

  const newProduct = () => {
    if (!contactCategory) {
      toast.error('Create a Contact Lenses category first, then return here.');
      return;
    }
    setEditing({});
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h3 text-navy-900">Contact Lenses</h1>
          <p className="mt-1 text-sm text-navy-500">Manage clear and colour contacts, solutions, accessories, packs, colours and prescription choices.</p>
        </div>
        <Button leftIcon={<FiPlus />} onClick={newProduct}>Add contact lens</Button>
      </div>

      {!contactCategory && !isLoading && <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-navy-700">The “Contact Lenses” category is not available yet. Add it under Categories before adding products here.</div>}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${filter === value ? 'bg-brand-500 text-white' : 'border border-navy-200 bg-surface text-navy-600 hover:bg-navy-50'}`}>{label}</button>)}
      </div>

      {isLoading ? <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-52" /></div> : filtered.length ? (
        <div className="overflow-x-auto rounded-2xl bg-surface shadow-card"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Pack / quantity</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-navy-100">{filtered.map((product) => <tr key={product._id}><td className="px-4 py-3"><p className="font-medium text-navy-900">{product.name}</p><p className="mt-0.5 text-xs text-navy-400">{product.sku}</p></td><td className="px-4 py-3 capitalize text-navy-600">{product.contactLens?.kind || 'clear'} contacts</td><td className="px-4 py-3 text-navy-600">{product.contactLens?.packOptions?.[0]?.label || (product.contactLens?.lensesPerBox ? `${product.contactLens.lensesPerBox} lenses/box` : '—')}</td><td className="px-4 py-3">{formatPrice(product.price)}</td><td className="px-4 py-3">{product.stock}</td><td className="px-4 py-3"><div className="flex gap-2"><Button size="icon" variant="ghost" aria-label={`Edit ${product.name}`} onClick={() => setEditing(product)}><FiEdit2 /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${product.name}`} onClick={() => destroy(product)}><FiTrash2 /></Button></div></td></tr>)}</tbody></table></div>
      ) : <EmptyState icon={<FiPackage />} title="No contact-lens products yet" description="Add clear contacts, colour contacts, solutions, or accessories for the contact-lens catalogue." action={<Button onClick={newProduct}>Add contact lens</Button>} />}

      <ProductEditorModal product={editing} categories={categories} brands={brands} saving={saving} onClose={() => setEditing(null)} onSave={save} contactLensMode fixedCategoryId={contactCategory?._id} />
    </div>
  );
}
