/** Dedicated package catalogue editor; shares the frame-lens settings source. */
import { useState } from 'react';
import { Button, Checkbox, Input, Modal, Select, Textarea } from '@/components/ui';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/admin/adminApi';
import { normalizeFrameLenses } from '@/lib/frameLenses';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/lib/format';

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
  const toast = useToast();
  const configuration = normalizeFrameLenses(data?.frameLensConfiguration);
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const open = (pack) => {
    setEditingId(pack?.id || null);
    setDraft(structuredClone({ ...emptyPackage, ...pack }));
  };
  const persist = async (packages) => {
    try {
      await updateSettings({ frameLensConfiguration: { ...configuration, packages } }).unwrap();
      toast.success('Lens packages saved');
      return true;
    } catch (error) {
      toast.error(error.data?.message || error.message || 'Unable to save lens packages');
      return false;
    }
  };
  const save = async (event) => {
    event.preventDefault();
    const clean = { ...draft, id: draft.id.trim(), name: draft.name.trim() };
    if (configuration.packages.some((pack) => pack.id === clean.id && pack.id !== editingId)) {
      toast.error('Choose a unique package ID.');
      return;
    }
    if (clean.mrp && clean.mrp < clean.price) {
      toast.error('MRP cannot be less than the selling price.');
      return;
    }
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
  const field = (key, label, type = 'text') => (
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
        key === 'id' ? 'Stable ID used by frames; cannot be changed after creation.' : undefined
      }
      onChange={(event) =>
        update(key, type === 'number' ? Number(event.target.value) : event.target.value)
      }
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
          if (!saving) setDraft(null);
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
                {field('imageUrl', 'Lens image URL')}
                {field('videoUrl', 'Video URL (optional)')}
                {field('order', 'Display order', 'number')}
              </div>
              <Textarea
                label="Description / view details"
                value={draft.description}
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
              <Button type="submit" loading={saving}>
                Save package
              </Button>
            </fieldset>
          </form>
        )}
      </Modal>
    </div>
  );
}
