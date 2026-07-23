import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

const GENDERS = ['men', 'women', 'unisex', 'kids'];
const FRAME_SHAPES = ['rectangle', 'square', 'round', 'oval', 'cat-eye', 'aviator', 'wayfarer', 'geometric', 'clubmaster'];
const FRAME_TYPES = ['full-rim', 'half-rim', 'rimless'];
const FRAME_MATERIALS = ['acetate', 'metal', 'tr90', 'titanium', 'plastic', 'mixed'];
const FRAME_SIZES = ['narrow', 'medium', 'wide', 'extra-wide'];
const LENS_TYPES = ['single-vision', 'bifocal', 'progressive', 'zero-power', 'blue-light', 'polarized', 'photochromic', 'sunglasses'];

const asLines = (items = []) => items.join('\n');
const asCommaList = (items = []) => items.join(', ');
const humanize = (value) => value.replaceAll('-', ' ');

function Toggle({ name, label, defaultChecked = false }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-navy-100 px-3 py-2 text-sm text-navy-700">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="accent-brand-500" />
      {label}
    </label>
  );
}

/**
 * Complete product editor for the admin area. Array fields use one item per
 * line (or comma-separated chips) so the request matches the product API.
 */
export function ProductEditorModal({ product, categories, brands, onClose, onSave, saving = false }) {
  const toast = useToast();
  const editing = Boolean(product?._id);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form);

    ['price', 'mrp', 'stock', 'lowStockThreshold', 'frameWidth', 'lensWidth', 'bridgeSize', 'templeSize', 'warrantyMonths', 'returnDays'].forEach((key) => {
      if (body[key] === '') delete body[key];
      else body[key] = Number(body[key]);
    });

    ['images', 'highlights'].forEach((key) => {
      body[key] = String(body[key] || '').split('\n').map((value) => value.trim()).filter(Boolean);
    });
    ['tags', 'collections', 'suitableFaceShapes'].forEach((key) => {
      body[key] = String(body[key] || '').split(',').map((value) => value.trim()).filter(Boolean);
    });

    const variantsInput = String(body.variants || '').trim();
    let variants = [];
    try {
      variants = variantsInput ? JSON.parse(variantsInput) : [];
    } catch {
      toast.error('Variants must be valid JSON. Check the example shown below the field.');
      return;
    }
    if (!Array.isArray(variants)) {
      toast.error('Variants must be a JSON list enclosed in square brackets.');
      return;
    }
    body.variants = variants;

    const lensOptionsInput = String(body.lensOptions || '').trim();
    let lensOptions = [];
    try {
      lensOptions = lensOptionsInput ? JSON.parse(lensOptionsInput) : [];
    } catch {
      toast.error('Lens options must be valid JSON. Check the example shown below the field.');
      return;
    }
    if (!Array.isArray(lensOptions)) {
      toast.error('Lens options must be a JSON list enclosed in square brackets.');
      return;
    }
    body.lensOptions = lensOptions;

    ['powered', 'blueLightFilter', 'polarized', 'uvProtection', 'isActive', 'isBestSeller', 'isTrending', 'isNewArrival', 'isFeatured'].forEach((key) => {
      body[key] = form.get(key) === 'on';
    });

    ['gender', 'frameShape', 'frameType', 'frameMaterial', 'frameSize', 'rimType', 'lensType', 'lensThickness', 'frameColor'].forEach((key) => {
      if (!body[key]) delete body[key];
    });

    try {
      await onSave(body);
      toast.success('Product saved');
      onClose();
    } catch (error) {
      toast.error(error?.message || 'Unable to save product');
    }
  };

  return (
    <Modal open={Boolean(product)} onClose={onClose} title={`${editing ? 'Edit' : 'Add'} product`} size="xl">
      <form onSubmit={submit} className="space-y-7">
        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Core details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="name" label="Product name" defaultValue={product?.name} required />
            <Input name="sku" label="SKU" defaultValue={product?.sku} required />
            <Select name="category" label="Category" defaultValue={product?.category?._id || product?.category || ''} placeholder="Select a category" options={categories.map((item) => ({ value: item._id, label: item.name }))} required />
            <Select name="brand" label="Brand" defaultValue={product?.brand?._id || product?.brand || ''} placeholder="Select a brand" options={brands.map((item) => ({ value: item._id, label: item.name }))} required />
            <Input name="price" label="Selling price (₹)" type="number" min="0" defaultValue={product?.price} required />
            <Input name="mrp" label="MRP (₹)" type="number" min="0" defaultValue={product?.mrp} required />
            <Input name="stock" label="Total stock" type="number" min="0" defaultValue={product?.stock ?? 0} />
            <Input name="lowStockThreshold" label="Low-stock alert at" type="number" min="0" defaultValue={product?.lowStockThreshold ?? 5} />
            <div className="md:col-span-2"><Textarea name="description" label="Description" defaultValue={product?.description} required /></div>
            <div className="md:col-span-2"><Textarea name="highlights" label="Highlights (one per line)" defaultValue={asLines(product?.highlights)} helper="Shown as product benefits on the detail page." /></div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Gallery and colour variants</h3>
          <div className="space-y-4">
            <Textarea name="images" label="Main image URLs (one per line)" defaultValue={asLines(product?.images)} helper="The first image is the product-card and cart image." required />
            <Textarea
              name="variants"
              label="Colour variants (JSON)"
              defaultValue={product?.variants?.length ? JSON.stringify(product.variants, null, 2) : ''}
              helper={'Optional. Example: [{"color":"Matte Black","colorHex":"#111827","stock":12,"sku":"OC-BLK","images":["https://..."]}]'}
            />
            <Input name="frameColor" label="Frame colour description" defaultValue={product?.frameColor} helper="Used in product details and search." />
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Frame specifications</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Select name="gender" label="Designed for" defaultValue={product?.gender || 'unisex'} options={GENDERS.map((value) => ({ value, label: humanize(value) }))} />
            <Select name="frameShape" label="Frame shape" defaultValue={product?.frameShape || ''} placeholder="Select shape" options={FRAME_SHAPES.map((value) => ({ value, label: humanize(value) }))} />
            <Select name="frameType" label="Frame type" defaultValue={product?.frameType || ''} placeholder="Select type" options={FRAME_TYPES.map((value) => ({ value, label: humanize(value) }))} />
            <Select name="rimType" label="Rim type" defaultValue={product?.rimType || ''} placeholder="Select rim type" options={FRAME_TYPES.map((value) => ({ value, label: humanize(value) }))} />
            <Select name="frameMaterial" label="Frame material" defaultValue={product?.frameMaterial || ''} placeholder="Select material" options={FRAME_MATERIALS.map((value) => ({ value, label: humanize(value) }))} />
            <Select name="frameSize" label="Frame fit" defaultValue={product?.frameSize || 'medium'} options={FRAME_SIZES.map((value) => ({ value, label: humanize(value) }))} />
            <Input name="frameWidth" label="Frame width (mm)" type="number" min="0" defaultValue={product?.frameWidth} />
            <Input name="lensWidth" label="Lens width (mm)" type="number" min="0" defaultValue={product?.lensWidth} />
            <Input name="bridgeSize" label="Bridge size (mm)" type="number" min="0" defaultValue={product?.bridgeSize} />
            <Input name="templeSize" label="Temple size (mm)" type="number" min="0" defaultValue={product?.templeSize} />
            <div className="md:col-span-2"><Input name="suitableFaceShapes" label="Suitable face shapes" defaultValue={asCommaList(product?.suitableFaceShapes)} helper="Comma-separated: oval, round, square, heart, oblong, diamond." /></div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Lenses, protection and policies</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Select name="lensType" label="Lens type" defaultValue={product?.lensType || ''} placeholder="Select lens type" options={LENS_TYPES.map((value) => ({ value, label: humanize(value) }))} />
            <Input name="lensThickness" label="Lens thickness" defaultValue={product?.lensThickness} placeholder="e.g. 1.56 index" />
            <div className="md:col-span-2"><Textarea name="lensOptions" label="Product-type options (JSON)" defaultValue={product?.lensOptions?.length ? JSON.stringify(product.lensOptions, null, 2) : ''} helper={'Optional. Example: [{"type":"zero-power","label":"Zero Power","subtitle":"Screen glasses","price":0}]'} /></div>
            <Input name="warrantyMonths" label="Warranty (months)" type="number" min="0" defaultValue={product?.warrantyMonths ?? 12} />
            <Input name="returnDays" label="Return window (days)" type="number" min="0" defaultValue={product?.returnDays ?? 14} />
            <div className="md:col-span-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Toggle name="powered" label="Prescription supported" defaultChecked={product?.powered !== false} />
              <Toggle name="blueLightFilter" label="Blue-light filter" defaultChecked={product?.blueLightFilter} />
              <Toggle name="polarized" label="Polarized lenses" defaultChecked={product?.polarized} />
              <Toggle name="uvProtection" label="UV protection" defaultChecked={product?.uvProtection} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Merchandising</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="tags" label="Tags" defaultValue={asCommaList(product?.tags)} helper="Comma-separated, for search and filters." />
            <Input name="collections" label="Collections" defaultValue={asCommaList(product?.collections)} helper="Comma-separated, for curated storefront sections." />
            <div className="md:col-span-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              <Toggle name="isActive" label="Published" defaultChecked={product?.isActive !== false} />
              <Toggle name="isBestSeller" label="Best seller" defaultChecked={product?.isBestSeller} />
              <Toggle name="isTrending" label="Trending" defaultChecked={product?.isTrending} />
              <Toggle name="isNewArrival" label="New arrival" defaultChecked={product?.isNewArrival} />
              <Toggle name="isFeatured" label="Featured" defaultChecked={product?.isFeatured} />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-navy-100 pt-5">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Save product</Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductEditorModal;
