import { useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
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

/** Complete product administration page, including the PDP configuration editor. */
export function AdminProductsPage() {
  const { data, isLoading } = useGetAdminProductsQuery({ page: 1, limit: 50 });
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const [create] = useCreateProductMutation();
  const [update] = useUpdateProductMutation();
  const [remove] = useDeleteProductMutation();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const products = data?.items || [];

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
      toast.success('Product deleted');
    } catch (error) {
      toast.error(error?.message || 'Unable to delete product');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h3 text-navy-900">Products</h1>
          <p className="mt-1 text-sm text-navy-500">Create and manage everything customers see on a product detail page.</p>
        </div>
        <Button leftIcon={<FiPlus />} onClick={() => setEditing({})}>Add product</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-52" /></div>
      ) : products.length ? (
        <div className="overflow-x-auto rounded-2xl bg-surface shadow-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
              <tr><th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">SKU</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Stock</th><th className="px-4 py-3 font-semibold">Published</th><th className="px-4 py-3 font-semibold">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-3"><p className="font-medium text-navy-900">{product.name}</p><p className="mt-0.5 text-xs text-navy-400">{product.variants?.length || 0} colours · {product.frameSize || 'standard'} fit</p></td>
                  <td className="px-4 py-3 text-navy-500">{product.sku}</td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">{product.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3"><div className="flex gap-2"><Button size="icon" variant="ghost" aria-label={`Edit ${product.name}`} onClick={() => setEditing(product)}><FiEdit2 /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${product.name}`} onClick={() => destroy(product)}><FiTrash2 /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No products found" description="Create your first product to start building the catalogue." action={<Button onClick={() => setEditing({})}>Add product</Button>} />
      )}

      <ProductEditorModal
        product={editing}
        categories={categories}
        brands={brands}
        saving={saving}
        onClose={() => setEditing(null)}
        onSave={save}
      />
    </div>
  );
}

export default AdminProductsPage;
