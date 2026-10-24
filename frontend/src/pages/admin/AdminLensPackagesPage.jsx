/** Dedicated package catalogue editor; shares the frame-lens settings source. */
import { useState } from 'react';
import { Button, Checkbox, Input, Modal, Select, Textarea } from '@/components/ui';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/admin/adminApi';
import { normalizeFrameLenses } from '@/lib/frameLenses';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/lib/format';
import { LensMediaInput } from '@/components/admin/LensMediaInput';

const emptyPackage = {
  id: '',
  name: '',
  description: '',
  price: 0,
  mrp: 0,
  ribbonText: '',
  ribbonColor: 'none',
  warranty: '',
  couponText: '',
  features: [],
  featureIcons: [],
  categories: [],
  powerTypes: [],
  imageUrl: '',
  videoUrl: '',
  detailImageUrl: '',
  comparisonImageUrl: '',
  detailFeatures: [],
  isActive: true,
  isRecommended: false,
  order: 0,
};
const featureIcons = ['⚡', '🛡️', '👨‍💻', '😇', '☀️'];

export default function AdminLensPackagesPage() {
  const { data, isLoading, isError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();
  const [draft, setDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [idTouched, setIdTouched] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [uploads, setUploads] = useState(0);
  const mediaBusy = (busy) => setUploads((count) => Math.max(0, count + (busy ? 1 : -1)));
  const toast = useToast();
  const configuration = normalizeFrameLenses(data?.frameLensConfiguration);
  const update = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };
  const open = (pack) => {
    setEditingId(pack?.id || null);
    setIdTouched(Boolean(pack?.id));
    setFormErrors({});
    setDraft(structuredClone({ ...emptyPackage, ...pack }));
  };
  const persist = async (packages) => {
    try {
      await updateSettings({ frameLensConfiguration: { ...configuration, packages } }).unwrap();
      toast.success('Lens packages saved');
      setFormErrors({});
      return true;
    } catch (error) {
      const fieldErrors = error?.data?.errors || error?.errors;
      let message = error?.data?.message || error?.message || 'Unable to save lens packages';
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        const newErrors = {};
        fieldErrors.forEach((err) => {
          const fieldPath = err.field
            ? err.field.replace(/^frameLensConfiguration\./, '').split('.').slice(-1)[0]
            : '';
          if (fieldPath) newErrors[fieldPath] = err.message;
        });
        setFormErrors(newErrors);
        message = fieldErrors
          .map((err) => {
            const fieldPath = err.field
              ? err.field.replace(/^frameLensConfiguration\./, '').split('.').slice(-1)[0]
              : '';
            return fieldPath ? `${fieldPath}: ${err.message}` : err.message;
          })
          .join('; ');
      }
      toast.error(message);
      return false;
    }
  };
  const save = async (event) => {
    event.preventDefault();
    if (uploads) return;

    const errors = {};
    const cleanId = (draft.id || '').trim().toLowerCase();
    const cleanName = (draft.name || '').trim();

    if (!cleanId) {
      errors.id = 'Package ID is required.';
    } else if (!/^[a-z0-9-]+$/.test(cleanId)) {
      errors.id =
        'Package ID can only contain lowercase letters, numbers, and hyphens (e.g. "blu-thin").';
    } else if (
      configuration.packages.some((pack) => pack.id === cleanId && pack.id !== editingId)
    ) {
      errors.id = 'Choose a unique package ID.';
    }

    if (!cleanName) {
      errors.name = 'Package name is required.';
    }

    const cleanPrice = Math.max(0, Number(draft.price) || 0);
    const cleanMrp = Math.max(0, Number(draft.mrp) || 0);
    if (cleanMrp > 0 && cleanMrp < cleanPrice) {
      errors.mrp = 'MRP cannot be less than the selling price.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(Object.values(errors)[0]);
      return;
    }

    // Filter out completely blank feature bullets
    const cleanedFeatures = [];
    const cleanedIcons = [];
    (draft.features || []).forEach((feat, idx) => {
      const trimmed = (feat || '').trim();
      if (trimmed) {
        cleanedFeatures.push(trimmed);
        cleanedIcons.push(draft.featureIcons?.[idx] || '⚡');
      }
    });

    // Filter out detail features missing a title
    const cleanedDetailFeatures = (draft.detailFeatures || [])
      .map((df) => ({
        title: (df.title || '').trim(),
        description: (df.description || '').trim(),
        imageUrl: (df.imageUrl || '').trim(),
      }))
      .filter((df) => df.title.length > 0);

    const clean = {
      ...draft,
      id: cleanId,
      name: cleanName,
      price: cleanPrice,
      mrp: cleanMrp,
      order: Math.floor(Number(draft.order) || 0),
      features: cleanedFeatures,
      featureIcons: cleanedIcons,
      detailFeatures: cleanedDetailFeatures,
      description: (draft.description || '').trim(),
      ribbonText: (draft.ribbonText || '').trim(),
      warranty: (draft.warranty || '').trim(),
      couponText: (draft.couponText || '').trim(),
      imageUrl: (draft.imageUrl || '').trim(),
      videoUrl: (draft.videoUrl || '').trim(),
      detailImageUrl: (draft.detailImageUrl || '').trim(),
      comparisonImageUrl: (draft.comparisonImageUrl || '').trim(),
    };

    const packages = editingId
      ? configuration.packages.map((pack) => (pack.id === editingId ? clean : pack))
      : [...configuration.packages, clean];
    if (await persist(packages)) setDraft(null);
  };
  const remove = async (pack) => {
    if (
      !window.confirm(
        'Delete ' + pack.name + '? Frames restricted to this package will no longer offer it.'
      )
    )
      return;
    await persist(configuration.packages.filter((item) => item.id !== pack.id));
  };
  const field = (key, label, type = 'text', helperText) => (
    <Input
      label={label}
      type={type}
      value={draft[key] ?? ''}
      min={type === 'number' ? 0 : undefined}
      step={type === 'number' ? 'any' : undefined}
      required={key === 'id' || key === 'name'}
      pattern={key === 'id' ? '[a-z0-9-]+' : undefined}
      disabled={key === 'id' && Boolean(editingId)}
      helper={
        helperText ||
        (key === 'id'
          ? 'Lowercase letters, numbers, and hyphens only (e.g. "blu-thin").'
          : undefined)
      }
      error={formErrors[key]}
      onChange={(event) => {
        let val = event.target.value;
        if (type === 'number') {
          val = val === '' ? 0 : Number(val);
          if (Number.isNaN(val)) val = 0;
          update(key, val);
        } else if (key === 'id') {
          setIdTouched(true);
          update(key, val.toLowerCase().replace(/\s+/g, '-'));
        } else if (key === 'name') {
          if (!idTouched && !editingId) {
            const suggestedId = val
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .slice(0, 60);
            setDraft((current) => ({ ...current, name: val, id: suggestedId }));
          } else {
            update(key, val);
          }
        } else {
          update(key, val);
        }
      }}
    />
  );
  const choices = (key, label, options) => (
    <fieldset className="rounded-xl border border-navy-200 p-3">
      <legend className="text-sm font-semibold">{label}</legend>
      <p className="mb-2 text-xs text-navy-500">None selected means all.</p>
      <div className="flex flex-wrap gap-3">
        {options.map((item) => (
          <Checkbox
            key={item.id}
            label={item.label}
            checked={draft[key].includes(item.id)}
            onChange={(event) =>
              update(
                key,
                event.target.checked
                  ? [...draft[key], item.id]
                  : draft[key].filter((id) => id !== item.id)
              )
            }
          />
        ))}
      </div>
    </fieldset>
  );
  if (isLoading) return <p>Loading lens packages…</p>;
  if (isError) return <p role="alert">Unable to load lens packages. Reload before editing.</p>;
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h3 text-navy-900">Lens Packages</h1>
          <p className="mt-1 text-sm text-navy-500">
            Create packages here, then enable them for individual frames in Products. Prices are
            lens-only additions; customer cards show frame + lens totals.
          </p>
        </div>
        <Button onClick={() => open()} disabled={saving}>
          Add Lens Package
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-surface shadow-card">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr>
              {[
                'Name',
                'Ribbon',
                'Price',
                'MRP',
                'Warranty',
                'Categories',
                'Status',
                'Actions',
              ].map((label) => (
                <th key={label} className="border-b p-3">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configuration.packages.map((pack) => (
              <tr key={pack.id} className="border-b border-navy-100">
                <td className="p-3 font-semibold">{pack.name}</td>
                <td className="p-3">{pack.ribbonText || '—'}</td>
                <td className="p-3">{formatPrice(pack.price)}</td>
                <td className="p-3">{formatPrice(pack.mrp || 0)}</td>
                <td className="p-3">{pack.warranty || '—'}</td>
                <td className="p-3">
                  {pack.categories?.length
                    ? configuration.packageCategories
                        .filter((cat) => pack.categories.includes(cat.id))
                        .map((cat) => cat.label)
                        .join(', ')
                    : 'All'}
                </td>
                <td className="p-3">{pack.isActive !== false ? 'Active' : 'Inactive'}</td>
                <td className="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={saving}
                    onClick={() => open(pack)}
                    aria-label={'Edit ' + pack.name}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={saving}
                    onClick={() => remove(pack)}
                    aria-label={'Delete ' + pack.name}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!configuration.packages.length && (
          <p className="p-6">No packages yet. Add your first lens package.</p>
        )}
      </div>
      <Modal
        open={Boolean(draft)}
        onClose={() => {
          if (!saving && !uploads) setDraft(null);
        }}
        title={editingId ? 'Edit Lens Package' : 'Add Lens Package'}
        size="lg"
      >
        {draft && (
          <form onSubmit={save} className="space-y-4">
            <fieldset disabled={saving} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {field('id', 'Package ID')}
                {field('name', 'Package name')}
                {field('ribbonText', 'Ribbon text')}
                <Select
                  label="Ribbon color"
                  value={draft.ribbonColor}
                  options={['blue', 'red', 'green', 'none']}
                  onChange={(event) => update('ribbonColor', event.target.value)}
                />
                {field('warranty', 'Warranty')}
                {field('price', 'Selling price (lens extra)', 'number')}
                {field('mrp', 'Original MRP (lens extra)', 'number')}
                {field('couponText', 'Coupon tag text')}
                {field('order', 'Display order', 'number')}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <LensMediaInput
                  label="Lens image"
                  value={draft.imageUrl}
                  onChange={(value) => update('imageUrl', value)}
                  onBusyChange={mediaBusy}
                />
                <LensMediaInput
                  label="Video"
                  kind="video"
                  value={draft.videoUrl}
                  onChange={(value) => update('videoUrl', value)}
                  onBusyChange={mediaBusy}
                />
                <LensMediaInput
                  label="Details hero image"
                  value={draft.detailImageUrl}
                  onChange={(value) => update('detailImageUrl', value)}
                  onBusyChange={mediaBusy}
                />
                <LensMediaInput
                  label="Comparison image (optional)"
                  value={draft.comparisonImageUrl}
                  onChange={(value) => update('comparisonImageUrl', value)}
                  onBusyChange={mediaBusy}
                />
              </div>
              <p className="text-xs text-navy-500">
                The details panel uses the hero image (or lens image). Add a second comparison image
                to enable the before/after slider. Video playback is available when a video is
                uploaded. Uploaded media is public; do not upload customer prescriptions here.
              </p>
              <Textarea
                label="Description / view details"
                value={draft.description}
                maxLength={2000}
                error={formErrors.description}
                helper={
                  draft.description?.length > 1500
                    ? `${draft.description.length}/2000 characters`
                    : undefined
                }
                onChange={(event) => update('description', event.target.value)}
              />
              <fieldset className="space-y-2">
                <legend className="font-semibold">Feature bullets</legend>
                {draft.features.map((feature, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <Select
                      label={'Icon ' + (index + 1)}
                      value={draft.featureIcons[index] || '⚡'}
                      options={featureIcons}
                      onChange={(event) =>
                        update(
                          'featureIcons',
                          draft.features.map((_, i) =>
                            i === index ? event.target.value : draft.featureIcons[i] || '⚡'
                          )
                        )
                      }
                    />
                    <Input
                      label={'Feature ' + (index + 1)}
                      required
                      value={feature}
                      onChange={(event) =>
                        update(
                          'features',
                          draft.features.map((text, i) => (i === index ? event.target.value : text))
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={'Remove feature ' + (index + 1)}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          features: current.features.filter((_, i) => i !== index),
                          featureIcons: current.features
                            .filter((_, i) => i !== index)
                            .map((_, i) => current.featureIcons[i >= index ? i + 1 : i] || '⚡'),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      features: [...current.features, ''],
                      featureIcons: [...current.featureIcons, '⚡'],
                    }))
                  }
                >
                  Add feature
                </Button>
              </fieldset>
              {choices('categories', 'Categories', configuration.packageCategories)}
              <fieldset className="space-y-3">
                <legend className="font-semibold">Illustrated details features</legend>
                {draft.detailFeatures.map((feature, index) => (
                  <div key={index} className="space-y-3 rounded-xl border border-navy-200 p-3">
                    <Input
                      label={'Detail feature ' + (index + 1)}
                      required
                      value={feature.title}
                      onChange={(event) =>
                        update(
                          'detailFeatures',
                          draft.detailFeatures.map((item, i) =>
                            i === index ? { ...item, title: event.target.value } : item
                          )
                        )
                      }
                    />
                    <Textarea
                      label={'Feature description ' + (index + 1)}
                      value={feature.description || ''}
                      onChange={(event) =>
                        update(
                          'detailFeatures',
                          draft.detailFeatures.map((item, i) =>
                            i === index ? { ...item, description: event.target.value } : item
                          )
                        )
                      }
                    />
                    <LensMediaInput
                      label={'Feature image ' + (index + 1)}
                      value={feature.imageUrl}
                      onBusyChange={mediaBusy}
                      onChange={(value) =>
                        setDraft((current) => ({
                          ...current,
                          detailFeatures: current.detailFeatures.map((item, i) =>
                            i === index ? { ...item, imageUrl: value } : item
                          ),
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={Boolean(uploads)}
                      onClick={() =>
                        update(
                          'detailFeatures',
                          draft.detailFeatures.filter((_, i) => i !== index)
                        )
                      }
                    >
                      Remove detail feature
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  disabled={draft.detailFeatures.length >= 12 || Boolean(uploads)}
                  onClick={() =>
                    update('detailFeatures', [
                      ...draft.detailFeatures,
                      { title: '', description: '', imageUrl: '' },
                    ])
                  }
                >
                  Add illustrated feature
                </Button>
              </fieldset>
              {choices(
                'powerTypes',
                'Power types',
                configuration.powerTypes.filter((mode) => mode.id !== 'frame-only')
              )}
              <Checkbox
                label="Active"
                checked={draft.isActive}
                onChange={(event) => update('isActive', event.target.checked)}
              />
              <Checkbox
                label="Recommended"
                checked={draft.isRecommended}
                onChange={(event) => update('isRecommended', event.target.checked)}
              />
              <Button type="submit" loading={saving} disabled={Boolean(uploads)}>
                Save package
              </Button>
            </fieldset>
          </form>
        )}
      </Modal>
    </div>
  );
}
