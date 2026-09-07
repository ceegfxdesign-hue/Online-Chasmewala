/** Admin editor for the shared frame-lens storefront configuration. */
import { useEffect, useState } from 'react';
import { Button, Card, CardBody, Checkbox, Input, Select, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/admin/adminApi';
import { normalizeFrameLenses } from '@/lib/frameLenses';

const groups = ['powerTypes', 'packageCategories', 'packages', 'prescriptionFields'];
const clone = (value) => {
  const config = normalizeFrameLenses(value);
  groups.forEach((group) => {
    config[group] = config[group].map((item) => ({ ...item, draftKey: crypto.randomUUID() }));
  });
  return config;
};
const templates = {
  powerTypes: {
    id: '',
    label: '',
    subtitle: '',
    badge: '',
    badgeColor: 'brand',
    icon: 'Eye',
    iconBgColor: 'brand',
    price: 0,
    requiresPrescription: true,
    autoAdvance: true,
    isActive: true,
  },
  packageCategories: { id: '', label: '', isActive: true },
  packages: {
    id: '',
    name: '',
    description: '',
    features: [],
    price: 0,
    badge: '',
    categories: [],
    powerTypes: [],
    imageUrl: '',
    isRecommended: false,
    isActive: true,
  },
  prescriptionFields: {
    key: '',
    label: '',
    min: -20,
    max: 20,
    step: 0.25,
    scope: 'per-eye',
    required: false,
    isActive: true,
    powerTypes: [],
    fieldType: 'dropdown',
    placeholder: '',
    helpText: '',
  },
};
const titles = ['Power types', 'Lens package categories', 'Lens packages', 'Prescription fields'];

export default function AdminFrameLensesPage() {
  const { data, isLoading, isError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [configuration, setConfiguration] = useState(() => clone());
  const [dirty, setDirty] = useState(false);
  const toast = useToast();
  useEffect(() => {
    if (data && !dirty) setConfiguration(clone(data.frameLensConfiguration));
  }, [data, dirty]);
  const change = (fn) => {
    setDirty(true);
    setConfiguration(fn);
  };
  const update = (group, index, field, value) =>
    change((current) => {
      const next = {
        ...current,
        [group]: current[group].map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      };
      if (field === 'id' && (group === 'powerTypes' || group === 'packageCategories')) {
        const old = current[group][index].id,
          ref = group === 'powerTypes' ? 'powerTypes' : 'categories';
        for (const target of group === 'powerTypes'
          ? ['packages', 'prescriptionFields']
          : ['packages'])
          next[target] = next[target].map((item) => ({
            ...item,
            [ref]: (item[ref] || []).map((id) => (id === old ? value : id)),
          }));
      }
      return next;
    });
  const remove = (group, index) =>
    change((current) => {
      const old = current[group][index].id;
      const next = { ...current, [group]: current[group].filter((_, i) => i !== index) };
      if (group === 'powerTypes' || group === 'packageCategories') {
        const ref = group === 'powerTypes' ? 'powerTypes' : 'categories';
        for (const target of group === 'powerTypes'
          ? ['packages', 'prescriptionFields']
          : ['packages'])
          next[target] = next[target].map((item) => ({
            ...item,
            [ref]: (item[ref] || []).filter((id) => id !== old),
          }));
      }
      return next;
    });
  const add = (group) =>
    change((current) => ({
      ...current,
      [group]: [
        ...current[group],
        { ...templates[group], order: current[group].length, draftKey: crypto.randomUUID() },
      ],
    }));
  const general = (field, value) =>
    change((current) => ({
      ...current,
      generalSettings: { ...current.generalSettings, [field]: value },
    }));
  const save = async (event) => {
    event.preventDefault();
    const clean = { ...configuration };
    groups.forEach((group) => {
      clean[group] = configuration[group].map(({ draftKey: _key, ...item }) => item);
    });
    try {
      await updateSettings({ frameLensConfiguration: clean }).unwrap();
      setDirty(false);
      toast.success('Frame lens configuration saved');
    } catch (error) {
      toast.error(
        error.data?.message ||
          error.message ||
          'Unable to save configuration. Check unique IDs and field limits.'
      );
    }
  };
  const field = (group, item, index, name, label, type = 'text', options) => {
    const props = {
      label,
      value: item[name] ?? '',
      onChange: (e) =>
        update(group, index, name, type === 'number' ? Number(e.target.value) : e.target.value),
    };
    return options ? (
      <Select key={name} {...props} options={options.map((value) => ({ value, label: value }))} />
    ) : (
      <Input
        key={name}
        {...props}
        type={type}
        step={type === 'number' ? 'any' : undefined}
        required={['id', 'key', 'label', 'name'].includes(name)}
      />
    );
  };
  const check = (group, item, index, name, label) => (
    <Checkbox
      key={name}
      label={label}
      checked={item[name] ?? (name === 'isActive' || name === 'autoAdvance')}
      onChange={(e) => update(group, index, name, e.target.checked)}
    />
  );
  const choices = (group, item, index, name, options, label) => (
    <fieldset className="rounded-xl border border-navy-100 p-3">
      <legend className="text-sm font-semibold">{label}</legend>
      <p className="mb-2 text-xs text-navy-500">No selections means all.</p>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <Checkbox
            key={option.draftKey}
            label={option.label || option.id || 'Untitled'}
            checked={(item[name] || []).includes(option.id)}
            onChange={(e) =>
              update(
                group,
                index,
                name,
                e.target.checked
                  ? [...(item[name] || []), option.id]
                  : (item[name] || []).filter((id) => id !== option.id)
              )
            }
          />
        ))}
      </div>
    </fieldset>
  );
  if (isLoading) return <p>Loading lens configuration…</p>;
  if (isError) return <p role="alert">Unable to load lens settings. Reload before editing.</p>;
  return (
    <div>
      <h1 className="text-h3 text-navy-900">Lens for frames</h1>
      <p className="mb-6 mt-2 text-sm text-navy-500">
        Configure the complete Select Lenses experience. Existing saved prices are preserved. Empty
        compatibility selections apply to all power types.
      </p>
      <form onSubmit={save} className="space-y-6">
        {groups.map((group, g) => (
          <Card key={group}>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {g + 1}. {titles[g]}
                </h2>
                <Button type="button" variant="outline" onClick={() => add(group)}>
                  Add{' '}
                  {group === 'powerTypes'
                    ? 'power type'
                    : group === 'packageCategories'
                      ? 'category'
                      : group === 'packages'
                        ? 'lens package'
                        : 'field'}
                </Button>
              </div>
              {configuration[group].map((item, index) => (
                <div
                  key={item.draftKey}
                  className="space-y-4 rounded-xl border border-navy-200 p-4"
                >
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{item.label || item.name || 'New item'}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remove(group, index)}
                      aria-label={'Remove ' + (item.label || item.name || 'item')}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {field(
                      group,
                      item,
                      index,
                      group === 'prescriptionFields' ? 'key' : 'id',
                      group === 'prescriptionFields' ? 'Key' : 'ID'
                    )}
                    {field(
                      group,
                      item,
                      index,
                      group === 'packages' ? 'name' : 'label',
                      'Customer label'
                    )}
                    {group !== 'prescriptionFields' &&
                      field(group, item, index, 'order', 'Display order', 'number')}
                    {group === 'powerTypes' && (
                      <>
                        {field(group, item, index, 'subtitle', 'Subtitle')}
                        {field(group, item, index, 'badge', 'Badge text')}
                        {field(group, item, index, 'badgeColor', 'Badge color', 'text', [
                          'brand',
                          'navy',
                          'success',
                          'error',
                          'warning',
                          'accent',
                        ])}
                        {field(group, item, index, 'icon', 'Icon', 'text', [
                          'Eye',
                          'Monitor',
                          'Layers',
                          'Square',
                          'Sun',
                          'Shield',
                        ])}
                        {field(group, item, index, 'iconBgColor', 'Icon background', 'text', [
                          'brand',
                          'purple',
                          'blue',
                          'grey',
                          'navy',
                        ])}
                        {field(group, item, index, 'price', 'Additional price (₹)', 'number')}
                      </>
                    )}
                    {group === 'packages' && (
                      <>
                        {field(group, item, index, 'price', 'Price (₹)', 'number')}
                        {field(group, item, index, 'badge', 'Badge text')}
                        {field(group, item, index, 'imageUrl', 'Image URL')}
                      </>
                    )}
                    {group === 'prescriptionFields' && (
                      <>
                        {field(group, item, index, 'fieldType', 'Field type', 'text', [
                          'dropdown',
                          'number',
                          'text',
                        ])}
                        {field(group, item, index, 'scope', 'Scope', 'text', ['per-eye', 'shared'])}
                        {field(group, item, index, 'min', 'Minimum', 'number')}
                        {field(group, item, index, 'max', 'Maximum', 'number')}
                        {field(group, item, index, 'step', 'Increment', 'number')}
                        {field(group, item, index, 'placeholder', 'Placeholder')}
                        {field(group, item, index, 'helpText', 'Help text')}
                      </>
                    )}
                  </div>
                  {group === 'packages' && (
                    <>
                      <Textarea
                        label="Description"
                        value={item.description || ''}
                        onChange={(e) => update(group, index, 'description', e.target.value)}
                      />
                      <fieldset className="space-y-2">
                        <legend className="text-sm font-semibold">Features</legend>
                        {(item.features || []).map((feature, i) => (
                          <div key={i} className="flex gap-2">
                            <Input
                              aria-label={'Feature ' + (i + 1)}
                              value={feature}
                              required
                              onChange={(e) =>
                                update(
                                  group,
                                  index,
                                  'features',
                                  item.features.map((f, j) => (j === i ? e.target.value : f))
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              aria-label={'Remove feature ' + (i + 1)}
                              onClick={() =>
                                update(
                                  group,
                                  index,
                                  'features',
                                  item.features.filter((_, j) => i !== j)
                                )
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
                            update(group, index, 'features', [...(item.features || []), ''])
                          }
                        >
                          Add feature
                        </Button>
                      </fieldset>
                      {choices(
                        group,
                        item,
                        index,
                        'categories',
                        configuration.packageCategories,
                        'Categories'
                      )}
                    </>
                  )}
                  {(group === 'packages' || group === 'prescriptionFields') &&
                    choices(
                      group,
                      item,
                      index,
                      'powerTypes',
                      configuration.powerTypes,
                      'Compatible power types'
                    )}
                  <div className="flex flex-wrap gap-4">
                    {check(group, item, index, 'isActive', 'Active')}
                    {group === 'powerTypes' && (
                      <>
                        {check(group, item, index, 'requiresPrescription', 'Requires prescription')}
                        {check(group, item, index, 'autoAdvance', 'Auto-advance')}
                      </>
                    )}
                    {group === 'packages' &&
                      check(group, item, index, 'isRecommended', 'Recommended')}
                    {group === 'prescriptionFields' &&
                      check(group, item, index, 'required', 'Required')}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        ))}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-lg font-semibold">5. General lens flow settings</h2>
            <details className="rounded-xl border border-navy-200 p-4">
              <summary className="cursor-pointer font-semibold">Drawer interface text</summary>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Object.entries(configuration.generalSettings.uiText).map(([name, value]) => (
                  <Input
                    key={name}
                    label={name.replace(/([A-Z])/g, ' $1')}
                    value={value}
                    required
                    maxLength={180}
                    onChange={(e) =>
                      general('uiText', {
                        ...configuration.generalSettings.uiText,
                        [name]: e.target.value,
                      })
                    }
                  />
                ))}
              </div>
            </details>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['drawerTitle', 'Drawer title'],
                ['learnMoreUrl', 'Learn more URL'],
                ['ctaText', 'Final button text'],
                ['noPrescriptionMessage', 'No-prescription message'],
              ].map(([name, label]) => (
                <Input
                  key={name}
                  label={label}
                  value={configuration.generalSettings[name]}
                  required={name !== 'learnMoreUrl'}
                  onChange={(e) => general(name, e.target.value)}
                />
              ))}
              {configuration.generalSettings.stepLabels.map((label, i) => (
                <Input
                  key={i}
                  label={'Step ' + (i + 1) + ' label'}
                  required
                  value={label}
                  onChange={(e) =>
                    general(
                      'stepLabels',
                      configuration.generalSettings.stepLabels.map((x, j) =>
                        i === j ? e.target.value : x
                      )
                    )
                  }
                />
              ))}
            </div>
            <Checkbox
              label="Show running total"
              checked={configuration.generalSettings.showRunningTotal}
              onChange={(e) => general('showRunningTotal', e.target.checked)}
            />
            <Checkbox
              label="Auto-advance on power type selection"
              checked={configuration.generalSettings.autoAdvance}
              onChange={(e) => general('autoAdvance', e.target.checked)}
            />
          </CardBody>
        </Card>
        <Button type="submit" loading={isSaving}>
          Save lens configuration
        </Button>
      </form>
    </div>
  );
}
