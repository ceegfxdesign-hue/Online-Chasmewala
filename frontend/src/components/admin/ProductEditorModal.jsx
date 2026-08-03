import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/utils/cn';
import { getOptimizedImageUrl } from '@/lib/images';

const FRAME_SHAPES = ['rectangle', 'square', 'round', 'oval', 'cat-eye', 'aviator', 'wayfarer', 'geometric', 'clubmaster'];
const FRAME_TYPES = ['full-rim', 'half-rim', 'rimless'];
const FRAME_MATERIALS = ['acetate', 'metal', 'tr90', 'titanium', 'plastic', 'mixed'];
const FRAME_SIZES = ['narrow', 'medium', 'wide', 'extra-wide'];
const LENS_TYPES = ['single-vision', 'bifocal', 'progressive', 'zero-power', 'blue-light', 'polarized', 'photochromic', 'sunglasses'];
const MAX_GALLERY_IMAGES = 5;
const MAX_IMAGE_EDGE = 1200;
const MAX_IMAGE_DATA_URL_LENGTH = 750000;

const humanize = (value) => value.replaceAll('-', ' ');
const asCommaList = (items = []) => items.join(', ');

function normalizeImageSource(value) {
  const source = value.trim();
  const driveFile = source.match(/^https?:\/\/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  return driveFile ? `https://drive.google.com/uc?export=view&id=${driveFile[1]}` : source;
}

function createCompressedImageUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('The selected image could not be opened.'));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Image preparation is not supported in this browser.'));
          return;
        }
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        let quality = 0.86;
        let imageUrl = canvas.toDataURL('image/jpeg', quality);
        while (imageUrl.length > MAX_IMAGE_DATA_URL_LENGTH && quality > 0.45) {
          quality -= 0.1;
          imageUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (imageUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
          reject(new Error('This image is too large. Please choose a smaller image.'));
          return;
        }
        resolve(imageUrl);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function productToForm(product) {
  return {
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    category: product?.category?._id || product?.category || '',
    brand: product?.brand?._id || product?.brand || '',
    price: product?.price ?? '',
    mrp: product?.mrp ?? '',
    frameShape: product?.frameShape || '',
    frameMaterial: product?.frameMaterial || '',
    rimType: product?.rimType || product?.frameType || '',
    frameColor: product?.frameColor || '',
    stock: product?.stock ?? 10,
    isInStock: product ? product.stock > 0 : true,
    badge: product?.isTrending ? 'trending' : product?.isBestSeller ? 'best-seller' : product?.isNewArrival ? 'new-arrival' : product?.isFeatured ? 'featured' : 'none',
    powered: product?.powered !== false,
    tryOnImage: product?.tryOnImage || '',
    model3dUrl: product?.model3dUrl || '',
    gender: product?.gender || 'unisex',
    frameSize: product?.frameSize || 'medium',
    lensType: product?.lensType || '',
    suitableFaceShapes: asCommaList(product?.suitableFaceShapes),
    tags: asCommaList(product?.tags),
  };
}

function ChoiceButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
        active ? 'border-brand-500 bg-brand-500 text-white' : 'border-navy-200 text-navy-600 hover:border-brand-300 hover:bg-brand-50'
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** A focused stock-entry editor for all information needed to publish a frame. */
export function ProductEditorModal({ product, categories, brands, onClose, onSave, saving = false }) {
  const toast = useToast();
  const editing = Boolean(product?._id);
  const [form, setForm] = useState(() => productToForm(product));
  const [images, setImages] = useState(product?.images || []);
  const [directImageUrl, setDirectImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setForm(productToForm(product));
    setImages(product?.images || []);
    setDirectImageUrl('');
    setValidationErrors({});
  }, [product]);

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ value: item._id, label: item.name })),
    [categories]
  );
  const brandOptions = useMemo(
    () => brands.map((item) => ({ value: item._id, label: item.name })),
    [brands]
  );
  const setValue = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const getFieldError = (field) => validationErrors[field];

  const addImage = (source) => {
    const image = normalizeImageSource(source);
    if (!image) return;
    if (images.length >= MAX_GALLERY_IMAGES) {
      toast.error(`A product gallery can contain up to ${MAX_GALLERY_IMAGES} images.`);
      return;
    }
    if (images.includes(image)) {
      toast.error('That image is already in this gallery.');
      return;
    }
    setImages((current) => [...current, image]);
  };

  const addDirectImage = () => {
    if (!directImageUrl.trim()) {
      toast.error('Paste a direct public image URL first.');
      return;
    }
    addImage(directImageUrl);
    setDirectImageUrl('');
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    if (images.length + files.length > MAX_GALLERY_IMAGES) {
      toast.error(`Select no more than ${MAX_GALLERY_IMAGES - images.length} additional image(s).`);
      return;
    }

    setUploadingImage(true);
    try {
      const preparedImages = await Promise.all(files.map(createCompressedImageUrl));
      setImages((current) => [...current, ...preparedImages].slice(0, MAX_GALLERY_IMAGES));
      toast.success(`${preparedImages.length} image${preparedImages.length === 1 ? '' : 's'} added. Save product to publish.`);
    } catch (error) {
      toast.error(error.message || 'Unable to prepare these images.');
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setValidationErrors({});

    if (!images.length) {
      toast.error('Add at least one product image before saving.');
      return;
    }
    const price = Number(form.price);
    const mrp = Number(form.mrp);
    if (!Number.isFinite(price) || !Number.isFinite(mrp) || price < 0 || mrp < 0) {
      toast.error('Enter valid selling price and MRP amounts.');
      return;
    }
    if (mrp < price) {
      toast.error('MRP cannot be lower than the selling price.');
      return;
    }

    const name = form.name.trim();
    const autoSku = `OC-${name.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').slice(0, 24).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const body = {
      name,
      sku: form.sku.trim() || autoSku,
      description: form.description.trim() || `${name} is a premium ${form.frameMaterial || 'eyewear'} frame in ${form.frameColor || 'a versatile colour'}.`,
      category: form.category,
      brand: form.brand,
      price,
      mrp,
      images,
      stock: form.isInStock ? Math.max(0, Number(form.stock) || 0) : 0,
      lowStockThreshold: 5,
      powered: form.powered,
      isActive: true,
      isBestSeller: form.badge === 'best-seller',
      isTrending: form.badge === 'trending',
      isNewArrival: form.badge === 'new-arrival',
      isFeatured: form.badge === 'featured',
      gender: form.gender || undefined,
      frameShape: form.frameShape || undefined,
      frameMaterial: form.frameMaterial || undefined,
      frameType: form.rimType || undefined,
      rimType: form.rimType || undefined,
      frameColor: form.frameColor.trim() || undefined,
      frameSize: form.frameSize || undefined,
      lensType: form.lensType || undefined,
      suitableFaceShapes: form.suitableFaceShapes.split(',').map((item) => item.trim()).filter(Boolean),
      tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
      tryOnImage: form.tryOnImage.trim() ? normalizeImageSource(form.tryOnImage) : undefined,
      model3dUrl: form.model3dUrl.trim() || undefined,
    };

    try {
      await onSave(body);
      toast.success('Product saved');
      onClose();
    } catch (error) {
      const errors = Array.isArray(error?.errors) ? error.errors : [];
      const byField = errors.reduce((result, item) => {
        if (item?.field && item?.message) result[item.field] = item.message;
        return result;
      }, {});
      setValidationErrors(byField);
      const firstError = errors[0];
      toast.error(firstError ? `${firstError.field}: ${firstError.message}` : error?.message || 'Unable to save product');
    }
  };

  return (
    <Modal open={Boolean(product)} onClose={onClose} title={`${editing ? 'Edit' : 'Upload new'} frame stock details`} size="xl">
      <form onSubmit={submit} className="space-y-7">
        {Object.keys(validationErrors).length > 0 && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error" role="alert">
            Please correct the highlighted field{Object.keys(validationErrors).length === 1 ? '' : 's'} and save again.
          </div>
        )}

        <section className="space-y-4">
          <Input name="name" label="Frame name" placeholder="E.g. Aviator Rimless Dual Gold" value={form.name} onChange={(event) => setValue('name', event.target.value)} minLength="2" error={getFieldError('name')} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Select name="brand" label="Brand label" value={form.brand} onChange={(event) => setValue('brand', event.target.value)} placeholder="Select a brand" options={brandOptions} error={getFieldError('brand')} required />
            <Select name="category" label="Category" value={form.category} onChange={(event) => setValue('category', event.target.value)} placeholder="Select a category" options={categoryOptions} error={getFieldError('category')} required />
            <Input name="price" label="Selling price (Rs.)" type="number" min="0" step="0.01" placeholder="1499" value={form.price} onChange={(event) => setValue('price', event.target.value)} error={getFieldError('price')} required />
            <Input name="mrp" label="MRP markup (Rs.)" type="number" min="0" step="0.01" placeholder="2999" value={form.mrp} onChange={(event) => setValue('mrp', event.target.value)} error={getFieldError('mrp')} required />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Select name="frameShape" label="Shape" value={form.frameShape} onChange={(event) => setValue('frameShape', event.target.value)} placeholder="Select shape" options={FRAME_SHAPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameShape')} />
          <Select name="frameMaterial" label="Material" value={form.frameMaterial} onChange={(event) => setValue('frameMaterial', event.target.value)} placeholder="Select material" options={FRAME_MATERIALS.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameMaterial')} />
          <Select name="rimType" label="Rim fit" value={form.rimType} onChange={(event) => setValue('rimType', event.target.value)} placeholder="Select rim fit" options={FRAME_TYPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('rimType')} />
          <Input name="frameColor" label="Colour variant" placeholder="Matte Black" value={form.frameColor} onChange={(event) => setValue('frameColor', event.target.value)} />
          <Select name="badge" label="Stock tag badge" value={form.badge} onChange={(event) => setValue('badge', event.target.value)} options={[{ value: 'none', label: 'None' }, { value: 'trending', label: 'Trending' }, { value: 'best-seller', label: 'Best seller' }, { value: 'new-arrival', label: 'New arrival' }, { value: 'featured', label: 'Featured' }]} />
          <Select name="gender" label="Designed for" value={form.gender} onChange={(event) => setValue('gender', event.target.value)} options={['men', 'women', 'unisex', 'kids'].map((value) => ({ value, label: humanize(value) }))} />
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-navy-600">Initial availability</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceButton active={form.isInStock} onClick={() => setValue('isInStock', true)}>In stock</ChoiceButton>
            <ChoiceButton active={!form.isInStock} onClick={() => setValue('isInStock', false)}>Out of stock</ChoiceButton>
          </div>
          {form.isInStock && <Input name="stock" label="Initial stock level (units)" type="number" min="0" value={form.stock} onChange={(event) => setValue('stock', event.target.value)} helper="Use the number of frames currently available." />}
        </section>

        <section className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-navy-700">Prescription custom lens workflow</p>
          <p className="mt-1 text-sm text-navy-500">When enabled, customers can choose lens type and prescription options on the product page.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ChoiceButton active={form.powered} onClick={() => setValue('powered', true)}>Enabled</ChoiceButton>
            <ChoiceButton active={!form.powered} onClick={() => setValue('powered', false)}>Disabled</ChoiceButton>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="tryOnImage" label="Transparent try-on image (optional)" placeholder="https://example.com/transparent-glasses.png" value={form.tryOnImage} onChange={(event) => setValue('tryOnImage', event.target.value)} helper="A transparent PNG URL for a future virtual try-on experience." />
            <Input name="model3dUrl" label="3D eyewear GLB model URL (optional)" placeholder="https://example.com/frame.glb" value={form.model3dUrl} onChange={(event) => setValue('model3dUrl', event.target.value)} helper="Store a GLB URL for future 3D product viewing." />
          </div>
          <div className="rounded-2xl border border-navy-200 bg-surface-subtle p-4">
            <p className="text-sm font-semibold text-navy-800">Direct product image URL (optional)</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input aria-label="Direct product image URL" placeholder="https://images.example.com/frame.jpg" value={directImageUrl} onChange={(event) => setDirectImageUrl(event.target.value)} />
              <Button type="button" onClick={addDirectImage} className="shrink-0">Add URL</Button>
            </div>
            <p className="mt-2 text-xs text-navy-400">Paste a direct image link, not a local C:\\ file path or a webpage link.</p>
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div><p className="text-sm font-semibold uppercase tracking-wide text-navy-600">Product gallery</p><p className="mt-1 text-sm text-navy-400">Add up to {MAX_GALLERY_IMAGES} product images. The first image is the main product image.</p></div>
            <span className="text-sm font-semibold text-brand-600">{images.length}/{MAX_GALLERY_IMAGES}</span>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-200 bg-surface-subtle px-5 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50">
            <span className="text-sm font-semibold text-navy-700">{uploadingImage ? 'Preparing image files...' : 'Upload custom product photos'}</span>
            <span className="mt-1 text-xs text-navy-400">JPEG, PNG or WebP - select up to {MAX_GALLERY_IMAGES - images.length || 0} more</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploadingImage || images.length >= MAX_GALLERY_IMAGES} onChange={uploadImages} />
          </label>
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((image, index) => (
                <div key={`${image.slice(0, 48)}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-navy-100 bg-surface-subtle">
                  <img src={getOptimizedImageUrl(image, 240)} alt={`Product gallery ${index + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 rounded-full bg-navy-900/80 px-2 py-1 text-xs font-bold text-white" aria-label={`Remove image ${index + 1}`}>x</button>
                  {index === 0 && <span className="absolute bottom-1 left-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">MAIN</span>}
                </div>
              ))}
            </div>
          )}
        </section>

        <details className="rounded-2xl border border-navy-100 bg-surface-subtle p-4">
          <summary className="cursor-pointer text-sm font-semibold text-navy-700">Additional product details (optional)</summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input name="sku" label="SKU" placeholder="Leave blank to generate automatically" value={form.sku} onChange={(event) => setValue('sku', event.target.value)} error={getFieldError('sku')} />
            <Select name="frameSize" label="Frame fit" value={form.frameSize} onChange={(event) => setValue('frameSize', event.target.value)} options={FRAME_SIZES.map((value) => ({ value, label: humanize(value) }))} />
            <Select name="lensType" label="Lens type" value={form.lensType} onChange={(event) => setValue('lensType', event.target.value)} placeholder="Select lens type" options={LENS_TYPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('lensType')} />
            <Input name="suitableFaceShapes" label="Suitable face shapes" placeholder="oval, round, square" value={form.suitableFaceShapes} onChange={(event) => setValue('suitableFaceShapes', event.target.value)} error={getFieldError('suitableFaceShapes') || getFieldError('suitableFaceShapes.0')} />
            <Input name="tags" label="Search tags" placeholder="aviator, metal, lightweight" value={form.tags} onChange={(event) => setValue('tags', event.target.value)} />
            <div className="md:col-span-2"><Textarea name="description" label="Product description" placeholder="Leave blank to create a basic description automatically." value={form.description} onChange={(event) => setValue('description', event.target.value)} error={getFieldError('description')} /></div>
          </div>
        </details>

        <div className="flex flex-wrap justify-end gap-3 border-t border-navy-100 pt-5">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Confirm stock entry</Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductEditorModal;
