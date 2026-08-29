import { useEffect, useState } from 'react';
import { FiMinus, FiPlus, FiSave } from 'react-icons/fi';
import { Button, Card, CardBody, Checkbox, Input, Skeleton, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/admin/adminApi';

const key = () => Math.random().toString(36).slice(2);
const defaults = {
  powerTypes: [
    { id: 'single-vision', label: 'Single Vision', subtitle: 'Distance or reading power', price: 0, requiresPrescription: true, isActive: true },
    { id: 'zero-power', label: 'Zero Power', subtitle: 'Screen glasses', price: 0, requiresPrescription: false, isActive: true },
  ],
  packages: [{ id: 'anti-glare', name: 'Anti-Glare Premium', description: 'Clear everyday lenses with anti-glare protection.', price: 0, powerTypes: ['single-vision', 'zero-power'], isActive: true }],
  prescriptionFields: [{ key: 'sph', label: 'SPH', min: -20, max: 20, step: 0.25, scope: 'per-eye', required: true, powerTypes: ['single-vision'], isActive: true }],
};

const cloneConfiguration = (value) => ({
  powerTypes: (value?.powerTypes?.length ? value.powerTypes : defaults.powerTypes).map((item) => ({ ...item, draftKey: key() })),
  packages: (value?.packages?.length ? value.packages : defaults.packages).map((item) => ({ ...item, powerTypes: item.powerTypes || [], draftKey: key() })),
  prescriptionFields: (value?.prescriptionFields?.length ? value.prescriptionFields : defaults.prescriptionFields).map((item) => ({ ...item, powerTypes: item.powerTypes || [], draftKey: key() })),
});

function RemoveButton({ onClick, label }) {
  return <Button type="button" size="sm" variant="ghost" className="text-error hover:bg-error/10 hover:text-error" onClick={onClick} leftIcon={<FiMinus />}>{label}</Button>;
}

function Applicability({ options, selected, onChange, label }) {
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  return (
    <fieldset className="rounded-xl border border-navy-100 bg-navy-50/40 p-3">
      <legend className="px-1 text-xs font-semibold text-navy-700">Show for — {label}</legend>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
        {options.map((option) => <Checkbox key={option.id} checked={selected.includes(option.id)} onChange={() => toggle(option.id)} label={option.label} />)}
      </div>
    </fieldset>
  );
}

export default function AdminFrameLensesPage() {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const toast = useToast();
  const [configuration, setConfiguration] = useState(() => cloneConfiguration());

  useEffect(() => {
    if (data?.frameLensConfiguration) setConfiguration(cloneConfiguration(data.frameLensConfiguration));
  }, [data?.frameLensConfiguration]);

  const update = (group, index, field, value) => setConfiguration((current) => ({
    ...current,
    [group]: current[group].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
  }));
  const remove = (group, index) => setConfiguration((current) => ({ ...current, [group]: current[group].filter((_, itemIndex) => itemIndex !== index) }));
  const add = (group, item) => setConfiguration((current) => ({ ...current, [group]: [...current[group], { ...item, draftKey: key() }] }));

  const save = async (event) => {
    event.preventDefault();
    const clean = {
      powerTypes: configuration.powerTypes.map(({ draftKey: _draftKey, ...item }) => ({ ...item, id: item.id.trim(), label: item.label.trim(), subtitle: item.subtitle.trim(), price: Number(item.price || 0) })),
      packages: configuration.packages.map(({ draftKey: _draftKey, ...item }) => ({ ...item, id: item.id.trim(), name: item.name.trim(), description: item.description.trim(), price: Number(item.price || 0) })),
      prescriptionFields: configuration.prescriptionFields.map(({ draftKey: _draftKey, ...item }) => ({ ...item, key: item.key.trim(), label: item.label.trim(), min: Number(item.min), max: Number(item.max), step: Number(item.step) })),
    };
    if (clean.powerTypes.some((item) => !item.id || !item.label) || new Set(clean.powerTypes.map((item) => item.id)).size !== clean.powerTypes.length) {
      toast.error('Every power type needs a unique ID and a name.');
      return;
    }
    if (clean.packages.some((item) => !item.id || !item.name) || clean.prescriptionFields.some((item) => !item.key || !item.label || item.min > item.max || item.step <= 0)) {
      toast.error('Complete all lens package and power-field details before saving.');
      return;
    }
    try {
      await updateSettings({ frameLensConfiguration: clean }).unwrap();
      toast.success('Frame lens configuration saved');
    } catch (error) {
      toast.error(error.message || 'Unable to save frame lens configuration.');
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-80" /><Skeleton className="h-80" /></div>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h3 text-navy-900">Lens for frames</h1>
          <p className="mt-1 max-w-3xl text-sm text-navy-500">Manage the lens choices customers see after selecting lenses for eyeglass frames. Configure the power-type cards, compatible lens packages, and the eye-power fields with their limits.</p>
        </div>
        <Button form="frame-lens-configuration" type="submit" loading={isSaving} leftIcon={<FiSave />}>Save lens configuration</Button>
      </div>

      <form id="frame-lens-configuration" onSubmit={save} className="space-y-6">
        <Card><CardBody className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-navy-900">1. Power types</h2><p className="mt-1 text-sm text-navy-500">These are the cards shown first: Zero Power, Single Vision, Progressive, and any custom choice.</p></div><Button type="button" variant="outline" size="sm" leftIcon={<FiPlus />} onClick={() => add('powerTypes', { id: '', label: '', subtitle: '', price: 0, requiresPrescription: true, isActive: true })}>Add power type</Button></div>
          <div className="space-y-3">{configuration.powerTypes.map((item, index) => <div key={item.draftKey} className="rounded-xl border border-navy-100 p-4"><div className="mb-3 flex justify-between"><p className="font-semibold text-navy-800">Power type {index + 1}</p><RemoveButton label="Remove" onClick={() => remove('powerTypes', index)} /></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Input label="ID" value={item.id} placeholder="single-vision" onChange={(event) => update('powerTypes', index, 'id', event.target.value)} /><Input label="Customer label" value={item.label} placeholder="Single Vision" onChange={(event) => update('powerTypes', index, 'label', event.target.value)} /><Input label="Additional price (₹)" type="number" min="0" value={item.price} onChange={(event) => update('powerTypes', index, 'price', event.target.value)} /><div className="flex flex-wrap items-end gap-3"><Checkbox checked={item.requiresPrescription} onChange={(event) => update('powerTypes', index, 'requiresPrescription', event.target.checked)} label="Requires prescription" /><Checkbox checked={item.isActive !== false} onChange={(event) => update('powerTypes', index, 'isActive', event.target.checked)} label="Active" /></div></div><Textarea className="mt-3" label="Short description" value={item.subtitle} onChange={(event) => update('powerTypes', index, 'subtitle', event.target.value)} /></div>)}</div>
        </CardBody></Card>

        <Card><CardBody className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-navy-900">2. Lens packages</h2><p className="mt-1 text-sm text-navy-500">Add lens packages and choose which power types can use each package.</p></div><Button type="button" variant="outline" size="sm" leftIcon={<FiPlus />} onClick={() => add('packages', { id: '', name: '', description: '', price: 0, powerTypes: [], isActive: true })}>Add lens package</Button></div>
          <div className="space-y-3">{configuration.packages.map((item, index) => <div key={item.draftKey} className="rounded-xl border border-navy-100 p-4"><div className="mb-3 flex justify-between"><p className="font-semibold text-navy-800">Lens package {index + 1}</p><RemoveButton label="Remove" onClick={() => remove('packages', index)} /></div><div className="grid gap-3 md:grid-cols-3"><Input label="Package ID" value={item.id} placeholder="anti-glare" onChange={(event) => update('packages', index, 'id', event.target.value)} /><Input label="Customer name" value={item.name} placeholder="Anti-Glare Premium" onChange={(event) => update('packages', index, 'name', event.target.value)} /><Input label="Additional price (₹)" type="number" min="0" value={item.price} onChange={(event) => update('packages', index, 'price', event.target.value)} /></div><Textarea className="mt-3" label="Description" value={item.description} onChange={(event) => update('packages', index, 'description', event.target.value)} /><div className="mt-3"><Applicability options={configuration.powerTypes} selected={item.powerTypes} onChange={(value) => update('packages', index, 'powerTypes', value)} label={`package ${index + 1}`} /></div><Checkbox className="mt-3" checked={item.isActive !== false} onChange={(event) => update('packages', index, 'isActive', event.target.checked)} label="Active" /></div>)}</div>
        </CardBody></Card>

        <Card><CardBody className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-navy-900">3. Enter eye-power fields and limits</h2><p className="mt-1 text-sm text-navy-500">Choose fields such as SPH, CYL, Axis, and PD. Set each field&apos;s minimum, maximum, increment, required status, and where it appears.</p></div><Button type="button" variant="outline" size="sm" leftIcon={<FiPlus />} onClick={() => add('prescriptionFields', { key: '', label: '', min: -3, max: 3, step: 0.25, scope: 'per-eye', required: false, powerTypes: [], isActive: true })}>Add eye-power field</Button></div>
          <div className="space-y-3">{configuration.prescriptionFields.map((item, index) => <div key={item.draftKey} className="rounded-xl border border-navy-100 p-4"><div className="mb-3 flex justify-between"><p className="font-semibold text-navy-800">Eye-power field {index + 1}</p><RemoveButton label="Remove" onClick={() => remove('prescriptionFields', index)} /></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><Input label="Key" value={item.key} placeholder="sph" onChange={(event) => update('prescriptionFields', index, 'key', event.target.value)} /><Input label="Customer label" value={item.label} placeholder="SPH" onChange={(event) => update('prescriptionFields', index, 'label', event.target.value)} /><Input label="Minimum" type="number" value={item.min} onChange={(event) => update('prescriptionFields', index, 'min', event.target.value)} /><Input label="Maximum" type="number" value={item.max} onChange={(event) => update('prescriptionFields', index, 'max', event.target.value)} /><Input label="Increment" type="number" min="0.01" step="0.01" value={item.step} onChange={(event) => update('prescriptionFields', index, 'step', event.target.value)} /><select aria-label={`Field ${index + 1} scope`} className="h-11 rounded-xl border border-navy-200 bg-surface px-3 text-sm text-navy-800" value={item.scope} onChange={(event) => update('prescriptionFields', index, 'scope', event.target.value)}><option value="per-eye">Right and left eye</option><option value="shared">One shared value</option></select></div><div className="mt-3"><Applicability options={configuration.powerTypes} selected={item.powerTypes} onChange={(value) => update('prescriptionFields', index, 'powerTypes', value)} label={`field ${index + 1}`} /></div><div className="mt-3 flex gap-4"><Checkbox checked={item.required} onChange={(event) => update('prescriptionFields', index, 'required', event.target.checked)} label="Required" /><Checkbox checked={item.isActive !== false} onChange={(event) => update('prescriptionFields', index, 'isActive', event.target.checked)} label="Active" /></div></div>)}</div>
        </CardBody></Card>
      </form>
    </div>
  );
}
