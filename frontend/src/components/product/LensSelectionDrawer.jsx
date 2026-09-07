import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiEye,
  FiMonitor,
  FiLayers,
  FiSquare,
  FiSun,
  FiShield,
  FiSliders,
  FiUpload,
} from 'react-icons/fi';
import { Button, Drawer, Input, Select, Modal } from '@/components/ui';
import { normalizeFrameLenses, activeSorted, appliesTo, powerChoices } from '@/lib/frameLenses';
import { easePremium } from '@/lib/motion';
import { formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';
import { useToast } from '@/contexts/ToastContext';
import { LensPackageCard, PowerLensIllustration } from './LensPackageCard';
import { LensPackageDetails } from './LensPackageDetails';
const icons = {
  Eye: FiEye,
  Monitor: FiMonitor,
  Layers: FiLayers,
  Square: FiSquare,
  Sun: FiSun,
  Shield: FiShield,
};
const backgrounds = {
  brand: 'bg-brand-100 text-brand-700',
  purple: 'bg-purple-100 text-purple-700',
  blue: 'bg-blue-100 text-blue-700',
  grey: 'bg-navy-100 text-navy-500',
  navy: 'bg-navy-800 text-white',
};
const badges = {
  brand: 'bg-brand-100 text-brand-700',
  navy: 'bg-navy-100 text-navy-800',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-orange-100 text-orange-700',
  accent: 'bg-purple-100 text-purple-700',
};
const card = (selected) =>
  cn(
    'w-full rounded-2xl border p-4 text-left shadow-soft transition-all duration-200',
    selected
      ? 'border-brand-500 bg-brand-50'
      : 'border-navy-100 bg-surface hover:border-brand-400 hover:shadow-md'
  );
/** Configurable frame lens wizard, preserving the existing completion contract. */
export function LensSelectionDrawer({
  open,
  onClose,
  configuration,
  framePrice = 0,
  frameMrp,
  availableLensPackages,
  selectedOption,
  selectedPrescription,
  onComplete,
}) {
  const config = useMemo(() => normalizeFrameLenses(configuration), [configuration]);
  const copy = config.generalSettings.uiText;
  const general = config.generalSettings,
    modes = activeSorted(config.powerTypes),
    categories = activeSorted(config.packageCategories);
  const [step, setStep] = useState(0),
    [direction, setDirection] = useState(1),
    [modeId, setModeId] = useState(''),
    [packageId, setPackageId] = useState(''),
    [category, setCategory] = useState('');
  const [method, setMethod] = useState('manual'),
    [values, setValues] = useState({}),
    [file, setFile] = useState(null),
    [details, setDetails] = useState(null);
  const reduced = useReducedMotion(),
    toast = useToast();
  const mode = modes.find((x) => x.id === modeId),
    frameOnly = mode?.id === 'frame-only';
  const packages = activeSorted(config.packages).filter(
    (x) =>
      appliesTo(x, modeId) &&
      (!availableLensPackages?.length || availableLensPackages.includes(x.id))
  );
  const pack = frameOnly ? undefined : packages.find((x) => x.id === packageId);
  const visible = packages.filter(
    (p) =>
      category === 'all' ||
      !categories.length ||
      !p.categories?.length ||
      p.categories.includes(category)
  );
  const fields = config.prescriptionFields.filter(
    (x) => x.isActive !== false && appliesTo(x, modeId)
  );
  const needsPrescription = Boolean(mode?.requiresPrescription) && !frameOnly;
  const lensPrice = Number(mode?.price || 0) + Number(pack?.price || 0);
  const go = (next) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setModeId(selectedOption?.baseType || '');
    setPackageId(selectedOption?.packageId || '');
    setCategory(activeSorted(config.packageCategories)[0]?.id || '');
    setMethod(selectedPrescription?.method === 'upload' ? 'upload' : 'manual');
    setValues(selectedPrescription?.values || {});
    setFile(selectedPrescription?.fileName ? selectedPrescription : null);
    setDetails(null);
  }, [open, config, selectedOption, selectedPrescription]);
  const chooseMode = (item) => {
    setModeId(item.id);
    if (item.id !== modeId) setPackageId('');
    setDetails(null);
    go(item.id === 'frame-only' ? 2 : 1);
  };
  const upload = (f) => {
    if (!f) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'].includes(f.type) ||
      f.size > 2 * 1024 * 1024
    ) {
      toast.error('Choose a JPG, PNG, WebP, GIF or PDF up to 2 MB.');
      return;
    }
    setFile(null);
    const reader = new FileReader();
    reader.onerror = () => toast.error('Could not read that prescription.');
    reader.onload = () =>
      setFile({ fileName: f.name, fileData: String(reader.result), mimeType: f.type });
    reader.readAsDataURL(f);
  };
  const fieldKey = (f, eye) => (eye ? eye + ':' + f.key : f.key);
  const validField = (f, value) => {
    if (value == null || value === '') return !f.required;
    if (f.fieldType === 'text') return String(value).length <= 180;
    const n = Number(value);
    return (
      Number.isFinite(n) &&
      n >= f.min &&
      n <= f.max &&
      Math.abs((n - f.min) / f.step - Math.round((n - f.min) / f.step)) < 1e-6
    );
  };
  const manualValid =
    fields.some((f) =>
      (f.scope === 'shared' ? [''] : ['rightEye', 'leftEye']).some(
        (eye) => String(values[fieldKey(f, eye)] ?? '').trim() !== ''
      )
    ) &&
    fields.every((f) =>
      (f.scope === 'shared' ? [''] : ['rightEye', 'leftEye']).every((eye) =>
        validField(f, values[fieldKey(f, eye)])
      )
    );
  const ready =
    Boolean(mode) &&
    (frameOnly || Boolean(pack)) &&
    (!needsPrescription || (method === 'manual' ? manualValid : Boolean(file?.fileData)));
  const finish = () => {
    if (!ready) return;
    const clean = {};
    fields.forEach((f) =>
      (f.scope === 'shared' ? [''] : ['rightEye', 'leftEye']).forEach((eye) => {
        const key = fieldKey(f, eye);
        if (values[key] != null && values[key] !== '') clean[key] = String(values[key]);
      })
    );
    const prescription = !needsPrescription
      ? undefined
      : method === 'upload'
        ? { method, ...file }
        : {
            method,
            values: clean,
            rightEye: Object.fromEntries(
              fields
                .filter((f) => f.scope !== 'shared')
                .map((f) => [f.key, clean['rightEye:' + f.key] || ''])
            ),
            leftEye: Object.fromEntries(
              fields
                .filter((f) => f.scope !== 'shared')
                .map((f) => [f.key, clean['leftEye:' + f.key] || ''])
            ),
            pd: clean.pd || '',
          };
    onComplete({
      lensOption: {
        type: pack ? mode.id + ':' + pack.id : mode.id,
        baseType: mode.id,
        label: [mode.label, pack?.name].filter(Boolean).join(' · '),
        subtitle: pack?.description || mode.subtitle || '',
        price: lensPrice,
        packageId: pack?.id,
      },
      prescription,
    });
    onClose();
  };
  const renderField = (f, eye) => {
    const key = fieldKey(f, eye),
      props = {
        label: f.label,
        value: values[key] ?? '',
        required: f.required,
        helper: f.helpText,
        onChange: (e) => setValues((v) => ({ ...v, [key]: e.target.value })),
      };
    return (
      <div key={key}>
        {f.fieldType === 'text' || f.fieldType === 'number' ? (
          <Input
            {...props}
            type={f.fieldType}
            min={f.min}
            max={f.max}
            step={f.step}
            maxLength={180}
            placeholder={f.placeholder}
          />
        ) : (
          <Select
            {...props}
            options={[
              { value: '', label: f.placeholder || 'Select ' + f.label },
              ...powerChoices(f),
            ]}
          />
        )}
      </div>
    );
  };
  const footer = (
    <div className="space-y-3">
      {general.showRunningTotal && (
        <div aria-live="polite" className="text-sm text-navy-500">
          {step === 2 && (
            <p>
              {copy.frame} {formatPrice(framePrice)} + {copy.lens} {formatPrice(lensPrice)}
            </p>
          )}
          <p className="text-lg font-bold text-navy-900">
            {copy.total}: {formatPrice(Number(framePrice) + lensPrice)}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button
            variant="ghost"
            onClick={() => go(frameOnly ? 0 : step - 1)}
            leftIcon={<FiArrowLeft />}
          >
            {copy.back}
          </Button>
        ) : (
          <span />
        )}
        {step === 2 ? (
          <Button size="lg" disabled={!ready} onClick={finish}>
            {general.ctaText}
          </Button>
        ) : (
          <Button
            disabled={step === 0 ? !mode : !pack}
            onClick={() => go(frameOnly ? 2 : step + 1)}
          >
            {copy.continue}
          </Button>
        )}
      </div>
    </div>
  );
  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={
          step === 0 ? general.drawerTitle : step === 1 ? 'Choose Lens Package' : 'Add Eye Power'
        }
        width="max-w-2xl"
        className="[&>div:first-child]:justify-center [&>div:first-child>button]:absolute [&>div:first-child>button]:right-5"
        footer={step === 2 ? footer : undefined}
      >
        <div className="overflow-hidden p-5 sm:p-6">
          {step > 0 && (
            <button
              aria-label="Back to previous step"
              onClick={() => go(frameOnly ? 0 : step - 1)}
              className="absolute left-4 top-4 z-10 rounded-full p-2 text-navy-700 hover:bg-navy-50"
            >
              <FiArrowLeft />
            </button>
          )}
          <ol className="mb-6 grid grid-cols-3 border-b border-navy-100">
            {general.stepLabels.map((label, i) => (
              <li
                key={i}
                aria-current={step === i ? 'step' : undefined}
                className={cn(
                  'relative pb-4 text-center text-xs font-semibold',
                  i === step ? 'text-brand-700' : 'text-navy-400'
                )}
              >
                <span
                  className={cn(
                    'mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full',
                    i < step
                      ? 'bg-success text-white'
                      : i === step
                        ? 'bg-[#000042] text-white'
                        : 'bg-navy-100 text-navy-400'
                  )}
                >
                  {i < step ? <FiCheck /> : i + 1}
                </span>
                {label}
                {i === step && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-500" />}
              </li>
            ))}
          </ol>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.section
              key={step}
              custom={direction}
              variants={{
                initial: (d) => ({ opacity: 0, x: reduced ? 0 : d * 24 }),
                enter: { opacity: 1, x: 0 },
                exit: (d) => ({ opacity: 0, x: reduced ? 0 : -d * 24 }),
              }}
              initial="initial"
              animate="enter"
              exit="exit"
              transition={{ duration: reduced ? 0 : 0.2, ease: easePremium }}
            >
              {step === 0 && (
                <>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-navy-900">{copy.powerTitle}</h3>
                    <button
                      type="button"
                      onClick={() => setDetails({ learn: true })}
                      className="text-sm font-semibold text-brand-600"
                    >
                      Learn more ▶
                    </button>
                  </div>
                  <div className="space-y-3">
                    {modes.map((item) => {
                      const Icon = icons[item.icon] || FiEye;
                      return (
                        <button
                          key={item.id}
                          aria-pressed={modeId === item.id}
                          onClick={() => chooseMode(item)}
                          className={cn(card(modeId === item.id), 'flex items-center gap-4')}
                        >
                          <span
                            className={cn(
                              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                              backgrounds[item.iconBgColor] || backgrounds.brand
                            )}
                          >
                            {['Eye', 'Monitor', 'Layers', 'Square'].includes(item.icon) ? (
                              <PowerLensIllustration kind={item.icon} />
                            ) : (
                              <Icon className="h-6 w-6" />
                            )}
                          </span>
                          <span className="flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-navy-900">{item.label}</span>
                              {item.badge && (
                                <span
                                  className={cn(
                                    'rounded-full px-2 py-0.5 text-xs font-medium',
                                    badges[item.badgeColor] || badges.brand
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block text-sm text-navy-500">
                              {item.subtitle}
                            </span>
                          </span>
                          <FiChevronRight className="text-navy-300" />
                        </button>
                      );
                    })}
                    {!modes.length && <p>{copy.emptyPower}</p>}
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <h3 className="mb-4 text-lg font-bold text-navy-900">{copy.lensesTitle}</h3>
                  <div
                    role="group"
                    aria-label="Lens categories"
                    className="mb-5 flex gap-2 overflow-x-auto pb-2"
                  >
                    {[
                      ...categories.filter((c) => c.id !== 'all'),
                      { id: 'all', label: '⚪ All' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        aria-pressed={category === c.id}
                        onClick={() => setCategory(c.id)}
                        className={cn(
                          'shrink-0 rounded-full border px-3 py-2 text-xs font-semibold',
                          category === c.id
                            ? 'border-navy-900 bg-navy-900 text-white'
                            : 'border-navy-200 text-navy-700'
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {visible.map((p) => (
                      <LensPackageCard
                        key={p.id}
                        pack={p}
                        framePrice={framePrice}
                        frameMrp={frameMrp}
                        powerPrice={mode?.price || 0}
                        selected={packageId === p.id}
                        onSelect={() => {
                          setPackageId(p.id);
                          go(2);
                        }}
                        onDetails={() => setDetails({ pack: p })}
                        onPlay={() => setDetails({ pack: p, play: true })}
                      />
                    ))}
                  </div>
                  {!visible.length && (
                    <p className="py-8 text-center text-sm text-navy-500">{copy.emptyPackages}</p>
                  )}
                </>
              )}
              {step === 2 &&
                (!needsPrescription ? (
                  <div className="rounded-2xl bg-brand-50 p-6 text-center">
                    <FiCheck className="mx-auto mb-4 h-10 w-10 text-success" />
                    <h3 className="text-lg font-bold text-navy-900">{copy.ready}</h3>
                    <p className="mt-2 text-sm text-navy-500">{general.noPrescriptionMessage}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      {
                        id: 'manual',
                        title: copy.manualTitle,
                        subtitle: copy.manualSubtitle,
                        Icon: FiSliders,
                      },
                      {
                        id: 'upload',
                        title: copy.uploadTitle,
                        subtitle: copy.uploadSubtitle,
                        Icon: FiUpload,
                      },
                    ].map(({ id, title, subtitle, Icon }) => (
                      <div key={id} className={card(method === id)}>
                        <button
                          aria-pressed={method === id}
                          onClick={() => setMethod(id)}
                          className="flex w-full items-center gap-3 text-left"
                        >
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                            <Icon className="h-6 w-6" />
                          </span>
                          <span>
                            <span className="block font-semibold text-navy-900">{title}</span>
                            <span className="block text-sm text-navy-500">{subtitle}</span>
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {method === id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              {id === 'manual' ? (
                                <div className="mt-5 space-y-4">
                                  {['rightEye', 'leftEye'].map((eye, i) => (
                                    <fieldset key={eye}>
                                      <legend className="mb-3 w-full rounded-lg bg-navy-50 p-2 text-sm font-semibold text-navy-800">
                                        {i === 0 ? copy.rightEye : copy.leftEye}
                                      </legend>
                                      <div className="grid gap-3 sm:grid-cols-3">
                                        {fields
                                          .filter((f) => f.scope !== 'shared')
                                          .map((f) => renderField(f, eye))}
                                      </div>
                                    </fieldset>
                                  ))}
                                  <div className="grid gap-3 sm:grid-cols-3">
                                    {fields
                                      .filter((f) => f.scope === 'shared')
                                      .map((f) => renderField(f, ''))}
                                  </div>
                                  {!manualValid && (
                                    <p role="status" className="text-sm text-navy-500">
                                      {copy.requiredMessage}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    upload(e.dataTransfer.files[0]);
                                  }}
                                  className="mt-5 rounded-xl border-2 border-dashed border-brand-200 p-5"
                                >
                                  <label className="block text-sm text-brand-700">
                                    {copy.chooseFile}
                                    <input
                                      aria-label="Upload prescription file"
                                      type="file"
                                      accept="image/*,.pdf"
                                      onChange={(e) => upload(e.target.files[0])}
                                      className="mt-3 block w-full text-xs"
                                    />
                                  </label>
                                  <p className="mt-2 text-xs text-navy-500">
                                    {file?.fileName || copy.dropFile}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                ))}
            </motion.section>
          </AnimatePresence>
        </div>
      </Drawer>
      <Modal
        open={Boolean(details?.learn)}
        onClose={() => setDetails(null)}
        title={details?.learn ? 'About power types' : details?.pack?.name}
      >
        {details?.learn ? (
          <div className="space-y-4">
            {modes.map((item) => (
              <section key={item.id}>
                <h3 className="font-semibold text-navy-900">{item.label}</h3>
                <p className="text-sm text-navy-500">{item.subtitle}</p>
              </section>
            ))}
          </div>
        ) : null}
      </Modal>
      {details?.pack && (
        <LensPackageDetails
          key={details.pack.id}
          pack={details.pack}
          framePrice={framePrice}
          frameMrp={frameMrp}
          powerPrice={mode?.price || 0}
          onClose={() => setDetails(null)}
          onSelect={() => {
            setPackageId(details.pack.id);
            setDetails(null);
            go(2);
          }}
        />
      )}
    </>
  );
}
