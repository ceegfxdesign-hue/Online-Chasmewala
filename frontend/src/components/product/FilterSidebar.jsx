import { FiX } from 'react-icons/fi';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { PriceSlider } from '@/components/ui/PriceSlider';
import { Button } from '@/components/ui/Button';
import {
  GENDER_OPTIONS,
  FRAME_SHAPE_OPTIONS,
  FRAME_TYPE_OPTIONS,
  FRAME_MATERIAL_OPTIONS,
  LENS_TYPE_OPTIONS,
  FACE_SHAPE_OPTIONS,
  FEATURE_TOGGLES,
  PRICE_BOUNDS,
} from '@/constants/filters';
import { titleCase } from '@/lib/format';

function Section({ title, children }) {
  return (
    <div className="border-b border-navy-100 py-5">
      <h3 className="mb-3 text-sm font-semibold text-navy-900">{title}</h3>
      {children}
    </div>
  );
}

function MultiGroup({ options, selected, onToggle, counts }) {
  const countMap = counts ? Object.fromEntries(counts.map((c) => [c.value, c.count])) : null;
  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <div key={opt.value} className="flex items-center justify-between">
          <Checkbox
            label={titleCase(opt.label)}
            checked={selected.includes(opt.value)}
            onChange={() => onToggle(opt.value)}
          />
          {countMap && <span className="text-xs text-navy-300">{countMap[opt.value] ?? 0}</span>}
        </div>
      ))}
    </div>
  );
}

/**
 * Catalog filter panel. Fully controlled: reads the current `filters` object and
 * emits changes through the provided handlers (which sync to the URL).
 */
export function FilterSidebar({
  filters,
  facets,
  onToggleMulti,
  onSet,
  onPrice,
  onClear,
  onCloseMobile,
  activeCount,
}) {
  const multi = (key) => (filters[key] ? filters[key].split(',') : []);
  const price = [Number(filters.minPrice) || PRICE_BOUNDS.min, Number(filters.maxPrice) || PRICE_BOUNDS.max];

  return (
    <div>
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-h4">Filters</h2>
        <button type="button" onClick={onCloseMobile} aria-label="Close filters" className="rounded-full p-2 hover:bg-navy-100">
          <FiX />
        </button>
      </div>

      <div className="hidden items-center justify-between lg:flex">
        <h2 className="text-h4 text-navy-900">Filters</h2>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Clear all
          </button>
        )}
      </div>

      <Section title="Price">
        <PriceSlider
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={PRICE_BOUNDS.step}
          value={price}
          onChange={onPrice}
        />
      </Section>

      {facets?.brands?.length > 0 && (
        <Section title="Brand">
          <MultiGroup
            options={facets.brands.map((b) => ({ value: b.value, label: b.label }))}
            selected={multi('brand')}
            onToggle={(v) => onToggleMulti('brand', v)}
            counts={facets.brands}
          />
        </Section>
      )}

      <Section title="Gender">
        <MultiGroup options={GENDER_OPTIONS} selected={multi('gender')} onToggle={(v) => onToggleMulti('gender', v)} />
      </Section>

      <Section title="Frame Shape">
        <MultiGroup
          options={FRAME_SHAPE_OPTIONS}
          selected={multi('frameShape')}
          onToggle={(v) => onToggleMulti('frameShape', v)}
          counts={facets?.frameShape}
        />
      </Section>

      <Section title="Frame Type">
        <MultiGroup
          options={FRAME_TYPE_OPTIONS}
          selected={multi('frameType')}
          onToggle={(v) => onToggleMulti('frameType', v)}
          counts={facets?.frameType}
        />
      </Section>

      <Section title="Frame Material">
        <MultiGroup
          options={FRAME_MATERIAL_OPTIONS}
          selected={multi('frameMaterial')}
          onToggle={(v) => onToggleMulti('frameMaterial', v)}
          counts={facets?.frameMaterial}
        />
      </Section>

      <Section title="Lens Type">
        <MultiGroup options={LENS_TYPE_OPTIONS} selected={multi('lensType')} onToggle={(v) => onToggleMulti('lensType', v)} />
      </Section>

      <Section title="Face Shape">
        <div className="space-y-2.5">
          {FACE_SHAPE_OPTIONS.map((opt) => (
            <Radio
              key={opt.value}
              name="faceShape"
              label={opt.label}
              checked={filters.faceShape === opt.value}
              onChange={() => onSet('faceShape', filters.faceShape === opt.value ? '' : opt.value)}
            />
          ))}
        </div>
      </Section>

      <Section title="Features">
        <div className="space-y-2.5">
          {FEATURE_TOGGLES.map((t) => (
            <Checkbox
              key={t.key}
              label={t.label}
              checked={filters[t.key] === 'true'}
              onChange={() => onSet(t.key, filters[t.key] === 'true' ? '' : 'true')}
            />
          ))}
        </div>
      </Section>

      <div className="pt-5 lg:hidden">
        <Button fullWidth onClick={onCloseMobile}>
          Show results
        </Button>
      </div>
    </div>
  );
}

export default FilterSidebar;
