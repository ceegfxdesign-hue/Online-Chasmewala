import { useEffect, useRef, useState } from 'react';
import { Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { getOptimizedImageUrl } from '@/lib/images';

const GENDERS = ['men', 'women', 'unisex', 'kids'];
const FRAME_SHAPES = ['rectangle', 'square', 'round', 'oval', 'cat-eye', 'aviator', 'wayfarer', 'geometric', 'clubmaster'];
const FRAME_TYPES = ['full-rim', 'half-rim', 'rimless'];
const FRAME_MATERIALS = ['acetate', 'metal', 'tr90', 'titanium', 'plastic', 'mixed'];
const FRAME_SIZES = ['narrow', 'medium', 'wide', 'extra-wide'];
const LENS_TYPES = ['single-vision', 'bifocal', 'progressive', 'zero-power', 'blue-light', 'polarized', 'photochromic', 'sunglasses'];
const MAX_UPLOADED_IMAGES = 5;
const MAX_IMAGE_EDGE = 1200;
const MAX_IMAGE_DATA_URL_LENGTH = 750000;

const asLines = (items = []) => items.join('\n');
const asCommaList = (items = []) => items.join(', ');
const humanize = (value) => value.replaceAll('-', ' ');

const createEmptyVariant = () => ({
  color: '',
  primaryColor: '',
  primaryColorHex: '#4B5563',
  secondaryColor: '',
  secondaryColorHex: '#C4C7CC',
  stock: 0,
  sku: '',
  images: [],
});

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
  const [validationErrors, setValidationErrors] = useState({});
  const [mainImageUrls, setMainImageUrls] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [preparingImages, setPreparingImages] = useState(false);
  const [variants, setVariants] = useState([]);
  const mainImageInputRef = useRef(null);
  const mainImageUploadModeRef = useRef('add');
  const variantImageInputRefs = useRef({});
  const variantImageUploadModesRef = useRef({});

  const getFieldError = (field) => validationErrors[field];

  useEffect(() => {
    setMainImageUrls(asLines(product?.images));
    setUploadedImages([]);
    setPreparingImages(false);
    setVariants(product?.variants?.map((variant) => ({ ...createEmptyVariant(), ...variant, images: variant.images || [] })) || []);
    // Reset only when opening a different product; edits must not reset the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  const savedMainImages = String(mainImageUrls || '')
    .split('\n')
    .map(normalizeImageSource)
    .filter(Boolean);
  const mainImages = [...savedMainImages, ...uploadedImages];

  const chooseMainImages = (mode) => {
    mainImageUploadModeRef.current = mode;
    mainImageInputRef.current?.click();
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const replacing = mainImageUploadModeRef.current === 'replace';
    const availableSlots = replacing ? MAX_UPLOADED_IMAGES : MAX_UPLOADED_IMAGES - mainImages.length;
    if (files.length > availableSlots) {
      toast.error(`Select no more than ${Math.max(0, availableSlots)} image(s).`);
      return;
    }

    setPreparingImages(true);
    try {
      const preparedImages = await Promise.all(files.map(createCompressedImageUrl));
      if (replacing) {
        setMainImageUrls('');
        setUploadedImages(preparedImages);
      } else {
        setUploadedImages((current) => [...current, ...preparedImages]);
      }
      toast.success(
        `${preparedImages.length} image${preparedImages.length === 1 ? '' : 's'} ${replacing ? 'will replace the gallery' : 'added'} when you save.`
      );
    } catch (error) {
      toast.error(error.message || 'Unable to prepare these images.');
    } finally {
      setPreparingImages(false);
    }
  };

  const removeMainImage = (index) => {
    if (index < savedMainImages.length) {
      setMainImageUrls(asLines(savedMainImages.filter((_, imageIndex) => imageIndex !== index)));
      return;
    }
    const uploadIndex = index - savedMainImages.length;
    setUploadedImages((current) => current.filter((_, imageIndex) => imageIndex !== uploadIndex));
  };

  const updateVariant = (index, field, value) => {
    setVariants((current) => current.map((variant, itemIndex) => (
      itemIndex === index ? { ...variant, [field]: value } : variant
    )));
  };

  const uploadVariantImages = async (index, event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const replacing = variantImageUploadModesRef.current[index] === 'replace';
    const imageCount = replacing ? 0 : variants[index]?.images?.length || 0;
    if (imageCount + files.length > MAX_UPLOADED_IMAGES) {
      toast.error(`Each colour can have up to ${MAX_UPLOADED_IMAGES} images.`);
      return;
    }

    setPreparingImages(true);
    try {
      const preparedImages = await Promise.all(files.map(createCompressedImageUrl));
      setVariants((current) => current.map((variant, itemIndex) => (
        itemIndex === index
          ? { ...variant, images: replacing ? preparedImages : [...(variant.images || []), ...preparedImages] }
          : variant
      )));
      toast.success(
        `${preparedImages.length} colour image${preparedImages.length === 1 ? '' : 's'} ${replacing ? 'will replace the colour gallery' : 'added'} when you save.`
      );
    } catch (error) {
      toast.error(error.message || 'Unable to prepare these images.');
    } finally {
      setPreparingImages(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setValidationErrors({});
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form);

    ['price', 'mrp', 'stock', 'lowStockThreshold', 'rating', 'numReviews', 'soldCount', 'frameWidth', 'lensWidth', 'bridgeSize', 'templeSize', 'warrantyMonths', 'returnDays'].forEach((key) => {
      if (body[key] === '') delete body[key];
      else body[key] = Number(body[key]);
    });

    body.images = mainImages;
    if (!body.images.length) {
      setValidationErrors({ images: 'Add at least one image URL or upload an image file.' });
      toast.error('Add at least one image URL or upload an image file.');
      return;
    }
    body.highlights = String(body.highlights || '').split('\n').map((value) => value.trim()).filter(Boolean);
    ['tags', 'collections', 'suitableFaceShapes'].forEach((key) => {
      body[key] = String(body[key] || '').split(',').map((value) => value.trim()).filter(Boolean);
    });

    const productVariants = variants.map((variant) => ({
      color: String(variant.color || [variant.primaryColor, variant.secondaryColor].filter(Boolean).join(' / ')).trim(),
      colorHex: variant.primaryColorHex || undefined,
      primaryColor: String(variant.primaryColor || '').trim() || undefined,
      primaryColorHex: variant.primaryColorHex || undefined,
      secondaryColor: String(variant.secondaryColor || '').trim() || undefined,
      secondaryColorHex: variant.secondaryColorHex || undefined,
      stock: Number(variant.stock || 0),
      sku: String(variant.sku || '').trim() || undefined,
      images: (variant.images || []).map(normalizeImageSource).filter(Boolean),
    }));
    if (productVariants.some((variant) => !variant.color)) {
      setValidationErrors({ variants: 'Give every colour a label, or enter its primary colour name.' });
      toast.error('Give every colour a label, or enter its primary colour name.');
      return;
    }
    body.variants = productVariants;

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
    <Modal open={Boolean(product)} onClose={onClose} title={`${editing ? 'Edit' : 'Add'} product`} size="xl">
      <form onSubmit={submit} className="space-y-7">
        {Object.keys(validationErrors).length > 0 && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error" role="alert">
            Please correct the highlighted field{Object.keys(validationErrors).length === 1 ? '' : 's'} and save again.
          </div>
        )}
        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Core details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="name" label="Product name" defaultValue={product?.name} minLength="2" error={getFieldError('name')} required />
            <Input name="sku" label="SKU" defaultValue={product?.sku} error={getFieldError('sku')} required />
            <Select name="category" label="Category" defaultValue={product?.category?._id || product?.category || ''} placeholder="Select a category" options={categories.map((item) => ({ value: item._id, label: item.name }))} error={getFieldError('category')} required />
            <Select name="brand" label="Brand" defaultValue={product?.brand?._id || product?.brand || ''} placeholder="Select a brand" options={brands.map((item) => ({ value: item._id, label: item.name }))} error={getFieldError('brand')} required />
            <Input name="price" label="Selling price (₹)" type="number" min="0" step="0.01" defaultValue={product?.price} error={getFieldError('price')} required />
            <Input name="mrp" label="MRP (₹)" type="number" min="0" step="0.01" defaultValue={product?.mrp} error={getFieldError('mrp')} required />
            <Input name="stock" label="Total stock" type="number" min="0" defaultValue={product?.stock ?? 0} />
            <Input name="lowStockThreshold" label="Low-stock alert at" type="number" min="0" defaultValue={product?.lowStockThreshold ?? 5} />
            <div className="md:col-span-2"><Textarea name="description" label="Description" defaultValue={product?.description} minLength="10" error={getFieldError('description')} required /></div>
            <div className="md:col-span-2"><Textarea name="highlights" label="Highlights (one per line)" defaultValue={asLines(product?.highlights)} helper="Shown as product benefits on the detail page." /></div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Gallery and colour variants</h3>
          <div className="space-y-4">
            <Textarea
              name="images"
              label="Main image URLs (one per line)"
              value={mainImageUrls}
              onChange={(event) => setMainImageUrls(event.target.value)}
              helper="Paste direct image URLs here. You can also add photos or replace the complete gallery below."
              error={getFieldError('images')}
            />
            <div>
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy-200 bg-surface-subtle px-5 py-6 text-center">
                <span className="text-sm font-semibold text-navy-700">{preparingImages ? 'Preparing image files...' : 'Upload product photos'}</span>
                <span className="mt-1 text-xs text-navy-400">JPEG, PNG or WebP — {mainImages.length}/{MAX_UPLOADED_IMAGES} gallery images</span>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={preparingImages || mainImages.length >= MAX_UPLOADED_IMAGES} onClick={() => chooseMainImages('add')}>Add photos</Button>
                  {editing && <Button type="button" variant="secondary" size="sm" disabled={preparingImages} onClick={() => chooseMainImages('replace')}>Replace gallery</Button>}
                </div>
                <input ref={mainImageInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={uploadImages} />
              </div>
              {mainImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {mainImages.map((image, index) => (
                    <div key={`${image.slice(0, 48)}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-navy-100 bg-surface-subtle">
                      <img src={getOptimizedImageUrl(image, 240)} alt={`Product gallery ${index + 1}`} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeMainImage(index)} className="absolute right-1 top-1 rounded-full bg-navy-900/80 px-2 py-1 text-xs font-bold text-white" aria-label={`Remove product image ${index + 1}`}>×</button>
                      {index === 0 && <span className="absolute bottom-1 left-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">MAIN</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-navy-700">Colour variants</p>
                  <p className="mt-1 text-xs text-navy-400">Give each colour its own photos. Selecting it on the product page will switch the gallery.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setVariants((current) => [...current, createEmptyVariant()])}>Add colour</Button>
              </div>
              {getFieldError('variants') && <p className="text-sm text-error">{getFieldError('variants')}</p>}
              {variants.map((variant, index) => (
                <div key={variant._id || index} className="rounded-2xl border border-navy-100 bg-surface-subtle p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="font-semibold text-navy-800">Colour {index + 1}</p>
                    <Button type="button" variant="ghost" size="sm" className="text-error hover:bg-error/10 hover:text-error" onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Colour label" value={variant.color} onChange={(event) => updateVariant(index, 'color', event.target.value)} placeholder="e.g. Gunmetal / Silver" />
                    <Input label="Colour SKU" value={variant.sku} onChange={(event) => updateVariant(index, 'sku', event.target.value)} placeholder="e.g. OC-GUN-SIL" />
                    <Input label="Primary colour name (top)" value={variant.primaryColor} onChange={(event) => updateVariant(index, 'primaryColor', event.target.value)} placeholder="e.g. Gunmetal" />
                    <Input label="Secondary colour name (bottom)" value={variant.secondaryColor} onChange={(event) => updateVariant(index, 'secondaryColor', event.target.value)} placeholder="e.g. Silver" />
                    <label className="text-sm font-medium text-navy-700">Primary colour (top)
                      <input type="color" value={variant.primaryColorHex || '#4B5563'} onChange={(event) => updateVariant(index, 'primaryColorHex', event.target.value)} className="mt-1.5 block h-11 w-full cursor-pointer rounded-xl border border-navy-200 bg-surface p-1" aria-label={`Primary colour for colour ${index + 1}`} />
                    </label>
                    <label className="text-sm font-medium text-navy-700">Secondary colour (bottom)
                      <input type="color" value={variant.secondaryColorHex || '#C4C7CC'} onChange={(event) => updateVariant(index, 'secondaryColorHex', event.target.value)} className="mt-1.5 block h-11 w-full cursor-pointer rounded-xl border border-navy-200 bg-surface p-1" aria-label={`Secondary colour for colour ${index + 1}`} />
                    </label>
                    <Input label="Stock for this colour" type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, 'stock', event.target.value)} />
                    <div className="flex items-end gap-3 pb-0.5">
                      <span className="h-11 w-11 rounded-full border-2 border-white shadow-soft" style={{ background: `linear-gradient(to bottom, ${variant.primaryColorHex || '#4B5563'} 0 50%, ${variant.secondaryColorHex || '#C4C7CC'} 50% 100%)` }} aria-hidden="true" />
                      <span className="text-xs text-navy-400">Primary is above secondary on the product-page swatch.</span>
                    </div>
                  </div>
                  <Textarea
                    label={`Images for colour ${index + 1} (one URL per line)`}
                    value={(variant.images || []).filter((image) => !image.startsWith('data:image/')).join('\n')}
                    onChange={(event) => {
                      const uploaded = (variant.images || []).filter((image) => image.startsWith('data:image/'));
                      updateVariant(index, 'images', [...event.target.value.split('\n').map(normalizeImageSource).filter(Boolean), ...uploaded]);
                    }}
                    helper="These photos are shown when this colour is selected. You can also upload images below."
                    rows={3}
                    containerClassName="mt-4"
                  />
                  <div className="mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy-200 bg-surface px-5 py-5 text-center">
                    <span className="text-sm font-semibold text-navy-700">{preparingImages ? 'Preparing image files...' : `Upload photos for colour ${index + 1}`}</span>
                    <span className="mt-1 text-xs text-navy-400">JPEG, PNG or WebP — up to {Math.max(0, MAX_UPLOADED_IMAGES - (variant.images?.length || 0))} more</span>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={preparingImages || (variant.images?.length || 0) >= MAX_UPLOADED_IMAGES}
                        onClick={() => {
                          variantImageUploadModesRef.current[index] = 'add';
                          variantImageInputRefs.current[index]?.click();
                        }}
                      >
                        Add photos
                      </Button>
                      {editing && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={preparingImages}
                          onClick={() => {
                            variantImageUploadModesRef.current[index] = 'replace';
                            variantImageInputRefs.current[index]?.click();
                          }}
                        >
                          Replace colour photos
                        </Button>
                      )}
                    </div>
                    <input ref={(node) => { variantImageInputRefs.current[index] = node; }} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => uploadVariantImages(index, event)} />
                  </div>
                  {variant.images?.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {variant.images.map((image, imageIndex) => (
                        <div key={`${image.slice(0, 48)}-${imageIndex}`} className="relative aspect-square overflow-hidden rounded-xl border border-navy-100 bg-surface">
                          <img src={getOptimizedImageUrl(image, 240)} alt={`${variant.color || `Colour ${index + 1}`} — ${imageIndex + 1}`} className="h-full w-full object-cover" />
                          <button type="button" onClick={() => updateVariant(index, 'images', variant.images.filter((_, itemIndex) => itemIndex !== imageIndex))} className="absolute right-1 top-1 rounded-full bg-navy-900/80 px-2 py-1 text-xs font-bold text-white" aria-label={`Remove colour ${index + 1} image ${imageIndex + 1}`}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Input name="frameColor" label="Frame colour description" defaultValue={product?.frameColor} helper="Used in product details and search." />
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Frame specifications</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Select name="gender" label="Designed for" defaultValue={product?.gender || 'unisex'} options={GENDERS.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('gender')} />
            <Select name="frameShape" label="Frame shape" defaultValue={product?.frameShape || ''} placeholder="Select shape" options={FRAME_SHAPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameShape')} />
            <Select name="frameType" label="Frame type" defaultValue={product?.frameType || ''} placeholder="Select type" options={FRAME_TYPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameType')} />
            <Select name="rimType" label="Rim type" defaultValue={product?.rimType || ''} placeholder="Select rim type" options={FRAME_TYPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('rimType')} />
            <Select name="frameMaterial" label="Frame material" defaultValue={product?.frameMaterial || ''} placeholder="Select material" options={FRAME_MATERIALS.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameMaterial')} />
            <Select name="frameSize" label="Frame fit" defaultValue={product?.frameSize || 'medium'} options={FRAME_SIZES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameSize')} />
            <Input name="frameWidth" label="Frame width (mm)" type="number" min="0" defaultValue={product?.frameWidth} />
            <Input name="lensWidth" label="Lens width (mm)" type="number" min="0" defaultValue={product?.lensWidth} />
            <Input name="bridgeSize" label="Bridge size (mm)" type="number" min="0" defaultValue={product?.bridgeSize} />
            <Input name="templeSize" label="Temple size (mm)" type="number" min="0" defaultValue={product?.templeSize} />
            <div className="md:col-span-2"><Input name="suitableFaceShapes" label="Suitable face shapes" defaultValue={asCommaList(product?.suitableFaceShapes)} helper="Comma-separated: oval, round, square, heart, oblong, diamond." error={getFieldError('suitableFaceShapes') || getFieldError('suitableFaceShapes.0')} /></div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Lenses, protection and policies</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Select name="lensType" label="Lens type" defaultValue={product?.lensType || ''} placeholder="Select lens type" options={LENS_TYPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('lensType')} />
            <Input name="lensThickness" label="Lens thickness" defaultValue={product?.lensThickness} placeholder="e.g. 1.56 index" />
            <div className="md:col-span-2"><Textarea name="lensOptions" label="Product-type options (JSON)" defaultValue={product?.lensOptions?.length ? JSON.stringify(product.lensOptions, null, 2) : ''} helper={'Optional. Example: [{"type":"zero-power","label":"Zero Power","subtitle":"Screen glasses","price":0}]'} error={getFieldError('lensOptions')} /></div>
            <Input name="warrantyMonths" label="Warranty (months)" type="number" min="0" defaultValue={product?.warrantyMonths ?? 12} />
            <Input name="returnDays" label="Return window (days)" type="number" min="0" defaultValue={product?.returnDays ?? 14} />
            <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
              <Input name="shippingMessage" label="Shipping message" defaultValue={product?.shippingMessage} placeholder="Free shipping" helper="Shown in the delivery assurance card." />
              <Input name="returnMessage" label="Return message" defaultValue={product?.returnMessage} placeholder={`${product?.returnDays ?? 14}-day returns`} helper="Leave blank to use the return window." />
              <Input name="warrantyMessage" label="Warranty message" defaultValue={product?.warrantyMessage} placeholder={`${product?.warrantyMonths ?? 12}mo warranty`} helper="Leave blank to use the warranty period." />
            </div>
            <div className="md:col-span-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Toggle name="powered" label="Prescription supported" defaultChecked={product?.powered !== false} />
              <Toggle name="blueLightFilter" label="Blue-light filter" defaultChecked={product?.blueLightFilter} />
              <Toggle name="polarized" label="Polarized lenses" defaultChecked={product?.polarized} />
              <Toggle name="uvProtection" label="UV protection" defaultChecked={product?.uvProtection} />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3">
            <h3 className="font-semibold text-navy-900">Ratings &amp; social proof</h3>
            <p className="mt-1 text-sm text-navy-500">
              The product page automatically fills its star icons from the rating point entered here.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              name="rating"
              label="Star rating point (0–5)"
              type="number"
              min="0"
              max="5"
              step="0.1"
              defaultValue={product?.rating ?? 0}
              helper="Example: 4.6 displays a 4.6 rating and the matching stars."
              error={getFieldError('rating')}
            />
            <Input
              name="numReviews"
              label="Number of reviews"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.numReviews ?? 0}
              helper="Shown next to the rating as the customer review count."
              error={getFieldError('numReviews')}
            />
            <Input
              name="soldCount"
              label="Number of units sold"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.soldCount ?? 0}
              helper="Shown as the product's sold count; existing values are preserved when editing."
              error={getFieldError('soldCount')}
            />
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
